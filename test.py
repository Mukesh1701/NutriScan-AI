import torch
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import torch.nn as nn

from sklearn.metrics import (
    classification_report,
    confusion_matrix
)

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


# =========================
# 1. Device
# =========================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Device:", device)

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))


# =========================
# 2. Test dataset
# =========================

TEST_DIR = r"D:\food-classifier\data\test"


# =========================
# 3. Transform
# =========================

test_transform = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# =========================
# 4. Dataset
# =========================

test_dataset = datasets.ImageFolder(
    TEST_DIR,
    transform=test_transform
)

print("Number of classes:", len(test_dataset.classes))
print("Test images:", len(test_dataset))
print("Classes:", test_dataset.classes)


# =========================
# 5. DataLoader
# =========================

test_loader = DataLoader(
    test_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=0
)


# =========================
# 6. Model
# =========================

model = models.resnet18(weights=None)

num_classes = 37

model.fc = nn.Linear(
    model.fc.in_features,
    num_classes
)


# =========================
# 7. Load trained model
# =========================

checkpoint = torch.load(
    "best_model.pth",
    map_location=device
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(device)

model.eval()


# =========================
# 8. Prediction
# =========================

all_labels = []
all_predictions = []

wrong_predictions = []

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(device)
        labels = labels.to(device)

        outputs = model(images)

        probabilities = torch.softmax(outputs, dim=1)

        _, predictions = torch.max(outputs, 1)

        all_labels.extend(labels.cpu().numpy())
        all_predictions.extend(predictions.cpu().numpy())

        # Save wrong predictions
        for i in range(len(labels)):

            if predictions[i] != labels[i]:

                wrong_predictions.append({
                    "image": test_dataset.samples[
                        len(all_labels) - len(labels) + i
                    ][0],

                    "actual": test_dataset.classes[
                        labels[i].item()
                    ],

                    "predicted": test_dataset.classes[
                        predictions[i].item()
                    ],

                    "confidence": probabilities[
                        i, predictions[i]
                    ].item() * 100
                })


# =========================
# 9. Accuracy
# =========================

correct = sum(
    p == l
    for p, l in zip(
        all_predictions,
        all_labels
    )
)

total = len(all_labels)

accuracy = 100 * correct / total


print()
print("==============================")
print("TEST RESULTS")
print("==============================")
print("Correct:", correct)
print("Total:", total)
print(f"Test Accuracy: {accuracy:.2f}%")


# =========================
# 10. Classification Report
# =========================

print()
print("==============================")
print("CLASSIFICATION REPORT")
print("==============================")

print(
    classification_report(
        all_labels,
        all_predictions,
        target_names=test_dataset.classes,
        digits=4
    )
)


# =========================
# 11. Confusion Matrix
# =========================

cm = confusion_matrix(
    all_labels,
    all_predictions
)

plt.figure(figsize=(18, 16))

sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=test_dataset.classes,
    yticklabels=test_dataset.classes
)

plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("37-Class Food Classification Confusion Matrix")

plt.xticks(rotation=90)
plt.yticks(rotation=0)

plt.tight_layout()

plt.savefig(
    "confusion_matrix.png",
    dpi=300
)

plt.show()


# =========================
# 12. Wrong predictions
# =========================

print()
print("==============================")
print("WRONG PREDICTIONS")
print("==============================")

print(
    f"Total wrong predictions: "
    f"{len(wrong_predictions)}"
)

for i, item in enumerate(wrong_predictions, 1):

    print()
    print(f"{i}. Image: {item['image']}")
    print(f"   Actual: {item['actual']}")
    print(f"   Predicted: {item['predicted']}")
    print(f"   Confidence: {item['confidence']:.2f}%")


print()
print("Confusion matrix saved as:")
print("confusion_matrix.png")