const fs = require('fs');
const path = require('path');

const cssFile = path.join(__dirname, 'frontend/style.css');
let css = fs.readFileSync(cssFile, 'utf8');

// 1. We need to add bottom navigation media queries to the end of the file.
const mobileNavCss = `
/* =========================================
   MOBILE RESPONSIVENESS & BOTTOM NAV
   ========================================= */
@media (max-width: 768px) {
    .header-inner {
        justify-content: center; /* Center logo on mobile */
        padding: 16px;
    }
    
    .nav-pills {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: none;
        border-top: 1px solid var(--border-subtle);
        border-radius: 0;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        z-index: 1000;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
        gap: 0;
    }

    .pill {
        flex: 1;
        padding: 10px 4px;
        font-size: 13px;
        text-align: center;
        border-radius: 8px;
    }
    
    /* Move main content up slightly to account for bottom nav */
    .main {
        padding: 0 16px 100px; /* 100px bottom padding for the fixed nav */
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .macros {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .history-stat-cards {
        grid-template-columns: 1fr;
    }
}
`;

if (!css.includes('MOBILE RESPONSIVENESS')) {
    css += '\n' + mobileNavCss;
}

// 2. Adjust Lucide icon generic styling (size, alignment)
const iconCss = `
/* ---------- Lucide SVG Icon Adjustments ---------- */
i[data-lucide] {
    width: 20px;
    height: 20px;
    vertical-align: middle;
    stroke-width: 2px;
}

.icon-inline {
    width: 18px;
    height: 18px;
    margin-right: 6px;
    color: currentColor;
}

.logo-icon-svg {
    width: 28px;
    height: 28px;
    color: var(--accent-1);
    animation: logoPulse 3s ease-in-out infinite;
}

.nut-icon {
    width: 24px;
    height: 24px;
    margin: 0 auto 8px;
    opacity: 0.8;
}
`;

if (!css.includes('Lucide SVG Icon Adjustments')) {
    css = css.replace('/* ---------- Header ---------- */', iconCss + '\n\n/* ---------- Header ---------- */');
}

fs.writeFileSync(cssFile, css);
console.log('CSS updated for mobile responsiveness and icons.');
