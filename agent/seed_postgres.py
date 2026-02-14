import psycopg2
from app.services.database import get_db_connection

# SQL to create tables
SCHEMA_SQL = """
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10, 2),
    stock_count INT
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    product_id INT REFERENCES products(id),
    quantity INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

# SQL to insert data
DATA_SQL = """
INSERT INTO users (name, email) VALUES 
('Alice Johnson', 'alice@example.com'),
('Bob Smith', 'bob@example.com'),
('Charlie Brown', 'charlie@example.com');

INSERT INTO products (name, category, price, stock_count) VALUES 
('Laptop Pro', 'Electronics', 1200.00, 15),
('Wireless Mouse', 'Electronics', 25.50, 200),
('Ergonomic Chair', 'Furniture', 350.00, 10);

INSERT INTO orders (user_id, product_id, quantity, order_date) VALUES 
(1, 1, 1, NOW() - INTERVAL '2 days'), 
(1, 2, 2, NOW() - INTERVAL '2 days'), 
(2, 3, 1, NOW() - INTERVAL '5 days');
"""

def seed_db():
    print("Connecting to PostgreSQL...")
    conn = get_db_connection()
    
    if not conn:
        print("Failed to connect. Is Docker running on port 5436?")
        return

    try:
        cur = conn.cursor()
        
        print("Creating Tables...")
        cur.execute(SCHEMA_SQL)
        
        print("Inserting Data...")
        cur.execute(DATA_SQL)
        
        conn.commit()
        cur.close()
        conn.close()
        print("✅ Success! Database seeded.")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    seed_db()