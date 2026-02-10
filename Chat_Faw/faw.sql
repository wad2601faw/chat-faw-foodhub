-- MakanApa? Database Schema
-- Create this database and tables to use the PHP backend

CREATE DATABASE IF NOT EXISTS makanapa;
USE makanapa;

-- Table: requests (food requests from buyers)
CREATE TABLE IF NOT EXISTS requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: offers (seller offers for requests)
CREATE TABLE IF NOT EXISTS offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    seller_name VARCHAR(100) NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    contact VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_habits (buyer preferences and history)
CREATE TABLE IF NOT EXISTS user_habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avg_price INT DEFAULT 0,
    last_food VARCHAR(255) DEFAULT '',
    cheapest_count INT DEFAULT 0,
    total_orders INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for faster queries
CREATE INDEX idx_request_id ON offers(request_id);
CREATE INDEX idx_created_at ON requests(created_at);
