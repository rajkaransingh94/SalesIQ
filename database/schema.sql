-- =====================================================================
-- SalesIQ — Sales Analytics Dashboard
-- Database schema
-- Fictional/simulated sample business data — not real customer data.
-- =====================================================================

DROP DATABASE IF EXISTS sales_dashboard;
CREATE DATABASE sales_dashboard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sales_dashboard;

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
CREATE TABLE categories (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
CREATE TABLE products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  category_id INT NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  cost        DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_products_category (category_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------
CREATE TABLE customers (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(150) NOT NULL,
  email  VARCHAR(150) NOT NULL UNIQUE,
  region ENUM('North','South','East','West','Central') NOT NULL,
  INDEX idx_customers_region (region)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------
CREATE TABLE orders (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date  DATE NOT NULL,
  region      ENUM('North','South','East','West','Central') NOT NULL,
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_orders_customer (customer_id),
  INDEX idx_orders_date (order_date),
  INDEX idx_orders_region (region)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------
CREATE TABLE order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount   DECIMAL(5,2) NOT NULL DEFAULT 0,  -- percent, e.g. 10.00 = 10%
  CONSTRAINT fk_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_items_order (order_id),
  INDEX idx_items_product (product_id)
) ENGINE=InnoDB;
