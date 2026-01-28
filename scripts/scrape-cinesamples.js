/**
 * Scrape ALL Cinesamples products from Musio Marketplace
 * Uses the direct Cinesamples filter URL
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Direct URL with Cinesamples filter
const CINESAMPLES_URL = 'https://portal.musio.com/marketplace/?developers=Cinesamples';
const OUTPUT_DIR = path.join(__dirname, '..', 'images', 'products');
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Convert name to filename
function nameToFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '.png';
}

// Download image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(OUTPUT_DIR, filename);
    
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > 1000) { // Skip if exists and > 1KB
        console.log(`  ⏭️  ${filename} (exists)`);
        return resolve(filepath);
      }
    }
    
    const file = fs.createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : require('http');
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        return downloadImage(response.headers.location, filename).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        return reject(new Error(`HTTP ${response.statusCode}`));
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`  ✅ ${filename}`);
        resolve(filepath);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function scrapeAllCinesamples() {
  console.log('🚀 Scraping ALL Cinesamples products from Musio...\n');
  console.log(`📍 URL: ${CINESAMPLES_URL}\n`);
  
  ensureDir(OUTPUT_DIR);
  ensureDir(DATA_DIR);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set a longer timeout
    page.setDefaultNavigationTimeout(60000);
    
    console.log('📄 Loading Cinesamples marketplace page...');
    await page.goto(CINESAMPLES_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Wait for content to load
    await new Promise(r => setTimeout(r, 5000));
    
    // Scroll to load ALL products (handle lazy loading)
    console.log('📜 Scrolling to load all products...\n');
    
    // More aggressive scrolling to ensure all products load
    for (let i = 0; i < 40; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(r => setTimeout(r, 1500));
    }
    
    // Scroll back up slowly to trigger any lazy-loaded images
    for (let i = 0; i < 10; i++) {
      await page.evaluate((step) => window.scrollTo(0, document.body.scrollHeight * (1 - step/10)), i);
      await new Promise(r => setTimeout(r, 800));
    }
    
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('🔎 Extracting product data...\n');
    
    // Extract ALL product information from the page
    const products = await page.evaluate(() => {
      const results = [];
      
      // Find all images on the page with product info
      const allImages = document.querySelectorAll('img');
      
      allImages.forEach(img => {
        const src = img.src || img.dataset?.src;
        const alt = img.alt;
        
        // Skip non-product images (logos, icons, etc.)
        if (!src || !alt) return;
        if (src.includes('logo') || src.includes('icon')) return;
        if (!src.includes('assets.mus.io')) return;
        
        // Try to find price near the image
        let price = '';
        let parent = img.parentElement;
        for (let i = 0; i < 5 && parent; i++) {
          const priceEl = parent.querySelector('[class*="price"]');
          if (priceEl) {
            price = priceEl.textContent.trim();
            break;
          }
          parent = parent.parentElement;
        }
        
        // Try to find category/badge
        let category = '';
        parent = img.parentElement;
        for (let i = 0; i < 5 && parent; i++) {
          const badgeEl = parent.querySelector('[class*="badge"], [class*="category"]');
          if (badgeEl) {
            category = badgeEl.textContent.trim();
            break;
          }
          parent = parent.parentElement;
        }
        
        results.push({
          name: alt,
          imageUrl: src,
          price: price,
          category: category
        });
      });
      
      return results;
    });
    
    // Also get raw image data as backup
    const allImageData = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight
      })).filter(img => img.src && img.src.includes('assets.mus.io'));
    });
    
    // Get page HTML for debugging
    const pageContent = await page.content();
    fs.writeFileSync(path.join(DATA_DIR, 'page-content.html'), pageContent);
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(DATA_DIR, 'cinesamples-full.png'), 
      fullPage: true 
    });
    console.log(`📷 Screenshot saved\n`);
    
    // Deduplicate products by name
    const uniqueProducts = [];
    const seenNames = new Set();
    
    for (const product of products) {
      if (!seenNames.has(product.name) && product.name) {
        seenNames.add(product.name);
        uniqueProducts.push(product);
      }
    }
    
    // Also add any from allImageData that we missed
    for (const img of allImageData) {
      if (img.alt && !seenNames.has(img.alt)) {
        seenNames.add(img.alt);
        uniqueProducts.push({
          name: img.alt,
          imageUrl: img.src,
          price: '',
          category: ''
        });
      }
    }
    
    console.log(`📊 Found ${uniqueProducts.length} unique Cinesamples products:\n`);
    uniqueProducts.forEach((p, i) => console.log(`   ${i + 1}. ${p.name}`));
    
    // Save raw data
    fs.writeFileSync(
      path.join(DATA_DIR, 'cinesamples-products-raw.json'), 
      JSON.stringify({ products: uniqueProducts, allImages: allImageData }, null, 2)
    );
    
    // Download all images
    console.log('\n📥 Downloading product images...\n');
    
    const downloadedProducts = [];
    
    for (const product of uniqueProducts) {
      if (product.imageUrl) {
        try {
          const filename = nameToFilename(product.name);
          await downloadImage(product.imageUrl, filename);
          downloadedProducts.push({
            ...product,
            localImage: `images/products/${filename}`,
            filename
          });
        } catch (err) {
          console.log(`  ❌ Failed: ${product.name} - ${err.message}`);
        }
      }
    }
    
    // Save final product list
    fs.writeFileSync(
      path.join(DATA_DIR, 'cinesamples-final.json'),
      JSON.stringify(downloadedProducts, null, 2)
    );
    
    console.log(`\n💾 Saved ${downloadedProducts.length} products\n`);
    
    return downloadedProducts;
    
  } finally {
    await browser.close();
  }
}

// Run
scrapeAllCinesamples()
  .then(products => {
    console.log(`\n🎉 Successfully scraped ${products.length} Cinesamples products!`);
    console.log('\nProducts:');
    products.forEach(p => console.log(`  - ${p.name}`));
  })
  .catch(err => {
    console.error('💥 Error:', err);
    process.exit(1);
  });
