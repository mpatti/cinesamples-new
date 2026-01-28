/**
 * Generate a clean products.html from scraped data
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'final-products.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'products.html');
const IMAGES_DIR = path.join(__dirname, '..', 'images', 'products');

// Canonical product names
const PRODUCT_NAMES = {
  'apocalyptica - dark cello': 'Apocalyptica - Dark Cello',
  'gina luciani - cinema flutes': 'Gina Luciani - Cinema Flutes',
  'randy kerber - celeste': 'Randy Kerber - Celeste',
  'randy kerber - prepared piano': 'Randy Kerber - Prepared Piano',
  'taylor davis - violin': 'Taylor Davis - Violin',
  'tina guo - acoustic cello': 'Tina Guo - Acoustic Cello',
  'tina guo - electric cello': 'Tina Guo - Electric Cello',
  'tina guo - solo cello': 'Tina Guo - Solo Cello',
  'voces8': 'Voces8',
  'voxos': 'Voxos',
  'cinebrass - core': 'CineBrass - Core',
  'cinebrass - pro': 'CineBrass - Pro',
  'cinebrass - deep horns': 'CineBrass - Deep Horns',
  'cinebrass - descant horn': 'CineBrass - Descant Horn',
  'cinebrass - low brass': 'CineBrass - Low Brass',
  'cinebrass - sonore': 'CineBrass - Sonore',
  'cineharps': 'CineHarps',
  'cineharpsichord': 'CineHarpsichord',
  'cineperc - aux': 'CinePerc - Aux',
  'cineperc - drum kit': 'CinePerc - Drum Kit',
  'cineperc - epic': 'CinePerc - Epic',
  'cineperc - metal': 'CinePerc - Metal',
  'cineperc - orchestral': 'CinePerc - Orchestral',
  'cineperc - tonal': 'CinePerc - Tonal',
  'cineperc - wood': 'CinePerc - Wood',
  'cineperc - world': 'CinePerc - World',
  'cinepiano': 'CinePiano',
  'cinestrings core': 'CineStrings Core',
  'cinestrings pro': 'CineStrings Pro',
  'cinestrings runs': 'CineStrings Runs',
  'cinestrings - solo': 'CineStrings - Solo',
  'cinewinds - core': 'CineWinds - Core',
  'cinewinds - pro': 'CineWinds - Pro',
  'cinewinds - low winds': 'CineWinds - Low Winds',
  'collision impact designer': 'Collision Impact Designer',
  'colors': 'Colors',
  'drums in blue': 'Drums in Blue',
  'drums of war 1': 'Drums of War 1',
  'drums of war 2': 'Drums of War 2',
  'drums of war 3': 'Drums of War 3',
  'dulcimer and zither': 'Dulcimer and Zither',
  'forbes pipe organ': 'Forbes Pipe Organ',
  'hardanger fiddle': 'Hardanger Fiddle',
  'hollywoodwinds': 'Hollywoodwinds',
  'industry brass - core': 'Industry Brass - Core',
  'industry brass - pro': 'Industry Brass - Pro',
  'keyboard in blue': 'Keyboard In Blue',
  'men of the north': 'Men Of The North',
  'women of the north': 'Women Of The North',
  'orchestral chords': 'Orchestral Chords',
  'quatre': 'Quatre',
  'rhodes 73 ep': 'Rhodes 73 EP',
  'session piano - grand': 'Session Piano - Grand',
  'sew what': 'Sew What',
  'sketchpad: monochrome': 'Sketchpad: Monochrome',
  'soundscapes': 'Soundscapes',
  'south african female choir': 'South African Female Choir',
  'south african choir': 'South African Choir',
  'south african male choir': 'South African Male Choir',
  'studio banjo': 'Studio Banjo',
  'sunset drums': 'Sunset Drums',
  'viola da gamba': 'Viola Da Gamba',
  'iceland': 'Iceland',
  'ireland': 'Ireland',
  'scotland': 'Scotland',
  'south africa': 'South Africa',
  'wurly': 'Wurly',
  'vision - modern synths': 'Vision - Modern Synths',
  'cr-78': 'CR-78',
  'cr-8000': 'CR-8000',
  'dmx': 'DMX',
  'sk-1': 'SK-1',
  'tr-606': 'TR-606',
  'tr-707': 'TR-707',
  'tr-808': 'TR-808',
  'tr-909': 'TR-909',
  'tb-303': 'TB-303',
  'arp quadra': 'Arp Quadra',
  'jupiter 6': 'Jupiter 6',
  'mono-poly': 'Mono-Poly',
  'obxa': 'OBXa',
  'oberheim 4': 'Oberheim 4',
  'octave cat': 'Octave Cat',
  'ppg wave 2': 'PPG Wave 2',
  'rhodes chroma': 'Rhodes Chroma',
  'synergy': 'Synergy',
};

// Clean product name
function cleanName(name) {
  // First, remove any newlines and extra whitespace
  let clean = name.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Try to match to canonical name
  const lower = clean.toLowerCase();
  for (const [key, value] of Object.entries(PRODUCT_NAMES)) {
    if (lower.startsWith(key) || lower.includes(key)) {
      return value;
    }
  }
  
  // If no match, try cleaning manually
  clean = clean
    .replace(/Orchestral.*$/i, '')
    .replace(/Cinematic.*$/i, '')
    .replace(/Solo\s*Strings.*$/i, '')
    .replace(/Deep\s*Orchestral.*$/i, '')
    .replace(/Low\s*Pitched.*$/i, '')
    .replace(/(Heavy|Epic|Modern)\s*Cinematic.*$/i, '')
    .replace(/Voxos$/i, '')
    .trim();
  
  // Remove trailing descriptors
  clean = clean.replace(/\s+(Aux|Drum|Epic|Metal|Tonal|Wood|World|Core|Pro|Deep|Low|Descant)$/, '');
  
  return clean;
}

// Categorize products
function categorize(name) {
  const n = name.toLowerCase();
  if (n.includes('cinestrings') || n.includes('viola') || n.includes('quatre') || n.includes('fiddle')) return 'strings';
  if (n.includes('cinebrass') || n.includes('industry brass')) return 'brass';
  if (n.includes('cinewinds') || n.includes('hollywoodwinds') || n.includes('flute')) return 'woodwinds';
  if (n.includes('cineperc') || n.includes('drums of war') || n.includes('collision')) return 'percussion';
  if (n.includes('piano') || n.includes('keyboard') || n.includes('rhodes') && !n.includes('chroma') || 
      n.includes('wurly') || n.includes('celeste') || n.includes('harps') || n.includes('organ')) return 'keyboards';
  if (n.includes('tr-') || n.includes('cr-') || n.includes('tb-') || n.includes('dmx') || n.includes('sk-') ||
      n.includes('sunset drums') || n.includes('drums in blue')) return 'drums';
  if (n.includes('arp') || n.includes('jupiter') || n.includes('mono-poly') || n.includes('obx') || 
      n.includes('oberheim') || n.includes('octave') || n.includes('ppg') || n.includes('chroma') || 
      n.includes('synergy') || n.includes('synth') || n.includes('vision')) return 'synths';
  if (n.includes('choir') || n.includes('voces') || n.includes('voxos') || n.includes('north')) return 'choir';
  if (n.includes('iceland') || n.includes('ireland') || n.includes('scotland') || n.includes('south africa') ||
      n.includes('dulcimer') || n.includes('banjo') || n.includes('soundscapes') || n.includes('sew what') ||
      n.includes('sketchpad') || n.includes('orchestral chords')) return 'world';
  if (n.includes('tina guo') || n.includes('apocalyptica') || n.includes('taylor davis') || 
      n.includes('randy kerber') || n.includes('gina luciani')) return 'artist';
  return 'other';
}

// Get clean filename
function getFilename(name) {
  const clean = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  // Check for existing files
  const files = fs.readdirSync(IMAGES_DIR);
  
  // Try exact match first
  const exact = files.find(f => f.startsWith(clean + '.') || f === clean + '.png' || f === clean + '.jpg');
  if (exact) return exact;
  
  // Try partial match
  const partial = files.find(f => f.includes(clean) || clean.includes(f.replace(/\.(png|jpg|webp)$/, '')));
  if (partial) return partial;
  
  return clean + '.png';
}

// Read products
let products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Clean and deduplicate
const seen = new Set();
const cleanProducts = [];

for (const p of products) {
  let name = cleanName(p.name);
  if (!name || name.length < 2) continue;
  if (seen.has(name.toLowerCase())) continue;
  
  // Skip junk entries
  if (name.includes('Soundiron') || name.includes('Cinematic Percussion') || name === 'Cinema Flutes') continue;
  
  seen.add(name.toLowerCase());
  
  const filename = getFilename(name);
  const filepath = path.join(IMAGES_DIR, filename);
  const hasImage = fs.existsSync(filepath) && fs.statSync(filepath).size > 1000;
  
  cleanProducts.push({
    name,
    category: categorize(name),
    image: hasImage ? `images/products/${filename}` : null,
    filename
  });
}

// Sort by category then name
cleanProducts.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.name.localeCompare(b.name);
});

console.log(`\n📊 ${cleanProducts.length} unique products\n`);

// Group by category
const byCategory = {};
for (const p of cleanProducts) {
  if (!byCategory[p.category]) byCategory[p.category] = [];
  byCategory[p.category].push(p);
}

// Print summary
for (const [cat, prods] of Object.entries(byCategory)) {
  console.log(`${cat}: ${prods.length}`);
  prods.forEach(p => console.log(`  - ${p.name} ${p.image ? '✓' : '✗'}`));
}

// Generate HTML
const categoryOrder = ['strings', 'brass', 'woodwinds', 'percussion', 'keyboards', 'synths', 'drums', 'choir', 'artist', 'world', 'other'];
const categoryNames = {
  strings: 'Strings',
  brass: 'Brass',
  woodwinds: 'Woodwinds',
  percussion: 'Percussion',
  keyboards: 'Keyboards',
  synths: 'Synthesizers',
  drums: 'Drum Machines',
  choir: 'Choir & Vocals',
  artist: 'Artist Series',
  world: 'World & Sound Design',
  other: 'Other'
};

let sectionsHtml = '';

for (const cat of categoryOrder) {
  const prods = byCategory[cat];
  if (!prods || prods.length === 0) continue;
  
  let cardsHtml = '';
  for (const p of prods) {
    const imgHtml = p.image 
      ? `<img src="${p.image}" alt="${p.name}">`
      : `<div class="no-image-placeholder">${p.name.charAt(0)}</div>`;
    
    cardsHtml += `
                    <div class="product-card" data-category="${cat}">
                        <div class="product-image">
                            ${imgHtml}
                            <div class="product-badge">${categoryNames[cat]}</div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">${p.name}</h3>
                            <a href="https://portal.musio.com/marketplace/?developers=Cinesamples" target="_blank" class="btn btn-primary btn-block">Shop</a>
                        </div>
                    </div>`;
  }
  
  sectionsHtml += `
            <!-- ${categoryNames[cat]} -->
            <div class="product-category-section" id="${cat}">
                <h2 class="category-title">${categoryNames[cat]} (${prods.length})</h2>
                <div class="product-grid">${cardsHtml}
                </div>
            </div>
`;
}

// Build filter buttons
let filterBtns = '<button class="filter-btn active" data-category="all">All (' + cleanProducts.length + ')</button>';
for (const cat of categoryOrder) {
  const prods = byCategory[cat];
  if (!prods || prods.length === 0) continue;
  filterBtns += `<button class="filter-btn" data-category="${cat}">${categoryNames[cat]}</button>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Products - Cinesamples Virtual Instruments</title>
    <meta name="description" content="Browse the complete Cinesamples catalog of ${cleanProducts.length} professional virtual instruments. Available exclusively on Musio.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="products.css">
    <link rel="icon" type="image/svg+xml" href="images/cinesamples-logo.svg">
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <a href="/" class="logo">
                <img src="images/cinesamples-logo.svg" alt="Cinesamples" class="logo-icon">
            </a>
            <div class="nav-links">
                <a href="/products.html" class="nav-link active">Products</a>
                <a href="https://support.cinesamples.com" class="nav-link" target="_blank">Support</a>
                <a href="/#about" class="nav-link">About</a>
            </div>
            <a href="https://portal.musio.com/marketplace/?developers=Cinesamples" target="_blank" class="btn btn-primary">Shop on Musio</a>
            <button class="mobile-menu-btn" aria-label="Menu"><span></span><span></span><span></span></button>
        </div>
    </nav>

    <div class="mobile-menu">
        <a href="/products.html" class="mobile-nav-link">Products</a>
        <a href="https://support.cinesamples.com" class="mobile-nav-link" target="_blank">Support</a>
        <a href="/#about" class="mobile-nav-link">About</a>
        <a href="https://portal.musio.com/marketplace/?developers=Cinesamples" target="_blank" class="btn btn-primary btn-block">Shop on Musio</a>
    </div>

    <section class="page-header">
        <div class="container">
            <h1>All Products</h1>
            <p>Explore our complete catalog of ${cleanProducts.length} professional virtual instruments, now available on Musio</p>
        </div>
    </section>

    <section class="filter-section">
        <div class="container">
            <div class="filter-bar">
                <div class="filter-categories">
                    ${filterBtns}
                </div>
                <div class="filter-search">
                    <input type="text" placeholder="Search products..." id="product-search">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                    </svg>
                </div>
            </div>
        </div>
    </section>

    <section class="products-page">
        <div class="container">
${sectionsHtml}
            <div class="products-cta">
                <h3>Ready to create?</h3>
                <p>All ${cleanProducts.length} Cinesamples products are available exclusively on the Musio platform</p>
                <a href="https://portal.musio.com/marketplace/?developers=Cinesamples" target="_blank" class="btn btn-primary btn-lg">
                    Browse Full Catalog on Musio
                    <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </a>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <a href="/" class="logo"><img src="images/cinesamples-logo.svg" alt="Cinesamples" class="logo-icon"></a>
                    <p class="footer-tagline">Professional virtual instruments for film, TV, and game composers.</p>
                </div>
                <div class="footer-links">
                    <div class="footer-column">
                        <h4>Products</h4>
                        <a href="https://portal.musio.com/marketplace/?developers=Cinesamples" target="_blank">All Products</a>
                        <a href="#strings">Strings</a>
                        <a href="#brass">Brass</a>
                        <a href="#percussion">Percussion</a>
                    </div>
                    <div class="footer-column">
                        <h4>Company</h4>
                        <a href="/#about">About Us</a>
                        <a href="https://support.cinesamples.com" target="_blank">Support</a>
                        <a href="https://support.cinesamples.com/hc/en-us/requests/new" target="_blank">Contact</a>
                    </div>
                    <div class="footer-column">
                        <h4>Musio</h4>
                        <a href="https://portal.musio.com/marketplace/?developers=Cinesamples" target="_blank">Marketplace</a>
                        <a href="https://musio.com/musio-plus" target="_blank">Musio+</a>
                        <a href="https://musio.com" target="_blank">Learn More</a>
                    </div>
                    <div class="footer-column">
                        <h4>Legal</h4>
                        <a href="https://support.cinesamples.com/hc/en-us/articles/4404880124695-Refund-Return-Policy" target="_blank">Refund Policy</a>
                        <a href="https://cinesamples.com/privacy-policy" target="_blank">Privacy Policy</a>
                        <a href="https://support.cinesamples.com/hc/en-us/sections/27618368127767-Terms-of-Service" target="_blank">Terms</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Cinesamples Inc. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="script.js"></script>
    <script src="products.js"></script>
</body>
</html>`;

fs.writeFileSync(OUTPUT_FILE, html);
console.log(`\n✅ Generated ${OUTPUT_FILE}`);
console.log(`📊 Total: ${cleanProducts.length} products`);
