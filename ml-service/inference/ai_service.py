import ollama


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

    response = ollama.chat(
        model="llama3.2:3b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]