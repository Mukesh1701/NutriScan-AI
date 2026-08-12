from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

import io
import torch
from torchvision import transforms

from model import model, classes, device
from nutrition import nutrition
from average_weights import average_weights
from ai_service import generate_ai_advice



# ==========================================
# FastAPI Application
# ==========================================

app = FastAPI(
    title="NutriScan AI API",
    description="Food classification, nutrition and AI assistant API",
    version="1.0"
)



# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Image Transformation
# ==========================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ==========================================
# Home Endpoint
# ==========================================

@app.get("/")
def home():

    return {
        "message": "NutriScan AI API is running",
        "model": "ResNet18",
        "classes": len(classes),
        "ai": "Llama 3.2 3B via Ollama"
    }


# ==========================================
# Prediction Endpoint
# ==========================================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # --------------------------------------
    # Read uploaded image
    # --------------------------------------

    image_bytes = await file.read()

    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")


    # --------------------------------------
    # Preprocess image
    # --------------------------------------

    image_tensor = transform(image)

    # Add batch dimension
    image_tensor = image_tensor.unsqueeze(0)

    # Move to GPU / CPU
    image_tensor = image_tensor.to(device)


    # ======================================
    # Model Prediction
    # ======================================

    with torch.no_grad():

        outputs = model(image_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        top_probs, top_indices = torch.topk(
            probabilities,
            3,
            dim=1
        )


    # ======================================
    # Best Prediction
    # ======================================

    best_index = top_indices[0][0].item()

    food = classes[best_index]

    confidence = (
        top_probs[0][0].item() * 100
    )


    # ======================================
    # Nutrition Per 100g
    # ======================================

    food_nutrition = nutrition.get(
        food,
        {
            "calories": None,
            "protein": None,
            "carbs": None,
            "fat": None,
            "fiber": None
        }
    )


    # ======================================
    # Average Weight
    # ======================================

    food_weight = average_weights.get(
        food,
        {
            "weight_g": 100,
            "unit": "100g serving",
            "emoji": "🍽️"
        }
    )

    estimated_weight = food_weight["weight_g"]


    # ======================================
    # Estimated Nutrition
    # ======================================

    if food_nutrition["calories"] is not None:

        multiplier = estimated_weight / 100

        estimated_nutrition = {

            "calories": round(
                food_nutrition["calories"] * multiplier,
                2
            ),

            "protein": round(
                food_nutrition["protein"] * multiplier,
                2
            ),

            "carbs": round(
                food_nutrition["carbs"] * multiplier,
                2
            ),

            "fat": round(
                food_nutrition["fat"] * multiplier,
                2
            ),

            "fiber": round(
                food_nutrition["fiber"] * multiplier,
                2
            )
        }

    else:

        estimated_nutrition = {

            "calories": None,
            "protein": None,
            "carbs": None,
            "fat": None,
            "fiber": None
        }


    # ======================================
    # Top 3 Predictions
    # ======================================

    top3 = []

    for i in range(3):

        index = top_indices[0][i].item()

        probability = (
            top_probs[0][i].item() * 100
        )

        top3.append({

            "food": classes[index],

            "confidence": round(
                probability,
                2
            )
        })


    # ======================================
    # Response
    # ======================================

    return {

        "food": food,

        "confidence": round(
            confidence,
            2
        ),

        "estimated_weight_g": estimated_weight,

        "weight_unit": food_weight["unit"],

        "emoji": food_weight["emoji"],

        "serving_size": "100g",

        "nutrition_per_100g": food_nutrition,

        "estimated_nutrition": estimated_nutrition,

        "top3_predictions": top3
    }


# ==========================================
# AI Advice Request Model
# ==========================================

class AIAdviceRequest(BaseModel):

    food: str

    weight_g: float

    calories: float

    protein: float

    carbs: float

    fat: float

    fiber: float

    question: str


# ==========================================
# AI Advice Endpoint
# ==========================================

@app.post("/ai-advice")
def ai_advice(request: AIAdviceRequest):

    answer = generate_ai_advice(

        food=request.food,

        weight_g=request.weight_g,

        calories=request.calories,

        protein=request.protein,

        carbs=request.carbs,

        fat=request.fat,

        fiber=request.fiber,

        question=request.question
    )


    return {

        "answer": answer
    }
