import fs from 'fs';
import path from 'path';

// Define the files and their string replacements
const replacements = [
  {
    file: 'components/navbar.tsx',
    find: 'const brandName = companyName || "VELLION"',
    replace: 'const brandName = companyName || "FLAIR ECO SYSTEM"'
  },
  {
    file: 'lib/email.ts',
    find: 'companyName: string = "Vellion Platform"',
    replace: 'companyName: string = "Flair Eco System"'
  },
  {
    file: 'app/page.tsx',
    find: 'VELLION',
    replace: 'FLAIR ECO SYSTEM'
  },
  {
    file: 'app/page.tsx',
    find: '© 2026 Vellion. All rights reserved.',
    replace: '© 2026 Flair Eco System. All rights reserved.'
  },
  {
    file: 'app/api/auth/forgot-password/route.ts',
    find: 'Vellion Platform',
    replace: 'Flair Eco System'
  },
  {
    file: 'app/layout.tsx',
    find: "title: 'Vellion - Premium Fashion',",
    replace: "title: 'Flair Eco System',",
  },
  {
    file: 'app/layout.tsx',
    find: "description: 'Discover premium fashion and curated luxury collections at Vellion',",
    replace: "description: 'Discover premium fashion and curated luxury collections at Flair Eco System',",
  },
  {
    file: 'app/super-admin/page.tsx',
    find: 'FlairTechnology Global Dashboard',
    replace: 'Flair Eco System Global Dashboard'
  },
  {
    file: 'app/super-admin/page.tsx',
    find: 'Brand Name (e.g., Vellion)',
    replace: 'Brand Name (e.g., Flair)'
  },
  {
    file: 'app/super-admin/page.tsx',
    find: 'URL Slug (e.g., vellion)',
    replace: 'URL Slug (e.g., flair)'
  },
  {
    file: 'app/super-admin/page.tsx',
    find: '.vellion.com',
    replace: '.flairecosystem.com'
  },
  {
    file: 'app/auth/signup/page.tsx',
    find: 'Join Vellion for a premium shopping experience',
    replace: 'Join Flair Eco System for a premium shopping experience'
  },
  {
    file: 'middleware.ts',
    find: 'localhost:3000, vellion.com',
    replace: 'localhost:3000, flairecosystem.com'
  },
  {
    file: 'app/admin/settings/page.tsx',
    find: '.vellion.com',
    replace: '.flairecosystem.com'
  }
];

for (const req of replacements) {
    const filePath = path.join(process.cwd(), req.file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Replace all occurrences based on exact string match
        // For lib/email.ts, use regex to catch all instances
        if (req.file === 'lib/email.ts') {
             content = content.replace(/Vellion Platform/g, 'Flair Eco System');
        } else {
             content = content.replaceAll(req.find, req.replace);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${req.file} - Replaced: ${req.find.substring(0, 20)}...`);
    } else {
        console.warn(`File not found: ${filePath}`);
    }
}
