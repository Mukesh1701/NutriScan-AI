// ==========================================
// NutriScan AI — Barcode Scanner (Fixed)
// ==========================================
//
// Key bugs fixed vs. original script.js:
//  1. Live scanner and file-scanner now use SEPARATE element IDs so they never
//     conflict when both are initialised.
//  2. scanBarcodeFromFile no longer points at "#barcode-reader" (owned by the
//     live scanner); it uses the dedicated "#file-scanner-temp" element.
//  3. stopBarcodeScanner now guards against calling .clear() on an already-
//     cleared instance (avoids unhandled rejections).
//  4. All DOMContentLoaded wiring is consolidated in initBarcodeScanner().
//  5. The local fileInput variable no longer shadows the top-level one.
//  6. The viewfinder is restored safely after a failed file scan.
// ==========================================

let barcodeScanner  = null;
let scannerRunning  = false;

// ---- Live camera scanner ----

function startBarcodeScanner() {
    const reader   = document.getElementById("barcode-reader");
    const startBtn = document.getElementById("start-barcode-btn");
    const stopBtn  = document.getElementById("stop-barcode-btn");

    if (!reader) {
        console.error("Barcode reader element not found");
        return;
    }
    if (scannerRunning) return;

    // Create a fresh Html5Qrcode instance each time
    barcodeScanner = new Html5Qrcode("barcode-reader", {
        formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39
        ],
        verbose: false,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true }
    });

    // Responsive scan-box dimensions
    const screenW = Math.min(window.innerWidth - 40, 500);
    const boxW    = Math.floor(screenW * 0.85);
    const boxH    = Math.floor(boxW * 0.35);

    const scanConfig = {
        fps: 30,
        qrbox: { width: boxW, height: boxH },
        videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            advanced: [{ focusMode: "continuous" }]
        }
    };

    barcodeScanner
        .start(
            { facingMode: "environment" },
            scanConfig,
            (decodedText) => {
                // Success callback — fill input and look up product
                const input = document.getElementById("barcode-input");
                if (input) input.value = decodedText;
                stopBarcodeScanner();
                showToast("Barcode detected: " + decodedText);
                lookupBarcodeProduct(decodedText);
            },
            () => { /* continuous scan errors — ignored */ }
        )
        .then(() => {
            scannerRunning = true;
            if (startBtn) startBtn.style.display = "none";
            if (stopBtn)  stopBtn.style.display  = "inline-flex";
            showToast("Camera ready! Point at a barcode.");
        })
        .catch((err) => {
            console.error("Could not start barcode scanner:", err);
            showToast("Could not access camera. Make sure you're on HTTPS and allow camera permission.");
        });
}

function stopBarcodeScanner() {
    if (!barcodeScanner || !scannerRunning) return;

    const startBtn = document.getElementById("start-barcode-btn");
    const stopBtn  = document.getElementById("stop-barcode-btn");

    barcodeScanner
        .stop()
        .then(() => {
            // Only call clear() if the instance is still valid
            try { barcodeScanner.clear(); } catch (_) {}
            barcodeScanner  = null;
            scannerRunning  = false;
            if (startBtn) startBtn.style.display = "inline-flex";
            if (stopBtn)  stopBtn.style.display  = "none";
        })
        .catch((err) => {
            console.error("Error stopping scanner:", err);
            // Reset state regardless so the UI isn't stuck
            barcodeScanner = null;
            scannerRunning = false;
            if (startBtn) startBtn.style.display = "inline-flex";
            if (stopBtn)  stopBtn.style.display  = "none";
        });
}

// ---- File / photo barcode scanning ----

// Returns the canonical HTML for the idle viewfinder overlay (used for restore)
function _viewfinderHTML() {
    return `
        <div id="barcode-reader" class="barcode-reader-box">
            <div class="viewfinder-overlay">
                <div class="laser-line"></div>
                <div class="viewfinder-corner top-left"></div>
                <div class="viewfinder-corner top-right"></div>
                <div class="viewfinder-corner bottom-left"></div>
                <div class="viewfinder-corner bottom-right"></div>
                <div class="viewfinder-text">Position barcode inside camera frame</div>
            </div>
        </div>`;
}

async function scanBarcodeFromFile(file) {
    if (!file) return;

    showToast("Reading barcode from photo…");

    // Show a preview of the uploaded image inside the viewfinder wrapper
    const viewfinder = document.getElementById("viewfinder-wrapper");
    if (viewfinder) {
        const imgURL = URL.createObjectURL(file);
        viewfinder.innerHTML = `
            <img src="${imgURL}" style="width:100%;max-height:300px;object-fit:contain;border-radius:12px;margin:8px 0;" alt="Uploaded barcode photo">
            <p style="text-align:center;color:var(--text-muted);font-size:0.85rem;margin-top:6px;">Scanning for barcode…</p>`;
        viewfinder.style.display = "block";
    }

    let decoded = null;

    // Strategy 1: Native BarcodeDetector API (Chrome 83+, Android WebView)
    if ("BarcodeDetector" in window) {
        try {
            const detector = new BarcodeDetector({
                formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"]
            });
            const bitmap  = await createImageBitmap(file);
            const results = await detector.detect(bitmap);
            if (results.length > 0) {
                decoded = results[0].rawValue;
            }
        } catch (e) {
            console.warn("BarcodeDetector failed:", e);
        }
    }

    // Strategy 2: html5-qrcode scanFile — uses a SEPARATE temp element,
    // NOT #barcode-reader, to avoid conflicting with the live scanner.
    if (!decoded) {
        try {
            // Ensure the temp container exists and is not occupied by the live scanner
            let tempEl = document.getElementById("file-scanner-temp");
            if (!tempEl) {
                tempEl = document.createElement("div");
                tempEl.id = "file-scanner-temp";
                tempEl.style.display = "none";
                document.body.appendChild(tempEl);
            }

            const tempScanner = new Html5Qrcode("file-scanner-temp", { verbose: false });
            decoded = await tempScanner.scanFile(file, /* showImage= */ false);
            // Clean up: Html5Qrcode.scanFile does not start a camera session,
            // but we still call clear() to free any internal resources.
            try { tempScanner.clear(); } catch (_) {}
        } catch (e) {
            console.warn("html5-qrcode scanFile failed:", e);
        }
    }

    // Reset file input so the user can select the same file again
    const barcodeFileInput = document.getElementById("barcode-file-input");
    if (barcodeFileInput) barcodeFileInput.value = "";

    if (decoded) {
        const input = document.getElementById("barcode-input");
        if (input) input.value = decoded;
        showToast(`Barcode detected: ${decoded}!`);
        lookupBarcodeProduct(decoded);
    } else {
        showToast("Could not detect barcode. Please try again or type the numbers manually.");
        // Restore the viewfinder overlay so the live scanner can be used again
        if (viewfinder) {
            viewfinder.innerHTML = _viewfinderHTML();
            // Re-wire lucide icons inside the restored element (if any)
            if (typeof lucide !== "undefined") lucide.createIcons({ root: viewfinder });
        }
    }
}

// ---- Open Food Facts API lookup ----

async function lookupBarcodeProduct(barcode) {
    showToast("Looking up product in database…");

    try {
        // Try v2 first, then fall back to v0
        let data;
        for (const version of ["v2", "v0"]) {
            const response = await fetch(
                `https://world.openfoodfacts.org/api/${version}/product/${barcode}.json`
            );
            if (response.ok) {
                const json = await response.json();
                if (json && json.status === 1) { data = json; break; }
            }
        }

        if (data && data.status === 1 && data.product) {
            showToast("Product found!");
            renderBarcodeResult(data.product);
            saveBarcodeToHistory(data.product);
        } else {
            showToast("Product not found. Try a different barcode.");
        }
    } catch (error) {
        console.error("API Error:", error);
        showToast("Error connecting to database. Check your internet connection.");
    }
}

// ---- Health grade helpers ----

function calculateBackupGrade(nutriments) {
    let score = 0;
    const sugars  = nutriments.sugars_100g || 0;
    const satFat  = nutriments["saturated-fat_100g"] || 0;
    const sodium  = (nutriments.salt_100g || 0) * 400;
    const fiber   = nutriments.fiber_100g || 0;
    const protein = nutriments.proteins_100g || 0;

    if (sugars > 45) score += 10; else if (sugars > 18) score += 5;
    if (satFat > 10) score += 10; else if (satFat > 5)  score += 5;
    if (sodium > 900) score += 10;
    if (fiber  > 4.7) score -= 5;
    if (protein > 8)  score -= 5;

    if (score <= -1) return "a";
    if (score <=  2) return "b";
    if (score <= 10) return "c";
    if (score <= 18) return "d";
    return "e";
}

// ---- Render result dashboard ----

function renderBarcodeResult(product) {
    const resultsSection = document.getElementById("barcode-results-section");
    const controlsRow    = document.querySelector(".scanner-controls-row");
    const viewfinder     = document.getElementById("viewfinder-wrapper");
    const manualWrap     = document.querySelector(".manual-barcode-wrapper");
    const demoWrap       = document.querySelector(".demo-grades-wrapper");

    // Stop any active live scanner
    stopBarcodeScanner();

    // Hide scanner UI
    if (controlsRow) controlsRow.style.display = "none";
    if (viewfinder)  viewfinder.style.display  = "none";
    if (manualWrap)  manualWrap.style.display   = "none";
    if (demoWrap)    demoWrap.style.display     = "none";
    if (resultsSection) resultsSection.style.display = "block";

    // Determine grade
    let grade = "e";
    if (product.nutriscore_grade && product.nutriscore_grade !== "unknown") {
        grade = product.nutriscore_grade.toLowerCase();
    } else if (product.nutriments) {
        grade = calculateBackupGrade(product.nutriments);
    }
    if (!["a", "b", "c", "d", "e", "f"].includes(grade)) grade = "e";
    const gradeUpper = grade.toUpperCase();

    // Grade banner
    const heroBanner = document.getElementById("grade-hero-banner");
    if (heroBanner) {
        heroBanner.className = `grade-hero-card grade-${grade}-theme`;
    }

    const tagLines = {
        A: "Excellent Nutritional Quality", B: "Good Nutritional Quality",
        C: "Moderate Nutritional Quality",  D: "Poor Nutritional Quality",
        E: "Bad Nutritional Quality",       F: "Avoid Consuming"
    };
    const descriptions = {
        A: "Excellent choice! Very healthy, balanced profile. Consume regularly.",
        B: "Good choice. Mostly healthy, suitable for regular consumption.",
        C: "Moderate choice. Okay to consume, but watch portion sizes.",
        D: "Poor choice. Contains high amounts of sugar, fat, or salt. Limit intake.",
        E: "Unhealthy. Very high in sugar, saturated fats, or salt. Consume rarely.",
        F: "Extremely unhealthy. Avoid consumption due to poor nutritional profile."
    };

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("grade-letter-display", gradeUpper);
    set("grade-pill-tag",       tagLines[gradeUpper]    || "Unknown");
    set("grade-main-title",     `Grade ${gradeUpper} — ${tagLines[gradeUpper] || ""}`);
    set("grade-description",    descriptions[gradeUpper] || "");

    // NOVA badge
    const novaBadge = document.getElementById("grade-nova-badge");
    if (novaBadge) {
        const novaGroup = product.nova_group;
        if (novaGroup) {
            novaBadge.style.display = "inline-flex";
            const novaLabels = {
                1: "NOVA 1 · Unprocessed",
                2: "NOVA 2 · Processed Culinary Ing.",
                3: "NOVA 3 · Processed"
            };
            novaBadge.textContent = novaLabels[novaGroup] || "NOVA 4 · Ultra-Processed";
        } else {
            novaBadge.style.display = "none";
        }
    }

    // Product details
    const imgEl = document.getElementById("barcode-prod-img");
    if (imgEl) imgEl.src = product.image_url || "https://images.openfoodfacts.org/images/icons/dist/packaging.svg";

    set("barcode-prod-brand", product.brands       || "Unknown Brand");
    set("barcode-prod-name",  product.product_name || "Unknown Product");
    set("barcode-prod-code",  `Barcode: ${product.code || product._id || "N/A"}`);

    const firstCat = (product.categories || "").split(",")[0].trim();
    set("barcode-prod-cat", firstCat ? `Category: ${firstCat}` : "Category: Unknown");

    // Nutrition values
    const nuts = product.nutriments || {};
    const safeFormat = (val) =>
        val !== undefined && val !== null ? parseFloat(val).toFixed(1) : "?";
    const calVal = nuts["energy-kcal_100g"] !== undefined
        ? nuts["energy-kcal_100g"]
        : (nuts.energy_100g ? nuts.energy_100g / 4.184 : null);

    set("b-nut-cal",    safeFormat(calVal));
    set("b-nut-sugar",  safeFormat(nuts.sugars_100g)              + "g");
    set("b-nut-fat",    safeFormat(nuts.fat_100g)                 + "g");
    set("b-nut-satfat", safeFormat(nuts["saturated-fat_100g"])    + "g");
    set("b-nut-salt",   safeFormat(nuts.salt_100g)                + "g");
    set("b-nut-pro",    safeFormat(nuts.proteins_100g)            + "g");

    // Traffic-light badges
    const setBadge = (id, val, modThresh, highThresh) => {
        const badge = document.getElementById(id);
        if (!badge) return;
        if (val === undefined || val === null || isNaN(parseFloat(val))) {
            badge.style.display = "none"; return;
        }
        badge.style.display = "inline-flex";
        badge.className = "b-nut-badge";
        const n = parseFloat(val);
        if (n > highThresh) { badge.textContent = "High";     badge.classList.add("badge-high"); }
        else if (n > modThresh) { badge.textContent = "Moderate"; badge.classList.add("badge-mod"); }
        else { badge.textContent = "Low"; badge.classList.add("badge-low"); }
    };
    setBadge("badge-sugar",  nuts.sugars_100g,             5,   22.5);
    setBadge("badge-fat",    nuts.fat_100g,                3,   17.5);
    setBadge("badge-satfat", nuts["saturated-fat_100g"],   1.5, 5);
    setBadge("badge-salt",   nuts.salt_100g,               0.3, 1.5);

    // Ingredient alerts
    const warningsList = document.getElementById("warnings-list");
    if (warningsList) {
        warningsList.innerHTML = "";
        let addedAlerts = 0;
        const alertIcon = (type) => {
            if (type === "danger" || type === "warning") {
                return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            }
            return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        };
        const addAlert = (type, title, desc) => {
            warningsList.innerHTML += `
                <div class="warning-alert-item alert-${type}">
                    <span class="alert-icon">${alertIcon(type)}</span>
                    <div class="alert-info">
                        <div class="alert-title">${title}</div>
                        <div class="alert-desc">${desc}</div>
                    </div>
                </div>`;
            addedAlerts++;
        };

        if ((nuts.sugars_100g || 0) > 22.5) {
            addAlert("danger", "High Sugar Content",
                `Contains ${safeFormat(nuts.sugars_100g)}g of sugar per 100g.`);
        }
        if (product.additives_n > 0) {
            const addTags = (product.additives_tags || [])
                .map(t => t.replace("en:", "").toUpperCase()).join(", ");
            addAlert("info", `Food Additives Detected (${product.additives_n})`,
                `Contains food additives: ${addTags}`);
        }
        if (product.ingredients_analysis_tags &&
            product.ingredients_analysis_tags.includes("en:palm-oil")) {
            addAlert("warning", "Contains Palm Oil",
                "Contains palm oil, which has environmental concerns.");
        }
        if (product.allergens) {
            addAlert("danger", "Allergens Present",
                product.allergens.replace(/en:/g, ""));
        }

        if (addedAlerts === 0) {
            warningsList.innerHTML = `
                <div class="warning-alert-item" style="background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.3);">
                    <span class="alert-icon">${alertIcon("info")}</span>
                    <div class="alert-info">
                        <div class="alert-title">No Major Warnings</div>
                        <div class="alert-desc">No significant ingredient alerts detected.</div>
                    </div>
                </div>`;
        }
    }

    // Scroll to results
    if (resultsSection) {
        setTimeout(() => resultsSection.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }
}

// ---- Save barcode scan to history ----

function saveBarcodeToHistory(product) {
    let history = [];
    try {
        const raw = localStorage.getItem("food_history");
        if (raw) history = JSON.parse(raw);
    } catch (e) {}

    let displayClass = product.product_name || "Unknown Product";
    if (product.brands) displayClass += ` (${product.brands})`;

    const grade = product.nutriscore_grade
        ? product.nutriscore_grade.toUpperCase()
        : "N/A";

    history.unshift({
        id:         "scan_" + Date.now(),
        created_at: new Date().toISOString(),
        food:       `Barcode: ${displayClass}`,
        confidence: 100,
        calories:   product.nutriments ? product.nutriments["energy-kcal_100g"] : null,
        image_data: product.image_url || null,
        isBarcode:  true,
        grade
    });

    if (history.length > 20) history.pop();
    localStorage.setItem("food_history", JSON.stringify(history));
}

// ---- Demo chip helper ----

function _demoProductFor(grade) {
    return {
        code: "123456789",
        product_name: `Demo Product (${grade})`,
        brands: "Test Brand",
        image_url: "",
        nutriscore_grade: grade.toLowerCase(),
        nova_group: (grade === "A" || grade === "B") ? 1 : 4,
        nutriments: {
            "energy-kcal_100g": 350,
            sugars_100g:        grade === "A" ? 2  : 35,
            fat_100g:           15,
            "saturated-fat_100g": grade === "A" ? 1 : 12,
            salt_100g:          0.5,
            proteins_100g:      5
        }
    };
}

// ---- Restore scanner UI (Scan Again) ----

function resetBarcodeUI() {
    const resultsSection = document.getElementById("barcode-results-section");
    const controlsRow    = document.querySelector(".scanner-controls-row");
    const viewfinder     = document.getElementById("viewfinder-wrapper");
    const manualWrap     = document.querySelector(".manual-barcode-wrapper");
    const demoWrap       = document.querySelector(".demo-grades-wrapper");

    if (resultsSection) resultsSection.style.display = "none";
    if (controlsRow)    controlsRow.style.display    = "flex";
    if (manualWrap)     manualWrap.style.display      = "block";
    if (demoWrap)       demoWrap.style.display        = "block";

    // Restore the viewfinder if it was replaced by a preview image
    if (viewfinder) {
        if (!document.getElementById("barcode-reader")) {
            viewfinder.innerHTML = _viewfinderHTML();
            if (typeof lucide !== "undefined") lucide.createIcons({ root: viewfinder });
        }
        viewfinder.style.display = "block";
    }
}

// ---- Init ----

function initBarcodeScanner() {
    const startBtn       = document.getElementById("start-barcode-btn");
    const stopBtn        = document.getElementById("stop-barcode-btn");
    const barcodeFileInput = document.getElementById("barcode-file-input");
    const btnUploadImg   = document.getElementById("btn-upload-barcode-img");
    const btnLookup      = document.getElementById("btn-barcode-lookup");
    const barcodeInput   = document.getElementById("barcode-input");
    const btnScanAgain   = document.getElementById("btn-scan-again");

    if (startBtn)   startBtn.addEventListener("click",  startBarcodeScanner);
    if (stopBtn)    stopBtn.addEventListener("click",   stopBarcodeScanner);

    // Upload / snap photo
    if (btnUploadImg && barcodeFileInput) {
        btnUploadImg.addEventListener("click", () => barcodeFileInput.click());
    }
    if (barcodeFileInput) {
        barcodeFileInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files.length > 0) {
                scanBarcodeFromFile(e.target.files[0]);
            }
        });
    }

    // Manual lookup
    if (btnLookup && barcodeInput) {
        btnLookup.addEventListener("click", () => {
            const code = barcodeInput.value.trim();
            code ? lookupBarcodeProduct(code) : showToast("Please enter a barcode number.");
        });
    }

    // Scan again
    if (btnScanAgain) btnScanAgain.addEventListener("click", resetBarcodeUI);

    // Demo grade chips
    document.querySelectorAll(".demo-chip").forEach(chip => {
        chip.addEventListener("click", (e) => {
            const grade = e.currentTarget.getAttribute("data-demo-grade");
            if (grade) renderBarcodeResult(_demoProductFor(grade));
        });
    });
}
