import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useSEO } from '../../lib/useSEO';

export default function HowToReadFoodLabelPage() {
  useSEO(
    'How to Read a Food Nutrition Label – Complete Guide | NutriScan AI',
    'Learn how to read food nutrition labels. Understand serving size, calories, macronutrients, % daily value, ingredients, and additives — with examples.',
    'https://www.nutriscan-ai.in/how-to-read-food-label'
  );

  return (
    <div className="seo-page article-page">
      <div className="article-container">
        {/* Header */}
        <div className="article-header">
          <div className="seo-hero-badge">
            <BookOpen className="icon-inline" /> Guide
          </div>
          <h1 className="article-title">
            How to Read a <span className="gradient-text">Food Nutrition Label</span>
          </h1>
          <p className="article-subtitle">
            Food labels contain a lot of information — but most of us never learned how to actually read them. 
            This guide walks you through every section of a nutrition facts panel, what each number means, 
            and what to watch out for.
          </p>
          <div className="article-meta">
            <span>8 min read</span>
            <span>•</span>
            <span>NutriScan AI</span>
          </div>
        </div>

        <div className="article-body">
          <h2>1. Serving Size — The First Thing to Check</h2>
          <p>
            Everything on the label is calculated based on the <strong>serving size</strong> — not the whole package. 
            This is the most commonly missed detail. A bag of chips labeled "150 calories" might have 3 servings inside, 
            meaning the whole bag is 450 calories.
          </p>
          <p>
            Always look at: <strong>serving size</strong> (e.g., "30g") and <strong>servings per container</strong> (e.g., "about 3"). 
            If you eat the whole thing, multiply all numbers accordingly.
          </p>

          <div className="article-callout">
            <strong>Example:</strong> A 90g packet says "45 calories per serving" with "2 servings per container." 
            If you eat the whole packet, you're consuming 90 calories — not 45.
          </div>

          <h2>2. Calories — How Much Energy Is in It?</h2>
          <p>
            Calories measure the energy your body gets from eating a food. As a rough guide:
          </p>
          <ul>
            <li>Under 100 kcal per 100g → low calorie density</li>
            <li>100–300 kcal per 100g → moderate</li>
            <li>Over 400 kcal per 100g → high energy density (use caution)</li>
          </ul>
          <p>
            But don't judge a food purely on calories. A small amount of olive oil is calorie-dense but highly nutritious. 
            A large plate of soft drink has fewer calories than olive oil but almost no nutritional value.
          </p>

          <h2>3. Protein — Essential for Muscle and Satiety</h2>
          <p>
            Protein is listed in grams. It's the most satiating macronutrient — high-protein foods keep you fuller longer. 
            General guidelines:
          </p>
          <ul>
            <li><strong>Good source:</strong> 5g+ protein per 100g</li>
            <li><strong>High protein:</strong> 15g+ protein per 100g</li>
          </ul>
          <p>
            For packaged foods, look for protein from whole sources (chicken, legumes, eggs, dairy) rather than 
            isolated soy or protein concentrates listed at the bottom of a long ingredient list.
          </p>

          <h2>4. Carbohydrates — Not All Carbs Are Equal</h2>
          <p>
            The carbohydrate section is broken into:
          </p>
          <ul>
            <li><strong>Total carbohydrates</strong> — all carbs including fiber and sugar</li>
            <li><strong>Dietary fiber</strong> — good. Slows digestion, feeds gut bacteria, lowers blood sugar spikes</li>
            <li><strong>Sugars</strong> — includes both natural (from fruit, milk) and <em>added</em> sugars</li>
            <li><strong>Added sugars</strong> — specifically added during manufacturing; this is the number to watch</li>
          </ul>
          <p>
            Aim for foods with <strong>high fiber</strong> and <strong>low added sugar</strong>. 
            WHO recommends keeping added sugar under 25g per day (about 6 teaspoons).
          </p>

          <h2>5. Sugar — The Hidden Number</h2>
          <p>
            Sugar is one of the most important numbers on the label — and one of the easiest to be deceived by. 
            Food companies use over 60 different names for sugar to make it harder to spot:
          </p>
          <ul>
            <li>High-fructose corn syrup / glucose-fructose syrup</li>
            <li>Cane juice, fruit juice concentrate</li>
            <li>Maltose, dextrose, sucrose, fructose</li>
            <li>Agave nectar, rice syrup, barley malt</li>
          </ul>
          <p>
            As a rule of thumb: <strong>under 5g sugar per 100g</strong> is low; <strong>over 15g per 100g</strong> is high.
          </p>

          <h2>6. Fat — Good and Bad</h2>
          <p>
            Total fat is listed with a breakdown:
          </p>
          <ul>
            <li><strong>Saturated fat:</strong> Limit to under 5g per 100g. High intake is linked to cardiovascular risk.</li>
            <li><strong>Trans fat:</strong> Avoid entirely. Even 0.5g per day raises cardiovascular risk. Any product with "partially hydrogenated oil" in ingredients contains trans fat.</li>
            <li><strong>Unsaturated fat:</strong> Beneficial — found in olive oil, nuts, fish.</li>
          </ul>

          <h2>7. Sodium — The Silent Problem</h2>
          <p>
            Sodium (salt) is often shockingly high in packaged foods. The daily recommended limit is <strong>2,300mg of sodium</strong> 
            (about 1 teaspoon of salt). Many single-serve processed foods contain 800–1,200mg.
          </p>
          <ul>
            <li>Low sodium: under 120mg per 100g</li>
            <li>High sodium: over 600mg per 100g</li>
          </ul>

          <h2>8. The Ingredient List — Where the Truth Is</h2>
          <p>
            Ingredients are listed in <strong>descending order by weight</strong>. The first ingredient is the most abundant. 
            Key things to look for:
          </p>
          <ul>
            <li>Is the primary ingredient a whole food (e.g., "whole oats," "chicken")?</li>
            <li>Is sugar listed in the first three ingredients? If so, it's a high-sugar product.</li>
            <li>Can you recognize all the ingredients? Long lists of unrecognizable chemicals indicate heavy processing.</li>
            <li>Are there more than 3–5 additives? (E-numbers, preservatives, artificial flavors)</li>
          </ul>

          <h2>9. % Daily Value (%DV) — A Quick Shortcut</h2>
          <p>
            The % Daily Value tells you how much of a nutrient one serving provides relative to daily needs.
          </p>
          <ul>
            <li><strong>5% DV or less:</strong> Low — not a significant source</li>
            <li><strong>20% DV or more:</strong> High — significant contribution</li>
          </ul>
          <p>
            Use %DV to quickly compare products side by side.
          </p>

          <h2>Don't Want to Do This Manually?</h2>
          <p>
            Reading nutrition labels carefully on every product takes time and expertise. 
            NutriScan AI automates the entire process — just scan the barcode and get an instant health grade, 
            ingredient alerts, and full nutritional breakdown.
          </p>

          <div className="article-cta">
            <h3>Analyze any food label instantly</h3>
            <p>Scan a barcode and let NutriScan AI do the label reading for you.</p>
            <Link to="/" className="btn-primary-cta">
              Open NutriScan AI <ArrowRight className="icon-inline" style={{ marginLeft: 6, marginRight: 0 }} />
            </Link>
          </div>

          <div className="article-related">
            <h3>Related Articles</h3>
            <div className="article-related-links">
              <Link to="/is-this-food-healthy">Is This Food Healthy?</Link>
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
