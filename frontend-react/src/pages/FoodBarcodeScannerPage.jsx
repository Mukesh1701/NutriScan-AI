import { Link } from 'react-router-dom';
import { QrCode, Camera, Image, CheckCircle2, Zap, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import { useSEO } from '../lib/useSEO';

const howItWorks = [
  {
    icon: <Camera />,
    step: '1',
    title: 'Open your camera',
    desc: 'Tap "Start Camera" on the barcode scanner. NutriScan AI uses your device camera to detect barcodes in real time.',
  },
  {
    icon: <QrCode />,
    step: '2',
    title: 'Point at the barcode',
    desc: 'Hold the product up and align the barcode within the camera frame. The AI detects EAN-13, UPC-A, EAN-8, UPC-E, and QR codes instantly.',
  },
  {
    icon: <CheckCircle2 />,
    step: '3',
    title: 'Get instant nutrition data',
    desc: 'NutriScan AI looks up the product from the Open Food Facts database and shows you its health grade, NOVA score, calories, protein, sugar, fat, and more.',
  },
];

const benefits = [
  { icon: <Zap />, title: 'Instant results', desc: 'Nutrition data in under a second — no manual searching.' },
  { icon: <ShieldCheck />, title: 'Health grading (A–E)', desc: 'See at a glance whether a product is healthy or not.' },
  { icon: <BookOpen />, title: 'Ingredient alerts', desc: 'Flags additives, excessive sugar, sodium, and saturated fat.' },
  { icon: <Image />, title: 'Image upload too', desc: 'No camera? Upload a photo of the barcode instead.' },
];

const supportedFormats = ['EAN-13', 'EAN-8', 'UPC-A', 'UPC-E', 'CODE-128', 'QR Code'];

export default function FoodBarcodeScannerPage() {
  useSEO(
    'Free Food Barcode Scanner – Scan & Analyze Products | NutriScan AI',
    'Scan food barcodes with NutriScan AI and instantly understand nutrition, ingredients, calories, sugar, protein, and health grade. Free, no sign-up required.',
    'https://www.nutriscan-ai.in/food-barcode-scanner'
  );

  return (
    <div className="seo-page">
      {/* Hero */}
      <section className="seo-hero">
        <div className="seo-hero-badge">
          <QrCode className="icon-inline" /> Free Barcode Scanner
        </div>
        <h1 className="seo-hero-title">
          Free AI <span className="gradient-text">Food Barcode Scanner</span>
        </h1>
        <p className="seo-hero-subtitle">
          Scan any food product barcode with NutriScan AI to instantly understand its nutrition, ingredients, 
          calories, sugar, protein, and overall health grade — all for free, right in your browser.
        </p>
        <div className="seo-hero-actions">
          <Link to="/" className="btn-primary-cta">
            Open Scanner <ArrowRight className="icon-inline" style={{ marginLeft: 6, marginRight: 0 }} />
          </Link>
          <a href="#how-it-works" className="btn-secondary-cta">How it works</a>
        </div>
      </section>

      {/* How it works */}
      <section className="seo-section" id="how-it-works">
        <h2 className="seo-section-title">How the Barcode Scanner Works</h2>
        <p className="seo-section-subtitle">
          NutriScan AI's barcode scanner uses your phone or laptop camera to decode food product barcodes 
          and pull live nutrition data from the world's largest open food database.
        </p>
        <div className="seo-steps">
          {howItWorks.map((item) => (
            <div key={item.step} className="seo-step-card">
              <div className="seo-step-number">{item.step}</div>
              <div className="seo-step-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported formats */}
      <section className="seo-section seo-section-alt">
        <h2 className="seo-section-title">Supported Barcode Formats</h2>
        <p className="seo-section-subtitle">
          NutriScan AI's scanner supports the most common food product barcode types found on supermarket shelves worldwide.
        </p>
        <div className="seo-format-grid">
          {supportedFormats.map((fmt) => (
            <div key={fmt} className="seo-format-chip">
              <CheckCircle2 className="icon-inline" style={{ color: 'var(--grade-a)' }} />
              {fmt}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="seo-section">
        <h2 className="seo-section-title">Why Use NutriScan AI's Barcode Scanner?</h2>
        <div className="seo-benefits-grid">
          {benefits.map((b) => (
            <div key={b.title} className="seo-benefit-card">
              <div className="seo-benefit-icon">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you'll see */}
      <section className="seo-section seo-section-alt">
        <h2 className="seo-section-title">What Information Will You See?</h2>
        <p className="seo-section-subtitle">
          After scanning a barcode, NutriScan AI displays a complete nutritional breakdown:
        </p>
        <div className="seo-info-list">
          <div className="seo-info-item"><CheckCircle2 className="icon-inline seo-check" /><div><strong>Health Grade (A–E)</strong> — an overall quality score based on Nutri-Score methodology</div></div>
          <div className="seo-info-item"><CheckCircle2 className="icon-inline seo-check" /><div><strong>NOVA Group (1–4)</strong> — how processed the food is, from unprocessed to ultra-processed</div></div>
          <div className="seo-info-item"><CheckCircle2 className="icon-inline seo-check" /><div><strong>Calories</strong> — total energy per 100g and per serving</div></div>
          <div className="seo-info-item"><CheckCircle2 className="icon-inline seo-check" /><div><strong>Macronutrients</strong> — protein, carbohydrates, sugar, fat, and saturated fat</div></div>
          <div className="seo-info-item"><CheckCircle2 className="icon-inline seo-check" /><div><strong>Sodium & Fiber</strong> — often overlooked but critical for health</div></div>
          <div className="seo-info-item"><CheckCircle2 className="icon-inline seo-check" /><div><strong>Ingredient List</strong> — full ingredients with alerts for additives and problematic components</div></div>
        </div>
      </section>

      {/* CTA */}
      <section className="seo-cta-section">
        <h2>Ready to scan your first product?</h2>
        <p>It's free. No account. No download. Works in your browser on any device.</p>
        <Link to="/" className="btn-primary-cta">
          Launch Barcode Scanner <ArrowRight className="icon-inline" style={{ marginLeft: 6, marginRight: 0 }} />
        </Link>
        <div className="seo-related-links">
          <span>Related:</span>
          <Link to="/food-label-analyzer">Food Label Analyzer</Link>
          <Link to="/healthy-food-scanner">Healthy Food Scanner</Link>
          <Link to="/how-to-read-food-label">How to Read a Food Label</Link>
        </div>
      </section>
    </div>
  );
}
