CREATE DATABASE gupta_garments;
USE gupta_garments;
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    rating TINYINT NOT NULL,
    review_message TEXT NOT NULL,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO reviews
(product_name, customer_name, rating, review_message)
VALUES
('Kids Denim Jeans', 'Test Customer', 5, 'Very nice product and good quality.');
DELETE FROM reviews
WHERE id = 1;
