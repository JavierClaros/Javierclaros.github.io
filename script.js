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
  });
})();
