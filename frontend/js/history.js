// ==========================================
// NutriScan AI — History Page
// ==========================================

async function loadHistory() {
    const histTimeline = document.getElementById("history-timeline");
    const histEmpty    = document.getElementById("history-empty");

    try {
        const res = await fetch(`${API_URL}/history`);
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        let history = data.history || [];

        // Merge barcode scans from localStorage
        const localHistoryStr = localStorage.getItem("food_history");
        if (localHistoryStr) {
            try {
                const localHistory = JSON.parse(localHistoryStr);
                history = history.concat(localHistory);
            } catch (e) {}
        }

        // Sort descending
        history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        renderHistory(history);

    } catch (err) {
        console.error("History error:", err);
        if (histTimeline) histTimeline.innerHTML = "";
        if (histEmpty) histEmpty.style.display = "block";
    }
}

function renderHistory(items) {
    const histTimeline   = document.getElementById("history-timeline");
    const histEmpty      = document.getElementById("history-empty");
    const toolbar        = document.querySelector(".history-toolbar");

    if (!items || items.length === 0) {
        if (histTimeline) { histTimeline.innerHTML = ""; histTimeline.style.display = "none"; }
        if (histEmpty)    histEmpty.style.display = "block";
        if (toolbar)      toolbar.style.display = "none";
        updateHistoryStats([]);
        return;
    }

    if (histEmpty) histEmpty.style.display = "none";
    if (histTimeline) histTimeline.style.display = "flex";
    if (toolbar) toolbar.style.display = "flex";

    updateHistoryStats(items);

    // Group by date label
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
            const conf    = scan.confidence != null ? scan.confidence.toFixed(1) : "-";
            const confDisplay = scan.isBarcode ? "Barcode" : `${conf}%`;
            const timeAgo = getTimeAgo(scan.created_at);
            const delay   = Math.min(cardIndex * 0.06, 0.6);

            html += `
            <div class="history-card" style="animation-delay: ${delay}s" data-id="${scan.id}">
                <button class="history-delete-btn" title="Delete scan" data-delete-id="${scan.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
                <div class="history-card-top">
                    <div class="history-card-food">
                        <div class="history-food-emoji">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                                <path d="M2 12h20"></path>
                            </svg>
                        </div>
                        <div class="history-food-info">
                            <div class="history-food-name">${scan.food}</div>
                            <div class="history-food-meta">
                                <span class="history-confidence-chip">${confDisplay}</span>
                                ${scan.grade ? `<span class="history-grade-chip grade-${scan.grade.toLowerCase()}">Grade ${scan.grade.toUpperCase()}</span>` : ""}
                            </div>
                        </div>
                    </div>
                    <div class="history-time-badge">${timeAgo}</div>
                </div>
                <div class="history-nutrients">
                    ${scan.weight_g  != null ? `<span class="history-nut-chip chip-weight">${Math.round(scan.weight_g)}g</span>` : ""}
                    ${scan.calories  != null ? `<span class="history-nut-chip chip-cal">${Math.round(scan.calories)} kcal</span>` : ""}
                    ${scan.protein   != null ? `<span class="history-nut-chip chip-pro">${round2(scan.protein)}g pro</span>` : ""}
                    ${scan.carbs     != null ? `<span class="history-nut-chip chip-carb">${round2(scan.carbs)}g carb</span>` : ""}
                    ${scan.fat       != null ? `<span class="history-nut-chip chip-fat">${round2(scan.fat)}g fat</span>` : ""}
                    ${scan.fiber     != null ? `<span class="history-nut-chip chip-fiber">${round2(scan.fiber)}g fiber</span>` : ""}
                </div>
            </div>`;
            cardIndex++;
        }
    }

    if (histTimeline) {
        histTimeline.innerHTML = html;
        lucide.createIcons({ root: histTimeline });

        histTimeline.querySelectorAll(".history-delete-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                await deleteScan(btn.dataset.deleteId);
            });
        });
    }
}

function updateHistoryStats(items) {
    const histTotalScans = document.getElementById("hist-total-scans");
    const histTotalCal   = document.getElementById("hist-total-cal");
    const histTopFood    = document.getElementById("hist-top-food");
    const histAvgConf    = document.getElementById("hist-avg-conf");

    const total = items.length;
    if (histTotalScans) histTotalScans.textContent = total;

    const totalCal = items.reduce((sum, s) => sum + (s.calories || 0), 0);
    if (histTotalCal) histTotalCal.textContent = Math.round(totalCal).toLocaleString();

    if (total > 0) {
        const freq = {};
        items.forEach(s => { freq[s.food] = (freq[s.food] || 0) + 1; });
        const topFood = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
        if (histTopFood) histTopFood.textContent = topFood;

        const avgConf = items.reduce((sum, s) => sum + (s.confidence || 0), 0) / total;
        if (histAvgConf) histAvgConf.textContent = avgConf.toFixed(1) + "%";
    } else {
        if (histTopFood) histTopFood.textContent = "—";
        if (histAvgConf) histAvgConf.textContent = "—";
    }
}

async function deleteScan(id) {
    try {
        if (id && id.toString().startsWith("scan_")) {
            let historyStr = localStorage.getItem("food_history");
            if (historyStr) {
                let history = JSON.parse(historyStr);
                history = history.filter(item => item.id !== id);
                localStorage.setItem("food_history", JSON.stringify(history));
            }
        } else {
            const res = await fetch(`${API_URL}/history/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
        }
        loadHistory();
    } catch (err) {
        console.error("Delete error:", err);
        showError("Could not delete scan.");
    }
}

function initHistory() {
    const btnClearHistory = document.getElementById("btn-clear-history");
    if (btnClearHistory) {
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
    }
}
