// Typeset TeX in the page text with KaTeX: $...$ inline, $$...$$ display, and
// \(...\) / \[...\]. Write math in the data files exactly as in a .tex file,
// e.g. "$p$-adic methods" or "intersection of two cubics in $\mathbb{P}^5$".
// Bad TeX shows up in red instead of breaking the page.
(function () {
  'use strict';

  function typeset() {
    if (typeof renderMathInElement !== 'function') return;
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', typeset);
  else typeset();
})();
