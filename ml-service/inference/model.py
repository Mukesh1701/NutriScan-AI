import torch
from torchvision import models
import torch.nn as nn
import os


# =========================
# Device
# =========================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Device:", device)

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))


# =========================
# Model path
# =========================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "best_model.pth"
)


# =========================
# Load checkpoint
# =========================

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device
)

classes = checkpoint["classes"]


print("Number of classes:", len(classes))


# =========================
# Create ResNet18
# =========================

model = models.resnet18(
    weights=None
)

model.fc = nn.Linear(
    model.fc.in_features,
    len(classes)
)


# =========================
# Load trained weights
# =========================

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(device)

model.eval()


print("Model loaded successfully!")