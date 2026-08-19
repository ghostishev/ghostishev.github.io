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

  /* --- перегляд на весь екран: сертифікат або карусель --- */
  var box = document.getElementById('lightbox');
  var boxImg = document.getElementById('lightboxImg');
  var boxText = document.getElementById('lightboxText');
  var boxCount = document.getElementById('lightboxCount');
  var btnPrev = box && box.querySelector('.lightbox__nav--prev');
  var btnNext = box && box.querySelector('.lightbox__nav--next');
  var lastFocused = null;

  var slides = [];   // список джерел поточної галереї
  var index = 0;
  var caption = '';
  var altText = '';

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function show(i) {
    if (!slides.length) return;
    index = (i + slides.length) % slides.length;
    boxImg.src = slides[index];
    boxImg.alt = slides.length > 1
      ? altText + ' — слайд ' + (index + 1) + ' з ' + slides.length
      : altText;
    boxText.textContent = caption;
    boxCount.textContent = (index + 1) + ' / ' + slides.length;
    boxCount.hidden = slides.length < 2;
    if (btnPrev) btnPrev.hidden = slides.length < 2;
    if (btnNext) btnNext.hidden = slides.length < 2;
  }

  function openBox(fig) {
    var img = fig.querySelector('img');
    var cap = fig.querySelector('figcaption');
    var title = cap && cap.querySelector('h3');
    var dir = fig.getAttribute('data-gallery');
    var count = parseInt(fig.getAttribute('data-count'), 10);

    if (dir && count > 0) {
      // карусель: images/works/<slug>/01.jpg … <count>.jpg
      slides = [];
      for (var i = 1; i <= count; i++) slides.push(dir + '/' + pad(i) + '.jpg');
    } else {
      if (!img) return;
      slides = [img.currentSrc || img.src];
    }

    altText = img ? img.alt : '';
    caption = title ? title.textContent : (cap ? cap.textContent : '');

    lastFocused = fig;
    show(0);
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    box.querySelector('.lightbox__close').focus();
  }

  function closeBox() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
    // прибираємо джерело трохи згодом, щоб не блимало під час закриття
    window.setTimeout(function () {
      if (!box.classList.contains('is-open')) boxImg.src = '';
    }, 400);
  }

  if (box) {
    document.querySelectorAll('.cert, .work').forEach(function (fig) {
      fig.addEventListener('click', function () { openBox(fig); });
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openBox(fig);
        }
      });
    });

    // клік по тлу закриває, клік по стрілках і зображенні — ні
    box.addEventListener('click', function (e) {
      if (e.target === btnPrev || e.target === btnNext || e.target === boxImg) return;
      closeBox();
    });

    if (btnPrev) btnPrev.addEventListener('click', function () { show(index - 1); });
    if (btnNext) btnNext.addEventListener('click', function () { show(index + 1); });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeBox();
      else if (e.key === 'ArrowRight') show(index + 1);
      else if (e.key === 'ArrowLeft') show(index - 1);
    });

    /* --- гортання свайпом --- */
    var touchX = null;
    box.addEventListener('touchstart', function (e) {
      touchX = e.changedTouches[0].clientX;
    }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (touchX === null || slides.length < 2) return;
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

})();
