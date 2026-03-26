const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const buttonWidth = 281.42; 
const canvasWidth = 575;
const centerLeft = (canvasWidth - buttonWidth) / 2; // 146.79

const finalButtonFixes = {
    // SHAPE (Green Background)
    'element_shape_mx0egdwrbp5': { 
        left: `${centerLeft}px`, 
        width: `${buttonWidth}px`,
        'z-index': '5 !important'
    },
    // TEXT ("LỄ THÀNH HÔN")
    'element_text_fo8she9s3hy': { 
        left: `${centerLeft}px`, 
        width: `${buttonWidth}px`, 
        'text-align': 'center',
        'z-index': '10 !important',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'height': '48px !important', // Height of the button shape
        'top': '3739.52px', // Same top as shape
        'white-space': 'nowrap !important'
    }
};

for (const [id, styles] of Object.entries(finalButtonFixes)) {
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
console.log('Forced LỄ THÀNH HÔN text inside the button with z-index and centering.');
