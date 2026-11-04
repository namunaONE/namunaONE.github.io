/* Namuna One — minimal, vanilla JS. No dependencies.
   Features: sticky header, mobile menu, scrollspy, copy-to-clipboard,
   footer year. All progressive: the page is fully usable without JS. */
(function () {
  'use strict';

  /* ── Sticky header hairline ─────────────────────────────────────────── */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ────────────────────────────────────────────────────── */
  var toggle = document.querySelector('.nav-toggle');
  function closeMenu() {
    document.body.classList.remove('menu-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (document.body.classList.contains('menu-open') &&
          !e.target.closest('.mobile-menu') &&
          !e.target.closest('.nav-toggle')) {
        closeMenu();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        closeMenu();
        toggle.focus();
      }
    });
    document.querySelectorAll('.mobile-menu a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ── Scrollspy — highlight the section you're reading ───────────────── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);

  if (sections.length) {
    var currentId = null;

    function updateSpy() {
      var probe = window.scrollY + 110; /* clear the sticky header */
      var next = null;
      sections.forEach(function (section) {
        if (section.offsetTop <= probe) next = section.id;
      });
      var atBottom = window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) next = sections[sections.length - 1].id;

      if (next === currentId) return;
      currentId = next;
      navLinks.forEach(function (link) {
        var target = link.getAttribute('href').slice(1);
        if (next && target === next) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }

    var spyTick = false;
    window.addEventListener('scroll', function () {
      if (spyTick) return;
      spyTick = true;
      window.requestAnimationFrame(function () {
        spyTick = false;
        updateSpy();
      });
    }, { passive: true });
    window.addEventListener('resize', updateSpy);
    updateSpy();
  }

  /* ── Copy-to-clipboard with announced status ────────────────────────── */
  var status = document.getElementById('copy-status');
  function announce(message) {
    if (!status) return;
    status.textContent = '';
    window.setTimeout(function () { status.textContent = message; }, 60);
  }

  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-copy-target');
      var target = targetId ? document.getElementById(targetId) : null;
      var text = target ? target.innerText.trim() : (btn.getAttribute('data-copy') || '');
      if (!text) return;

      function done(ok) {
        var original = btn.textContent;
        btn.textContent = ok ? 'Copied ✓' : 'Copy failed';
        btn.disabled = true;
        announce(ok ? 'Copied to clipboard.' : 'Copy failed. Select the text manually.');
        window.setTimeout(function () {
          btn.textContent = original;
          btn.disabled = false;
        }, 1800);
      }

      function legacyCopy() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
        document.body.removeChild(ta);
        return ok;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { done(true); },
          function () { done(legacyCopy()); }
        );
      } else {
        done(legacyCopy());
      }
    });
  });

  /* ── Pointer spotlight on project cards (fine pointers only) ────────── */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (finePointer.matches && !reduceMotion.matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      var frame = 0;
      var mx = 0;
      var my = 0;

      function paint() {
        frame = 0;
        card.style.setProperty('--mx', mx + 'px');
        card.style.setProperty('--my', my + 'px');
      }

      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        mx = event.clientX - rect.left;
        my = event.clientY - rect.top;
        if (!frame) frame = window.requestAnimationFrame(paint);
      }, { passive: true });

      card.addEventListener('pointerenter', function (event) {
        if (event.pointerType === 'touch') return;
        card.classList.add('spot');
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('spot');
      });
    });
  }

  /* ── Footer year ────────────────────────────────────────────────────── */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

/* ── Today in Bikram Sambat (live, from nMiti) ─────────────────────────────
   Progressive enhancement: the strip is fully usable without this script
   (fallback link + source line). This only upgrades it when the API answers.
   Fetches https://namunaone.github.io/nMiti/api/v1/today.json (same origin). */
(function () {
  'use strict';

  var ENDPOINT = 'https://namunaone.github.io/nMiti/api/v1/today.json';
  var npEl = document.getElementById('bs-today-np');
  var enEl = document.getElementById('bs-today-en');
  var srcEl = document.getElementById('bs-today-source');
  if (!npEl || !enEl || !srcEl) return;

  var KTM_OFFSET_MS = 5.75 * 3600 * 1000;
  var STALE_HOURS = 26;
  var THROTTLE_MS = 10 * 60 * 1000;
  var fetching = false;
  var renderedOnce = false;
  var lastFetchAt = 0;
  var midnightTimer = null;
  var fallbackTimer = null;

  function ktmDateISO(ts) {
    return new Date(ts + KTM_OFFSET_MS).toISOString().slice(0, 10);
  }

  function asOfStamp(iso) {
    return iso.slice(0, 16).replace('T', ' ') + ' UTC';
  }

  function isStale(data) {
    if (data.ad.iso !== ktmDateISO(Date.now())) return true;
    var ageMs = Date.now() - new Date(data.generated_at_utc).getTime();
    return ageMs > STALE_HOURS * 3600 * 1000;
  }

  function showFallback(reason) {
    if (srcEl) srcEl.textContent = reason;
  }

  function render(data) {
    if (isStale(data)) {
      showFallback('nMiti last built ' + asOfStamp(data.generated_at_utc) + ' – calendar may be stale; see nMiti (accuracy: https://namunaone.github.io/nMiti/accuracy.html)');
      return;
    }

    npEl.textContent = data.bs.label_np;
    npEl.setAttribute('lang', 'ne');
    npEl.classList.add('is-rendered');

    if (!renderedOnce) {
      npEl.setAttribute('aria-live', 'polite');
      renderedOnce = true;
    } else {
      npEl.setAttribute('aria-live', 'off');
      window.setTimeout(function () { npEl.setAttribute('aria-live', 'polite'); }, 60);
    }

    var p = document.createElement('p');
    p.className = 'bs-today-date-en';
    p.id = 'bs-today-en';
    p.textContent = data.bs.label_en + ' ';
    var span = document.createElement('span');
    span.className = 'bs-today-ad';
    span.textContent = data.ad.label_en;
    p.appendChild(span);
    if (enEl && enEl.parentNode) {
      enEl.replaceWith(p);
      enEl = p;
    }

    var bits = [
      'Source: ' + data.source,
      'tier ' + data.bs.tier,
      'evidence ' + data.bs.evidence,
      'as of ' + asOfStamp(data.generated_at_utc),
      'CC0',
      'rebuilt every 6 hours (midnight runs 00:00, 00:30, 01:00 NPT plus every 6 hours; canary re-checks 4 times daily; 26-hour staleness SLA)'
    ];
    srcEl.textContent = bits.join(', ') + ' ';
    var acc = document.createElement('a');
    acc.href = 'https://namunaone.github.io/nMiti/accuracy.html';
    acc.rel = 'noopener';
    acc.textContent = 'Accuracy ↗';
    srcEl.appendChild(acc);

    var nt = document.getElementById('numbers-today');
    if (nt) nt.textContent = 'Today in Nepal – ' + data.bs.label_np + ' – ' + data.ad.label_en;
  }

  function fetchAndUpdate() {
    if (fetching) return;
    fetching = true;
    var ctrl = new AbortController();
    var to = window.setTimeout(function () { ctrl.abort(); }, 4000);
    fetch(ENDPOINT, { signal: ctrl.signal })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        lastFetchAt = Date.now();
        render(data);
      })
      .catch(function () {
        showFallback('nMiti unreachable – calendar link below');
      })
      .finally(function () {
        window.clearTimeout(to);
        fetching = false;
      });
  }

  function armMidnightChain() {
    if (midnightTimer) window.clearTimeout(midnightTimer);
    var nowUtc = Date.now();
    var ktmNow = nowUtc + KTM_OFFSET_MS;
    var midnightUtc = Date.UTC(
      new Date(ktmNow).getUTCFullYear(),
      new Date(ktmNow).getUTCMonth(),
      new Date(ktmNow).getUTCDate(),
      0, 0, 0
    ) - KTM_OFFSET_MS;
    var runs = [0, 30, 60].map(function (m) { return midnightUtc + m * 60000; });
    var nextRun = runs.find(function (r) { return r > nowUtc; });
    if (nextRun === undefined) nextRun = runs[0] + 86400000;
    midnightTimer = window.setTimeout(function () {
      fetchAndUpdate();
      armMidnightChain();
    }, nextRun - nowUtc);
  }

  function armFallbackChain() {
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(function () {
      fetchAndUpdate();
      armFallbackChain();
    }, 6 * 3600 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { fetchAndUpdate(); armMidnightChain(); armFallbackChain(); });
  } else {
    fetchAndUpdate(); armMidnightChain(); armFallbackChain();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    if (Date.now() - lastFetchAt < THROTTLE_MS) return;
    fetchAndUpdate();
  });

  window.addEventListener('pagehide', function () {
    if (midnightTimer) window.clearTimeout(midnightTimer);
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
  });
})();
