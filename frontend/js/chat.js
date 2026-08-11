// ==========================================
// NutriScan AI — AI Chat Assistant
// ==========================================

function resetChat() {
    const chatMessages = document.getElementById("chat-messages");
    const chatInput    = document.getElementById("chat-input");
    const btnSend      = document.getElementById("btn-send");

    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="chat-message ai-message">
                Hi! I can help you with recipes, diet plans, or any questions about the detected food above. What would you like to know?
            </div>
        `;
    }
    if (chatInput) chatInput.value = "";
    if (btnSend)   btnSend.disabled = false;
}

async function sendChatMessage(text) {
    const chatMessages = document.getElementById("chat-messages");
    const chatInput    = document.getElementById("chat-input");
    const btnSend      = document.getElementById("btn-send");

    if (!text.trim() || !currentData) return;

    // User message
    const userMsg = document.createElement("div");
    userMsg.className = "chat-message user-message";
    userMsg.textContent = text;
    if (chatMessages) chatMessages.appendChild(userMsg);

    if (chatInput) chatInput.value = "";
    if (btnSend)   btnSend.disabled = true;
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;

    // Loading indicator
    const loadingMsg = document.createElement("div");
    loadingMsg.className = "chat-message ai-message";
    loadingMsg.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    if (chatMessages) {
        chatMessages.appendChild(loadingMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Build payload
    const effectiveWeight = getEffectiveWeight();
    const multiplier = effectiveWeight / 100;
    const p100 = currentData.nutrition_per_100g || {};

    const payload = {
        food:     currentData.food,
        weight_g: effectiveWeight,
        calories: p100.calories ? p100.calories * multiplier : 0,
        protein:  p100.protein  ? p100.protein  * multiplier : 0,
        carbs:    p100.carbs    ? p100.carbs    * multiplier : 0,
        fat:      p100.fat      ? p100.fat      * multiplier : 0,
        fiber:    p100.fiber    ? p100.fiber    * multiplier : 0,
        question: text
    };

    try {
        const response = await fetch(`${API_URL}/ai-advice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        if (chatMessages) chatMessages.removeChild(loadingMsg);

        const aiMsg = document.createElement("div");
        aiMsg.className = "chat-message ai-message";
        let formatted = data.answer.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        formatted = formatted.replace(/\n/g, "<br>");
        aiMsg.innerHTML = formatted;
        if (chatMessages) chatMessages.appendChild(aiMsg);

    } catch (err) {
        if (chatMessages) chatMessages.removeChild(loadingMsg);
        const errMsg = document.createElement("div");
        errMsg.className = "chat-message ai-message";
        errMsg.style.color = "var(--error)";
        errMsg.textContent = "Sorry, I couldn't reach the AI service right now. Please try again.";
        if (chatMessages) chatMessages.appendChild(errMsg);
    }

    if (btnSend) btnSend.disabled = false;
    if (chatInput) chatInput.focus();
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}
