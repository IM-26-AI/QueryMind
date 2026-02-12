-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10, 2),
    stock_count INT
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    product_id INT REFERENCES products(id),
    quantity INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Fake Data (So we have something to query)
INSERT INTO users (name, email) VALUES 
('Alice Johnson', 'alice@example.com'),
('Bob Smith', 'bob@example.com'),
('Charlie Brown', 'charlie@example.com');

INSERT INTO products (name, category, price, stock_count) VALUES 
('Laptop Pro', 'Electronics', 1200.00, 15),
('Wireless Mouse', 'Electronics', 25.50, 200),
('Ergonomic Chair', 'Furniture', 350.00, 10);

INSERT INTO orders (user_id, product_id, quantity, order_date) VALUES 
(1, 1, 1, NOW() - INTERVAL '2 days'), -- Alice bought a Laptop
(1, 2, 2, NOW() - INTERVAL '2 days'), -- Alice bought 2 Mice
(2, 3, 1, NOW() - INTERVAL '5 days'); -- Bob bought a Chair