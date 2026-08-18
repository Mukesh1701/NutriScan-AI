import { Link } from 'react-router-dom';
import { FileText, Star, AlertTriangle, CheckCircle2, ArrowRight, FlaskConical, BarChart2 } from 'lucide-react';
import { useSEO } from '../lib/useSEO';

const gradeInfo = [
  { grade: 'A', color: '#16a34a', label: 'Excellent', desc: 'Low in fat, sugar, and sodium. Rich in fiber, protein, and micronutrients.' },
  { grade: 'B', color: '#65a30d', label: 'Good', desc: 'Mostly healthy — minor concerns in one or two nutrient areas.' },
  { grade: 'C', color: '#d97706', label: 'Average', desc: 'Moderate nutritional value. Fine in small quantities.' },
  { grade: 'D', color: '#ea580c', label: 'Poor', desc: 'High in sugar, fat, or sodium. Best consumed rarely.' },
  { grade: 'E', color: '#dc2626', label: 'Very Poor', desc: 'Highly processed or nutritionally deficient. Avoid or limit significantly.' },
];

const novaGroups = [
  { group: 1, label: 'Unprocessed', desc: 'Whole foods — fruits, vegetables, meat, eggs, milk.' },
  { group: 2, label: 'Processed Culinary Ingredients', desc: 'Oils, butter, sugar, salt — used in cooking.' },
  { group: 3, label: 'Processed Foods', desc: 'Canned beans, smoked meats, cheese — minimally altered.' },
  { group: 4, label: 'Ultra-Processed', desc: 'Soft drinks, chips, instant noodles — industrial formulations.' },
];

const whatWeAnalyze = [
  'Calories & energy density',
  'Protein, carbohydrates, and fat',
  'Sugar and added sugars',
  'Sodium and salt content',
  'Saturated and trans fats',
  'Fiber content',
  'Full ingredient list',
  'Additive and preservative alerts',
  'Processing level (NOVA Group)',
  'Overall health grade (A–E)',
];

export default function FoodLabelAnalyzerPage() {
  useSEO(
    'Free AI Food Label Analyzer – Decode Nutrition Facts | NutriScan AI',
    'Analyze food nutrition labels with NutriScan AI. Understand health grades, NOVA processing levels, additive alerts, and complete nutritional values instantly.',
    'https://www.nutriscan-ai.in/food-label-analyzer'
  );

  return (
    <div className="seo-page">
      {/* Hero */}
      <section className="seo-hero">
        <div className="seo-hero-badge">
          <FileText className="icon-inline" /> AI Label Analysis
        </div>
        <h1 className="seo-hero-title">
          Free AI <span className="gradient-text">Food Label Analyzer</span>
        </h1>
        <p className="seo-hero-subtitle">
          Stop guessing what's really in your food. NutriScan AI decodes nutrition fact panels 
          and ingredient lists from thousands of packaged products — giving you a clear health grade and actionable insights in seconds.
        </p>
        <div className="seo-hero-actions">
          <Link to="/" className="btn-primary-cta">
            Analyze a Product <ArrowRight className="icon-inline" style={{ marginLeft: 6, marginRight: 0 }} />
          </Link>
          <a href="#health-grades" className="btn-secondary-cta">See how grading works</a>
        </div>
      </section>

      {/* What we analyze */}
      <section className="seo-section">
        <h2 className="seo-section-title">What NutriScan AI Analyzes</h2>
        <p className="seo-section-subtitle">
          When you scan a product, our AI cross-references the Open Food Facts database and evaluates over 10 nutritional dimensions:
        </p>
        <div className="seo-info-list seo-two-col">
          {whatWeAnalyze.map((item) => (
            <div key={item} className="seo-info-item">
              <CheckCircle2 className="icon-inline seo-check" />
              <div>{item}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Health Grades */}
      <section className="seo-section seo-section-alt" id="health-grades">
        <h2 className="seo-section-title">Health Grades Explained (A–E)</h2>
        <p className="seo-section-subtitle">
          NutriScan AI assigns every product a letter grade from A to E based on the Nutri-Score system, 
          which weighs positive nutrients (fiber, protein) against negative ones (sugar, sodium, saturated fat).
        </p>
        <div className="seo-grades-grid">
          {gradeInfo.map((g) => (
            <div key={g.grade} className="seo-grade-card" style={{ '--grade-accent': g.color }}>
              <div className="seo-grade-badge" style={{ background: g.color }}>{g.grade}</div>
              <div>
                <strong>{g.label}</strong>
                <p>{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NOVA groups */}
      <section className="seo-section">
        <h2 className="seo-section-title">
          <FlaskConical className="icon-inline" style={{ color: 'var(--accent-1)' }} />
          NOVA Processing Groups
        </h2>
        <p className="seo-section-subtitle">
          Beyond nutrition, NutriScan AI tells you <em>how processed</em> a food is using the NOVA classification system — 
          because ultra-processed foods are linked to poor health outcomes even when their nutrient numbers look acceptable.
        </p>
        <div className="seo-nova-grid">
          {novaGroups.map((n) => (
            <div key={n.group} className="seo-nova-card">
              <div className="seo-nova-number">Group {n.group}</div>
              <strong>{n.label}</strong>
              <p>{n.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ingredient alerts */}
      <section className="seo-section seo-section-alt">
        <h2 className="seo-section-title">
          <AlertTriangle className="icon-inline" style={{ color: '#f59e0b' }} />
          Ingredient Alerts
        </h2>
        <p className="seo-section-subtitle">
          NutriScan AI scans ingredient lists for over 50 known problematic additives, 
          excessive sweeteners, and health-concern indicators — then highlights them clearly.
        </p>
        <div className="seo-alert-examples">
          <div className="seo-alert-chip seo-alert-red"><AlertTriangle size={14} /> High sugar content</div>
          <div className="seo-alert-chip seo-alert-red"><AlertTriangle size={14} /> High saturated fat</div>
          <div className="seo-alert-chip seo-alert-orange"><AlertTriangle size={14} /> Contains artificial sweeteners</div>
          <div className="seo-alert-chip seo-alert-orange"><AlertTriangle size={14} /> Contains palm oil</div>
          <div className="seo-alert-chip seo-alert-yellow"><AlertTriangle size={14} /> High sodium</div>
          <div className="seo-alert-chip seo-alert-yellow"><AlertTriangle size={14} /> Ultra-processed (NOVA 4)</div>
        </div>
      </section>

      {/* CTA */}
      <section className="seo-cta-section">
        <h2>Analyze your next food product</h2>
        <p>Scan a barcode or enter a product name. It's free, instant, and no sign-up required.</p>
        <Link to="/" className="btn-primary-cta">
          Start Analyzing <ArrowRight className="icon-inline" style={{ marginLeft: 6, marginRight: 0 }} />
        </Link>
        <div className="seo-related-links">
          <span>Related:</span>
          <Link to="/food-barcode-scanner">Food Barcode Scanner</Link>
          <Link to="/healthy-food-scanner">Healthy Food Scanner</Link>
          <Link to="/what-are-food-additives">What Are Food Additives?</Link>
        </div>
      </section>
    </div>
  );
}
