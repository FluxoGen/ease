# ease — brand kit

Everything you need to use the ease logo on a website, web app, app stores and social media.

## What's in each folder

**logo/svg** holds the master logo files. SVG stays sharp at any size, so use it on websites whenever you can. The letters are converted to shapes, so no font needs to be installed.

- `ease-logo-primary.svg` is the main logo, for ivory or white backgrounds.
- `ease-logo-reversed.svg` is for dark backgrounds or photos.
- `ease-logo-tagline.svg` and `ease-logo-tagline-reversed.svg` add "Self Acupuncture" underneath, for landing pages, posters and splash screens.
- `ease-logo-mono-black.svg` and `ease-logo-mono-white.svg` are single-color versions for printing, stamps and embroidery.
- `ease-logo-on-ivory.svg` has the ivory background built in, for documents and email signatures.

**logo/png** has the same logos as transparent PNG images at @1x, @2x and @4x, for places that don't accept SVG (slides, Word, Canva, email).

**icon** holds the acupoint mark on its own. `ease-app-icon-1024.png` is the size the Apple App Store and Google Play ask for. Upload it square; the stores round the corners for you.

**favicon** holds the small browser-tab icons and the web app (PWA) icons. Copy every file in this folder into your website's root folder, then paste `code/head-snippet.html` into your page's `<head>`.

**social** has `og-image-1200x630.png`, the preview picture that shows when someone shares your link, and `profile-picture-800.png` for Instagram, Facebook, X and LinkedIn profiles.

**code** has ready-to-paste snippets:

- `head-snippet.html` for favicons, app manifest and link previews.
- `ease-inline-svg.html` for pasting the logo directly into HTML.
- `EaseLogo.jsx` for React or Next.js apps.
- `tokens.css` for the brand colors and font as CSS variables.

## Colors

| Name | Hex | Use |
|---|---|---|
| Ivory | #F6F3EC | Main background |
| Charcoal | #22302B | Logo letters, body text |
| Clay | #C8734F | The acupoint dot, buttons, highlights |
| Clay dark | #8A4A30 | Tagline, links, small text on ivory |
| Sand | #EDE8DC | Cards and secondary surfaces |

Keep Clay for the dot and for one main action per screen, so the "point" always draws the eye.

## Typeface

The logo and website text use **Manrope** (free, from Google Fonts). The wordmark uses Manrope Light (300); the tagline uses Manrope SemiBold (600) with wide letter spacing.

## Using the logo well

Leave clear space around the logo at least as wide as the acupoint mark. Don't make the full logo smaller than 80px wide on screen; below that, use the mark alone. Don't stretch, recolor or add shadows to the logo, and don't move the dot out of the gap between "ea" and "se": the dot is the idea.
