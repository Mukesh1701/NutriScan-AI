import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';
import { useSEO } from '../../lib/useSEO';

const additiveCategories = [
  {
    category: 'Preservatives',
    color: '#ea580c',
    examples: [
      { code: 'E200', name: 'Sorbic acid', note: 'Widely used. Generally safe.' },
      { code: 'E202', name: 'Potassium sorbate', note: 'Common in cheese and baked goods.' },
      { code: 'E210', name: 'Benzoic acid', note: 'Can form benzene (carcinogen) with vitamin C.' },
      { code: 'E211', name: 'Sodium benzoate', note: 'Linked to hyperactivity in children.' },
      { code: 'E250', name: 'Sodium nitrite', note: 'In cured meats — watch for excess consumption.' },
    ],
  },
  {
    category: 'Artificial Colors',
    color: '#7c3aed',
    examples: [
      { code: 'E102', name: 'Tartrazine', note: 'Yellow dye. Linked to hyperactivity in children.' },
      { code: 'E110', name: 'Sunset Yellow', note: 'Orange dye. Part of the Southampton six.' },
      { code: 'E122', name: 'Carmoisine', note: 'Red dye. Southampton six list.' },
      { code: 'E124', name: 'Ponceau 4R', note: 'Red dye. Banned in USA and Norway.' },
      { code: 'E129', name: 'Allura Red', note: 'Common in candy, sodas, snacks.' },
    ],
  },
  {
    category: 'Artificial Sweeteners',
    color: '#0891b2',
    examples: [
      { code: 'E950', name: 'Acesulfame-K', note: '200x sweeter than sugar. Long-term research ongoing.' },
      { code: 'E951', name: 'Aspartame', note: 'Avoid if phenylketonuria (PKU). WHO advises limiting intake.' },
      { code: 'E952', name: 'Cyclamate', note: 'Banned in USA. Allowed in EU and India.' },
      { code: 'E954', name: 'Saccharin', note: 'Oldest artificial sweetener. Linked to bladder cancer in rats — disputed in humans.' },
      { code: 'E955', name: 'Sucralose', note: 'May alter gut microbiome at high doses.' },
    ],
  },
  {
    category: 'Emulsifiers & Stabilizers',
    color: '#059669',
    examples: [
      { code: 'E322', name: 'Lecithin', note: 'Usually from soy or sunflower. Generally safe.' },
      { code: 'E433', name: 'Polysorbate 80', note: 'Linked to gut inflammation in animal studies.' },
      { code: 'E471', name: 'Mono- and diglycerides', note: 'Common in baked goods and margarine.' },
      { code: 'E407', name: 'Carrageenan', note: 'From seaweed. Controversial — some studies link to gut issues.' },
      { code: 'E412', name: 'Guar gum', note: 'Generally safe; used as thickener.' },
    ],
  },
];

export default function FoodAdditivesPage() {
  useSEO(
    'What Are Food Additives? E-Numbers, Safety & What to Avoid | NutriScan AI',
    'Learn what food additives are, how E-numbers work, which additives to avoid, and how to spot them in ingredient lists. With NutriScan AI.',
    'https://www.nutriscan-ai.in/what-are-food-additives'
  );

  return (
    <div className="seo-page article-page">
      <div className="article-container">
        <div className="article-header">
          <div className="seo-hero-badge">
            <BookOpen className="icon-inline" /> Article
          </div>
          <h1 className="article-title">
            What Are <span className="gradient-text">Food Additives?</span>
          </h1>
          <p className="article-subtitle">
            E-numbers, preservatives, emulsifiers, colorants — food additives are in almost every packaged product. 
            Here's what they are, how to identify them, and which ones to limit or avoid.
          </p>
          <div className="article-meta">
            <span>9 min read</span>
            <span>•</span>
            <span>NutriScan AI</span>
          </div>
        </div>

        <div className="article-body">
          <h2>What Are Food Additives?</h2>
          <p>
            Food additives are substances added to food during manufacturing to improve taste, texture, appearance, 
            shelf life, or safety. They include natural ingredients (like vitamin C as a preservative) and 
            synthetic chemicals (like artificial colorants).
          </p>
          <p>
            In the European Union and many other countries, approved additives are assigned an <strong>E-number</strong> — 
            a code like E102 (Tartrazine) or E211 (Sodium benzoate). These codes make it possible to identify additives 
            in ingredient lists, even when they're listed by name.
          </p>

          <h2>Are Food Additives Safe?</h2>
          <p>
            Most food additives approved for use have undergone regulatory review and are generally considered safe 
            at typical consumption levels. However:
          </p>
          <ul>
            <li>Some additives have more research behind them than others</li>
            <li>Long-term effects of consuming many additives simultaneously are poorly studied</li>
            <li>Children may be more sensitive to certain additives (especially artificial colors)</li>
            <li>Individuals with allergies or specific conditions may react to additives others tolerate fine</li>
          </ul>
          <p>
            The key principle is <strong>minimization</strong> — you don't need to fear every additive, 
            but choosing foods with shorter, simpler ingredient lists is generally a sound health strategy.
          </p>

          <h2>Categories of Food Additives</h2>
          <p>Additives are grouped by their function:</p>
          <ul>
            <li><strong>Preservatives (E200–E299):</strong> Extend shelf life by preventing microbial growth</li>
            <li><strong>Colorants (E100–E199):</strong> Add or restore color</li>
            <li><strong>Sweeteners (E900–E999):</strong> Replace or supplement sugar</li>
            <li><strong>Emulsifiers & stabilizers (E400–E499):</strong> Improve texture and prevent separation</li>
            <li><strong>Antioxidants (E300–E399):</strong> Prevent rancidity and oxidation</li>
            <li><strong>Flavor enhancers (E600–E699):</strong> Intensify taste (e.g., MSG = E621)</li>
          </ul>

          {additiveCategories.map((cat) => (
            <div key={cat.category} className="additive-category">
              <h2 style={{ color: cat.color }}>
                <AlertTriangle className="icon-inline" style={{ color: cat.color }} />
                {cat.category}
              </h2>
              <div className="additive-table-wrap">
                <table className="article-table">
                  <thead>
                    <tr><th>E-Number</th><th>Name</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {cat.examples.map((a) => (
                      <tr key={a.code}>
                        <td><strong>{a.code}</strong></td>
                        <td>{a.name}</td>
                        <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{a.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <h2>The Southampton Six</h2>
          <p>
            A 2007 UK study (the Southampton study) found that six specific artificial food colors significantly 
            increased hyperactivity in children. The UK Food Standards Agency recommended manufacturers remove them, 
            and the EU now requires warning labels on products containing:
          </p>
          <ul>
            <li>E102 Tartrazine</li>
            <li>E104 Quinoline Yellow</li>
            <li>E110 Sunset Yellow FCF</li>
            <li>E122 Carmoisine</li>
            <li>E124 Ponceau 4R</li>
            <li>E129 Allura Red AC</li>
          </ul>
          <p>
            In India, these colors are widely used. NutriScan AI flags products containing these specific additives.
          </p>

          <h2>How to Spot Additives in Ingredient Lists</h2>
          <p>
            Additives may appear in ingredient lists by:
          </p>
          <ul>
            <li>Their E-number (e.g., "contains E211")</li>
            <li>Their chemical name (e.g., "sodium benzoate")</li>
            <li>Their functional name + code (e.g., "preservative (E211)")</li>
            <li>Their functional name alone (e.g., "artificial color")</li>
          </ul>
          <p>
            This inconsistency makes it hard to track additives manually. NutriScan AI normalizes ingredient data 
            from the Open Food Facts database and automatically flags known problematic additives.
          </p>

          <div className="article-callout">
            <strong>Quick rule of thumb:</strong> If the ingredient list has more than 5–6 additives (E-numbers or 
            chemical names), the product is heavily processed. Prefer products where you recognize all ingredients 
            as real food items.
          </div>

          <div className="article-cta">
            <h3>Check additives in any product instantly</h3>
            <p>Scan a barcode and NutriScan AI will flag all known problematic additives.</p>
            <Link to="/" className="btn-primary-cta">
              Open NutriScan AI <ArrowRight className="icon-inline" style={{ marginLeft: 6, marginRight: 0 }} />
            </Link>
          </div>

          <div className="article-related">
            <h3>Related Articles</h3>
            <div className="article-related-links">
              <Link to="/how-to-read-food-label">How to Read a Food Nutrition Label</Link>
              <Link to="/how-to-check-food-ingredients">How to Check Food Ingredients</Link>
              <Link to="/is-this-food-healthy">Is This Food Healthy?</Link>
              <Link to="/how-much-sugar-is-too-much">How Much Sugar Is Too Much?</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
