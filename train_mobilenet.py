import torch
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import torch.nn as nn
import torch.optim as optim

# =========================
# 1. Device
# =========================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Device:", device)

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))


# =========================
# 2. Paths
# =========================

TRAIN_DIR = r"D:\food-classifier\data\train"
VAL_DIR = r"D:\food-classifier\data\val"


# =========================
# 3. Image transformations
# =========================

train_transform = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),

    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


val_transform = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# =========================
# 4. Load datasets
# =========================

train_dataset = datasets.ImageFolder(
    TRAIN_DIR,
    transform=train_transform
)

val_dataset = datasets.ImageFolder(
    VAL_DIR,
    transform=val_transform
)

print("Number of classes:", len(train_dataset.classes))
print("Classes:", train_dataset.classes)

print("Training images:", len(train_dataset))
print("Validation images:", len(val_dataset))


# =========================
# 5. DataLoaders
# =========================

train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True,
    num_workers=0,
    pin_memory=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=0,
    pin_memory=True
)


# =========================
# 6. Load MobileNetV2
# =========================

model = models.mobilenet_v2(
    weights=models.MobileNet_V2_Weights.DEFAULT
)


# =========================
# 7. Replace classifier
# =========================

num_classes = len(train_dataset.classes)

model.classifier[1] = nn.Linear(
    model.classifier[1].in_features,
    num_classes
)


# =========================
# 8. Move to GPU
# =========================

model = model.to(device)


# =========================
# 9. Loss
# =========================

criterion = nn.CrossEntropyLoss()


# =========================
# 10. Optimizer
# =========================

optimizer = optim.AdamW(
    model.parameters(),
    lr=0.0001,
    weight_decay=0.0001
)


# =========================
# 11. Training
# =========================

EPOCHS = 10

best_val_accuracy = 0.0

for epoch in range(EPOCHS):

    # ---------------------
    # Training
    # ---------------------

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)

        correct += (predicted == labels).sum().item()

    train_accuracy = 100 * correct / total

    train_loss = running_loss / len(train_loader)


    # ---------------------
    # Validation
    # ---------------------

    model.eval()

    val_correct = 0
    val_total = 0
    val_loss = 0.0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(device, non_blocking=True)
            labels = labels.to(device, non_blocking=True)

            outputs = model(images)

            loss = criterion(outputs, labels)

            val_loss += loss.item()

            _, predicted = torch.max(outputs, 1)

            val_total += labels.size(0)

            val_correct += (predicted == labels).sum().item()

    val_accuracy = 100 * val_correct / val_total

    val_loss = val_loss / len(val_loader)


    # ---------------------
    # Print results
    # ---------------------

    print(
        f"Epoch [{epoch + 1}/{EPOCHS}] "
        f"Train Loss: {train_loss:.4f} "
        f"Train Acc: {train_accuracy:.2f}% "
        f"Val Loss: {val_loss:.4f} "
        f"Val Acc: {val_accuracy:.2f}%"
    )


    # ---------------------
    # Save best model
    # ---------------------

    if val_accuracy > best_val_accuracy:

        best_val_accuracy = val_accuracy

        torch.save(
            {
                "model_state_dict": model.state_dict(),
                "classes": train_dataset.classes
            },
            "best_mobilenet_model.pth"
        )

        print("Best MobileNetV2 model saved!")


print()
print("Training complete!")
print(
    f"Best validation accuracy: "
    f"{best_val_accuracy:.2f}%"
)