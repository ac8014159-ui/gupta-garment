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

        const titleElement =
            productCard.querySelector("h3");

        if (!titleElement) {
            return [];
        }

        const productName =
            titleElement.textContent.trim();

        return productCategories[productName] || [];

    }


    /* =====================================================
       FILTER PRODUCTS
       ===================================================== */

    function filterProducts(category) {

        productCards.forEach(function (product, index) {

            const categories =
                getProductCategory(product);

            let shouldShow = false;

            if (category === "all") {

                shouldShow = true;

            } else {

                shouldShow =
                    categories.includes(category);

            }


            if (shouldShow) {

                product.style.display = "";

                /*
                   Small delay gives smooth animation
                   when filtered products appear.
                */

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

            if (visibleProducts.length === 0) {

                noProducts.style.display = "block";

            } else {

                noProducts.style.display = "none";

            }

        }


        /* =================================================
           FILTER STATUS
           ================================================= */

        const filterStatus =
            document.querySelector("#filterStatus");

        const filterName =
            document.querySelector("#filterName");


        if (filterStatus && filterName) {

            if (category === "all") {

                filterStatus.style.display = "none";

            } else {

                filterStatus.style.display = "flex";

                const readableName =
                    category
                        .replace("-", " ")
                        .replace(/\b\w/g, function (letter) {
                            return letter.toUpperCase();
                        });

                filterName.textContent =
                    readableName;

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


    /* =====================================================
       CLEAR FILTER
       ===================================================== */

    const clearFilter =
        document.querySelector("#clearFilter");

    if (clearFilter) {

        clearFilter.addEventListener(
            "click",
            function () {

                filterProducts("all");

                setActiveCategory(null);

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
                    `Hello Gupta Garments,

` +
                    `I am interested in:
` +
                    `${productName}

` +
                    `Price: ${productPrice || "Please confirm"}

` +
                    `${productSizes || ""}

` +
                    `Please share availability and details.`;


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
                    "Hello Gupta Garments,\n\n" +
                    "I want to know more about your Kids Wear collection.\n\n" +
                    "Please share availability and details.";


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

});