-- Sample complex database seed for QueryMind demo (copied for docker init)
-- This file seeds demo_data database. It mirrors database/sample_complex_seed.sql

-- Drop if exists (safe to re-run)
DROP TABLE IF EXISTS returns CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;

-- Customers
CREATE TABLE customers (
  customer_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  country VARCHAR(100)
);

-- Suppliers
CREATE TABLE suppliers (
  supplier_id SERIAL PRIMARY KEY,
  supplier_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255)
);

-- Categories
CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL
);

-- Products
CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  supplier_id INTEGER REFERENCES suppliers(supplier_id),
  unit_price NUMERIC(10,2) NOT NULL,
  active BOOLEAN DEFAULT true
);

-- Many-to-many product categories
CREATE TABLE product_categories (
  product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(category_id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Inventory
CREATE TABLE inventory (
  product_id INTEGER PRIMARY KEY REFERENCES products(product_id) ON DELETE CASCADE,
  quantity_on_hand INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 10
);

-- Stores and employees (for analytics)
CREATE TABLE stores (
  store_id SERIAL PRIMARY KEY,
  store_name VARCHAR(255),
  region VARCHAR(100)
);

CREATE TABLE employees (
  employee_id SERIAL PRIMARY KEY,
  full_name VARCHAR(255),
  store_id INTEGER REFERENCES stores(store_id)
);

-- Orders
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  store_id INTEGER REFERENCES stores(store_id),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount NUMERIC(12,2) DEFAULT 0
);

-- Order items
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(product_id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);

-- Payments
CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount NUMERIC(12,2) NOT NULL,
  method VARCHAR(50)
);

-- Shipments
CREATE TABLE shipments (
  shipment_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  shipped_date TIMESTAMP,
  carrier VARCHAR(100)
);

-- Returns
CREATE TABLE returns (
  return_id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(order_item_id) ON DELETE CASCADE,
  return_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT
);

-- Reviews
CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(product_id),
  customer_id INTEGER REFERENCES customers(customer_id),
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promotions (for analytic joins)
CREATE TABLE promotions (
  promo_id SERIAL PRIMARY KEY,
  promo_name VARCHAR(255),
  discount_pct NUMERIC(5,2),
  start_date DATE,
  end_date DATE
);

-- Indexes for common queries
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);

-- Seed minimal reference data
INSERT INTO customers (email, full_name, phone, country) VALUES
('alice@example.com','Alice Johnson','+1-555-0100','USA'),
('bob@example.com','Bob Smith','+1-555-0101','USA'),
('carol@example.com','Carol Lee','+44-20-5555','UK'),
('dave@example.com','Dave Patel','+91-22-5555','India'),
('eve@example.com','Eve Zhang','+86-10-5555','China');

INSERT INTO suppliers (supplier_name, contact_email) VALUES
('Acme Co','sales@acme.example'),
('Globex Inc','contact@globex.example'),
('SupplyPlus','info@supplyplus.example');

INSERT INTO categories (category_name) VALUES
('Electronics'),('Home'),('Garden'),('Toys'),('Apparel');

INSERT INTO products (product_name, supplier_id, unit_price, active) VALUES
('USB-C Cable',1,9.99,true),
('Wireless Mouse',1,24.99,true),
('Ceramic Pot',2,34.50,true),
('Building Blocks Set',3,49.99,true),
('Running Shoes',2,79.95,true),
('Bluetooth Speaker',1,59.00,true),
('LED Desk Lamp',2,29.99,true),
('Garden Hose',3,22.50,true);

-- Map products to categories
INSERT INTO product_categories (product_id, category_id) VALUES
(1,1),(2,1),(6,1),(7,1),
(3,2),(8,3),(4,4),(5,5);

-- Inventory
INSERT INTO inventory (product_id, quantity_on_hand, reorder_level) VALUES
(1,150,20),(2,80,15),(3,40,10),(4,25,5),(5,60,10),(6,100,20),(7,50,10),(8,30,5);

-- Stores and employees
INSERT INTO stores (store_name, region) VALUES
('Downtown','North'),('Mall Outlet','South'),('Airport Kiosk','East');

INSERT INTO employees (full_name, store_id) VALUES
('Sam Manager',1),('Rita Clerk',2),('Tom Support',3);

-- Orders + items (varied dates and customers)
INSERT INTO orders (customer_id, store_id, order_date, total_amount) VALUES
(1,1,'2024-12-01 10:15:00',59.98),
(2,2,'2024-12-05 14:20:00',99.98),
(3,1,'2025-01-10 09:00:00',34.50),
(1,3,'2025-01-15 16:40:00',129.95),
(4,2,'2025-01-20 11:25:00',22.50),
(5,1,'2025-02-01 12:00:00',79.95),
(2,3,'2025-02-03 18:05:00',74.99),
(3,2,'2025-02-05 19:30:00',89.99),
(1,1,'2025-02-10 08:20:00',59.00),
(5,3,'2025-02-12 13:15:00',29.99);

-- Order items (match totals above)
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1,1,2,9.99),
(2,4,2,49.99),
(3,3,1,34.50),
(4,5,1,79.95),(4,2,2,24.99),
(5,8,1,22.50),
(6,5,1,79.95),
(7,6,1,59.00),(7,1,1,9.99),(7,2,1,24.99),
(8,4,1,49.99),(8,7,2,19.50),(9,6,1,59.00),(10,7,1,29.99);

-- Payments (some partial/overpayments for complexity)
INSERT INTO payments (order_id, payment_date, amount, method) VALUES
(1,'2024-12-01 10:17:00',59.98,'card'),
(2,'2024-12-05 14:25:00',49.99,'card'),
(2,'2024-12-05 14:26:00',49.99,'gift_card'),
(3,'2025-01-10 09:05:00',34.50,'paypal'),
(4,'2025-01-15 16:45:00',129.95,'card'),
(5,'2025-01-20 11:30:00',22.50,'card'),
(6,'2025-02-01 12:05:00',79.95,'card');

-- Shipments
INSERT INTO shipments (order_id, shipped_date, carrier) VALUES
(1,'2024-12-02','UPS'),(2,'2024-12-06','FedEx'),(4,'2025-01-16','USPS'),(6,'2025-02-02','DHL');

-- Returns (one return)
INSERT INTO returns (order_item_id, return_date, reason) VALUES
(2,'2025-02-08','Damaged on arrival');

-- Reviews
INSERT INTO reviews (product_id, customer_id, rating, comment, created_at) VALUES
(1,1,5,'Works great', '2025-01-02 10:00:00'),
(4,2,4,'Fun for kids', '2025-01-07 12:00:00'),
(5,5,3,'Sizing runs small', '2025-02-02 09:00:00');

-- Promotions
INSERT INTO promotions (promo_name, discount_pct, start_date, end_date) VALUES
('Holiday Sale',15,'2024-12-01','2024-12-31'),
('New Year Promo',10,'2025-01-01','2025-01-15');

-- Ensure totals on orders align with items (simple update for demo)
UPDATE orders o SET total_amount = (
  SELECT COALESCE(SUM(oi.quantity * oi.unit_price),0) FROM order_items oi WHERE oi.order_id = o.order_id
);

-- A few analytic-friendly views (optional)
CREATE VIEW vw_customer_order_counts AS
SELECT c.customer_id, c.email, c.full_name, COUNT(o.order_id) AS orders_count, SUM(o.total_amount) AS lifetime_value
FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.email, c.full_name;

-- End of seed
