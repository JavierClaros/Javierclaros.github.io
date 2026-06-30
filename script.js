/* ============================================================
   MotoReclamo — script.js
   Lógica principal: Google Ads, formulario WhatsApp,
   menú mobile y animaciones de scroll reveal.
   ============================================================ */

'use strict';

/* ---- Google Ads: conversión ---- */
function gtagSendEvent(url) {
  var callback = function () {
    if (typeof url === 'string') {
      window.location = url;
    }
  };
  if (typeof gtag === 'function') {
    gtag('event', 'ads_conversion_Contacto_1', {
      'event_callback': callback,
      'event_timeout': 2000,
    });
  } else {
    callback();
  }
  return false;
}

/* ---- Formulario: envío por WhatsApp ---- */
function enviarWhatsApp(e) {
  e.preventDefault();

  var nombre  = document.getElementById('name').value.trim();
  var telefono = document.getElementById('phone').value.trim();
  var email   = document.getElementById('email').value.trim();
  var mensaje = document.getElementById('message').value.trim();

  var texto =
    '🏍️ *Nueva Consulta desde MotoReclamo*\n\n' +
    '*Nombre:* '   + nombre   + '\n' +
    '*Teléfono:* ' + telefono + '\n' +
    '*Email:* '    + email    + '\n' +
    '*Mensaje:* '  + mensaje;

  var url = 'https://wa.me/5491164677648?text=' + encodeURIComponent(texto);
  window.open(url, '_blank');
  return false;
}

/* ---- Menú Mobile ---- */
(function () {
  var btnOpen  = document.getElementById('btn-menu-open');
  var btnClose = document.getElementById('btn-menu-close');
  var menu     = document.getElementById('mobile-menu');

  if (!btnOpen || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    btnOpen.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('open');
    btnOpen.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btnOpen.addEventListener('click', openMenu);
  if (btnClose) btnClose.addEventListener('click', closeMenu);

  /* Cerrar al hacer clic en un enlace del menú */
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Cerrar con la tecla Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
    }
  });
})();

/* ---- Scroll Reveal (IntersectionObserver) ---- */
(function () {
  var elements = document.querySelectorAll(
    'section, .reveal, nav > div > div, footer > div > div > div'
  );

  /* Añadir clase reveal solo a elementos que no la tienen */
  elements.forEach(function (el) {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); /* animar solo una vez */
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
})();

/* ---- Vincular formulario al handler ---- */
(function () {
  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    gtag('event', 'ads_conversion_Contacto_1');
    enviarWhatsApp(e);
    showToast('¡Consulta enviada! Te contactaremos a la brevedad. 🏙️');
  });
})();

/* ============================================================
   MotoReclamo — Mejoras profesionales v2
   ============================================================ */

/* ---- Preloader: fade-out al cargar ---- */
(function () {
  window.addEventListener('load', function () {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;
    setTimeout(function () {
      preloader.classList.add('fade-out');
    }, 650);
  });
})();

/* ---- Contadores animados (IntersectionObserver) ---- */
(function () {
  var counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el       = entry.target;
      var target   = parseInt(el.dataset.target, 10);
      var suffix   = el.dataset.suffix || '';
      var duration = 1600;
      var startTime = null;

      function tick(now) {
        if (!startTime) startTime = now;
        var elapsed  = now - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3); /* ease-out cúbico */
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(function (el) { observer.observe(el); });
})();

/* ---- FAQ Acordeón ---- */
(function () {
  var items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(function (item) {
    var toggle = item.querySelector('.faq-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      /* Cerrar todos */
      items.forEach(function (i) {
        i.classList.remove('open');
        var t = i.querySelector('.faq-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });

      /* Abrir el clickeado si estaba cerrado */
      if (!isOpen) {
        item.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ---- Active nav link (IntersectionObserver) ---- */
(function () {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.desktop-nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      navLinks.forEach(function (link) {
        link.classList.remove('nav-link-active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('nav-link-active');
        }
      });
    });
  }, { threshold: 0.35, rootMargin: '-10% 0px -55% 0px' });

  sections.forEach(function (section) { observer.observe(section); });
})();

/* ---- Parallax sutil en el hero ---- */
(function () {
  var heroBg = document.getElementById('hero-bg-img');
  if (!heroBg) return;

  var ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        var scrollY = window.scrollY || window.pageYOffset;
        heroBg.style.transform = 'translateY(' + (scrollY * 0.22) + 'px)';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ---- Toast de notificación ---- */
function showToast(msg, duration) {
  var toast = document.getElementById('toast');
  var msgEl = document.getElementById('toast-msg');
  if (!toast) return;
  if (msgEl && msg) msgEl.textContent = msg;
  toast.classList.add('show');
  setTimeout(function () {
    toast.classList.remove('show');
  }, duration || 4500);
}

