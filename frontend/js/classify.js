// ==========================================
// NutriScan AI — Classify Page
// ==========================================

// ---- Weight helpers ----

function getEffectiveWeight() {
    if (!currentData) return 100;
    if (useManualWeight && manualWeight && manualWeight > 0) return manualWeight;
    const baseWeight = currentData.estimated_weight_g || 100;
    return baseWeight * quantity;
}

function updateNutritionDisplay() {
    if (!currentData) return;

    const per100 = currentData.nutrition_per_100g || {};
    const effectiveWeight = getEffectiveWeight();

    const weightValue     = document.getElementById("weight-value");
    const weightUnitLabel = document.getElementById("weight-unit-label");
    const nutCalories     = document.getElementById("nut-calories");
    const nutProtein      = document.getElementById("nut-protein");
    const nutCarbs        = document.getElementById("nut-carbs");
    const nutFat          = document.getElementById("nut-fat");
    const nutFiber        = document.getElementById("nut-fiber");
    const nutCaloriesUnit = document.getElementById("nut-calories-unit");
    const nutProteinUnit  = document.getElementById("nut-protein-unit");
    const nutCarbsUnit    = document.getElementById("nut-carbs-unit");
    const nutFatUnit      = document.getElementById("nut-fat-unit");
    const nutFiberUnit    = document.getElementById("nut-fiber-unit");

    if (weightValue) weightValue.textContent = Math.round(effectiveWeight);

    if (weightUnitLabel) {
        if (useManualWeight && manualWeight && manualWeight > 0) {
            weightUnitLabel.textContent = "Manual weight";
        } else if (quantity > 1) {
            const unit = currentData.weight_unit || "items";
            weightUnitLabel.textContent = `≈ ${quantity} × ${unit}`;
        } else {
            weightUnitLabel.textContent = `≈ ${currentData.weight_unit || "100g serving"}`;
        }
    }

    if (viewMode === "per100") {
        if (nutCalories) animateValue(nutCalories, per100.calories);
        if (nutProtein)  animateValue(nutProtein,  per100.protein);
        if (nutCarbs)    animateValue(nutCarbs,    per100.carbs);
        if (nutFat)      animateValue(nutFat,      per100.fat);
        if (nutFiber)    animateValue(nutFiber,    per100.fiber);

        if (nutCaloriesUnit) nutCaloriesUnit.textContent = "kcal / 100g";
        if (nutProteinUnit)  nutProteinUnit.textContent  = "g / 100g";
        if (nutCarbsUnit)    nutCarbsUnit.textContent    = "g / 100g";
        if (nutFatUnit)      nutFatUnit.textContent      = "g / 100g";
        if (nutFiberUnit)    nutFiberUnit.textContent    = "g / 100g";

        drawMacroChart(per100.protein, per100.carbs, per100.fat);
    } else {
        const multiplier = effectiveWeight / 100;
        const totalCal   = per100.calories !== null ? round2(per100.calories * multiplier) : null;
        const totalPro   = per100.protein  !== null ? round2(per100.protein  * multiplier) : null;
        const totalCarb  = per100.carbs    !== null ? round2(per100.carbs    * multiplier) : null;
        const totalFat   = per100.fat      !== null ? round2(per100.fat      * multiplier) : null;
        const totalFiber = per100.fiber    !== null ? round2(per100.fiber    * multiplier) : null;

        if (nutCalories) animateValue(nutCalories, totalCal);
        if (nutProtein)  animateValue(nutProtein,  totalPro);
        if (nutCarbs)    animateValue(nutCarbs,    totalCarb);
        if (nutFat)      animateValue(nutFat,      totalFat);
        if (nutFiber)    animateValue(nutFiber,    totalFiber);

        const weightLabel = `${Math.round(effectiveWeight)}g`;
        if (nutCaloriesUnit) nutCaloriesUnit.textContent = `kcal / ${weightLabel}`;
        if (nutProteinUnit)  nutProteinUnit.textContent  = `g / ${weightLabel}`;
        if (nutCarbsUnit)    nutCarbsUnit.textContent    = `g / ${weightLabel}`;
        if (nutFatUnit)      nutFatUnit.textContent      = `g / ${weightLabel}`;
        if (nutFiberUnit)    nutFiberUnit.textContent    = `g / ${weightLabel}`;

        drawMacroChart(totalPro, totalCarb, totalFat);
    }

    updateGoalProgressDisplay();
}

// ---- Display results from API ----

function displayResults(data) {
    currentData = data;
    quantity = 1;
    useManualWeight = false;
    manualWeight = null;
    viewMode = "total";

    const manualToggle      = document.getElementById("manual-toggle");
    const manualInputWrapper = document.getElementById("manual-input-wrapper");
    const manualWeightInput  = document.getElementById("manual-weight-input");
    const qtyValue           = document.getElementById("qty-value");
    const qtyMinus           = document.getElementById("qty-minus");
    const viewTotal          = document.getElementById("view-total");
    const viewPer100         = document.getElementById("view-per100");
    const resultsSection     = document.getElementById("results-section");
    const resultName         = document.getElementById("result-name");
    const confidenceFill     = document.getElementById("confidence-fill");
    const confidenceLabel    = document.getElementById("confidence-label");
    const weightValue        = document.getElementById("weight-value");
    const weightUnitLabel    = document.getElementById("weight-unit-label");

    if (manualToggle)       manualToggle.checked = false;
    if (manualInputWrapper) manualInputWrapper.classList.remove("visible");
    if (manualWeightInput)  manualWeightInput.value = "";
    if (qtyValue)           qtyValue.textContent = "1";
    if (qtyMinus)           qtyMinus.disabled = true;

    if (viewTotal)  viewTotal.classList.add("active");
    if (viewPer100) viewPer100.classList.remove("active");

    resetChat();

    if (resultsSection) resultsSection.classList.add("visible");

    const foodName = data.food || "Unknown";
    if (resultName) resultName.textContent = foodName;

    const confidence = data.confidence || 0;
    setTimeout(() => {
        if (confidenceFill) confidenceFill.style.width = `${confidence}%`;
    }, 100);
    if (confidenceLabel) confidenceLabel.textContent = `${confidence.toFixed(1)}% confidence`;

    const estWeight = data.estimated_weight_g || 100;
    const weightUnit = data.weight_unit || "100g serving";
    if (weightValue)     weightValue.textContent = estWeight;
    if (weightUnitLabel) weightUnitLabel.textContent = `≈ ${weightUnit}`;

    updateNutritionDisplay();
    renderTop3(data.top3_predictions || []);

    setTimeout(() => {
        if (resultsSection) resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
}

// ---- File handling ----

function handleFile(file) {
    if (!file.type.startsWith("image/")) {
        showError("Please upload a valid image file.");
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        showError("Image too large. Maximum size is 10MB.");
        return;
    }

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        const previewImage  = document.getElementById("preview-image");
        const dropDefault   = document.getElementById("drop-zone-default");
        const previewState  = document.getElementById("preview-state");
        const btnAnalyze    = document.getElementById("btn-analyze");
        const resultsSection = document.getElementById("results-section");

        if (previewImage)  previewImage.src = e.target.result;
        if (dropDefault)   dropDefault.style.display = "none";
        if (previewState)  previewState.classList.add("visible");
        if (btnAnalyze)    btnAnalyze.disabled = false;
        if (resultsSection) resultsSection.classList.remove("visible");
    };
    reader.readAsDataURL(file);
}

function resetUpload() {
    selectedFile = null;

    const fileInput     = document.getElementById("file-input");
    const previewImage  = document.getElementById("preview-image");
    const previewState  = document.getElementById("preview-state");
    const dropDefault   = document.getElementById("drop-zone-default");
    const btnAnalyze    = document.getElementById("btn-analyze");

    if (fileInput)    fileInput.value = "";
    if (previewImage) previewImage.src = "";
    if (previewState) previewState.classList.remove("visible");
    if (dropDefault)  dropDefault.style.display = "block";
    if (btnAnalyze)   btnAnalyze.disabled = true;
}

// ---- Initialize Classify page events ----

function initClassify() {
    const dropZone       = document.getElementById("drop-zone");
    const fileInput      = document.getElementById("file-input");
    const btnRemove      = document.getElementById("btn-remove");
    const btnAnalyze     = document.getElementById("btn-analyze");
    const btnAgain       = document.getElementById("btn-again");
    const errorClose     = document.getElementById("error-close");
    const viewPer100     = document.getElementById("view-per100");
    const viewTotal      = document.getElementById("view-total");
    const qtyMinus       = document.getElementById("qty-minus");
    const qtyPlus        = document.getElementById("qty-plus");
    const manualToggle   = document.getElementById("manual-toggle");
    const manualInputWrapper = document.getElementById("manual-input-wrapper");
    const manualWeightInput  = document.getElementById("manual-weight-input");
    const chatInput      = document.getElementById("chat-input");
    const btnSend        = document.getElementById("btn-send");

    // Drop zone
    if (dropZone) {
        dropZone.addEventListener("click", (e) => {
            if (e.target === btnRemove || (e.target && e.target.closest(".btn-remove"))) return;
            if (fileInput) fileInput.click();
        });
        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("drag-over");
        });
        dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("drag-over");
            if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
        });
    }

    // File input
    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) handleFile(e.target.files[0]);
        });
    }

    // Remove image
    if (btnRemove) {
        btnRemove.addEventListener("click", (e) => {
            e.stopPropagation();
            resetUpload();
        });
    }

    // Analyze button
    if (btnAnalyze) {
        btnAnalyze.addEventListener("click", async () => {
            if (!selectedFile) return;

            btnAnalyze.classList.add("loading");
            btnAnalyze.disabled = true;

            try {
                const formData = new FormData();
                formData.append("file", selectedFile);

                const response = await fetch(`${API_URL}/predict`, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) throw new Error(`Server error: ${response.status}`);

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
    }

    // Try again
    if (btnAgain) {
        btnAgain.addEventListener("click", () => {
            resetUpload();
            const resultsSection = document.getElementById("results-section");
            const confidenceFill = document.getElementById("confidence-fill");
            if (resultsSection) resultsSection.classList.remove("visible");
            if (confidenceFill) confidenceFill.style.width = "0%";
            currentData = null;
            quantity = 1;
            useManualWeight = false;
            manualWeight = null;
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Error close
    if (errorClose) {
        errorClose.addEventListener("click", () => {
            const errorToast = document.getElementById("error-toast");
            if (errorToast) errorToast.classList.remove("visible");
        });
    }

    // View toggle
    if (viewPer100) {
        viewPer100.addEventListener("click", () => {
            viewMode = "per100";
            viewPer100.classList.add("active");
            if (viewTotal) viewTotal.classList.remove("active");
            updateNutritionDisplay();
        });
    }
    if (viewTotal) {
        viewTotal.addEventListener("click", () => {
            viewMode = "total";
            viewTotal.classList.add("active");
            if (viewPer100) viewPer100.classList.remove("active");
            updateNutritionDisplay();
        });
    }

    // Quantity stepper
    if (qtyMinus) {
        qtyMinus.disabled = true;
        qtyMinus.addEventListener("click", () => {
            const qtyValue = document.getElementById("qty-value");
            if (quantity > 1) {
                quantity--;
                if (qtyValue) qtyValue.textContent = quantity;
                qtyMinus.disabled = (quantity <= 1);
                updateNutritionDisplay();
            }
        });
    }
    if (qtyPlus) {
        qtyPlus.addEventListener("click", () => {
            const qtyValue  = document.getElementById("qty-value");
            const qtyMinus  = document.getElementById("qty-minus");
            if (quantity < 99) {
                quantity++;
                if (qtyValue) qtyValue.textContent = quantity;
                if (qtyMinus) qtyMinus.disabled = false;
                updateNutritionDisplay();
            }
        });
    }

    // Manual weight toggle
    if (manualToggle) {
        manualToggle.addEventListener("change", () => {
            useManualWeight = manualToggle.checked;
            if (useManualWeight) {
                if (manualInputWrapper) manualInputWrapper.classList.add("visible");
                setTimeout(() => { if (manualWeightInput) manualWeightInput.focus(); }, 350);
            } else {
                if (manualInputWrapper) manualInputWrapper.classList.remove("visible");
                manualWeight = null;
                if (manualWeightInput) manualWeightInput.value = "";
            }
            updateNutritionDisplay();
        });
    }
    if (manualWeightInput) {
        manualWeightInput.addEventListener("input", () => {
            const val = parseFloat(manualWeightInput.value);
            manualWeight = (!isNaN(val) && val > 0) ? val : null;
            updateNutritionDisplay();
        });
    }

    // Chat
    if (btnSend) {
        btnSend.addEventListener("click", () => sendChatMessage(chatInput ? chatInput.value : ""));
    }
    if (chatInput) {
        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") sendChatMessage(chatInput.value);
        });
    }
    document.querySelectorAll(".chat-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const btnSend = document.getElementById("btn-send");
            if (btnSend && !btnSend.disabled) sendChatMessage(chip.textContent);
        });
    });

    // Ctrl+V paste image
    document.addEventListener("keydown", (e) => {
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
            }).catch(() => {});
        }
    });
}
