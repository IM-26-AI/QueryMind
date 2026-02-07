from app.services.rag import VectorService

rag = VectorService()
# Ask a vague question that requires knowing the schema
query = "who spent the most money?"

print("Searching for relevant tables...")
context = rag.get_relevant_schema(query)

print("\n=== RETRIEVED CONTEXT ===")
print(context)