from typing import TypedDict, Optional

# TypedDict ensures type safety. If you try to access a key that doesn't exist, 
# your IDE will warn you. This is crucial for "Robust" code.
class AgentState(TypedDict):
    question: str              # User's natural language query
    schema_context: str        # The relevant table info retrieved from RAG
    sql_query: Optional[str]   # The generated SQL (initially None)
    query_result: Optional[str]# The raw data from the DB
    error: Optional[str]       # Any error messages
    retry_count: int           # Counter for self-correction loops
    final_answer: Optional[str]# The narrative response
