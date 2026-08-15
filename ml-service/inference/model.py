import torch
from torchvision import models
import torch.nn as nn
import os


# =========================
# Device — always CPU on Render
# =========================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Device:", device)


# =========================
# Model path
# =========================

# Walk up from this file to find best_model.pth
# File lives at: ml-service/inference/model.py
# Model lives at: best_model.pth (repo root)  OR  ml-service/best_model.pth
# We search both so it works locally AND on Render.

_this_dir = os.path.dirname(os.path.abspath(__file__))

_candidate_paths = [
    os.path.join(_this_dir, "best_model.pth"),                          # same dir
    os.path.join(_this_dir, "..", "best_model.pth"),                    # ml-service/
    os.path.join(_this_dir, "..", "..", "best_model.pth"),              # repo root
]

MODEL_PATH = None
for _path in _candidate_paths:
    if os.path.isfile(_path):
        MODEL_PATH = os.path.abspath(_path)
        break

if MODEL_PATH is None:
    raise FileNotFoundError(
        "Could not find best_model.pth. "
        "Searched: " + str([os.path.abspath(p) for p in _candidate_paths]) + "\n"
        "On Render: place best_model.pth in ml-service/inference/ "
        "and set the Root Directory to ml-service/inference in the Render dashboard."
    )

print("Loading model from:", MODEL_PATH)


# =========================
# Load checkpoint
# =========================

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=False   # needed because checkpoint contains class list (non-tensor)
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