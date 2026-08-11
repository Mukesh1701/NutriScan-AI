import { useState, useEffect, useCallback } from 'react';
import { Scan, Scale, Pencil, Plus, Target, Bot, Send, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_URL } from '../lib/config';
import { round2 } from '../lib/utils';
import MacroChart, { NutritionGrid } from '../components/MacroChart';

export default function ClassifyPage() {
  const {
    selectedFile, setSelectedFile,
    currentData, setCurrentData,
    quantity, setQuantity,
    useManualWeight, setUseManualWeight,
    manualWeight, setManualWeight,
    viewMode, setViewMode,
    userGoalProfile,
    todayLoggedCalories,
    getEffectiveWeight,
    trackCurrentMeal,
    showError,
  } = useApp();

  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: 'Hi! I can help you with recipes, diet plans, or any questions about the detected food above. What would you like to know?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [trackedSuccess, setTrackedSuccess] = useState(false);

  // Nutrition values based on view mode
  const getNutritionValues = useCallback(() => {
    if (!currentData) return { calories: null, protein: null, carbs: null, fat: null, fiber: null };
    
    const per100 = currentData.nutrition_per_100g || {};
    const effectiveWeight = getEffectiveWeight();
    
    if (viewMode === 'per100') {
      return {
        calories: per100.calories,
        protein: per100.protein,
        carbs: per100.carbs,
        fat: per100.fat,
        fiber: per100.fiber,
        unitLabel: 'kcal / 100g',
      };
    } else {
      const multiplier = effectiveWeight / 100;
      return {
        calories: per100.calories ? round2(per100.calories * multiplier) : null,
        protein: per100.protein ? round2(per100.protein * multiplier) : null,
        carbs: per100.carbs ? round2(per100.carbs * multiplier) : null,
        fat: per100.fat ? round2(per100.fat * multiplier) : null,
        fiber: per100.fiber ? round2(per100.fiber * multiplier) : null,
        unitLabel: `kcal / ${Math.round(effectiveWeight)}g`,
      };
    }
  }, [currentData, viewMode, getEffectiveWeight]);

  // Handle file selection
  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      showError('Please upload a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError('Image too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCurrentData(null);
    setQuantity(1);
    setUseManualWeight(false);
    setManualWeight(null);
    setTrackedSuccess(false);
  };

  // Analyze image
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      setCurrentData(data);
      setViewMode('total');
      setQuantity(1);
      setUseManualWeight(false);
      setManualWeight(null);
      setTrackedSuccess(false);
      setChatMessages([
        { role: 'ai', content: 'Hi! I can help you with recipes, diet plans, or any questions about the detected food above. What would you like to know?' }
      ]);
    } catch (err) {
      console.error('Prediction error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        showError('Cannot connect to the API. Make sure the server is running on localhost:8000');
      } else {
        showError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset upload
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentData(null);
    setQuantity(1);
    setUseManualWeight(false);
    setManualWeight(null);
    setTrackedSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Track meal
  const handleTrackMeal = () => {
    trackCurrentMeal();
    setTrackedSuccess(true);
    setTimeout(() => setTrackedSuccess(false), 2500);
  };

  // Send chat message
  const handleSendChat = async () => {
    if (!chatInput.trim() || !currentData) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    const effectiveWeight = getEffectiveWeight();
    const multiplier = effectiveWeight / 100;
    const p100 = currentData.nutrition_per_100g || {};

    const payload = {
      food: currentData.food,
      weight_g: effectiveWeight,
      calories: p100.calories ? p100.calories * multiplier : 0,
      protein: p100.protein ? p100.protein * multiplier : 0,
      carbs: p100.carbs ? p100.carbs * multiplier : 0,
      fat: p100.fat ? p100.fat * multiplier : 0,
      fiber: p100.fiber ? p100.fiber * multiplier : 0,
      question: userMessage,
    };

    try {
      const response = await fetch(`${API_URL}/ai-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      let formatted = data.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\n/g, '<br>');
      setChatMessages(prev => [...prev, { role: 'ai', content: formatted, html: true }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't reach the AI service right now. Please try again.", error: true }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Paste image from clipboard
  useEffect(() => {
    const handlePaste = async (e) => {
      if (e.ctrlKey && e.key === 'v') {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            for (const type of item.types) {
              if (type.startsWith('image/')) {
                const blob = await item.getType(type);
                const file = new File([blob], 'pasted-image.png', { type });
                handleFile(file);
              }
            }
          }
        } catch (err) {
          // Clipboard API not available
        }
      }
    };

    document.addEventListener('keydown', handlePaste);
    return () => document.removeEventListener('keydown', handlePaste);
  }, []);

  // Scroll to results
  useEffect(() => {
    if (currentData) {
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [currentData]);

  const nutritionValues = getNutritionValues();
  const effectiveWeight = getEffectiveWeight();

  // Goal progress calculations
  const targetCal = userGoalProfile.targetCalories || 2000;
  const goalLabels = { loss: 'Weight Loss', maintain: 'Maintenance', gain: 'Weight Gain' };
  const goalLabel = goalLabels[userGoalProfile.goal] || 'Fitness Target';
  const mealCal = currentData ? (currentData.nutrition_per_100g?.calories ? Math.round(currentData.nutrition_per_100g.calories * (effectiveWeight / 100)) : 0) : 0;
  const totalWithMeal = todayLoggedCalories + mealCal;
  const remaining = Math.max(0, targetCal - totalWithMeal);
  const mealPct = ((mealCal / targetCal) * 100).toFixed(1);
  const todayPct = Math.min(100, Math.round((totalWithMeal / targetCal) * 100));

  return (
    <div id="page-classify">
      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          Identify Food.<br />
          <span className="gradient-text">Know What You Eat.</span>
        </h1>
        <p className="hero-subtitle">
          Upload a photo of any fruit, vegetable, or chicken — our AI identifies it
          instantly and shows you the complete nutrition breakdown with weight estimation.
        </p>
        <div className="hero-badge">
          <span className="badge-pulse"></span>
          37 Food Classes · 3 AI Models · Weight Estimation
        </div>
      </section>

      {/* Upload Card */}
      <section className="upload-section">
        <div className="upload-card">
          <div
            className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => !previewUrl && document.getElementById('file-input').click()}
          >
            {!previewUrl ? (
              <div className="drop-zone-default">
                <div className="upload-icon-ring">
                  <svg className="upload-icon" viewBox="0 0 48 48" fill="none">
                    <path d="M24 32V16M24 16L18 22M24 16L30 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 30V36C8 38.2091 9.79086 40 12 40H36C38.2091 40 40 38.2091 40 36V30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="drop-title">Drop your food image here</h3>
                <p className="drop-subtitle">or click to browse files</p>
                <p className="drop-hint">JPG, PNG, WEBP · Max 10MB</p>
              </div>
            ) : (
              <div className="preview-state visible">
                <img src={previewUrl} className="preview-image" alt="Food preview" />
                <button className="btn-remove" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                  ×
                </button>
              </div>
            )}
            <input
              id="file-input"
              type="file"
              accept="image/*"
              style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}
              onChange={(e) => e.target.files.length > 0 && handleFile(e.target.files[0])}
            />
          </div>

          <button
            className="btn-analyze"
            disabled={!selectedFile || isAnalyzing}
            onClick={handleAnalyze}
          >
            {isAnalyzing ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                <Scan size={20} />
                Analyze Food
              </>
            )}
          </button>
        </div>
      </section>

      {/* Results Section */}
      {currentData && (
        <section id="results-section" className="results-section visible">
          {/* Main result */}
          <div className="result-hero-card">
            <div className="result-emoji"><Scan /></div>
            <h2 className="result-name">{currentData.food || 'Unknown'}</h2>
            <div className="confidence-wrapper">
              <div className="confidence-track">
                <div className="confidence-fill" style={{ width: `${currentData.confidence || 0}%` }}></div>
              </div>
              <span className="confidence-label">{(currentData.confidence || 0).toFixed(1)}% confidence</span>
            </div>
          </div>

          {/* Weight Estimation Card */}
          <div className="weight-card">
            <div className="weight-card-header">
              <div className="weight-icon-circle"><Scale className="icon-inline" /></div>
              <h3 className="weight-card-title">Estimated Weight</h3>
            </div>
            <div className="weight-display">
              <span className="weight-value">{Math.round(effectiveWeight)}</span>
              <span className="weight-grams">g</span>
            </div>
            <p className="weight-unit-label">
              {useManualWeight && manualWeight ? 'Manual weight' : quantity > 1 ? `≈ ${quantity} × ${currentData.weight_unit || 'items'}` : `≈ ${currentData.weight_unit || '100g serving'}`}
            </p>

            {/* Quantity Stepper */}
            <div className="quantity-section">
              <span className="quantity-label">Quantity</span>
              <div className="quantity-stepper">
                <button
                  className="qty-btn"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  disabled={quantity >= 99}
                  onClick={() => setQuantity(q => Math.min(99, q + 1))}
                >
                  +
                </button>
              </div>
            </div>

            {/* Manual Weight */}
            <div className="manual-weight-section">
              <div className="manual-toggle-row">
                <span className="manual-toggle-label">
                  <Pencil className="icon-inline" /> I know the exact weight
                </span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={useManualWeight}
                    onChange={(e) => {
                      setUseManualWeight(e.target.checked);
                      if (!e.target.checked) setManualWeight(null);
                    }}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {useManualWeight && (
                <div className="manual-input-wrapper visible">
                  <div className="manual-input-row">
                    <input
                      type="number"
                      className="manual-weight-input"
                      placeholder="Enter weight..."
                      min={1}
                      max={10000}
                      step={1}
                      value={manualWeight || ''}
                      onChange={(e) => setManualWeight(parseFloat(e.target.value) || null)}
                    />
                    <span className="manual-input-unit">grams</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="view-toggle-wrapper">
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'per100' ? 'active' : ''}`}
                onClick={() => setViewMode('per100')}
              >
                Per 100g
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'total' ? 'active' : ''}`}
                onClick={() => setViewMode('total')}
              >
                Total (estimated)
              </button>
            </div>
          </div>

          {/* Nutrition grid */}
          <NutritionGrid {...nutritionValues} />

          {/* Daily Goal Progress */}
          <div className="goal-progress-card">
            <div className="goal-progress-header">
              <div className="goal-progress-icon"><Target className="icon-inline" /></div>
              <div className="goal-progress-titles">
                <h3 className="goal-progress-main-title">Daily Goal Impact</h3>
                <span className="goal-progress-subtitle">Target: {targetCal.toLocaleString()} kcal ({goalLabel})</span>
              </div>
              <button className="btn-track-meal" onClick={handleTrackMeal} style={trackedSuccess ? { background: '#10b981' } : {}}>
                <Plus className="icon-inline" /> {trackedSuccess ? 'Tracked!' : 'Track Meal'}
              </button>
            </div>
            <div className="goal-impact-row">
              <div className="impact-stat">
                <span className="impact-label">Meal Calories</span>
                <span className="impact-value">{mealCal} kcal</span>
              </div>
              <div className="impact-stat">
                <span className="impact-label">Daily Budget Share</span>
                <span className="impact-value highlight">{mealPct}%</span>
              </div>
              <div className="impact-stat">
                <span className="impact-label">Remaining Today</span>
                <span className="impact-value">{remaining.toLocaleString()} kcal</span>
              </div>
            </div>
            <div className="goal-progress-bar-wrapper">
              <div className="goal-progress-bar-track">
                <div className="goal-progress-bar-fill" style={{ width: `${todayPct}%` }}></div>
              </div>
              <span className="goal-progress-bar-label">{totalWithMeal.toLocaleString()} / {targetCal.toLocaleString()} kcal logged today ({todayPct}%)</span>
            </div>
          </div>

          {/* Macro chart */}
          <MacroChart protein={nutritionValues.protein} carbs={nutritionValues.carbs} fat={nutritionValues.fat} />

          {/* Top 3 Predictions */}
          {currentData.top3_predictions && currentData.top3_predictions.length > 0 && (
            <div className="top3-card">
              <h3 className="section-label">All Predictions</h3>
              <div className="top3-list">
                {currentData.top3_predictions.map((item, i) => (
                  <div key={i} className="top3-item" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="top3-rank">{i + 1}</span>
                    <span className="top3-food">{item.food}</span>
                    <div className="top3-bar-wrapper">
                      <div className="top3-bar-bg">
                        <div className="top3-bar-fill" style={{ width: `${item.confidence || 0}%` }}></div>
                      </div>
                    </div>
                    <span className="top3-conf">{(item.confidence || 0).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Chat */}
          <div className="chat-card">
            <div className="chat-header">
              <div className="chat-header-icon"><Bot className="icon-inline" /></div>
              <div className="chat-header-title">Ask NutriScan AI</div>
            </div>
            <div className="chat-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}-message`} style={msg.error ? { color: 'var(--error)' } : {}}>
                  {msg.html ? <span dangerouslySetInnerHTML={{ __html: msg.content }} /> : msg.content}
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-message ai-message">
                  <div className="typing-indicator"><span></span><span></span><span></span></div>
                </div>
              )}
            </div>
            <div className="chat-chips">
              <button className="chat-chip" onClick={() => !isChatLoading && setChatInput('Is this healthy?')}>Is this healthy?</button>
              <button className="chat-chip" onClick={() => !isChatLoading && setChatInput('How to cook this?')}>How to cook this?</button>
              <button className="chat-chip" onClick={() => !isChatLoading && setChatInput('Meal ideas')}>Meal ideas</button>
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask about this food..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button className="btn-send" onClick={handleSendChat} disabled={isChatLoading}>
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Try again */}
          <button className="btn-again" onClick={handleReset}>
            <RefreshCw size={18} />
            Classify Another Food
          </button>
        </section>
      )}
    </div>
  );
}