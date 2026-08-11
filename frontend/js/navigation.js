// ==========================================
// NutriScan AI — Navigation
// ==========================================

function switchPage(page) {
    const navClassify   = document.getElementById("nav-classify");
    const navCalculator = document.getElementById("nav-calculator");
    const navBarcode    = document.getElementById("nav-barcode");
    const navHistory    = document.getElementById("nav-history");
    const navAbout      = document.getElementById("nav-about");

    const pageClassify   = document.getElementById("page-classify");
    const pageCalculator = document.getElementById("page-calculator");
    const pageBarcode    = document.getElementById("page-barcode");
    const pageHistory    = document.getElementById("page-history");
    const pageAbout      = document.getElementById("page-about");

    // Deactivate all nav pills
    [navClassify, navCalculator, navBarcode, navHistory, navAbout].forEach(n => {
        if (n) n.classList.remove("active");
    });

    // Hide all pages
    [pageClassify, pageCalculator, pageBarcode, pageHistory, pageAbout].forEach(p => {
        if (p) p.style.display = "none";
    });

    // Activate the target page
    if (page === "classify") {
        if (navClassify) navClassify.classList.add("active");
        if (pageClassify) pageClassify.style.display = "block";
    } else if (page === "calculator") {
        if (navCalculator) navCalculator.classList.add("active");
        if (pageCalculator) pageCalculator.style.display = "block";
    } else if (page === "barcode") {
        if (navBarcode) navBarcode.classList.add("active");
        if (pageBarcode) pageBarcode.style.display = "block";
    } else if (page === "history") {
        if (navHistory) navHistory.classList.add("active");
        if (pageHistory) pageHistory.style.display = "block";
        loadHistory();
    } else if (page === "about") {
        if (navAbout) navAbout.classList.add("active");
        if (pageAbout) pageAbout.style.display = "block";
        renderFoodTags();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function initNavigation() {
    const navClassify   = document.getElementById("nav-classify");
    const navCalculator = document.getElementById("nav-calculator");
    const navBarcode    = document.getElementById("nav-barcode");
    const navHistory    = document.getElementById("nav-history");
    const navAbout      = document.getElementById("nav-about");
    const btnGoClassify = document.getElementById("btn-go-classify");

    if (navClassify)   navClassify.addEventListener("click",   () => switchPage("classify"));
    if (navCalculator) navCalculator.addEventListener("click", () => switchPage("calculator"));
    if (navBarcode)    navBarcode.addEventListener("click",    () => switchPage("barcode"));
    if (navHistory)    navHistory.addEventListener("click",    () => switchPage("history"));
    if (navAbout)      navAbout.addEventListener("click",      () => switchPage("about"));
    if (btnGoClassify) btnGoClassify.addEventListener("click", () => switchPage("classify"));
}
