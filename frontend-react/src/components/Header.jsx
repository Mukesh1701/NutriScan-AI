import { Scan } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Barcode' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/classify', label: 'Classify' },
  { to: '/about', label: 'About' },
];

export default function Header() {
  const location = useLocation();

  // Active state: exact match for '/', prefix match for others
  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <Scan className="logo-icon-svg" />
          <span className="logo-text">
            NutriScan<span className="logo-accent">AI</span>
          </span>
        </Link>
        <nav className="nav-pills" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`pill ${isActive(item.to) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
