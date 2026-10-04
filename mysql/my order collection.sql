-- =====================================================
-- GUPTA GARMENTS - ORDERS TABLE
-- =====================================================
USE gupta_garments;

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    customer_id INT NOT NULL,

    order_number VARCHAR(50) NOT NULL UNIQUE,

    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    order_status VARCHAR(50) NOT NULL DEFAULT 'placed',

    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',

    payment_method VARCHAR(50) DEFAULT 'cod',

    delivery_name VARCHAR(255) NOT NULL,

    delivery_mobile VARCHAR(20) NOT NULL,

    delivery_address TEXT NOT NULL,

    delivery_city VARCHAR(100) DEFAULT 'Hapur',

    delivery_pincode VARCHAR(10) DEFAULT NULL,

    order_source VARCHAR(50) DEFAULT 'website',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_orders_customer_id (customer_id),
    INDEX idx_orders_order_status (order_status),
    INDEX idx_orders_created_at (created_at),

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE
);