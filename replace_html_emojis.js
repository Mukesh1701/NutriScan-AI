const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'frontend/index.html');
let html = fs.readFileSync(htmlFile, 'utf8');

const emojiMap = {
    '—': '—',
    '🫒': '<i data-lucide="droplet" class="nut-icon"></i>',
    '🌿': '<i data-lucide="leaf" class="nut-icon"></i>',
    '🎯': '<i data-lucide="target" class="icon-inline"></i>',
    '➕': '<i data-lucide="plus" class="icon-inline"></i>',
    '🤖': '<i data-lucide="bot" class="icon-inline"></i>',
    '📉': '<i data-lucide="trending-down" class="icon-inline"></i>',
    '⚖️': '<i data-lucide="scale" class="icon-inline"></i>',
    '📈': '<i data-lucide="trending-up" class="icon-inline"></i>',
    '👨': '<i data-lucide="user" class="icon-inline"></i>',
    '👩': '<i data-lucide="user" class="icon-inline"></i>',
    '🎂': '<i data-lucide="cake" class="icon-inline"></i>',
    '📏': '<i data-lucide="ruler" class="icon-inline"></i>',
    '🛋️': '<i data-lucide="sofa" class="icon-inline"></i>',
    '🚶': '<i data-lucide="footprints" class="icon-inline"></i>',
    '🏃': '<i data-lucide="activity" class="icon-inline"></i>',
    '🚴': '<i data-lucide="bike" class="icon-inline"></i>',
    '🏋️': '<i data-lucide="dumbbell" class="icon-inline"></i>',
    '🔥': '<i data-lucide="flame" class="icon-inline"></i>',
    '🫀': '<i data-lucide="heart" class="icon-inline"></i>',
    '📊': '<i data-lucide="bar-chart-2" class="icon-inline"></i>',
    '💪': '<i data-lucide="dumbbell" class="icon-inline"></i>',
    '⚡': '<i data-lucide="zap" class="icon-inline"></i>',
    '💧': '<i data-lucide="droplet" class="icon-inline"></i>',
    '🥗': '<i data-lucide="salad" class="icon-inline"></i>',
    '🔍': '<i data-lucide="search" class="icon-inline"></i>',
    '📷': '<i data-lucide="camera" class="icon-inline"></i>',
    '🛑': '<i data-lucide="octagon-alert" class="icon-inline"></i>',
    '📸': '<i data-lucide="camera" class="icon-inline"></i>',
    '🟢': '',
    '🍏': '',
    '🟡': '',
    '🟠': '',
    '🔴': '',
    '⛔': '',
    '🍬': '<i data-lucide="candy" class="icon-inline"></i>',
    '🧈': '<i data-lucide="beef" class="icon-inline"></i>',
    '🧂': '<i data-lucide="flask-conical" class="icon-inline"></i>',
    '⚠️': '<i data-lucide="alert-triangle" class="icon-inline"></i>',
    '🌴': '<i data-lucide="tree-palm" class="icon-inline"></i>',
    '🧪': '<i data-lucide="beaker" class="icon-inline"></i>',
    '🧠': '<i data-lucide="brain" class="icon-inline"></i>',
    '📱': '<i data-lucide="smartphone" class="icon-inline"></i>',
    '🥇': '<i data-lucide="medal" class="icon-inline"></i>',
    '🕵️': '<i data-lucide="search-x" class="icon-inline"></i>',
    '❤️': '<i data-lucide="heart" style="width: 14px; height: 14px; display: inline; vertical-align: text-bottom;"></i>',
    '🍽️': '<i data-lucide="utensils" class="icon-inline"></i>',
    '❓': '<i data-lucide="help-circle" class="icon-inline"></i>',
    '✅': '<i data-lucide="check-circle" class="icon-inline"></i>',
    '🤧': '<i data-lucide="shield-alert" class="icon-inline"></i>'
};

// Also handle the `<span class="logo-icon">🍎</span>` that we already changed
// But we need to make sure the remaining emojis are replaced.

Object.keys(emojiMap).forEach(emoji => {
    // Escape emoji for regex if needed, but simple split/join is safer for unicode
    html = html.split(emoji).join(emojiMap[emoji]);
});

fs.writeFileSync(htmlFile, html);
console.log('HTML emojis replaced.');
