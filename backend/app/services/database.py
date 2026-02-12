import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    """
    Establishes a connection to the PostgreSQL database.
    """
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

def execute_query(query: str):
    """
    Executes a Read-Only query and returns results.
    """
    conn = get_db_connection()
    if not conn:
        return "Error: Database disconnected."

    try:
        cur = conn.cursor()
        cur.execute(query)

        # Fetch column names
        colnames = [desc[0] for desc in cur.description]
        # Fetch data
        rows = cur.fetchall()

        # Format as a list of dicts (JSON-like)
        results = [dict(zip(colnames, row)) for row in rows]

        cur.close()
        conn.close()
        return str(results)

    except Exception as e:
        return f"Database Error: {str(e)}"
