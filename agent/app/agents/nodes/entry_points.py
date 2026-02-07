from app.agents.state import AgentState
from app.services.llm import get_llm
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.rag import VectorService
import sqlglot
from sqlglot import exp
from app.services.database import execute_query

# Initialize LLM and RAG
llm = get_llm()
rag = VectorService()

def planner_node(state: AgentState):
    """
    1. Looks up relevant table schemas using RAG.
    2. Updates the state with this context.
    """
    print("--- PLANNER NODE (Retrieving Schema) ---")
    question = state['question']
    
    # RAG LOOKUP: Find relevant tables based on the user's question
    # We fetch top 3 results to ensure we cover joins (e.g., Users + Orders + Products)
    retrieved_schema = rag.get_relevant_schema(question, n_results=3)
    
    # Store this real schema in the state so the Generator can use it
    return {"schema_context": retrieved_schema}

def generator_node(state: AgentState):
    print("--- GENERATOR NODE ---")
    question = state['question']
    context = state['schema_context']
    error = state.get("error") # Check if we are coming from a failure
    
    if error:
        # REPAIR MODE: We include the error message in the prompt
        print(f"!! Retrying due to error: {error} !!")
        prompt = f"""
        You previously generated invalid SQL. 
        The error was: {error}
        
        Original Question: {question}
        Context: {context}
        
        CORRECT your query and output valid PostgreSQL only.
        """
    else:
        # STANDARD MODE
        prompt = f"Question: {question}\nContext: {context}"
    
    system_msg = SystemMessage(content="You are a SQL Expert. Output ONLY the SQL query for PostgreSQL.")
    human_msg = HumanMessage(content=prompt)
    
    response = llm.invoke([system_msg, human_msg])
    return {"sql_query": response.content}

def validator_node(state: AgentState):
    """
    Checks if the generated SQL is valid and safe.
    """
    print("--- VALIDATOR NODE ---")
    sql_query = state['sql_query']
    
    # 1. Clean the SQL (remove markdown backticks if LLM added them)
    clean_query = sql_query.replace("```sql", "").replace("```", "").strip()
    
    try:
        # 2. Parse the SQL into an Abstract Syntax Tree (AST)
        # This will fail if the syntax is broken (e.g. missing commas)
        parsed = sqlglot.parse_one(clean_query)
        
        # 3. Security Check: Ensure it's a SELECT statement
        # We use isinstance to check the AST node type
        if not isinstance(parsed, exp.Select):
            return {"error": "Security Alert: Only SELECT statements are allowed.", "retry_count": state["retry_count"] + 1}
            
        # If we get here, syntax is good and it's safe.
        # We update the state with the cleaned query and clear any old errors
        return {"sql_query": clean_query, "error": None}

    except Exception as e:
        # If sqlglot fails to parse, it's a syntax error
        print(f"Syntax Error caught: {e}")
        return {"error": f"SQL Syntax Error: {str(e)}", "retry_count": state["retry_count"] + 1}
    
def executor_node(state: AgentState):
    """
    Executes the validated SQL against the database.
    """
    print("--- EXECUTOR NODE ---")
    sql_query = state['sql_query']
    
    # Run the query
    result = execute_query(sql_query)
    
    # Save the data to the state
    return {"query_result": result}

def narrator_node(state: AgentState):
    """
    Translates the raw database results into a human-readable answer.
    """
    print("--- NARRATOR NODE ---")
    question = state['question']
    result = state['query_result']
    sql = state['sql_query']
    
    # Prompt the LLM to be a Data Analyst
    system_msg = SystemMessage(content="You are a data storyteller. Summarize the database results in a clear, concise way to answer the user's question. Do not mention SQL or technical details unless asked.")
    
    human_msg = HumanMessage(content=f"""
    User Question: {question}
    SQL Query Used: {sql}
    Raw Data Results: {result}
    
    Provide a brief summary:
    """)
    
    response = llm.invoke([system_msg, human_msg])
    
    # Update the final answer in the state
    return {"final_answer": response.content}