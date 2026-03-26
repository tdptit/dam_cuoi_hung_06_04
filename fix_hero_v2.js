const fs = require('fs');

// 1. Fix Google Fonts URL in index.html to avoid loading errors
let html = fs.readFileSync('index.html', 'utf8');
const validGFonts = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Dancing+Script:wght@400;700&family=Lora:wght@400;600&display=swap';
html = html.replace(/https:\/\/fonts\.googleapis\.com\/css2\?family=[^" ]+/g, validGFonts);
fs.writeFileSync('index.html', html);

// 2. Adjust Hero Section positions and visibility in styles.css
let css = fs.readFileSync('styles.css', 'utf8');

const heroFixes = {
    'element_text_1sgz63palk1': { top: '560px', left: '0px', width: '575px', 'text-align': 'center', 'opacity': '1' }, // Save our date
    'element_text_ggpeazqfzho': { top: '650px', left: '0px', width: '575px', 'text-align': 'center', 'opacity': '1' }, // NAMES
    'element_text_sw2g4tritog': { top: '710px', left: '0px', width: '575px', 'text-align': 'center', 'opacity': '1' }, // DATE
    'element_text_5drkesyzj2q': { opacity: '1' }, // WHEN TWO HEATS
    'element_text_n89e4g42wdj': { opacity: '1' },
    'element_image_cp2ifiqq6p5': { opacity: '1' },
    'element_text_tmrq54dtaxd': { opacity: '1' },
    'element_text_a8sem1kayyv': { opacity: '1' },
    'element_image_uowcu8ia0qk': { opacity: '1' }
};

for (const [id, styles] of Object.entries(heroFixes)) {
    const regex = new RegExp(`\\[data-node-id="${id}"\\]\\s*{([^}]+)}`, 'g');
    css = css.replace(regex, (match, inner) => {
        let props = inner.split(';').map(p => p.trim()).filter(p => p.length > 0);
        let dict = {};
        for (let p of props) {
            let colonIdx = p.indexOf(':');
            if (colonIdx === -1) continue;
            let name = p.slice(0, colonIdx).trim().toLowerCase();
            let value = p.slice(colonIdx + 1).trim();
            dict[name] = value;
        }
        // Apply fixes
        for (let [sName, sVal] of Object.entries(styles)) {
            dict[sName] = sVal;
        }
        let rebuild = [];
        for (let name in dict) {
            rebuild.push(`${name}: ${dict[name]}`);
        }
        return `[data-node-id="${id}"] { ${rebuild.join('; ')}; }`;
    });
}

fs.writeFileSync('styles.css', css);
console.log('Hero section layout fixed.');
