import { createContext, useContext, useState } from 'react';

// Storage keys
const GOAL_PROFILE_KEY = 'nutriscan_user_goal_profile';
const TRACKED_MEALS_KEY = 'nutriscan_tracked_meals';

const AppContext = createContext();

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function AppProvider({ children }) {
  // Load saved goal profile from localStorage
  const loadSavedGoalProfile = () => {
    try {
      const saved = localStorage.getItem(GOAL_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load goal profile:', e);
    }
    return null;
  };

  // In-memory tracked meals (resets on reload)
  const [trackedMeals, setTrackedMeals] = useState([]);
  
  const getTodayCalories = (meals) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return meals
      .filter(m => m.date === todayStr)
      .reduce((sum, m) => sum + (m.calories || 0), 0);
  };

  // Default user goal profile
  const defaultGoalProfile = {
    goal: 'loss',
    pace: 'moderate',
    targetCalories: 2000,
    bmr: 1655,
    tdee: 2565,
    bmi: 22.9,
    proteinG: 140,
    carbsG: 232,
    fatG: 64,
    waterL: 2.8,
    saved: false,
  };

  // Classify page state
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [useManualWeight, setUseManualWeight] = useState(false);
  const [manualWeight, setManualWeight] = useState(null);
  const [viewMode, setViewMode] = useState('total'); // "per100" or "total"

  // Calculator state
  const [selectedGoal, setSelectedGoal] = useState('loss');
  const [selectedPace, setSelectedPace] = useState('moderate');
  const [selectedGender, setSelectedGender] = useState('male');
  const [selectedActivity, setSelectedActivity] = useState(1.55);
  const [calcHeightUnit, setCalcHeightUnit] = useState('cm');
  const [calcWeightUnit, setCalcWeightUnit] = useState('kg');

  // User Goal Profile
  const [userGoalProfile, setUserGoalProfile] = useState(() => {
    const saved = loadSavedGoalProfile();
    return saved || defaultGoalProfile;
  });

  // Today's logged calories
  const [todayLoggedCalories, setTodayLoggedCalories] = useState(0);

  // Toast/error state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info', // 'info', 'error', 'success'
  });

  // Effective weight calculation
  const getEffectiveWeight = () => {
    if (!currentData) return 100;

    if (useManualWeight && manualWeight && manualWeight > 0) {
      return manualWeight;
    }

    const baseWeight = currentData.estimated_weight_g || 100;
    return baseWeight * quantity;
  };

  // Track a meal
  const trackCurrentMeal = () => {
    if (!currentData) return;
    const effectiveWeight = getEffectiveWeight();
    const multiplier = effectiveWeight / 100;
    const p100 = currentData.nutrition_per_100g || {};
    const calories = p100.calories ? Math.round(p100.calories * multiplier) : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const meal = {
      id: Date.now(),
      food: currentData.food,
      weight_g: Math.round(effectiveWeight),
      calories,
      date: todayStr,
      timestamp: new Date().toISOString(),
    };

    const newMeals = [...trackedMeals, meal];
    setTrackedMeals(newMeals);
    setTodayLoggedCalories(getTodayCalories(newMeals));

    // Show success toast
    showToast(`Tracked ${calories} kcal for ${currentData.food}!`, 'success');
  };

  // Save goal profile
  const saveGoalProfile = () => {
    try {
      const profileToSave = { ...userGoalProfile, saved: true };
      localStorage.setItem(GOAL_PROFILE_KEY, JSON.stringify(profileToSave));
      setUserGoalProfile(profileToSave);
      showToast('Goal target saved & applied to NutriScan Scanner!', 'success');
    } catch (e) {
      console.warn('Failed to save goal profile:', e);
      showToast('Failed to save goal profile.', 'error');
    }
  };

  // Toast helpers
  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'info' });
    }, 4000);
  };

  const showError = (message) => showToast(message, 'error');

  // Value
  const value = {
    // State
    selectedFile,
    setSelectedFile,
    currentData,
    setCurrentData,
    quantity,
    setQuantity,
    useManualWeight,
    setUseManualWeight,
    manualWeight,
    setManualWeight,
    viewMode,
    setViewMode,
    selectedGoal,
    setSelectedGoal,
    selectedPace,
    setSelectedPace,
    selectedGender,
    setSelectedGender,
    selectedActivity,
    setSelectedActivity,
    calcHeightUnit,
    setCalcHeightUnit,
    calcWeightUnit,
    setCalcWeightUnit,
    userGoalProfile,
    setUserGoalProfile,
    todayLoggedCalories,
    setTodayLoggedCalories,
    toast,
    setToast,

    // Helpers
    getEffectiveWeight,
    trackCurrentMeal,
    saveGoalProfile,
    showToast,
    showError,

    // Constants
    GOAL_PROFILE_KEY,
    TRACKED_MEALS_KEY,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}