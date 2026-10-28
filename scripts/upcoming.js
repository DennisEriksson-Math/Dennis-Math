// Move an upcoming entry to the past once its date is behind us.
//
// A section marked data-then="Talks" hands its entries that carry
// data-until="YYYY-MM-DD" to the section called "Talks" (data-section) the
// day after that date, by the visitor's own calendar - newest first, ahead of
// what is already there. The template does the same for everything that had
// passed when the site was last built; this covers the time since, so
// nothing has to be republished for "Coming up" to turn into "Talks". A
// section left with no entries is hidden.
(function () {
  'use strict';

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  var now = new Date();
  var today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

  document.querySelectorAll('.cv-block[data-then]').forEach(function (source) {
    var target = document.querySelector('.cv-block[data-section="' + source.getAttribute('data-then') + '"]');
    if (!target) return;

    var past = [];
    source.querySelectorAll('.cv-entry[data-until]').forEach(function (e) {
      if (e.getAttribute('data-until') < today) past.push(e);
    });
    // oldest first, so each one inserted at the top leaves the newest on top
    past.sort(function (a, b) {
      return a.getAttribute('data-until') < b.getAttribute('data-until') ? -1 : 1;
    });

    past.forEach(function (e) {
      var first = target.querySelector('.cv-entry');
      if (first) first.parentNode.insertBefore(e, first);
      else target.appendChild(e);
    });

    if (!source.querySelector('.cv-entry')) source.hidden = true;
  });
})();
