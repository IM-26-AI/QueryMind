from app.services.database import execute_query

# Try to fetch the data we just seeded
print(execute_query("SELECT * FROM products"))