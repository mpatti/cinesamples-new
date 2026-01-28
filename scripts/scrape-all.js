/**
 * Complete Cinesamples Scraper - extracts ALL product data
 * Uses multiple extraction methods to ensure nothing is missed
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const CINESAMPLES_URL = 'https://portal.musio.com/marketplace/?developers=Cinesamples';
const OUTPUT_DIR = path.join(__dirname, '..', 'images', 'products');
const DATA_DIR = path.join(__dirname, '..', 'data');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function nameToFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.png';
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(OUTPUT_DIR, filename);
    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 1000) {
      console.log(`  ⏭️  ${filename}`);
      return resolve(filepath);
    }
    
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(filepath); } catch(e) {}
        return downloadImage(res.headers.location, filename).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(filepath); } catch(e) {}
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log(`  ✅ ${filename}`); resolve(filepath); });
    }).on('error', (err) => { file.close(); try { fs.unlinkSync(filepath); } catch(e) {} reject(err); });
  });
}

async function scrape() {
  console.log('🚀 Complete Cinesamples Scraper\n');
  console.log(`📍 ${CINESAMPLES_URL}\n`);
  
  ensureDir(OUTPUT_DIR);
  ensureDir(DATA_DIR);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 4000 }); // Tall viewport
    page.setDefaultNavigationTimeout(60000);
    
    console.log('📄 Loading page...');
    await page.goto(CINESAMPLES_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));
    
    // Aggressive scrolling
    console.log('📜 Scrolling to load all products...');
    for (let i = 0; i < 30; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(r => setTimeout(r, 1000));
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 2000));
    
    // Take a full page screenshot
    await page.screenshot({ path: path.join(DATA_DIR, 'full-page.png'), fullPage: true });
    console.log('📷 Screenshot saved\n');
    
    // Extract ALL data using multiple methods
    console.log('🔎 Extracting product data...\n');
    
    const data = await page.evaluate(() => {
      const products = [];
      const seen = new Set();
      
      // Method 1: Find all product cards by common patterns
      const cards = document.querySelectorAll('[class*="card"], [class*="product"], [class*="item"]');
      
      cards.forEach(card => {
        // Look for product name in various elements
        const nameEl = card.querySelector('h1, h2, h3, h4, h5, [class*="name"], [class*="title"]');
        const imgEl = card.querySelector('img');
        const priceEl = card.querySelector('[class*="price"]');
        
        if (nameEl && imgEl) {
          const name = nameEl.textContent.trim();
          const img = imgEl.src || imgEl.dataset.src;
          
          if (name && img && img.includes('assets.mus.io') && !seen.has(name)) {
            seen.add(name);
            products.push({
              name,
              imageUrl: img,
              price: priceEl ? priceEl.textContent.trim() : ''
            });
          }
        }
      });
      
      // Method 2: Get ALL images with asset URLs and try to find nearby text
      document.querySelectorAll('img').forEach(img => {
        const src = img.src;
        if (!src || !src.includes('assets.mus.io')) return;
        
        // Try alt text first
        if (img.alt && !seen.has(img.alt)) {
          seen.add(img.alt);
          products.push({ name: img.alt, imageUrl: src, price: '' });
          return;
        }
        
        // Try to find text near the image
        let parent = img.parentElement;
        for (let i = 0; i < 8 && parent; i++) {
          const textEls = parent.querySelectorAll('h1, h2, h3, h4, h5, span, p, div');
          for (const el of textEls) {
            const text = el.textContent.trim();
            // Look for product-like names
            if (text && text.length > 2 && text.length < 50 && 
                !text.includes('$') && !text.includes('Add') && 
                !text.includes('Cart') && !seen.has(text)) {
              // Check if it looks like a product name
              if (/^[A-Z]/.test(text) || text.includes('Cine') || text.includes('-')) {
                seen.add(text);
                products.push({ name: text, imageUrl: src, price: '' });
                return;
              }
            }
          }
          parent = parent.parentElement;
        }
      });
      
      // Method 3: Look for any text that matches Cinesamples product patterns
      const allText = document.body.innerText;
      const patterns = [
        /Cine\w+\s*[-–]\s*\w+/g,
        /Cine\w+\s+\w+/g,
        /(?:TR|CR|TB|SK|DMX)-?\d*/gi,
      ];
      
      patterns.forEach(pattern => {
        const matches = allText.match(pattern) || [];
        matches.forEach(match => {
          const name = match.trim();
          if (!seen.has(name) && name.length > 2) {
            seen.add(name);
            // Try to find matching image
            const imgs = Array.from(document.querySelectorAll('img'));
            const nearbyImg = imgs.find(img => {
              if (!img.src.includes('assets.mus.io')) return false;
              const rect = img.getBoundingClientRect();
              return rect.width > 50 && rect.height > 50;
            });
            if (nearbyImg) {
              products.push({ name, imageUrl: nearbyImg.src, price: '' });
            }
          }
        });
      });
      
      return { products, totalImages: document.querySelectorAll('img[src*="assets.mus.io"]').length };
    });
    
    // Also get all unique image URLs
    const allImageUrls = await page.evaluate(() => {
      return [...new Set(
        Array.from(document.querySelectorAll('img'))
          .map(img => img.src)
          .filter(src => src && src.includes('assets.mus.io'))
      )];
    });
    
    console.log(`📊 Found ${data.products.length} products`);
    console.log(`📸 Found ${allImageUrls.length} unique product images\n`);
    
    // Save all data
    fs.writeFileSync(path.join(DATA_DIR, 'all-images.json'), JSON.stringify(allImageUrls, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'extracted-products.json'), JSON.stringify(data.products, null, 2));
    
    // List all products found
    console.log('Products found:');
    data.products.forEach((p, i) => console.log(`  ${i+1}. ${p.name}`));
    
    // Download all images
    console.log('\n📥 Downloading images...\n');
    
    const downloaded = [];
    for (const product of data.products) {
      if (product.imageUrl) {
        try {
          const filename = nameToFilename(product.name);
          await downloadImage(product.imageUrl, filename);
          downloaded.push({ ...product, localImage: `images/products/${filename}`, filename });
        } catch (err) {
          console.log(`  ❌ ${product.name}: ${err.message}`);
        }
      }
    }
    
    // Also download any images we might have missed
    console.log('\n📥 Downloading remaining images...\n');
    let imgCount = 0;
    for (const url of allImageUrls) {
      const existing = downloaded.find(p => p.imageUrl === url);
      if (!existing) {
        imgCount++;
        const filename = `unknown-product-${imgCount}.png`;
        try {
          await downloadImage(url, filename);
        } catch (err) {
          // Ignore
        }
      }
    }
    
    fs.writeFileSync(path.join(DATA_DIR, 'final-products.json'), JSON.stringify(downloaded, null, 2));
    
    console.log(`\n💾 Saved ${downloaded.length} products\n`);
    return downloaded;
    
  } finally {
    await browser.close();
  }
}

scrape()
  .then(products => console.log(`\n🎉 Done! ${products.length} products`))
  .catch(err => { console.error('💥', err); process.exit(1); });
