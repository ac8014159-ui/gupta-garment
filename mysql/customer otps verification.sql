USE gupta_garments;

CREATE TABLE customer_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    otp_type ENUM('mobile', 'email') NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    otp_expires_at DATETIME NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer_otp
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE
);