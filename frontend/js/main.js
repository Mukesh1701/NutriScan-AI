// ==========================================
// NutriScan AI — App Entry Point (main.js)
// ==========================================
//
// Load order in index.html:
//   1. config.js   — constants (API_URL, FOOD_CLASSES, storage keys)
//   2. state.js    — mutable app state variables
//   3. utils.js    — pure helpers (animateValue, showError, showToast, time)
//   4. navigation.js — switchPage(), initNavigation()
//   5. charts.js   — drawMacroChart(), renderTop3(), renderFoodTags()
//   6. chat.js     — resetChat(), sendChatMessage()
//   7. classify.js — handleFile(), displayResults(), initClassify()
//   8. history.js  — loadHistory(), renderHistory(), initHistory()
//   9. calculator.js — calculateAndDisplayResults(), initCalculator()
//  10. barcode.js  — startBarcodeScanner(), lookupBarcodeProduct(), initBarcodeScanner()
//  11. main.js     — bootstraps everything on DOMContentLoaded

document.addEventListener("DOMContentLoaded", () => {
    // Bootstrap all modules
    initNavigation();
    initClassify();
    initHistory();
    initCalculator();
    initBarcodeScanner();

    // Create lucide icons for the initial render
    if (typeof lucide !== "undefined") lucide.createIcons();

    console.log("NutriScan AI loaded — 37 food classes ready");
    console.log(`API endpoint: ${API_URL}`);
});
