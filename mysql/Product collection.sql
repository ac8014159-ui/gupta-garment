USE gupta_garments;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    season VARCHAR(100) DEFAULT 'summer winter',
    price DECIMAL(10,2) NOT NULL,
    sizes VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    image_url TEXT DEFAULT NULL,
    stock_status VARCHAR(50) DEFAULT 'in-stock',
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO products
(product_name, category, gender, season, price, sizes)
VALUES
('Kids Denim Jeans', 'jeans', 'boys', 'summer winter', 599.00, '22, 24, 26, 28, 30');