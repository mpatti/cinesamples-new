const fs = require('fs');
const path = require('path');

// Load the scraped prices
const musioPrices = require('../data/musio-prices.json');

// Create a price lookup map with clean product names
const PRICES = {};

musioPrices.forEach(item => {
  // The name has the subtitle concatenated, need to extract the product name
  // Examples: "CineStrings CoreOrchestral Strings" -> "CineStrings Core"
  //           "Apocalyptica - Dark CelloDark Solo Cellos" -> "Apocalyptica - Dark Cello"
  
  let name = item.name;
  
  // Known patterns to split on (subtitle starts)
  const subtitleStarts = [
    'Orchestral Strings', 'Orchestral Brass', 'Orchestral Woodwind', 'Orchestral Harp',
    'Orchestral Harpsichord', 'Orchestral Percussion', 'Orchestral Ensembles',
    'Orchestral Chords', 'Orchestral Horns', 'Orchestral Woodwinds',
    'Solo Strings', 'Solo Violin', 'Solo Cello',
    'Dark Solo', 'Emotional Cello', 'Raw Distorted', 'Seamless Legato',
    'Deep Orchestral', 'Low Pitched', 'Trumpet And Horn',
    'Auxiliary Percussion', 'Epic Percussion', 'Metal Percussion',
    'Tonal Percussion', 'Wood Percussion', 'World Percussion',
    'A Punchy Score', 'Heavy Cinematic', 'Epic Cinematic', 'Modern Cinematic',
    'Cinematic Piano', 'Magical Keyboard', 'Prepared Piano',
    'Vocal Ensemble', 'Nordic Male', 'Icelandic Female', 'The voices',
    'Elegant Modern', 'Norwegian Resonant', 'Baroque 6-String',
    'String Foundations', 'Full spectrum', 'Impacts, Hits',
    'Essential Jazz', 'Modern Rock', 'Essential Grand',
    'Classic Electric', 'Vintage Amped', 'Wurlitzer',
    'Found Sounds', 'Tonal And Atonal', 'Steel String',
    'Traditional Icelandic', 'Traditional Irish', 'Traditional Scottish', 
    'Traditional South African', 'Vintage Drum', 'Vintage Synthesizer',
    'Analog Synth', 'Leads, Pads', 'An Expansive', 'Dulcimer',
    'Voxos'  // Special case where name == subtitle
  ];
  
  for (const subtitle of subtitleStarts) {
    const idx = name.indexOf(subtitle);
    if (idx > 0) {
      name = name.substring(0, idx).trim();
      break;
    }
  }
  
  // Store with both full match and partial matches
  PRICES[name] = parseInt(item.price, 10);
  
  // Also store lowercase version for fuzzy matching
  PRICES[name.toLowerCase()] = parseInt(item.price, 10);
});

// Add additional mappings for display names that might differ
const NAME_ALIASES = {
  'CineStrings Solo': 'CineStrings - Solo',
  'CineBrass Core': 'CineBrass - Core',
  'CineBrass Pro': 'CineBrass - Pro',
  'CineBrass Sonore': 'CineBrass - Sonore',
  'CineBrass Descant Horn': 'CineBrass - Descant Horn',
  'CineBrass Deep Horns': 'CineBrass - Deep Horns',
  'CineBrass Low Brass': 'CineBrass - Low Brass',
  'CineWinds Core': 'CineWinds - Core',
  'CineWinds Pro': 'CineWinds - Pro',
  'CineWinds Low Winds': 'CineWinds - Low Winds',
  'CinePerc Orchestral': 'CinePerc - Orchestral',
  'CinePerc Epic': 'CinePerc - Epic',
  'CinePerc Aux': 'CinePerc - Aux',
  'CinePerc Tonal': 'CinePerc - Tonal',
  'CinePerc Metal': 'CinePerc - Metal',
  'CinePerc Wood': 'CinePerc - Wood',
  'CinePerc World': 'CinePerc - World',
  'CinePerc Drum Kit': 'CinePerc - Drum Kit',
  'Industry Brass Core': 'Industry Brass - Core',
  'Industry Brass Pro': 'Industry Brass - Pro',
  'Session Piano Grand': 'Session Piano - Grand',
  'Sketchpad Monochrome': 'Sketchpad: Monochrome',
  'Rhodes 73': 'Rhodes 73 EP',
  'Gina Luciani Cinema Flutes': 'Gina Luciani - Cinema Flutes',
  'Apocalyptica Dark Cello': 'Apocalyptica - Dark Cello',
  'Randy Kerber Celeste': 'Randy Kerber - Celeste',
  'Randy Kerber Prepared Piano': 'Randy Kerber - Prepared Piano',
  'Taylor Davis Violin': 'Taylor Davis - Violin',
  'Tina Guo Acoustic Cello': 'Tina Guo - Acoustic Cello',
  'Tina Guo Electric Cello': 'Tina Guo - Electric Cello',
  'Tina Guo Solo Cello': 'Tina Guo - Solo Cello',
  'Vision Modern Synths': 'Vision - Modern Synths',
};

// Copy prices to aliases
Object.entries(NAME_ALIASES).forEach(([alias, original]) => {
  if (PRICES[original]) {
    PRICES[alias] = PRICES[original];
  }
});

function getPrice(productName) {
  // Direct match
  if (PRICES[productName]) return PRICES[productName];
  
  // Lowercase match
  if (PRICES[productName.toLowerCase()]) return PRICES[productName.toLowerCase()];
  
  // Try without dashes
  const noDash = productName.replace(' - ', ' ');
  if (PRICES[noDash]) return PRICES[noDash];
  
  // Try with dashes
  const withDash = productName.replace(/(\w+)\s+(\w+)$/, '$1 - $2');
  if (PRICES[withDash]) return PRICES[withDash];
  
  // Fuzzy match - check if any key contains or is contained by the name
  for (const [key, price] of Object.entries(PRICES)) {
    if (typeof key === 'string') {
      const keyClean = key.toLowerCase().replace(/\s+/g, '');
      const nameClean = productName.toLowerCase().replace(/\s+/g, '');
      if (keyClean.includes(nameClean) || nameClean.includes(keyClean)) {
        return price;
      }
    }
  }
  
  console.log(`  WARNING: No price found for "${productName}"`);
  return 49; // Default fallback
}

console.log('Price lookup table:');
Object.entries(PRICES).slice(0, 20).forEach(([k, v]) => console.log(`  ${k}: $${v}`));
console.log('  ...');

// ============================================
// Update products.html
// ============================================
console.log('\nUpdating products.html...');
const productsPath = path.join(__dirname, '..', 'products.html');
let productsHtml = fs.readFileSync(productsPath, 'utf8');

// Pattern: Buy $XXX button
const buyBtnPattern = /<a href="([^"]+)" target="_blank" class="btn btn-primary btn-sm">Buy \$\d+<\/a>/g;
let productsCount = 0;

productsHtml = productsHtml.replace(buyBtnPattern, (match, url) => {
  // Extract product name from URL search param
  const searchMatch = url.match(/search=([^&"]+)/);
  if (searchMatch) {
    const productName = decodeURIComponent(searchMatch[1]);
    const price = getPrice(productName);
    productsCount++;
    return `<a href="${url}" target="_blank" class="btn btn-primary btn-sm">Buy $${price}</a>`;
  }
  return match;
});

fs.writeFileSync(productsPath, productsHtml);
console.log(`Updated ${productsCount} product cards in products.html`);

// ============================================
// Update individual product pages
// ============================================
console.log('\nUpdating individual product pages...');
const productsDir = path.join(__dirname, '..', 'products');
const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.html'));

let pagesCount = 0;
for (const file of files) {
  const filePath = path.join(productsDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Extract product name from h1
  const titleMatch = html.match(/<h1>([^<]+)<\/h1>/);
  if (!titleMatch) continue;
  
  const productName = titleMatch[1];
  const price = getPrice(productName);
  
  // Update price display
  const pricePattern = /<div class="product-price">\$\d+<\/div>/;
  if (pricePattern.test(html)) {
    html = html.replace(pricePattern, `<div class="product-price">$${price}</div>`);
    fs.writeFileSync(filePath, html);
    pagesCount++;
  }
}

console.log(`Updated ${pagesCount} individual product pages`);
console.log('\nDone!');
