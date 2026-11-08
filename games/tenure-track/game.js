/* ═══════════════════════════════════════════════════════════
   TENURE TRACK: the screen. The rules are in model.js.
   Six years, four columns, seven hours a semester, an
   arrangement to choose each year, and a vote at the end.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const M = window.TenureModel;
  const CFG = M.CFG, TRACKS = M.TRACKS, LABEL = M.LABEL, METERS = M.METERS;

  const zero = () => ({ research: 0, teaching: 0, service: 0, standing: 0, rest: 0 });
  let S = M.newState('all');
  let alloc = zero();
  let running = false;

  const elMeters = document.getElementById('meters');
  const elAlloc  = document.getElementById('alloc');
  const elLeft   = document.getElementById('left');
  const elTerm   = document.getElementById('term');
  const elRemain = document.getElementById('remaining-terms');
  const elLedger = document.getElementById('ledger');
  const elSubmit = document.getElementById('submit');
  const elPerks  = document.getElementById('perks');
  const overlay  = document.getElementById('overlay');

  function spent() { return TRACKS.reduce((n, t) => n + alloc[t.key], 0); }
  function left()  { return CFG.HOURS - spent(); }

  function termName(sem) {
    return 'Year ' + Math.ceil(sem / 2) + ' · ' + (sem % 2 ? 'Autumn' : 'Spring');
  }

  /* ─── Build the panels once, then update in place ────────── */

  function buildMeters() {
    elMeters.innerHTML = '';
    METERS.forEach((k) => {
      const need = CFG.NEED[k];
      const row = document.createElement('div');
      row.className = 'meter' + (k === 'energy' ? ' is-energy' : '');
      row.innerHTML =
        '<div class="meter-label">' + LABEL[k] + '</div>' +
        '<div class="meter-track">' +
          '<div class="meter-fill" data-fill="' + k + '"></div>' +
          (need ? '<i class="meter-need" style="left:' + need + '%" title="Needed for tenure"></i>' : '') +
        '</div>' +
        '<div class="meter-num" data-num="' + k + '">0</div>';
      elMeters.appendChild(row);
    });
  }

  function buildAlloc() {
    elAlloc.innerHTML = '';
    TRACKS.forEach((t) => {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML =
        '<div class="row-text"><b>' + t.name + '</b><span>' + t.note + '</span></div>' +
        '<div class="stepper">' +
          '<button type="button" class="step" data-dec="' + t.key + '" aria-label="Fewer hours on ' + t.name + '">−</button>' +
          '<b data-hours="' + t.key + '">0</b>' +
          '<button type="button" class="step" data-inc="' + t.key + '" aria-label="More hours on ' + t.name + '">+</button>' +
        '</div>';
      elAlloc.appendChild(row);
    });

    elAlloc.addEventListener('click', (e) => {
      if (!running) return;
      const inc = e.target.getAttribute('data-inc');
      const dec = e.target.getAttribute('data-dec');
      if (inc && left() > 0)       { alloc[inc]++; SFX.key(); render(); }
      else if (dec && alloc[dec])  { alloc[dec]--; SFX.key(); render(); }
    });
  }

  function render() {
    METERS.forEach((k) => {
      const v = Math.round(S[k]);
      const fill = elMeters.querySelector('[data-fill="' + k + '"]');
      fill.style.width = v + '%';
      elMeters.querySelector('[data-num="' + k + '"]').textContent = v;
      const need = CFG.NEED[k];
      fill.classList.toggle('is-met', need ? v >= need : v > CFG.TIRED);
    });
    elMeters.querySelector('[data-fill="energy"]').classList.toggle('is-low', S.energy <= CFG.TIRED);

    TRACKS.forEach((t) => {
      elAlloc.querySelector('[data-hours="' + t.key + '"]').textContent = alloc[t.key];
    });

    elLeft.textContent = left();
    elTerm.textContent = termName(S.sem);
    const rem = CFG.SEMESTERS - S.sem + 1;
    elRemain.textContent = rem + (rem === 1 ? ' semester remains' : ' semesters remain');
    elSubmit.disabled = !running || left() !== 0;
    elSubmit.textContent = left() === 0 ? 'File the semester' : 'Assign all ' + CFG.HOURS + ' hours';

    // the arrangements taken so far
    const prof = M.PROFILES.find((p) => p.id === S.profile);
    elPerks.innerHTML = '<span class="perks-label">' + prof.name + '</span>' + S.perks.map((id) => {
      const p = M.PERKS.find((q) => q.id === id);
      return '<span class="chip" title="' + p.show.join('; ') + '">' + p.name + '</span>';
    }).join('');
  }

  /* ─── A semester ─────────────────────────────────────────── */

  function submit() {
    if (!running || left() !== 0) return;
    SFX.stamp();

    const res = M.fileSemester(S, alloc);
    elLedger.textContent = res.tired
      ? 'You worked the semester on empty. It shows in the output.'
      : 'Semester filed.';

    render();
    if (S.energy <= 0) { burnout(); return; }
    setTimeout(fireEvent, 420);
  }

  function pills(list) {
    return list.map((t) => '<i class="' + (/−|worse/.test(t) ? 'down' : 'up') + '">' + t + '</i>').join('');
  }

  function describe(f) {
    const parts = Object.keys(f).map((k) =>
      '<i class="' + (f[k] > 0 ? 'up' : 'down') + '">' +
      (f[k] > 0 ? '+' : '−') + Math.abs(f[k]) + ' ' + LABEL[k] + '</i>');
    return parts.length ? parts.join('') : '<i class="flat">no change</i>';
  }

  function fireEvent() {
    const ev = M.pickEvent(S);
    SFX.slide();

    show(
      '<div class="memo">' +
      '<div class="memo-tag">' + termName(S.sem) + '</div>' +
      '<h2 class="memo-title">' + ev.t + '</h2>' +
      '<p class="memo-text">' + ev.x + '</p>' +
      '<div class="memo-choices">' +
        ev.c.map((ch, i) =>
          '<button type="button" class="choice" data-i="' + i + '">' +
            '<span class="choice-label">' + ch.l + '</span>' +
            '<span class="choice-fx">' + describe(ch.f) + '</span>' +
          '</button>').join('') +
      '</div></div>'
    );

    overlay.querySelectorAll('.choice').forEach((b) => {
      b.addEventListener('click', () => resolve(ev.c[Number(b.dataset.i)]));
    });
  }

  function resolve(choice) {
    M.applyEffects(S, choice.f);
    const net = Object.keys(choice.f).reduce((n, k) => n + choice.f[k], 0);
    if (net >= 0) SFX.good(); else SFX.bad();

    show(
      '<div class="memo is-outcome">' +
      '<div class="memo-tag">' + termName(S.sem) + '</div>' +
      '<p class="memo-say">' + choice.s + '</p>' +
      '<div class="memo-delta">' + describe(choice.f) + '</div>' +
      '<button type="button" class="btn" id="next-btn">' +
        (S.sem >= CFG.SEMESTERS ? 'Submit the tenure file' : 'Next semester') +
      '</button></div>'
    );
    document.getElementById('next-btn').addEventListener('click', advance);
    render();
  }

  function advance() {
    hide();
    if (S.energy <= 0) { burnout(); return; }
    if (S.sem >= CFG.SEMESTERS) { vote(); return; }
    S.sem++;
    alloc = zero();
    elLedger.textContent = 'A new semester. The hours reset; nothing else does.';
    render();
    if (M.yearStarts(S)) showOffers();
  }

  /* ─── Choices outside the semester ───────────────────────── */

  function showProfiles() {
    running = false;
    show(
      '<div class="memo is-wide">' +
      '<div class="memo-tag">Personnel file · Confidential</div>' +
      '<h2 class="memo-title">How were you <span>hired?</span></h2>' +
      '<p class="memo-text">Four columns and one vote: Research, Teaching, Service and Standing (your external letters). How you start decides which is already strong.</p>' +
      '<div class="memo-choices">' +
        M.PROFILES.map((p, i) =>
          '<button type="button" class="choice" data-i="' + i + '">' +
            '<span class="choice-label">' + p.name + '</span>' +
            '<span class="choice-text">' + p.text + '</span>' +
            '<span class="choice-fx">' + M.COLUMNS.map((k) => {
              const v = p.start[k];
              return '<i class="' + (v >= 25 ? 'up' : v <= 10 ? 'down' : 'flat') + '">' + LABEL[k] + ' ' + v + '</i>';
            }).join('') + '</span>' +
          '</button>').join('') +
      '</div></div>'
    );
    overlay.querySelectorAll('.choice').forEach((b) => {
      b.addEventListener('click', () => {
        SFX.unlock(); SFX.stamp();
        S = M.newState(M.PROFILES[Number(b.dataset.i)].id);
        alloc = zero();
        elLedger.textContent = 'Appointed. The clock starts now.';
        render();
        showOffers();
      });
    });
  }

  function showOffers() {
    running = false;
    const offered = M.offers(S);
    SFX.slide();
    show(
      '<div class="memo is-wide">' +
      '<div class="memo-tag">Year ' + Math.ceil(S.sem / 2) + ' · an arrangement</div>' +
      '<h2 class="memo-title">The department <span>offers you</span> one of these</h2>' +
      '<p class="memo-text">They stack from year to year, and each costs something somewhere.</p>' +
      '<div class="memo-choices">' +
        offered.map((p, i) =>
          '<button type="button" class="choice" data-i="' + i + '">' +
            '<span class="choice-label">' + p.name + '</span>' +
            '<span class="choice-text">' + p.text + '</span>' +
            '<span class="choice-fx">' + pills(p.show) + '</span>' +
          '</button>').join('') +
      '</div></div>'
    );
    overlay.querySelectorAll('.choice').forEach((b) => {
      b.addEventListener('click', () => {
        M.takePerk(S, offered[Number(b.dataset.i)].id);
        SFX.good();
        hide();
        running = true;
        elLedger.textContent = 'Arranged. The hours are yours to spend.';
        render();
      });
    });
  }

  /* ─── Endings ────────────────────────────────────────────── */

  function burnout() {
    running = false;
    SFX.denied();
    show(card('Medical leave', 'You are<br><span>signed off</span>',
      'You ran out of energy in ' + termName(S.sem).toLowerCase() + '. The department is ' +
      'sympathetic in writing and the clock, they explain, does not stop.',
      false, 'On leave'));
  }

  function vote() {
    running = false;
    const v = M.verdict(S), ok = v.ok;
    const denied = (body) => ({ kicker: 'Denied', title: 'The file was<br><span>not carried</span>', body: body, good: false });
    let r;

    if (v.tenure && v.strong) {
      r = { good: true, kicker: 'The vote was unanimous', title: 'Tenure<br><span>granted</span>',
            body: 'The committee could not find anything to quibble with, and the external letters used the word "outstanding" twice, which in this building is close to a standing ovation.' };
    } else if (v.tenure) {
      r = { good: true, kicker: 'Carried', title: 'Tenure<br><span>granted</span>',
            body: 'Not without discussion. But the file holds up in all four columns, and the letters, if not warm, were at least in your favour. That is the whole of the test.' };
    } else if (v.met === 3 && !ok.standing) {
      r = denied('"An excellent internal file. The external letters, however, were polite and brief. Competent, they say, but we do not know the name."');
    } else if (v.met === 3 && !ok.teaching) {
      r = denied('"A serious scholar and a good colleague. The students, however, see rather less of you than we would like."');
    } else if (v.met === 3 && !ok.service) {
      r = denied('"Strong on the counts that appear in the handbook, and the letters are good. We note an almost complete absence of departmental citizenship."');
    } else if (v.met === 3 && !ok.research) {
      r = denied('"Beloved in the classroom, indispensable on committees, well known, and the publication record is thin. We are sorry."');
    } else if (v.met === 2) {
      r = denied('"There are two columns here we can defend, and two we cannot."');
    } else if (v.met === 1) {
      r = denied('"There is one column here we can defend. There are three we cannot."');
    } else {
      r = denied('"We thank you for six years of service to the department and wish you every success in your future career."');
    }

    if (r.good) SFX.granted(); else SFX.denied();
    show(card(r.kicker, r.title, r.body, true, r.good ? 'Granted' : 'Denied'));
  }

  function card(kicker, title, body, showScores, stamp) {
    const prof = M.PROFILES.find((p) => p.id === S.profile);
    const taken = S.perks.map((id) => M.PERKS.find((q) => q.id === id).name);
    return '<div class="verdict-card">' +
      '<div class="stamp">' + stamp + '</div>' +
      '<div class="memo-tag">' + kicker + '</div>' +
      '<h2 class="verdict-title">' + title + '</h2>' +
      '<p class="memo-text">' + body + '</p>' +
      (showScores ?
        '<div class="result">' +
          M.COLUMNS.map((k) => scoreCell(LABEL[k], S[k], CFG.NEED[k])).join('') +
        '</div>' : '') +
      '<p class="card-note">' + prof.name + (taken.length ? '. ' + taken.join(', ') + '.' : '.') + '</p>' +
      '<button type="button" class="btn" id="again-btn">Start again</button>' +
      '<a class="card-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>';
  }

  function scoreCell(name, v, need) {
    const n = Math.round(v);
    return '<div class="' + (n >= need ? 'is-met' : 'is-short') + '">' +
      '<b>' + n + '</b><span>' + name + ' · needed ' + need + '</span></div>';
  }

  /* ─── Overlay ────────────────────────────────────────────── */

  function show(html) { overlay.innerHTML = html; overlay.classList.add('is-open'); wire(); }
  function hide() { overlay.classList.remove('is-open'); }

  function wire() {
    const again = document.getElementById('again-btn');
    if (again) again.addEventListener('click', restart);
  }

  function restart() {
    hide();
    S = M.newState('all');
    alloc = zero();
    render();
    showProfiles();
  }

  /* ─── Boot ───────────────────────────────────────────────── */

  elSubmit.addEventListener('click', () => { SFX.unlock(); submit(); });

  buildMeters();
  buildAlloc();
  render();
  showProfiles();

})();
