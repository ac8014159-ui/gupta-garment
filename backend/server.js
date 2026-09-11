const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// ADMIN AUTHENTICATION
// ===============================

const ADMIN_TOKEN_SECRET =
    process.env.ADMIN_TOKEN_SECRET ||
    process.env.ADMIN_PASSWORD;


/* =========================================
   CREATE ADMIN TOKEN
   ========================================= */

function createAdminToken() {

    const payload = {
        role: "admin",
        exp: Date.now() + (8 * 60 * 60 * 1000)
    };

    const payloadString =
        Buffer.from(
            JSON.stringify(payload)
        ).toString("base64url");

    const signature =
        crypto
            .createHmac(
                "sha256",
                ADMIN_TOKEN_SECRET
            )
            .update(payloadString)
            .digest("base64url");

    return payloadString + "." + signature;
}


/* =========================================
   VERIFY ADMIN TOKEN
   ========================================= */

function verifyAdminToken(token) {

    try {

        if (!token) {
            return false;
        }

        const parts =
            token.split(".");

        if (parts.length !== 2) {
            return false;
        }

        const payloadString =
            parts[0];

        const receivedSignature =
            parts[1];

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    ADMIN_TOKEN_SECRET
                )
                .update(payloadString)
                .digest("base64url");


        if (
            receivedSignature.length !==
            expectedSignature.length
        ) {
            return false;
        }


        const signatureValid =
            crypto.timingSafeEqual(
                Buffer.from(receivedSignature),
                Buffer.from(expectedSignature)
            );


        if (!signatureValid) {
            return false;
        }


        const payload =
            JSON.parse(
                Buffer.from(
                    payloadString,
                    "base64url"
                ).toString("utf8")
            );


        if (
            payload.role !== "admin" ||
            !payload.exp ||
            Date.now() > payload.exp
        ) {
            return false;
        }


        return true;

    } catch (error) {

        console.error(
            "❌ Admin token verification failed:",
            error.message
        );

        return false;
    }
}


/* =========================================
   ADMIN AUTH MIDDLEWARE
   ========================================= */

function requireAdminAuth(req, res, next) {

    const authHeader =
        req.headers.authorization || "";


    if (
        !authHeader.startsWith("Bearer ")
    ) {

        return res.status(401).json({
            success: false,
            message:
                "Admin authentication required."
        });

    }


    const token =
        authHeader.substring(7).trim();


    if (!verifyAdminToken(token)) {

        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired admin session."
        });

    }


    next();
}


/* =========================================
   ADMIN LOGIN API
   ========================================= */

app.post("/api/admin/login", (req, res) => {

    const {
        username,
        password
    } = req.body;


    const adminUsername =
        process.env.ADMIN_USERNAME;

    const adminPassword =
        process.env.ADMIN_PASSWORD;


    if (
        !adminUsername ||
        !adminPassword ||
        !ADMIN_TOKEN_SECRET
    ) {

        console.error(
            "❌ Admin authentication is not configured."
        );


        return res.status(500).json({

            success: false,

            message:
                "Admin authentication is not configured on server."

        });

    }


    if (
        username === adminUsername &&
        password === adminPassword
    ) {

        const token =
            createAdminToken();


        console.log(
            "✅ Admin login successful."
        );


        return res.json({

            success: true,

            message:
                "Login successful!",

            token: token

        });

    }


    console.log(
        "❌ Invalid admin login attempt."
    );


    return res.status(401).json({

        success: false,

        message:
            "Invalid username or password."

    });

});

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
// =============================================
// CUSTOMER DATABASE TEST API
// =============================================

app.get("/api/customers/test", (req, res) => {

    const sql = `
        SELECT
            id,
            full_name,
            mobile,
            email,
            mobile_verified,
            email_verified,
            is_active,
            created_at,
            updated_at
        FROM customers
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "❌ Customer database test failed:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Failed to read customers table."
            });
        }

        console.log(
            "✅ Customers table accessed successfully!"
        );

        res.json({
            success: true,
            customers: results
        });

    });

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
// =============================================
// ADMIN - GET ALL PRODUCTS
// INCLUDING HIDDEN PRODUCTS
// =============================================

app.get(
    "/api/products/admin",
    requireAdminAuth,
    (req, res) => {

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
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Admin products fetch error:",
                err
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to load admin products."
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

app.put(
    "/api/products/:id",
    requireAdminAuth,
    (req, res) => {

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

app.post(
    "/api/products",
    requireAdminAuth,
    (req, res) => {

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

// =====================================================
// CUSTOMER PENDING SIGNUP
// =====================================================

app.post("/api/customers/pending-signup", async (req, res) => {

    const {
        full_name,
        mobile,
        email,
        password
    } = req.body;

    // Basic validation
    if (!full_name || !mobile || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    // Mobile validation
    const mobilePattern = /^[6-9]\d{9}$/;

    if (!mobilePattern.test(mobile)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid 10-digit mobile number."
        });
    }

    // Password validation
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 6 characters."
        });
    }

    const normalizedEmail =
        email.trim().toLowerCase();

    try {

        // Check whether mobile/email already exists
        // in actual customers OR pending registrations
        const checkSql = `
            SELECT mobile, email
            FROM customers
            WHERE mobile = ? OR email = ?

            UNION

            SELECT mobile, email
            FROM customer_pending_registrations
            WHERE mobile = ? OR email = ?

            LIMIT 1
        `;

        db.query(
            checkSql,
            [
                mobile,
                normalizedEmail,
                mobile,
                normalizedEmail
            ],
            async (checkErr, checkResults) => {

                if (checkErr) {

                    console.error(
                        "❌ Pending signup check failed:",
                        checkErr.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database error."
                    });
                }

                if (checkResults.length > 0) {

                    const existing =
                        checkResults[0];

                    if (existing.mobile === mobile) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "This mobile number is already registered."
                        });
                    }

                    if (
                        existing.email &&
                        existing.email.toLowerCase() ===
                        normalizedEmail
                    ) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "This email address is already registered."
                        });
                    }
                }

                // Secure password hashing
                const hashedPassword =
                    await bcrypt.hash(password, 10);

                // Save registration temporarily
                const insertSql = `
                    INSERT INTO customer_pending_registrations
                    (
                        full_name,
                        mobile,
                        email,
                        password_hash,
                        mobile_verified,
                        email_verified
                    )
                    VALUES (?, ?, ?, ?, 0, 0)
                `;

                db.query(
                    insertSql,
                    [
                        full_name.trim(),
                        mobile,
                        normalizedEmail,
                        hashedPassword
                    ],
                    (insertErr, result) => {

                        if (insertErr) {

                            console.error(
                                "❌ Pending signup failed:",
                                insertErr.message
                            );

                            if (
                                insertErr.code ===
                                "ER_DUP_ENTRY"
                            ) {

                                return res.status(409).json({
                                    success: false,
                                    message:
                                        "This mobile number or email address is already registered."
                                });
                            }

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Unable to start customer registration."
                            });
                        }

                        console.log(
                            "✅ Pending customer registration created. ID:",
                            result.insertId
                        );

                        return res.status(201).json({
                            success: true,
                            message:
                                "Registration started successfully.",
                            pending_registration_id:
                                result.insertId
                        });
                    }
                );
            }
        );

    } catch (error) {

        console.error(
            "❌ Pending signup error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to start customer registration."
        });
    }
});
// =============================================
// CUSTOMER SIGNUP API - STEP 2.1
// =============================================

app.post("/api/customers/signup", (req, res) => {

    const {
        full_name,
        mobile,
        email,
        password
    } = req.body;

    // Basic validation
    if (!full_name || !mobile || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    // Mobile validation
    const mobilePattern = /^[6-9]\d{9}$/;

    if (!mobilePattern.test(mobile)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid 10-digit mobile number."
        });
    }

    // Password validation
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 6 characters."
        });
    }

    // Check duplicate mobile/email
    const checkSql = `
        SELECT id, mobile, email
        FROM customers
        WHERE mobile = ? OR email = ?
        LIMIT 1
    `;

    db.query(
        checkSql,
        [mobile, email],
       async (checkErr, checkResults) => {

            if (checkErr) {

                console.error(
                    "❌ Customer signup check failed:",
                    checkErr.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (checkResults.length > 0) {

                const existingCustomer =
                    checkResults[0];

                if (existingCustomer.mobile === mobile) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "This mobile number is already registered."
                    });
                }

                if (existingCustomer.email === email) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "This email address is already registered."
                    });
                }
            }

            // TEMPORARY password storage
            // Secure password hashing will be added
            // before final customer authentication.
        const hashedPassword = await bcrypt.hash(password, 10);
            const insertSql = `
                INSERT INTO customers
                (
                    full_name,
                    mobile,
                    email,
                    password_hash
                )
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                insertSql,
                [
                    full_name.trim(),
                    mobile,
                    email.trim().toLowerCase(),
                    hashedPassword
                ],
                (insertErr, result) => {

                   if (insertErr) {
    console.error(
        "❌ Customer signup failed:",
        insertErr.message
    );

    // MySQL duplicate entry error
    if (insertErr.code === "ER_DUP_ENTRY") {

        if (
            insertErr.message
                .toLowerCase()
                .includes("email")
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "This email address is already registered."
            });
        }

        if (
            insertErr.message
                .toLowerCase()
                .includes("mobile")
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "This mobile number is already registered."
            });
        }

        return res.status(409).json({
            success: false,
            message:
                "This mobile number or email address is already registered."
        });
    }

    return res.status(500).json({
        success: false,
        message:
            "Unable to create customer account."
    });
}
                    console.log(
                        "✅ Customer account created. ID:",
                        result.insertId
                    );

                    return res.status(201).json({
                        success: true,
                        message:
                            "Customer account created successfully.",
                        customer_id:
                            result.insertId
                    });

                }
            );

        }
    );

});
// =====================================================
// CUSTOMER LOGIN API
// Login using Email OR Mobile + Password
// =====================================================

app.post("/api/customers/login", async (req, res) => {

    const {
        identifier,
        password
    } = req.body;


    // =============================================
    // BASIC VALIDATION
    // =============================================

    if (!identifier || !password) {

        return res.status(400).json({
            success: false,
            message:
                "Email/mobile number and password are required."
        });

    }


    const loginIdentifier =
        identifier.trim();


    try {

        // =============================================
        // FIND CUSTOMER BY EMAIL OR MOBILE
        // =============================================

        const sql = `
            SELECT
                id,
                full_name,
                mobile,
                email,
                password_hash,
                mobile_verified,
                email_verified
            FROM customers
            WHERE mobile = ?
               OR LOWER(email) = LOWER(?)
            LIMIT 1
        `;


        db.query(
            sql,
            [
                loginIdentifier,
                loginIdentifier
            ],
            async (err, results) => {

                if (err) {

                    console.error(
                        "❌ Customer login database error:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Database error during login."
                    });

                }


                // =============================================
                // CUSTOMER NOT FOUND
                // =============================================

                if (results.length === 0) {

                    return res.status(401).json({
                        success: false,
                        message:
                            "Invalid email/mobile number or password."
                    });

                }


                const customer =
                    results[0];


                // =============================================
                // VERIFY PASSWORD
                // =============================================

                const passwordMatched =
                    await bcrypt.compare(
                        password,
                        customer.password_hash
                    );


                if (!passwordMatched) {

                    return res.status(401).json({
                        success: false,
                        message:
                            "Invalid email/mobile number or password."
                    });

                }


                // =============================================
                // VERIFY CUSTOMER ACCOUNT
                // =============================================

                if (
                    customer.mobile_verified !== 1 ||
                    customer.email_verified !== 1
                ) {

                    return res.status(403).json({
                        success: false,
                        message:
                            "Please complete mobile and email verification before login."
                    });

                }


                // =============================================
                // LOGIN SUCCESS
                // =============================================

                console.log(
                    "✅ Customer login successful. ID:",
                    customer.id,
                    "| Name:",
                    customer.full_name
                );


                return res.status(200).json({

                    success: true,

                    message:
                        "Customer login successful.",

                    customer: {

                        id:
                            customer.id,

                        full_name:
                            customer.full_name,

                        mobile:
                            customer.mobile,

                        email:
                            customer.email

                    }

                });

            }
        );

    }
    catch (error) {

        console.error(
            "❌ Customer login error:",
            error.message
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to login customer."
        });

    }

});
// =====================================================
// SEND MOBILE OTP
// Supports existing customers + pending registrations
// =====================================================

app.post("/api/customers/send-mobile-otp", (req, res) => {

    const { mobile } = req.body;

    // Basic validation
    if (!mobile) {
        return res.status(400).json({
            success: false,
            message: "Mobile number is required."
        });
    }

    // Mobile validation
    const mobilePattern = /^[6-9]\d{9}$/;

    if (!mobilePattern.test(mobile)) {
        return res.status(400).json({
            success: false,
            message:
                "Please enter a valid 10-digit mobile number."
        });
    }

    // =================================================
    // FIRST: Check actual customer
    // =================================================

    const customerSql = `
        SELECT
            id,
            mobile,
            mobile_verified
        FROM customers
        WHERE mobile = ?
        LIMIT 1
    `;

    db.query(
        customerSql,
        [mobile],
        (customerErr, customerResults) => {

            if (customerErr) {

                console.error(
                    "❌ Mobile OTP customer check failed:",
                    customerErr.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            // =================================================
            // EXISTING CUSTOMER FOUND
            // =================================================

            if (customerResults.length > 0) {

                const customer =
                    customerResults[0];

                // Generate 6-digit OTP
                const otpCode =
                    Math.floor(
                        100000 +
                        Math.random() * 900000
                    ).toString();

                // OTP valid for 5 minutes
                const expiresAt =
                    new Date(
                        Date.now() + 5 * 60 * 1000
                    );

                const otpSql = `
                    INSERT INTO customer_otps
                    (
                        customer_id,
                        pending_registration_id,
                        otp_type,
                        otp_code,
                        otp_expires_at,
                        is_verified,
                        attempts
                    )
                    VALUES (?, NULL, 'mobile', ?, ?, 0, 0)
                `;

                db.query(
                    otpSql,
                    [
                        customer.id,
                        otpCode,
                        expiresAt
                    ],
                    (otpErr, result) => {

                        if (otpErr) {

                            console.error(
                                "❌ Mobile OTP save failed:",
                                otpErr.message
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Failed to generate OTP."
                            });
                        }

                        console.log(
                            "📱 Mobile OTP generated for:",
                            mobile,
                            "| OTP:",
                            otpCode
                        );

                        return res.status(201).json({
                            success: true,
                            message:
                                "Mobile OTP generated successfully.",
                            otp_id: result.insertId,
                            otp: otpCode,
                            expires_in: 300
                        });
                    }
                );

                return;
            }

            // =================================================
            // ACTUAL CUSTOMER NOT FOUND
            // NOW CHECK PENDING REGISTRATION
            // =================================================

            const pendingSql = `
                SELECT
                    id,
                    mobile,
                    mobile_verified
                FROM customer_pending_registrations
                WHERE mobile = ?
                LIMIT 1
            `;

            db.query(
                pendingSql,
                [mobile],
                (pendingErr, pendingResults) => {

                    if (pendingErr) {

                        console.error(
                            "❌ Pending mobile OTP check failed:",
                            pendingErr.message
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Database error."
                        });
                    }

                    // Pending registration not found
                    if (pendingResults.length === 0) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "Customer registration not found."
                        });
                    }

                    const pending =
                        pendingResults[0];

                    // Already verified
                    if (pending.mobile_verified) {

                        return res.status(400).json({
                            success: false,
                            message:
                                "Mobile number is already verified."
                        });
                    }

                    // Generate 6-digit OTP
                    const otpCode =
                        Math.floor(
                            100000 +
                            Math.random() * 900000
                        ).toString();

                    // OTP valid for 5 minutes
                    const expiresAt =
                        new Date(
                            Date.now() + 5 * 60 * 1000
                        );

                    const pendingOtpSql = `
                        INSERT INTO customer_otps
                        (
                            customer_id,
                            pending_registration_id,
                            otp_type,
                            otp_code,
                            otp_expires_at,
                            is_verified,
                            attempts
                        )
                        VALUES (NULL, ?, 'mobile', ?, ?, 0, 0)
                    `;

                    db.query(
                        pendingOtpSql,
                        [
                            pending.id,
                            otpCode,
                            expiresAt
                        ],
                        (otpErr, result) => {

                            if (otpErr) {

                                console.error(
                                    "❌ Pending mobile OTP save failed:",
                                    otpErr.message
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to generate OTP."
                                });
                            }

                            console.log(
                                "📱 Pending mobile OTP generated for:",
                                mobile,
                                "| Pending ID:",
                                pending.id,
                                "| OTP:",
                                otpCode
                            );

                            return res.status(201).json({
                                success: true,
                                message:
                                    "Mobile OTP generated successfully.",
                                otp_id: result.insertId,
                                pending_registration_id:
                                    pending.id,
                                otp: otpCode,
                                expires_in: 300
                            });
                        }
                    );
                }
            );
        }
    );
});

app.post("/api/customers/send-email-otp", (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required."
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format."
        });
    }

    // First check actual customer account
    const findCustomerSql = `
        SELECT id, email, email_verified
        FROM customers
        WHERE email = ?
        LIMIT 1
    `;

    db.query(
        findCustomerSql,
        [normalizedEmail],
        (err, customerResults) => {

            if (err) {
                console.error(
                    "Send email OTP customer lookup error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            // Existing customer found
            if (customerResults.length > 0) {

                const customer = customerResults[0];

                const otpCode =
                    Math.floor(
                        100000 + Math.random() * 900000
                    ).toString();

                const expiresAt =
                    new Date(Date.now() + 5 * 60 * 1000);

                const insertOtpSql = `
                    INSERT INTO customer_otps
                    (
                        customer_id,
                        pending_registration_id,
                        otp_type,
                        otp_code,
                        otp_expires_at,
                        is_verified,
                        attempts
                    )
                    VALUES (?, NULL, 'email', ?, ?, 0, 0)
                `;

                db.query(
                    insertOtpSql,
                    [
                        customer.id,
                        otpCode,
                        expiresAt
                    ],
                    (insertErr, insertResult) => {

                        if (insertErr) {
                            console.error(
                                "Send email OTP insert error:",
                                insertErr
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Failed to generate email OTP."
                            });
                        }

                        return res.status(201).json({
                            success: true,
                            message:
                                "Email OTP generated successfully.",
                            otp_id: insertResult.insertId,
                            customer_id: customer.id,
                            otp: otpCode,
                            expires_in: 300
                        });
                    }
                );

                return;
            }

            // If customer does not exist,
            // check pending registration
            const findPendingSql = `
                SELECT id, email, email_verified
                FROM customer_pending_registrations
                WHERE email = ?
                LIMIT 1
            `;

            db.query(
                findPendingSql,
                [normalizedEmail],
                (pendingErr, pendingResults) => {

                    if (pendingErr) {
                        console.error(
                            "Send email OTP pending lookup error:",
                            pendingErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Database error."
                        });
                    }

                    if (pendingResults.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message:
                                "Customer account or pending registration not found."
                        });
                    }

                    const pending = pendingResults[0];

                    const otpCode =
                        Math.floor(
                            100000 + Math.random() * 900000
                        ).toString();

                    const expiresAt =
                        new Date(Date.now() + 5 * 60 * 1000);

                    const insertPendingOtpSql = `
                        INSERT INTO customer_otps
                        (
                            customer_id,
                            pending_registration_id,
                            otp_type,
                            otp_code,
                            otp_expires_at,
                            is_verified,
                            attempts
                        )
                        VALUES (NULL, ?, 'email', ?, ?, 0, 0)
                    `;

                    db.query(
                        insertPendingOtpSql,
                        [
                            pending.id,
                            otpCode,
                            expiresAt
                        ],
                        (insertErr, insertResult) => {

                            if (insertErr) {
                                console.error(
                                    "Send pending email OTP insert error:",
                                    insertErr
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to generate email OTP."
                                });
                            }

                            return res.status(201).json({
                                success: true,
                                message:
                                    "Email OTP generated successfully.",
                                otp_id: insertResult.insertId,
                                pending_registration_id:
                                    pending.id,
                                otp: otpCode,
                                expires_in: 300
                            });
                        }
                    );
                }
            );
        }
    );
});
app.post("/api/customers/verify-email-otp", (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP are required."
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format."
        });
    }

    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
            success: false,
            message: "OTP must be 6 digits."
        });
    }

    // First check actual customer
    const findCustomerSql = `
        SELECT id, email, email_verified
        FROM customers
        WHERE email = ?
        LIMIT 1
    `;

    db.query(
        findCustomerSql,
        [normalizedEmail],
        (err, customerResults) => {

            if (err) {
                console.error(
                    "Verify email OTP customer lookup error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            // Existing customer found
            if (customerResults.length > 0) {

                const customer = customerResults[0];

                if (customer.email_verified) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Email address is already verified."
                    });
                }

                const findOtpSql = `
                    SELECT
                        id,
                        otp_code,
                        otp_expires_at,
                        is_verified,
                        attempts
                    FROM customer_otps
                    WHERE customer_id = ?
                      AND pending_registration_id IS NULL
                      AND otp_type = 'email'
                      AND is_verified = 0
                    ORDER BY id DESC
                    LIMIT 1
                `;

                db.query(
                    findOtpSql,
                    [customer.id],
                    (otpErr, otpResults) => {

                        if (otpErr) {
                            console.error(
                                "Verify email OTP lookup error:",
                                otpErr
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Database error."
                            });
                        }

                        if (otpResults.length === 0) {
                            return res.status(400).json({
                                success: false,
                                message:
                                    "No active OTP found. Please request a new OTP."
                            });
                        }

                        const otpRecord = otpResults[0];

                        if (otpRecord.attempts >= 5) {
                            return res.status(429).json({
                                success: false,
                                message:
                                    "Too many incorrect OTP attempts. Please request a new OTP."
                            });
                        }

                        const currentTime = new Date();
                        const expiryTime =
                            new Date(otpRecord.otp_expires_at);

                        if (currentTime > expiryTime) {
                            return res.status(400).json({
                                success: false,
                                message:
                                    "OTP has expired. Please request a new OTP."
                            });
                        }

                        if (otp !== otpRecord.otp_code) {

                            const updateAttemptsSql = `
                                UPDATE customer_otps
                                SET attempts = attempts + 1
                                WHERE id = ?
                            `;

                            db.query(
                                updateAttemptsSql,
                                [otpRecord.id],
                                (updateErr) => {

                                    if (updateErr) {
                                        console.error(
                                            "Email OTP attempt update error:",
                                            updateErr
                                        );
                                    }
                                }
                            );

                            return res.status(401).json({
                                success: false,
                                message: "Invalid OTP."
                            });
                        }

                        const verifyOtpSql = `
                            UPDATE customer_otps
                            SET is_verified = 1
                            WHERE id = ?
                        `;

                        db.query(
                            verifyOtpSql,
                            [otpRecord.id],
                            (verifyOtpErr) => {

                                if (verifyOtpErr) {
                                    console.error(
                                        "Email OTP verification update error:",
                                        verifyOtpErr
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Failed to verify email OTP."
                                    });
                                }

                                const verifyCustomerSql = `
                                    UPDATE customers
                                    SET email_verified = 1
                                    WHERE id = ?
                                `;

                                db.query(
                                    verifyCustomerSql,
                                    [customer.id],
                                    (customerUpdateErr) => {

                                        if (customerUpdateErr) {
                                            console.error(
                                                "Customer email verification update error:",
                                                customerUpdateErr
                                            );

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Failed to update email verification status."
                                            });
                                        }

                                        return res.json({
                                            success: true,
                                            message:
                                                "Email address verified successfully."
                                        });
                                    }
                                );
                            }
                        );
                    }
                );

                return;
            }

            // Customer not found.
            // Now check pending registration.
            const findPendingSql = `
                SELECT id, email, email_verified
                FROM customer_pending_registrations
                WHERE email = ?
                LIMIT 1
            `;

            db.query(
                findPendingSql,
                [normalizedEmail],
                (pendingErr, pendingResults) => {

                    if (pendingErr) {
                        console.error(
                            "Verify email OTP pending lookup error:",
                            pendingErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Database error."
                        });
                    }

                    if (pendingResults.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message:
                                "Customer account or pending registration not found."
                        });
                    }

                    const pending = pendingResults[0];

                    if (pending.email_verified) {
                        return res.status(400).json({
                            success: false,
                            message:
                                "Email address is already verified."
                        });
                    }

                    const findPendingOtpSql = `
                        SELECT
                            id,
                            otp_code,
                            otp_expires_at,
                            is_verified,
                            attempts
                        FROM customer_otps
                        WHERE customer_id IS NULL
                          AND pending_registration_id = ?
                          AND otp_type = 'email'
                          AND is_verified = 0
                        ORDER BY id DESC
                        LIMIT 1
                    `;

                    db.query(
                        findPendingOtpSql,
                        [pending.id],
                        (otpErr, otpResults) => {

                            if (otpErr) {
                                console.error(
                                    "Verify pending email OTP lookup error:",
                                    otpErr
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Database error."
                                });
                            }

                            if (otpResults.length === 0) {
                                return res.status(400).json({
                                    success: false,
                                    message:
                                        "No active OTP found. Please request a new OTP."
                                });
                            }

                            const otpRecord = otpResults[0];

                            if (otpRecord.attempts >= 5) {
                                return res.status(429).json({
                                    success: false,
                                    message:
                                        "Too many incorrect OTP attempts. Please request a new OTP."
                                });
                            }

                            const currentTime = new Date();
                            const expiryTime =
                                new Date(otpRecord.otp_expires_at);

                            if (currentTime > expiryTime) {
                                return res.status(400).json({
                                    success: false,
                                    message:
                                        "OTP has expired. Please request a new OTP."
                                });
                            }

                            if (otp !== otpRecord.otp_code) {

                                const updateAttemptsSql = `
                                    UPDATE customer_otps
                                    SET attempts = attempts + 1
                                    WHERE id = ?
                                `;

                                db.query(
                                    updateAttemptsSql,
                                    [otpRecord.id],
                                    (updateErr) => {

                                        if (updateErr) {
                                            console.error(
                                                "Pending email OTP attempt update error:",
                                                updateErr
                                            );
                                        }
                                    }
                                );

                                return res.status(401).json({
                                    success: false,
                                    message: "Invalid OTP."
                                });
                            }

                            const verifyPendingOtpSql = `
                                UPDATE customer_otps
                                SET is_verified = 1
                                WHERE id = ?
                            `;

                            db.query(
                                verifyPendingOtpSql,
                                [otpRecord.id],
                                (verifyOtpErr) => {

                                    if (verifyOtpErr) {
                                        console.error(
                                            "Pending email OTP verification update error:",
                                            verifyOtpErr
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to verify email OTP."
                                        });
                                    }

                                    const verifyPendingSql = `
                                        UPDATE customer_pending_registrations
                                        SET email_verified = 1
                                        WHERE id = ?
                                    `;

                                    db.query(
                                        verifyPendingSql,
                                        [pending.id],
                                        (pendingUpdateErr) => {

                                            if (pendingUpdateErr) {
                                                console.error(
                                                    "Pending email verification update error:",
                                                    pendingUpdateErr
                                                );

                                                return res.status(500).json({
                                                    success: false,
                                                    message:
                                                        "Failed to update pending email verification status."
                                                });
                                            }

                                            return res.json({
                                                success: true,
                                                message:
                                                    "Email address verified successfully."
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});
// =====================================================
// VERIFY MOBILE OTP
// Supports existing customers + pending registrations
// =====================================================

app.post("/api/customers/verify-mobile-otp", (req, res) => {

    const {
        mobile,
        otp
    } = req.body;

    // Basic validation
    if (!mobile || !otp) {
        return res.status(400).json({
            success: false,
            message: "Mobile number and OTP are required."
        });
    }

    // Mobile validation
    const mobilePattern = /^[6-9]\d{9}$/;

    if (!mobilePattern.test(mobile)) {
        return res.status(400).json({
            success: false,
            message:
                "Please enter a valid 10-digit mobile number."
        });
    }

    // OTP validation
    const otpPattern = /^\d{6}$/;

    if (!otpPattern.test(otp)) {
        return res.status(400).json({
            success: false,
            message:
                "Please enter a valid 6-digit OTP."
        });
    }

    // =================================================
    // FIRST: Check actual customer
    // =================================================

    const customerSql = `
        SELECT
            id,
            mobile,
            mobile_verified
        FROM customers
        WHERE mobile = ?
        LIMIT 1
    `;

    db.query(
        customerSql,
        [mobile],
        (customerErr, customerResults) => {

            if (customerErr) {

                console.error(
                    "❌ Mobile OTP customer lookup failed:",
                    customerErr.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            // =================================================
            // EXISTING CUSTOMER
            // =================================================

            if (customerResults.length > 0) {

                const customer =
                    customerResults[0];

                // Already verified
                if (customer.mobile_verified) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Mobile number is already verified."
                    });
                }

                // Find latest unverified OTP
                const otpSql = `
                    SELECT
                        id,
                        otp_code,
                        otp_expires_at,
                        is_verified,
                        attempts
                    FROM customer_otps
                    WHERE customer_id = ?
                      AND pending_registration_id IS NULL
                      AND otp_type = 'mobile'
                      AND is_verified = 0
                    ORDER BY id DESC
                    LIMIT 1
                `;

                db.query(
                    otpSql,
                    [customer.id],
                    (otpErr, otpResults) => {

                        if (otpErr) {

                            console.error(
                                "❌ Mobile OTP lookup failed:",
                                otpErr.message
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Database error."
                            });
                        }

                        if (otpResults.length === 0) {

                            return res.status(400).json({
                                success: false,
                                message:
                                    "No active OTP found. Please request a new OTP."
                            });
                        }

                        const otpRecord =
                            otpResults[0];

                        // Attempt limit
                        if (otpRecord.attempts >= 5) {

                            return res.status(429).json({
                                success: false,
                                message:
                                    "Too many incorrect OTP attempts. Please request a new OTP."
                            });
                        }

                        // Expiry
                        if (
                            new Date(
                                otpRecord.otp_expires_at
                            ).getTime() < Date.now()
                        ) {

                            return res.status(400).json({
                                success: false,
                                message:
                                    "OTP has expired. Please request a new OTP."
                            });
                        }

                        // Wrong OTP
                        if (
                            otpRecord.otp_code !== otp
                        ) {

                            const updateAttemptsSql = `
                                UPDATE customer_otps
                                SET attempts = attempts + 1
                                WHERE id = ?
                            `;

                            db.query(
                                updateAttemptsSql,
                                [otpRecord.id],
                                (attemptErr) => {

                                    if (attemptErr) {
                                        console.error(
                                            "❌ OTP attempt update failed:",
                                            attemptErr.message
                                        );
                                    }
                                }
                            );

                            return res.status(401).json({
                                success: false,
                                message: "Invalid OTP."
                            });
                        }

                        // Correct OTP
                        const verifyOtpSql = `
                            UPDATE customer_otps
                            SET is_verified = 1
                            WHERE id = ?
                        `;

                        db.query(
                            verifyOtpSql,
                            [otpRecord.id],
                            (verifyErr) => {

                                if (verifyErr) {

                                    console.error(
                                        "❌ OTP verification update failed:",
                                        verifyErr.message
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Failed to verify OTP."
                                    });
                                }

                                const verifyMobileSql = `
                                    UPDATE customers
                                    SET mobile_verified = 1
                                    WHERE id = ?
                                `;

                                db.query(
                                    verifyMobileSql,
                                    [customer.id],
                                    (mobileVerifyErr) => {

                                        if (mobileVerifyErr) {

                                            console.error(
                                                "❌ Mobile verification update failed:",
                                                mobileVerifyErr.message
                                            );

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Failed to verify mobile number."
                                            });
                                        }

                                        console.log(
                                            "✅ Mobile number verified successfully:",
                                            mobile
                                        );

                                        return res.json({
                                            success: true,
                                            message:
                                                "Mobile number verified successfully."
                                        });
                                    }
                                );
                            }
                        );
                    }
                );

                return;
            }

            // =================================================
            // ACTUAL CUSTOMER NOT FOUND
            // CHECK PENDING REGISTRATION
            // =================================================

            const pendingSql = `
                SELECT
                    id,
                    mobile,
                    mobile_verified
                FROM customer_pending_registrations
                WHERE mobile = ?
                LIMIT 1
            `;

            db.query(
                pendingSql,
                [mobile],
                (pendingErr, pendingResults) => {

                    if (pendingErr) {

                        console.error(
                            "❌ Pending mobile lookup failed:",
                            pendingErr.message
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Database error."
                        });
                    }

                    if (pendingResults.length === 0) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "Customer registration not found."
                        });
                    }

                    const pending =
                        pendingResults[0];

                    // Already verified
                    if (pending.mobile_verified) {

                        return res.status(400).json({
                            success: false,
                            message:
                                "Mobile number is already verified."
                        });
                    }

                    // Find latest pending OTP
                    const pendingOtpSql = `
                        SELECT
                            id,
                            otp_code,
                            otp_expires_at,
                            is_verified,
                            attempts
                        FROM customer_otps
                        WHERE pending_registration_id = ?
                          AND customer_id IS NULL
                          AND otp_type = 'mobile'
                          AND is_verified = 0
                        ORDER BY id DESC
                        LIMIT 1
                    `;

                    db.query(
                        pendingOtpSql,
                        [pending.id],
                        (otpErr, otpResults) => {

                            if (otpErr) {

                                console.error(
                                    "❌ Pending mobile OTP lookup failed:",
                                    otpErr.message
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Database error."
                                });
                            }

                            if (otpResults.length === 0) {

                                return res.status(400).json({
                                    success: false,
                                    message:
                                        "No active OTP found. Please request a new OTP."
                                });
                            }

                            const otpRecord =
                                otpResults[0];

                            // Attempt limit
                            if (otpRecord.attempts >= 5) {

                                return res.status(429).json({
                                    success: false,
                                    message:
                                        "Too many incorrect OTP attempts. Please request a new OTP."
                                });
                            }

                            // Expiry
                            if (
                                new Date(
                                    otpRecord.otp_expires_at
                                ).getTime() < Date.now()
                            ) {

                                return res.status(400).json({
                                    success: false,
                                    message:
                                        "OTP has expired. Please request a new OTP."
                                });
                            }

                            // Wrong OTP
                            if (
                                otpRecord.otp_code !== otp
                            ) {

                                const updateAttemptsSql = `
                                    UPDATE customer_otps
                                    SET attempts = attempts + 1
                                    WHERE id = ?
                                `;

                                db.query(
                                    updateAttemptsSql,
                                    [otpRecord.id],
                                    (attemptErr) => {

                                        if (attemptErr) {
                                            console.error(
                                                "❌ Pending OTP attempt update failed:",
                                                attemptErr.message
                                            );
                                        }
                                    }
                                );

                                return res.status(401).json({
                                    success: false,
                                    message: "Invalid OTP."
                                });
                            }

                            // Correct OTP
                            const verifyOtpSql = `
                                UPDATE customer_otps
                                SET is_verified = 1
                                WHERE id = ?
                            `;

                            db.query(
                                verifyOtpSql,
                                [otpRecord.id],
                                (verifyErr) => {

                                    if (verifyErr) {

                                        console.error(
                                            "❌ Pending OTP verification update failed:",
                                            verifyErr.message
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to verify OTP."
                                        });
                                    }

                                    // Mark pending mobile verified
                                    const verifyPendingSql = `
                                        UPDATE customer_pending_registrations
                                        SET mobile_verified = 1
                                        WHERE id = ?
                                    `;

                                    db.query(
                                        verifyPendingSql,
                                        [pending.id],
                                        (pendingVerifyErr) => {

                                            if (pendingVerifyErr) {

                                                console.error(
                                                    "❌ Pending mobile verification update failed:",
                                                    pendingVerifyErr.message
                                                );

                                                return res.status(500).json({
                                                    success: false,
                                                    message:
                                                        "Failed to verify mobile number."
                                                });
                                            }

                                            console.log(
                                                "✅ Pending mobile number verified successfully:",
                                                mobile,
                                                "| Pending ID:",
                                                pending.id
                                            );

                                            return res.json({
                                                success: true,
                                                message:
                                                    "Mobile number verified successfully."
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});
// =====================================================
// COMPLETE CUSTOMER REGISTRATION
// =====================================================

app.post("/api/customers/complete-registration", (req, res) => {

    const { pending_registration_id } = req.body;

    if (!pending_registration_id) {
        return res.status(400).json({
            success: false,
            message: "Pending registration ID is required."
        });
    }

    const pendingSql = `
        SELECT
            id,
            full_name,
            mobile,
            email,
            password_hash,
            mobile_verified,
            email_verified
        FROM customer_pending_registrations
        WHERE id = ?
        LIMIT 1
    `;

    db.query(
        pendingSql,
        [pending_registration_id],
        (pendingErr, pendingResults) => {

            if (pendingErr) {
                console.error(
                    "Complete registration pending lookup error:",
                    pendingErr
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (pendingResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Pending registration not found."
                });
            }

            const pending = pendingResults[0];

            // BOTH OTPs MUST be verified
            if (
                pending.mobile_verified !== 1 ||
                pending.email_verified !== 1
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Mobile and email must be verified before account creation."
                });
            }

            // Check again that mobile/email are not already registered
            const duplicateSql = `
                SELECT id, mobile, email
                FROM customers
                WHERE mobile = ?
                   OR LOWER(email) = LOWER(?)
                LIMIT 1
            `;

            db.query(
                duplicateSql,
                [pending.mobile, pending.email],
                (duplicateErr, duplicateResults) => {

                    if (duplicateErr) {
                        console.error(
                            "Complete registration duplicate check error:",
                            duplicateErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Database error."
                        });
                    }

                    if (duplicateResults.length > 0) {

                        const existing = duplicateResults[0];

                        if (existing.mobile === pending.mobile) {
                            return res.status(409).json({
                                success: false,
                                message:
                                    "This mobile number is already registered."
                            });
                        }

                        return res.status(409).json({
                            success: false,
                            message:
                                "This email address is already registered."
                        });
                    }

                    // Create actual customer account
                    const insertSql = `
                        INSERT INTO customers
                        (
                            full_name,
                            mobile,
                            email,
                            password_hash,
                            mobile_verified,
                            email_verified,
                            is_active
                        )
                        VALUES (?, ?, ?, ?, 1, 1, 1)
                    `;

                    db.query(
                        insertSql,
                        [
                            pending.full_name,
                            pending.mobile,
                            pending.email,
                            pending.password_hash
                        ],
                        (insertErr, insertResult) => {

                            if (insertErr) {
                                console.error(
                                    "Complete registration insert error:",
                                    insertErr
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Unable to create customer account."
                                });
                            }

                            // Remove temporary pending registration
                            const deleteSql = `
                                DELETE FROM customer_pending_registrations
                                WHERE id = ?
                            `;

                            db.query(
                                deleteSql,
                                [pending_registration_id],
                                (deleteErr) => {

                                    if (deleteErr) {
                                        console.error(
                                            "Pending registration cleanup error:",
                                            deleteErr
                                        );
                                    }

                                    return res.status(201).json({
                                        success: true,
                                        message:
                                            "Customer account created successfully.",
                                        customer_id:
                                            insertResult.insertId
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(`🚀 Server running on port ${PORT}`);

});