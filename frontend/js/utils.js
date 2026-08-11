// ==========================================
// NutriScan AI — Utility Helpers
// ==========================================

function round2(val) {
    return Math.round(val * 100) / 100;
}

// ==========================================
// Animate Number Value (ease-out cubic)
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
// Toast / Error Helpers
// ==========================================
function showError(message) {
    const errorToast = document.getElementById("error-toast");
    const errorMsg = document.getElementById("error-msg");
    if (!errorToast || !errorMsg) return;
    errorMsg.textContent = message;
    errorToast.classList.add("visible");
    setTimeout(() => errorToast.classList.remove("visible"), 6000);
}

function showToast(msg) {
    const errorToast = document.getElementById("error-toast");
    const errorMsg = document.getElementById("error-msg");
    if (errorToast && errorMsg) {
        errorMsg.textContent = msg;
        errorToast.classList.add("visible");
        setTimeout(() => errorToast.classList.remove("visible"), 3500);
    } else {
        alert(msg);
    }
}

// ==========================================
// Time Helpers
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
