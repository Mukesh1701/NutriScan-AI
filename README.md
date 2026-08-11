# NutriScan AI

NutriScan AI is an AI-powered food analysis platform that combines deep learning, computer vision, nutrition analysis, barcode scanning, and generative AI to help users understand the food they consume.

## Features

### AI Food Classification
- Upload an image of food and identify the food item using a deep learning model.
- Built using PyTorch and transfer learning.
- Supports multiple food classes including fruits, vegetables, chicken, and other food items.

### Food Weight Estimation
- Estimates the approximate weight of the detected food.
- Uses computer vision and image-based measurement techniques.

### Nutrition Analysis
Provides estimated nutritional information based on the detected food and estimated serving size:

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber

### Barcode & Product Health Scanner
- Scan packaged food using a barcode.
- Upload a barcode image or manually enter a barcode number.
- Provides product information and nutrition-related insights.
- Includes an A-F health grade interface.
- Displays processing and ingredient-related information when available.

### AI Nutrition Assistant
- Integrated with a local Llama 3.2 model through Ollama.
- Answers food and nutrition-related questions.
- Uses detected food and nutrition information to provide contextual recommendations.

### Nutrition Calculator & Visualization
- Calculate nutrition based on serving size.
- Visualize nutritional information using interactive charts.

### Responsive Interface
- Modern React-based frontend.
- Designed for desktop and mobile usage.
- Includes food classification, barcode scanning, calculator, history, and about sections.

---

## System Architecture

```text
                    ┌──────────────────────┐
                    │        User          │
                    │   Web / Mobile       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │      + Vite          │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
          Food Image       Barcode       Nutrition /
          Classification   Scanner       Calculator
                │              │
                ▼              ▼
          ┌───────────┐   Product Data
          │ FastAPI   │
          │ Backend   │
          └─────┬─────┘
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
     PyTorch  Nutrition  Weight
      Model    Engine   Estimation
        │
        ▼
   Prediction Result
        │
        ▼
 ┌─────────────────────┐
 │  Local Llama 3.2 AI  │
 │       Ollama         │
 └─────────────────────┘
```

## Tech Stack

**Frontend**
- React
- JavaScript
- HTML
- CSS
- Vite

**Backend**
- Python
- FastAPI
- Uvicorn

**Machine Learning**
- PyTorch
- Torchvision
- ResNet18
- MobileNetV2
- EfficientNet-B0
- Transfer Learning

**Generative AI**
- Ollama
- Llama 3.2

**Computer Vision**
- OpenCV
- PIL / Pillow

**Data & Storage**
- SQLite
- CSV
- JSON

## Project Structure

```text
NutriScan-AI/
│
├── frontend-react/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── frontend/
│   └── Legacy frontend files
│
├── ml-service/
│   ├── inference/
│   │   ├── ai_service.py
│   │   ├── app.py
│   │   ├── database.py
│   │   ├── measure_food.py
│   │   ├── model.py
│   │   ├── nutrition.py
│   │   ├── scale_detector.py
│   │   └── weight_estimator.py
│   │
│   └── training/
│       ├── class_names.json
│       ├── dish_ingredients.csv
│       ├── dish_nutrition_values.csv
│       └── requirements.txt
│
├── train.py
├── train_mobilenet.py
├── train_efficientnet.py
├── predict.py
├── benchmark_models.py
├── server.js
└── README.md
```

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/Mukesh1701/NutriScan-AI.git
cd NutriScan-AI
```

### 2. Frontend setup
```bash
cd frontend-react
npm install
npm run dev
```
The Vite development server will provide a local URL.

### 3. Python environment
From the project root:
```bash
python -m venv .venv
```
Windows:
```bash
.venv\Scripts\activate
```
Install the backend dependencies:
```bash
pip install -r ml-service/training/requirements.txt
```

### 4. Run the FastAPI backend
```bash
cd ml-service/inference
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## Running the AI Assistant

NutriScan AI can use a local Llama model through Ollama.

Install Ollama and pull the model:
```bash
ollama pull llama3.2:3b
```

Start Ollama:
```bash
ollama serve
```

The application can then send nutrition-related questions to the local model.

## Machine Learning Pipeline

The food classification pipeline follows:

```text
Food Image
    ↓
Image Preprocessing
    ↓
Resize / Normalize
    ↓
Pre-trained CNN
    ↓
Transfer Learning
    ↓
Food Classification
    ↓
Food Class
    ↓
Weight Estimation
    ↓
Nutrition Calculation
    ↓
AI Nutrition Advice
```

Multiple CNN architectures were explored:
- ResNet18
- MobileNetV2
- EfficientNet-B0

The models can be benchmarked to compare their performance and inference characteristics.

## Privacy

The AI nutrition assistant can run locally through Ollama, allowing AI conversations to be processed locally instead of requiring a cloud-based LLM API.

Do not commit API keys, passwords, .env files, or other secrets to the repository.

## Disclaimer

Nutrition values and food weight estimates are approximate and should not be considered medical advice.

For medical conditions, allergies, dietary treatment, or personalized medical nutrition advice, consult a qualified healthcare professional.

## Future Improvements
- Improve food classification accuracy.
- Add more Indian and international food classes.
- Improve weight estimation using depth cameras.
- Add authentication and user accounts.
- Add personalized nutrition goals.
- Improve barcode product coverage.
- Deploy frontend and backend to production.
- Add cloud-based model inference as an optional alternative.
- Add automated model performance monitoring.

## Author

Mukesh
B.Tech Student
National Institute of Technology Calicut

## Project

If you find NutriScan AI useful, consider giving the repository a star on GitHub.
