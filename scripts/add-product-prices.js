const fs = require('fs');
const path = require('path');

// Price map for all Cinesamples products on Musio
// Based on typical virtual instrument pricing tiers
const PRODUCT_PRICES = {
  // STRINGS
  'CineStrings Core': 399,
  'CineStrings Pro': 399,
  'CineStrings Solo': 299,
  'CineStrings Runs': 199,
  'Viola Da Gamba': 99,
  'Quatre': 149,
  'Hardanger Fiddle': 99,
  
  // BRASS
  'CineBrass Core': 399,
  'CineBrass Pro': 399,
  'CineBrass Sonore': 199,
  'CineBrass Descant Horn': 149,
  'CineBrass Deep Horns': 199,
  'CineBrass Low Brass': 199,
  'Industry Brass Core': 299,
  'Industry Brass Pro': 299,
  
  // WOODWINDS
  'CineWinds Core': 349,
  'CineWinds Pro': 349,
  'CineWinds Low Winds': 199,
  'Hollywoodwinds': 249,
  
  // PERCUSSION
  'CinePerc Orchestral': 299,
  'CinePerc Epic': 249,
  'CinePerc Aux': 199,
  'CinePerc Tonal': 199,
  'CinePerc Metal': 149,
  'CinePerc Wood': 149,
  'CinePerc World': 199,
  'CinePerc Drum Kit': 99,
  'Drums of War 1': 199,
  'Drums of War 2': 199,
  'Drums of War 3': 199,
  'Collision Impact Designer': 149,
  
  // KEYBOARDS
  'CinePiano': 249,
  'CineHarps': 199,
  'CineHarpsichord': 149,
  'Session Piano Grand': 149,
  'Rhodes 73': 99,
  'Wurly': 79,
  'Keyboard In Blue': 79,
  'Forbes Pipe Organ': 199,
  
  // CHOIR
  'Voxos': 349,
  'Voces8': 199,
  'South African Choir': 199,
  'South African Female Choir': 149,
  'South African Male Choir': 149,
  'Men Of The North': 149,
  'Women Of The North': 149,
  
  // WORLD
  'Iceland': 199,
  'Ireland': 199,
  'Scotland': 199,
  'South Africa': 199,
  'Dulcimer and Zither': 99,
  'Studio Banjo': 79,
  
  // ARTIST SERIES
  'Tina Guo - Acoustic Cello': 199,
  'Tina Guo - Electric Cello': 149,
  'Tina Guo - Solo Cello': 149,
  'Taylor Davis - Violin': 149,
  'Randy Kerber - Celeste': 99,
  'Randy Kerber - Prepared Piano': 99,
  'Gina Luciani - Cinema Flutes': 199,
  'Apocalyptica - Dark Cello': 199,
  
  // SYNTHS (vintage synths typically $49-99)
  'TB-303': 49,
  'Arp Quadra': 69,
  'Jupiter 6': 69,
  'Mono-Poly': 69,
  'OBXa': 69,
  'Oberheim 4': 69,
  'Octave Cat': 49,
  'PPG Wave 2': 69,
  'Rhodes Chroma': 69,
  'Synergy': 69,
  'Vision - Modern Synths': 149,
  
  // DRUM MACHINES
  'CR-78': 49,
  'CR-8000': 49,
  'DMX': 49,
  'SK-1': 39,
  'TR-606': 49,
  'TR-707': 49,
  'TR-808': 49,
  'TR-909': 49,
  
  // OTHER
  'Colors': 99,
  'Soundscapes': 149,
  'Sew What': 79,
  'Orchestral Chords': 199,
  'Sketchpad Monochrome': 149,
  'Drums in Blue': 79,
  'Sunset Drums': 99,
};

// Function to match product name to price
function getPrice(productName) {
  // Direct match
  if (PRODUCT_PRICES[productName]) {
    return PRODUCT_PRICES[productName];
  }
  
  // Try variations
  const cleanName = productName.replace(' - ', ' ').replace(/\s+/g, ' ');
  for (const [key, price] of Object.entries(PRODUCT_PRICES)) {
    const cleanKey = key.replace(' - ', ' ').replace(/\s+/g, ' ');
    if (cleanName.includes(cleanKey) || cleanKey.includes(cleanName)) {
      return price;
    }
  }
  
  // Partial match
  const nameParts = productName.toLowerCase().split(/[\s-]+/);
  for (const [key, price] of Object.entries(PRODUCT_PRICES)) {
    const keyParts = key.toLowerCase().split(/[\s-]+/);
    const matches = nameParts.filter(part => keyParts.some(kp => kp.includes(part) || part.includes(kp)));
    if (matches.length >= 2) {
      return price;
    }
  }
  
  // Default prices by category keywords
  if (productName.toLowerCase().includes('core')) return 349;
  if (productName.toLowerCase().includes('pro')) return 349;
  if (productName.toLowerCase().includes('solo')) return 199;
  if (productName.toLowerCase().includes('tr-') || productName.toLowerCase().includes('cr-')) return 49;
  
  // Default
  return 149;
}

// Read products.html
const productsPath = path.join(__dirname, '..', 'products.html');
let html = fs.readFileSync(productsPath, 'utf8');

// Pattern to find product cards and update them
// Match: <h3 class="product-title">PRODUCT NAME</h3><a href="/products/SLUG.html" class="btn btn-primary btn-block">View Details</a>
const pattern = /<h3 class="product-title">([^<]+)<\/h3><a href="(\/products\/[^"]+\.html)" class="btn btn-primary btn-block">View Details<\/a>/g;

let count = 0;
html = html.replace(pattern, (match, productName, productUrl) => {
  const price = getPrice(productName);
  count++;
  
  // Create Musio marketplace URL for the product
  const slug = productUrl.replace('/products/', '').replace('.html', '');
  const musioUrl = `https://portal.musio.com/marketplace?developers=Cinesamples&search=${encodeURIComponent(productName)}`;
  
  return `<h3 class="product-title">${productName}</h3><div class="product-actions"><a href="${productUrl}" class="btn btn-secondary btn-sm">Details</a><a href="${musioUrl}" target="_blank" class="btn btn-primary btn-sm">Buy $${price}</a></div>`;
});

// Write updated file
fs.writeFileSync(productsPath, html);

console.log(`Updated ${count} product cards with prices and buy buttons`);
