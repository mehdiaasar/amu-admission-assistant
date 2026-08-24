import os
from dotenv import load_dotenv
load_dotenv()
from langchain_core.output_parsers import StrOutputParser
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_openai import OpenAI
import streamlit as st
from deep_translator import GoogleTranslator
from langchain_core.pydantic_v1 import Field
from pydantic import BaseModel
from typing import List, Dict, Any, Tuple
from langchain.docstore.document import Document
from langchain_openai import ChatOpenAI
from langchain import PromptTemplate
from langchain_core.retrievers import BaseRetriever
from langchain.chains import RetrievalQA
translator = GoogleTranslator(source='auto', target='ur')

persist_directory='guideToAddmissinVectorheader'
# from langchain_community.embeddings import OllamaEmbeddings
# embedding = OllamaEmbeddings()
embedding = OpenAIEmbeddings()

vectordb=Chroma(persist_directory=persist_directory,
                embedding_function=embedding)

retriever=vectordb.as_retriever()

class RatingScore(BaseModel):
    relevance_score: float = Field(..., description="The relevance score of a document to a query.")

def rerank_documents(query: str, docs: List[Document], top_n: int = 3) -> List[Document]:
    prompt_template = PromptTemplate(
        input_variables=["query", "doc"],
        template="""On a scale of 1-10, rate the relevance of the following document to the query. Consider the specific context and intent of the query, not just keyword matches.
        Query: {query}
        Document: {doc}
        Relevance Score:"""
    )
    
    llm = ChatOpenAI(temperature=0, model_name="gpt-4o", max_tokens=4000)
    llm_chain = prompt_template | llm.with_structured_output(RatingScore)
    
    scored_docs = []
    for doc in docs:
        input_data = {"query": query, "doc": doc.page_content}
        score = llm_chain.invoke(input_data).relevance_score
        try:
            score = float(score)
        except ValueError:
            score = 0  # Default score if parsing fails
        scored_docs.append((doc, score))
    
    reranked_docs = sorted(scored_docs, key=lambda x: x[1], reverse=True)
    return [doc for doc, _ in reranked_docs[:top_n]]

class CustomRetriever(BaseModel , BaseRetriever):
    
    vectorstore: Any = Field(description="Vector store for initial retrieval")

    class Config:
        arbitrary_types_allowed = True

    def _get_relevant_documents(self, query: str, num_docs=2) -> List[Document]:
        initial_docs = self.vectorstore.similarity_search(query, k=30)
        return rerank_documents(query, initial_docs, top_n=num_docs)


# Create the custom retriever
custom_retriever = CustomRetriever(vectorstore=vectordb)

# Create an LLM for answering questions
llm = ChatOpenAI(temperature=0, model_name="gpt-4o")

# Create the RetrievalQA chain with the custom retriever
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=custom_retriever,
    return_source_documents=True
)

# from langchain_community.llms import Ollama

st.title("Amu Assistance")
# input_text=st.text_input('Search the topic u want (given corpus)')
# st.micr_input("一二三,茄子!")
# from st_audiorec import st_audiorec
# wav_audio_data = st_audiorec()

# if wav_audio_data is not None:
#     st.audio(wav_audio_data, format='audio/wav')

from deep_translator import GoogleTranslator
translator = GoogleTranslator(source='auto', target='ur')

# button=st.button('submit')
# button=1
# if button:
    # response=retrieval_chain.invoke({"input":input_text})
    # st.write(response["answer"])
    # pet =st.radio("choose the language",options=["hi","ur","fr"],captions = ["Hindi", "Urdu", "French"])
    # if pet:
    #     translator = GoogleTranslator(source='auto', target=pet)

    #     st.write(translator.translate(response["answer"]))

def display_chat_messages() -> None:
    """Print message history
    @returns None
    """
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            if "images" in message:
                for i in range(0, len(message["images"]), NUM_IMAGES_PER_ROW):
                    cols = st.columns(NUM_IMAGES_PER_ROW)
                    for j in range(NUM_IMAGES_PER_ROW):
                        if i + j < len(message["images"]):
                            cols[j].image(message["images"][i + j], width=200)
with st.sidebar:
    st.title("𓍝 Amu Assistance")
    st.subheader("About assistance")
    st.markdown(
        """LegalEase aims to simplify access to legal knowledge by creating a user-friendly system where individuals can ask
          legal questions and can get answer in everyday language, regardless of their level of expertise in law."""
    )
    st.header("Language")
    st.success("Choose the language of your answer", icon="💚")

st.divider()
if "messages" not in st.session_state:
    st.session_state.messages = []
    st.session_state.greetings = False

# Display chat messages from history on app rerun
display_chat_messages()

# Greet user
if not st.session_state.greetings:
    with st.chat_message("assistant"):
        intro = "Hello there! I'm Amu Assistance, your friendly assistant for navigating the legal realm with ease. Whether you're deciphering legal documents, seeking advice on rights and regulations, or exploring legal procedures, I'm here to guide you every step of the way. Let's dive into the world of law together!"
        st.markdown(intro)
        # Add assistant response to chat history
        st.session_state.messages.append({"role": "assistant", "content": intro})
        st.session_state.greetings = True

example_prompts = [
    "What are the legal implications of a hit-and-run accident?",
    "How can I claim compensation for a workplace injury?",
    "What are the legal options for resolving a property dispute with a family member?",
    "What are the legal requirements for making a will in India?",
    "How can I file a complaint against online fraud or cybercrime?",
    "What are the legal rights and procedures for adoption in India?"
]

example_prompts_help = [
    "What happens if someone hits a car and drives away without stopping?",
    "How can I get money if I get hurt while working?",
    "What can I do if there's a fight over property with someone in my family?",
    "What do I need to do legally to write down who gets my things when I'm gone in India?",
    "What should I do if someone tricks me online or does something bad to me using the internet?",
    "How can I adopt a child legally in India?"
]


button_cols = st.columns(3)
button_cols_2 = st.columns(3)

button_pressed = ""

if button_cols[0].button(example_prompts[0], help=example_prompts_help[0]):
    button_pressed = example_prompts[0]
elif button_cols[1].button(example_prompts[1], help=example_prompts_help[1]):
    button_pressed = example_prompts[1]
elif button_cols[2].button(example_prompts[2], help=example_prompts_help[2]):
    button_pressed = example_prompts[2]

elif button_cols_2[0].button(example_prompts[3], help=example_prompts_help[3]):
    button_pressed = example_prompts[3]
elif button_cols_2[1].button(example_prompts[4], help=example_prompts_help[4]):
    button_pressed = example_prompts[4]
elif button_cols_2[2].button(example_prompts[5], help=example_prompts_help[5]):
    button_pressed = example_prompts[5]


if prompt := (st.chat_input("Please type your legal question or concern here.") or button_pressed):
    # Display user message in chat message container
    with st.chat_message("user"):
        st.markdown(prompt)
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})

    prompt = prompt.replace('"', "").replace("'", "")

    if prompt != "":
        
        response1 = qa_chain.invoke({"input":prompt})
        if mode !='en':
            translator = GoogleTranslator(source='auto', target=mode)
            df=translator.translate(response1["answer"])
        else:
            df=response1["answer"]
        response=""
        

        with st.chat_message("assistant"):
            full_response=df
            message_placeholder=st.empty()
            message_placeholder.markdown(full_response + "▌")
            message_placeholder.markdown(full_response)
            response += full_response + " "
            # Create a new row of columns for every NUM_IMAGES_PER_ROW images
            
            

        st.session_state.messages.append(
            {"role": "assistant", "content": response}
        )
        # st.experimental_rerun()