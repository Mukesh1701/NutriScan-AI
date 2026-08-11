import { Globe, Zap, Shield, Smartphone } from 'lucide-react';
import { FOOD_CLASSES } from '../lib/config';

export default function AboutPage() {
  return (
    <div id="page-about">
      <section className="about-section">
        <div className="about-hero">
          <h2 className="about-title">
            About <span className="gradient-text">NutriScan AI</span>
          </h2>
          <p className="about-subtitle">
            An intelligent food recognition system powered by deep learning models
            to help you understand what you eat and make healthier choices.
          </p>
        </div>

        <div className="about-features">
          <div className="feature-card">
            <div className="feature-icon"><Zap className="icon-inline" /></div>
            <h3>Real-Time Classification</h3>
            <p>Upload any image of fruits, vegetables, or chicken and get instant predictions with confidence scores from multiple AI models.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Globe className="icon-inline" /></div>
            <h3>Nutrition Database</h3>
            <p>Access detailed nutritional information for 37 food classes, including calories, protein, carbs, fat, and fiber values.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield className="icon-inline" /></div>
            <h3>Barcode Scanner</h3>
            <p>Scan packaged food barcodes to instantly reveal health grades, ingredient alerts, and nutritional breakdowns.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Smartphone className="icon-inline" /></div>
            <h3>Goal Tracking</h3>
            <p>Calculate your daily calorie needs and track your progress towards weight loss, maintenance, or muscle gain goals.</p>
          </div>
        </div>

        <div className="about-supported">
          <h3>Supported Food Classes (37)</h3>
          <div id="food-tags" className="food-tags">
            {FOOD_CLASSES.map((food, i) => (
              <span key={i} className="food-tag">{food}</span>
            ))}
          </div>
        </div>

        <div className="about-tech">
          <h3>Technology Stack</h3>
          <ul>
            <li><strong>Backend:</strong> Python, FastAPI, PyTorch</li>
            <li><strong>AI Models:</strong> MobileNetV3, EfficientNet-B0, Custom CNN</li>
            <li><strong>Frontend:</strong> React, Vite, Lucide Icons</li>
            <li><strong>Barcode Data:</strong> Open Food Facts API</li>
          </ul>
        </div>

        <div className="about-footer">
          <p>Built with care for healthier eating habits.</p>
          <p className="about-version">Version 2.0.0 — React Edition</p>
        </div>
      </section>
    </div>
  );
}