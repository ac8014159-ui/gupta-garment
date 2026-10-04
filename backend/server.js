const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);
// =================================
// FESTIVAL POPUP IMAGE UPLOAD
// =================================

const festivalUploadDir =
    path.join(__dirname, "uploads", "festival-popups");

if (!fs.existsSync(festivalUploadDir)) {
    fs.mkdirSync(festivalUploadDir, {
        recursive: true
    });
}

const festivalStorage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, festivalUploadDir);
    },

    filename: function (req, file, cb) {

        const extension =
            path.extname(file.originalname);

        const fileName =
            "festival-" +
            Date.now() +
            extension;

        cb(null, fileName);
    }

});

const festivalUpload = multer({

    storage: festivalStorage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        if (!file.mimetype.startsWith("image/")) {
            return cb(
                new Error("Only image files are allowed")
            );
        }

        cb(null, true);
    }

});
// =================================
// FESTIVAL POPUP IMAGE UPLOAD API
// =================================

app.post(
    "/api/festival-popup/upload-image",
    requireAdminAuth,
    festivalUpload.single("image"),
    function (req, res) {

        try {

            if (!req.file) {

                return res.status(400).json({
                    message: "Please select an image"
                });

            }

            const imageUrl =
                "/uploads/festival-popups/" +
                req.file.filename;

            return res.json({
                success: true,
                image_url: imageUrl
            });

        }
        catch (error) {

            console.error(
                "Festival Popup Image Upload Error:",
                error
            );

            return res.status(500).json({
                message: "Failed to upload image"
            });

        }

    }
);

// =================================
// PRODUCT EDIT IMAGE UPLOAD
// =================================

const productUploadDir =
    path.join(
        __dirname,
        "uploads",
        "products"
    );


// Create product image folder
if (!fs.existsSync(productUploadDir)) {

    fs.mkdirSync(
        productUploadDir,
        {
            recursive: true
        }
    );

}


// Product image storage
const productStorage =
    multer.diskStorage({

        destination: function (
            req,
            file,
            cb
        ) {

            cb(
                null,
                productUploadDir
            );

        },

        filename: function (
            req,
            file,
            cb
        ) {

            const extension =
                path.extname(
                    file.originalname
                ).toLowerCase();

            const fileName =
                "product-" +
                Date.now() +
                "-" +
                Math.round(
                    Math.random() * 100000
                ) +
                extension;

            cb(
                null,
                fileName
            );

        }

    });


// Product image upload settings
const productUpload =
    multer({

        storage:
            productStorage,

        limits: {

            fileSize:
                5 * 1024 * 1024

        },

        fileFilter:
            function (
                req,
                file,
                cb
            ) {

                const allowedTypes = [

                    "image/jpeg",
                    "image/png",
                    "image/webp"

                ];


                if (
                    !allowedTypes.includes(
                        file.mimetype
                    )
                ) {

                    return cb(
                        new Error(
                            "Only JPG, JPEG, PNG and WEBP images are allowed."
                        )
                    );

                }


                cb(
                    null,
                    true
                );

            }

    });

// =============================================
// PRODUCT EDIT MULTIPLE IMAGE UPLOAD API
// =============================================

app.post(
    "/api/products/upload-image",

    requireAdminAuth,

    productUpload.array("images", 10),

    function (req, res) {

        try {
const productId =
    Number(req.body.product_id);

if (!productId) {

    return res.status(400).json({

        success: false,

        message:
            "Product ID is required."

    });

}
            if (
                !req.files ||
                req.files.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please select at least one image."

                });

            }


            const imageUrls =
                req.files.map(function (file) {

                    return (
                        "https://guptagarments.waifly.com/uploads/products/" +
                        file.filename
                    );

                });

const insertImageSql = `
    INSERT INTO product_images
    (
        product_id,
        image_url,
        sort_order
    )
    VALUES (?, ?, ?)
`;

for (
    let i = 0;
    i < imageUrls.length;
    i++
) {

    db.query(
        insertImageSql,
        [
            productId,
            imageUrls[i],
            i
        ],
        function (err) {

            if (err) {

                console.error(
                    "❌ Product image database save failed:",
                    err.message
                );

            }

        }
    );

}
db.query(
    `
    UPDATE products
    SET image_url = ?
    WHERE id = ?
    `,
    [
        imageUrls[0],
        productId
    ],
    function (err) {

        if (err) {

            console.error(
                "❌ Main product image update failed:",
                err.message
            );

        }

    }
);
            console.log(
                "✅ Product Images Uploaded:",
                imageUrls
            );


            return res.json({

                success: true,

                message:
                    "Product images uploaded successfully!",

                image_urls:
                    imageUrls

            });

        }

        catch (error) {

            console.error(
                "❌ Product Images Upload Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to upload product images."

            });

        }

    }

);
// =================================
// CATEGORY IMAGE UPLOAD
// =================================

const categoryUploadDir =
    path.join(
        __dirname,
        "uploads",
        "categories"
    );


// Create category image folder
if (!fs.existsSync(categoryUploadDir)) {

    fs.mkdirSync(
        categoryUploadDir,
        {
            recursive: true
        }
    );

}


// Category image storage
const categoryStorage =
    multer.diskStorage({

        destination: function (
            req,
            file,
            cb
        ) {

            cb(
                null,
                categoryUploadDir
            );

        },

        filename: function (
            req,
            file,
            cb
        ) {

            const extension =
                path.extname(
                    file.originalname
                ).toLowerCase();

            const fileName =
                "category-" +
                Date.now() +
                "-" +
                Math.round(
                    Math.random() * 100000
                ) +
                extension;

            cb(
                null,
                fileName
            );

        }

    });


// Category image upload settings
const categoryUpload =
    multer({

        storage:
            categoryStorage,

        limits: {

            fileSize:
                5 * 1024 * 1024

        },

        fileFilter:
            function (
                req,
                file,
                cb
            ) {

                const allowedTypes = [

                    "image/jpeg",
                    "image/png",
                    "image/webp"

                ];


                if (
                    !allowedTypes.includes(
                        file.mimetype
                    )
                ) {

                    return cb(
                        new Error(
                            "Only JPG, JPEG, PNG and WEBP images are allowed."
                        )
                    );

                }


                cb(
                    null,
                    true
                );

            }

    });


// =================================
// CATEGORY IMAGE UPLOAD API
// =================================

app.post(

    "/api/categories/upload-image",

    requireAdminAuth,

    categoryUpload.single("image"),

    function (
        req,
        res
    ) {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please select a category image."

                });

            }


            const imageUrl =
                "https://guptagarments.waifly.com/uploads/categories/" +
                req.file.filename;


            console.log(
                "✅ Category Image Uploaded:",
                imageUrl
            );


            return res.json({

                success: true,

                message:
                    "Category image uploaded successfully!",

                image_url:
                    imageUrl

            });

        }

        catch (error) {

            console.error(
                "❌ Category Image Upload Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to upload category image."

            });

        }

    }

);
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

// =============================================
// CATEGORY SYSTEM - CREATE TABLE + DEFAULT DATA
// =============================================

const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        image_url VARCHAR(500) DEFAULT NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP
    )
`;

db.query(createCategoriesTable, (err) => {

    if (err) {
        console.error(
            "❌ Categories table creation failed:",
            err.message
        );
        return;
    }

    console.log(
        "✅ Categories table ready!"
    );

    // =============================================
    // DEFAULT CATEGORIES
    // =============================================

    const defaultCategories = [
        ["Jeans", "jeans", "images/categories/jeans.png", 1],
        ["Shirts", "shirts", "images/categories/shirts.png", 2],
        ["T-Shirts", "tshirts", "images/categories/tshirts.png", 3],
        ["Lower", "lower", "images/categories/lower.png", 4],
        ["Western Dress", "western-dress", "images/categories/western-dress.png", 5],
        ["Nighty / Gown", "gown", "images/categories/nighty-gown.png", 6],
        ["Jacket", "jacket", "images/categories/jacket.png", 7],
        ["Cardigan", "cardigan", "images/categories/cardigan.png", 8],
        ["Divider", "divider", "images/categories/divider.png", 9],
        ["Jeans Top", "jeans-top", "images/categories/jeans-top.png", 10],

        ["Women Bra", "women-bra", null, 13],
        ["Women Panty", "women-panty", null, 14],
        ["Women Socks", "women-socks", null, 15],

        ["Men Underwear", "men-underwear", null, 16],
        ["Men Inner Wear", "men-inner-wear", null, 17],
        ["Handkerchief", "men-handkerchief", null, 18],
        ["Men Socks", "men-socks", null, 19],

        ["Thermal Set", "thermal-set", null, 20],
        ["Thermal Suit", "thermal-suit", null, 21],
        ["Top & Bottom Combo", "top-bottom-combo", null, 22]
    ];

    const insertCategory = `
        INSERT IGNORE INTO categories
        (name, slug, image_url, sort_order)
        VALUES (?, ?, ?, ?)
    `;

    defaultCategories.forEach(category => {

        db.query(
            insertCategory,
            category,
            (insertErr) => {

                if (insertErr) {
                    console.error(
                        "❌ Category insert failed:",
                        insertErr.message
                    );
                }

            }
        );

    });

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
// =============================================
// CATEGORY API - GET ALL CATEGORIES
// =============================================

app.get(
    "/api/categories",
    requireAdminAuth,
    (req, res) => {

        const sql = `
            SELECT
                id,
                name,
                slug,
                image_url,
                sort_order,
                is_active,
                created_at,
                updated_at
            FROM categories
            ORDER BY sort_order ASC, id ASC
        `;

        db.query(
            sql,
            (err, results) => {

                if (err) {

                    console.error(
                        "❌ Failed to load categories:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to load categories."
                    });

                }

                res.json({
                    success: true,
                    categories: results
                });

            }
        );

    }
);
// =============================================
// PUBLIC CATEGORY API - GET ACTIVE CATEGORIES
// =============================================

app.get(
    "/api/public/categories",
    (req, res) => {

        const sql = `
            SELECT
                id,
                name,
                slug,
                image_url,
                sort_order
            FROM categories
            WHERE is_active = 1
            ORDER BY sort_order ASC, id ASC
        `;

        db.query(
            sql,
            (err, results) => {

                if (err) {

                    console.error(
                        "❌ Failed to load public categories:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to load categories."
                    });

                }

                res.json({
                    success: true,
                    categories: results
                });

            }
        );

    }
);
// =============================================
// CATEGORY API - ADD NEW CATEGORY
// =============================================

app.post(
    "/api/categories",
    requireAdminAuth,
    (req, res) => {

        const {
            name,
            slug,
            image_url,
            sort_order
        } = req.body;

        // Basic validation
        if (!name || !slug) {

            return res.status(400).json({
                success: false,
                message:
                    "Category name and slug are required."
            });

        }

        const sql = `
            INSERT INTO categories
            (
                name,
                slug,
                image_url,
                sort_order
            )
            VALUES (?, ?, ?, ?)
        `;

        const values = [
            name.trim(),
            slug.trim(),
            image_url || null,
            sort_order
                ? Number(sort_order)
                : 1
        ];

        db.query(
            sql,
            values,
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Category add failed:",
                        err.message
                    );

                    // Duplicate slug
                    if (
                        err.code === "ER_DUP_ENTRY"
                    ) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "This category slug already exists."
                        });

                    }

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to add category."
                    });

                }

                console.log(
                    "✅ Category added successfully:",
                    result.insertId
                );

                res.status(201).json({

                    success: true,

                    message:
                        "Category added successfully!",

                    category_id:
                        result.insertId

                });

            }
        );

    }
);
// =============================================
// CATEGORY API - EDIT / UPDATE CATEGORY
// =============================================

app.put(
    "/api/categories/:id",
    requireAdminAuth,
    (req, res) => {

        const categoryId =
            Number(req.params.id);

        const {
            name,
            slug,
            image_url,
            sort_order
        } = req.body;

        if (
            !categoryId ||
            !name ||
            !slug
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Category ID, name and slug are required."
            });
        }

        const sql = `
            UPDATE categories
            SET
                name = ?,
                slug = ?,
                image_url = ?,
                sort_order = ?
            WHERE id = ?
        `;

        const values = [
            name.trim(),
            slug.trim(),
            image_url || null,
            sort_order
                ? Number(sort_order)
                : 1,
            categoryId
        ];

        db.query(
            sql,
            values,
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Category update failed:",
                        err.message
                    );

                    if (
                        err.code === "ER_DUP_ENTRY"
                    ) {
                        return res.status(409).json({
                            success: false,
                            message:
                                "This category slug already exists."
                        });
                    }

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to update category."
                    });
                }

                if (
                    result.affectedRows === 0
                ) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Category not found."
                    });
                }

                console.log(
                    "✅ Category updated successfully:",
                    categoryId
                );

                res.json({
                    success: true,
                    message:
                        "Category updated successfully!"
                });

            }
        );

    }
);


// =============================================
// CATEGORY API - DELETE CATEGORY
// =============================================

app.delete(
    "/api/categories/:id",
    requireAdminAuth,
    (req, res) => {

        const categoryId =
            Number(req.params.id);

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid category ID is required."
            });
        }

        const sql = `
            DELETE FROM categories
            WHERE id = ?
        `;

        db.query(
            sql,
            [categoryId],
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Category delete failed:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to delete category."
                    });
                }

                if (
                    result.affectedRows === 0
                ) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Category not found."
                    });
                }

                console.log(
                    "🗑️ Category deleted successfully:",
                    categoryId
                );

                res.json({
                    success: true,
                    message:
                        "Category deleted successfully!"
                });

            }
        );

    }
);


// =============================================
// CATEGORY API - ACTIVE / INACTIVE
// =============================================

app.patch(
    "/api/categories/:id/status",
    requireAdminAuth,
    (req, res) => {

        const categoryId =
            Number(req.params.id);

        const {
            is_active
        } = req.body;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid category ID is required."
            });
        }

        if (
            is_active !== 0 &&
            is_active !== 1 &&
            is_active !== true &&
            is_active !== false
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "is_active must be 0 or 1."
            });
        }

        const activeValue =
            Number(is_active) === 1 ||
            is_active === true
                ? 1
                : 0;

        const sql = `
            UPDATE categories
            SET is_active = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                activeValue,
                categoryId
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Category status update failed:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to update category status."
                    });
                }

                if (
                    result.affectedRows === 0
                ) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Category not found."
                    });
                }

                console.log(
                    "✅ Category status updated:",
                    categoryId,
                    activeValue
                );

                res.json({
                    success: true,
                    message:
                        activeValue === 1
                            ? "Category activated successfully!"
                            : "Category deactivated successfully!"
                });

            }
        );

    }
);
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
// ======================================================
// GET PRODUCT MULTIPLE IMAGES
// ======================================================

app.get(
    "/api/products/:productId/images",
    requireAdminAuth,
    function (req, res) {

        const productId =
            Number(req.params.productId);


        if (!productId) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid product ID."

            });

        }


        const sql = `
            SELECT
                id,
                product_id,
                image_url,
                sort_order
            FROM product_images
            WHERE product_id = ?
            ORDER BY sort_order ASC, id ASC
        `;


        db.query(
            sql,
            [productId],
            function (err, rows) {

                if (err) {

                    console.error(
                        "❌ Product Images Fetch Error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to load product images."

                    });

                }


                return res.json({

                    success: true,

                    images:
                        rows || []

                });

            }
        );

    }
);
// ======================================================
// PUBLIC - GET PRODUCT MULTIPLE IMAGES
// ======================================================

app.get(
    "/api/products/:productId/public-images",
    function (req, res) {

        const productId =
            Number(req.params.productId);

        if (!productId) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid product ID."
            });
        }

        const sql = `
            SELECT
                id,
                product_id,
                image_url,
                sort_order
            FROM product_images
            WHERE product_id = ?
            ORDER BY sort_order ASC, id ASC
        `;

        db.query(
            sql,
            [productId],
            function (err, rows) {

                if (err) {

                    console.error(
                        "❌ Public Product Images Fetch Error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to load product images."
                    });
                }

                return res.json({
                    success: true,
                    images:
                        rows || []
                });
            }
        );
    }
);
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
/* =========================================
   CUSTOMER PROFILE UPDATE
   ========================================= */

app.put("/api/customers/:id/profile", async (req, res) => {

    const customerId = req.params.id;

    const {
        full_name,
        mobile,
        email
    } = req.body;


    if (!customerId || !full_name || !mobile || !email) {

        return res.status(400).json({
            success: false,
            message: "Customer ID, name, mobile and email are required."
        });

    }


    const cleanName = full_name.trim();
    const cleanMobile = mobile.trim();
    const cleanEmail = email.trim().toLowerCase();


    if (!/^[0-9]{10}$/.test(cleanMobile)) {

        return res.status(400).json({
            success: false,
            message: "Please enter a valid 10-digit mobile number."
        });

    }


    try {

        // Check customer exists
        const checkSql = `
            SELECT id
            FROM customers
            WHERE id = ?
            LIMIT 1
        `;


        db.query(
            checkSql,
            [customerId],
            (checkErr, checkResults) => {

                if (checkErr) {

                    console.error(
                        "❌ Profile check error:",
                        checkErr.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database error while checking customer."
                    });

                }


                if (checkResults.length === 0) {

                    return res.status(404).json({
                        success: false,
                        message: "Customer not found."
                    });

                }


                // Check whether mobile/email belongs to another customer
                const duplicateSql = `
                    SELECT id
                    FROM customers
                    WHERE (mobile = ? OR LOWER(email) = LOWER(?))
                    AND id <> ?
                    LIMIT 1
                `;


                db.query(
                    duplicateSql,
                    [
                        cleanMobile,
                        cleanEmail,
                        customerId
                    ],
                    (duplicateErr, duplicateResults) => {

                        if (duplicateErr) {

                            console.error(
                                "❌ Profile duplicate check error:",
                                duplicateErr.message
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Database error while checking profile details."
                            });

                        }


                        if (duplicateResults.length > 0) {

                            return res.status(409).json({
                                success: false,
                                message: "Mobile number or email is already used by another customer."
                            });

                        }


                        const updateSql = `
                            UPDATE customers
                            SET
                                full_name = ?,
                                mobile = ?,
                                email = ?,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?
                        `;


                        db.query(
                            updateSql,
                            [
                                cleanName,
                                cleanMobile,
                                cleanEmail,
                                customerId
                            ],
                            (updateErr) => {

                                if (updateErr) {

                                    console.error(
                                        "❌ Profile update error:",
                                        updateErr.message
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message: "Unable to update customer profile."
                                    });

                                }


                                console.log(
                                    "✅ Customer profile updated. ID:",
                                    customerId
                                );


                                return res.status(200).json({
                                    success: true,
                                    message: "Customer profile updated successfully.",
                                    customer: {
                                        id: Number(customerId),
                                        full_name: cleanName,
                                        mobile: cleanMobile,
                                        email: cleanEmail
                                    }
                                });

                            }
                        );

                    }
                );

            }
        );

    } catch (error) {

        console.error(
            "❌ Customer profile update error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update customer profile."
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
// =====================================================
// CUSTOMER ORDERS API - CREATE NEW ORDER
// =====================================================

app.post("/api/orders", (req, res) => {

    const {
        customer_id,
        delivery_name,
        delivery_mobile,
        delivery_address,
        delivery_city,
        delivery_pincode,
        payment_method,
        order_source,
        items
    } = req.body;


    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (
        !customer_id ||
        !delivery_name ||
        !delivery_mobile ||
        !delivery_address ||
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Customer, delivery details and order items are required."
        });

    }


    // =================================================
    // MOBILE VALIDATION
    // =================================================

    if (!/^[6-9]\d{9}$/.test(delivery_mobile.trim())) {

        return res.status(400).json({
            success: false,
            message:
                "Please enter a valid 10-digit delivery mobile number."
        });

    }


    // =================================================
    // CHECK CUSTOMER
    // =================================================

    const customerSql = `
        SELECT
            id,
            full_name,
            mobile,
            email
        FROM customers
        WHERE id = ?
        LIMIT 1
    `;


    db.query(
        customerSql,
        [customer_id],
        (customerErr, customerResults) => {

            if (customerErr) {

                console.error(
                    "❌ Order customer lookup failed:",
                    customerErr.message
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Database error while checking customer."
                });

            }


            if (customerResults.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Customer not found."
                });

            }


            // =================================================
            // PREPARE PRODUCT IDS
            // =================================================

            const productIds = [];

            for (const item of items) {

                if (
                    !item.product_id ||
                    !Number.isInteger(Number(item.quantity)) ||
                    Number(item.quantity) <= 0
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Each order item must have a valid product_id and quantity."
                    });

                }

                productIds.push(
                    Number(item.product_id)
                );

            }


            // Remove duplicate product IDs
            const uniqueProductIds =
                [...new Set(productIds)];


            // =================================================
            // GET PRODUCT DETAILS FROM DATABASE
            // =================================================

            const placeholders =
                uniqueProductIds
                    .map(() => "?")
                    .join(",");


            const productSql = `
                SELECT
                    id,
                    product_name,
                    price,
                    stock_status,
                    is_visible
                FROM products
                WHERE id IN (${placeholders})
            `;


            db.query(
                productSql,
                uniqueProductIds,
                (productErr, productResults) => {

                    if (productErr) {

                        console.error(
                            "❌ Order product lookup failed:",
                            productErr.message
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Database error while checking products."
                        });

                    }


                    // =================================================
                    // CHECK ALL PRODUCTS EXIST
                    // =================================================

                    if (
                        productResults.length !==
                        uniqueProductIds.length
                    ) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "One or more products were not found."
                        });

                    }


                    // =================================================
                    // CREATE PRODUCT MAP
                    // =================================================

                    const productMap = {};

                    productResults.forEach(product => {

                        productMap[product.id] =
                            product;

                    });


                    // =================================================
                    // CHECK PRODUCT VISIBILITY / STOCK
                    // =================================================

                    for (const item of items) {

                        const product =
                            productMap[
                                Number(item.product_id)
                            ];


                        if (
                            Number(product.is_visible) !== 1
                        ) {

                            return res.status(400).json({
                                success: false,
                                message:
                                    `${product.product_name} is currently unavailable.`
                            });

                        }


                        if (
                            product.stock_status &&
                            product.stock_status
                                .toLowerCase() === "out-of-stock"
                        ) {

                            return res.status(400).json({
                                success: false,
                                message:
                                    `${product.product_name} is currently out of stock.`
                            });

                        }

                    }


                    // =================================================
                    // CALCULATE ORDER TOTAL
                    // PRICE COMES FROM DATABASE
                    // =================================================

                    let totalAmount = 0;

                    const orderItems =
                        items.map(item => {

                            const product =
                                productMap[
                                    Number(item.product_id)
                                ];

                            const quantity =
                                Number(item.quantity);

                            const price =
                                Number(product.price);

                            const itemTotal =
                                price * quantity;

                            totalAmount +=
                                itemTotal;

                            return {
                                product_id:
                                    product.id,

                                product_name:
                                    product.product_name,

                                quantity:
                                    quantity,

                                price:
                                    price,

                                size:
                                    item.size ?
                                    String(item.size).trim() :
                                    null
                            };

                        });


                    // =================================================
                    // GENERATE UNIQUE ORDER NUMBER
                    // =================================================

                    const orderNumber =
                        "GG" +
                        Date.now() +
                        Math.floor(
                            100 +
                            Math.random() * 900
                        );


                    // =================================================
                    // START DATABASE TRANSACTION
                    // =================================================

                    db.beginTransaction(
                        (transactionErr) => {

                            if (transactionErr) {

                                console.error(
                                    "❌ Order transaction start failed:",
                                    transactionErr.message
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Unable to start order transaction."
                                });

                            }


                            // =================================================
                            // INSERT ORDER
                            // =================================================

                            const insertOrderSql = `
                                INSERT INTO orders
                                (
                                    customer_id,
                                    order_number,
                                    total_amount,
                                    order_status,
                                    payment_status,
                                    payment_method,
                                    delivery_name,
                                    delivery_mobile,
                                    delivery_address,
                                    delivery_city,
                                    delivery_pincode,
                                    order_source
                                )
                                VALUES
                                (?, ?, ?, 'placed', 'pending', ?, ?, ?, ?, ?, ?, ?)
                            `;


                            const orderValues = [

                                customer_id,

                                orderNumber,

                                totalAmount,

                                payment_method ||
                                    "cod",

                                delivery_name.trim(),

                                delivery_mobile.trim(),

                                delivery_address.trim(),

                                delivery_city ?
                                    delivery_city.trim() :
                                    "Hapur",

                                delivery_pincode ?
                                    delivery_pincode.trim() :
                                    null,

                                order_source ||
                                    "website"

                            ];


                            db.query(
                                insertOrderSql,
                                orderValues,
                                (orderErr, orderResult) => {

                                    if (orderErr) {

                                        return db.rollback(() => {

                                            console.error(
                                                "❌ Order creation failed:",
                                                orderErr.message
                                            );

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Failed to create order."
                                            });

                                        });

                                    }


                                    const orderId =
                                        orderResult.insertId;


                                    // =================================================
                                    // INSERT ORDER ITEMS
                                    // =================================================

                                    const insertItemSql = `
                                        INSERT INTO order_items
                                        (
                                            order_id,
                                            product_id,
                                            product_name,
                                            quantity,
                                            price,
                                            size
                                        )
                                        VALUES (?, ?, ?, ?, ?, ?)
                                    `;


                                    let currentIndex = 0;


                                    function insertNextItem() {

                                        if (
                                            currentIndex >=
                                            orderItems.length
                                        ) {

                                            // =============================================
                                            // ALL ITEMS INSERTED
                                            // COMMIT TRANSACTION
                                            // =============================================

                                            return db.commit(
                                                (commitErr) => {

                                                    if (commitErr) {

                                                        return db.rollback(() => {

                                                            console.error(
                                                                "❌ Order commit failed:",
                                                                commitErr.message
                                                            );

                                                            return res.status(500).json({
                                                                success: false,
                                                                message:
                                                                    "Failed to complete order."
                                                            });

                                                        });

                                                    }


                                                    console.log(
                                                        "✅ Order created successfully:",
                                                        orderNumber
                                                    );


                                                    return res.status(201).json({

                                                        success: true,

                                                        message:
                                                            "Order created successfully.",

                                                        order: {

                                                            id:
                                                                orderId,

                                                            order_number:
                                                                orderNumber,

                                                            customer_id:
                                                                Number(customer_id),

                                                            total_amount:
                                                                totalAmount,

                                                            order_status:
                                                                "placed",

                                                            payment_status:
                                                                "pending",

                                                            payment_method:
                                                                payment_method ||
                                                                "cod",

                                                            delivery_name:
                                                                delivery_name.trim(),

                                                            delivery_mobile:
                                                                delivery_mobile.trim(),

                                                            delivery_address:
                                                                delivery_address.trim(),

                                                            delivery_city:
                                                                delivery_city ?
                                                                delivery_city.trim() :
                                                                "Hapur",

                                                            delivery_pincode:
                                                                delivery_pincode ?
                                                                delivery_pincode.trim() :
                                                                null,

                                                            items:
                                                                orderItems

                                                        }

                                                    });

                                                }
                                            );

                                        }


                                        const item =
                                            orderItems[
                                                currentIndex
                                            ];


                                        db.query(
                                            insertItemSql,
                                            [
                                                orderId,

                                                item.product_id,

                                                item.product_name,

                                                item.quantity,

                                                item.price,

                                                item.size

                                            ],
                                            (itemErr) => {

                                                if (itemErr) {

                                                    return db.rollback(() => {

                                                        console.error(
                                                            "❌ Order item insert failed:",
                                                            itemErr.message
                                                        );

                                                        return res.status(500).json({
                                                            success: false,
                                                            message:
                                                                "Failed to save order items."
                                                        });

                                                    });

                                                }


                                                currentIndex++;

                                                insertNextItem();

                                            }
                                        );

                                    }


                                    insertNextItem();

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});
/* =====================================================
   CUSTOMER WISHLIST API
   ===================================================== */

/* ================= ADD TO WISHLIST ================= */

app.post("/api/wishlist", (req, res) => {

    const { customer_id, product_id } = req.body;

    if (!customer_id || !product_id) {
        return res.status(400).json({
            success: false,
            message: "Customer ID and product ID are required."
        });
    }

    /* Check customer */

    const customerSql = `
        SELECT id
        FROM customers
        WHERE id = ?
        LIMIT 1
    `;

    db.query(
        customerSql,
        [customer_id],
        (customerErr, customerResults) => {

            if (customerErr) {
                console.error(
                    "❌ Wishlist customer check error:",
                    customerErr.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error while checking customer."
                });
            }

            if (customerResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found."
                });
            }


            /* Check product */

            const productSql = `
                SELECT
                    id,
                    product_name,
                    price,
                    stock_status,
                    is_visible
                FROM products
                WHERE id = ?
                LIMIT 1
            `;

            db.query(
                productSql,
                [product_id],
                (productErr, productResults) => {

                    if (productErr) {
                        console.error(
                            "❌ Wishlist product check error:",
                            productErr.message
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Database error while checking product."
                        });
                    }

                    if (productResults.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Product not found."
                        });
                    }


                    const product =
                        productResults[0];


                    /* Hidden product cannot be added */

                    if (Number(product.is_visible) !== 1) {
                        return res.status(400).json({
                            success: false,
                            message: "This product is currently unavailable."
                        });
                    }


                    /* Check duplicate */

                    const duplicateSql = `
                        SELECT id
                        FROM wishlist
                        WHERE customer_id = ?
                          AND product_id = ?
                        LIMIT 1
                    `;

                    db.query(
                        duplicateSql,
                        [customer_id, product_id],
                        (duplicateErr, duplicateResults) => {

                            if (duplicateErr) {
                                console.error(
                                    "❌ Wishlist duplicate check error:",
                                    duplicateErr.message
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Database error while checking wishlist."
                                });
                            }


                            if (duplicateResults.length > 0) {
                                return res.status(200).json({
                                    success: true,
                                    already_added: true,
                                    message: "Product is already in your wishlist."
                                });
                            }


                            /* Insert wishlist */

                            const insertSql = `
                                INSERT INTO wishlist
                                (
                                    customer_id,
                                    product_id
                                )
                                VALUES (?, ?)
                            `;

                            db.query(
                                insertSql,
                                [customer_id, product_id],
                                (insertErr, insertResult) => {

                                    if (insertErr) {
                                        console.error(
                                            "❌ Wishlist insert error:",
                                            insertErr.message
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message: "Unable to add product to wishlist."
                                        });
                                    }


                                    console.log(
                                        "❤️ Product added to wishlist. Customer:",
                                        customer_id,
                                        "| Product:",
                                        product_id
                                    );


                                    return res.status(201).json({
                                        success: true,
                                        already_added: false,
                                        message: "Product added to wishlist.",
                                        wishlist: {
                                            id: insertResult.insertId,
                                            customer_id: Number(customer_id),
                                            product_id: Number(product_id),
                                            product_name: product.product_name,
                                            price: product.price
                                        }
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


/* ================= GET CUSTOMER WISHLIST ================= */

app.get("/api/wishlist/:customerId", (req, res) => {

    const customerId =
        req.params.customerId;

    if (!customerId) {
        return res.status(400).json({
            success: false,
            message: "Customer ID is required."
        });
    }


    const sql = `
        SELECT
            w.id,
            w.customer_id,
            w.product_id,
            w.created_at,
            p.product_name,
            p.category,
            p.gender,
            p.season,
            p.price,
            p.sizes,
            p.description,
            p.image_url,
            p.stock_status,
            p.is_visible
        FROM wishlist w
        INNER JOIN products p
            ON w.product_id = p.id
        WHERE w.customer_id = ?
        ORDER BY w.id DESC
    `;


    db.query(
        sql,
        [customerId],
        (err, results) => {

            if (err) {
                console.error(
                    "❌ Get wishlist error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to load wishlist."
                });
            }


            return res.status(200).json({
                success: true,
                wishlist: results
            });

        }
    );

});


/* ================= REMOVE FROM WISHLIST ================= */

app.delete("/api/wishlist/:customerId/:productId", (req, res) => {

    const customerId =
        req.params.customerId;

    const productId =
        req.params.productId;


    if (!customerId || !productId) {
        return res.status(400).json({
            success: false,
            message: "Customer ID and product ID are required."
        });
    }


    const sql = `
        DELETE FROM wishlist
        WHERE customer_id = ?
          AND product_id = ?
    `;


    db.query(
        sql,
        [customerId, productId],
        (err, result) => {

            if (err) {
                console.error(
                    "❌ Remove wishlist error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to remove product from wishlist."
                });
            }


            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product is not in your wishlist."
                });
            }


            console.log(
                "💔 Product removed from wishlist. Customer:",
                customerId,
                "| Product:",
                productId
            );


            return res.status(200).json({
                success: true,
                message: "Product removed from wishlist."
            });

        }
    );

});
// =====================================================
// FESTIVAL / ALERT POPUP APIs
// =====================================================

// PUBLIC: Get currently active popup
app.get("/api/festival-popup/active", (req, res) => {

    const sql = `
        SELECT
            id,
            popup_type,
            title,
            subtitle,
            description,
            image_url,
            button_text,
            button_link,
            start_at,
            end_at,
            priority
        FROM site_popups
        WHERE is_active = 1
          AND start_at <= NOW()
          AND end_at >= NOW()
        ORDER BY priority DESC, id DESC
        LIMIT 1
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(
                "❌ Active festival popup fetch error:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to fetch active popup."
            });
        }

        return res.status(200).json({
            success: true,
            popup: results.length > 0 ? results[0] : null
        });

    });

});


// ADMIN: Get all festival / alert popups
app.get(
    "/api/festival-popups/admin",
    requireAdminAuth,
    (req, res) => {

        const sql = `
            SELECT
                id,
                popup_type,
                title,
                subtitle,
                description,
                image_url,
                button_text,
                button_link,
                start_at,
                end_at,
                is_active,
                priority,
                created_at,
                updated_at
            FROM site_popups
            ORDER BY priority DESC, id DESC
        `;

        db.query(sql, (err, results) => {

            if (err) {
                console.error(
                    "❌ Festival popup admin fetch error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to fetch festival popups."
                });
            }

            return res.status(200).json({
                success: true,
                popups: results
            });

        });

    }
);


// ADMIN: Create festival / alert popup
app.post(
    "/api/festival-popups",
    requireAdminAuth,
    (req, res) => {

        const {
            popup_type,
            title,
            subtitle,
            description,
            image_url,
            button_text,
            button_link,
            start_at,
            end_at,
            is_active,
            priority
        } = req.body;


        if (
            !popup_type ||
            !title ||
            !start_at ||
            !end_at
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Popup type, title, start date and end date are required."
            });
        }


        const sql = `
            INSERT INTO site_popups
            (
                popup_type,
                title,
                subtitle,
                description,
                image_url,
                button_text,
                button_link,
                start_at,
                end_at,
                is_active,
                priority
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                popup_type,
                title,
                subtitle || null,
                description || null,
                image_url || null,
                button_text || null,
                button_link || null,
                start_at,
                end_at,
                is_active === undefined ? 1 : Number(is_active),
                priority === undefined ? 1 : Number(priority)
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "❌ Festival popup create error:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to create popup."
                    });
                }


                return res.status(201).json({
                    success: true,
                    message: "Festival popup created successfully.",
                    id: result.insertId
                });

            }
        );

    }
);


// ADMIN: Update festival / alert popup
app.put(
    "/api/festival-popups/:id",
    requireAdminAuth,
    (req, res) => {

        const popupId = Number(req.params.id);

        if (!popupId) {
            return res.status(400).json({
                success: false,
                message: "Invalid popup ID."
            });
        }


        const {
            popup_type,
            title,
            subtitle,
            description,
            image_url,
            button_text,
            button_link,
            start_at,
            end_at,
            is_active,
            priority
        } = req.body;


        if (
            !popup_type ||
            !title ||
            !start_at ||
            !end_at
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Popup type, title, start date and end date are required."
            });
        }


        const sql = `
            UPDATE site_popups
            SET
                popup_type = ?,
                title = ?,
                subtitle = ?,
                description = ?,
                image_url = ?,
                button_text = ?,
                button_link = ?,
                start_at = ?,
                end_at = ?,
                is_active = ?,
                priority = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                popup_type,
                title,
                subtitle || null,
                description || null,
                image_url || null,
                button_text || null,
                button_link || null,
                start_at,
                end_at,
                is_active === undefined ? 1 : Number(is_active),
                priority === undefined ? 1 : Number(priority),
                popupId
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "❌ Festival popup update error:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to update popup."
                    });
                }


                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Popup not found."
                    });
                }


                return res.status(200).json({
                    success: true,
                    message: "Festival popup updated successfully."
                });

            }
        );

    }
);


// ADMIN: Delete festival / alert popup
app.delete(
    "/api/festival-popups/:id",
    requireAdminAuth,
    (req, res) => {

        const popupId = Number(req.params.id);

        if (!popupId) {
            return res.status(400).json({
                success: false,
                message: "Invalid popup ID."
            });
        }


        const sql = `
            DELETE FROM site_popups
            WHERE id = ?
        `;


        db.query(
            sql,
            [popupId],
            (err, result) => {

                if (err) {
                    console.error(
                        "❌ Festival popup delete error:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to delete popup."
                    });
                }


                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Popup not found."
                    });
                }


                return res.status(200).json({
                    success: true,
                    message: "Festival popup deleted successfully."
                });

            }
        );

    }
);
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(`🚀 Server running on port ${PORT}`);

});