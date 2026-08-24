from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from typing import List
from langchain_core.documents import Document
import os
from chroma_utils import vectorstore
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

output_parser = StrOutputParser()




# Set up prompts and chains
contextualize_q_system_prompt = (
    "Given a chat history and the latest user question "
    "which might reference context in the chat history, "
    "formulate a standalone question which can be understood "
    "without the chat history. Do NOT answer the question, "
    "just reformulate it if needed and otherwise return it as is."
)

contextualize_q_prompt = ChatPromptTemplate.from_messages([
    ("system", contextualize_q_system_prompt),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
])

contextualize_q_system_prompt_vision = (
    "Given a chat history , caption of image and the latest user question "
    "which might reference context in the chat history, "
    "formulate a standalone question which can be understood "
    "without the chat history and caption of image. Do NOT answer the question, "
    "just reformulate it if needed and otherwise return it as is."
)
contextualize_q_prompt_vision = ChatPromptTemplate.from_messages([
    ("system", contextualize_q_system_prompt_vision),
    ("system", "Caption: {caption}"),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
])


qa_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful AI assistant. Use the following context to answer the user's question."),
    ("system", "Context: {context}"),  
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}")
])

qa_prompt_vision = ChatPromptTemplate.from_messages([
    ("system", '''You are a helpful AI assistant. Use the following context and caption to answer the user's question.
     The caption is a description of the form image or section image where the user is having difficulty while filling the form. so use caption as image description 
     and user want answer based on the image, so use image description  to understand the user's question and answer using the context , caption '''),
    ("system", "Context: {context}"),  
    ("system", "Caption: {caption}"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}")
])

def get_rag_chain(model="gpt-4o-mini"):
    llm = ChatOpenAI(model=model)
    history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)
    question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)    
    return rag_chain


def get_rag_chain_vision(model="gpt-4o-mini"):
    llm = ChatOpenAI(model=model)
    history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt_vision)
    question_answer_chain = create_stuff_documents_chain(llm, qa_prompt_vision)
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)    
    return rag_chain


import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY is not set. Copy .env.example to .env and add your key.")
genai.configure(api_key=GOOGLE_API_KEY)

def caption_form_image(image, user_query):
    # Load the image
    # encoded_image = encode_image_to_base64(image_path)

    # Prepare the prompt
    prompt = f"""
You are a smart visual assistant specialized in form analysis.
Analyze the provided screenshot carefully and generate a caption or short description that helps understand the context of the user's query.

User's Query: "{user_query}"

Instructions:
- Focus on the specific field, label, or section where the user might be facing difficulty.
- Mention any important text labels, placeholder hints, dropdown options, or checkboxes that are visible near the user's point of confusion.
- If the field expects specific types of input (e.g., name, date, ID, selection), include that in the caption.
- Keep the description short, factual, and helpful for downstream form assistance.
- Do not make assumptions beyond what is clearly visible.

Return only a structured caption or description.
"""

    # Initialize Gemini multimodal model
    model = genai.GenerativeModel(model_name="gemini-1.5-pro")

    # Send prompt + image
    response = model.generate_content(
        [
            prompt,
            image
        ]
    )

    return response.text

# def get_vision_rag_chain(image):
#     prompt = """
#             You are a vision-based analysis model. Analyze the given screenshot image of an admission or counseling form in detail and provide a structured output. Include the following:

#             1. **Components**:
#                - Identify all text fields, buttons, labels, dropdowns, checkboxes, or other form elements.
#                - Provide their positions, labels, and purposes.

#             2. **Content Understanding**:
#                - Extract all visible text, including placeholders and prefilled data.
#                - Detect the state of form elements (e.g., dropdown options, selected/unselected checkboxes).

#             3. **Contextual Insights**:
#                - Suggest appropriate input for each field based on its label.
#                - Highlight incomplete or missing fields.
#                - Provide actionable suggestions to improve form usability.

#             4. **General Observations**:
#                - Identify images, icons, or logos and describe their relevance.
#                - Analyze the layout, design patterns, and alignment of the form.

#             Return the output in a structured JSON format:
#             {
#               "Components": [...],
#               "Content": {...},
#               "Insights": [...],
#               "GeneralObservations": [...]
#             }
#             Ensure the analysis is accurate and comprehensive, focusing on usability and functionality of the form.
#             """
#     model = genai.GenerativeModel(model_name="gemini-1.5-pro")
#     response = model.generate_content([image,prompt ])
#     extracted_text = response.text
#     return extracted_text