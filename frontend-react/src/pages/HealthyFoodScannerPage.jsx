import { Link } from 'react-router-dom';
import { Heart, X, CheckCircle2, ArrowRight, Leaf, Gauge } from 'lucide-react';
import { useSEO } from '../lib/useSEO';

const healthySignals = [
  { good: true, label: 'Short ingredient list (fewer than 5–8 ingredients)' },
  { good: true, label: 'Whole food ingredients you can recognize and pronounce' },
  { good: true, label: 'High protein relative to calories' },
  { good: true, label: 'Significant dietary fiber (3g+ per 100g)' },
  { good: true, label: 'Low added sugar (under 5g per 100g)' },
  { good: true, label: 'Low sodium (under 500mg per 100g)' },
  { good: false, label: 'High-fructose corn syrup or glucose-fructose syrup' },
  { good: false, label: 'Hydrogenated or partially hydrogenated oils (trans fats)' },
  { good: false, label: 'More than 3 artificial additives or preservatives' },
  { good: false, label: 'Sugar listed as one of the first three ingredients' },
  { good: false, label: 'More than 20g sugar per 100g' },
  { good: false, label: 'NOVA Group 4 (ultra-processed)' },
];

const commonUnhealthyFoods = [
  { name: 'Instant noodles', reason: 'Ultra-processed, high sodium, refined carbs with little nutrition' },
  { name: 'Flavored yogurts', reason: 'Often contain as much sugar as a dessert despite seeming healthy' },
  { name: 'Breakfast cereals', reason: 'Many are high in added sugar; always check the label' },
  { name: 'Fruit juices', reason: 'High natural sugars without the fiber benefit of whole fruit' },
  { name: 'Low-fat products', reason: 'Fat is often replaced with sugar or artificial additives' },
];

export default function HealthyFoodScannerPage() {
  useSEO(
    'Healthy Food Scanner – Check If Your Food Is Good for You | NutriScan AI',
    'Use NutriScan AI\'s healthy food scanner to check if packaged foods are actually good for you. Get instant health grades, NOVA scores, and ingredient alerts.',
    'https://www.nutriscan-ai.in/healthy-food-scanner'
  );

  return (
    <div className="seo-page">
      {/* Hero */}
      <section className="seo-hero">
        <div className="seo-hero-badge">
          <Heart className="icon-inline" /> Healthy Food Check
        </div>
        <h1 className="seo-hero-title">
          <span className="gradient-text">Healthy Food Scanner</span> —<br />
          Check If Your Food Is Good for You
        </h1>
        <p className="seo-hero-subtitle">
          Food packaging is full of misleading health claims. "Low fat." "Natural." "No added sugar." 
          NutriScan AI cuts through the marketing and gives you an honest, science-based health score 
          for any packaged food product — in seconds.
        </p>
        <div className="seo-hero-actions">
          <Link to="/" className="btn-primary-cta">
            Check Your Food <ArrowRight className="icon-inline" style={{ marginLeft: 6, marginRight: 0 }} />
          </Link>
          <a href="#what-makes-food-healthy" className="btn-secondary-cta">What makes food healthy?</a>
        </div>
      </section>

      {/* What makes food healthy */}
      <section className="seo-section" id="what-makes-food-healthy">
        <h2 className="seo-section-title">What Actually Makes a Food Healthy?</h2>
        <p className="seo-section-subtitle">
          "Healthy" is more than just calories. NutriScan AI evaluates multiple dimensions of food quality — 
          here's what we look for:
        </p>
        <div className="seo-health-signals">
          {healthySignals.map((s) => (
            <div key={s.label} className={`seo-signal ${s.good ? 'seo-signal-good' : 'seo-signal-bad'}`}>
              {s.good
                ? <CheckCircle2 size={18} style={{ color: 'var(--grade-a)', flexShrink: 0 }} />
                : <X size={18} style={{ color: 'var(--grade-e)', flexShrink: 0 }} />
              }
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Misleading labels */}
      <section className="seo-section seo-section-alt">
        <h2 className="seo-section-title">
          <Leaf className="icon-inline" style={{ color: 'var(--grade-b)' }} />
          Common "Healthy" Foods That Aren't
        </h2>
        <p className="seo-section-subtitle">
          These foods are often marketed as healthy choices — but their labels tell a different story:
        </p>
        <div className="seo-unhealthy-list">
          {commonUnhealthyFoods.map((food) => (
            <div key={food.name} className="seo-unhealthy-item">
              <div className="seo-unhealthy-name"><X size={16} style={{ color: 'var(--grade-e)' }} /> {food.name}</div>
              <div className="seo-unhealthy-reason">{food.reason}</div>
            </div>
          ))}
        </div>
        <p className="seo-tip">
          💡 <strong>Tip:</strong> Always scan the barcode before buying. Marketing and reality often differ significantly.
        </p>
      </section>

      {/* How NutriScan grades */}
      <section className="seo-section">
        <h2 className="seo-section-title">
          <Gauge className="icon-inline" style={{ color: 'var(--accent-1)' }} />
          How NutriScan AI Evaluates Food Health
        </h2>
        <div className="seo-steps">
          <div className="seo-step-card">
            <div className="seo-step-number">1</div>
            <div className="seo-step-icon"><CheckCircle2 /></div>
            <h3>Nutrient scoring</h3>
            <p>Points are added for protein and fiber. Points are deducted for sugar, sodium, saturated fat, and energy density.</p>
          </div>
          <div className="seo-step-card">
            <div className="seo-step-number">2</div>
            <div className="seo-step-icon"><Leaf /></div>
            <h3>Processing level</h3>
            <p>NOVA Group 4 (ultra-processed) foods receive a penalty regardless of their nutrient profile, because processing itself is a health risk factor.</p>
          </div>
          <div className="seo-step-card">
            <div className="seo-step-number">3</div>
            <div className="seo-step-icon"><Heart /></div>
            <h3>Final grade</h3>
            <p>The combined score maps to a letter grade from A (excellent) to E (very poor). Grade A and B foods are generally safe daily choices.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="seo-cta-section">
        <h2>Stop guessing. Start scanning.</h2>
        <p>Check any packaged food in seconds — free, in your browser, no sign-up needed.</p>
        <Link to="/" className="btn-primary-cta">
          Scan a Food Product <ArrowRight className="icon-inline" style={{ marginLeft: 6, marginRight: 0 }} />
        </Link>
        <div className="seo-related-links">
          <span>Related:</span>
          <Link to="/food-barcode-scanner">Food Barcode Scanner</Link>
          <Link to="/food-label-analyzer">Food Label Analyzer</Link>
          <Link to="/is-this-food-healthy">Is This Food Healthy?</Link>
        </div>
      </section>
    </div>
  );
}
