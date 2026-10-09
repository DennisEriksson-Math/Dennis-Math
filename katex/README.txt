KaTeX 0.19.0 (MIT licence, https://katex.org), self-hosted so pages - and the
headless-Chrome PDF printing - never depend on a CDN.

Files: katex.min.js, contrib/auto-render.min.js (here as auto-render.min.js),
katex.min.css, and the woff2 fonts only (the .woff/.ttf fallbacks were
stripped out of the CSS; every current browser takes woff2).

To update: download the same files from
https://cdn.jsdelivr.net/npm/katex@VERSION/dist/ and repeat the woff2 strip.
