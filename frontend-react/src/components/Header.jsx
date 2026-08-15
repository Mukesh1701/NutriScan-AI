import { Scan } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { id: 'barcode', label: 'Barcode' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'classify', label: 'Classify' },
  { id: 'about', label: 'About' },
];

export default function Header() {
  const { activePage, setActivePage } = useApp();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <Scan className="logo-icon-svg" />
          <span className="logo-text">
            NutriScan<span className="logo-accent">AI</span>
          </span>
        </div>
        <nav className="nav-pills">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`pill ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
