import { useState } from 'react';
import { TrendingDown, Scale, TrendingUp, Sofa, Footprints, Activity, Bike, Dumbbell, User, Cake, Ruler, Target, Droplet, Salad } from 'lucide-react';
import { useApp } from '../context/AppContext';

const activityLevels = [
  { value: 1.2, label: 'Sedentary', sub: 'Little or no exercise', icon: Sofa },
  { value: 1.375, label: 'Lightly Active', sub: 'Exercise 1-3 days/wk', icon: Footprints },
  { value: 1.55, label: 'Moderately Active', sub: 'Exercise 3-5 days/wk', icon: Activity },
  { value: 1.725, label: 'Very Active', sub: 'Exercise 6-7 days/wk', icon: Bike },
  { value: 1.9, label: 'Extra Active', sub: 'Heavy physical work', icon: Dumbbell },
];

export default function CalculatorPage() {
  const {
    selectedGoal, setSelectedGoal,
    selectedPace, setSelectedPace,
    selectedGender, setSelectedGender,
    selectedActivity, setSelectedActivity,
    calcHeightUnit, setCalcHeightUnit,
    calcWeightUnit, setCalcWeightUnit,
    userGoalProfile, setUserGoalProfile,
    saveGoalProfile,
  } = useApp();

  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);
  const [weight, setWeight] = useState(70);
  const [weightRaw, setWeightRaw] = useState('70');
  const [showResults, setShowResults] = useState(false);

  const [results, setResults] = useState(null);

  const goalCards = [
    { id: 'loss', label: 'Weight Loss', desc: 'Burn fat and drop weight with a controlled caloric deficit', badge: 'Caloric Deficit', icon: TrendingDown },
    { id: 'maintain', label: 'Maintain Weight', desc: 'Keep your current weight stable, optimize vitality & energy', badge: 'Caloric Balance', icon: Scale },
    { id: 'gain', label: 'Weight Gain', desc: 'Build muscle and add healthy weight with a caloric surplus', badge: 'Caloric Surplus', icon: TrendingUp },
  ];

  const paceOptions = {
    loss: [
      { id: 'mild', label: 'Mild', sub: '0.25 kg / week (-250 kcal)' },
      { id: 'moderate', label: 'Recommended', sub: '0.50 kg / week (-500 kcal)' },
      { id: 'aggressive', label: 'Aggressive', sub: '0.75 kg / week (-750 kcal)' },
    ],
    maintain: [
      { id: 'mild', label: 'Mild', sub: 'Optimal Balance (0 kcal)' },
      { id: 'moderate', label: 'Recommended', sub: 'Balance (0 kcal)' },
      { id: 'aggressive', label: 'Active', sub: 'Active Maintenance (0 kcal)' },
    ],
    gain: [
      { id: 'mild', label: 'Mild', sub: '0.25 kg / week (+250 kcal)' },
      { id: 'moderate', label: 'Recommended', sub: '0.50 kg / week (+500 kcal)' },
      { id: 'aggressive', label: 'Aggressive', sub: '0.75 kg / week (+750 kcal)' },
    ],
  };

  const calculate = () => {
    let height = calcHeightUnit === 'cm' ? heightCm : (heightFt * 12 + heightIn) * 2.54;
    let weightKg = calcWeightUnit === 'kg' ? weight : weight / 2.20462;

    // Mifflin-St Jeor BMR
    let bmr = selectedGender === 'male'
      ? 10 * weightKg + 6.25 * height - 5 * age + 5
      : 10 * weightKg + 6.25 * height - 5 * age - 161;
    bmr = Math.round(bmr);

    const tdee = Math.round(bmr * selectedActivity);

    let offset = selectedPace === 'mild' ? 250 : selectedPace === 'moderate' ? 500 : 750;
    let targetCalories = tdee;
    let paceDescription = 'Maintains current bodyweight with zero daily calorie imbalance.';

    if (selectedGoal === 'loss') {
      targetCalories = Math.max(1200, tdee - offset);
      paceDescription = `Estimated weight loss rate: -${(offset / 1000).toFixed(2)} kg / week with a ${offset} kcal daily deficit.`;
    } else if (selectedGoal === 'gain') {
      targetCalories = tdee + offset;
      paceDescription = `Estimated muscle & weight gain rate: +${(offset / 1000).toFixed(2)} kg / week with a ${offset} kcal daily surplus.`;
    }

    const heightM = height / 100;
    const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
    let bmiCategory = 'Normal BMI';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obese';

    const proteinG = Math.round(weightKg * (selectedGoal === 'maintain' ? 1.6 : 2.0));
    const proteinCal = proteinG * 4;
    const fatCal = Math.round(targetCalories * (selectedGoal === 'gain' ? 0.30 : 0.26));
    const fatG = Math.round(fatCal / 9);
    const carbCal = Math.max(0, targetCalories - proteinCal - fatCal);
    const carbG = Math.round(carbCal / 4);
    const proPct = Math.round((proteinCal / targetCalories) * 100);
    const carbPct = Math.round((carbCal / targetCalories) * 100);
    const fatPct = Math.round((fatCal / targetCalories) * 100);
    const waterL = (weightKg * 0.038).toFixed(1);

    const newResults = {
      targetCalories,
      bmr,
      tdee,
      bmi,
      bmiCategory,
      paceDescription,
      proteinG,
      proteinCal,
      carbG,
      carbCal,
      fatG,
      fatCal,
      proPct,
      carbPct,
      fatPct,
      waterL,
    };

    setResults(newResults);
    setShowResults(true);

    setUserGoalProfile({
      ...userGoalProfile,
      goal: selectedGoal,
      pace: selectedPace,
      targetCalories,
      bmr,
      tdee,
      bmi,
      proteinG,
      carbsG: carbG,
      fatG,
      waterL,
      saved: false,
    });

    setTimeout(() => {
      document.getElementById('calc-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleSaveGoal = () => {
    saveGoalProfile();
  };

  const nutritionTips = {
    loss: 'Focus on high-volume, low-calorie foods like spinach, cucumber, and chicken breast to keep hunger away during your calorie deficit.',
    maintain: 'Maintain a balanced split of healthy fats, complex carbs, and lean proteins to sustain your daily energy levels.',
    gain: 'Incorporate dense nutrition like avocado, nuts, bananas, and whole eggs to meet your muscle-building calorie surplus.',
  };

  return (
    <div id="page-calculator">
      <section className="calculator-section">
        {/* Hero */}
        <div className="calc-hero">
          <h2 className="calc-title">
            Personalized <span className="gradient-text">Calorie & Goal Planner</span>
          </h2>
          <p className="calc-subtitle">
            Calculate your exact Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE),
            and recommended daily calories customized for your body and fitness goals.
          </p>
        </div>

        <div className="calc-container-card">
          {/* Step 1: Goal Selection */}
          <div className="calc-step-section">
            <div className="step-header">
              <span className="step-number">1</span>
              <div>
                <h3 className="step-title">Select Your Fitness Goal</h3>
                <p className="step-desc">Choose what you want to achieve with your daily nutrition</p>
              </div>
            </div>

            <div className="goals-grid">
              {goalCards.map((goal) => (
                <div
                  key={goal.id}
                  className={`goal-card ${selectedGoal === goal.id ? 'active' : ''}`}
                  onClick={() => setSelectedGoal(goal.id)}
                >
                  <div className="goal-icon"><goal.icon className="icon-inline" /></div>
                  <h4 className="goal-name">{goal.label}</h4>
                  <p className="goal-desc">{goal.desc}</p>
                  <span className="goal-badge">{goal.badge}</span>
                </div>
              ))}
            </div>

            <div className="pace-wrapper">
              <label className="pace-label">Select Goal Intensity / Target Pace:</label>
              <div className="pace-buttons">
                {paceOptions[selectedGoal].map((pace) => (
                  <button
                    key={pace.id}
                    type="button"
                    className={`pace-btn ${selectedPace === pace.id ? 'active' : ''}`}
                    onClick={() => setSelectedPace(pace.id)}
                  >
                    <span className="pace-title">{pace.label}</span>
                    <span className="pace-subtitle">{pace.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: User Details */}
          <div className="calc-step-section">
            <div className="step-header">
              <span className="step-number">2</span>
              <div>
                <h3 className="step-title">Enter Your Body Metrics</h3>
                <p className="step-desc">Used for Mifflin-St Jeor metabolic calculation</p>
              </div>
            </div>

            <form className="calc-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-grid">
                {/* Gender */}
                <div className="form-group full-width">
                  <label className="form-label">Biological Gender</label>
                  <div className="gender-toggle-group">
                    <button
                      type="button"
                      className={`gender-btn ${selectedGender === 'male' ? 'active' : ''}`}
                      onClick={() => setSelectedGender('male')}
                    >
                      <User className="icon-inline" /> Male
                    </button>
                    <button
                      type="button"
                      className={`gender-btn ${selectedGender === 'female' ? 'active' : ''}`}
                      onClick={() => setSelectedGender('female')}
                    >
                      <User className="icon-inline" /> Female
                    </button>
                  </div>
                </div>

                {/* Age */}
                <div className="form-group">
                  <label className="form-label">Age (years)</label>
                  <div className="input-with-icon">
                    <span className="input-icon"><Cake className="icon-inline" /></span>
                    <input
                      type="number"
                      className="form-input"
                      min={12}
                      max={110}
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                    />
                  </div>
                </div>

                {/* Height */}
                <div className="form-group">
                  <div className="label-with-unit">
                    <label className="form-label">Height</label>
                    <div className="unit-toggle-group">
                      <button
                        type="button"
                        className={`unit-btn ${calcHeightUnit === 'cm' ? 'active' : ''}`}
                        onClick={() => setCalcHeightUnit('cm')}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        className={`unit-btn ${calcHeightUnit === 'ft' ? 'active' : ''}`}
                        onClick={() => setCalcHeightUnit('ft')}
                      >
                        ft/in
                      </button>
                    </div>
                  </div>
                  {calcHeightUnit === 'cm' ? (
                    <div className="input-with-icon">
                      <span className="input-icon"><Ruler className="icon-inline" /></span>
                      <input
                        type="number"
                        className="form-input"
                        min={80}
                        max={250}
                        value={heightCm}
                        onChange={(e) => setHeightCm(parseFloat(e.target.value) || 175)}
                      />
                      <span className="input-unit-tag">cm</span>
                    </div>
                  ) : (
                    <div className="input-dual-row">
                      <div className="input-with-icon">
                        <input
                          type="number"
                          className="form-input"
                          min={3}
                          max={8}
                          value={heightFt}
                          onChange={(e) => setHeightFt(parseInt(e.target.value) || 5)}
                        />
                        <span className="input-unit-tag">ft</span>
                      </div>
                      <div className="input-with-icon">
                        <input
                          type="number"
                          className="form-input"
                          min={0}
                          max={11}
                          value={heightIn}
                          onChange={(e) => setHeightIn(parseInt(e.target.value) || 0)}
                        />
                        <span className="input-unit-tag">in</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Weight */}
                <div className="form-group">
                  <div className="label-with-unit">
                    <label className="form-label">Current Weight</label>
                    <div className="unit-toggle-group">
                      <button
                        type="button"
                        className={`unit-btn ${calcWeightUnit === 'kg' ? 'active' : ''}`}
                        onClick={() => setCalcWeightUnit('kg')}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        className={`unit-btn ${calcWeightUnit === 'lbs' ? 'active' : ''}`}
                        onClick={() => setCalcWeightUnit('lbs')}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  <div className="input-with-icon">
                    <span className="input-icon"><Scale className="icon-inline" /></span>
                    <input
                      type="number"
                      className="form-input"
                      min={30}
                      max={300}
                      step={0.5}
                      value={weightRaw}
                      onChange={(e) => {
                        setWeightRaw(e.target.value);
                        const parsed = parseFloat(e.target.value);
                        if (!isNaN(parsed) && parsed > 0) setWeight(parsed);
                      }}
                      onBlur={() => {
                        if (!weight || isNaN(weight)) {
                          setWeight(70);
                          setWeightRaw('70');
                        } else {
                          setWeightRaw(String(weight));
                        }
                      }}
                    />
                    <span className="input-unit-tag">{calcWeightUnit}</span>
                  </div>
                </div>
              </div>

              {/* Activity Level */}
              <div className="form-group full-width activity-section">
                <label className="form-label">Activity Level</label>
                <div className="activity-grid">
                  {activityLevels.map((level) => (
                    <div
                      key={level.value}
                      className={`activity-card ${selectedActivity === level.value ? 'active' : ''}`}
                      onClick={() => setSelectedActivity(level.value)}
                    >
                      <div className="activity-icon"><level.icon className="icon-inline" /></div>
                      <div className="activity-info">
                        <div className="activity-title">{level.label}</div>
                        <div className="activity-sub">{level.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="button" className="btn-calculate" onClick={calculate}>
                <Target size={20} />
                Calculate My Calorie Target
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        {showResults && results && (
          <div id="calc-results-section" className="calc-results-section">
            <div className="target-hero-card">
              <div className="target-badge"><Target className="icon-inline" /> {selectedGoal === 'loss' ? 'Weight Loss Goal' : selectedGoal === 'maintain' ? 'Weight Maintenance Goal' : 'Weight Gain Goal'}</div>
              <h3 className="target-card-subtitle">Recommended Daily Target</h3>
              <div className="target-calories-display">
                <span className="target-cal-val">{results.targetCalories.toLocaleString()}</span>
                <span className="target-cal-unit">kcal / day</span>
              </div>
              <p className="target-pace-text" dangerouslySetInnerHTML={{ __html: results.paceDescription }} />
              <div className="metrics-sub-grid">
                <div className="metric-mini-card">
                  <span className="metric-mini-icon"><Activity className="icon-inline" /></span>
                  <span className="metric-mini-val">{results.tdee.toLocaleString()}</span>
                  <span className="metric-mini-lbl">Maintenance (TDEE)</span>
                </div>
                <div className="metric-mini-card">
                  <span className="metric-mini-icon"><Droplet className="icon-inline" /></span>
                  <span className="metric-mini-val">{results.bmr.toLocaleString()}</span>
                  <span className="metric-mini-lbl">Basal Rate (BMR)</span>
                </div>
                <div className="metric-mini-card">
                  <span className="metric-mini-icon"><Activity className="icon-inline" /></span>
                  <span className="metric-mini-val">{results.bmi}</span>
                  <span className="metric-mini-lbl">{results.bmiCategory}</span>
                </div>
              </div>
            </div>

            {/* Macro Split */}
            <div className="calc-card">
              <h3 className="section-label">Recommended Daily Macro Split</h3>
              <div className="macro-target-grid">
                <div className="macro-target-card macro-pro">
                  <div className="macro-target-header">
                    <span className="macro-target-icon"><Dumbbell className="icon-inline" /></span>
                    <span className="macro-target-name">Protein</span>
                  </div>
                  <div className="macro-target-val">{results.proteinG}g</div>
                  <div className="macro-target-sub">{results.proteinCal} kcal · {results.proPct}%</div>
                  <div className="macro-bar-track">
                    <div className="macro-bar-fill pro-fill" style={{ width: `${results.proPct}%` }}></div>
                  </div>
                </div>
                <div className="macro-target-card macro-carb">
                  <div className="macro-target-header">
                    <span className="macro-target-icon"><Activity className="icon-inline" /></span>
                    <span className="macro-target-name">Carbs</span>
                  </div>
                  <div className="macro-target-val">{results.carbG}g</div>
                  <div className="macro-target-sub">{results.carbCal} kcal · {results.carbPct}%</div>
                  <div className="macro-bar-track">
                    <div className="macro-bar-fill carb-fill" style={{ width: `${results.carbPct}%` }}></div>
                  </div>
                </div>
                <div className="macro-target-card macro-fat">
                  <div className="macro-target-header">
                    <span className="macro-target-icon"><Droplet className="icon-inline" /></span>
                    <span className="macro-target-name">Healthy Fats</span>
                  </div>
                  <div className="macro-target-val">{results.fatG}g</div>
                  <div className="macro-target-sub">{results.fatCal} kcal · {results.fatPct}%</div>
                  <div className="macro-bar-track">
                    <div className="macro-bar-fill fat-fill" style={{ width: `${results.fatPct}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Insights */}
            <div className="calc-card">
              <h3 className="section-label">Smart Personal Insights</h3>
              <div className="advice-grid">
                <div className="advice-item">
                  <div className="advice-icon"><Droplet className="icon-inline" /></div>
                  <div className="advice-content">
                    <div className="advice-title">Daily Hydration Target</div>
                    <div className="advice-desc">Drink at least {results.waterL} Liters (≈ {(results.waterL * 4).toFixed(0)} glasses) of water daily for optimal digestion and cellular metabolism.</div>
                  </div>
                </div>
                <div className="advice-item">
                  <div className="advice-icon"><Salad className="icon-inline" /></div>
                  <div className="advice-content">
                    <div className="advice-title">Nutrition Tip for Your Goal</div>
                    <div className="advice-desc">{nutritionTips[selectedGoal]}</div>
                  </div>
                </div>
                <div className="advice-item">
                  <div className="advice-icon"><Dumbbell className="icon-inline" /></div>
                  <div className="advice-content">
                    <div className="advice-title">Fitness Tip</div>
                    <div className="advice-desc">Pair this daily budget with regular workouts for maximum results.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Goal */}
            <div className="apply-cta-card">
              <button type="button" className="btn-save-goal" onClick={handleSaveGoal}>
                Save Goal & Apply to Scanner
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}