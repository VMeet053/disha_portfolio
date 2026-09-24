(function () {
  'use strict';

  // Year in footer
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Header border on scroll
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    var setOpen = function (open) {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () { setOpen(!menu.classList.contains('open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  // Reveal on scroll (content is visible by default if this never runs)
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Project preview fallback: show the branded placeholder if a screenshot fails
  document.querySelectorAll('.preview img').forEach(function (img) {
    var fail = function () { img.parentElement.classList.add('failed'); };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  // Contact form -> opens email app with a prefilled message
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.querySelectorAll('.error').forEach(function (el) { el.remove(); });
      var firstInvalid = null;
      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.checkValidity()) {
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
