import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useSEO } from '../../lib/useSEO';

const sugarNames = [
  'High-fructose corn syrup', 'Glucose-fructose syrup', 'Corn syrup', 'Cane sugar',
  'Cane juice', 'Evaporated cane juice', 'Fruit juice concentrate', 'Agave nectar',
  'Rice syrup', 'Barley malt', 'Maltose', 'Dextrose', 'Fructose', 'Sucrose',
  'Invert sugar', 'Treacle', 'Molasses', 'Coconut sugar', 'Maple syrup',
];

const sugarBenchmarks = [
  { food: 'Can of cola (330ml)', sugar: '35g (≈9 teaspoons)' },
  { food: 'Flavored yogurt (150g)', sugar: '15–22g (≈4–5 teaspoons)' },
  { food: 'Breakfast cereal (30g)', sugar: '8–14g (≈2–3 teaspoons)' },
  { food: 'Fruit juice (200ml)', sugar: '20–24g (≈5–6 teaspoons)' },
  { food: 'Chocolate bar (50g)', sugar: '25–30g (≈6–7 teaspoons)' },
  { food: 'Energy drink (250ml)', sugar: '27g (≈7 teaspoons)' },
];

export default function HowMuchSugarPage() {
  useSEO(
    'How Much Sugar Is Too Much? Daily Limits & Hidden Sugars | NutriScan AI',
    'Find out how much sugar is too much per day. Learn WHO recommendations, hidden sugar names on labels, and how to spot added sugar in packaged foods.',
    'https://www.nutriscan-ai.in/how-much-sugar-is-too-much'
  );

  return (
    <div className="seo-page article-page">
      <div className="article-container">
        <div className="article-header">
          <div className="seo-hero-badge">
            <BookOpen className="icon-inline" /> Article
          </div>
          <h1 className="article-title">
            How Much <span className="gradient-text">Sugar Is Too Much?</span>
          </h1>
          <p className="article-subtitle">
            Sugar is hidden in hundreds of everyday foods — often under unfamiliar names. 
            Here's what science says about safe sugar limits, where sugar hides, and how to spot it.
          </p>
          <div className="article-meta">
            <span>7 min read</span>
            <span>•</span>
            <span>NutriScan AI</span>
          </div>
        </div>

        <div className="article-body">
          <h2>The Official Recommendations</h2>
          <p>
            The <strong>World Health Organization (WHO)</strong> recommends that added sugars make up 
            <strong> less than 10% of total daily energy intake</strong> — and ideally less than 5% for additional health benefits.
          </p>
          <p>
            For an average adult consuming 2,000 calories per day, that means:
          </p>
          <ul>
            <li><strong>Maximum limit:</strong> 50g of added sugar per day (about 12 teaspoons)</li>
            <li><strong>Ideal target:</strong> under 25g per day (about 6 teaspoons)</li>
          </ul>
          <p>
            For children, the limits are lower — ideally under 12–15g of added sugar per day, 
            and the American Heart Association recommends children under 2 have no added sugar at all.
          </p>

          <div className="article-callout">
            <strong>Important distinction:</strong> These limits apply to <em>added sugars</em> — sugars added during processing. 
            The naturally occurring sugars in whole fruit are not included because they come packaged with fiber, 
            water, and micronutrients that slow absorption.
          </div>

          <h2>How Much Sugar Are We Actually Eating?</h2>
          <p>
            Studies consistently show that most people consume 2–3 times the recommended amount of added sugar. 
            In India, urban adults average 40–80g of added sugar per day from packaged foods alone. 
            The biggest contributors are:
          </p>
          <ul>
            <li>Sugary beverages (cola, energy drinks, packaged juice, chai with extra sugar)</li>
            <li>Breakfast cereals and oat bars</li>
            <li>Flavored dairy products (yogurt, flavored milk)</li>
            <li>Biscuits, cookies, and cakes</li>
            <li>Sauces, ketchup, and condiments</li>
          </ul>

          <h2>Sugar Benchmarks — Real-World Examples</h2>
          <p>To put the numbers in context, here's how much sugar common foods contain:</p>
          <div className="article-table-wrap">
            <table className="article-table">
              <thead>
                <tr><th>Food</th><th>Approximate Sugar</th></tr>
              </thead>
              <tbody>
                {sugarBenchmarks.map((row) => (
                  <tr key={row.food}><td>{row.food}</td><td>{row.sugar}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>A single can of cola and a flavored yogurt together put you at or over the daily added sugar limit.</p>

          <h2>What Does Too Much Sugar Do to Your Body?</h2>
          <p>Consistently exceeding recommended sugar intake is linked to:</p>
          <ul>
            <li><strong>Weight gain and obesity</strong> — excess sugar is converted to fat</li>
            <li><strong>Insulin resistance and type 2 diabetes</strong> — repeated blood sugar spikes damage insulin signaling</li>
            <li><strong>Cardiovascular disease</strong> — high sugar intake raises triglycerides and LDL cholesterol</li>
            <li><strong>Dental decay</strong> — sugar feeds oral bacteria that produce enamel-eroding acid</li>
            <li><strong>Non-alcoholic fatty liver disease</strong> — fructose specifically is processed in the liver</li>
            <li><strong>Energy crashes</strong> — the blood sugar spike-and-crash cycle causes afternoon fatigue</li>
          </ul>

          <h2>The 60+ Names for Sugar on Food Labels</h2>
          <p>
            One of the most deceptive tactics in food labeling is splitting sugar into multiple ingredients 
            under different names — so none of them appear near the top of the ingredient list individually. 
            Here are common names for added sugar to watch for:
          </p>
          <div className="article-sugar-grid">
            {sugarNames.map((name) => (
              <div key={name} className="article-sugar-chip">{name}</div>
            ))}
          </div>
          <p>
            If you see 2–3 of these in the ingredient list, the food is likely much higher in sugar than it appears.
          </p>

          <h2>How to Check Sugar in Any Packaged Food</h2>
          <p>
            On the nutrition facts panel, look for:
          </p>
          <ul>
            <li><strong>Total Sugars</strong> — all sugars including naturally occurring ones</li>
            <li><strong>Added Sugars</strong> — explicitly added during production (not always listed separately in India)</li>
          </ul>
          <p>
            A quick rule: <strong>under 5g per 100g</strong> is low, <strong>5–15g</strong> is medium, 
            <strong>over 15g</strong> is high. For beverages, multiply by serving size in 100ml equivalents.
          </p>

          <h2>Use NutriScan AI to Track Sugar Instantly</h2>
          <p>
            Instead of calculating manually, scan any food barcode with NutriScan AI. 
            We highlight sugar content, flag high-sugar products, and show you at a glance 
            whether a product crosses safe thresholds.
          </p>

          <div className="article-cta">
            <h3>Check the sugar in your food right now</h3>
            <p>Scan a barcode and see instant sugar data, health grade, and ingredient alerts.</p>
            <Link to="/" className="btn-primary-cta">
              Open NutriScan AI <ArrowRight className="icon-inline" style={{ marginLeft: 6, marginRight: 0 }} />
            </Link>
          </div>

          <div className="article-related">
            <h3>Related Articles</h3>
            <div className="article-related-links">
              <Link to="/how-to-read-food-label">How to Read a Food Nutrition Label</Link>
              <Link to="/is-this-food-healthy">Is This Food Healthy?</Link>
              <Link to="/what-are-food-additives">What Are Food Additives?</Link>
              <Link to="/how-to-check-food-ingredients">How to Check Food Ingredients</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
