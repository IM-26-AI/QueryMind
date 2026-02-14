from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes.entry_points import planner_node, generator_node, validator_node, executor_node, narrator_node

def should_retry(state: AgentState):
    error = state.get("error")
    retries = state.get("retry_count", 0)
    
    if error and retries < 3:
        return "retry"
    return "execute"

def build_graph():
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("planner", planner_node)
    workflow.add_node("generator", generator_node)
    workflow.add_node("validator", validator_node)
    workflow.add_node("executor", executor_node)
    workflow.add_node("narrator", narrator_node)

    # Define Edges
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "generator")
    workflow.add_edge("generator", "validator")

    # Conditional Logic
    workflow.add_conditional_edges(
        "validator",
        should_retry,
        {
            "retry": "generator",
            "execute": "executor"
        }
    )
    
    # Link Executor to Narrator
    workflow.add_edge("executor", "narrator")
    
    # End after Narrator
    workflow.add_edge("narrator", END)

    return workflow.compile()
