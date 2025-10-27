# Bereket Tesfaye — Portfolio

This is a single-page portfolio template for a graphic designer. It includes a hero, selected work gallery, services, testimonials, and a contact form.

Quick preview

1. Open `index.html` in your browser (double-click or right-click → Open with...).
2. Or run a tiny local server from the Portfolio folder and open http://localhost:8000:

```bash
# from the Portfolio folder
python -m http.server 8000
```

What to edit (fast map)

- Text: edit headings and paragraphs directly in `index.html`.
- Colors / spacing: tweak variables and sizes in `css/styles.css` (look near the top for `:root` variables).
- Projects: swap the image `src` inside each `<article class="card project">` and update the `data-full` and `data-title` attributes.
- Banner: add `assets/bg1.jpg` or `assets/bg1.webp` (see instructions below) and the page will use it automatically.

Recommended banner image

- Sizes: 1600×600 px is a good starting point (wider is okay). For responsive sites, 1200–2000 px widths work well.
- Format: WebP (best) or JPEG. Try to keep under ~200 KB for snappy loads.
- Naming: place the file at `assets/bg1.jpg` or `assets/bg1.webp` (lowercase). The site prefers WebP, then JPG, then uses the SVG fallback.

How to add your banner image

1. Save your image to: `c:\Users\HP\OneDrive\Desktop\H.html\Portfolio\assets\bg1.jpg` (or `bg1.webp`).
2. Refresh the page in your browser (Ctrl+F5 if nothing appears).
3. If the image still doesn't appear, open DevTools → Network to see if the file requested matches the path and name.

Suggested next polishing steps (I can do these)

- Generate responsive `srcset` variants (e.g., `bg1-1600.webp`, `bg1-800.webp`) and update the `<picture>` so devices get the right file.
- Replace placeholder gallery images with your real work, and I'll add lazy-loading and lightbox captions.
- Run a quick accessibility sweep and add keyboard focus states and ARIA improvements.

If you want, I can create a small WebP placeholder now and add responsive srcset entries so you can preview exactly how the banner will behave on different screen sizes.
