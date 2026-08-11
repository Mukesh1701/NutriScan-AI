// ==========================================
// NutriScan AI — Macro Donut Chart (Canvas)
// ==========================================

function drawMacroChart(protein, carbs, fat) {
    const macroCanvas = document.getElementById("macro-canvas");
    const macroLegend = document.getElementById("macro-legend");
    if (!macroCanvas || !macroLegend) return;

    const ctx = macroCanvas.getContext("2d");
    const size = 180;
    const center = size / 2;
    const radius = 70;
    const lineWidth = 24;

    ctx.clearRect(0, 0, size, size);

    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;
    const total = p + c + f;

    if (total === 0) {
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(124, 58, 237, 0.08)";
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        return;
    }

    const segments = [
        { value: p, color: "#3b82f6", label: "Protein", unit: "g" },
        { value: c, color: "#f59e0b", label: "Carbs",   unit: "g" },
        { value: f, color: "#f97316", label: "Fat",     unit: "g" },
    ];

    let startAngle = -Math.PI / 2;
    const gap = 0.04;

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
    const top3List = document.getElementById("top3-list");
    if (!top3List) return;
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
    const foodTagsContainer = document.getElementById("food-tags");
    if (!foodTagsContainer || foodTagsContainer.children.length > 0) return;
    foodTagsContainer.innerHTML = FOOD_CLASSES.map(food =>
        `<span class="food-tag">${food}</span>`
    ).join("");
}
