/* =========================================================
   GUPTA GARMENTS - WEBSITE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       MOBILE MENU
       ===================================================== */

    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navMenu = document.querySelector(".nav-menu");

    if (mobileMenuBtn && navMenu) {

        mobileMenuBtn.addEventListener("click", function () {

            navMenu.classList.toggle("mobile-open");

            const icon = mobileMenuBtn.querySelector("i");

            if (navMenu.classList.contains("mobile-open")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }

        });

        /* Close mobile menu after clicking links */

        const navLinks = navMenu.querySelectorAll(
            "a:not(.dropdown > a)"
        );

        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                navMenu.classList.remove("mobile-open");

                const icon = mobileMenuBtn.querySelector("i");

                if (icon) {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                }

            });

        });

    }


    /* =====================================================
       PRODUCT ELEMENTS
       ===================================================== */

    let productCards =
        document.querySelectorAll(".product-card");

    const categoryCards =
        document.querySelectorAll(".category-card");
// =====================================================
// LOAD PRODUCT IMAGES FROM DATABASE
// =====================================================

function loadProductImagesFromDatabase() {

    fetch(
        "https://guptagarments.waifly.com/api/products"
    )
        .then(function (response) {

            if (!response.ok) {
                throw new Error(
                    "Failed to load products"
                );
            }

            return response.json();
        })
        .then(function (products) {

            if (!Array.isArray(products)) {
                return;
            }

            productCards.forEach(
                function (card) {

                    const productNameElement =
                        card.querySelector("h3");

                    const productVisual =
                        card.querySelector(
                            ".dummy-product"
                        );

                    if (
                        !productNameElement ||
                        !productVisual
                    ) {
                        return;
                    }

                    const productName =
                        productNameElement.textContent
                            .trim()
                            .toLowerCase();

                    const databaseProduct =
                        products.find(
                            function (product) {

                                return (
                                    product.product_name &&
                                    product.product_name
                                        .trim()
                                        .toLowerCase() ===
                                    productName
                                );

                            }
                        );

                    if (
                        !databaseProduct ||
                        !databaseProduct.image_url
                    ) {
                        return;
                    }

                    let imageUrl =
                        databaseProduct.image_url;

                    if (
                        imageUrl.startsWith("/")
                    ) {

                        imageUrl =
                            "https://guptagarments.waifly.com" +
                            imageUrl;
                    }

                    // =============================================
                    // SHOW MAIN PRODUCT IMAGE
                    // =============================================

                    productVisual.innerHTML = `
                        <img
                            src="${imageUrl}"
                            alt="${databaseProduct.product_name}"
                            style="
                                width: 100%;
                                height: 100%;
                                object-fit: contain;
                                display: block;
                            "
                        >
                    `;

                    // Save main image URL
                    productVisual.dataset.dbImageUrl =
                        imageUrl;

                    // Save database product ID
                    productVisual.dataset.dbProductId =
                        databaseProduct.id;

                }
            );

        })
        .catch(function (error) {

            console.error(
                "❌ Product Image Loading Error:",
                error
            );

        });
}

loadProductImagesFromDatabase();
/* =====================================================
   STEP 4A — LOAD PRODUCTS FROM waifly API
   ===================================================== */

const PRODUCT_API_URL =
    "https://guptagarments.waifly.com/api/products";

let databaseProducts = [];

/* =====================================================
   WISHLIST — CUSTOMER LOGIN CHECK
   ===================================================== */

const WISHLIST_API_URL =
    "https://guptagarments.waifly.com/api/wishlist";

let savedWishlistProductIds =
    new Set();


function isCustomerLoggedIn() {

    return (
        localStorage.getItem(
            "guptaCustomerLoggedIn"
        ) === "true" &&
        !!localStorage.getItem(
            "guptaCustomerId"
        )
    );

}


/* =====================================================
   WISHLIST — SET HEART STATE
   ===================================================== */

function setWishlistButtonState(
    wishlistButton,
    isAdded
) {

    if (!wishlistButton) {
        return;
    }


    const icon =
        wishlistButton.querySelector("i");


    if (isAdded) {

        if (icon) {
            icon.className =
                "fa-solid fa-heart";
        }

        wishlistButton.style.color =
            "#d1002f";

        wishlistButton.setAttribute(
            "aria-label",
            "Remove from Wishlist"
        );

        wishlistButton.setAttribute(
            "title",
            "Remove from Wishlist"
        );

    } else {

        if (icon) {
            icon.className =
                "fa-regular fa-heart";
        }

        wishlistButton.style.color =
            "";

        wishlistButton.setAttribute(
            "aria-label",
            "Add to Wishlist"
        );

        wishlistButton.setAttribute(
            "title",
            "Add to Wishlist"
        );

    }

}


/* =====================================================
   WISHLIST — AUTOMATIC PRODUCT BUTTON
   ===================================================== */

function addWishlistButtonsToProducts() {

    const productCards =
        document.querySelectorAll(
            ".product-card"
        );


    productCards.forEach(
        function (card) {

            let wishlistButton =
                card.querySelector(
                    ".wishlist-btn"
                );


            /* =================================================
               CREATE WISHLIST BUTTON
               ================================================= */

            if (!wishlistButton) {

                const productImage =
                    card.querySelector(
                        ".product-image"
                    );


                if (!productImage) {
                    return;
                }


                wishlistButton =
                    document.createElement(
                        "button"
                    );


                wishlistButton.type =
                    "button";


                wishlistButton.className =
                    "wishlist-btn";


                wishlistButton.setAttribute(
                    "aria-label",
                    "Add to Wishlist"
                );


                wishlistButton.setAttribute(
                    "title",
                    "Add to Wishlist"
                );


                wishlistButton.innerHTML =
                    '<i class="fa-regular fa-heart"></i>';


                productImage.appendChild(
                    wishlistButton
                );

            }


            /* =================================================
               FIND PRODUCT NAME
               ================================================= */

            const productName =
                card.getAttribute(
                    "data-product"
                ) ||
                (
                    card.querySelector("h3")
                        ?.textContent
                        .trim() || ""
                );


            if (!productName) {
                return;
            }


            /* =================================================
               FIND DATABASE PRODUCT
               ================================================= */

            const databaseProduct =
                databaseProducts.find(
                    function (item) {

                        return (
                            item.product_name ===
                            productName
                        );

                    }
                );


            if (!databaseProduct) {
                return;
            }


            /* =================================================
               SAVE DATABASE PRODUCT ID
               ================================================= */

            const productId =
                Number(
                    databaseProduct.id
                );


            if (!productId) {
                return;
            }


            card.setAttribute(
                "data-product-id",
                productId
            );


            /* =================================================
               RESTORE HEART STATE
               ================================================= */

            const isAdded =
                savedWishlistProductIds.has(
                    productId
                );


            setWishlistButtonState(
                wishlistButton,
                isAdded
            );

        }
    );

}


/* =====================================================
   WISHLIST — LOAD SAVED PRODUCTS
   ===================================================== */

async function loadCustomerWishlistState() {

    const customerId =
        localStorage.getItem(
            "guptaCustomerId"
        );


    if (!customerId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${WISHLIST_API_URL}/${encodeURIComponent(customerId)}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            console.error(
                "❌ Wishlist load failed:",
                result.message
            );

            return;

        }


        savedWishlistProductIds =
            new Set();


        const wishlist =
            Array.isArray(
                result.wishlist
            )
                ? result.wishlist
                : [];


        wishlist.forEach(
            function (item) {

                const productId =
                    Number(
                        item.product_id
                    );


                if (productId) {

                    savedWishlistProductIds.add(
                        productId
                    );

                }

            }
        );


        /* Restore hearts */
        addWishlistButtonsToProducts();


    }
    catch (error) {

        console.error(
            "❌ Wishlist state load error:",
            error
        );

    }

}


/* =====================================================
   WISHLIST — HEART CLICK
   ===================================================== */

document.addEventListener(
    "click",
    async function (event) {

        const wishlistButton =
            event.target.closest(
                ".wishlist-btn"
            );


        if (!wishlistButton) {
            return;
        }


        const customerId =
            localStorage.getItem(
                "guptaCustomerId"
            );


        if (!customerId) {

            alert(
                "Please login to add products to your wishlist."
            );

            return;

        }


        const productCard =
            wishlistButton.closest(
                ".product-card"
            );


        if (!productCard) {
            return;
        }


        const productName =
            productCard.getAttribute(
                "data-product"
            ) ||
            (
                productCard.querySelector("h3")
                    ?.textContent
                    .trim() || ""
            );


        if (!productName) {

            alert(
                "Product information not found."
            );

            return;

        }


        const product =
            databaseProducts.find(
                function (item) {

                    return (
                        item.product_name ===
                        productName
                    );

                }
            );


        if (!product) {

            alert(
                "Product information not found."
            );

            return;

        }


        const productId =
            Number(product.id);


        if (!productId) {

            alert(
                "Product ID not found."
            );

            return;

        }


        const alreadyAdded =
            savedWishlistProductIds.has(
                productId
            );


        try {

            wishlistButton.disabled =
                true;


            /* =================================================
               REMOVE FROM WISHLIST
               ================================================= */

            if (alreadyAdded) {

                const response =
                    await fetch(
                        `${WISHLIST_API_URL}/${encodeURIComponent(customerId)}/${encodeURIComponent(productId)}`,
                        {
                            method:
                                "DELETE"
                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Unable to remove product from wishlist."
                    );

                }


                savedWishlistProductIds.delete(
                    productId
                );


                setWishlistButtonState(
                    wishlistButton,
                    false
                );


                alert(
                    "Product removed from wishlist."
                );


                return;

            }


            /* =================================================
               ADD TO WISHLIST
               ================================================= */

            const response =
                await fetch(
                    WISHLIST_API_URL,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                customer_id:
                                    Number(
                                        customerId
                                    ),

                                product_id:
                                    productId
                            })
                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Unable to add product to wishlist."
                );

            }


            savedWishlistProductIds.add(
                productId
            );


            setWishlistButtonState(
                wishlistButton,
                true
            );


            alert(
                "Product added to wishlist."
            );

        }
        catch (error) {

            console.error(
                "❌ Wishlist error:",
                error
            );


            alert(
                error.message ||
                "Unable to connect to the server."
            );

        }
        finally {

            wishlistButton.disabled =
                false;

        }

    }
);


/* =====================================================
   WISHLIST — INITIAL SETUP
   ===================================================== */

addWishlistButtonsToProducts();

loadCustomerWishlistState();
/* ================= LOAD DATABASE PRODUCTS ================= */

async function loadDatabaseProducts() {

    try {

        console.log("⏳ Loading products from waifly API...");

        const response =
            await fetch(PRODUCT_API_URL);

        if (!response.ok) {

            throw new Error(
                "Product API request failed"
            );

        }

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                "Product API returned unsuccessful response"
            );

        }
databaseProducts = data.products || [];

console.log("✅ Products loaded from MySQL:", databaseProducts);

syncDatabaseProductsWithCards();
    } catch (error) {

        console.error(
            "❌ Unable to load products from MySQL:",
            error
        );

    }

}
loadDatabaseProducts();

/* =====================================================
   STEP 4B — DATABASE PRODUCT DATA CHECK
   ===================================================== */

if (databaseProducts.length > 0) {

    databaseProducts.forEach(function (product) {

        console.log(
            "📦 Product:",
            product.product_name,
            "| Category:",
            product.category,
            "| Gender:",
            product.gender,
            "| Season:",
            product.season,
            "| Price:",
            product.price,
            "| Sizes:",
            product.sizes
        );

    });

}
 function syncDatabaseProductsWithCards() {

    console.log(
        "🧩 Total HTML product cards:",
        document.querySelectorAll(".product-card").length
    );

    if (!databaseProducts.length) {

        console.warn(
            "⚠️ No database products available for sync."
        );

        return;
    }


    const productsGrid =
        document.querySelector("#productsGrid");

    if (!productsGrid) {
        return;
    }


    /* =====================================================
       GET CURRENT HTML PRODUCT CARDS
       ===================================================== */

    const initialCards =
        Array.from(
            productsGrid.querySelectorAll(
                ".product-card"
            )
        );


    /*
       Normalize product names so small differences
       like extra spaces / hyphens do not create
       duplicate cards.
    */

    function normalizeProductName(name) {

        return (name || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    }


    /*
       Special product name matching.
    */

    function productNamesMatch(
        htmlName,
        dbName
    ) {

        const htmlNormalized =
            normalizeProductName(
                htmlName
            );

        const dbNormalized =
            normalizeProductName(
                dbName
            );


        if (
            htmlNormalized ===
            dbNormalized
        ) {

            return true;

        }


        /*
           Girls Nighty / Gown
           and
           Women Nighty / Gown
           are same product.
        */

        if (
            (
                htmlNormalized ===
                normalizeProductName(
                    "Girls Nighty / Gown"
                )
            ) &&
            (
                dbNormalized ===
                normalizeProductName(
                    "Women Nighty / Gown"
                )
            )
        ) {

            return true;

        }


        return false;

    }


    /*
       Cards which are already connected
       with a database product.
    */

    const matchedCards =
        new Set();


    /* =====================================================
       PROCESS DATABASE PRODUCTS
       ===================================================== */

    databaseProducts.forEach(
        function (dbProduct) {

            const dbProductId =
                String(
                    dbProduct.id
                );


            /*
               First try database ID.

               This is important because if a product
               was already synced earlier, its same card
               should be reused.
            */

            let matchingCards =
                initialCards.filter(
                    function (card) {

                        return (
                            String(
                                card.dataset.dbProductId ||
                                ""
                            ) ===
                            dbProductId
                        );

                    }
                );


            /*
               If ID match is not available,
               match using product name.
            */

            if (
                matchingCards.length === 0
            ) {

                matchingCards =
                    initialCards.filter(
                        function (card) {

                            const title =
                                card.querySelector(
                                    "h3"
                                );

                            if (!title) {
                                return false;
                            }


                            return productNamesMatch(
                                title.textContent,
                                dbProduct.product_name
                            );

                        }
                    );

            }


            let productCard =
                matchingCards[0];


            /* =================================================
               IF CARD DOES NOT EXIST
               CREATE ONE
               ================================================= */

            if (!productCard) {

                const templateCard =
                    initialCards[0];

                if (!templateCard) {
                    return;
                }


                productCard =
                    templateCard.cloneNode(
                        true
                    );


                productCard.classList.add(
                    "database-product-card"
                );


                productCard.style.display =
                    "";


                productCard.classList.remove(
                    "out-of-stock"
                );


                productCard.classList.add(
                    "product-visible"
                );


                productsGrid.appendChild(
                    productCard
                );


                console.log(
                    "🆕 New product card created:",
                    dbProduct.product_name
                );

            }


            /* =================================================
               REMOVE DUPLICATE CARDS
               ================================================= */

            matchingCards
                .slice(1)
                .forEach(
                    function (duplicateCard) {

                        duplicateCard.remove();

                        console.log(
                            "🗑️ Duplicate product card removed:",
                            dbProduct.product_name
                        );

                    }
                );


            /*
               Mark this card as connected
               with database product.
            */

            matchedCards.add(
                productCard
            );


            productCard.dataset.dbProductId =
                dbProductId;


            /* =================================================
               PRODUCT DATA ATTRIBUTES
               ================================================= */

            productCard.setAttribute(
                "data-product",
                dbProduct.product_name || ""
            );

            productCard.setAttribute(
                "data-category",
                dbProduct.category || ""
            );

            productCard.setAttribute(
                "data-gender",
                dbProduct.gender || ""
            );

            productCard.setAttribute(
                "data-season",
                dbProduct.season || ""
            );

            productCard.setAttribute(
                "data-price",
                dbProduct.price || ""
            );

            productCard.setAttribute(
                "data-description",
                dbProduct.description || ""
            );

            productCard.setAttribute(
                "data-stock-status",
                dbProduct.stock_status || "in-stock"
            );


            /* =================================================
               PRODUCT TITLE
               ================================================= */

            const titleElement =
                productCard.querySelector(
                    "h3"
                );

            if (titleElement) {

                titleElement.textContent =
                    dbProduct.product_name;

            }


            /* =================================================
               PRODUCT PRICE
               ================================================= */

            const priceElement =
                productCard.querySelector(
                    ".price"
                );

            if (priceElement) {

                priceElement.textContent =
                    "₹" +
                    Number(
                        dbProduct.price || 0
                    ).toLocaleString(
                        "en-IN"
                    );

            }


            /* =================================================
               PRODUCT SIZES
               ================================================= */

            const sizesElement =
                productCard.querySelector(
                    ".product-info p"
                );

            if (sizesElement) {

                sizesElement.textContent =
                    dbProduct.sizes
                        ? "Sizes: " +
                          dbProduct.sizes
                        : "Sizes: Please confirm";

            }


            /* =================================================
               PRODUCT IMAGE
               ================================================= */

            const productImageContainer =
                productCard.querySelector(
                    ".product-image"
                );


            if (productImageContainer) {

                /*
                   Remove any old dynamically created
                   database images.
                */

                productImageContainer
                    .querySelectorAll(
                        ".database-product-image"
                    )
                    .forEach(
                        function (oldImage) {

                            oldImage.remove();

                        }
                    );


                /*
                   Hide dummy product visual.
                */

                const dummyProduct =
                    productImageContainer.querySelector(
                        ".dummy-product"
                    );

                if (dummyProduct) {

                    dummyProduct.style.display =
                        "none";

                }


                /*
                   Use the existing .product-photo
                   from the HTML card.
                */

                const productImage =
                    productImageContainer.querySelector(
                        ".product-photo"
                    );


                if (
                    productImage &&
                    dbProduct.image_url &&
                    dbProduct.image_url
                        .trim() !== ""
                ) {

                    let imageUrl =
                        dbProduct.image_url.trim();


                    /*
                       Convert relative URL
                       into live API URL.
                    */

                    if (
                        imageUrl.startsWith("/")
                    ) {

                        imageUrl =
                            "https://guptagarments.waifly.com" +
                            imageUrl;

                    }


                    productImage.src =
                        imageUrl +
                        (
                            imageUrl.includes("?")
                                ? "&"
                                : "?"
                        ) +
                        "v=" +
                        Date.now();


                    productImage.alt =
                        dbProduct.product_name ||
                        "Product";


                    productImage.loading =
                        "lazy";


                    productImage.style.display =
                        "block";


                    productImage.style.width =
                        "100%";


                    productImage.style.height =
                        "100%";


                    productImage.style.objectFit =
                        "contain";


                    productImage.dataset.dbImageUrl =
                        imageUrl;


                    productImage.dataset.dbProductId =
                        dbProductId;

                }

                else if (productImage) {

                    /*
                       No image in database =
                       do not show old hard-coded image.
                    */

                    productImage.style.display =
                        "none";


                    productImage.removeAttribute(
                        "src"
                    );


                    productImage.removeAttribute(
                        "alt"
                    );

                }

            }


            /* =================================================
               PRODUCT VISIBILITY
               ================================================= */

            if (
                Number(
                    dbProduct.is_visible
                ) === 0
            ) {

                productCard.style.display =
                    "none";

            }
            else {

                productCard.style.display =
                    "";

            }


            console.log(
                "✅ Product synced:",
                dbProduct.product_name
            );

        }
    );


    /* =====================================================
       REMOVE HTML CARDS WHICH DO NOT EXIST IN DATABASE
       ===================================================== */

    initialCards.forEach(
        function (card) {

            if (
                !matchedCards.has(card) &&
                card.isConnected
            ) {

                const title =
                    card.querySelector("h3");

                const oldProductName =
                    title
                        ? title.textContent.trim()
                        : "Unknown Product";


                card.remove();


                console.log(
                    "🗑️ Old HTML product removed:",
                    oldProductName
                );

            }

        }
    );


    /*
       Refresh productCards variable so filters,
       search and other product functions also see
       the final database product cards.
    */

    productCards =
        document.querySelectorAll(
            ".product-card"
        );


    console.log(
        "🎯 Database product sync completed."
    );


    addWishlistButtonsToProducts();

}

/* =====================================================
       PRODUCT CATEGORIES
       ===================================================== */

    const productCategories = {

        "Kids Denim Jeans": [
            "jeans",
            "boys"
        ],

        "Boys Printed T-Shirt": [
            "tshirts",
            "boys"
        ],

        "Boys Check Shirt": [
            "shirts",
            "boys"
        ],

        "Girls Western Dress": [
            "western-dress",
            "girls"
        ],

        "Kids Jacket": [
            "jacket",
            "boys"
        ],

        "Girls Cardigan": [
            "cardigan",
            "girls"
        ],

        "Boys Casual Lower": [
            "lower",
            "boys"
        ],

        "Girls Nighty / Gown": [
            "gown",
            "girls"
        ],

        "Boys Stylish Divider": [
            "divider",
            "boys"
        ],

        "Girls Jeans Top": [
            "jeans-top",
            "girls"
        ]

    };


    /* =====================================================
       GET PRODUCT CATEGORY
       ===================================================== */
function getProductCategory(productCard) {

    if (!productCard) {
        return [];
    }

    const category =
        productCard.getAttribute("data-category");

    const gender =
        productCard.getAttribute("data-gender");

    const categories = [];
 /* Product Category */
    if (category) {
        categories.push(category.toLowerCase().trim());
    }
 /* Product Gender */
    if (gender) {
        categories.push(gender.toLowerCase().trim());
    }

    return categories;

}
   
/* =====================================================
   STEP 3 — SEASON FILTER
   ===================================================== */

/* Current selected season */
let currentCategory = "all";
let currentSeason = "all";
/* =====================================================
   GET PRODUCT SEASONS
   ===================================================== */

function getProductSeasons(productCard) {

    if (!productCard) {
        return [];
    }

    const seasonData =
        productCard.getAttribute("data-season");

    if (!seasonData) {
        return [];
    }

    return seasonData
        .toLowerCase()
        .split(/[\s,|]+/)
        .map(function (season) {
            return season.trim();
        })
        .filter(Boolean);

}


/* =====================================================
   SET SEASON FILTER
   ===================================================== */

function setSeasonFilter(season) {

    season = (season || "").toLowerCase().trim();

    if (
        season !== "summer" &&
        season !== "winter"
    ) {
        currentSeason = "all";
    } else {
        currentSeason = season;
    }

    /* Re-apply current category + new season */
    filterProducts(currentCategory);

    /* Active season button */
    setActiveSeasonButton(currentSeason);

}


/* =====================================================
   SEASON MATCH
   ===================================================== */

function productMatchesSeason(productCard) {

    if (currentSeason === "all") {
        return true;
    }

    const seasons =
        getProductSeasons(productCard);

    return seasons.includes(currentSeason);

}

/* =====================================================
   FILTER PRODUCTS
   CATEGORY + SEASON
   ===================================================== */

function filterProducts(category) {

    /* Save current category */
    currentCategory = category || "all";

    productCards.forEach(function (product, index) {

        const categories =
            getProductCategory(product);

/* ================= CATEGORY MATCH ================= */

let categoryMatch = false;


/* ALL PRODUCTS */

if (currentCategory === "all") {

    categoryMatch = true;

}


/* KIDS = BOYS + GIRLS */

else if (currentCategory === "kids") {

    categoryMatch =
        categories.includes("boys") ||
        categories.includes("girls");

}


/* WOMEN */

else if (currentCategory === "women") {

    categoryMatch =
        categories.includes("women");

}


/* MEN */

else if (currentCategory === "men") {

    categoryMatch =
        categories.includes("men");

}

/* INDIVIDUAL CATEGORY */

else {

    categoryMatch =
        categories.includes(
            currentCategory
        );


    /* =====================================================
       WOMEN CATEGORY SPECIAL MATCH
       ===================================================== */

    if (currentCategory === "women-cardigan") {

        categoryMatch =
            categories.includes("cardigan") &&
            categories.includes("women");

    }


    if (currentCategory === "women-nighty-gown") {

        categoryMatch =
            (
                categories.includes("gown") ||
                categories.includes("women-nighty-gown")
            ) &&
            categories.includes("women");

    }


    if (currentCategory === "women-bra") {

        categoryMatch =
            categories.includes("women-bra") &&
            categories.includes("women");

    }


    if (currentCategory === "women-panty") {

        categoryMatch =
            categories.includes("women-panty") &&
            categories.includes("women");

    }


    if (currentCategory === "women-socks") {

        categoryMatch =
            categories.includes("women-socks") &&
            categories.includes("women");

    }

}


        /* ================= SEASON MATCH ================= */

        const seasonMatch =
            productMatchesSeason(product);


        /* ================= FINAL MATCH ================= */
const visibilityStatus =
    product.getAttribute("data-is-visible");

const isVisible =
    visibilityStatus !== "0";

const shouldShow =
    isVisible &&
    categoryMatch &&
    seasonMatch;

        /* ================= SHOW / HIDE ================= */

        if (shouldShow) {

            product.style.display = "";

            setTimeout(function () {

                product.classList.add(
                    "product-visible"
                );

            }, index * 60);

        } else {

            product.classList.remove(
                "product-visible"
            );

            product.style.display = "none";

        }

    });


    /* =================================================
       NO PRODUCTS MESSAGE
       ================================================= */

    const visibleProducts =
        Array.from(productCards).filter(function (product) {

            return product.style.display !== "none";

        });


    const noProducts =
        document.querySelector("#noProducts");


    if (noProducts) {

        noProducts.style.display =
            visibleProducts.length === 0
                ? "block"
                : "none";

    }


    /* =================================================
       FILTER STATUS
       ================================================= */

    const filterStatus =
        document.querySelector("#filterStatus");

    const filterName =
        document.querySelector("#filterName");


    if (filterStatus && filterName) {

        if (
            currentCategory === "all" &&
            currentSeason === "all"
        ) {

            filterStatus.style.display = "none";

        } else {

            filterStatus.style.display = "flex";

            let statusText = "";


            /* Category name */
            if (currentCategory !== "all") {

                statusText =
                    currentCategory
                        .replace("-", " ")
                        .replace(/\b\w/g, function (letter) {
                            return letter.toUpperCase();
                        });

            }


            /* Season name */
            if (currentSeason !== "all") {

                const seasonName =
                    currentSeason.charAt(0).toUpperCase() +
                    currentSeason.slice(1);


                if (statusText) {

                    statusText +=
                        " • " + seasonName;

                } else {

                    statusText =
                        seasonName;

                }

            }


            filterName.textContent =
                statusText;

        }

    }


    /* =================================================
       SCROLL TO PRODUCTS
       ================================================= */

    const productsSection =
        document.querySelector("#new-arrivals");


    if (productsSection) {

        productsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}
/* =====================================================
   SEASON FILTER BUTTONS
   ===================================================== */

const seasonFilterButtons =
    document.querySelectorAll(
        "[data-season-filter]"
    );


seasonFilterButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            const season =
                button.getAttribute(
                    "data-season-filter"
                );


            if (!season) {
                return;
            }


            setSeasonFilter(season);

        }
    );

});


/* =====================================================
   ACTIVE SEASON BUTTON
   ===================================================== */

function setActiveSeasonButton(season) {

    seasonFilterButtons.forEach(function (button) {

        button.classList.remove(
            "active-season"
        );

    });


    if (season === "all") {
        return;
    }


    seasonFilterButtons.forEach(function (button) {

        const buttonSeason =
            button.getAttribute(
                "data-season-filter"
            );


        if (
            buttonSeason &&
            buttonSeason.toLowerCase() === season
        ) {

            button.classList.add(
                "active-season"
            );

        }

    });

}
   
// =====================================================
// LOAD CATEGORIES FROM DATABASE
// =====================================================

async function loadPublicCategories() {

    const categoryContainer =
        document.querySelector(
            ".category-container"
        );

    const extraCategories =
        document.querySelector(
            "#extraCategories"
        );

    if (!categoryContainer) {
        return;
    }

    try {

        const response =
            await fetch(
                "https://guptagarments.waifly.com/api/public/categories"
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load categories."
            );

        }

        // Remove existing hard-coded categories
        categoryContainer.innerHTML = "";

        if (extraCategories) {
            extraCategories.innerHTML = "";
        }

        result.categories.forEach(
            function (category, index) {

                const categoryCard =
                    document.createElement("a");

                categoryCard.href =
                    "#new-arrivals";

                categoryCard.className =
                    "category-card";

                categoryCard.setAttribute(
                    "data-filter",
                    category.slug
                );

                const imageUrl =
                    category.image_url ||
                    "images/categories/default.png";

                categoryCard.innerHTML = `
                    <div class="category-image">
                        <img
                            src="${imageUrl}"
                            alt="${category.name}"
                            loading="lazy">
                    </div>

                    <span>
                        ${category.name}
                    </span>
                `;

                /*
                 * First 10 categories stay
                 * in the main category area.
                 * Remaining categories go
                 * inside View All section.
                 */

                if (index < 10) {

                    categoryContainer.appendChild(
                        categoryCard
                    );

                } else {

                    categoryCard.classList.add(
                        "extra-category"
                    );

                    if (extraCategories) {

                        extraCategories.appendChild(
                            categoryCard
                        );

                    }

                }

            }
        );

        // Rebind category click events
        bindCategoryCardEvents();

    }
    catch (error) {

        console.error(
            "❌ Public category load error:",
            error
        );

    }

}


// =====================================================
// CATEGORY CARD CLICK
// =====================================================

function bindCategoryCardEvents() {

    const categoryCards =
        document.querySelectorAll(
            ".category-card"
        );

    categoryCards.forEach(
        function (categoryCard) {

            categoryCard.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    const filter =
                        categoryCard.getAttribute(
                            "data-filter"
                        );

                    if (!filter) {
                        return;
                    }

                    filterProducts(filter);

                    setActiveCategory(
                        categoryCard
                    );

                }
            );

        }
    );

}


// Load database categories
loadPublicCategories();

    /* =====================================================
       ACTIVE CATEGORY
       ===================================================== */

    function setActiveCategory(activeCard) {

        categoryCards.forEach(function (card) {

            card.classList.remove(
                "active-category"
            );

        });


        if (activeCard) {

            activeCard.classList.add(
                "active-category"
            );

        }

    }


    /* =====================================================
       VIEW ALL
       ===================================================== */

    const viewAll =
        document.querySelector(".view-all");

    if (viewAll) {

        viewAll.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                filterProducts("all");

                setActiveCategory(null);

            }
        );

    }
/* =====================================================
   VIEW ALL CATEGORIES
   ===================================================== */

const viewAllCategoriesBtn =
    document.querySelector(
        "#viewAllCategoriesBtn"
    );

const categoriesSection =
    document.querySelector(
        "#categories"
    );


if (
    viewAllCategoriesBtn &&
    categoriesSection
) {

    viewAllCategoriesBtn.addEventListener(
        "click",
        function () {

            categoriesSection.classList.toggle(
                "show-all-categories"
            );


            const isOpen =
                categoriesSection.classList.contains(
                    "show-all-categories"
                );


            if (isOpen) {

                viewAllCategoriesBtn.querySelector(
                    "span"
                ).textContent =
                    "SHOW LESS CATEGORIES";

            } else {

                viewAllCategoriesBtn.querySelector(
                    "span"
                ).textContent =
                    "VIEW ALL CATEGORIES";

            }

        }
    );

}

    /* =====================================================
       EXPLORE COLLECTION
       ===================================================== */

    const exploreButton =
        document.querySelector(".btn-primary");

    if (exploreButton) {

        exploreButton.addEventListener(
            "click",
            function () {

                filterProducts("all");

                setActiveCategory(null);

            }
        );

    }


    /* =====================================================*
*       CLEAR FILTER
*       ===================================================== */

const clearFilter =
    document.querySelector("#clearFilter");

if (clearFilter) {
    clearFilter.addEventListener(
        "click",
        function () {

            /* Clear category filter */
            currentCategory = "all";

            /* Clear season filter */
            currentSeason = "all";

            /* Show all products */
            filterProducts("all");

            /* Remove active category */
            setActiveCategory(null);

            /* Remove active season */
            setActiveSeasonButton("all");
        }
    );
}


    /* =====================================================
       SHOW ALL PRODUCTS BUTTON
       ===================================================== */

    const showAllProducts =
        document.querySelector("#showAllProducts");

    if (showAllProducts) {

        showAllProducts.addEventListener(
            "click",
            function () {

                filterProducts("all");

                setActiveCategory(null);

            }
        );

    }


    /* =====================================================
       PRODUCT WHATSAPP
       SMART PRODUCT-SPECIFIC MESSAGE
       ===================================================== */

    const whatsappButtons =
        document.querySelectorAll(
            ".product-whatsapp"
        );


    whatsappButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const productCard =
                    button.closest(
                        ".product-card"
                    );

                if (!productCard) {
                    return;
                }


                const productName =
                    productCard
                        .querySelector("h3")
                        ?.textContent
                        .trim();


                const productPrice =
                    productCard
                        .querySelector(".price")
                        ?.textContent
                        .trim();


                const productSizes =
                    productCard
                        .querySelector(".product-info p")
                        ?.textContent
                        .trim();


                if (!productName) {
                    return;
                }


                /* =========================================
                   SMART WHATSAPP MESSAGE
                   ========================================= */

const message =
    "Hello Gupta Garments \uD83D\uDC4B\n\n" +
    "I am interested in the following product:\n\n" +
    "\uD83D\uDED2 Product: " +
    productName +
    "\n" +
    "\uD83D\uDCB0 Price: " +
    (productPrice || "Please confirm") +
    "\n" +
    "\uD83D\uDCCF " +
    (productSizes || "Size details not available") +
    "\n\n" +
    "Please confirm:\n" +
    "\u2705 Availability\n" +
    "\u2705 Available sizes\n" +
    "\u2705 Any other details\n\n" +
    "Thank you!";


const whatsappURL =
    "https://wa.me/918218403183?text=" +
    encodeURIComponent(message);


                /*
                   Update button URL
                   */

                button.setAttribute(
                    "href",
                    whatsappURL
                );

            }
        );

    });
/* =====================================================
   STEP 3C — BLOCK OUT OF STOCK WHATSAPP ORDER
   ===================================================== */

whatsappButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function (event) {

            const productCard =
                button.closest(".product-card");

            if (!productCard) {
                return;
            }

            const stockStatus =
                (
                    productCard.getAttribute(
                        "data-stock-status"
                    ) || "in-stock"
                )
                    .toLowerCase()
                    .trim();

            if (stockStatus === "out-of-stock") {

                event.preventDefault();

                alert(
                    "🔴 This product is currently OUT OF STOCK.\n\n" +
                    "Please contact Gupta Garments for availability."
                );

                return;
            }

        }
    );

});

    /* =====================================================
       NAVIGATION WHATSAPP BUTTONS
       ===================================================== */

    const whatsappLinks =
        document.querySelectorAll(
            ".nav-whatsapp, .btn-whatsapp, .footer-whatsapp, .floating-whatsapp"
        );


    whatsappLinks.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

     const message =
    "Hello Gupta Garments \uD83D\uDC4B\n\n" +
    "I would like to know more about your Kids Wear collection.\n\n" +
    "\uD83D\uDED2 Please share:\n" +
    "\u2705 Available products\n" +
    "\u2705 Prices\n" +
    "\u2705 Available sizes\n\n" +
    "Thank you!";


                const whatsappURL =
                    "https://wa.me/918218403183?text=" +
                    encodeURIComponent(message);


                button.setAttribute(
                    "href",
                    whatsappURL
                );

            }
        );

    });


    /* =====================================================
       MOBILE DROPDOWN
       ===================================================== */

    const dropdown =
        document.querySelector(".dropdown");

    const dropdownLink =
        document.querySelector(
            ".dropdown > a"
        );


    if (dropdown && dropdownLink) {

        dropdownLink.addEventListener(
            "click",
            function (event) {

                if (window.innerWidth <= 900) {

                    event.preventDefault();

                    dropdown.classList.toggle(
                        "dropdown-open"
                    );

                }

            }
        );

    }


    /* =====================================================
       DROPDOWN FILTER LINKS
       ===================================================== */

    const filterLinks =
        document.querySelectorAll(
            "[data-filter-link]"
        );


    filterLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                const filter =
                    link.getAttribute(
                        "data-filter-link"
                    );

                if (!filter) {
                    return;
                }

                filterProducts(filter);

                setActiveCategory(null);

            }
        );

    });


    /* =====================================================
       BOYS / GIRLS COLLECTION FILTER
       ===================================================== */

    const genderFilterButtons =
        document.querySelectorAll(
            "[data-gender-filter]"
        );


    genderFilterButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                const gender =
                    button.getAttribute(
                        "data-gender-filter"
                    );

                if (!gender) {
                    return;
                }

                filterProducts(gender);

                setActiveCategory(null);

            }
        );

    });


    /* =====================================================
       SCROLL REVEAL ANIMATION
       Smooth - Not Overdone
       ===================================================== */

    const animatedElements =
        document.querySelectorAll(
            ".category-card, .product-card, .collection-section, .about-section, .service-item"
        );


    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                function (entries, observer) {

                    entries.forEach(function (entry) {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "scroll-visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -40px 0px"
                }
            );


        animatedElements.forEach(function (element) {

            element.classList.add(
                "scroll-hidden"
            );

            observer.observe(element);

        });

    } else {

        animatedElements.forEach(function (element) {

            element.classList.add(
                "scroll-visible"
            );

        });

    }


    /* =====================================================
       PRODUCT CARD HOVER FEEDBACK
       ===================================================== */

    productCards.forEach(function (card) {

        card.addEventListener(
            "mouseenter",
            function () {

                card.classList.add(
                    "product-hover"
                );

            }
        );


        card.addEventListener(
            "mouseleave",
            function () {

                card.classList.remove(
                    "product-hover"
                );

            }
        );

    });


    /* =====================================================
       FLOATING WHATSAPP TOOLTIP
       ===================================================== */

    const floatingWhatsapp =
        document.querySelector(
            ".floating-whatsapp"
        );


    if (floatingWhatsapp) {

        /*
           Create tooltip automatically.
           HTML mein extra code add karne ki
           zarurat nahi.
        */

        const tooltip =
            document.createElement("span");

        tooltip.className =
            "whatsapp-tooltip";

        tooltip.textContent =
            "Chat with us";


        floatingWhatsapp.appendChild(
            tooltip
        );


        /* Accessibility */

        floatingWhatsapp.setAttribute(
            "title",
            "Chat with us on WhatsApp"
        );

    }


    /* =====================================================
       SMOOTH INTERNAL LINKS
       ===================================================== */

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    internalLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                const targetId =
                    link.getAttribute("href");

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (target) {

                    /*
                       CSS scroll-behavior bhi
                       support karega.
                    */

                    target.classList.add(
                        "section-highlight"
                    );


                    setTimeout(function () {

                        target.classList.remove(
                            "section-highlight"
                        );

                    }, 900);

                }

            }
        );

    });

/* =====================================================
   INITIAL STATE
   DATABASE VISIBILITY AWARE
   ===================================================== */

productCards.forEach(function (product) {

    /*
     * Database se hidden product ko
     * customer website par show nahi karna.
     */

    const stockStatus =
        (
            product.getAttribute(
                "data-stock-status"
            ) || "in-stock"
        )
            .toLowerCase()
            .trim();

    /*
     * Visibility attribute database sync
     * ke time set kiya jayega.
     */

    const visibilityStatus =
        product.getAttribute(
            "data-is-visible"
        );

    /*
     * Hidden product
     */

    if (visibilityStatus === "0") {

        product.style.display = "none";

        product.classList.remove(
            "product-visible"
        );

        return;
    }

    /*
     * Visible product
     */

    product.style.display = "";

    product.classList.add(
        "product-visible"
    );

});

    /* =====================================================
       CONSOLE
       ===================================================== */

    console.log(
        "Gupta Garments website JavaScript loaded successfully."
    );
    /* =====================================================
       STEP 2.2 — PRODUCT DETAILS MODAL
       ===================================================== */

    const productModal =
        document.querySelector("#productModal");

    const productModalClose =
        document.querySelector("#productModalClose");

    const productModalOverlay =
        document.querySelector("#productModalOverlay");

    const viewDetailsButtons =
        document.querySelectorAll(".view-details-btn");
/* =====================================================
   STEP 2.3-C — CURRENT REVIEW PRODUCT
   ===================================================== */

let currentReviewProduct = "";

    /* =====================================================
       PRODUCT DESCRIPTIONS
       ===================================================== */

    const productDescriptions = {

        "Kids Denim Jeans":
            "Stylish and comfortable denim jeans designed for kids. Perfect for casual everyday wear.",

        "Boys Printed T-Shirt":
            "Comfortable printed T-shirt with a trendy look. Perfect for everyday wear and casual outings.",

        "Boys Check Shirt":
            "Smart and stylish check shirt for boys. A comfortable choice for casual and special occasions.",

        "Girls Western Dress":
            "Beautiful western dress designed for girls with a stylish and comfortable look.",

        "Kids Jacket":
            "Trendy kids jacket that adds a stylish layer to any outfit while keeping kids comfortable.",

        "Girls Cardigan":
            "Cute and comfortable cardigan for girls. Perfect for adding a stylish layer to everyday outfits.",

        "Boys Casual Lower":
            "Comfortable casual lower for boys, perfect for everyday activities, playtime and relaxed wear.",

        "Girls Nighty / Gown":
            "Comfortable and stylish nighty/gown designed for girls with a soft and easy-to-wear feel.",

        "Boys Stylish Divider":
            "Trendy and comfortable divider designed for boys who love a stylish casual look.",

        "Girls Jeans Top":
            "Stylish jeans top for girls that can be paired easily with jeans, skirts or other casual outfits."

    };


    /* =====================================================
       OPEN PRODUCT MODAL
       ===================================================== */

    viewDetailsButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const productCard =
                    button.closest(".product-card");

                if (!productCard || !productModal) {
                    return;
                }


                /* Product Name */

                const productName =
                    productCard
                        .querySelector("h3")
                        ?.textContent
                        .trim();


                /* Product Price */

                const productPrice =
                    productCard
                        .querySelector(".price")
                        ?.textContent
                        .trim();


                /* Product Sizes */

                const productSizes =
                    productCard
                        .querySelector(".product-info p")
                        ?.textContent
                        .trim();


                /* Product Image */

                const productImage =
                    productCard
                        .querySelector(".dummy-product");


                /* Modal Elements */

                const modalName =
                    document.querySelector(
                        "#modalProductName"
                    );

                const modalPrice =
                    document.querySelector(
                        "#modalProductPrice"
                    );

                const modalSizes =
                    document.querySelector(
                        "#modalProductSizes"
                    );

                const modalDescription =
                    document.querySelector(
                        "#modalProductDescription"
                    );

                const modalImage =
                    document.querySelector(
                        "#modalProductImage"
                    );

                const modalWhatsapp =
                    document.querySelector(
                        "#modalWhatsapp"
                    );
/* =====================================================
   STEP 3C — MODAL STOCK STATUS
   ===================================================== */

const productStockStatus =
    (
        productCard.getAttribute(
            "data-stock-status"
        ) || "in-stock"
    )
        .toLowerCase()
        .trim();


/* =========================================
   CREATE STOCK BADGE
   ========================================= */

let modalStockBadge =
    document.querySelector(
        "#dynamicModalStockBadge"
    );

if (!modalStockBadge) {

    modalStockBadge =
        document.createElement("span");

    modalStockBadge.id =
        "dynamicModalStockBadge";

    modalStockBadge.className =
        "modal-stock-badge";

}


/* =========================================
   SHOW / HIDE BADGE
   ========================================= */

if (productStockStatus === "out-of-stock") {

    modalStockBadge.textContent =
        "OUT OF STOCK";

    modalStockBadge.style.display =
        "inline-block";

} else {

    modalStockBadge.textContent =
        "";

    modalStockBadge.style.display =
        "none";

}


/* Put badge before product name */

if (
    modalName &&
    modalStockBadge.parentElement !== modalName.parentElement
) {

    modalName.parentElement.insertBefore(
        modalStockBadge,
        modalName
    );

}

                /* Fill Modal */

                if (modalName) {
                    modalName.textContent =
                        productName || "Product";
                }


                if (modalPrice) {
                    modalPrice.textContent =
                        productPrice || "Please confirm";
                }


                if (modalSizes) {
                    modalSizes.textContent =
                        productSizes || "Please confirm availability";
                }


                if (modalDescription) {
                    modalDescription.textContent =
                        productDescriptions[productName] ||
                        "Stylish and comfortable kids wear from Gupta Garments.";
                }
/* Copy Product Visual */

if (modalImage && productImage) {

    modalImage.textContent =
        productImage.textContent.trim();

    modalImage.className =
        "modal-dummy-product " +
        productImage.className
            .replace("dummy-product", "")
            .trim();

}



                /* WhatsApp Message */
/* =====================================================
   STEP 3C — MODAL WHATSAPP STOCK CONTROL
   ===================================================== */

if (modalWhatsapp && productName) {

    /* Save original button text only once */

    if (
        !modalWhatsapp.hasAttribute(
            "data-original-text"
        )
    ) {

        modalWhatsapp.setAttribute(
            "data-original-text",
            modalWhatsapp.textContent.trim()
        );

    }


    /* =========================================
       OUT OF STOCK
       ========================================= */

    if (
        productStockStatus ===
        "out-of-stock"
    ) {

        modalWhatsapp.textContent =
            "🔴 OUT OF STOCK";

        modalWhatsapp.classList.add(
            "modal-whatsapp-disabled"
        );

        modalWhatsapp.removeAttribute(
            "href"
        );

        modalWhatsapp.setAttribute(
            "aria-disabled",
            "true"
        );

        modalWhatsapp.onclick =
            function (event) {

                event.preventDefault();

                alert(
                    "🔴 This product is currently OUT OF STOCK.\n\n" +
                    "Please contact Gupta Garments for availability."
                );

            };

    }


    /* =========================================
       IN STOCK
       ========================================= */

    else {

        const message =
            "Hello Gupta Garments 👋\n\n" +
            "I am interested in the following product:\n\n" +
            "🛍️ Product: " +
            productName +
            "\n" +
            "💰 Price: " +
            (productPrice || "Please confirm") +
            "\n" +
            "📏 " +
            (productSizes ||
                "Size details not available") +
            "\n\n" +
            "Please confirm:\n" +
            "✅ Availability\n" +
            "✅ Available sizes\n" +
            "✅ Any other details\n\n" +
            "Thank you!";


        modalWhatsapp.href =
            "https://wa.me/918218403183?text=" +
            encodeURIComponent(message);


        modalWhatsapp.textContent =
            modalWhatsapp.getAttribute(
                "data-original-text"
            ) || "ORDER ON WHATSAPP";


        modalWhatsapp.classList.remove(
            "modal-whatsapp-disabled"
        );

        modalWhatsapp.removeAttribute(
            "aria-disabled"
        );

        modalWhatsapp.onclick = null;

    }

}


                /* Open */

                productModal.classList.add("active");

                document.body.classList.add(
                    "modal-open"
                );

            }
        );

    });


    /* =====================================================
       CLOSE PRODUCT MODAL
       ===================================================== */

    function closeProductModal() {

        if (!productModal) {
            return;
        }

        productModal.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    if (productModalClose) {

        productModalClose.addEventListener(
            "click",
            closeProductModal
        );

    }


    if (productModalOverlay) {

        productModalOverlay.addEventListener(
            "click",
            closeProductModal
        );

    }


    /* =====================================================
       CLOSE WITH ESC KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                productModal &&
                productModal.classList.contains("active")
            ) {

                closeProductModal();

            }

        }
    );
    /* =====================================================
   STEP 2.3-C — CUSTOMER REVIEW ENGINE
   ===================================================== */

/* ================= REVIEW STORAGE ================= */
/* =====================================================
   STEP 2.3-C — MYSQL REVIEW API
   ===================================================== */

const REVIEW_API_URL =
    "https://guptagarments.waifly.com/api/reviews";


/* ================= GET PRODUCT REVIEWS ================= */

async function getProductReviews(productName) {

    if (!productName) {
        return [];
    }

    try {

        const response = await fetch(
            REVIEW_API_URL + "/" + encodeURIComponent(productName)
        );

        if (!response.ok) {
            throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();

        if (!data.success) {
            return [];
        }

        return data.reviews || [];

    } catch (error) {

        console.error(
            "❌ Unable to load reviews:",
            error
        );

        return [];
    }
}


/* ================= SAVE PRODUCT REVIEW ================= */

async function saveProductReview(productName, review) {

    if (!productName) {
        return false;
    }

    try {

        const response = await fetch(
            REVIEW_API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    product_name: productName,
                    customer_name: review.name,
                    rating: review.rating,
                    review_message: review.message
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            console.error(
                "❌ Review save failed:",
                data
            );

            return false;
        }

        console.log(
            "✅ Review saved to MySQL:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Review API error:",
            error
        );

        return false;
    }
}


/* ================= CREATE STARS ================= */

function createStars(rating) {

    let stars = "";

    for (let i = 1; i <= 5; i++) {

        if (i <= rating) {
            stars += "★";
        } else {
            stars += "☆";
        }
    }

    return stars;
}


/* ================= UPDATE RATING SUMMARY ================= */

async function updateReviewSummary(productName) {

    const reviews =
        await getProductReviews(productName);

    const averageElement =
        document.querySelector("#reviewAverage");

    const averageStarsElement =
        document.querySelector("#reviewAverageStars");

    const countElement =
        document.querySelector("#reviewCount");


    /* No reviews */

    if (reviews.length === 0) {

        if (averageElement) {
            averageElement.textContent = "0.0";
        }

        if (averageStarsElement) {
            averageStarsElement.textContent =
                "☆☆☆☆☆";
        }

        if (countElement) {
            countElement.textContent =
                "(0 reviews)";
        }

        return;
    }


    /* Calculate average */

    const totalRating =
        reviews.reduce(
            function (total, review) {
                return total + Number(review.rating);
            },
            0
        );

    const average =
        totalRating / reviews.length;


    const roundedAverage =
        Math.round(average * 10) / 10;


    if (averageElement) {
        averageElement.textContent =
            roundedAverage.toFixed(1);
    }


    if (averageStarsElement) {

        averageStarsElement.textContent =
            createStars(
                Math.round(average)
            );
    }


    if (countElement) {

        countElement.textContent =
            "(" +
            reviews.length +
            (reviews.length === 1
                ? " review)"
                : " reviews)");
    }
}


/* ================= RENDER REVIEWS ================= */

async function renderReviews(productName) {

    const reviewsList =
        document.querySelector("#reviewsList");

    if (!reviewsList) {
        return;
    }
    const reviews =
    await getProductReviews(productName);

    /* Clear existing reviews */

    reviewsList.innerHTML = "";


    /* No reviews */

    if (reviews.length === 0) {

        const emptyState =
            document.createElement("div");

        emptyState.className =
            "no-reviews";


        const icon =
            document.createElement("i");

        icon.className =
            "fa-regular fa-comment-dots";


        const paragraph =
            document.createElement("p");

        paragraph.textContent =
            "No reviews yet";


        const span =
            document.createElement("span");

        span.textContent =
            "Be the first to share your experience.";


        emptyState.appendChild(icon);
        emptyState.appendChild(paragraph);
        emptyState.appendChild(span);

        reviewsList.appendChild(
            emptyState
        );

        updateReviewSummary(
            productName
        );

        return;
    }


    /* Newest reviews first */

    const sortedReviews =
        [...reviews].reverse();


    sortedReviews.forEach(
        function (review) {

            const reviewItem =
                document.createElement("div");

            reviewItem.className =
                "review-item";
            /* ---------- TOP ---------- */
            const top =
                document.createElement("div");

            top.className =
                "review-item-top";
            const reviewerName =
                document.createElement("span");

            reviewerName.className =
                "reviewer-name";

            reviewerName.textContent =
    review.customer_name;

            const stars =
                document.createElement("span");

            stars.className =
                "review-item-stars";

            stars.textContent =
                createStars(
                    Number(review.rating)
                );

            top.appendChild(
                reviewerName
            );

            top.appendChild(
                stars
            );
            /* ---------- REVIEW TEXT ---------- */

            const text =
                document.createElement("p");

            text.className =
                "review-item-text";

           text.textContent =
    review.review_message;

            /* ---------- DATE ---------- */

            const date =
                document.createElement("span");

            date.className =
                "review-date";

                if (review.review_date) {

    date.textContent =
        new Date(review.review_date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
}


            /* ---------- APPEND ---------- */

            reviewItem.appendChild(top);

            reviewItem.appendChild(text);

            if (review.review_date) {
    reviewItem.appendChild(date);
}

            reviewsList.appendChild(
                reviewItem
            );
        }
    );


    updateReviewSummary(
        productName
    );
}


/* ================= RESET RATING ================= */

function resetReviewRating() {

    const ratingButtons =
        document.querySelectorAll(
            "#reviewRating button"
        );

    ratingButtons.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );
        }
    );
}


/* ================= SET RATING ================= */

function setReviewRating(rating) {

    const ratingButtons =
        document.querySelectorAll(
            "#reviewRating button"
        );

    ratingButtons.forEach(
        function (button) {

            const buttonRating =
                Number(
                    button.getAttribute(
                        "data-rating"
                    )
                );


            if (buttonRating <= rating) {

                button.classList.add(
                    "active"
                );

            } else {

                button.classList.remove(
                    "active"
                );
            }
        }
    );
}


/* ================= RATING BUTTONS ================= */

const reviewRatingButtons =
    document.querySelectorAll(
        "#reviewRating button"
    );


reviewRatingButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const rating =
                    Number(
                        button.getAttribute(
                            "data-rating"
                        )
                    );

                if (
                    !rating ||
                    rating < 1 ||
                    rating > 5
                ) {
                    return;
                }

                setReviewRating(
                    rating
                );

                button.parentElement.setAttribute(
                    "data-selected-rating",
                    rating
                );
            }
        );
    }
);


/* ================= GET SELECTED RATING ================= */

function getSelectedReviewRating() {

    const ratingContainer =
        document.querySelector(
            "#reviewRating"
        );

    if (!ratingContainer) {
        return 0;
    }

    return Number(
        ratingContainer.getAttribute(
            "data-selected-rating"
        )
    ) || 0;
}


/* ================= SUBMIT REVIEW ================= */

const submitReviewButton =
    document.querySelector(
        ".submit-review-btn"
    );


if (submitReviewButton) {

    submitReviewButton.addEventListener(
        "click",
         async function () {

            /* Current product check */

            if (!currentReviewProduct) {

                alert(
                    "Please open a product first."
                );

                return;
            }


            /* Get fields */

            const nameInput =
                document.querySelector(
                    "#reviewName"
                );

            const messageInput =
                document.querySelector(
                    "#reviewMessage"
                );


            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";


            const message =
                messageInput
                    ? messageInput.value.trim()
                    : "";


            const rating =
                getSelectedReviewRating();


            /* ================= VALIDATION ================= */

            if (!rating) {

                alert(
                    "Please select a rating."
                );

                return;
            }


            if (!name) {

                alert(
                    "Please enter your name."
                );

                if (nameInput) {
                    nameInput.focus();
                }

                return;
            }


            if (!message) {

                alert(
                    "Please write your review."
                );

                if (messageInput) {
                    messageInput.focus();
                }

                return;
            }


            /* ================= CREATE REVIEW ================= */

            const review = {

                id:
                    Date.now(),

                name:
                    name,

                rating:
                    rating,

                message:
                    message,

                date:
                    new Date().toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    )
            };


            /* ================= SAVE ================= */

            const saved =
    await saveProductReview(
        currentReviewProduct,
        review
    );

            if (!saved) {

                alert(
                    "Unable to save review. Please try again."
                );

                return;
            }


            /* ================= REFRESH UI ================= */

            renderReviews(
                currentReviewProduct
            );


            /* ================= RESET FORM ================= */

            if (nameInput) {
                nameInput.value = "";
            }

            if (messageInput) {
                messageInput.value = "";
            }


            resetReviewRating();


            const ratingContainer =
                document.querySelector(
                    "#reviewRating"
                );

            if (ratingContainer) {

                ratingContainer.removeAttribute(
                    "data-selected-rating"
                );
            }


            /* ================= SUCCESS ================= */

            alert(
                "Thank you! Your review has been submitted."
            );
        }
    );
}


/* =====================================================
   CONNECT REVIEWS WITH PRODUCT MODAL
   ===================================================== */

viewDetailsButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const productCard =
                    button.closest(
                        ".product-card"
                    );

                if (!productCard) {
                    return;
                }


                const productName =
                    productCard
                        .querySelector("h3")
                        ?.textContent
                        .trim();


                if (!productName) {
                    return;
                }


                /* Set current product */

                currentReviewProduct =
                    productName;


                /* Load product reviews */

                renderReviews(
                    currentReviewProduct
                );


                /* Reset rating */

                resetReviewRating();


                const ratingContainer =
                    document.querySelector(
                        "#reviewRating"
                    );

                if (ratingContainer) {

                    ratingContainer.removeAttribute(
                        "data-selected-rating"
                    );
                }


                /* Clear form */

                const nameInput =
                    document.querySelector(
                        "#reviewName"
                    );

                const messageInput =
                    document.querySelector(
                        "#reviewMessage"
                    );


                if (nameInput) {
                    nameInput.value = "";
                }

                if (messageInput) {
                    messageInput.value = "";
                }
            }
        );
    }
);


/* =====================================================
   STEP 2.3-C COMPLETE
   ===================================================== */

console.log(
    "Gupta Garments - Customer Review Engine loaded successfully."
);

/* =========================================================
   CATEGORY SUBMENU TOGGLE
   Kids / Women / Men / Winter Collection
   ========================================================= */

const categorySubmenus =
    document.querySelectorAll(".category-submenu");

categorySubmenus.forEach(function (submenu) {

    const submenuTitle =
        submenu.querySelector(".submenu-title");

    if (!submenuTitle) {
        return;
    }


    submenuTitle.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopImmediatePropagation();


            /* =========================================
               IDENTIFY PARENT CATEGORY
               ========================================= */

            const titleText =
                submenuTitle.textContent
                    .trim()
                    .toLowerCase();


            /* =========================================
               FILTER CATEGORY
               ========================================= */

            if (titleText.includes("kids")) {

                filterProducts("kids");

            }

            else if (titleText.includes("women")) {

                filterProducts("women");

            }

            else if (titleText.includes("men")) {

                filterProducts("men");

            }


            /* =========================================
               CLOSE OTHER SUBMENUS
               ========================================= */

            categorySubmenus.forEach(
                function (otherSubmenu) {

                    if (otherSubmenu !== submenu) {

                        otherSubmenu.classList.remove(
                            "submenu-open"
                        );

                    }

                }
            );


            /* =========================================
               OPEN CURRENT SUBMENU
               ========================================= */

            submenu.classList.add(
                "submenu-open"
            );

        }
    );

});
/* =====================================================
   STEP 4J — DYNAMIC DATABASE PRODUCT BUTTONS
   VIEW DETAILS + WHATSAPP
   ===================================================== */

const productsGridForDynamicButtons =
    document.querySelector("#productsGrid");

if (productsGridForDynamicButtons) {

    productsGridForDynamicButtons.addEventListener(
        "click",
        function (event) {

            /* =================================================
               FIND PRODUCT CARD
               ================================================= */

            const dynamicCard =
                event.target.closest(".product-card");

            if (!dynamicCard) {
                return;
            }


            /* =================================================
               VIEW DETAILS BUTTON
               ================================================= */

            const viewButton =
                event.target.closest(".view-details-btn");

            if (viewButton) {

                event.preventDefault();

                const productName =
                    dynamicCard
                        .querySelector("h3")
                        ?.textContent
                        .trim();

                console.log(
                    "🟢 VIEW DETAILS CLICKED:",
                    productName
                );

                const productPrice =
                    dynamicCard
                        .querySelector(".price")
                        ?.textContent
                        .trim();

                const productSizes =
                    dynamicCard
                        .querySelector(".product-info p")
                        ?.textContent
                        .trim();

                if (!productName) {
                    return;
                }


                /* =================================================
                   PRODUCT MODAL
                   ================================================= */

                const productModal =
                    document.querySelector("#productModal");

                if (!productModal) {
                    return;
                }


                const modalName =
                    document.querySelector(
                        "#modalProductName"
                    );

                const modalPrice =
                    document.querySelector(
                        "#modalProductPrice"
                    );

                const modalSizes =
                    document.querySelector(
                        "#modalProductSizes"
                    );

                const modalDescription =
                    document.querySelector(
                        "#modalProductDescription"
                    );

                const modalImage =
                    document.querySelector(
                        "#modalProductImage"
                    );

                const modalWhatsapp =
                    document.querySelector(
                        "#modalWhatsapp"
                    );


                /* =================================================
                   PRODUCT NAME
                   ================================================= */

                if (modalName) {
                    modalName.textContent =
                        productName;
                }


                /* =================================================
                   PRICE
                   ================================================= */

                if (modalPrice) {
                    modalPrice.textContent =
                        productPrice ||
                        "Please confirm";
                }


                /* =================================================
                   SIZES
                   ================================================= */

                if (modalSizes) {
                    modalSizes.textContent =
                        productSizes ||
                        "Please confirm availability";
                }


                /* =================================================
                   DESCRIPTION
                   ================================================= */

                if (modalDescription) {

                    modalDescription.textContent =
                        dynamicCard.getAttribute(
                            "data-description"
                        ) ||
                        "Stylish and comfortable kids wear from Gupta Garments.";

                }


                /* =================================================
                   PRODUCT IMAGE / DATABASE ID
                   ================================================= */

                const productImage =
                    dynamicCard.querySelector(
                        ".product-photo"
                    );

                let productId =
                    dynamicCard.dataset.dbProductId ||
                    null;


                /* =================================================
                   SECOND TRY — IMAGE DATASET
                   ================================================= */

                if (!productId && productImage) {

                    productId =
                        productImage.dataset.dbProductId ||
                        null;

                }


                /* =================================================
                   THIRD TRY — DATABASE PRODUCTS
                   ================================================= */

                if (!productId && productName) {

                    if (
                        Array.isArray(databaseProducts)
                    ) {

                        const matchedProduct =
                            databaseProducts.find(
                                function (item) {

                                    return (
                                        String(
                                            item.product_name
                                        )
                                            .trim()
                                            .toLowerCase() ===
                                        String(
                                            productName
                                        )
                                            .trim()
                                            .toLowerCase()
                                    );

                                }
                            );


                        if (matchedProduct) {

                            productId =
                                matchedProduct.id;

                        }

                    }

                }


                console.log(
                    "🔎 View Details Product ID:",
                    productId,
                    "Product:",
                    productName
                );

/* =================================================
   PROFESSIONAL PRODUCT IMAGE GALLERY
   ================================================= */

const modalThumbnails =
    document.querySelector(
        "#modalProductThumbnails"
    );


/* =================================================
   RESET THUMBNAILS
   ================================================= */

if (modalThumbnails) {

    modalThumbnails.innerHTML = "";

}


/* =================================================
   GALLERY STATE
   ================================================= */

let modalGalleryImages = [];

let modalGalleryIndex = 0;


/* =================================================
   MAIN IMAGE
   ================================================= */

function showModalProductImage(
    imageUrl,
    index = 0
) {

    if (
        !modalImage ||
        !imageUrl
    ) {
        return;
    }


    modalGalleryIndex =
        index;


    modalImage.innerHTML = `
        <img
            src="${imageUrl}"
            alt="${productName || "Product Image"}"
        >

        <button
            type="button"
            class="modal-gallery-arrow modal-gallery-prev"
            aria-label="Previous image"
        >
            ‹
        </button>

        <button
            type="button"
            class="modal-gallery-arrow modal-gallery-next"
            aria-label="Next image"
        >
            ›
        </button>
    `;


    modalImage.className =
        "modal-dummy-product";


    /* =================================================
       PREVIOUS IMAGE
       ================================================= */

    const previousButton =
        modalImage.querySelector(
            ".modal-gallery-prev"
        );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                if (
                    !modalGalleryImages.length
                ) {
                    return;
                }


                let previousIndex =
                    modalGalleryIndex - 1;


                if (
                    previousIndex < 0
                ) {

                    previousIndex =
                        modalGalleryImages.length - 1;

                }


                showModalProductImage(
                    modalGalleryImages[
                        previousIndex
                    ],
                    previousIndex
                );

            }
        );

    }


    /* =================================================
       NEXT IMAGE
       ================================================= */

    const nextButton =
        modalImage.querySelector(
            ".modal-gallery-next"
        );


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                if (
                    !modalGalleryImages.length
                ) {
                    return;
                }


                let nextIndex =
                    modalGalleryIndex + 1;


                if (
                    nextIndex >=
                    modalGalleryImages.length
                ) {

                    nextIndex = 0;

                }


                showModalProductImage(
                    modalGalleryImages[
                        nextIndex
                    ],
                    nextIndex
                );

            }
        );

    }


    /* =================================================
       ACTIVE THUMBNAIL
       ================================================= */

    if (modalThumbnails) {

        modalThumbnails
            .querySelectorAll(
                ".modal-product-thumbnail"
            )
            .forEach(
                function (
                    thumbnail,
                    thumbnailIndex
                ) {

                    thumbnail.classList.toggle(
                        "active",
                        thumbnailIndex ===
                        modalGalleryIndex
                    );

                }
            );

    }

}


/* =================================================
   LOAD MULTIPLE PRODUCT IMAGES
   ================================================= */

if (productId) {

    fetch(
        "https://guptagarments.waifly.com/api/products/" +
        productId +
        "/public-images"
    )
        .then(
            function (response) {

                if (!response.ok) {

                    throw new Error(
                        "Failed to load product images."
                    );

                }

                return response.json();

            }
        )
        .then(
            function (imageResult) {

                console.log(
                    "🖼️ Product gallery response:",
                    imageResult
                );


                const images =
                    imageResult.images ||
                    [];


                /* =====================================
                   IMAGES FOUND
                   ===================================== */

                if (
                    images.length > 0
                ) {

                    /* Save image URLs */

                    modalGalleryImages =
                        images.map(
                            function (image) {

                                return image.image_url;

                            }
                        );


                    /* =================================
                       CREATE THUMBNAILS
                       ================================= */

                    if (modalThumbnails) {

                        images.forEach(
                            function (
                                image,
                                index
                            ) {

                                const thumbnail =
                                    document.createElement(
                                        "button"
                                    );


                                thumbnail.type =
                                    "button";


                                thumbnail.className =
                                    "modal-product-thumbnail";


                                thumbnail.innerHTML = `
                                    <img
                                        src="${image.image_url}"
                                        alt="Product Image ${index + 1}"
                                    >
                                `;


                                thumbnail.addEventListener(
                                    "click",
                                    function (event) {

                                        event.preventDefault();


                                        showModalProductImage(
                                            image.image_url,
                                            index
                                        );

                                    }
                                );


                                modalThumbnails.appendChild(
                                    thumbnail
                                );

                            }
                        );

                    }


                    /* Show first image */

                    showModalProductImage(
                        modalGalleryImages[0],
                        0
                    );

                }


                /* =====================================
                   FALLBACK OLD IMAGE
                   ===================================== */

                else {

                    if (
                        productImage &&
                        modalImage
                    ) {

                        const fallbackImage =
                            productImage.dataset
                                .dbImageUrl;


                        if (fallbackImage) {

                            modalGalleryImages = [
                                fallbackImage
                            ];


                            showModalProductImage(
                                fallbackImage,
                                0
                            );

                        }
                        else {

                            modalImage.textContent =
                                productImage
                                    .textContent
                                    .trim();

                        }

                    }

                }

            }
        )
        .catch(
            function (error) {

                console.error(
                    "❌ Product Gallery Error:",
                    error
                );


                if (
                    productImage &&
                    modalImage
                ) {

                    const fallbackImage =
                        productImage.dataset
                            .dbImageUrl;


                    if (fallbackImage) {

                        modalGalleryImages = [
                            fallbackImage
                        ];


                        showModalProductImage(
                            fallbackImage,
                            0
                        );

                    }
                    else {

                        modalImage.textContent =
                            productImage
                                .textContent
                                .trim();

                    }

                }

            }
        );

}
else {

    console.warn(
        "⚠️ No database product ID found for:",
        productName
    );

}


                /* =================================================
                   WHATSAPP FROM MODAL
                   ================================================= */

                if (
                    modalWhatsapp &&
                    productName
                ) {

                    const message =
                        "Hello Gupta Garments 👋\n\n" +
                        "I am interested in the following product:\n\n" +
                        "🛍️ Product: " +
                        productName +
                        "\n" +
                        "💰 Price: " +
                        (
                            productPrice ||
                            "Please confirm"
                        ) +
                        "\n" +
                        "📏 " +
                        (
                            productSizes ||
                            "Size details not available"
                        ) +
                        "\n\n" +
                        "Please confirm:\n" +
                        "✅ Availability\n" +
                        "✅ Available sizes\n" +
                        "✅ Any other details\n\n" +
                        "Thank you!";


                    modalWhatsapp.href =
                        "https://wa.me/918218403183?text=" +
                        encodeURIComponent(
                            message
                        );

                }


                /* =================================================
                   REVIEW SYSTEM
                   ================================================= */

                if (
                    typeof currentReviewProduct !==
                    "undefined"
                ) {

                    currentReviewProduct =
                        productName;


                    if (
                        typeof renderReviews ===
                        "function"
                    ) {

                        renderReviews(
                            currentReviewProduct
                        );

                    }


                    if (
                        typeof resetReviewRating ===
                        "function"
                    ) {

                        resetReviewRating();

                    }

                }


                /* =================================================
                   OPEN MODAL
                   ================================================= */

                productModal.classList.add(
                    "active"
                );


                document.body.classList.add(
                    "modal-open"
                );


                return;

            }


            /* =================================================
               PRODUCT WHATSAPP BUTTON
               ================================================= */

            const whatsappButton =
                event.target.closest(
                    ".product-whatsapp"
                );


            if (whatsappButton) {

                event.preventDefault();


                const productName =
                    dynamicCard
                        .querySelector("h3")
                        ?.textContent
                        .trim();


                const productPrice =
                    dynamicCard
                        .querySelector(".price")
                        ?.textContent
                        .trim();


                const productSizes =
                    dynamicCard
                        .querySelector(
                            ".product-info p"
                        )
                        ?.textContent
                        .trim();


                if (!productName) {
                    return;
                }


                const message =
                    "Hello Gupta Garments 👋\n\n" +
                    "I am interested in the following product:\n\n" +
                    "🛍️ Product: " +
                    productName +
                    "\n" +
                    "💰 Price: " +
                    (
                        productPrice ||
                        "Please confirm"
                    ) +
                    "\n" +
                    "📏 " +
                    (
                        productSizes ||
                        "Size details not available"
                    ) +
                    "\n\n" +
                    "Please confirm:\n" +
                    "✅ Availability\n" +
                    "✅ Available sizes\n" +
                    "✅ Any other details\n\n" +
                    "Thank you!";


                const whatsappURL =
                    "https://wa.me/918218403183?text=" +
                    encodeURIComponent(
                        message
                    );


                window.location.href =
                    whatsappURL;

            }

        }
    );

}
});
// =================================
// FESTIVAL / ALERT POPUP
// =================================

document.addEventListener("DOMContentLoaded", async function () {
console.log("🎉 FESTIVAL POPUP SCRIPT STARTED");
    const popup =
        document.getElementById("festivalAlertPopup");

    const overlay =
        document.getElementById("festivalAlertOverlay");

    const closeButton =
        document.getElementById("festivalAlertClose");

    const popupImage =
        document.getElementById("festivalAlertImage");

    const popupTitle =
        document.getElementById("festivalAlertTitle");

    const popupSubtitle =
        document.getElementById("festivalAlertSubtitle");

    const popupDescription =
        document.getElementById("festivalAlertDescription");

    const popupButton =
        document.getElementById("festivalAlertButton");

    if (!popup) {
        return;
    }

    try {

        const response = await fetch(
            "https://guptagarments.waifly.com/api/festival-popup/active"
        );

        const data = await response.json();

const popupData = data.popup;

if (!response.ok || !popupData) {
    return;
}

popupTitle.textContent =
    popupData.title || "";

popupSubtitle.textContent =
    popupData.subtitle || "";

popupDescription.textContent =
    popupData.description || "";
        // Image
        if (popupData.image_url) {

            popupImage.src =
                popupData.image_url.startsWith("http")
                    ? popupData.image_url
                    : "https://guptagarments.waifly.com" +
                     popupData.image_url;

            popupImage.style.display =
                "block";

        }
        else {

            popupImage.style.display =
                "none";

        }

        // Button
        if (
    popupData.button_text &&
    popupData.button_link
)
        {

            popupButton.textContent =
                popupData.button_text

            popupButton.href =
                popupData.button_link

            popupButton.style.display =
                "inline-block";

        }
        else {

            popupButton.style.display =
                "none";

        }

        // Show popup
        popup.style.display =
            "block";


        // Close button
        closeButton.addEventListener(
            "click",
            function () {

                popup.style.display =
                    "none";

            }
        );


        // Click outside popup
        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === overlay
                ) {

                    popup.style.display =
                        "none";

                }

            }
        );

    }
    catch (error) {

        console.error(
            "Festival Popup Error:",
            error
        );
    }
});