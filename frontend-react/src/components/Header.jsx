import { BarChart3, Camera, Info, ScanBarcode } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Scan', icon: ScanBarcode },
  { to: '/calculator', label: 'Calculator', icon: BarChart3 },
  { to: '/classify', label: 'Classify', icon: Camera },
  { to: '/about', label: 'About', icon: Info },
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
          <ScanBarcode className="logo-icon-svg" />
          <span className="logo-text">
            NutriScan<span className="logo-accent">AI</span>
          </span>
        </Link>
        <nav className="nav-pills" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`pill ${isActive(item.to) ? 'active' : ''}`}
              >
                <Icon size={15} strokeWidth={2.4} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
