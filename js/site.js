(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Year in footer
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Header: background after scroll, hide on scroll down
  var header = document.getElementById('header');
  var lastY = window.scrollY;
  var onScroll = function () {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 10);
    if (!document.body.classList.contains('menu-open')) header.classList.toggle('hide', y > lastY && y > 500);
    lastY = y;
    updateStatement();
  };

  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  var setOpen = function (open) {
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  btn.addEventListener('click', function () { setOpen(!document.body.classList.contains('menu-open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });

  // Active nav link
  if ('IntersectionObserver' in window) {
    var links = $$('.nav a[href^="#"]');
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['services', 'work', 'experience', 'stack', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) sio.observe(s); });
  }

  // Reveal on scroll with sibling stagger
  var items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var seen = new Map();
    items.forEach(function (el) {
      var n = seen.get(el.parentElement) || 0;
      el.style.setProperty('--d', Math.min(n, 5) * 0.08 + 's');
      seen.set(el.parentElement, n + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Statement: words light up as you scroll
  var stmt = document.querySelector('[data-words]');
  var words = [];
  if (stmt) {
    stmt.innerHTML = stmt.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    words = $$('.w', stmt);
    if (reduced) words.forEach(function (w) { w.classList.add('on'); });
  }
  function updateStatement() {
    if (!words.length || reduced) return;
    var r = stmt.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
    p = Math.max(0, Math.min(1, p));
    var lit = Math.round(p * words.length);
    words.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateStatement);
  onScroll();

  // Services accordion (one open at a time)
  var rows = $$('.svc__row');
  rows.forEach(function (row) {
    row.addEventListener('click', function () {
      var open = row.getAttribute('aria-expanded') === 'true';
      rows.forEach(function (r) { r.setAttribute('aria-expanded', 'false'); });
      row.setAttribute('aria-expanded', String(!open));
    });
  });

  // Count-up numbers
  var counters = $$('[data-count]');
  var run = function (el) {
    var end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '', dec = (el.dataset.count.split('.')[1] || '').length;
    if (reduced) { el.textContent = end.toFixed(dec) + suf; return; }
    var t0 = performance.now(), dur = 1600;
    var tick = function (t) {
      var p = Math.min((t - t0) / dur, 1), v = end * (1 - Math.pow(1 - p, 4));
      el.textContent = v.toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  } else counters.forEach(run);

  // Project preview fallback: show the branded placeholder if a screenshot fails
  $$('.proj__img img').forEach(function (img) {
    var fail = function () { img.parentElement.classList.add('failed'); };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  // Contact form -> opens email app with a prefilled message
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      $$('.error', form).forEach(function (el) { el.remove(); });
      var firstInvalid = null;
      $$('[required]', form).forEach(function (field) {
        if (!field.value.trim() || !field.checkValidity()) {
          var msg = document.createElement('span');
          msg.className = 'error';
          msg.textContent = field.type === 'email' && field.value ? 'Please enter a valid email.' : 'This field is required.';
          field.parentElement.appendChild(msg);
          field.setAttribute('aria-invalid', 'true');
          if (!firstInvalid) firstInvalid = field;
        } else {
          field.removeAttribute('aria-invalid');
        }
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      var data = new FormData(form);
      var subject = 'Project enquiry: ' + data.get('type') + ' — ' + data.get('name');
      var body = 'Name: ' + data.get('name') + '\nEmail: ' + data.get('email') +
        '\nNeed: ' + data.get('type') + '\n\n' + data.get('message');
      window.location.href = 'mailto:dishahingu3007@gmail.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
