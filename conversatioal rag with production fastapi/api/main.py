from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic_models import QueryInput, QueryResponse, DocumentInfo, DeleteFileRequest,QueryInputWithImage, QueryResponseWithVision
import base64
from langchain_utils import get_rag_chain, caption_form_image, get_rag_chain_vision
from db_utils import insert_application_logs, get_chat_history, get_all_documents, insert_document_record, delete_document_record
from chroma_utils import index_document_to_chroma, delete_doc_from_chroma
import os
import uuid
import logging
from dotenv import load_dotenv
load_dotenv()
logging.basicConfig(filename='app.log', level=logging.INFO)
app = FastAPI()


from PIL import Image
import io

@app.post("/vision-chat", response_model=QueryResponseWithVision)
def vision_chat(query_input: QueryInputWithImage):
    session_id = query_input.session_id or str(uuid.uuid4())
    question = query_input.question
    model_choice = query_input.model.value
    image_base64 = query_input.image

    extracted_caption = None

    if image_base64:
        if image_base64.startswith('data:image'):
            header, image_base64 = image_base64.split(',', 1)

        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))

        # (Optional) Save screenshot
        image.save(f"uploaded_{session_id}.png")

        # Generate only caption
        # inputs = processor(image, return_tensors="pt")
        # out = model_blip.generate(**inputs)
        # extracted_caption = processor.decode(out[0], skip_special_tokens=True)
        extracted_caption = caption_form_image(image,question)

    # RAG chain normal answering
    chat_history = get_chat_history(session_id)
    rag_chain_chain = get_rag_chain_vision(model_choice)
    answer = rag_chain_chain.invoke({
        "caption": extracted_caption,
        "input": question,
        "chat_history": chat_history
        
    })['answer']

    insert_application_logs(session_id, question, answer, model_choice)

    return QueryResponseWithVision(
        answer=answer,
        session_id=session_id,
        model=query_input.model,
        caption=extracted_caption
    )


@app.post("/chat", response_model=QueryResponse)
def chat(query_input: QueryInput):
    session_id = query_input.session_id
    logging.info(f"Session ID: {session_id}, User Query: {query_input.question}, Model: {query_input.model.value}")
    if not session_id:
        session_id = str(uuid.uuid4())

    

    chat_history = get_chat_history(session_id)
    # if query_input.image:
    #     image = query_input.image
    #     print("image received")
    rag_chain = get_rag_chain(query_input.model.value)
    answer = rag_chain.invoke({
        "input": query_input.question,
        "chat_history": chat_history
    })['answer']
    
    insert_application_logs(session_id, query_input.question, answer, query_input.model.value)
    logging.info(f"Session ID: {session_id}, AI Response: {answer}")
    return QueryResponse(answer=answer, session_id=session_id, model=query_input.model)

from fastapi import UploadFile, File, HTTPException
import os
import shutil

@app.post("/upload-doc")
def upload_and_index_document(file: UploadFile = File(...)):
    allowed_extensions = ['.pdf', '.docx', '.html']
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed types are: {', '.join(allowed_extensions)}")
    
    temp_file_path = f"temp_{file.filename}"
    
    try:
        # Save the uploaded file to a temporary file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_id = insert_document_record(file.filename)
        success = index_document_to_chroma(temp_file_path, file_id)
        
        if success:
            return {"message": f"File {file.filename} has been successfully uploaded and indexed.", "file_id": file_id}
        else:
            delete_document_record(file_id)
            raise HTTPException(status_code=500, detail=f"Failed to index {file.filename}.")
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.get("/list-docs", response_model=list[DocumentInfo])
def list_documents():
    return get_all_documents()

@app.post("/delete-doc")
def delete_document(request: DeleteFileRequest):
    # Delete from Chroma
    chroma_delete_success = delete_doc_from_chroma(request.file_id)

    if chroma_delete_success:
        # If successfully deleted from Chroma, delete from our database
        db_delete_success = delete_document_record(request.file_id)
        if db_delete_success:
            return {"message": f"Successfully deleted document with file_id {request.file_id} from the system."}
        else:
            return {"error": f"Deleted from Chroma but failed to delete document with file_id {request.file_id} from the database."}
    else:
        return {"error": f"Failed to delete document with file_id {request.file_id} from Chroma."}
