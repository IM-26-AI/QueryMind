from app.agents.graph import build_graph

if __name__ == "__main__":
    app = build_graph()
    
    # Let's ask a question that requires calculation
    initial_state = {
        "question": "Which category of products has the highest inventory value (price * stock)?",
        "retry_count": 0
    }
    
    print("Starting Agent...")
    result = app.invoke(initial_state)
    
    print("\n\n=== FINAL INSIGHT ===")
    print(result['final_answer'])
    
    print("\n(Debug info: Raw SQL)")
    print(result['sql_query'])