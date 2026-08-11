import cv2
import numpy as np


def get_food_dimensions(image_path, reference_pixels, reference_cm):
    """
    Estimate food dimensions from an image.

    reference_pixels:
        Pixel length of the known reference object.

    reference_cm:
        Real-world length of that reference object in cm.
    """

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Could not read image.")

    # --------------------------------
    # Pixel -> centimeter scale
    # --------------------------------

    pixels_per_cm = reference_pixels / reference_cm

    # --------------------------------
    # Resize for easier processing
    # --------------------------------

    image = cv2.resize(image, (800, 600))

    # --------------------------------
    # Convert to HSV
    # --------------------------------

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # --------------------------------
    # Create rough foreground mask
    # --------------------------------

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    edges = cv2.Canny(
        blurred,
        50,
        150
    )

    # --------------------------------
    # Find contours
    # --------------------------------

    contours, _ = cv2.findContours(
        edges,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        raise ValueError("Food object could not be detected.")

    # Ignore very small contours
    contours = [
        c for c in contours
        if cv2.contourArea(c) > 1000
    ]

    if not contours:
        raise ValueError("No suitable food object found.")

    # Select largest object
    contour = max(
        contours,
        key=cv2.contourArea
    )

    # --------------------------------
    # Bounding box
    # --------------------------------

    x, y, width, height = cv2.boundingRect(contour)

    # --------------------------------
    # Convert to cm
    # --------------------------------

    width_cm = width / pixels_per_cm
    height_cm = height / pixels_per_cm

    # Approximate depth
    # For a roughly round food item
    depth_cm = min(width_cm, height_cm) * 0.75

    return {
        "width_cm": round(width_cm, 2),
        "height_cm": round(height_cm, 2),
        "depth_cm": round(depth_cm, 2),
        "pixels_per_cm": round(pixels_per_cm, 2)
    }


if __name__ == "__main__":

    print("==============================")
    print("FOOD DIMENSION TEST")
    print("==============================")

    image_path = input("Enter image path: ")

    reference_pixels = float(
        input("Reference length in pixels: ")
    )

    reference_cm = float(
        input("Reference length in cm: ")
    )

    result = get_food_dimensions(
        image_path,
        reference_pixels,
        reference_cm
    )

    print()
    print("Detected dimensions:")
    print(
        f"Width:  {result['width_cm']} cm"
    )
    print(
        f"Height: {result['height_cm']} cm"
    )
    print(
        f"Depth:  {result['depth_cm']} cm"
    )