/* Портфоліо — невеликі інтерактивні деталі, без залежностей */
(function () {
  'use strict';

  /* --- рік у підвалі --- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* --- індикатор прокрутки + «прилипла» шапка --- */
  var bar = document.getElementById('progressBar');
  var topbar = document.querySelector('.topbar');
  var ticking = false;

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.scrollY || doc.scrollTop;

    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (topbar) topbar.classList.toggle('is-stuck', y > 40);

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* --- поява блоків при прокрутці --- */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    reveals.forEach(function (el, i) {
      // невелика каскадна затримка для сусідніх карток
      el.style.transitionDelay = (i % 5) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* --- підсвітка активного пункту меню --- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.topbar__nav a'));
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    targets.forEach(function (el) { navIO.observe(el); });
  }

  /* --- легкий паралакс фото в герої --- */
  // трансформуємо саме <img>: у контейнера є власна анімація появи,
  // а вона в каскаді перебиває інлайнові стилі
  var heroPhoto = document.querySelector('.hero__photo img');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroPhoto && !reduced) {
    var raf = false;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          heroPhoto.style.transform = 'translateY(' + (y * 0.12) + 'px)';
        }
        raf = false;
      });
    }, { passive: true });
  }
})();
