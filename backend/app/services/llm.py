import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

# Load environment variables from .env file
load_dotenv()

def get_llm():
    """
    Returns an instance of the Groq LLM (Llama 3 70B).
    Temperature is set to 0 for SQL generation to ensure consistency/determinism.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    
    return ChatGroq(
        temperature=0, 
        model_name="llama-3.3-70b-versatile",
        groq_api_key=api_key
    )
