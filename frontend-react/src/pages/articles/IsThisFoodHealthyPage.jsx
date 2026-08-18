import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, X } from 'lucide-react';
import { useSEO } from '../../lib/useSEO';

const questionList = [
  { q: 'Is high protein always healthy?', a: 'Not necessarily. Protein bars are often high in sugar and artificial sweeteners. Always check the full label.' },
  { q: 'Is "organic" automatically healthy?', a: 'No. Organic sugar is still sugar. Organic chips are still chips. Organic certification refers to farming methods, not nutritional quality.' },
  { q: 'Is low-calorie = healthy?', a: 'Low calorie foods often compensate with artificial sweeteners, excessive sodium, or other additives. Check the ingredient list.' },
  { q: 'Is zero-fat healthy?', a: 'Some fats are essential (omega-3, omega-6). Zero-fat products often replace fat with sugar or starch for taste.' },
  { q: 'Is "no added sugar" healthy?', a: 'It means no sugar was added during manufacturing, but the food may still be naturally very high in sugar (e.g., fruit juice).' },
];

const quickChecks = [
  { check: 'Health grade A or B', good: true },
  { check: 'NOVA Group 1, 2, or 3', good: true },
  { check: 'Protein > 5g per 100g', good: true },
  { check: 'Fiber > 3g per 100g', good: true },
  { check: 'Sugar < 5g per 100g', good: true },
  { check: 'Sodium < 500mg per 100g', good: true },
  { check: 'Health grade D or E', good: false },
  { check: 'NOVA Group 4 (ultra-processed)', good: false },
  { check: 'Sugar > 15g per 100g', good: false },
  { check: 'Saturated fat > 5g per 100g', good: false },
  { check: 'More than 5 E-number additives', good: false },
  { check: 'Partially hydrogenated oils in ingredients', good: false },
];

export default function IsThisFoodHealthyPage() {
  useSEO(
    'Is This Food Healthy? How to Tell in 60 Seconds | NutriScan AI',
    'Learn how to quickly tell if a packaged food is actually healthy. Understand health grades, ingredient red flags, and common food label tricks.',
    'https://www.nutriscan-ai.in/is-this-food-healthy'
  );

  return (
    <div className="seo-page article-page">
      <div className="article-container">
        <div className="article-header">
          <div className="seo-hero-badge">
            <BookOpen className="icon-inline" /> Article
          </div>
          <h1 className="article-title">
            Is This Food <span className="gradient-text">Healthy?</span><br />
            How to Tell in 60 Seconds
          </h1>
          <p className="article-subtitle">
            The food industry is very good at making unhealthy products look healthy. 
            Here's how to cut through the noise and make a real judgment call in under a minute.
          </p>
          <div className="article-meta">
            <span>6 min read</span>
            <span>•</span>
            <span>NutriScan AI</span>
          </div>
        </div>

        <div className="article-body">
          <h2>The 60-Second Method</h2>
          <p>
            When you're standing in a supermarket, you don't have time for a deep nutritional analysis. 
            Here's a quick mental checklist that takes under a minute:
          </p>

          <div className="seo-health-signals" style={{ marginTop: 16 }}>
            {quickChecks.map((c) => (
              <div key={c.check} className={`seo-signal ${c.good ? 'seo-signal-good' : 'seo-signal-bad'}`}>
                {c.good
                  ? <CheckCircle2 size={16} style={{ color: 'var(--grade-a)', flexShrink: 0 }} />
                  : <X size={16} style={{ color: 'var(--grade-e)', flexShrink: 0 }} />
                }
                <span>{c.check}</span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 24 }}>
            If a food passes most of the green checks and avoids the red flags, it's generally a healthy choice. 
            If it hits 2 or more red flags, reconsider.
          </p>

          <h2>Step 1: Look at the Ingredient List First</h2>
          <p>
            Before checking numbers, read the ingredient list. It tells you <em>what the food actually is</em>. 
            A rule of thumb used by nutritionists: <strong>if you can't picture the ingredient growing in nature, be cautious.</strong>
          </p>
          <p>
            Ingredients are listed in descending order of weight. If sugar, refined flour, or palm oil 
            appears in the first three ingredients, the product probably isn't a healthy staple food.
          </p>

          <h2>Step 2: Check the Sugar</h2>
          <p>
            Sugar is the most commonly hidden "unhealthy" element in packaged food. 
            On the nutrition panel, find "Sugars" under Carbohydrates. A food is:
          </p>
          <ul>
            <li><strong>Low sugar:</strong> under 5g per 100g</li>
            <li><strong>Medium sugar:</strong> 5–15g per 100g</li>
            <li><strong>High sugar:</strong> over 15g per 100g</li>
          </ul>
          <p>Also look for sugar aliases in the ingredient list: corn syrup, fructose, dextrose, maltose, cane juice.</p>

          <h2>Step 3: Check Protein and Fiber</h2>
          <p>
            These two nutrients make a food genuinely filling and nutritious. 
            Foods high in both protein and fiber tend to be healthier choices — they slow digestion, 
            stabilize blood sugar, and help you feel satisfied without overeating.
          </p>
          <ul>
            <li>Good protein: 5g+ per 100g</li>
            <li>Good fiber: 3g+ per 100g</li>
          </ul>

          <h2>Step 4: Check Sodium</h2>
          <p>
            Sodium is often shockingly high in products that don't taste salty. 
            Breakfast cereals, bread, and sauces are common sodium traps.
          </p>
          <ul>
            <li>Under 300mg/100g: reasonable</li>
            <li>Over 600mg/100g: high — limit frequency</li>
          </ul>

          <h2>Step 5: Consider the Processing Level</h2>
          <p>
            The <strong>NOVA classification</strong> measures how processed a food is, on a scale of 1–4. 
            Research from multiple large-scale studies shows that NOVA Group 4 (ultra-processed) foods are 
            consistently associated with poorer health outcomes — regardless of their calorie or nutrient content.
          </p>
          <p>
            Signs of ultra-processing: long ingredient lists with additives, artificial flavors, emulsifiers, 
            stabilizers, and sweeteners that don't naturally occur in whole foods.
          </p>

          <h2>Common Label Tricks to Watch Out For</h2>

          {questionList.map((item) => (
            <div key={item.q} className="article-qa">
              <h3>"{item.q}"</h3>
              <p>{item.a}</p>
            </div>
          ))}

          <h2>The Shortcut: Use NutriScan AI</h2>
          <p>
            Instead of mentally running through all these checks, you can scan any product's barcode 
            with NutriScan AI and get an instant health grade (A–E), NOVA score, and all the key numbers at a glance.
          </p>

          <div className="article-cta">
            <h3>Check if your food is healthy — instantly</h3>
            <p>Scan a barcode and get a health grade, NOVA score, and full nutritional breakdown.</p>
            <Link to="/" className="btn-primary-cta">
              Open NutriScan AI <ArrowRight className="icon-inline" style={{ marginLeft: 6, marginRight: 0 }} />
            </Link>
          </div>

          <div className="article-related">
            <h3>Related Articles</h3>
            <div className="article-related-links">
              <Link to="/how-to-read-food-label">How to Read a Food Nutrition Label</Link>
              <Link to="/how-much-sugar-is-too-much">How Much Sugar Is Too Much?</Link>
              <Link to="/what-are-food-additives">What Are Food Additives?</Link>
              <Link to="/how-to-check-food-ingredients">How to Check Food Ingredients</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
