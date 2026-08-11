// ==========================================
// NutriScan AI — Configuration & Constants
// ==========================================

const HOSTNAME = window.location.hostname || "localhost";
const isServerProxy = (window.location.port === "8080" || window.location.port === "8443");
const API_URL = isServerProxy ? "" : `http://${HOSTNAME}:8000`;

const FOOD_CLASSES = [
    "apple", "banana", "beetroot", "bell pepper", "cabbage",
    "capsicum", "carrot", "cauliflower", "chicken", "chilli pepper",
    "corn", "cucumber", "eggplant", "garlic", "ginger",
    "grapes", "jalepeno", "kiwi", "lemon", "lettuce",
    "mango", "onion", "orange", "paprika", "pear",
    "peas", "pineapple", "pomegranate", "potato", "raddish",
    "soy beans", "spinach", "sweetcorn", "sweetpotato", "tomato",
    "turnip", "watermelon"
];

const ICON_MAP = {};

// Storage Keys
const GOAL_PROFILE_KEY = "nutriscan_user_goal_profile";
const TRACKED_MEALS_KEY = "nutriscan_tracked_meals";
