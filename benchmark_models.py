import torch
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import torch.nn as nn
import time
import os

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

transform = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

test_dataset = datasets.ImageFolder(
    TEST_DIR,
    transform=transform
)

test_loader = DataLoader(
    test_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=0,
    pin_memory=True
)

num_classes = len(test_dataset.classes)

print("Test images:", len(test_dataset))
print("Classes:", num_classes)


# =========================
# 3. Model loader
# =========================

def load_model(model_name, checkpoint_path):

    if model_name == "ResNet18":

        model = models.resnet18(weights=None)

        model.fc = nn.Linear(
            model.fc.in_features,
            num_classes
        )

    elif model_name == "MobileNetV2":

        model = models.mobilenet_v2(weights=None)

        model.classifier[1] = nn.Linear(
            model.classifier[1].in_features,
            num_classes
        )

    elif model_name == "EfficientNet-B0":

        model = models.efficientnet_b0(weights=None)

        model.classifier[1] = nn.Linear(
            model.classifier[1].in_features,
            num_classes
        )

    checkpoint = torch.load(
        checkpoint_path,
        map_location=device
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model = model.to(device)
    model.eval()

    return model


# =========================
# 4. Benchmark function
# =========================

def benchmark(model_name, checkpoint_path):

    print()
    print("==============================")
    print(model_name)
    print("==============================")

    model = load_model(
        model_name,
        checkpoint_path
    )

    correct = 0
    total = 0

    all_predictions = []
    all_labels = []

    # -------------------------
    # Warm-up GPU
    # -------------------------

    with torch.no_grad():

        for images, labels in test_loader:

            images = images.to(
                device,
                non_blocking=True
            )

            _ = model(images)

            break

    if device.type == "cuda":
        torch.cuda.synchronize()

    # -------------------------
    # Start timer
    # -------------------------

    start_time = time.perf_counter()

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

            all_predictions.extend(
                predicted.cpu().tolist()
            )

            all_labels.extend(
                labels.cpu().tolist()
            )

    if device.type == "cuda":
        torch.cuda.synchronize()

    end_time = time.perf_counter()

    # -------------------------
    # Accuracy
    # -------------------------

    accuracy = 100 * correct / total

    # -------------------------
    # F1 Score
    # -------------------------

    try:

        from sklearn.metrics import f1_score

        f1 = f1_score(
            all_labels,
            all_predictions,
            average="macro"
        )

    except ImportError:

        print(
            "scikit-learn not installed."
        )

        f1 = 0.0

    # -------------------------
    # Timing
    # -------------------------

    total_time = end_time - start_time

    avg_time_ms = (
        total_time / total
    ) * 1000

    # -------------------------
    # Model size
    # -------------------------

    model_size_mb = (
        os.path.getsize(checkpoint_path)
        / (1024 * 1024)
    )

    # -------------------------
    # Parameters
    # -------------------------

    parameters = sum(
        p.numel()
        for p in model.parameters()
    )

    parameters_m = parameters / 1_000_000

    # -------------------------
    # Results
    # -------------------------

    print("Correct:", correct)
    print("Total:", total)

    print(
        f"Accuracy: {accuracy:.2f}%"
    )

    print(
        f"Macro F1 Score: {f1:.4f}"
    )

    print(
        f"Average Inference Time: "
        f"{avg_time_ms:.2f} ms/image"
    )

    print(
        f"Model Size: "
        f"{model_size_mb:.2f} MB"
    )

    print(
        f"Parameters: "
        f"{parameters_m:.2f} million"
    )

    return {
        "model": model_name,
        "accuracy": accuracy,
        "f1": f1,
        "time": avg_time_ms,
        "size": model_size_mb,
        "parameters": parameters_m
    }


# =========================
# 5. Run all models
# =========================

results = []

results.append(
    benchmark(
        "ResNet18",
        "best_model.pth"
    )
)

results.append(
    benchmark(
        "MobileNetV2",
        "best_mobilenet_model.pth"
    )
)

results.append(
    benchmark(
        "EfficientNet-B0",
        "best_efficientnet_model.pth"
    )
)


# =========================
# 6. Final comparison
# =========================

print()
print()
print("==============================================================")
print("FINAL MODEL COMPARISON")
print("==============================================================")

print(
    f"{'Model':<18}"
    f"{'Accuracy':<12}"
    f"{'F1':<12}"
    f"{'Time(ms)':<12}"
    f"{'Size(MB)':<12}"
    f"{'Params(M)':<12}"
)

print("-" * 78)

for r in results:

    print(
        f"{r['model']:<18}"
        f"{r['accuracy']:<12.2f}"
        f"{r['f1']:<12.4f}"
        f"{r['time']:<12.2f}"
        f"{r['size']:<12.2f}"
        f"{r['parameters']:<12.2f}"
    )