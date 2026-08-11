// ==========================================
// NutriScan AI — Shared State
// ==========================================

// App-level mutable state shared across modules

// Classify page state
let selectedFile = null;
let currentData = null;
let quantity = 1;
let useManualWeight = false;
let manualWeight = null;
let viewMode = "total"; // "per100" or "total"

// Calculator state
let selectedGoal = "loss";
let selectedPace = "moderate";
let selectedGender = "male";
let selectedActivity = 1.55;
let calcHeightUnit = "cm";
let calcWeightUnit = "kg";

// User Goal Profile (defaults)
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
