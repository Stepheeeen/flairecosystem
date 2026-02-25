import fs from 'fs'
import path from 'path'

const files = [
    'app/[companySlug]/cart/page.tsx',
    'app/[companySlug]/checkout/page.tsx',
    'app/[companySlug]/products/page.tsx',
    'app/[companySlug]/products/[id]/page.tsx',
    'components/product-card.tsx',
    'components/navbar.tsx'
];

for (const f of files) {
    const file = path.join(process.cwd(), f);
    if (!fs.existsSync(file)) continue;

    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split('\n');

    // Find where "use client" is
    const useClientIndex = lines.findIndex(l => l.includes('"use client"'));
    if (useClientIndex > 0) {
        // It's not the first line. We need to remove it and put it at the very top.
        const useClientLine = lines.splice(useClientIndex, 1)[0];
        lines.unshift(useClientLine);
        fs.writeFileSync(file, lines.join('\n'));
        console.log('Fixed "use client" in ' + file);
    }
}
