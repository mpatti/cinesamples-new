const fs = require('fs');
const path = require('path');

// Map product names to their slug
function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s*-\s*/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const productsPath = path.join(__dirname, '..', 'products.html');
let html = fs.readFileSync(productsPath, 'utf8');

// Find all product cards and replace Coming Soon with View Details links
const productTitleRegex = /<h3 class="product-title">([^<]+)<\/h3><span class="btn btn-secondary btn-block coming-soon">Coming Soon<\/span>/g;

let match;
let replacements = [];
while ((match = productTitleRegex.exec(html)) !== null) {
  const name = match[1];
  const slug = nameToSlug(name);
  replacements.push({
    original: match[0],
    replacement: `<h3 class="product-title">${name}</h3><a href="/products/${slug}.html" class="btn btn-primary btn-block">View Details</a>`
  });
}

console.log(`Found ${replacements.length} products to update`);

for (const r of replacements) {
  html = html.replace(r.original, r.replacement);
}

fs.writeFileSync(productsPath, html);
console.log('Updated products.html with product page links');
