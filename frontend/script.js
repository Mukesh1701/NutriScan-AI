
const HOSTNAME = window.location.hostname || "localhost";
const API_URL = `http://${HOSTNAME}:8000`;


const FOOD_CLASSES = [
    "apple", "banana", "beetroot", "bell pepper", "cabbage",
    "capsicum", "carrot", "cauliflower", "chicken", "chilli pepper",
    "corn", "cucumber", "eggplant", "garlic", "ginger",
    "grapes", "jalepeno", "kiwi", "lemon", "lettuce",
    "mango", "onion", "orange", "paprika", "pear",
    "peas", "pineapple", "pomegranate", "potato", "raddish",
    "soy beans", "spinach", "sweetcorn", "sweetpotato", "tomato",
    "turnip", "watermelon"
];


const dropZone = document.getElementById("drop-zone");
const dropDefault = document.getElementById("drop-zone-default");
const previewState = document.getElementById("preview-state");
const previewImage = document.getElementById("preview-image");
const fileInput = document.getElementById("file-input");
const btnRemove = document.getElementById("btn-remove");
const btnAnalyze = document.getElementById("btn-analyze");
const btnAgain = document.getElementById("btn-again");
const resultsSection = document.getElementById("results-section");
const errorToast = document.getElementById("error-toast");
const errorMsg = document.getElementById("error-msg");
const errorClose = document.getElementById("error-close");
// Navigation

const navClassify = document.getElementById("nav-classify");
const navCalculator = document.getElementById("nav-calculator");
const navBarcode = document.getElementById("nav-barcode");
const navHistory = document.getElementById("nav-history");
const navAbout = document.getElementById("nav-about");
const pageClassify = document.getElementById("page-classify");
const pageCalculator = document.getElementById("page-calculator");
const pageBarcode = document.getElementById("page-barcode");
const pageHistory = document.getElementById("page-history");
const pageAbout = document.getElementById("page-about");

// History elements
const histTimeline = document.getElementById("history-timeline");
const histEmpty = document.getElementById("history-empty");
const histTotalScans = document.getElementById("hist-total-scans");
const histTotalCal = document.getElementById("hist-total-cal");
const histTopFood = document.getElementById("hist-top-food");
const histAvgConf = document.getElementById("hist-avg-conf");
const btnClearHistory = document.getElementById("btn-clear-history");
const btnGoClassify = document.getElementById("btn-go-classify");

// Result elements
const resultEmoji = document.getElementById("result-emoji");
const resultName = document.getElementById("result-name");
const confidenceFill = document.getElementById("confidence-fill");
const confidenceLabel = document.getElementById("confidence-label");
const nutCalories = document.getElementById("nut-calories");
const nutProtein = document.getElementById("nut-protein");
const nutCarbs = document.getElementById("nut-carbs");
const nutFat = document.getElementById("nut-fat");
const nutFiber = document.getElementById("nut-fiber");
const top3List = document.getElementById("top3-list");
const macroCanvas = document.getElementById("macro-canvas");
const macroLegend = document.getElementById("macro-legend");
const foodTagsContainer = document.getElementById("food-tags");

// Weight elements
const weightValue = document.getElementById("weight-value");
const weightUnitLabel = document.getElementById("weight-unit-label");
const qtyMinus = document.getElementById("qty-minus");
const qtyPlus = document.getElementById("qty-plus");
const qtyValue = document.getElementById("qty-value");
const manualToggle = document.getElementById("manual-toggle");
const manualInputWrapper = document.getElementById("manual-input-wrapper");
const manualWeightInput = document.getElementById("manual-weight-input");

// View toggle
const viewPer100 = document.getElementById("view-per100");
const viewTotal = document.getElementById("view-total");

// Nutrition unit labels
const nutCaloriesUnit = document.getElementById("nut-calories-unit");
const nutProteinUnit = document.getElementById("nut-protein-unit");
const nutCarbsUnit = document.getElementById("nut-carbs-unit");
const nutFatUnit = document.getElementById("nut-fat-unit");
const nutFiberUnit = document.getElementById("nut-fiber-unit");

// Chat elements
const chatCard = document.getElementById("chat-card");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const btnSend = document.getElementById("btn-send");
const chatChips = document.querySelectorAll(".chat-chip");




let selectedFile = null;

// Weight & nutrition state
let currentData = null;       // Full API response
let quantity = 1;             // Number of items
let useManualWeight = false;  // Manual override active?
let manualWeight = null;      // User-entered grams
let viewMode = "total";       // "per100" or "total"



function switchPage(page) {
    // Remove active from all pills
    navClassify.classList.remove("active");
    if (navCalculator) navCalculator.classList.remove("active");
    if (navBarcode) navBarcode.classList.remove("active");
    navHistory.classList.remove("active");
    navAbout.classList.remove("active");

    // Hide all pages
    pageClassify.style.display = "none";
    if (pageCalculator) pageCalculator.style.display = "none";
    if (pageBarcode) pageBarcode.style.display = "none";
    pageHistory.style.display = "none";
    pageAbout.style.display = "none";

    if (page === "classify") {
        navClassify.classList.add("active");
        pageClassify.style.display = "block";
    } else if (page === "calculator") {
        if (navCalculator) navCalculator.classList.add("active");
        if (pageCalculator) pageCalculator.style.display = "block";
    } else if (page === "barcode") {
        if (navBarcode) navBarcode.classList.add("active");
        if (pageBarcode) pageBarcode.style.display = "block";
    } else if (page === "history") {
        navHistory.classList.add("active");
        pageHistory.style.display = "block";
        loadHistory();
    } else if (page === "about") {
        navAbout.classList.add("active");
        pageAbout.style.display = "block";
        renderFoodTags();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

navClassify.addEventListener("click", () => switchPage("classify"));
if (navCalculator) navCalculator.addEventListener("click", () => switchPage("calculator"));
if (navBarcode) navBarcode.addEventListener("click", () => switchPage("barcode"));
navHistory.addEventListener("click", () => switchPage("history"));
navAbout.addEventListener("click", () => switchPage("about"));

// Empty state CTA
btnGoClassify.addEventListener("click", () => switchPage("classify"));


// ==========================================
// Drag & Drop + Click Upload
// ==========================================

dropZone.addEventListener("click", (e) => {
    if (e.target === btnRemove || e.target.closest(".btn-remove")) return;
    fileInput.click();
});

fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Drag events
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});


// ==========================================
// File Handling
// ==========================================

function handleFile(file) {
    // Validate
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
        showError("Please upload a JPG, PNG, or WEBP image.");
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError("Image too large. Maximum size is 10MB.");
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        dropDefault.style.display = "none";
        previewState.classList.add("visible");
        btnAnalyze.disabled = false;

        // Hide previous results
        resultsSection.classList.remove("visible");
    };
    reader.readAsDataURL(file);
}


// ==========================================
// Remove Image
// ==========================================

btnRemove.addEventListener("click", (e) => {
    e.stopPropagation();
    resetUpload();
});

function resetUpload() {
    selectedFile = null;
    fileInput.value = "";
    previewImage.src = "";
    previewState.classList.remove("visible");
    dropDefault.style.display = "block";
    btnAnalyze.disabled = true;
}


// ==========================================
// Analyze (API Call)
// ==========================================

btnAnalyze.addEventListener("click", async () => {
    if (!selectedFile) return;

    // Loading state
    btnAnalyze.classList.add("loading");
    btnAnalyze.disabled = true;

    try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch(`${API_URL}/predict`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);

    } catch (err) {
        console.error("Prediction error:", err);

        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
            showError("Cannot connect to the API. Make sure the server is running on localhost:8000");
        } else {
            showError(err.message || "Something went wrong. Please try again.");
        }

    } finally {
        btnAnalyze.classList.remove("loading");
        btnAnalyze.disabled = false;
    }
});


// ==========================================
// Display Results
// ==========================================

function displayResults(data) {
    // Store full response for recalculations
    currentData = data;

    // Reset weight state
    quantity = 1;
    useManualWeight = false;
    manualWeight = null;
    manualToggle.checked = false;
    manualInputWrapper.classList.remove("visible");
    manualWeightInput.value = "";
    qtyValue.textContent = "1";
    qtyMinus.disabled = true;

    // Reset Chat UI
    resetChat();

    // Default view mode is "total"
    viewMode = "total";
    viewTotal.classList.add("active");
    viewPer100.classList.remove("active");

    // Scroll to results
    resultsSection.classList.add("visible");

    // Food name & emoji
    const foodName = data.food || "Unknown";
        resultName.textContent = foodName;

    // Confidence bar
    const confidence = data.confidence || 0;
    setTimeout(() => {
        confidenceFill.style.width = `${confidence}%`;
    }, 100);
    confidenceLabel.textContent = `${confidence.toFixed(1)}% confidence`;

    // Weight display
    const estWeight = data.estimated_weight_g || 100;
    const weightUnit = data.weight_unit || "100g serving";
    weightValue.textContent = estWeight;
    weightUnitLabel.textContent = `≈ ${weightUnit}`;

    // Update nutrition based on current view mode
    updateNutritionDisplay();

    // Top 3
    renderTop3(data.top3_predictions || []);

    // Smooth scroll
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
}


// ==========================================
// Weight Calculation Helper
// ==========================================

function getEffectiveWeight() {
    if (!currentData) return 100;

    if (useManualWeight && manualWeight && manualWeight > 0) {
        return manualWeight;
    }

    const baseWeight = currentData.estimated_weight_g || 100;
    return baseWeight * quantity;
}


// ==========================================
// Update Nutrition Display
// ==========================================

function updateNutritionDisplay() {
    if (!currentData) return;

    const per100 = currentData.nutrition_per_100g || {};
    const effectiveWeight = getEffectiveWeight();

    // Update weight display
    weightValue.textContent = Math.round(effectiveWeight);

    if (useManualWeight && manualWeight && manualWeight > 0) {
        weightUnitLabel.textContent = "Manual weight";
    } else if (quantity > 1) {
        const unit = currentData.weight_unit || "items";
        weightUnitLabel.textContent = `≈ ${quantity} × ${unit}`;
    } else {
        weightUnitLabel.textContent = `≈ ${currentData.weight_unit || "100g serving"}`;
    }

    if (viewMode === "per100") {
        // Show per 100g values directly
        animateValue(nutCalories, per100.calories);
        animateValue(nutProtein, per100.protein);
        animateValue(nutCarbs, per100.carbs);
        animateValue(nutFat, per100.fat);
        animateValue(nutFiber, per100.fiber);

        // Update unit labels
        nutCaloriesUnit.textContent = "kcal / 100g";
        nutProteinUnit.textContent = "g / 100g";
        nutCarbsUnit.textContent = "g / 100g";
        nutFatUnit.textContent = "g / 100g";
        nutFiberUnit.textContent = "g / 100g";

        // Macro chart with per-100g values
        drawMacroChart(per100.protein, per100.carbs, per100.fat);

    } else {
        // Calculate total nutrition for effective weight
        const multiplier = effectiveWeight / 100;

        const totalCal = per100.calories !== null ? round2(per100.calories * multiplier) : null;
        const totalPro = per100.protein !== null ? round2(per100.protein * multiplier) : null;
        const totalCarb = per100.carbs !== null ? round2(per100.carbs * multiplier) : null;
        const totalFat = per100.fat !== null ? round2(per100.fat * multiplier) : null;
        const totalFiber = per100.fiber !== null ? round2(per100.fiber * multiplier) : null;

        animateValue(nutCalories, totalCal);
        animateValue(nutProtein, totalPro);
        animateValue(nutCarbs, totalCarb);
        animateValue(nutFat, totalFat);
        animateValue(nutFiber, totalFiber);

        // Update unit labels
        const weightLabel = `${Math.round(effectiveWeight)}g`;
        nutCaloriesUnit.textContent = `kcal / ${weightLabel}`;
        nutProteinUnit.textContent = `g / ${weightLabel}`;
        nutCarbsUnit.textContent = `g / ${weightLabel}`;
        nutFatUnit.textContent = `g / ${weightLabel}`;
        nutFiberUnit.textContent = `g / ${weightLabel}`;

        // Macro chart with scaled values
        drawMacroChart(totalPro, totalCarb, totalFat);
    }

    // Update goal progress widget
    if (typeof updateGoalProgressDisplay === "function") {
        updateGoalProgressDisplay();
    }
}

function round2(val) {
    return Math.round(val * 100) / 100;
}


// ==========================================
// Quantity Stepper
// ==========================================

qtyMinus.addEventListener("click", () => {
    if (quantity > 1) {
        quantity--;
        qtyValue.textContent = quantity;
        qtyMinus.disabled = (quantity <= 1);
        updateNutritionDisplay();
    }
});

qtyPlus.addEventListener("click", () => {
    if (quantity < 99) {
        quantity++;
        qtyValue.textContent = quantity;
        qtyMinus.disabled = false;
        updateNutritionDisplay();
    }
});

// Disable minus at start
qtyMinus.disabled = true;


// ==========================================
// Manual Weight Toggle & Input
// ==========================================

manualToggle.addEventListener("change", () => {
    useManualWeight = manualToggle.checked;

    if (useManualWeight) {
        manualInputWrapper.classList.add("visible");
        // Focus the input after animation
        setTimeout(() => manualWeightInput.focus(), 350);
    } else {
        manualInputWrapper.classList.remove("visible");
        manualWeight = null;
        manualWeightInput.value = "";
    }

    updateNutritionDisplay();
});

manualWeightInput.addEventListener("input", () => {
    const val = parseFloat(manualWeightInput.value);
    if (!isNaN(val) && val > 0) {
        manualWeight = val;
    } else {
        manualWeight = null;
    }
    updateNutritionDisplay();
});


// ==========================================
// View Mode Toggle (Per 100g / Total)
// ==========================================

viewPer100.addEventListener("click", () => {
    viewMode = "per100";
    viewPer100.classList.add("active");
    viewTotal.classList.remove("active");
    updateNutritionDisplay();
});

viewTotal.addEventListener("click", () => {
    viewMode = "total";
    viewTotal.classList.add("active");
    viewPer100.classList.remove("active");
    updateNutritionDisplay();
});


// ==========================================
// Animate Number Values
// ==========================================

function animateValue(element, targetValue) {
    if (targetValue === null || targetValue === undefined) {
        element.textContent = "—";
        return;
    }

    const target = parseFloat(targetValue);
    const duration = 800;
    const startTime = performance.now();
    const isInteger = Number.isInteger(target) || target >= 10;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        element.textContent = isInteger
            ? Math.round(current)
            : current.toFixed(1);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}


// ==========================================
// Macro Donut Chart (Canvas)
// ==========================================

function drawMacroChart(protein, carbs, fat) {
    const ctx = macroCanvas.getContext("2d");
    const size = 180;
    const center = size / 2;
    const radius = 70;
    const lineWidth = 24;

    // Clear
    ctx.clearRect(0, 0, size, size);

    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;
    const total = p + c + f;

    if (total === 0) {
        // Draw empty ring
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(124, 58, 237, 0.08)";
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        return;
    }

    const segments = [
        { value: p, color: "#3b82f6", label: "Protein", unit: "g" },
        { value: c, color: "#f59e0b", label: "Carbs", unit: "g" },
        { value: f, color: "#f97316", label: "Fat", unit: "g" },
    ];

    let startAngle = -Math.PI / 2;
    const gap = 0.04; // gap between segments

    segments.forEach((seg) => {
        const sliceAngle = (seg.value / total) * (Math.PI * 2 - gap * segments.length);

        ctx.beginPath();
        ctx.arc(center, center, radius, startAngle, startAngle + sliceAngle);
        ctx.strokeStyle = seg.color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();

        startAngle += sliceAngle + gap;
    });

    // Center text
    ctx.fillStyle = "#1e1b4b";
    ctx.font = "bold 22px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(total) + "g", center, center - 8);

    ctx.fillStyle = "#6b6394";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("total macros", center, center + 12);

    // Legend
    macroLegend.innerHTML = segments.map(seg => `
        <div class="legend-item">
            <span class="legend-dot" style="background:${seg.color}"></span>
            <span class="legend-label">${seg.label}</span>
            <span class="legend-value">${seg.value.toFixed(1)}${seg.unit}</span>
        </div>
    `).join("");
}


// ==========================================
// Top 3 Predictions
// ==========================================

function renderTop3(predictions) {
    top3List.innerHTML = predictions.map((item, i) => {
        
        const conf = item.confidence || 0;

        return `
            <div class="top3-item" style="animation-delay: ${i * 0.1}s">
                <span class="top3-rank">${i + 1}</span>
                <span class="top3-food">${item.food}</span>
                <div class="top3-bar-wrapper">
                    <div class="top3-bar-bg">
                        <div class="top3-bar-fill" style="width: ${conf}%"></div>
                    </div>
                </div>
                <span class="top3-conf">${conf.toFixed(1)}%</span>
            </div>
        `;
    }).join("");
}


// ==========================================
// Food Tags (About page)
// ==========================================

function renderFoodTags() {
    if (foodTagsContainer.children.length > 0) return;

    foodTagsContainer.innerHTML = FOOD_CLASSES.map(food => {
        
        return `<span class="food-tag">${food}</span>`;
    }).join("");
}


// ==========================================
// Try Again
// ==========================================

btnAgain.addEventListener("click", () => {
    resetUpload();
    resultsSection.classList.remove("visible");

    // Reset confidence bar
    confidenceFill.style.width = "0%";

    // Reset weight state
    currentData = null;
    quantity = 1;
    useManualWeight = false;
    manualWeight = null;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
});


// ==========================================
// Error Toast
// ==========================================

function showError(message) {
    errorMsg.textContent = message;
    errorToast.classList.add("visible");

    // Auto-hide after 6 seconds
    setTimeout(() => {
        errorToast.classList.remove("visible");
    }, 6000);
}

errorClose.addEventListener("click", () => {
    errorToast.classList.remove("visible");
});


// ==========================================
// Keyboard shortcuts
// ==========================================

document.addEventListener("keydown", (e) => {
    // Ctrl+V paste image
    if (e.ctrlKey && e.key === "v") {
        navigator.clipboard.read().then(items => {
            for (const item of items) {
                for (const type of item.types) {
                    if (type.startsWith("image/")) {
                        item.getType(type).then(blob => {
                            const file = new File([blob], "pasted-image.png", { type });
                            handleFile(file);
                        });
                    }
                }
            }
        }).catch(() => {
            // Clipboard API not available or no image
        });
    }
});


// ==========================================
// History — Load & Render
// ==========================================

async function loadHistory() {
    try {
        const res = await fetch(`${API_URL}/history`);
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        let history = data.history || [];
        
        // Merge barcode history
        let localHistoryStr = localStorage.getItem("food_history");
        if (localHistoryStr) {
            try { 
                const localHistory = JSON.parse(localHistoryStr); 
                history = history.concat(localHistory);
            } catch (e) {}
        }
        
        // Sort by created_at descending
        history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        renderHistory(history);
    } catch (err) {
        console.error("History error:", err);
        histTimeline.innerHTML = "";
        histEmpty.style.display = "block";
    }
}

function renderHistory(items) {
    if (!items || items.length === 0) {
        histTimeline.innerHTML = "";
        histTimeline.style.display = "none";
        histEmpty.style.display = "block";
        document.querySelector(".history-toolbar").style.display = "none";
        updateHistoryStats([]);
        return;
    }

    histEmpty.style.display = "none";
    histTimeline.style.display = "flex";
    document.querySelector(".history-toolbar").style.display = "flex";

    updateHistoryStats(items);

    // Group by date
    const groups = {};
    items.forEach(item => {
        const dateKey = formatDateGroup(item.created_at);
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(item);
    });

    let html = "";
    let cardIndex = 0;

    for (const [dateLabel, scans] of Object.entries(groups)) {
        html += `<div class="history-date-group">${dateLabel}</div>`;

        for (const scan of scans) {
            let iconName = ICON_MAP[scan.food] || "help-circle";
            let conf = scan.confidence != null ? scan.confidence.toFixed(1) : "-";
            if (scan.isBarcode) {
                emoji = "";
                conf = "Barcode";
            }
            const timeAgo = getTimeAgo(scan.created_at);
            const delay = Math.min(cardIndex * 0.06, 0.6);

            html += `
            <div class="history-card" style="animation-delay: ${delay}s" data-id="${scan.id}">
                <button class="history-delete-btn" title="Delete scan" data-delete-id="${scan.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
                <div class="history-card-top">
                    <div class="history-card-food">
                        <div class="history-food-emoji"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg></div>
                        <div class="history-food-info">
                            <div class="history-food-name">${scan.food}</div>
                            <div class="history-food-meta">
                                <span class="history-confidence-chip">${scan.isBarcode ? "" : " "}${conf}${scan.isBarcode ? "" : "%"}</span>
                                ${scan.grade ? `<span class="history-grade-chip grade-${scan.grade.toLowerCase()}">Grade ${scan.grade.toUpperCase()}</span>` : ""}
                            </div>
                        </div>
                    </div>
                    <div class="history-time-badge">
                         ${timeAgo}
                    </div>
                </div>
                <div class="history-nutrients">
                    ${scan.weight_g != null ? `<span class="history-nut-chip chip-weight">${Math.round(scan.weight_g)}g</span>` : ""}
                    ${scan.calories != null ? `<span class="history-nut-chip chip-cal">${Math.round(scan.calories)} kcal</span>` : ""}
                    ${scan.protein != null ? `<span class="history-nut-chip chip-pro">${round2(scan.protein)}g pro</span>` : ""}
                    ${scan.carbs != null ? `<span class="history-nut-chip chip-carb">${round2(scan.carbs)}g carb</span>` : ""}
                    ${scan.fat != null ? `<span class="history-nut-chip chip-fat">${round2(scan.fat)}g fat</span>` : ""}
                    ${scan.fiber != null ? `<span class="history-nut-chip chip-fiber">${round2(scan.fiber)}g fiber</span>` : ""}
                </div>
            </div>`;
            cardIndex++;
        }
    }

    histTimeline.innerHTML = html;
    lucide.createIcons({ root: histTimeline });

    // Attach delete handlers
    histTimeline.querySelectorAll(".history-delete-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const id = btn.dataset.deleteId;
            await deleteScan(id);
        });
    });
}

function updateHistoryStats(items) {
    const total = items.length;
    histTotalScans.textContent = total;

    const totalCal = items.reduce((sum, s) => sum + (s.calories || 0), 0);
    histTotalCal.textContent = Math.round(totalCal).toLocaleString();

    // Most scanned food
    if (total > 0) {
        const freq = {};
        items.forEach(s => { freq[s.food] = (freq[s.food] || 0) + 1; });
        const topFood = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
        histTopFood.textContent = topFood;
    } else {
        histTopFood.textContent = "—";
    }

    // Average confidence
    if (total > 0) {
        const avgConf = items.reduce((sum, s) => sum + (s.confidence || 0), 0) / total;
        histAvgConf.textContent = avgConf.toFixed(1) + "%";
    } else {
        histAvgConf.textContent = "—";
    }
}


// ==========================================
// History — Delete & Clear
// ==========================================

async function deleteScan(id) {
    try {
        if (id.toString().startsWith("scan_")) {
            // Delete from local storage
            let historyStr = localStorage.getItem("food_history");
            if (historyStr) {
                let history = JSON.parse(historyStr);
                history = history.filter(item => item.id !== id);
                localStorage.setItem("food_history", JSON.stringify(history));
            }
        } else {
            // Delete from backend
            const res = await fetch(`${API_URL}/history/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
        }
        // Re-render
        loadHistory();
    } catch (err) {
        console.error("Delete error:", err);
        showError("Could not delete scan.");
    }
}

btnClearHistory.addEventListener("click", async () => {
    if (!confirm("Clear all scan history? This cannot be undone.")) return;
    try {
        localStorage.removeItem("food_history");
        const res = await fetch(`${API_URL}/history`, { method: "DELETE" });
        if (!res.ok) throw new Error("Clear failed");
        loadHistory();
    } catch (err) {
        console.error("Clear error:", err);
        showError("Could not clear history.");
    }
});


// ==========================================
// History — Time Helpers
// ==========================================

function getTimeAgo(isoString) {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return "yesterday";
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateGroup(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const scanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today - scanDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}


// ==========================================
// Init
// ==========================================

console.log("NutriScan AI loaded — 37 food classes ready");
console.log(`API endpoint: ${API_URL}`);
console.log("Weight estimation enabled");
console.log("History tracking enabled");

// ==========================================
// Chat Logic
// ==========================================

function resetChat() {
    chatMessages.innerHTML = `
        <div class="chat-message ai-message">
            Hi! I can help you with recipes, diet plans, or any questions about the detected food above. What would you like to know?
        </div>
    `;
    chatInput.value = "";
    btnSend.disabled = false;
}

async function sendChatMessage(text) {
    if (!text.trim() || !currentData) return;

    // 1. Add user message
    const userMsg = document.createElement("div");
    userMsg.className = "chat-message user-message";
    userMsg.textContent = text;
    chatMessages.appendChild(userMsg);

    // Clear input & disable
    chatInput.value = "";
    btnSend.disabled = true;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 2. Add loading indicator
    const loadingMsg = document.createElement("div");
    loadingMsg.className = "chat-message ai-message";
    loadingMsg.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    chatMessages.appendChild(loadingMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 3. Prepare payload
    const effectiveWeight = getEffectiveWeight();
    const multiplier = effectiveWeight / 100;
    const p100 = currentData.nutrition_per_100g || {};
    
    const payload = {
        food: currentData.food,
        weight_g: effectiveWeight,
        calories: p100.calories ? p100.calories * multiplier : 0,
        protein: p100.protein ? p100.protein * multiplier : 0,
        carbs: p100.carbs ? p100.carbs * multiplier : 0,
        fat: p100.fat ? p100.fat * multiplier : 0,
        fiber: p100.fiber ? p100.fiber * multiplier : 0,
        question: text
    };

    // 4. Send request
    try {
        const response = await fetch(`${API_URL}/ai-advice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        
        // Remove loading
        chatMessages.removeChild(loadingMsg);

        // Add AI message
        const aiMsg = document.createElement("div");
        aiMsg.className = "chat-message ai-message";
        // Simple markdown parsing for bold and newlines
        let formatted = data.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\n/g, '<br>');
        aiMsg.innerHTML = formatted;
        
        chatMessages.appendChild(aiMsg);

    } catch (err) {
        chatMessages.removeChild(loadingMsg);
        const errorMsg = document.createElement("div");
        errorMsg.className = "chat-message ai-message";
        errorMsg.style.color = "var(--error)";
        errorMsg.textContent = "Sorry, I couldn't reach the AI service right now. Please try again.";
        chatMessages.appendChild(errorMsg);
    }

    // Re-enable input
    btnSend.disabled = false;
    chatInput.focus();
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Chat Event Listeners
btnSend.addEventListener("click", () => sendChatMessage(chatInput.value));

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        sendChatMessage(chatInput.value);
    }
});

chatChips.forEach(chip => {
    chip.addEventListener("click", () => {
        if (!btnSend.disabled) {
            sendChatMessage(chip.textContent);
        }
    });
});


// ==========================================
// CALORIE CALCULATOR & GOAL TRACKER ENGINE
// ==========================================

let selectedGoal = "loss";
let selectedPace = "moderate";
let selectedGender = "male";
let selectedActivity = 1.55;
let calcHeightUnit = "cm";
let calcWeightUnit = "kg";

// Saved User Goal Profile (Defaults)
let userGoalProfile = {
    goal: "loss",
    pace: "moderate",
    targetCalories: 2000,
    bmr: 1655,
    tdee: 2565,
    bmi: 22.9,
    proteinG: 140,
    carbsG: 232,
    fatG: 64,
    waterL: 2.8,
    saved: false
};

// Storage Keys
const GOAL_PROFILE_KEY = "nutriscan_user_goal_profile";
const TRACKED_MEALS_KEY = "nutriscan_tracked_meals";

// Load Saved Goal Profile
function loadSavedGoalProfile() {
    try {
        const saved = localStorage.getItem(GOAL_PROFILE_KEY);
        if (saved) {
            userGoalProfile = JSON.parse(saved);
        }
    } catch (e) {
        console.warn("Failed to load goal profile:", e);
    }
}

// Save Goal Profile
function saveGoalProfile() {
    try {
        userGoalProfile.saved = true;
        localStorage.setItem(GOAL_PROFILE_KEY, JSON.stringify(userGoalProfile));
        showToast("Goal target saved & applied to NutriScan Scanner! ");
        updateGoalProgressDisplay();
    } catch (e) {
        console.warn("Failed to save goal profile:", e);
    }
}

// Toast helper
function showToast(msg) {
    if (errorToast && errorMsg) {
        errorMsg.textContent = msg;
        errorToast.classList.add("visible");
        setTimeout(() => {
            errorToast.classList.remove("visible");
        }, 3500);
    } else {
        alert(msg);
    }
}

// Get Logged Meals for Today
function getTodayLoggedCalories() {
    try {
        const raw = localStorage.getItem(TRACKED_MEALS_KEY);
        if (!raw) return 0;
        const meals = JSON.parse(raw);
        const todayStr = new Date().toISOString().split("T")[0];
        return meals
            .filter(m => m.date === todayStr)
            .reduce((sum, m) => sum + (m.calories || 0), 0);
    } catch (e) {
        return 0;
    }
}

// Track a Meal into Today's Log
function trackCurrentMeal() {
    if (!currentData) return;
    const effectiveWeight = getEffectiveWeight();
    const multiplier = effectiveWeight / 100;
    const p100 = currentData.nutrition_per_100g || {};
    const calories = p100.calories ? Math.round(p100.calories * multiplier) : 0;

    const todayStr = new Date().toISOString().split("T")[0];
    const meal = {
        id: Date.now(),
        food: currentData.food,
        weight_g: Math.round(effectiveWeight),
        calories: calories,
        date: todayStr,
        timestamp: new Date().toISOString()
    };

    try {
        const raw = localStorage.getItem(TRACKED_MEALS_KEY);
        const meals = raw ? JSON.parse(raw) : [];
        meals.push(meal);
        localStorage.setItem(TRACKED_MEALS_KEY, JSON.stringify(meals));

        const btnTrack = document.getElementById("btn-track-meal");
        if (btnTrack) {
            btnTrack.textContent = "Tracked!";
            btnTrack.style.background = "#10b981";
            setTimeout(() => {
                btnTrack.innerHTML = '<i data-lucide="plus" class="icon-inline"></i> Track Meal';
                lucide.createIcons({ root: btnTrack });
                btnTrack.style.background = "";
            }, 2500);
        }

        updateGoalProgressDisplay();
        showToast(`Tracked ${calories} kcal for ${currentData.food}! `);
    } catch (e) {
        console.error("Error tracking meal:", e);
    }
}

// Update Pace Subtitles depending on selected goal
function updatePaceSubtitles() {
    const subMild = document.getElementById("pace-sub-mild");
    const subMod = document.getElementById("pace-sub-moderate");
    const subAgg = document.getElementById("pace-sub-aggressive");

    if (selectedGoal === "loss") {
        if (subMild) subMild.textContent = "0.25 kg / week (-250 kcal)";
        if (subMod) subMod.textContent = "0.50 kg / week (-500 kcal)";
        if (subAgg) subAgg.textContent = "0.75 kg / week (-750 kcal)";
    } else if (selectedGoal === "maintain") {
        if (subMild) subMild.textContent = "Optimal Balance (0 kcal)";
        if (subMod) subMod.textContent = "Recommended Balance (0 kcal)";
        if (subAgg) subAgg.textContent = "Active Maintenance (0 kcal)";
    } else if (selectedGoal === "gain") {
        if (subMild) subMild.textContent = "0.25 kg / week (+250 kcal)";
        if (subMod) subMod.textContent = "0.50 kg / week (+500 kcal)";
        if (subAgg) subAgg.textContent = "0.75 kg / week (+750 kcal)";
    }
}

// Primary Calculation Function
function calculateAndDisplayResults() {
    const ageInput = document.getElementById("calc-age");
    const age = parseInt(ageInput ? ageInput.value : 25) || 25;

    // Height in cm
    let heightCm = 175;
    if (calcHeightUnit === "cm") {
        const hInput = document.getElementById("calc-height");
        heightCm = parseFloat(hInput ? hInput.value : 175) || 175;
    } else {
        const ftInput = document.getElementById("calc-height-ft");
        const inInput = document.getElementById("calc-height-in");
        const ft = parseFloat(ftInput ? ftInput.value : 5) || 5;
        const inc = parseFloat(inInput ? inInput.value : 9) || 0;
        heightCm = (ft * 12 + inc) * 2.54;
    }

    // Weight in kg
    let weightKg = 70;
    const wInput = document.getElementById("calc-weight");
    const valW = parseFloat(wInput ? wInput.value : 70) || 70;
    if (calcWeightUnit === "kg") {
        weightKg = valW;
    } else {
        weightKg = valW / 2.20462;
    }

    // 1. Mifflin-St Jeor BMR Equation
    let bmr = 0;
    if (selectedGender === "male") {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }
    bmr = Math.round(bmr);

    // 2. TDEE
    const tdee = Math.round(bmr * selectedActivity);

    // 3. Recommended Target Calories
    let offset = 0;
    if (selectedPace === "mild") offset = 250;
    else if (selectedPace === "moderate") offset = 500;
    else if (selectedPace === "aggressive") offset = 750;

    let targetCalories = tdee;
    let paceDescription = "Maintains current bodyweight with zero daily calorie imbalance.";

    if (selectedGoal === "loss") {
        targetCalories = Math.max(1200, tdee - offset);
        const rate = (offset / 1000).toFixed(2);
        paceDescription = `Estimated weight loss rate: <strong>-${rate} kg / week</strong> with a ${offset} kcal daily deficit.`;
    } else if (selectedGoal === "gain") {
        targetCalories = tdee + offset;
        const rate = (offset / 1000).toFixed(2);
        paceDescription = `Estimated muscle & weight gain rate: <strong>+${rate} kg / week</strong> with a ${offset} kcal daily surplus.`;
    }

    // 4. BMI
    const heightM = heightCm / 100;
    const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
    let bmiCategory = "Normal BMI";
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi >= 25 && bmi < 30) bmiCategory = "Overweight";
    else if (bmi >= 30) bmiCategory = "Obese";

    // 5. Recommended Macros
    let proteinG = Math.round(weightKg * (selectedGoal === "maintain" ? 1.6 : 2.0));
    let proteinCal = proteinG * 4;

    let fatCal = Math.round(targetCalories * (selectedGoal === "gain" ? 0.30 : 0.26));
    let fatG = Math.round(fatCal / 9);

    let carbCal = Math.max(0, targetCalories - proteinCal - fatCal);
    let carbG = Math.round(carbCal / 4);

    let proPct = Math.round((proteinCal / targetCalories) * 100);
    let carbPct = Math.round((carbCal / targetCalories) * 100);
    let fatPct = Math.round((fatCal / targetCalories) * 100);

    // 6. Water intake
    const waterL = (weightKg * 0.038).toFixed(1);

    // Store in global object
    userGoalProfile = {
        goal: selectedGoal,
        pace: selectedPace,
        targetCalories: targetCalories,
        bmr: bmr,
        tdee: tdee,
        bmi: bmi,
        bmiCat: bmiCategory,
        proteinG: proteinG,
        proteinCal: proteinCal,
        carbsG: carbG,
        carbsCal: carbCal,
        fatG: fatG,
        fatCal: fatCal,
        proPct: proPct,
        carbPct: carbPct,
        fatPct: fatPct,
        waterL: waterL,
        saved: true
    };

    // Render results in DOM
    const badgeEl = document.getElementById("target-goal-badge");
    if (badgeEl) {
        const goalTitles = { loss: "Weight Loss Goal", maintain: "Weight Maintenance Goal", gain: "Weight Gain Goal" };
        badgeEl.textContent = goalTitles[selectedGoal] || " Daily Goal Target";
    }

    const valEl = document.getElementById("target-cal-val");
    if (valEl) animateValue(valEl, targetCalories);

    const paceEl = document.getElementById("target-pace-text");
    if (paceEl) paceEl.innerHTML = paceDescription;

    const tdeeEl = document.getElementById("metric-tdee");
    if (tdeeEl) tdeeEl.textContent = tdee.toLocaleString();

    const bmrEl = document.getElementById("metric-bmr");
    if (bmrEl) bmrEl.textContent = bmr.toLocaleString();

    const bmiEl = document.getElementById("metric-bmi");
    if (bmiEl) bmiEl.textContent = bmi;

    const bmiCatEl = document.getElementById("metric-bmi-cat");
    if (bmiCatEl) bmiCatEl.textContent = bmiCategory;

    // Macro Cards
    const proGEl = document.getElementById("target-pro-g");
    const proCalEl = document.getElementById("target-pro-cal");
    const barProEl = document.getElementById("bar-pro-fill");
    if (proGEl) proGEl.textContent = `${proteinG}g`;
    if (proCalEl) proCalEl.textContent = `${proteinCal} kcal · ${proPct}%`;
    if (barProEl) barProEl.style.width = `${proPct}%`;

    const carbGEl = document.getElementById("target-carb-g");
    const carbCalEl = document.getElementById("target-carb-cal");
    const barCarbEl = document.getElementById("bar-carb-fill");
    if (carbGEl) carbGEl.textContent = `${carbG}g`;
    if (carbCalEl) carbCalEl.textContent = `${carbCal} kcal · ${carbPct}%`;
    if (barCarbEl) barCarbEl.style.width = `${carbPct}%`;

    const fatGEl = document.getElementById("target-fat-g");
    const fatCalEl = document.getElementById("target-fat-cal");
    const barFatEl = document.getElementById("bar-fat-fill");
    if (fatGEl) fatGEl.textContent = `${fatG}g`;
    if (fatCalEl) fatCalEl.textContent = `${fatCal} kcal · ${fatPct}%`;
    if (barFatEl) barFatEl.style.width = `${fatPct}%`;

    // Smart Insights
    const waterEl = document.getElementById("advice-water");
    if (waterEl) waterEl.textContent = `Drink at least ${waterL} Liters (≈ ${(waterL * 4).toFixed(0)} glasses) of water daily for optimal digestion and cellular metabolism.`;

    const nutTipEl = document.getElementById("advice-nutrition");
    if (nutTipEl) {
        if (selectedGoal === "loss") {
            nutTipEl.textContent = "Focus on high-volume, low-calorie foods like spinach, cucumber, and chicken breast to keep hunger away during your calorie deficit.";
        } else if (selectedGoal === "maintain") {
            nutTipEl.textContent = "Maintain a balanced split of healthy fats, complex carbs, and lean proteins to sustain your daily energy levels.";
        } else {
            nutTipEl.textContent = "Incorporate dense nutrition like avocado, nuts, bananas, and whole eggs to meet your muscle-building calorie surplus.";
        }
    }

    // Display Results Container
    const calcResultsSec = document.getElementById("calc-results-section");
    if (calcResultsSec) {
        calcResultsSec.style.display = "block";
        setTimeout(() => {
            calcResultsSec.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
    }

    // Automatically update scanner goal progress widget
    updateGoalProgressDisplay();
}

// Update Goal Progress Card in Classify Page & History
function updateGoalProgressDisplay() {
    const card = document.getElementById("goal-progress-card");
    if (!card) return;

    const goalNameEl = document.getElementById("scan-goal-name");
    const mealCalEl = document.getElementById("meal-impact-calories");
    const mealPctEl = document.getElementById("meal-impact-percent");
    const mealRemEl = document.getElementById("meal-impact-remaining");
    const barFillEl = document.getElementById("goal-progress-bar-fill");
    const barLblEl = document.getElementById("goal-progress-bar-label");

    const targetCal = userGoalProfile.targetCalories || 2000;
    const goalLabels = { loss: "Weight Loss", maintain: "Maintenance", gain: "Weight Gain" };
    const goalLabel = goalLabels[userGoalProfile.goal] || "Fitness Target";

    if (goalNameEl) {
        goalNameEl.textContent = `Target: ${targetCal.toLocaleString()} kcal (${goalLabel})`;
    }

    // Get current scanned meal calories
    let mealCal = 0;
    if (currentData) {
        const effectiveWeight = getEffectiveWeight();
        const multiplier = effectiveWeight / 100;
        const p100 = currentData.nutrition_per_100g || {};
        mealCal = p100.calories ? Math.round(p100.calories * multiplier) : 0;
    }

    const todayLoggedCal = getTodayLoggedCalories();
    const totalWithMeal = todayLoggedCal + mealCal;
    const remaining = Math.max(0, targetCal - totalWithMeal);
    const mealPct = ((mealCal / targetCal) * 100).toFixed(1);
    const todayPct = Math.min(100, Math.round((totalWithMeal / targetCal) * 100));

    if (mealCalEl) mealCalEl.textContent = `${mealCal} kcal`;
    if (mealPctEl) mealPctEl.textContent = `${mealPct}%`;
    if (mealRemEl) mealRemEl.textContent = `${remaining.toLocaleString()} kcal`;
    if (barFillEl) barFillEl.style.width = `${todayPct}%`;
    if (barLblEl) barLblEl.textContent = `${totalWithMeal.toLocaleString()} / ${targetCal.toLocaleString()} kcal logged today (${todayPct}%)`;
}

// Initialize Calculator Event Handlers
function initCalculator() {
    loadSavedGoalProfile();

    // Goal Cards
    const goalLoss = document.getElementById("goal-card-loss");
    const goalMaintain = document.getElementById("goal-card-maintain");
    const goalGain = document.getElementById("goal-card-gain");

    function setGoal(goal) {
        selectedGoal = goal;
        [goalLoss, goalMaintain, goalGain].forEach(c => {
            if (c) c.classList.remove("active");
        });
        if (goal === "loss" && goalLoss) goalLoss.classList.add("active");
        if (goal === "maintain" && goalMaintain) goalMaintain.classList.add("active");
        if (goal === "gain" && goalGain) goalGain.classList.add("active");

        updatePaceSubtitles();
    }

    if (goalLoss) goalLoss.addEventListener("click", () => setGoal("loss"));
    if (goalMaintain) goalMaintain.addEventListener("click", () => setGoal("maintain"));
    if (goalGain) goalGain.addEventListener("click", () => setGoal("gain"));

    // Pace Buttons
    const paceButtons = document.querySelectorAll(".pace-btn");
    paceButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            paceButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedPace = btn.dataset.pace;
        });
    });

    // Gender Buttons
    const genderMale = document.getElementById("gender-male");
    const genderFemale = document.getElementById("gender-female");
    if (genderMale && genderFemale) {
        genderMale.addEventListener("click", () => {
            genderMale.classList.add("active");
            genderFemale.classList.remove("active");
            selectedGender = "male";
        });
        genderFemale.addEventListener("click", () => {
            genderFemale.classList.add("active");
            genderMale.classList.remove("active");
            selectedGender = "female";
        });
    }

    // Height Unit Toggles
    const unitHeightCm = document.getElementById("unit-height-cm");
    const unitHeightFt = document.getElementById("unit-height-ft");
    const heightCmWrapper = document.getElementById("height-cm-wrapper");
    const heightFtWrapper = document.getElementById("height-ft-wrapper");

    if (unitHeightCm && unitHeightFt) {
        unitHeightCm.addEventListener("click", () => {
            unitHeightCm.classList.add("active");
            unitHeightFt.classList.remove("active");
            if (heightCmWrapper) heightCmWrapper.style.display = "flex";
            if (heightFtWrapper) heightFtWrapper.style.display = "none";
            calcHeightUnit = "cm";
        });
        unitHeightFt.addEventListener("click", () => {
            unitHeightFt.classList.add("active");
            unitHeightCm.classList.remove("active");
            if (heightCmWrapper) heightCmWrapper.style.display = "none";
            if (heightFtWrapper) heightFtWrapper.style.display = "grid";
            calcHeightUnit = "ft";
        });
    }

    // Weight Unit Toggles
    const unitWeightKg = document.getElementById("unit-weight-kg");
    const unitWeightLbs = document.getElementById("unit-weight-lbs");
    const weightUnitTag = document.getElementById("weight-unit-tag");

    if (unitWeightKg && unitWeightLbs) {
        unitWeightKg.addEventListener("click", () => {
            unitWeightKg.classList.add("active");
            unitWeightLbs.classList.remove("active");
            if (weightUnitTag) weightUnitTag.textContent = "kg";
            calcWeightUnit = "kg";
        });
        unitWeightLbs.addEventListener("click", () => {
            unitWeightLbs.classList.add("active");
            unitWeightKg.classList.remove("active");
            if (weightUnitTag) weightUnitTag.textContent = "lbs";
            calcWeightUnit = "lbs";
        });
    }

    // Activity Cards
    const activityCards = document.querySelectorAll(".activity-card");
    activityCards.forEach(card => {
        card.addEventListener("click", () => {
            activityCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            selectedActivity = parseFloat(card.dataset.activity) || 1.55;
        });
    });

    // Calculate Button
    const btnCalculate = document.getElementById("btn-calculate");
    if (btnCalculate) {
        btnCalculate.addEventListener("click", calculateAndDisplayResults);
    }

    // Save Goal Button
    const btnSaveGoal = document.getElementById("btn-save-goal");
    if (btnSaveGoal) {
        btnSaveGoal.addEventListener("click", saveGoalProfile);
    }

    // Track Meal Button
    const btnTrack = document.getElementById("btn-track-meal");
    if (btnTrack) {
        btnTrack.addEventListener("click", trackCurrentMeal);
    }

    // Initial calculations if profile exists
    updateGoalProgressDisplay();
}

// Run init on DOM Ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCalculator);
} else {
    initCalculator();
}


// ===============================
// BARCODE SCANNER
// ===============================

let barcodeScanner = null;
let scannerRunning = false;

function startBarcodeScanner() {
    const reader = document.getElementById("barcode-reader");

    if (!reader) {
        console.error("Barcode reader element not found");
        return;
    }

    if (scannerRunning) {
        return;
    }

    const startBtn = document.getElementById("start-barcode-btn");
    const stopBtn = document.getElementById("stop-barcode-btn");

    // formatsToSupport MUST go in the constructor, NOT in start() config
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
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
        }
    });

    // Make scan box responsive to screen width
    const screenW = Math.min(window.innerWidth - 40, 500);
    const boxW = Math.floor(screenW * 0.85);
    const boxH = Math.floor(boxW * 0.35);

    const scanConfig = {
        fps: 30,
        qrbox: { width: boxW, height: boxH },
        // Request high resolution + autofocus for reliable barcode reading
        videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            advanced: [{ focusMode: "continuous" }]
        }
    };

    barcodeScanner.start(
        { facingMode: "environment" },
        scanConfig,

        (decodedText) => {
            console.log("Barcode detected:", decodedText);

            // Put barcode into manual input
            const input = document.getElementById("barcode-input");
            if (input) {
                input.value = decodedText;
            }

            // Stop scanner after successful scan
            stopBarcodeScanner();

            // Look up the product in the Open Food Facts API
            showToast("Barcode detected: " + decodedText);
            lookupBarcodeProduct(decodedText);
        },

        (errorMessage) => {
            // Ignore continuous scanning errors (normal while searching)
        }
    )
    .then(() => {
        scannerRunning = true;
        console.log("Barcode scanner started successfully");
        if (startBtn) startBtn.style.display = "none";
        if (stopBtn) stopBtn.style.display = "inline-flex";
        showToast("Camera ready! Point at a barcode.");
    })
    .catch((error) => {
        console.error("Could not start barcode scanner:", error);
        showToast("Could not access camera. Make sure you're on HTTPS and allow camera permission.");
    });
}


function stopBarcodeScanner() {
    if (!barcodeScanner || !scannerRunning) {
        return;
    }

    const startBtn = document.getElementById("start-barcode-btn");
    const stopBtn = document.getElementById("stop-barcode-btn");

    barcodeScanner.stop()
        .then(() => {
            barcodeScanner.clear();
            scannerRunning = false;
            console.log("Barcode scanner stopped");
            if (startBtn) startBtn.style.display = "inline-flex";
            if (stopBtn) stopBtn.style.display = "none";
        })
        .catch((error) => {
            console.error("Error stopping scanner:", error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-barcode-btn");
    const stopButton = document.getElementById("stop-barcode-btn");
    const fileInput = document.getElementById("barcode-file-input");

    if (startButton) {
        startButton.addEventListener("click", () => {
            startBarcodeScanner();
        });
    }

    if (stopButton) {
        stopButton.addEventListener("click", () => {
            stopBarcodeScanner();
        });
    }

    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files.length > 0) {
                scanBarcodeFromFile(e.target.files[0]);
            }
        });
    }

    const btnUploadImg = document.getElementById("btn-upload-barcode-img");
    if (btnUploadImg && fileInput) {
        btnUploadImg.addEventListener("click", () => {
            fileInput.click();
        });
    }
});

// Scan Barcode from Image File (Mobile Camera Photo or Gallery)
async function scanBarcodeFromFile(file) {
    if (!file) return;

    showToast("Reading barcode from photo... ");
    console.log("scanBarcodeFromFile called with file:", file.name, file.size);

    // Show the uploaded image as a preview in the viewfinder area
    const viewfinder = document.getElementById("viewfinder-wrapper");
    if (viewfinder) {
        const imgURL = URL.createObjectURL(file);
        viewfinder.innerHTML = `<img src="${imgURL}" style="width:100%;max-height:300px;object-fit:contain;border-radius:12px;margin:8px 0;" alt="Uploaded barcode photo">
        <p style="text-align:center;color:var(--text-muted);font-size:0.85rem;margin-top:6px;">Scanning for barcode...</p>`;
        viewfinder.style.display = "block";
    }

    let decoded = null;

    // Strategy 1: Use native BarcodeDetector API (Chrome 83+, very reliable)
    if ('BarcodeDetector' in window) {
        try {
            const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] });
            const bitmap = await createImageBitmap(file);
            const results = await detector.detect(bitmap);
            if (results.length > 0) {
                decoded = results[0].rawValue;
                console.log("BarcodeDetector decoded:", decoded);
            }
        } catch (e) {
            console.warn("BarcodeDetector failed:", e);
        }
    }

    // Strategy 2: Fall back to html5-qrcode scanFile
    if (!decoded) {
        try {
            const tempDiv = document.getElementById("file-scanner-temp") || document.getElementById("barcode-reader");
            const html5QrCode = new Html5Qrcode(tempDiv.id);
            decoded = await html5QrCode.scanFile(file, true);
            console.log("html5-qrcode decoded:", decoded);
        } catch (e) {
            console.warn("html5-qrcode scanFile failed:", e);
        }
    }

    // Reset file input so user can pick same file again
    const fileInput = document.getElementById("barcode-file-input");
    if (fileInput) fileInput.value = "";

    if (decoded) {
        const input = document.getElementById("barcode-input");
        if (input) input.value = decoded;
        showToast(`Barcode detected: ${decoded}! `);
        lookupBarcodeProduct(decoded);
    } else {
        showToast("Could not detect barcode from this photo. Please try again or type the numbers manually.");
        // Restore the viewfinder
        if (viewfinder) {
            viewfinder.innerHTML = `<div id="barcode-reader" class="barcode-reader-box">
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
    }
}


// ==========================================
// OPEN FOOD FACTS API & BARCODE LOGIC
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // Manual Barcode Lookup
    const btnLookup = document.getElementById("btn-barcode-lookup");
    const barcodeInput = document.getElementById("barcode-input");
    
    if (btnLookup && barcodeInput) {
        btnLookup.addEventListener("click", () => {
            const code = barcodeInput.value.trim();
            if (code) {
                lookupBarcodeProduct(code);
            } else {
                showToast("Please enter a barcode number.");
            }
        });
    }

    // Scan Another Product
    const btnScanAgain = document.getElementById("btn-scan-again");
    if (btnScanAgain) {
        btnScanAgain.addEventListener("click", () => {
            document.getElementById("barcode-results-section").style.display = "none";
            document.querySelector(".scanner-controls-row").style.display = "flex";
            document.getElementById("viewfinder-wrapper").style.display = "block";
            document.querySelector(".manual-barcode-wrapper").style.display = "block";
        });
    }

    // Demo Chips (Testing)
    const demoChips = document.querySelectorAll(".demo-chip");
    demoChips.forEach(chip => {
        chip.addEventListener("click", (e) => {
            const grade = e.target.getAttribute("data-demo-grade");
            renderBarcodeResult({
                code: "123456789",
                product_name: "Demo Product (" + grade + ")",
                brands: "Test Brand",
                image_url: "",
                nutriscore_grade: grade.toLowerCase(),
                nova_group: grade === "A" || grade === "B" ? 1 : 4,
                nutriments: {
                    energy_100g: 1500,
                    sugars_100g: grade === "A" ? 2 : 35,
                    fat_100g: 15,
                    "saturated-fat_100g": grade === "A" ? 1 : 12,
                    salt_100g: 0.5,
                    proteins_100g: 5
                }
            });
        });
    });
});

async function lookupBarcodeProduct(barcode) {
    showToast("Looking up product in database... ");
    
    try {
        // Try v2 API first
        let response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
        let data;
        
        if (response.ok) {
            data = await response.json();
        }
        
        // If v2 returned 404 or product not found, try v0 as fallback
        if (!data || data.status !== 1) {
            response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            if (response.ok) {
                data = await response.json();
            }
        }
        
        if (data && data.status === 1 && data.product) {
            showToast("Product found! ");
            renderBarcodeResult(data.product);
            saveBarcodeToHistory(data.product);
        } else {
            showToast("Product not found in database. Try a different barcode. ");
        }
    } catch (error) {
        console.error("API Error:", error);
        showToast("Error connecting to database. Please check your internet connection.");
    }
}

function calculateBackupGrade(nutriments) {
    let score = 0;
    const sugars = nutriments.sugars_100g || 0;
    if (sugars > 45) score += 10;
    else if (sugars > 18) score += 5;
    
    const satFat = nutriments["saturated-fat_100g"] || 0;
    if (satFat > 10) score += 10;
    else if (satFat > 5) score += 5;
    
    const sodium = (nutriments.salt_100g || 0) * 400; 
    if (sodium > 900) score += 10;
    
    const fiber = nutriments.fiber_100g || 0;
    if (fiber > 4.7) score -= 5;
    
    const protein = nutriments.proteins_100g || 0;
    if (protein > 8) score -= 5;
    
    if (score <= -1) return "a";
    if (score <= 2) return "b";
    if (score <= 10) return "c";
    if (score <= 18) return "d";
    return "e";
}

function renderBarcodeResult(product) {
    const resultsSection = document.getElementById("barcode-results-section");
    const controlsRow = document.querySelector(".scanner-controls-row");
    const viewfinder = document.getElementById("viewfinder-wrapper");
    const manualWrap = document.querySelector(".manual-barcode-wrapper");
    
    if (controlsRow) controlsRow.style.display = "none";
    if (viewfinder) viewfinder.style.display = "none";
    if (manualWrap) manualWrap.style.display = "none";
    resultsSection.style.display = "block";
    
    // Make sure scanner is stopped
    stopBarcodeScanner();

    let grade = "e";
    if (product.nutriscore_grade && product.nutriscore_grade !== "unknown") {
        grade = product.nutriscore_grade.toLowerCase();
    } else if (product.nutriments) {
        grade = calculateBackupGrade(product.nutriments);
    }
    
    if (!["a", "b", "c", "d", "e", "f"].includes(grade)) {
        grade = "e";
    }

    const gradeUpper = grade.toUpperCase();
    
    const heroBanner = document.getElementById("grade-hero-banner");
    heroBanner.className = "grade-hero-card";
    heroBanner.classList.add(`grade-${grade}-theme`);
    
    document.getElementById("grade-letter-display").textContent = gradeUpper;
    
    const tagLines = {
        'A': 'Excellent Nutritional Quality',
        'B': 'Good Nutritional Quality',
        'C': 'Moderate Nutritional Quality',
        'D': 'Poor Nutritional Quality',
        'E': 'Bad Nutritional Quality',
        'F': 'Avoid Consuming'
    };
    
    const descriptions = {
        'A': 'Excellent choice! Very healthy, balanced profile. Consume regularly.',
        'B': 'Good choice. Mostly healthy, suitable for regular consumption.',
        'C': 'Moderate choice. Okay to consume, but watch portion sizes.',
        'D': 'Poor choice. Contains high amounts of sugar, fat, or salt. Limit intake.',
        'E': 'Unhealthy. Very high in sugar, saturated fats, or salt. Consume rarely.',
        'F': 'Extremely unhealthy. Avoid consumption due to poor nutritional profile.'
    };
    
    document.getElementById("grade-pill-tag").textContent = tagLines[gradeUpper] || 'Unknown';
    document.getElementById("grade-main-title").textContent = `Grade ${gradeUpper} — ${tagLines[gradeUpper]}`;
    document.getElementById("grade-description").textContent = descriptions[gradeUpper] || '';
    
    const novaBadge = document.getElementById("grade-nova-badge");
    const novaGroup = product.nova_group;
    if (novaGroup) {
        novaBadge.style.display = "inline-flex";
        if (novaGroup == 1) novaBadge.textContent = "NOVA 1 · Unprocessed";
        else if (novaGroup == 2) novaBadge.textContent = "NOVA 2 · Processed Culinary Ing.";
        else if (novaGroup == 3) novaBadge.textContent = "NOVA 3 · Processed";
        else novaBadge.textContent = "NOVA 4 · Ultra-Processed";
    } else {
        novaBadge.style.display = "none";
    }

    const imgEl = document.getElementById("barcode-prod-img");
    imgEl.src = product.image_url || 'https://images.openfoodfacts.org/images/icons/dist/packaging.svg';
    
    document.getElementById("barcode-prod-brand").textContent = product.brands || "Unknown Brand";
    document.getElementById("barcode-prod-name").textContent = product.product_name || "Unknown Product";
    document.getElementById("barcode-prod-code").textContent = `Barcode: ${product.code || product._id || 'N/A'}`;
    
    let catStr = product.categories || "";
    let firstCat = catStr.split(',')[0].trim();
    document.getElementById("barcode-prod-cat").textContent = firstCat ? `Category: ${firstCat}` : "Category: Unknown";

    const nuts = product.nutriments || {};
    const safeFormat = (val) => val !== undefined && val !== null ? parseFloat(val).toFixed(1) : "?";
    const calVal = nuts['energy-kcal_100g'] !== undefined ? nuts['energy-kcal_100g'] : 
                   (nuts.energy_100g ? (nuts.energy_100g / 4.184) : null);
    
    document.getElementById("b-nut-cal").textContent = safeFormat(calVal);
    document.getElementById("b-nut-sugar").textContent = safeFormat(nuts.sugars_100g) + "g";
    document.getElementById("b-nut-fat").textContent = safeFormat(nuts.fat_100g) + "g";
    document.getElementById("b-nut-satfat").textContent = safeFormat(nuts["saturated-fat_100g"]) + "g";
    document.getElementById("b-nut-salt").textContent = safeFormat(nuts.salt_100g) + "g";
    document.getElementById("b-nut-pro").textContent = safeFormat(nuts.proteins_100g) + "g";

    const setBadge = (id, val, modThresh, highThresh) => {
        const badge = document.getElementById(id);
        if (val === undefined || val === null || isNaN(val)) {
            badge.style.display = "none";
            return;
        }
        badge.style.display = "inline-flex";
        badge.className = "b-nut-badge";
        if (val > highThresh) {
            badge.textContent = "High";
            badge.classList.add("badge-high");
        } else if (val > modThresh) {
            badge.textContent = "Moderate";
            badge.classList.add("badge-mod");
        } else {
            badge.textContent = "Low";
            badge.classList.add("badge-low");
        }
    };
    
    setBadge("badge-sugar", nuts.sugars_100g, 5, 22.5);
    setBadge("badge-fat", nuts.fat_100g, 3, 17.5);
    setBadge("badge-satfat", nuts["saturated-fat_100g"], 1.5, 5);
    setBadge("badge-salt", nuts.salt_100g, 0.3, 1.5);

    const warningsList = document.getElementById("warnings-list");
    warningsList.innerHTML = "";
    let addedAlerts = 0;
    
    if (nuts.sugars_100g > 22.5) {
        warningsList.innerHTML += `
            <div class="warning-alert-item alert-danger">
                <span class="alert-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span>
                <div class="alert-info">
                    <div class="alert-title">High Sugar Content</div>
                    <div class="alert-desc">Contains ${safeFormat(nuts.sugars_100g)}g of sugar per 100g.</div>
                </div>
            </div>`;
        addedAlerts++;
    }
    
    if (product.additives_n > 0) {
        const addTags = (product.additives_tags || []).map(t => t.replace('en:', '').toUpperCase()).join(', ');
        warningsList.innerHTML += `
            <div class="warning-alert-item alert-info">
                <span class="alert-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>
                <div class="alert-info">
                    <div class="alert-title">Food Additives Detected (${product.additives_n})</div>
                    <div class="alert-desc">Contains food additives: ${addTags}</div>
                </div>
            </div>`;
        addedAlerts++;
    }
    
    if (product.ingredients_analysis_tags && product.ingredients_analysis_tags.includes('en:palm-oil')) {
        warningsList.innerHTML += `
            <div class="warning-alert-item alert-warning">
                <span class="alert-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span>
                <div class="alert-info">
                    <div class="alert-title">Contains Palm Oil</div>
                    <div class="alert-desc">Contains palm oil, which has environmental concerns.</div>
                </div>
            </div>`;
        addedAlerts++;
    }
    
    if (product.allergens) {
        warningsList.innerHTML += `
            <div class="warning-alert-item alert-danger">
                <span class="alert-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span>
                <div class="alert-info">
                    <div class="alert-title">Allergens Present</div>
                    <div class="alert-desc">${product.allergens.replace(/en:/g, '')}</div>
                </div>
            </div>`;
        addedAlerts++;
    }
    
    if (addedAlerts === 0) {
        warningsList.innerHTML = `
            <div class="warning-alert-item" style="background: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.3);">
                <span class="alert-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>
                <div class="alert-info">
                    <div class="alert-title">No Major Warnings</div>
                    <div class="alert-desc">No significant ingredient alerts detected.</div>
                </div>
            </div>`;
    }
}

function saveBarcodeToHistory(product) {
    let historyStr = localStorage.getItem("food_history");
    let history = [];
    if (historyStr) {
        try { history = JSON.parse(historyStr); } catch (e) {}
    }

    let displayClass = product.product_name || "Unknown Product";
    if (product.brands) displayClass += ` (${product.brands})`;
    
    let grade = product.nutriscore_grade ? product.nutriscore_grade.toUpperCase() : "N/A";

    const newItem = {
        id: "scan_" + Date.now(),
        created_at: new Date().toISOString(),
        food: `Barcode: ${displayClass}`,
        confidence: 100,
        calories: product.nutriments ? product.nutriments['energy-kcal_100g'] : null,
        image_data: product.image_url || null,
        isBarcode: true,
        grade: grade
    };

    history.unshift(newItem);
    if (history.length > 20) history.pop();
    
    localStorage.setItem("food_history", JSON.stringify(history));
}





