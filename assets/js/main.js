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
