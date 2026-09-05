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

    const productCards =
        document.querySelectorAll(".product-card");

    const categoryCards =
        document.querySelectorAll(".category-card");

/* =====================================================
   STEP 4A — LOAD PRODUCTS FROM RAILWAY API
   ===================================================== */

const PRODUCT_API_URL =
    "https://gupta-garment-production.up.railway.app/api/products";

let databaseProducts = [];


/* ================= LOAD DATABASE PRODUCTS ================= */

async function loadDatabaseProducts() {

    try {

        console.log("⏳ Loading products from Railway API...");

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
   /* =====================================================
   STEP 4C — SYNC DATABASE PRODUCTS WITH EXISTING CARDS
   ===================================================== */
function syncDatabaseProductsWithCards() {

    console.log("🧩 Total HTML product cards:", productCards.length);

    if (!databaseProducts.length) {
        console.warn("⚠️ No database products available for sync.");
        return;
    }

    productCards.forEach(function (card) {

        /* =====================================================
           FIND PRODUCT NAME FROM HTML <h3>
           ===================================================== */

        const titleElement = card.querySelector("h3");

        const htmlProductName = titleElement
            ? titleElement.textContent.trim()
            : "";

        if (!htmlProductName) {

            console.warn(
                "⚠️ Product card has no h3 product name."
            );

            return;
        }


        /* =====================================================
           FIND MATCHING PRODUCT FROM DATABASE
           ===================================================== */

        const dbProduct = databaseProducts.find(function (product) {

            /* Normal product name match */

            if (product.product_name === htmlProductName) {
                return true;
            }


            /* Old HTML name → New database name */

            if (
                htmlProductName === "Girls Nighty / Gown" &&
                product.product_name === "Women Nighty / Gown"
            ) {
                return true;
            }


            return false;

        });


        /* =====================================================
           PRODUCT NOT FOUND
           ===================================================== */

        if (!dbProduct) {

            console.warn(
                "⚠️ Product not found in database:",
                htmlProductName
            );

            console.log(
                "📋 Available DB products:",
                databaseProducts.map(function (product) {
                    return product.product_name;
                })
            );

            return;
        }


        /* =====================================================
           UPDATE HTML DATA ATTRIBUTES FROM DATABASE
           ===================================================== */

        card.setAttribute(
            "data-category",
            dbProduct.category || ""
        );

        card.setAttribute(
            "data-gender",
            dbProduct.gender || ""
        );

        card.setAttribute(
            "data-season",
            dbProduct.season || ""
        );

        card.setAttribute(
            "data-price",
            dbProduct.price || ""
        );

        card.setAttribute(
            "data-description",
            dbProduct.description || ""
        );

        card.setAttribute(
            "data-stock-status",
            dbProduct.stock_status || "in-stock"
        );


        /* =====================================================
           UPDATE PRODUCT NAME
           ===================================================== */

        if (titleElement) {

            titleElement.textContent =
                dbProduct.product_name;

        }


        /* =====================================================
           UPDATE PRICE
           ===================================================== */

        const priceElement =
            card.querySelector(".price");

        if (priceElement) {

            priceElement.textContent =
                "₹" +
                Number(dbProduct.price)
                    .toLocaleString("en-IN");

        }


        /* =====================================================
           UPDATE SIZES
           ===================================================== */

        const sizesElement =
            card.querySelector(".product-info p");

        if (
            sizesElement &&
            dbProduct.sizes
        ) {

            sizesElement.textContent =
                "Sizes: " +
                dbProduct.sizes;

        }


        /* =====================================================
           UPDATE VISIBILITY
           ===================================================== */

        if (
            Number(dbProduct.is_visible) === 0
        ) {

            card.style.display = "none";

        }


        /* =====================================================
           SUCCESS LOG
           ===================================================== */

        console.log(
            "✅ Product synced:",
            dbProduct.product_name
        );

    });


    console.log(
        "🎯 Database product sync completed."
    );

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

}


        /* ================= SEASON MATCH ================= */

        const seasonMatch =
            productMatchesSeason(product);


        /* ================= FINAL MATCH ================= */

        const shouldShow =
            categoryMatch && seasonMatch;


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
    /* =====================================================
       CATEGORY CARD CLICK
       ===================================================== */

    categoryCards.forEach(function (categoryCard) {

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

                setActiveCategory(categoryCard);

            }
        );

    });


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
       ===================================================== */

    productCards.forEach(function (product) {

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

                if (modalWhatsapp && productName) {

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
    (productSizes || "Size details not available") +
    "\n\n" +
    "Please confirm:\n" +
    "✅ Availability\n" +
    "✅ Available sizes\n" +
    "✅ Any other details\n\n" +
    "Thank you!";

                    modalWhatsapp.href =
                        "https://wa.me/918218403183?text=" +
                        encodeURIComponent(message);

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

const REVIEW_API_URL = "https://gupta-garment-production.up.railway.app/api/reviews";


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
});