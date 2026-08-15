// In development  → http://localhost:8000
// In production   → your Render URL (set VITE_API_URL in Vercel dashboard)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


export const FOOD_CLASSES = [
  'apple', 'banana', 'beetroot', 'bell pepper', 'cabbage',
  'capsicum', 'carrot', 'cauliflower', 'chicken', 'chilli pepper',
  'corn', 'cucumber', 'eggplant', 'garlic', 'ginger',
  'grapes', 'jalepeno', 'kiwi', 'lemon', 'lettuce',
  'mango', 'onion', 'orange', 'paprika', 'pear',
  'peas', 'pineapple', 'pomegranate', 'potato', 'raddish',
  'soy beans', 'spinach', 'sweetcorn', 'sweetpotato', 'tomato',
  'turnip', 'watermelon',
];

export const GRADE_INFO = {
  A: { label: 'Excellent Nutritional Quality', description: 'Excellent choice! Very healthy, balanced profile. Consume regularly.' },
  B: { label: 'Good Nutritional Quality', description: 'Good choice. Mostly healthy, suitable for regular consumption.' },
  C: { label: 'Moderate Nutritional Quality', description: 'Moderate choice. Okay to consume, but watch portion sizes.' },
  D: { label: 'Poor Nutritional Quality', description: 'Poor choice. Contains high amounts of sugar, fat, or salt. Limit intake.' },
  E: { label: 'Bad Nutritional Quality', description: 'Unhealthy. Very high in sugar, saturated fats, or salt. Consume rarely.' },
  F: { label: 'Avoid Consuming', description: 'Extremely unhealthy. Avoid consumption due to poor nutritional profile.' },
};

export const NOVA_LABELS = {
  1: 'NOVA 1 · Unprocessed',
  2: 'NOVA 2 · Processed Culinary Ing.',
  3: 'NOVA 3 · Processed',
  4: 'NOVA 4 · Ultra-Processed',
};
