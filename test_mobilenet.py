import torch
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import torch.nn as nn

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
# 3. Image transformation
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
# 4. Load test dataset
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
    num_workers=0,
    pin_memory=True
)


# =========================
# 6. Create MobileNetV2
# =========================

model = models.mobilenet_v2(weights=None)

num_classes = len(test_dataset.classes)

model.classifier[1] = nn.Linear(
    model.classifier[1].in_features,
    num_classes
)


# =========================
# 7. Load trained model
# =========================

checkpoint = torch.load(
    "best_mobilenet_model.pth",
    map_location=device
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(device)

model.eval()


# =========================
# 8. Test
# =========================

correct = 0
total = 0

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(
            device,
            non_blocking=True
        )

        labels = labels.to(
            device,
            non_blocking=True
        )

        outputs = model(images)

        _, predicted = torch.max(
            outputs,
            1
        )

        total += labels.size(0)

        correct += (
            predicted == labels
        ).sum().item()


# =========================
# 9. Accuracy
# =========================

accuracy = 100 * correct / total


print()
print("==============================")
print("MOBILENETV2 TEST RESULTS")
print("==============================")

print("Correct:", correct)
print("Total:", total)

print(f"Test Accuracy: {accuracy:.2f}%")