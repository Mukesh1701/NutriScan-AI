import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { useSEO } from '../../lib/useSEO';

const ingredientRedFlags = [
  { flag: 'Sugar in first 3 ingredients', why: 'Ingredients are listed by weight. Sugar near the top means it\'s a major component.' },
  { flag: 'Multiple sugar aliases (2–3+)', why: 'Splitting sugar across names like "glucose syrup," "fructose," and "cane juice" hides the true total.' },
  { flag: 'Partially hydrogenated oil', why: 'This means trans fat, even if the label says "0g trans fat" (less than 0.5g counts as zero).' },
  { flag: 'More than 5–6 E-number additives', why: 'Indicates heavy processing; the food probably wouldn\'t exist in nature.' },
  { flag: 'Artificial flavors or "natural flavors"', why: '"Natural flavors" is a broad legal term that can include hundreds of chemical compounds.' },
  { flag: 'Palm oil', why: 'Linked to deforestation; also high in saturated fat.' },
  { flag: '"Enriched" or "refined" flour', why: 'Means the grain has been stripped of fiber and nutrients, then partially re-added synthetically.' },
];

const howToReadIngredients = [
  {
    step: '1',
    title: 'Find the ingredient list',
    desc: 'Usually in small print on the back or side of the package, under the nutrition facts panel.',
  },
  {
    step: '2',
    title: 'Check the order',
    desc: 'Ingredients are listed by weight, descending. The first ingredient is the largest by mass. If water is first in a "fruit juice," it\'s mostly water.',
  },
  {
    step: '3',
    title: 'Count the ingredients',
    desc: 'Fewer is usually better. A product with 5 recognizable ingredients is almost always healthier than one with 25 chemical names.',
  },
  {
    step: '4',
    title: 'Ask: can I recognize this?',
    desc: 'Read each ingredient. If you can\'t picture it as a real food or basic cooking ingredient (salt, sugar, oil), it\'s a processed additive.',
  },
  {
    step: '5',
    title: 'Look for red flags',
    desc: 'Sugar near the top, multiple sugar names, hydrogenated oils, artificial colors (listed by E-number or name).',
  },
];

export default function CheckIngredientsPage() {
  useSEO(
    'How to Check Food Ingredients – What to Look For & Avoid | NutriScan AI',
    'Learn how to read and check food ingredient lists. Understand ingredient order, spot hidden sugars, additives, and red flags in packaged food.',
    'https://www.nutriscan-ai.in/how-to-check-food-ingredients'
  );

  return (
    <div className="seo-page article-page">
      <div className="article-container">
        <div className="article-header">
          <div className="seo-hero-badge">
            <BookOpen className="icon-inline" /> Article
          </div>
          <h1 className="article-title">
            How to Check <span className="gradient-text">Food Ingredients</span>
          </h1>
          <p className="article-subtitle">
            The ingredient list is the most honest part of a food label — if you know how to read it. 
            Here's a practical guide to understanding what's in your food and identifying red flags.
          </p>
          <div className="article-meta">
            <span>6 min read</span>
            <span>•</span>
            <span>NutriScan AI</span>
          </div>
        </div>

        <div className="article-body">
          <h2>Why Ingredient Lists Matter More Than Nutrition Panels</h2>
          <p>
            The nutrition facts panel tells you <em>how much</em> of each nutrient is present. 
            The ingredient list tells you <em>where those nutrients come from</em> — and that matters enormously.
          </p>
          <p>
            Two products can have identical calorie counts but wildly different ingredient quality. 
            A 200-calorie oat bar made from oats, nuts, and honey is nutritionally different from 
            a 200-calorie bar made from refined sugars, processed soy protein, and twelve additives.
          </p>

          <h2>Step-by-Step: How to Read a Food Ingredient List</h2>
          <div className="seo-steps" style={{ marginTop: 20 }}>
            {howToReadIngredients.map((item) => (
              <div key={item.step} className="seo-step-card">
                <div className="seo-step-number">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>

          <h2>The "Recognizability Test"</h2>
          <p>
            A useful heuristic used by food author Michael Pollan: <em>"Don't eat anything your great-grandmother wouldn't recognize as food."</em>
          </p>
          <p>
            Apply this to ingredients: if you see <strong>disodium guanylate</strong>, <strong>butylated hydroxyanisole</strong>, 
            or <strong>polyglycerol polyricinoleate</strong> — these are synthetic chemicals, not food. 
            Their presence isn't automatically dangerous, but their abundance indicates heavy processing.
          </p>

          <div className="article-callout">
            <strong>The 5-ingredient rule:</strong> Products with 5 or fewer ingredients are almost always minimally processed. 
            The more ingredients, the more processing steps involved.
          </div>

          <h2>Common Red Flags in Ingredient Lists</h2>
          <div className="seo-info-list" style={{ marginTop: 16 }}>
            {ingredientRedFlags.map((r) => (
              <div key={r.flag} className="seo-info-item">
                <CheckCircle2 className="icon-inline" style={{ color: 'var(--grade-e)', flexShrink: 0 }} />
                <div>
                  <strong>{r.flag}</strong>
                  <br />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{r.why}</span>
                </div>
              </div>
            ))}
          </div>

          <h2>Hidden Sugars in Ingredient Lists</h2>
          <p>
            Sugar appears under many names. If you see two or three of these in the ingredient list, 
            the product is likely much higher in sugar than a quick glance suggests:
          </p>
          <ul>
            <li>Glucose syrup, fructose syrup, corn syrup</li>
            <li>Maltodextrin, dextrose, maltose</li>
            <li>Cane juice, fruit juice concentrate</li>
            <li>Agave nectar, rice syrup, barley malt</li>
          </ul>
          <p>
            This practice — called <strong>sugar splitting</strong> — intentionally spreads sugar across 
            multiple ingredient names so that none of them individually appears near the top of the list.
          </p>

          <h2>Allergens in Ingredient Lists</h2>
          <p>
            Major allergens are required by law to be declared in ingredient lists. In India, this includes:
          </p>
          <ul>
            <li>Milk, eggs, fish, shellfish</li>
            <li>Tree nuts (almonds, cashews, walnuts, etc.)</li>
            <li>Peanuts, wheat, soy</li>
          </ul>
          <p>
            Look for a "Contains:" statement near the ingredient list, or allergens bolded within the list itself. 
            "May contain traces of" indicates cross-contamination risk during manufacturing.
          </p>

          <h2>Ingredients to Watch if You Have Specific Dietary Goals</h2>
          <ul>
            <li><strong>Weight loss:</strong> Avoid maltodextrin, refined flours, high-fructose corn syrup</li>
            <li><strong>Heart health:</strong> Avoid partially hydrogenated oils, palm oil, high sodium</li>
            <li><strong>Gut health:</strong> Prefer fermented ingredients; limit emulsifiers like polysorbate 80</li>
            <li><strong>Children's diet:</strong> Avoid artificial colors (E102, E110, E122, E124, E129), sodium benzoate</li>
          </ul>

          <h2>Let NutriScan AI Do the Work</h2>
          <p>
            Manually analyzing ingredient lists for every product is time-consuming and requires knowing what 
            dozens of chemical names mean. NutriScan AI automates this:
          </p>
          <ul>
            <li>Scans the barcode</li>
            <li>Retrieves the full ingredient list from Open Food Facts</li>
            <li>Flags known problematic additives, sugar aliases, and red flag ingredients</li>
            <li>Assigns an overall health grade based on ingredient quality and nutritional content</li>
          </ul>

          <div className="article-cta">
            <h3>Check the ingredients in any product</h3>
            <p>Scan a barcode for instant ingredient analysis and health grading.</p>
            <Link to="/" className="btn-primary-cta">
              Open NutriScan AI <ArrowRight className="icon-inline" style={{ marginLeft: 6, marginRight: 0 }} />
            </Link>
          </div>

          <div className="article-related">
            <h3>Related Articles</h3>
            <div className="article-related-links">
              <Link to="/how-to-read-food-label">How to Read a Food Nutrition Label</Link>
              <Link to="/what-are-food-additives">What Are Food Additives?</Link>
              <Link to="/how-much-sugar-is-too-much">How Much Sugar Is Too Much?</Link>
              <Link to="/is-this-food-healthy">Is This Food Healthy?</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
