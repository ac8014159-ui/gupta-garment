USE gupta_garments;
-- =====================================================
-- GUPTA GARMENTS - ORDER ITEMS TABLE
-- =====================================================

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    product_id INT DEFAULT NULL,

    product_name VARCHAR(255) NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    price DECIMAL(10,2) NOT NULL,

    size VARCHAR(50) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order_items_order_id (order_id),
    INDEX idx_order_items_product_id (product_id),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
);