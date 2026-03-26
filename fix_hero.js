const fs = require('fs');

// 1. Fix Google Fonts URL in index.html
let html = fs.readFileSync('index.html', 'utf8');
const validGFonts = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Dancing+Script:wght@400;700&family=Lora:wght@400;600&display=swap';
html = html.replace(/https:\/\/fonts\.googleapis\.com\/css2\?family=[^" ]+/g, validGFonts);
fs.writeFileSync('index.html', html);
console.log('Cleaned up Google Fonts URL in index.html.');

// 2. Fix redundant opacity and forced visibility in styles.css
let css = fs.readFileSync('styles.css', 'utf8');
// This regex matches [data-node-id="..."] { ... } blocks
css = css.replace(/\[data-node-id="([^"]+)"\]\s*{([^}]+)}/g, (match, id, inner) => {
    // Split into individual property:value; pairs
    let props = inner.split(';').map(p => p.trim()).filter(p => p.length > 0);
    let dict = {};
    for (let p of props) {
        let colonIdx = p.indexOf(':');
        if (colonIdx === -1) continue;
        let name = p.slice(0, colonIdx).trim().toLowerCase();
        let value = p.slice(colonIdx + 1).trim();
        dict[name] = value;
    }
    
    // Logic: if opacity exists, make it 1 to ensure it's visible by default
    // This prevents elements from being stuck at opacity 0 if animation fails
    if (dict['opacity'] !== undefined) {
        dict['opacity'] = '1';
    }
    
    let rebuild = [];
    for (let name in dict) {
        rebuild.push(`${name}: ${dict[name]}`);
    }
    return `[data-node-id="${id}"] { ${rebuild.join('; ')}; }`;
});

fs.writeFileSync('styles.css', css);
console.log('Cleaned up styles.css redundant props and ensured visibility.');
