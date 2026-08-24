from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional

# from enums import ModelType  # You already have this probably
class ModelName(str, Enum):
    GPT4_O = "gpt-4o"
    GPT4_O_MINI = "gpt-4o-mini"

class QueryInputWithImage(BaseModel):
    session_id: Optional[str] = None
    question: str
    model: ModelName = Field(default=ModelName.GPT4_O_MINI)
    image: Optional[str] = None  # Base64 screenshot optional

class QueryResponseWithVision(BaseModel):
    answer: str
    session_id: str
    model: ModelName = Field(default=ModelName.GPT4_O_MINI)
    caption: Optional[str] = None  # AI generated caption
    # extracted_text: Optional[str] = None  # OCR extracted text



class QueryInput(BaseModel):
    question: str
    session_id: str = Field(default=None)
    model: ModelName = Field(default=ModelName.GPT4_O_MINI)
    image: Optional[str] = None

class QueryResponse(BaseModel):
    answer: str
    session_id: str
    model: ModelName

class DocumentInfo(BaseModel):
    id: int
    filename: str
    upload_timestamp: datetime

class DeleteFileRequest(BaseModel):
    file_id: int