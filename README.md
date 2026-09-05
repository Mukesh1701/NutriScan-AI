<div align="center">

<img src="https://img.shields.io/badge/🌐%20Live%20Demo-nutriscan--ai.in-10b981?style=for-the-badge&labelColor=0a231c" alt="Live Demo"/>
&nbsp;
<img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=20232a" alt="React 19"/>
&nbsp;
<img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=1a2b33" alt="FastAPI"/>
&nbsp;
<img src="https://img.shields.io/badge/PyTorch-CNN-ee4c2c?style=for-the-badge&logo=pytorch&logoColor=white&labelColor=2a1a1a" alt="PyTorch"/>

<br/>

# NutriScan AI

**Scan it. Grade it. Eat smarter.**

[**🚀 Try it live**](https://www.nutriscan-ai.in) · [Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [Tech Stack](#-tech-stack)

*Free · No sign-up · Runs in your browser*

</div>

---

## 👋 What is NutriScan AI?

NutriScan AI is an AI-powered food analysis platform that combines **deep learning**, **computer vision**, **nutrition science**, **barcode scanning**, and **generative AI** to help users understand what's really on their plate.

Point your camera at food — get an instant identification, estimated weight, full nutrition breakdown, and personalized AI advice. Scan a barcode on packaged food — get an instant **A–F health grade**.

## ✨ Features

### 📷 AI Food Classification
- Snap or upload a photo of any food — a fine-tuned **PyTorch CNN** (transfer learning) identifies the dish
- Supports a wide range of classes: fruits, vegetables, chicken dishes, and more

### ⚖️ Food Weight Estimation
- Estimates the approximate weight of the detected food directly from the image
- Computer-vision-based measurement of portion size

### 🥗 Nutrition Analysis
Full nutritional breakdown computed from the detected food and estimated serving size:

| | | |
|---|---|---|
| 🔥 Calories | 🥩 Protein | 🍞 Carbohydrates |
| 🧈 Fat | 🌾 Fiber | |

### 🏷️ Barcode & Product Health Scanner
- Scan packaged food via camera, uploaded barcode image, or manual entry
- Instant **A–F health grade** and **NOVA processing score**
- Ingredient and processing-level insights when available

### 🧠 AI Nutrition Assistant
- Chat with a nutrition assistant powered by a **local Llama 3.2 model via Ollama**
- Answers are grounded in the detected food and its nutrition data for contextual, personalized recommendations
- Fully local — conversations never leave your machine

### 📊 Nutrition Calculator & Visualization
- Recalculate nutrition for any serving size
- Explore results through interactive charts

### 📱 Responsive Interface
- Modern React frontend designed for desktop and mobile
- Food classification, barcode scanning, calculator, scan history, and more

---

## 🏗️ Architecture

```text
                 ┌──────────────────────┐
                 │        User          │
                 │   Web / Mobile       │
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │   React Frontend     │
                 │      + Vite          │
                 └──────────┬───────────┘
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
      Food Image       Barcode       Nutrition /
   Classification      Scanner       Calculator
            │               │
            ▼               ▼
     ┌───────────┐    Product Data
     │  FastAPI  │
     │  Backend  │
     └─────┬─────┘
     ┌─────┼──────────┐
     ▼     ▼          ▼
  PyTorch Nutrition  Weight
   Model   Engine  Estimation
     │
     ▼
 Prediction Result
     │
     ▼
 ┌─────────────────────┐
 │  Local Llama 3.2 AI │
 │       Ollama        │
 └─────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router, html5-qrcode, Lucide Icons |
| **Backend** | Python, FastAPI, Uvicorn, Pydantic |
| **Machine Learning** | PyTorch, Torchvision, Transfer Learning (ResNet18 / MobileNetV2 / EfficientNet-B0) |
| **Computer Vision** | Pillow (PIL) |
| **Generative AI** | Ollama, Llama 3.2 (local) |

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

## 📁 Project Structure

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

## 🚀 Getting Started

### Prerequisites
- **Node.js** (for the frontend)
- **Python 3.10+** (for the backend)
- **[Ollama](https://ollama.com)** (optional — only for the AI nutrition assistant)

### 1. Clone the repository
```bash
git clone https://github.com/Mukesh1701/NutriScan-AI.git
cd NutriScan-AI
```

### 2. Start the frontend
```bash
cd frontend-react
npm install
npm run dev
```
The Vite dev server will print a local URL — open it in your browser.

### 3. Set up the Python backend
From the project root:
```bash
# Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r ml-service/training/requirements.txt
```

### 4. Run the FastAPI backend
```bash
cd ml-service/inference
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 5. (Optional) Enable the AI nutrition assistant
```bash
# Pull and serve the local Llama model
ollama pull llama3.2:3b
ollama serve
```

## 🧪 Machine Learning Pipeline

```text
Food Image → Preprocessing → Resize / Normalize → Pre-trained CNN
           → Transfer Learning → Food Classification → Weight Estimation
           → Nutrition Calculation → AI Nutrition Advice
```

Multiple CNN architectures were trained and benchmarked:

| Model | Role |
|---|---|
| **ResNet18** | Baseline classifier |
| **MobileNetV2** | Lightweight / fast inference |
| **EfficientNet-B0** | Accuracy-focused variant |

Use `benchmark_models.py` to compare their performance and inference characteristics.

## 🔒 Privacy

The AI nutrition assistant runs **locally** through Ollama — AI conversations are processed on your machine, never sent to a cloud LLM API.

> ⚠️ Never commit API keys, passwords, `.env` files, or other secrets to this repository.

## ⚠️ Disclaimer

Nutrition values and food weight estimates are **approximations** and should not be considered medical advice. For medical conditions, allergies, dietary treatment, or personalized nutrition guidance, please consult a qualified healthcare professional.

## 🗺️ Roadmap

- [ ] Improve food classification accuracy
- [ ] Add more Indian and international food classes
- [ ] Improve weight estimation using depth cameras
- [ ] Add authentication and user accounts
- [ ] Add personalized nutrition goals
- [ ] Improve barcode product coverage
- [ ] Optional cloud-based model inference
- [ ] Automated model performance monitoring

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">

If you find NutriScan AI useful, consider giving the repo a ⭐

**Mukesh** · B.Tech Student · National Institute of Technology Calicut

</div>
