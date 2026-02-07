from app.services.database import get_db_connection
from app.services.rag import VectorService

def index_database_schema():
    print("--- Starting Schema Indexing ---")
    conn = get_db_connection()
    vector_service = VectorService()
    
    cursor = conn.cursor()
    
    # 1. Fetch all table names
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    tables = cursor.fetchall()
    
    for (table_name,) in tables:
        # 2. For each table, get its columns (DDL-like structure)
        cursor.execute(f"""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = '{table_name}'
        """)
        columns = cursor.fetchall()
        
        # Format the schema nicely
        schema_text = f"CREATE TABLE {table_name} (\n"
        for col, dtype in columns:
            schema_text += f"  {col} {dtype},\n"
        schema_text += ");"
        
        # 3. Add a "Semantic" Description
        # In a real app, you might maintain a dictionary of these descriptions manually
        description = f"Contains data about {table_name}."
        if table_name == "users":
            description = "Customer information including names and signup dates."
        elif table_name == "orders":
            description = "Transactional data linking users to products purchased."
            
        # 4. Store in Chroma
        vector_service.add_table_context(table_name, schema_text, description)
        
    print("--- Indexing Complete! Agent now knows the database. ---")

if __name__ == "__main__":
    index_database_schema()