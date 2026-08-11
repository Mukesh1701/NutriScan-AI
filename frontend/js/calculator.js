// ==========================================
// NutriScan AI — Calorie Calculator & Goal Tracker
// ==========================================

function loadSavedGoalProfile() {
    try {
        const saved = localStorage.getItem(GOAL_PROFILE_KEY);
        if (saved) userGoalProfile = JSON.parse(saved);
    } catch (e) {
        console.warn("Failed to load goal profile:", e);
    }
}

function saveGoalProfile() {
    try {
        userGoalProfile.saved = true;
        localStorage.setItem(GOAL_PROFILE_KEY, JSON.stringify(userGoalProfile));
        showToast("Goal target saved & applied to NutriScan Scanner!");
        updateGoalProgressDisplay();
    } catch (e) {
        console.warn("Failed to save goal profile:", e);
    }
}

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
        calories,
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
        showToast(`Tracked ${calories} kcal for ${currentData.food}!`);
    } catch (e) {
        console.error("Error tracking meal:", e);
    }
}

function updatePaceSubtitles() {
    const subMild = document.getElementById("pace-sub-mild");
    const subMod  = document.getElementById("pace-sub-moderate");
    const subAgg  = document.getElementById("pace-sub-aggressive");

    if (selectedGoal === "loss") {
        if (subMild) subMild.textContent = "0.25 kg / week (-250 kcal)";
        if (subMod)  subMod.textContent  = "0.50 kg / week (-500 kcal)";
        if (subAgg)  subAgg.textContent  = "0.75 kg / week (-750 kcal)";
    } else if (selectedGoal === "maintain") {
        if (subMild) subMild.textContent = "Optimal Balance (0 kcal)";
        if (subMod)  subMod.textContent  = "Recommended Balance (0 kcal)";
        if (subAgg)  subAgg.textContent  = "Active Maintenance (0 kcal)";
    } else if (selectedGoal === "gain") {
        if (subMild) subMild.textContent = "0.25 kg / week (+250 kcal)";
        if (subMod)  subMod.textContent  = "0.50 kg / week (+500 kcal)";
        if (subAgg)  subAgg.textContent  = "0.75 kg / week (+750 kcal)";
    }
}

function calculateAndDisplayResults() {
    const ageInput = document.getElementById("calc-age");
    const age = parseInt(ageInput ? ageInput.value : 25) || 25;

    let heightCm = 175;
    if (calcHeightUnit === "cm") {
        const hInput = document.getElementById("calc-height");
        heightCm = parseFloat(hInput ? hInput.value : 175) || 175;
    } else {
        const ftInput = document.getElementById("calc-height-ft");
        const inInput = document.getElementById("calc-height-in");
        const ft  = parseFloat(ftInput ? ftInput.value : 5) || 5;
        const inc = parseFloat(inInput ? inInput.value : 9) || 0;
        heightCm = (ft * 12 + inc) * 2.54;
    }

    let weightKg = 70;
    const wInput = document.getElementById("calc-weight");
    const valW   = parseFloat(wInput ? wInput.value : 70) || 70;
    weightKg = (calcWeightUnit === "kg") ? valW : valW / 2.20462;

    // Mifflin-St Jeor BMR
    let bmr = (selectedGender === "male")
        ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    bmr = Math.round(bmr);

    const tdee = Math.round(bmr * selectedActivity);

    let offset = 0;
    if (selectedPace === "mild")       offset = 250;
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

    const heightM = heightCm / 100;
    const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
    let bmiCategory = "Normal BMI";
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi >= 25 && bmi < 30) bmiCategory = "Overweight";
    else if (bmi >= 30) bmiCategory = "Obese";

    let proteinG   = Math.round(weightKg * (selectedGoal === "maintain" ? 1.6 : 2.0));
    let proteinCal = proteinG * 4;
    let fatCal     = Math.round(targetCalories * (selectedGoal === "gain" ? 0.30 : 0.26));
    let fatG       = Math.round(fatCal / 9);
    let carbCal    = Math.max(0, targetCalories - proteinCal - fatCal);
    let carbG      = Math.round(carbCal / 4);
    let proPct     = Math.round((proteinCal / targetCalories) * 100);
    let carbPct    = Math.round((carbCal    / targetCalories) * 100);
    let fatPct     = Math.round((fatCal     / targetCalories) * 100);
    const waterL   = (weightKg * 0.038).toFixed(1);

    // Persist to global profile
    userGoalProfile = {
        goal: selectedGoal, pace: selectedPace, targetCalories,
        bmr, tdee, bmi, bmiCat: bmiCategory,
        proteinG, proteinCal, carbsG: carbG, carbsCal: carbCal,
        fatG, fatCal, proPct, carbPct, fatPct, waterL, saved: true
    };

    // -- Render --
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };
    const setWidth = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = `${pct}%`; };
    const animEl = (id, val) => { const el = document.getElementById(id); if (el) animateValue(el, val); };

    const goalTitles = { loss: "Weight Loss Goal", maintain: "Weight Maintenance Goal", gain: "Weight Gain Goal" };
    set("target-goal-badge", goalTitles[selectedGoal] || "Daily Goal Target");
    animEl("target-cal-val", targetCalories);
    setHTML("target-pace-text", paceDescription);
    set("metric-tdee", tdee.toLocaleString());
    set("metric-bmr",  bmr.toLocaleString());
    set("metric-bmi",  bmi);
    set("metric-bmi-cat", bmiCategory);

    set("target-pro-g",  `${proteinG}g`);
    setHTML("target-pro-cal", `${proteinCal} kcal · ${proPct}%`);
    setWidth("bar-pro-fill", proPct);

    set("target-carb-g", `${carbG}g`);
    setHTML("target-carb-cal", `${carbCal} kcal · ${carbPct}%`);
    setWidth("bar-carb-fill", carbPct);

    set("target-fat-g",  `${fatG}g`);
    setHTML("target-fat-cal", `${fatCal} kcal · ${fatPct}%`);
    setWidth("bar-fat-fill", fatPct);

    const waterEl   = document.getElementById("advice-water");
    if (waterEl) waterEl.textContent = `Drink at least ${waterL} Liters (≈ ${(waterL * 4).toFixed(0)} glasses) of water daily for optimal digestion and cellular metabolism.`;

    const nutTipEl = document.getElementById("advice-nutrition");
    if (nutTipEl) {
        const tips = {
            loss:     "Focus on high-volume, low-calorie foods like spinach, cucumber, and chicken breast to keep hunger away during your calorie deficit.",
            maintain: "Maintain a balanced split of healthy fats, complex carbs, and lean proteins to sustain your daily energy levels.",
            gain:     "Incorporate dense nutrition like avocado, nuts, bananas, and whole eggs to meet your muscle-building calorie surplus."
        };
        nutTipEl.textContent = tips[selectedGoal] || "";
    }

    const calcResultsSec = document.getElementById("calc-results-section");
    if (calcResultsSec) {
        calcResultsSec.style.display = "block";
        setTimeout(() => calcResultsSec.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }

    updateGoalProgressDisplay();
}

function updateGoalProgressDisplay() {
    const card = document.getElementById("goal-progress-card");
    if (!card) return;

    const targetCal = userGoalProfile.targetCalories || 2000;
    const goalLabels = { loss: "Weight Loss", maintain: "Maintenance", gain: "Weight Gain" };
    const goalLabel  = goalLabels[userGoalProfile.goal] || "Fitness Target";

    const goalNameEl = document.getElementById("scan-goal-name");
    if (goalNameEl) goalNameEl.textContent = `Target: ${targetCal.toLocaleString()} kcal (${goalLabel})`;

    let mealCal = 0;
    if (currentData) {
        const effectiveWeight = getEffectiveWeight();
        const multiplier = effectiveWeight / 100;
        const p100 = currentData.nutrition_per_100g || {};
        mealCal = p100.calories ? Math.round(p100.calories * multiplier) : 0;
    }

    const todayLoggedCal = getTodayLoggedCalories();
    const totalWithMeal  = todayLoggedCal + mealCal;
    const remaining      = Math.max(0, targetCal - totalWithMeal);
    const mealPct        = ((mealCal / targetCal) * 100).toFixed(1);
    const todayPct       = Math.min(100, Math.round((totalWithMeal / targetCal) * 100));

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("meal-impact-calories", `${mealCal} kcal`);
    set("meal-impact-percent",  `${mealPct}%`);
    set("meal-impact-remaining", `${remaining.toLocaleString()} kcal`);

    const barFill = document.getElementById("goal-progress-bar-fill");
    if (barFill) barFill.style.width = `${todayPct}%`;

    const barLbl = document.getElementById("goal-progress-bar-label");
    if (barLbl) barLbl.textContent = `${totalWithMeal.toLocaleString()} / ${targetCal.toLocaleString()} kcal logged today (${todayPct}%)`;
}

function initCalculator() {
    loadSavedGoalProfile();

    const goalLoss     = document.getElementById("goal-card-loss");
    const goalMaintain = document.getElementById("goal-card-maintain");
    const goalGain     = document.getElementById("goal-card-gain");

    function setGoal(goal) {
        selectedGoal = goal;
        [goalLoss, goalMaintain, goalGain].forEach(c => { if (c) c.classList.remove("active"); });
        if (goal === "loss"     && goalLoss)     goalLoss.classList.add("active");
        if (goal === "maintain" && goalMaintain) goalMaintain.classList.add("active");
        if (goal === "gain"     && goalGain)     goalGain.classList.add("active");
        updatePaceSubtitles();
    }

    if (goalLoss)     goalLoss.addEventListener("click",     () => setGoal("loss"));
    if (goalMaintain) goalMaintain.addEventListener("click", () => setGoal("maintain"));
    if (goalGain)     goalGain.addEventListener("click",     () => setGoal("gain"));

    document.querySelectorAll(".pace-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".pace-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedPace = btn.dataset.pace;
        });
    });

    const genderMale   = document.getElementById("gender-male");
    const genderFemale = document.getElementById("gender-female");
    if (genderMale && genderFemale) {
        genderMale.addEventListener("click", () => {
            genderMale.classList.add("active"); genderFemale.classList.remove("active");
            selectedGender = "male";
        });
        genderFemale.addEventListener("click", () => {
            genderFemale.classList.add("active"); genderMale.classList.remove("active");
            selectedGender = "female";
        });
    }

    const unitHeightCm  = document.getElementById("unit-height-cm");
    const unitHeightFt  = document.getElementById("unit-height-ft");
    const heightCmWrap  = document.getElementById("height-cm-wrapper");
    const heightFtWrap  = document.getElementById("height-ft-wrapper");
    if (unitHeightCm && unitHeightFt) {
        unitHeightCm.addEventListener("click", () => {
            unitHeightCm.classList.add("active"); unitHeightFt.classList.remove("active");
            if (heightCmWrap) heightCmWrap.style.display = "flex";
            if (heightFtWrap) heightFtWrap.style.display = "none";
            calcHeightUnit = "cm";
        });
        unitHeightFt.addEventListener("click", () => {
            unitHeightFt.classList.add("active"); unitHeightCm.classList.remove("active");
            if (heightCmWrap) heightCmWrap.style.display = "none";
            if (heightFtWrap) heightFtWrap.style.display = "grid";
            calcHeightUnit = "ft";
        });
    }

    const unitWeightKg  = document.getElementById("unit-weight-kg");
    const unitWeightLbs = document.getElementById("unit-weight-lbs");
    const weightUnitTag = document.getElementById("weight-unit-tag");
    if (unitWeightKg && unitWeightLbs) {
        unitWeightKg.addEventListener("click", () => {
            unitWeightKg.classList.add("active"); unitWeightLbs.classList.remove("active");
            if (weightUnitTag) weightUnitTag.textContent = "kg";
            calcWeightUnit = "kg";
        });
        unitWeightLbs.addEventListener("click", () => {
            unitWeightLbs.classList.add("active"); unitWeightKg.classList.remove("active");
            if (weightUnitTag) weightUnitTag.textContent = "lbs";
            calcWeightUnit = "lbs";
        });
    }

    document.querySelectorAll(".activity-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".activity-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            selectedActivity = parseFloat(card.dataset.activity) || 1.55;
        });
    });

    const btnCalculate = document.getElementById("btn-calculate");
    if (btnCalculate) btnCalculate.addEventListener("click", calculateAndDisplayResults);

    const btnSaveGoal = document.getElementById("btn-save-goal");
    if (btnSaveGoal) btnSaveGoal.addEventListener("click", saveGoalProfile);

    const btnTrack = document.getElementById("btn-track-meal");
    if (btnTrack) btnTrack.addEventListener("click", trackCurrentMeal);

    updateGoalProgressDisplay();
}
