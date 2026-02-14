import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()


def get_db_connection(db_url: str = None):
    """
    Establishes a connection to the PostgreSQL database.
    If `db_url` is provided it will be used, otherwise the `DATABASE_URL` env var is used.
    """
    try:
        url = db_url or os.getenv("DATABASE_URL")
        conn = psycopg2.connect(url)
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None


def execute_query(query: str, db_url: str = None):
    """
    Executes a read-only query and returns results.
    If `db_url` is provided the query runs against that database.
    """
    conn = get_db_connection(db_url)
    if not conn:
        return "Error: Database disconnected."

    try:
        cur = conn.cursor()
        cur.execute(query)

        # Fetch column names
        colnames = [desc[0] for desc in cur.description] if cur.description else []
        # Fetch data
        rows = cur.fetchall() if cur.description else []

        # Format as a list of dicts (JSON-like)
        results = [dict(zip(colnames, row)) for row in rows]

        cur.close()
        conn.close()
        return str(results)

    except Exception as e:
        return f"Database Error: {str(e)}"
