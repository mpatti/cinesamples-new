#!/usr/bin/env node
/**
 * Generate redirect rules for migration from old cinesamples.com to new site
 * Supports: Netlify (_redirects), Vercel (vercel.json), Apache (.htaccess), Nginx
 */

const fs = require('fs');
const path = require('path');

// Get all product pages from our site
const productsDir = path.join(__dirname, '..', 'products');
const productFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.html'));

// Extract slugs from filenames
const productSlugs = productFiles.map(f => f.replace('.html', ''));

// Category mappings (old URL -> new anchor)
const categoryMappings = {
    'strings': 'strings',
    'brass': 'brass',
    'winds': 'woodwinds',
    'woodwinds': 'woodwinds',
    'orchestra': 'strings', // redirect to strings as closest match
    'percussion': 'percussion',
    'keyboards': 'keyboards',
    'choir': 'choir',
    'choirs': 'choir',
    'sound-design': 'synths',
    'world': 'world',
    'artist-series': 'artist-series'
};

// Additional static page redirects
const staticRedirects = [
    { from: '/about', to: '/#about' },
    { from: '/about/', to: '/#about' },
    { from: '/support', to: 'https://support.cinesamples.com' },
    { from: '/contact', to: 'https://support.cinesamples.com/hc/en-us/requests/new' },
    { from: '/privacy-policy', to: 'https://cinesamples.com/privacy-policy' },
    { from: '/sale', to: '/products.html' },
    { from: '/magazine', to: '/' },
];

// Generate Netlify _redirects file
function generateNetlifyRedirects() {
    let content = `# Cinesamples.com Redirects
# Generated ${new Date().toISOString()}
# Place this file in your site root

# ===================================
# Product Page Redirects
# Old: /product/[slug] -> New: /products/[slug].html
# ===================================
`;

    // Product redirects
    for (const slug of productSlugs) {
        content += `/product/${slug}  /products/${slug}.html  301\n`;
        content += `/product/${slug}/  /products/${slug}.html  301\n`;
    }

    // Catch-all for any product we might have missed
    content += `/product/*  /products.html  302\n`;
    content += `\n`;

    // Category redirects (from old store subdomain paths if accessed on main domain)
    content += `# ===================================
# Category Redirects
# ===================================
`;
    for (const [oldCat, newAnchor] of Object.entries(categoryMappings)) {
        content += `/categories/${oldCat}  /products.html#${newAnchor}  301\n`;
        content += `/category/${oldCat}  /products.html#${newAnchor}  301\n`;
    }
    content += `\n`;

    // Static page redirects
    content += `# ===================================
# Static Page Redirects
# ===================================
`;
    for (const redirect of staticRedirects) {
        const status = redirect.to.startsWith('http') ? '301!' : '301';
        content += `${redirect.from}  ${redirect.to}  ${status}\n`;
    }

    // Bundle redirects (send to products page with message)
    content += `\n# ===================================
# Bundle Redirects (no longer available)
# ===================================
/bundles/*  /products.html  302
/bundle/*  /products.html  302
`;

    // Store subdomain redirects (if consolidating domains)
    content += `\n# ===================================
# Legacy Store Paths (if store.cinesamples.com is consolidated)
# ===================================
/store  /products.html  301
/store/*  /products.html  301
/cart  /products.html  301
/checkout  /products.html  301
`;

    return content;
}

// Generate Vercel vercel.json redirects
function generateVercelRedirects() {
    const redirects = [];

    // Product redirects
    for (const slug of productSlugs) {
        redirects.push({
            source: `/product/${slug}`,
            destination: `/products/${slug}.html`,
            permanent: true
        });
    }

    // Catch-all product redirect
    redirects.push({
        source: '/product/:slug',
        destination: '/products.html',
        permanent: false
    });

    // Category redirects
    for (const [oldCat, newAnchor] of Object.entries(categoryMappings)) {
        redirects.push({
            source: `/categories/${oldCat}`,
            destination: `/products.html#${newAnchor}`,
            permanent: true
        });
        redirects.push({
            source: `/category/${oldCat}`,
            destination: `/products.html#${newAnchor}`,
            permanent: true
        });
    }

    // Static redirects
    for (const redirect of staticRedirects) {
        redirects.push({
            source: redirect.from,
            destination: redirect.to,
            permanent: true
        });
    }

    // Bundles catch-all
    redirects.push({
        source: '/bundles/:path*',
        destination: '/products.html',
        permanent: false
    });

    // Store paths
    redirects.push({
        source: '/store/:path*',
        destination: '/products.html',
        permanent: true
    });

    return {
        redirects
    };
}

// Generate Apache .htaccess file
function generateApacheHtaccess() {
    let content = `# Cinesamples.com Redirects
# Generated ${new Date().toISOString()}
# Apache .htaccess file

RewriteEngine On
RewriteBase /

# ===================================
# Product Page Redirects
# ===================================
`;

    // Product redirects
    for (const slug of productSlugs) {
        content += `RewriteRule ^product/${slug}/?$ /products/${slug}.html [R=301,L]\n`;
    }

    // Catch-all for products
    content += `RewriteRule ^product/(.*)$ /products.html [R=302,L]\n`;
    content += `\n`;

    // Category redirects
    content += `# ===================================
# Category Redirects
# ===================================
`;
    for (const [oldCat, newAnchor] of Object.entries(categoryMappings)) {
        content += `RewriteRule ^categor(y|ies)/${oldCat}/?$ /products.html#${newAnchor} [R=301,L,NE]\n`;
    }
    content += `\n`;

    // Static redirects
    content += `# ===================================
# Static Page Redirects
# ===================================
`;
    for (const redirect of staticRedirects) {
        const target = redirect.to.startsWith('http') ? redirect.to : redirect.to;
        const fromPath = redirect.from.replace(/^\//, '').replace(/\/$/, '');
        content += `RewriteRule ^${fromPath}/?$ ${target} [R=301,L]\n`;
    }

    // Bundles
    content += `\n# ===================================
# Bundle Redirects
# ===================================
RewriteRule ^bundles?/(.*)$ /products.html [R=302,L]
`;

    // Store paths
    content += `\n# ===================================
# Legacy Store Paths
# ===================================
RewriteRule ^store/?(.*)$ /products.html [R=301,L]
RewriteRule ^cart/?$ /products.html [R=301,L]
RewriteRule ^checkout/?$ /products.html [R=301,L]
`;

    return content;
}

// Generate Nginx config snippet
function generateNginxConfig() {
    let content = `# Cinesamples.com Redirects
# Generated ${new Date().toISOString()}
# Add this to your Nginx server block

# ===================================
# Product Page Redirects
# ===================================
`;

    // Product redirects using location blocks
    for (const slug of productSlugs) {
        content += `location = /product/${slug} { return 301 /products/${slug}.html; }\n`;
    }

    // Catch-all for products
    content += `location ~ ^/product/(.*)$ { return 302 /products.html; }\n`;
    content += `\n`;

    // Category redirects
    content += `# ===================================
# Category Redirects
# ===================================
`;
    for (const [oldCat, newAnchor] of Object.entries(categoryMappings)) {
        content += `location ~ ^/categor(y|ies)/${oldCat}/?$ { return 301 /products.html#${newAnchor}; }\n`;
    }
    content += `\n`;

    // Static redirects
    content += `# ===================================
# Static Page Redirects
# ===================================
`;
    for (const redirect of staticRedirects) {
        const fromPath = redirect.from;
        content += `location = ${fromPath} { return 301 ${redirect.to}; }\n`;
    }

    // Catch-alls
    content += `\n# ===================================
# Catch-all Redirects
# ===================================
location ~ ^/bundles?/ { return 302 /products.html; }
location ~ ^/store/ { return 301 /products.html; }
location = /cart { return 301 /products.html; }
location = /checkout { return 301 /products.html; }
`;

    return content;
}

// Generate a summary/documentation file
function generateRedirectSummary() {
    return `# Cinesamples.com Redirect Migration Guide

Generated: ${new Date().toISOString()}

## Overview

This migration redirects URLs from the old Cinesamples website to the new Musio-focused site.

## URL Mappings

### Product Pages (${productSlugs.length} products)
- **Old:** \`/product/[slug]\`
- **New:** \`/products/[slug].html\`

### Categories
| Old URL | New URL |
|---------|---------|
${Object.entries(categoryMappings).map(([old, newAnchor]) => `| /categories/${old} | /products.html#${newAnchor} |`).join('\n')}

### Static Pages
| Old URL | New URL |
|---------|---------|
${staticRedirects.map(r => `| ${r.from} | ${r.to} |`).join('\n')}

### Deprecated Paths
These paths no longer have equivalents and redirect to /products.html:
- \`/bundles/*\` - Bundles are no longer sold
- \`/store/*\` - Store is consolidated into main site
- \`/cart\` - No shopping cart (purchases via Musio)
- \`/checkout\` - No checkout (purchases via Musio)

## Files Generated

1. **\`_redirects\`** - For Netlify hosting
2. **\`vercel.json\`** - For Vercel hosting  
3. **\`.htaccess\`** - For Apache servers
4. **\`nginx-redirects.conf\`** - For Nginx servers

## Implementation

### Netlify
Copy \`_redirects\` to your site root (same level as index.html).

### Vercel
The \`vercel.json\` file should be in your project root.

### Apache
Copy \`.htaccess\` to your site root. Ensure \`mod_rewrite\` is enabled.

### Nginx
Include \`nginx-redirects.conf\` in your server block configuration.

## Testing

After deployment, test these critical redirects:
1. \`/product/cinebrass-core\` → \`/products/cinebrass-core.html\`
2. \`/product/cinestrings-core\` → \`/products/cinestrings-core.html\`
3. \`/categories/brass\` → \`/products.html#brass\`
4. \`/about\` → \`/#about\`

## Notes

- All redirects use 301 (permanent) status codes except for catch-all fallbacks which use 302
- The store subdomain (store.cinesamples.com) may need separate DNS/hosting configuration
- Consider setting up Google Search Console to monitor crawl errors after migration
`;
}

// Main execution
const outputDir = path.join(__dirname, '..', 'redirects');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all redirect files
console.log('Generating redirect configurations...\n');

// Netlify
const netlifyContent = generateNetlifyRedirects();
fs.writeFileSync(path.join(outputDir, '_redirects'), netlifyContent);
console.log('✓ Generated: redirects/_redirects (Netlify)');

// Also copy to root for Netlify
fs.writeFileSync(path.join(__dirname, '..', '_redirects'), netlifyContent);
console.log('✓ Copied _redirects to site root');

// Vercel
const vercelContent = generateVercelRedirects();
fs.writeFileSync(path.join(outputDir, 'vercel.json'), JSON.stringify(vercelContent, null, 2));
console.log('✓ Generated: redirects/vercel.json (Vercel)');

// Apache
const apacheContent = generateApacheHtaccess();
fs.writeFileSync(path.join(outputDir, '.htaccess'), apacheContent);
console.log('✓ Generated: redirects/.htaccess (Apache)');

// Nginx
const nginxContent = generateNginxConfig();
fs.writeFileSync(path.join(outputDir, 'nginx-redirects.conf'), nginxContent);
console.log('✓ Generated: redirects/nginx-redirects.conf (Nginx)');

// Summary
const summaryContent = generateRedirectSummary();
fs.writeFileSync(path.join(outputDir, 'REDIRECT-GUIDE.md'), summaryContent);
console.log('✓ Generated: redirects/REDIRECT-GUIDE.md (Documentation)');

console.log(`\n✅ Done! Generated redirect rules for ${productSlugs.length} products.`);
console.log(`   Files are in: ${outputDir}`);
