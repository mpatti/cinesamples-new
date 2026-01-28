# Cinesamples.com Redirect Migration Guide

Generated: 2026-01-27T23:56:46.435Z

## Overview

This migration redirects URLs from the old Cinesamples website to the new Musio-focused site.

## URL Mappings

### Product Pages (86 products)
- **Old:** `/product/[slug]`
- **New:** `/products/[slug].html`

### Categories
| Old URL | New URL |
|---------|---------|
| /categories/strings | /products.html#strings |
| /categories/brass | /products.html#brass |
| /categories/winds | /products.html#woodwinds |
| /categories/woodwinds | /products.html#woodwinds |
| /categories/orchestra | /products.html#strings |
| /categories/percussion | /products.html#percussion |
| /categories/keyboards | /products.html#keyboards |
| /categories/choir | /products.html#choir |
| /categories/choirs | /products.html#choir |
| /categories/sound-design | /products.html#synths |
| /categories/world | /products.html#world |
| /categories/artist-series | /products.html#artist-series |

### Static Pages
| Old URL | New URL |
|---------|---------|
| /about | /#about |
| /about/ | /#about |
| /support | https://support.cinesamples.com |
| /contact | https://support.cinesamples.com/hc/en-us/requests/new |
| /privacy-policy | https://cinesamples.com/privacy-policy |
| /sale | /products.html |
| /magazine | / |

### Deprecated Paths
These paths no longer have equivalents and redirect to /products.html:
- `/bundles/*` - Bundles are no longer sold
- `/store/*` - Store is consolidated into main site
- `/cart` - No shopping cart (purchases via Musio)
- `/checkout` - No checkout (purchases via Musio)

## Files Generated

1. **`_redirects`** - For Netlify hosting
2. **`vercel.json`** - For Vercel hosting  
3. **`.htaccess`** - For Apache servers
4. **`nginx-redirects.conf`** - For Nginx servers

## Implementation

### Netlify
Copy `_redirects` to your site root (same level as index.html).

### Vercel
The `vercel.json` file should be in your project root.

### Apache
Copy `.htaccess` to your site root. Ensure `mod_rewrite` is enabled.

### Nginx
Include `nginx-redirects.conf` in your server block configuration.

## Testing

After deployment, test these critical redirects:
1. `/product/cinebrass-core` → `/products/cinebrass-core.html`
2. `/product/cinestrings-core` → `/products/cinestrings-core.html`
3. `/categories/brass` → `/products.html#brass`
4. `/about` → `/#about`

## Notes

- All redirects use 301 (permanent) status codes except for catch-all fallbacks which use 302
- The store subdomain (store.cinesamples.com) may need separate DNS/hosting configuration
- Consider setting up Google Search Console to monitor crawl errors after migration
