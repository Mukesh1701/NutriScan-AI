# scale_detector.py

def calculate_scale(reference_pixels, reference_cm):
    """
    Calculate pixels per centimeter.

    Example:
    Reference object = 10 cm
    Its width in image = 500 pixels

    Scale = 500 / 10 = 50 pixels/cm
    """

    if reference_pixels <= 0:
        raise ValueError("Reference pixels must be greater than 0.")

    if reference_cm <= 0:
        raise ValueError("Reference size must be greater than 0.")

    pixels_per_cm = reference_pixels / reference_cm

    return pixels_per_cm


def pixels_to_cm(pixels, pixels_per_cm):
    """
    Convert image pixels to real-world centimeters.
    """

    if pixels <= 0:
        raise ValueError("Pixels must be greater than 0.")

    if pixels_per_cm <= 0:
        raise ValueError("Scale must be greater than 0.")

    return pixels / pixels_per_cm


if __name__ == "__main__":

    # Example:
    # A 10 cm reference object appears as 500 pixels.
    reference_pixels = 500
    reference_cm = 10

    scale = calculate_scale(
        reference_pixels,
        reference_cm
    )

    print("==============================")
    print("SCALE DETECTION TEST")
    print("==============================")

    print(f"Reference size: {reference_cm} cm")
    print(f"Reference pixels: {reference_pixels}px")
    print(f"Scale: {scale:.2f} pixels/cm")

    # Example food width
    food_pixels = 350

    food_width_cm = pixels_to_cm(
        food_pixels,
        scale
    )

    print(f"Food width: {food_pixels}px")
    print(f"Food width: {food_width_cm:.2f} cm")