const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const finalOffsetFixes = {
    // H (Top-Left, much higher)
    'element_text_vvx0wqioeir': { 
        left: '255px', 
        top: '2970px', 
        width: '60px', 
        'text-align': 'center' 
    },
    // N (Bottom-Right, overlapping)
    'element_text_6x5glevmotj': { 
        left: '275px', 
        top: '3020px', 
        width: '60px', 
        'text-align': 'center' 
    }
};

for (const [id, styles] of Object.entries(finalOffsetFixes)) {
    const regex = new RegExp(`\\[data-node-id="${id}"\\]\\s*{([^}]+)}`, 'g');
    css = css.replace(regex, (match, inner) => {
        let props = inner.split(';').map(p => p.trim()).filter(p => !!p);
        let dict = {};
        for (let p of props) {
            let colonIdx = p.indexOf(':');
            if (colonIdx === -1) continue;
            dict[p.slice(0, colonIdx).trim().toLowerCase()] = p.slice(colonIdx + 1).trim();
        }
        for (let [name, val] of Object.entries(styles)) {
            dict[name] = val;
        }
        let rebuild = [];
        for (let name in dict) rebuild.push(`${name}: ${dict[name]}`);
        return `[data-node-id="${id}"] { ${rebuild.join('; ')}; }`;
    });
}

fs.writeFileSync('styles.css', css);
console.log('Applied final vertical offset for HN logo.');
