import torch
from torchvision import transforms, models
from PIL import Image
import torch.nn as nn
import sys

# =========================
# 1. Device
# =========================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Device:", device)

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))

# =========================
# 2. Nutrition database
#    Values are per 100 g
# =========================

nutrition = {

    "apple": {
        "calories": 52,
        "protein": 0.3,
        "carbs": 13.8,
        "fat": 0.2,
        "fiber": 2.4
    },

    "banana": {
        "calories": 89,
        "protein": 1.1,
        "carbs": 22.8,
        "fat": 0.3,
        "fiber": 2.6
    },

    "beetroot": {
        "calories": 43,
        "protein": 1.6,
        "carbs": 9.6,
        "fat": 0.2,
        "fiber": 2.8
    },

    "bell pepper": {
        "calories": 31,
        "protein": 1.0,
        "carbs": 6.0,
        "fat": 0.3,
        "fiber": 2.1
    },

    "cabbage": {
        "calories": 25,
        "protein": 1.3,
        "carbs": 5.8,
        "fat": 0.1,
        "fiber": 2.5
    },

    "capsicum": {
        "calories": 31,
        "protein": 1.0,
        "carbs": 6.0,
        "fat": 0.3,
        "fiber": 2.1
    },

    "carrot": {
        "calories": 41,
        "protein": 0.9,
        "carbs": 9.6,
        "fat": 0.2,
        "fiber": 2.8
    },

    "cauliflower": {
        "calories": 25,
        "protein": 1.9,
        "carbs": 5.0,
        "fat": 0.3,
        "fiber": 2.0
    },

    "chicken": {
        "calories": 239,
        "protein": 27.3,
        "carbs": 0.0,
        "fat": 13.6,
        "fiber": 0.0
    },

    "chilli pepper": {
        "calories": 40,
        "protein": 1.9,
        "carbs": 8.8,
        "fat": 0.4,
        "fiber": 1.5
    },

    "corn": {
        "calories": 86,
        "protein": 3.3,
        "carbs": 19.0,
        "fat": 1.4,
        "fiber": 2.7
    },

    "cucumber": {
        "calories": 15,
        "protein": 0.7,
        "carbs": 3.6,
        "fat": 0.1,
        "fiber": 0.5
    },

    "eggplant": {
        "calories": 25,
        "protein": 1.0,
        "carbs": 5.9,
        "fat": 0.2,
        "fiber": 3.0
    },

    "garlic": {
        "calories": 149,
        "protein": 6.4,
        "carbs": 33.1,
        "fat": 0.5,
        "fiber": 2.1
    },

    "ginger": {
        "calories": 80,
        "protein": 1.8,
        "carbs": 17.8,
        "fat": 0.8,
        "fiber": 2.0
    },

    "grapes": {
        "calories": 69,
        "protein": 0.7,
        "carbs": 18.1,
        "fat": 0.2,
        "fiber": 0.9
    },

    "jalepeno": {
        "calories": 29,
        "protein": 0.9,
        "carbs": 6.5,
        "fat": 0.4,
        "fiber": 2.8
    },

    "kiwi": {
        "calories": 61,
        "protein": 1.1,
        "carbs": 14.7,
        "fat": 0.5,
        "fiber": 3.0
    },

    "lemon": {
        "calories": 29,
        "protein": 1.1,
        "carbs": 9.3,
        "fat": 0.3,
        "fiber": 2.8
    },

    "lettuce": {
        "calories": 15,
        "protein": 1.4,
        "carbs": 2.9,
        "fat": 0.2,
        "fiber": 1.3
    },

    "mango": {
        "calories": 60,
        "protein": 0.8,
        "carbs": 15.0,
        "fat": 0.4,
        "fiber": 1.6
    },

    "onion": {
        "calories": 40,
        "protein": 1.1,
        "carbs": 9.3,
        "fat": 0.1,
        "fiber": 1.7
    },

    "orange": {
        "calories": 47,
        "protein": 0.9,
        "carbs": 11.8,
        "fat": 0.1,
        "fiber": 2.4
    },

    "paprika": {
        "calories": 282,
        "protein": 14.1,
        "carbs": 54.0,
        "fat": 12.9,
        "fiber": 34.9
    },

    "pear": {
        "calories": 57,
        "protein": 0.4,
        "carbs": 15.2,
        "fat": 0.1,
        "fiber": 3.1
    },

    "peas": {
        "calories": 81,
        "protein": 5.4,
        "carbs": 14.5,
        "fat": 0.4,
        "fiber": 5.1
    },

    "pineapple": {
        "calories": 50,
        "protein": 0.5,
        "carbs": 13.1,
        "fat": 0.1,
        "fiber": 1.4
    },

    "pomegranate": {
        "calories": 83,
        "protein": 1.7,
        "carbs": 18.7,
        "fat": 1.2,
        "fiber": 4.0
    },

    "potato": {
        "calories": 77,
        "protein": 2.0,
        "carbs": 17.5,
        "fat": 0.1,
        "fiber": 2.2
    },

    "raddish": {
        "calories": 16,
        "protein": 0.7,
        "carbs": 3.4,
        "fat": 0.1,
        "fiber": 1.6
    },

    "soy beans": {
        "calories": 173,
        "protein": 16.6,
        "carbs": 9.9,
        "fat": 9.0,
        "fiber": 6.0
    },

    "spinach": {
        "calories": 23,
        "protein": 2.9,
        "carbs": 3.6,
        "fat": 0.4,
        "fiber": 2.2
    },

    "sweetcorn": {
        "calories": 86,
        "protein": 3.3,
        "carbs": 19.0,
        "fat": 1.4,
        "fiber": 2.7
    },

    "sweetpotato": {
        "calories": 86,
        "protein": 1.6,
        "carbs": 20.1,
        "fat": 0.1,
        "fiber": 3.0
    },

    "tomato": {
        "calories": 18,
        "protein": 0.9,
        "carbs": 3.9,
        "fat": 0.2,
        "fiber": 1.2
    },

    "turnip": {
        "calories": 28,
        "protein": 0.9,
        "carbs": 6.4,
        "fat": 0.1,
        "fiber": 1.8
    },

    "watermelon": {
        "calories": 30,
        "protein": 0.6,
        "carbs": 7.6,
        "fat": 0.2,
        "fiber": 0.4
    }
}

# =========================
# 3. Load model
# =========================

checkpoint = torch.load(
    "best_model.pth",
    map_location=device
)

classes = checkpoint["classes"]

print("Number of classes:", len(classes))

# =========================
# 4. Create ResNet18
# =========================

model = models.resnet18(weights=None)

model.fc = nn.Linear(
    model.fc.in_features,
    len(classes)
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(device)
model.eval()

# =========================
# 5. Image transformation
# =========================

transform = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# =========================
# 6. Get image path
# =========================

if len(sys.argv) < 2:
    print("Usage:")
    print('python predict.py "path_to_image"')
    sys.exit()

image_path = sys.argv[1]

# =========================
# 7. Load image
# =========================

try:
    image = Image.open(image_path).convert("RGB")
except FileNotFoundError:
    print("ERROR: Image file not found.")
    print("Path:", image_path)
    sys.exit()

image = transform(image)

# Add batch dimension
image = image.unsqueeze(0)

image = image.to(device)

# =========================
# 8. Prediction
# =========================

with torch.no_grad():

    outputs = model(image)

    probabilities = torch.softmax(outputs, dim=1)

    # Get Top 3
    top_probs, top_indices = torch.topk(
        probabilities,
        3,
        dim=1
    )

# =========================
# 9. Display results
# =========================

print()
print("==============================")
print("PREDICTION")
print("==============================")

best_class = classes[top_indices[0][0].item()]
best_confidence = top_probs[0][0].item() * 100

print("Food:", best_class)
print(f"Confidence: {best_confidence:.2f}%")

# =========================
# 10. Nutrition
# =========================

if best_class in nutrition:

    data = nutrition[best_class]

    print()
    print("NUTRITION PER 100 g")
    print("------------------------------")

    print(f"Calories:       {data['calories']} kcal")
    print(f"Protein:        {data['protein']} g")
    print(f"Carbohydrates:  {data['carbs']} g")
    print(f"Fat:            {data['fat']} g")
    print(f"Fiber:          {data['fiber']} g")

else:

    print()
    print("Nutrition information not available.")

# =========================
# 11. Top 3 predictions
# =========================

print()
print("Top 3 Predictions:")

for i in range(3):

    class_index = top_indices[0][i].item()
    confidence = top_probs[0][i].item() * 100

    print(
        f"{i + 1}. {classes[class_index]} "
        f"- {confidence:.2f}%"
    )