const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeMusioprices() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('Navigating to Musio marketplace...');
  await page.goto('https://portal.musio.com/marketplace/?developers=Cinesamples', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  
  // Wait for products to load
  console.log('Waiting for products to load...');
  await page.waitForSelector('[class*="product"], [class*="card"], [class*="item"]', { timeout: 30000 }).catch(() => {});
  
  // Scroll to load all products (lazy loading)
  console.log('Scrolling to load all products...');
  let previousHeight = 0;
  let scrollAttempts = 0;
  const maxScrollAttempts = 30;
  
  while (scrollAttempts < maxScrollAttempts) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 1000));
    
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === previousHeight) {
      // Try a few more times to be sure
      scrollAttempts++;
      if (scrollAttempts > 5) break;
    } else {
      scrollAttempts = 0;
    }
    previousHeight = currentHeight;
  }
  
  // Wait a bit more for any final loading
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Extracting product data...');
  
  // Extract all products with prices
  const products = await page.evaluate(() => {
    const results = [];
    
    // Try multiple selectors for product cards
    const selectors = [
      '[class*="ProductCard"]',
      '[class*="product-card"]', 
      '[class*="InstrumentCard"]',
      '[class*="instrument-card"]',
      '[class*="marketplace"] [class*="card"]',
      'a[href*="/marketplace/"]'
    ];
    
    let cards = [];
    for (const selector of selectors) {
      const found = document.querySelectorAll(selector);
      if (found.length > cards.length) {
        cards = found;
      }
    }
    
    console.log(`Found ${cards.length} cards`);
    
    cards.forEach(card => {
      // Get product name
      let name = '';
      const nameEl = card.querySelector('h2, h3, h4, [class*="title"], [class*="name"], [class*="Title"], [class*="Name"]');
      if (nameEl) {
        name = nameEl.textContent.trim();
      }
      
      // Get price - look for dollar amounts
      let price = '';
      const pricePatterns = [
        /\$(\d+(?:\.\d{2})?)/,
        /(\d+(?:\.\d{2})?)\s*(?:USD|usd)/
      ];
      
      const cardText = card.textContent;
      for (const pattern of pricePatterns) {
        const match = cardText.match(pattern);
        if (match) {
          price = match[1];
          break;
        }
      }
      
      // Also try specific price elements
      if (!price) {
        const priceEl = card.querySelector('[class*="price"], [class*="Price"], [class*="cost"], [class*="Cost"]');
        if (priceEl) {
          const priceMatch = priceEl.textContent.match(/\$?(\d+(?:\.\d{2})?)/);
          if (priceMatch) {
            price = priceMatch[1];
          }
        }
      }
      
      if (name && name.length > 0) {
        results.push({ name, price: price || 'N/A' });
      }
    });
    
    return results;
  });
  
  console.log(`Found ${products.length} products`);
  
  // If we didn't get many products, try alternative extraction
  if (products.length < 20) {
    console.log('Trying alternative extraction method...');
    
    const altProducts = await page.evaluate(() => {
      const results = [];
      
      // Get all text nodes that might contain prices
      const allElements = document.querySelectorAll('*');
      const seen = new Set();
      
      allElements.forEach(el => {
        const text = el.textContent;
        // Look for patterns like "ProductName $XX" or "$XX ProductName"
        const priceMatch = text.match(/\$(\d+)/);
        if (priceMatch && text.length < 200) {
          const cleanText = text.replace(/\s+/g, ' ').trim();
          if (!seen.has(cleanText) && cleanText.length > 3) {
            seen.add(cleanText);
            
            // Try to extract name and price
            const dollarIdx = cleanText.indexOf('$');
            let name = cleanText.substring(0, dollarIdx).trim();
            let price = priceMatch[1];
            
            if (name.length > 2 && name.length < 100) {
              results.push({ name, price });
            }
          }
        }
      });
      
      return results;
    });
    
    if (altProducts.length > products.length) {
      products.push(...altProducts);
    }
  }
  
  // Take a screenshot for debugging
  await page.screenshot({ path: path.join(__dirname, '..', 'debug-musio.png'), fullPage: true });
  console.log('Saved debug screenshot to debug-musio.png');
  
  // Also get the page HTML for debugging
  const html = await page.content();
  fs.writeFileSync(path.join(__dirname, '..', 'debug-musio.html'), html);
  console.log('Saved debug HTML to debug-musio.html');
  
  await browser.close();
  
  // Save results
  const outputPath = path.join(__dirname, '..', 'data', 'musio-prices.json');
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
  console.log(`Saved ${products.length} products to ${outputPath}`);
  
  // Print results
  console.log('\nProducts found:');
  products.forEach(p => console.log(`  ${p.name}: $${p.price}`));
  
  return products;
}

scrapeMusioprices().catch(console.error);
