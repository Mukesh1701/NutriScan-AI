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
              <p>NutriScan AI &copy; 2026</p>
               <p className="creator-credit">
                 Created by <span className="creator-name">Your Name</span>
                 </p>
             <div className="creator-links">
                    <a href="https://github.com/Mukesh1701" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                   <svg className="icon-inline" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                     <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                   </svg>
                 </a>
                 <a href="https://www.linkedin.com/in/veeravalli-mukesh-1840b7321/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                   <svg className="icon-inline" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                   </svg>
                 </a>
               </div>
             </div>
        {/* <div className="about-footer">
          <p>NutriScan AI &copy; 2026</p>
          <p className="creator-credit">
            Created by <span className="creator-name">Veeravalli Mukesh</span>
          </p>
          <div className="creator-links">
            <a href="https://github.com/Mukesh1701" target="_blank" rel="noopener noreferrer">
              <Github className="icon-inline" />
            </a>
            <a href="https://www.linkedin.com/in/veeravalli-mukesh-1840b7321/" target="_blank" rel="noopener noreferrer">
              <Linkedin className="icon-inline" />
            </a>
          </div>
        </div> */}
      </section>
    </div>
  );
}