/**
 * Download Cinesamples product images from Musio marketplace
 * Uses the scraped data to download and organize images
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_FILE = path.join(__dirname, '..', 'data', 'raw-scrape.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'images', 'products');
const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'cinesamples-products.json');

// Known Cinesamples products (by alt text patterns)
const CINESAMPLES_PATTERNS = [
  /^cine/i,
  /tina guo/i,
  /apocalyptica/i,
  /taylor davis/i,
  /randy kerber/i,
  /gina luciani/i,
  /voxos/i,
  /voces8/i,
  /viola da gamba/i,
  /men of the north/i,
  /women of the north/i,
  /hollywoodwinds/i,
  /south african.*choir/i,
  /iceland/i,
  /ireland/i,
  /scotland/i,
  /south africa$/i,
  /colors$/i,
  /quatre/i,
];

// Convert product name to filename
function nameToFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '.png';
}

// Download an image from URL
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(OUTPUT_DIR, filename);
    
    // Skip if already exists
    if (fs.existsSync(filepath)) {
      console.log(`  ⏭️  Skipping ${filename} (already exists)`);
      return resolve(filepath);
    }
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        downloadImage(response.headers.location, filename)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`  ✅ Downloaded ${filename}`);
        resolve(filepath);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

// Check if image is likely a Cinesamples product
function isCinesamplesProduct(alt) {
  if (!alt) return false;
  return CINESAMPLES_PATTERNS.some(pattern => pattern.test(alt));
}

async function main() {
  console.log('🚀 Downloading Cinesamples product images from Musio...\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Load scraped data
  const rawData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const allImages = rawData.allImages;
  
  console.log(`📊 Found ${allImages.length} total images\n`);
  
  // Filter Cinesamples products
  const cinesamplesImages = allImages.filter(img => img.alt && isCinesamplesProduct(img.alt));
  
  console.log(`🎯 Identified ${cinesamplesImages.length} Cinesamples products:\n`);
  cinesamplesImages.forEach(img => console.log(`   - ${img.alt}`));
  console.log('');
  
  // Download images
  const products = [];
  
  for (const img of cinesamplesImages) {
    const filename = nameToFilename(img.alt);
    try {
      await downloadImage(img.src, filename);
      products.push({
        name: img.alt,
        imageUrl: img.src,
        localImage: `images/products/${filename}`,
        filename: filename
      });
    } catch (err) {
      console.log(`  ❌ Failed: ${img.alt} - ${err.message}`);
    }
  }
  
  // Save product list
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  console.log(`\n💾 Saved ${products.length} products to ${PRODUCTS_FILE}`);
  
  // Generate HTML snippet
  console.log('\n📝 Generating HTML snippet...\n');
  
  let html = '<!-- Cinesamples Products from Musio Marketplace -->\n\n';
  
  products.forEach(product => {
    html += `<div class="product-card" data-category="cinesamples">
    <div class="product-image">
        <img src="${product.localImage}" alt="${product.name}">
        <div class="product-badge">Cinesamples</div>
    </div>
    <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <a href="https://portal.musio.com/marketplace" target="_blank" class="btn btn-primary btn-block">Shop</a>
    </div>
</div>\n\n`;
  });
  
  const htmlPath = path.join(__dirname, '..', 'data', 'cinesamples-cards.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`📄 HTML snippet saved to ${htmlPath}`);
  
  console.log('\n✨ Done!\n');
  
  return products;
}

main()
  .then(products => {
    console.log(`🎉 Successfully downloaded ${products.length} Cinesamples product images!`);
  })
  .catch(err => {
    console.error('💥 Error:', err);
    process.exit(1);
  });
