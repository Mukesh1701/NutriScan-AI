# weight_estimator.py

import math


# Approximate densities in g/cm³
# These are used only for estimating weight from physical volume.
FOOD_DENSITY = {
    "apple": 0.85,
    "banana": 0.94,
    "beetroot": 1.05,
    "bell pepper": 0.50,
    "cabbage": 0.40,
    "capsicum": 0.50,
    "carrot": 0.64,
    "cauliflower": 0.50,
    "chicken": 1.05,
    "chilli pepper": 0.50,
    "corn": 0.72,
    "cucumber": 0.67,
    "eggplant": 0.60,
    "garlic": 0.90,
    "ginger": 0.95,
    "grapes": 1.05,
    "jalepeno": 0.50,
    "kiwi": 0.95,
    "lemon": 0.85,
    "lettuce": 0.35,
    "mango": 1.00,
    "onion": 0.85,
    "orange": 0.85,
    "paprika": 0.50,
    "pear": 0.90,
    "peas": 0.80,
    "pineapple": 0.90,
    "pomegranate": 1.00,
    "potato": 1.10,
    "raddish": 0.95,
    "soy beans": 0.80,
    "spinach": 0.35,
    "sweetcorn": 0.72,
    "sweetpotato": 1.00,
    "tomato": 0.95,
    "turnip": 0.80,
    "watermelon": 0.95
}


def estimate_weight(
    food_name,
    width_cm,
    height_cm,
    depth_cm=None
):
    """
    Estimate food weight from approximate physical dimensions.

    width_cm  = food width in centimeters
    height_cm = food height in centimeters
    depth_cm  = food depth/thickness in centimeters

    If depth is not supplied, we estimate it from width.
    """

    food_name = food_name.lower()

    if food_name not in FOOD_DENSITY:
        raise ValueError(
            f"No density data available for: {food_name}"
        )

    if width_cm <= 0 or height_cm <= 0:
        raise ValueError("Dimensions must be greater than zero.")

    # If depth is unknown, use a simple approximation.
    if depth_cm is None:
        depth_cm = (width_cm + height_cm) / 2

    # Approximate the food as an ellipsoid.
    radius_width = width_cm / 2
    radius_height = height_cm / 2
    radius_depth = depth_cm / 2

    volume_cm3 = (
        (4 / 3)
        * math.pi
        * radius_width
        * radius_height
        * radius_depth
    )

    density = FOOD_DENSITY[food_name]

    weight_g = volume_cm3 * density

    return round(weight_g, 1)


if __name__ == "__main__":

    # Example: apple
    weight = estimate_weight(
        food_name="apple",
        width_cm=7,
        height_cm=7,
        depth_cm=6.5
    )

    print("==============================")
    print("WEIGHT ESTIMATION")
    print("==============================")
    print("Food: apple")
    print(f"Estimated weight: {weight} g")