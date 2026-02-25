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
  
  // Ensure import { getStoreUrl } from "@/lib/utils"
  if (!content.includes('getStoreUrl')) {
    content = 'import { getStoreUrl } from "@/lib/utils"\n' + content;
  }
  
  // Replace `/${companySlug}/path` with getStoreUrl(companySlug, '/path')
  // Match href={`/${companySlug}/products`} -> href={getStoreUrl(companySlug, '/products')}
  // We can use a regex to match: \`/\$\{companySlug\}([^`]+)\`
  // The first capturing group is the rest of the path
  const regex1 = /\`\/\$\{companySlug\}([^`]+)\`/g;
  content = content.replace(regex1, (match, p1) => {
    return `getStoreUrl(companySlug, '${p1}')`
  });
  
  // Replace components/navbar.tsx logic: const basePath = companySlug ? `/${companySlug}` : ""
  // and components/product-card.tsx logic
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}
