import chromadb
from sentence_transformers import SentenceTransformer
import os

# We use a free, high-performance open model for embeddings
# 'all-MiniLM-L6-v2' is the industry standard for lightweight local embeddings
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chroma_db")

class VectorService:
    def __init__(self):
        # Initialize the embedding model (downloads automatically on first run)
        self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        
        # Initialize ChromaDB (Persistent means it saves to disk)
        self.client = chromadb.PersistentClient(path=DB_PATH)
        
        # Create (or get) a collection named "schema_metadata"
        self.collection = self.client.get_or_create_collection(name="schema_metadata")

    def add_table_context(self, table_name: str, ddl: str, description: str):
        """
        Stores the table definition in the vector DB.
        """
        # Create a rich text representation for the vector
        # We combine the name, DDL, and description so the AI finds it easily
        document_text = f"Table: {table_name}\nDescription: {description}\nSchema: {ddl}"
        
        # Generate the vector (embedding)
        embedding = self.embedding_model.encode(document_text).tolist()
        
        # Upsert (Update or Insert) into Chroma
        self.collection.upsert(
            documents=[document_text],
            embeddings=[embedding],
            metadatas=[{"table_name": table_name}],
            ids=[table_name]
        )
        print(f"Stored metadata for table: {table_name}")

    def get_relevant_schema(self, user_query: str, n_results: int = 3):
        """
        Finds the most relevant tables for the user's question.
        """
        query_embedding = self.embedding_model.encode(user_query).tolist()
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # Join the found documents into a single string context
        if results['documents']:
            return "\n\n".join(results['documents'][0])
        return ""
