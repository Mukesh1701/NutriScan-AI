import os
import google.generativeai as genai


# =========================
# Configure Gemini
# =========================

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

_gemini_model = genai.GenerativeModel("gemini-1.5-flash")


def generate_ai_advice(
    food,
    weight_g,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    question
):

    prompt = f"""
You are NutriScan AI, a helpful nutrition assistant.

Food detected: {food}
Estimated weight: {weight_g} grams

Nutrition:
Calories: {calories} kcal
Protein: {protein} g
Carbohydrates: {carbs} g
Fat: {fat} g
Fiber: {fiber} g

User question:
{question}

Answer clearly and briefly.

Use the nutrition information provided above.
Do not invent nutrition values.
Give practical nutrition advice when appropriate.

If the user asks about a medical condition,
disease, medication, or treatment, recommend
consulting a qualified healthcare professional.
"""

    try:
        response = _gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI advice temporarily unavailable. Please try again later. (Error: {str(e)})"