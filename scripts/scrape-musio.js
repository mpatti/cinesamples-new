/**
 * Musio Marketplace Scraper for Cinesamples Products
 * 
 * This script:
 * 1. Opens the Musio marketplace in a headless browser
 * 2. Filters by Cinesamples developer
 * 3. Scrolls to load all products
 * 4. Extracts product data (name, price, category, image URL)
 * 5. Downloads all product images
 * 6. Outputs a JSON file and generates HTML for the products page
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const MARKETPLACE_URL = 'https://portal.musio.com/marketplace';
const OUTPUT_DIR = path.join(__dirname, '..', 'images', 'products');
const DATA_FILE = path.join(__dirname, '..', 'data', 'products.json');

// Ensure output directories exist
function ensureDirectories() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
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
    
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filename)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
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
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

// Convert product name to filename
function nameToFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '.jpg';
}

// Main scraper function
async function scrapeCinesamples() {
  console.log('🚀 Starting Musio Marketplace Scraper for Cinesamples...\n');
  
  ensureDirectories();
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📄 Loading Musio Marketplace...');
    await page.goto(MARKETPLACE_URL, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Give the SPA time to initialize
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('🔍 Looking for Cinesamples filter...');
    
    // Try to find and click the Cinesamples developer filter
    // The selector might vary - we'll try a few approaches
    const cinesamplesClicked = await page.evaluate(() => {
      // Look for Cinesamples in the developer section
      const links = Array.from(document.querySelectorAll('a, button, div, span'));
      for (const el of links) {
        if (el.textContent.trim() === 'Cinesamples') {
          el.click();
          return true;
        }
      }
      return false;
    });
    
    if (cinesamplesClicked) {
      console.log('✅ Clicked Cinesamples filter');
      await new Promise(r => setTimeout(r, 3000)); // Wait for filter to apply
    } else {
      console.log('⚠️  Could not find Cinesamples filter, scraping all products...');
    }
    
    // Scroll to load all products (infinite scroll handling)
    console.log('📜 Scrolling to load all products...');
    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 20;
    
    while (scrollAttempts < maxScrollAttempts) {
      const currentHeight = await page.evaluate(() => document.body.scrollHeight);
      
      if (currentHeight === previousHeight) {
        scrollAttempts++;
        if (scrollAttempts >= 3) break; // Stop after 3 attempts with no new content
      } else {
        scrollAttempts = 0;
      }
      
      previousHeight = currentHeight;
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(r => setTimeout(r, 1500));
    }
    
    console.log('🔎 Extracting product data...');
    
    // Extract product information
    const products = await page.evaluate(() => {
      const productCards = document.querySelectorAll('[class*="product"], [class*="card"], [class*="item"]');
      const results = [];
      
      productCards.forEach(card => {
        // Try to find product info within each card
        const nameEl = card.querySelector('h3, h4, [class*="title"], [class*="name"]');
        const priceEl = card.querySelector('[class*="price"]');
        const imgEl = card.querySelector('img');
        const categoryEl = card.querySelector('[class*="category"], [class*="badge"]');
        
        if (nameEl && imgEl) {
          const name = nameEl.textContent.trim();
          // Filter for Cinesamples products (common naming patterns)
          const isCinesamples = 
            name.toLowerCase().includes('cine') ||
            name.toLowerCase().includes('tina guo') ||
            name.toLowerCase().includes('apocalyptica') ||
            name.toLowerCase().includes('taylor davis') ||
            name.toLowerCase().includes('randy kerber') ||
            name.toLowerCase().includes('gina luciani') ||
            name.toLowerCase().includes('voxos') ||
            name.toLowerCase().includes('industry') ||
            name.toLowerCase().includes('piano in blue') ||
            name.toLowerCase().includes('drums of war') ||
            name.toLowerCase().includes('collision') ||
            name.toLowerCase().includes('soundscapes') ||
            name.toLowerCase().includes('dulcimer') ||
            name.toLowerCase().includes('viola da gamba') ||
            name.toLowerCase().includes('pipe organ') ||
            name.toLowerCase().includes('men of the north') ||
            name.toLowerCase().includes('apocalypse');
          
          if (isCinesamples || !document.querySelector('[data-developer]')) {
            results.push({
              name: name,
              price: priceEl ? priceEl.textContent.trim() : 'N/A',
              imageUrl: imgEl.src || imgEl.dataset.src || '',
              category: categoryEl ? categoryEl.textContent.trim() : 'Unknown'
            });
          }
        }
      });
      
      return results;
    });
    
    // Also try a more generic approach for SPAs
    const allImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      return Array.from(imgs).map(img => ({
        src: img.src,
        alt: img.alt,
        parent: img.parentElement?.textContent?.substring(0, 200) || ''
      }));
    });
    
    console.log(`\n📊 Found ${products.length} potential Cinesamples products`);
    console.log(`📸 Found ${allImages.length} total images on page\n`);
    
    // Take a screenshot for debugging
    const screenshotPath = path.join(__dirname, '..', 'data', 'marketplace-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📷 Screenshot saved to ${screenshotPath}\n`);
    
    // Save raw data
    const rawDataPath = path.join(__dirname, '..', 'data', 'raw-scrape.json');
    fs.writeFileSync(rawDataPath, JSON.stringify({ products, allImages }, null, 2));
    console.log(`💾 Raw data saved to ${rawDataPath}\n`);
    
    // Download images
    if (products.length > 0) {
      console.log('📥 Downloading product images...\n');
      
      for (const product of products) {
        if (product.imageUrl && product.imageUrl.startsWith('http')) {
          try {
            const filename = nameToFilename(product.name);
            await downloadImage(product.imageUrl, filename);
            product.localImage = `images/products/${filename}`;
          } catch (err) {
            console.log(`  ❌ Failed to download image for ${product.name}: ${err.message}`);
          }
        }
      }
      
      // Save processed product data
      fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
      console.log(`\n💾 Product data saved to ${DATA_FILE}`);
    }
    
    // Generate HTML snippet
    if (products.length > 0) {
      console.log('\n📝 Generating HTML snippet...\n');
      
      let html = '<!-- Generated Product Cards -->\n';
      products.forEach(product => {
        html += `
<div class="product-card" data-category="${product.category.toLowerCase()}">
    <div class="product-image">
        <img src="${product.localImage || product.imageUrl}" alt="${product.name}">
        <div class="product-badge">${product.category}</div>
    </div>
    <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-meta">
            <span class="product-price">${product.price}</span>
        </div>
        <a href="https://portal.musio.com/marketplace" target="_blank" class="btn btn-primary btn-block">Shop</a>
    </div>
</div>
`;
      });
      
      const htmlPath = path.join(__dirname, '..', 'data', 'product-cards.html');
      fs.writeFileSync(htmlPath, html);
      console.log(`📄 HTML snippet saved to ${htmlPath}`);
    }
    
    console.log('\n✨ Scraping complete!\n');
    
    return products;
    
  } catch (error) {
    console.error('❌ Error during scraping:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeCinesamples()
  .then(products => {
    console.log(`\n🎉 Successfully processed ${products.length} products!`);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Scraper failed:', error);
    process.exit(1);
  });
