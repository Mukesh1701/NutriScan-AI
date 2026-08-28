import { Heart, ScanBarcode, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const appLinks = [
  { to: '/', label: 'Barcode Scanner' },
  { to: '/classify', label: 'AI Food Classifier' },
  { to: '/calculator', label: 'Nutrition Calculator' },
  { to: '/about', label: 'About' },
];

const guideLinks = [
  { to: '/how-to-read-food-label', label: 'How to Read Food Labels' },
  { to: '/is-this-food-healthy', label: 'Is This Food Healthy?' },
  { to: '/how-much-sugar-is-too-much', label: 'How Much Sugar Is Too Much?' },
  { to: '/what-are-food-additives', label: 'What Are Food Additives?' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="logo footer-logo">
            <ScanBarcode className="logo-icon-svg" />
            <span className="logo-text">
              NutriScan<span className="logo-accent">AI</span>
            </span>
          </Link>
          <p className="footer-tagline">
            Scan it. Grade it. Eat smarter. — Free AI-powered food analysis for everyone.
          </p>
          <a
            className="footer-github"
            href="https://github.com/Mukesh1701/NutriScan-AI"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Star size={16} /> Star on GitHub
          </a>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          {appLinks.map((l) => (
            <Link key={l.to} to={l.to}>{l.label}</Link>
          ))}
        </div>

        <div className="footer-col">
          <h4>Guides</h4>
          {guideLinks.map((l) => (
            <Link key={l.to} to={l.to}>{l.label}</Link>
          ))}
        </div>

        <div className="footer-col">
          <h4>Data Source</h4>
          <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener noreferrer">Open Food Facts</a>
          <p className="footer-note">Product data & nutrition info come from the open Open Food Facts database.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} NutriScan AI</span>
        <span className="footer-made">
          Made with <Heart size={12} className="footer-heart" /> by Mukesh · NIT Calicut
        </span>
      </div>
    </footer>
  );
}
