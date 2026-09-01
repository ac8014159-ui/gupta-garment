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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});