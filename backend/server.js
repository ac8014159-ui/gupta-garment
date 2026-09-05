const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL connection failed:", err.message);
        return;
    }

    console.log("✅ MySQL connected successfully!");
});

app.get("/", (req, res) => {
    res.send("Gupta Garments Backend is running!");
});
// ===============================
// REVIEW API - SAVE REVIEW
// ===============================

app.post("/api/reviews", (req, res) => {

    const {
        product_name,
        customer_name,
        rating,
        review_message
    } = req.body;

    // Basic validation
    if (!product_name || !customer_name || !rating || !review_message) {
        return res.status(400).json({
            success: false,
            message: "All review fields are required."
        });
    }

    const sql = `
        INSERT INTO reviews
        (product_name, customer_name, rating, review_message)
        VALUES (?, ?, ?, ?)
    `;

    const values = [
        product_name,
        customer_name,
        rating,
        review_message
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("❌ Review save failed:", err.message);

            return res.status(500).json({
                success: false,
                message: "Failed to save review."
            });
        }

        console.log("✅ Review saved successfully!");

        res.status(201).json({
            success: true,
            message: "Review saved successfully!",
            review_id: result.insertId
        });
    });
});


// ===============================
// REVIEW API - GET REVIEWS
// ===============================

app.get("/api/reviews/:productName", (req, res) => {

    const productName = req.params.productName;

    const sql = `
        SELECT
            id,
            product_name,
            customer_name,
            rating,
            review_message,
            review_date
        FROM reviews
        WHERE product_name = ?
        ORDER BY review_date DESC
    `;

    db.query(sql, [productName], (err, results) => {

        if (err) {
            console.error("❌ Reviews fetch failed:", err.message);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch reviews."
            });
        }

        res.json({
            success: true,
            reviews: results
        });
    });
});
// ===============================
// PRODUCT API - GET ALL PRODUCTS
// ===============================

app.get("/api/products", (req, res) => {

    const sql = `
        SELECT
            id,
            product_name,
            category,
            gender,
            season,
            price,
            sizes,
            description,
            image_url,
            stock_status,
            is_visible,
            created_at,
            updated_at
        FROM products
        WHERE is_visible = 1
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error("❌ Products fetch failed:", err.message);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch products."
            });

        }

        res.json({
            success: true,
            products: results
        });

    });

});
// ===============================
// PRODUCT API - UPDATE PRODUCT
// ===============================

app.put("/api/products/:id", (req, res) => {

    const productId = req.params.id;

    const {
        product_name,
        category,
        gender,
        season,
        price,
        sizes,
        description,
        image_url,
        stock_status,
        is_visible
    } = req.body;

    // Basic validation
    if (
        !product_name ||
        !category ||
        !gender ||
        !season ||
        price === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Product name, category, gender, season and price are required."
        });
    }

    const sql = `
        UPDATE products
        SET
            product_name = ?,
            category = ?,
            gender = ?,
            season = ?,
            price = ?,
            sizes = ?,
            description = ?,
            image_url = ?,
            stock_status = ?,
            is_visible = ?
        WHERE id = ?
    `;

    const values = [
        product_name,
        category,
        gender,
        season,
        price,
        sizes || null,
        description || null,
        image_url || null,
        stock_status || "in-stock",
        is_visible === undefined ? 1 : Number(is_visible),
        productId
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("❌ Product update failed:", err.message);

            return res.status(500).json({
                success: false,
                message: "Failed to update product."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        console.log("✅ Product updated successfully:", productId);

        res.json({
            success: true,
            message: "Product updated successfully!"
        });

    });

});
// ===============================
// PRODUCT API - ADD NEW PRODUCT
// ===============================

app.post("/api/products", (req, res) => {

    const {
        product_name,
        category,
        gender,
        season,
        price,
        sizes,
        description,
        image_url,
        stock_status,
        is_visible
    } = req.body;

    // Basic validation
    if (
        !product_name ||
        !category ||
        !gender ||
        !season ||
        price === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Product name, category, gender, season and price are required."
        });
    }

    const sql = `
        INSERT INTO products
        (
            product_name,
            category,
            gender,
            season,
            price,
            sizes,
            description,
            image_url,
            stock_status,
            is_visible
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        product_name,
        category,
        gender,
        season,
        price,
        sizes || null,
        description || null,
        image_url || null,
        stock_status || "in-stock",
        is_visible === undefined ? 1 : Number(is_visible)
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("❌ Product add failed:", err.message);

            return res.status(500).json({
                success: false,
                message: "Failed to add product."
            });
        }

        console.log(
            "✅ Product added successfully:",
            result.insertId
        );

        res.status(201).json({
            success: true,
            message: "Product added successfully!",
            product_id: result.insertId
        });

    });

});
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(`🚀 Server running on port ${PORT}`);

});