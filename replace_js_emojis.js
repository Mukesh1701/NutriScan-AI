const fs = require('fs');
const path = require('path');

const jsFile = path.join(__dirname, 'frontend/script.js');
let js = fs.readFileSync(jsFile, 'utf8');

// 1. Rename EMOJI_MAP to ICON_MAP and replace emojis with lucide icon names
const iconMapReplacements = {
    'apple: "🍎"': 'apple: "apple"',
    'banana: "🍌"': 'banana: "banana"',
    'beetroot: "🟣"': 'beetroot: "circle"',
    '"bell pepper": "🫑"': '"bell pepper": "bell"',
    'cabbage: "🥬"': 'cabbage: "leaf"',
    'capsicum: "🌶️"': 'capsicum: "flame"',
    'carrot: "🥕"': 'carrot: "carrot"',
    'cauliflower: "🥦"': 'cauliflower: "cloud"',
    'chicken: "🍗"': 'chicken: "drumstick"',
    '"chilli pepper": "🌶️"': '"chilli pepper": "flame"',
    'corn: "🌽"': 'corn: "wheat"',
    'cucumber: "🥒"': 'cucumber: "cylinder"',
    'eggplant: "🍆"': 'eggplant: "eggplant"',
    'garlic: "🧄"': 'garlic: "garlic"',
    'ginger: "🫚"': 'ginger: "activity"',
    'grapes: "🍇"': 'grapes: "grape"',
    'jalepeno: "🌶️"': 'jalepeno: "flame"',
    'kiwi: "🥝"': 'kiwi: "circle-dashed"',
    'lemon: "🍋"': 'lemon: "citrus"',
    'lettuce: "🥬"': 'lettuce: "leaf"',
    'mango: "🥭"': 'mango: "droplet"',
    'onion: "🧅"': 'onion: "circle"',
    'orange: "🍊"': 'orange: "citrus"',
    'paprika: "🌶️"': 'paprika: "flame"',
    'pear: "🍐"': 'pear: "droplet"',
    'peas: "🟢"': 'peas: "circle"',
    'pineapple: "🍍"': 'pineapple: "crown"',
    'pomegranate: "🔴"': 'pomegranate: "circle"',
    'potato: "🥔"': 'potato: "cookie"',
    'raddish: "🟣"': 'raddish: "circle"',
    '"soy beans": "🫘"': '"soy beans": "bean"',
    'spinach: "🥬"': 'spinach: "leaf"',
    'sweetcorn: "🌽"': 'sweetcorn: "wheat"',
    'sweetpotato: "🍠"': 'sweetpotato: "cookie"',
    'tomato: "🍅"': 'tomato: "circle"',
    'turnip: "🟣"': 'turnip: "circle"',
    'watermelon: "🍉"': 'watermelon: "slice"'
};

js = js.replace(/const EMOJI_MAP = {[\s\S]*?};/, (match) => {
    let replaced = match.replace('EMOJI_MAP', 'ICON_MAP');
    for (const [oldStr, newStr] of Object.entries(iconMapReplacements)) {
        replaced = replaced.replace(oldStr, newStr);
    }
    return replaced;
});

// 2. Fix references to EMOJI_MAP -> ICON_MAP and change how it's rendered
js = js.replace(/EMOJI_MAP\[(.*?)\]/g, 'ICON_MAP[$1]');
js = js.replace(/resultEmoji\.textContent = icon;/g, 'resultEmoji.innerHTML = `<i data-lucide="${icon}"></i>`; lucide.createIcons({root: resultEmoji});');

// 3. Remove all general emojis from strings
const stringEmojis = ['🍎', '🍌', '🟣', '🫑', '🥬', '🌶️', '🥕', '🥦', '🍗', '🌽', '🥒', '🍆', '🧄', '🫚', '🍇', '🥝', '🍋', '🥭', '🧅', '🍊', '🍐', '🟢', '🍍', '🔴', '🥔', '🫘', '🍠', '🍅', '🍉', '🎯', '📉', '⚖️', '📈', '🔥', '🫀', '📊', '💪', '⚡', '💧', '🥗', '🏋️', '🔍', '📷', '🛑', '📸', '✅', '🤧', '🌴', '🧪', '⚠️', '🍽️', '❓', '🕐', '🕒', '✨', '✓ ', '⏳', '😢', '🥇', '🕵️'];

stringEmojis.forEach(e => {
    js = js.split(e).join('');
});

// 4. Update the history render function to use lucide icons for food
js = js.replace(/let emoji = ICON_MAP\[scan\.food\] \|\| ".*?";/g, 'let iconName = ICON_MAP[scan.food] || "help-circle";');
js = js.replace(/emoji = "bar-chart-2";/g, 'iconName = "barcode";');
js = js.replace(/<div class="history-food-emoji">\$\{emoji\}<\/div>/g, '<div class="history-food-emoji"><i data-lucide="${iconName}"></i></div>');

// Ensure createIcons is called after renderHistory
js = js.replace(/histTimeline\.innerHTML = html;/g, 'histTimeline.innerHTML = html;\n    lucide.createIcons({ root: histTimeline });');

// Same for renderFoodTags (About page)
js = js.replace(/foodTagsContainer\.innerHTML = html;/g, 'foodTagsContainer.innerHTML = html;\n    lucide.createIcons({ root: foodTagsContainer });');

// Update renderFoodTags to output lucide tags instead of textContent emojis
js = js.replace(/html \+= `<div class="food-tag">\$\{ICON_MAP\[food\]\} \$\{food\}<\/div>`;/g, 'html += `<div class="food-tag"><i data-lucide="${ICON_MAP[food] || \'help-circle\'}" style="width:16px;height:16px;margin-right:6px;"></i> ${food}</div>`;');

fs.writeFileSync(jsFile, js);
console.log('JS emojis replaced.');
