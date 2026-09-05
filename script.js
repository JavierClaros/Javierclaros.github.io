/* ============================================================
   MotoReclamo — script.js  v2.0
   Lógica principal: formulario honesto, WhatsApp con estados
   diferenciados, fallback, menú mobile, animaciones.
   ============================================================ */

'use strict';

/* ---- Google Ads: helper para links externos con tracking ---- */
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

/* ============================================================
   CONFIGURACIÓN
   ============================================================ */

/* Endpoint configurable: dejar vacío hasta tener backend real.
   Cuando se configure, el formulario enviará los datos por
   fetch() ANTES de abrir WhatsApp. */
var FORM_ENDPOINT = ''; /* [FORM_ENDPOINT PENDIENTE] */

var WA_NUMBER     = '5491164677648';
var WA_DISPLAY    = '11-6467-7648';
var WA_FALLBACK_URL = 'https://wa.me/' + WA_NUMBER +
  '?text=' + encodeURIComponent('Hola, quiero consultar por un accidente de moto.');

/* ============================================================
   UTILIDADES
   ============================================================ */

/* ---- Disparar evento de analítica (GA4 + Ads) ---- */
function dispararEvento(nombre, params) {
  if (typeof gtag === 'function') {
    gtag('event', nombre, params || {});
  }
}

/* ---- Toast de notificación ---- */
function mostrarToast(icono, msg, tipo, duracion) {
  var toast = document.getElementById('toast');
  var msgEl = document.getElementById('toast-msg');
  if (!toast) return;

  toast.classList.remove('toast-success', 'toast-warning', 'toast-error');
  if (tipo) toast.classList.add('toast-' + tipo);

  var iconoEl = toast.querySelector('[aria-hidden]');
  if (iconoEl) iconoEl.innerHTML = icono;
  if (msgEl)   msgEl.innerHTML = msg;

  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, duracion || 6000);
}

/* Alias legacy para compatibilidad */
function showToast(msg, duration) {
  mostrarToast('✅', msg, 'success', duration || 4500);
}

/* ============================================================
   FORMULARIO DE CONTACTO
   Estados reales diferenciados:
     form_start → form_submit → whatsapp_opened | whatsapp_blocked
   NUNCA se muestra "consulta enviada" si solo se abrió WA.
   ============================================================ */

/* ---- Validación explícita (novalidate activo) ---- */
function validarFormulario() {
  var nombre   = document.getElementById('name');
  var telefono = document.getElementById('phone');
  var mensaje  = document.getElementById('message');
  var ok = true;

  [nombre, telefono, mensaje].forEach(function (el) {
    if (el) el.style.borderColor = '';
  });

  if (!nombre || nombre.value.trim().length < 2) {
    if (nombre) nombre.style.borderColor = '#ef4444';
    ok = false;
  }

  /* Acepta formatos argentinos: espacios, guiones, paréntesis, + */
  var telVal = telefono ? telefono.value.trim() : '';
  if (!/^[\d\s\-\+\(\)]{7,20}$/.test(telVal)) {
    if (telefono) telefono.style.borderColor = '#ef4444';
    ok = false;
  }

  if (!mensaje || mensaje.value.trim().length < 10) {
    if (mensaje) mensaje.style.borderColor = '#ef4444';
    ok = false;
  }

  return ok;
}

/* ---- Construir URL de WhatsApp ---- */
function construirUrlWA() {
  var nombre   = (document.getElementById('name')    || {}).value || '';
  var telefono = (document.getElementById('phone')   || {}).value || '';
  var email    = (document.getElementById('email')   || {}).value || '';
  var mensaje  = (document.getElementById('message') || {}).value || '';

  var texto =
    '\uD83C\uDFCD\uFE0F *Nueva Consulta desde MotoReclamo*\n\n' +
    '*Nombre:* '   + nombre.trim()   + '\n' +
    '*Tel\u00e9fono:* ' + telefono.trim() + '\n' +
    (email.trim() ? '*Email:* ' + email.trim() + '\n' : '') +
    '*Consulta:* ' + mensaje.trim();

  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(texto);
}

/* ---- Intentar registrar lead en backend (si está configurado) ---- */
function registrarLead(datos) {
  if (!FORM_ENDPOINT) {
    return Promise.resolve({ ok: false, sinBackend: true });
  }
  return fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
    .then(function (res) { return { ok: res.ok }; })
    .catch(function ()   { return { ok: false };  });
}

/* ---- Icono WA para toast ---- */
var WA_ICON_HTML =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" ' +
  'aria-hidden="true" style="flex-shrink:0">' +
  '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15' +
  '-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475' +
  '-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52' +
  '.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207' +
  '-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372' +
  '-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 ' +
  '5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 ' +
  '1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347' +
  'm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648' +
  '-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 ' +
  '5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884' +
  'm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 ' +
  '4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 ' +
  '11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' +
  '</svg>';

/* ---- Handler principal del formulario ---- */
(function () {
  var form = document.getElementById('contactForm');
  if (!form) return;

  /* form_start: primer foco en cualquier campo */
  var formStarted = false;
  form.querySelectorAll('input, textarea').forEach(function (el) {
    el.addEventListener('focus', function () {
      if (formStarted) return;
      formStarted = true;
      dispararEvento('form_start');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validarFormulario()) {
      mostrarToast('\u26a0\ufe0f',
        'Por favor complet\u00e1 todos los campos correctamente.',
        'warning', 4000);
      return;
    }

    dispararEvento('form_submit');

    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Procesando\u2026'; }

    var datos = {
      nombre:    (document.getElementById('name')    || {}).value || '',
      telefono:  (document.getElementById('phone')   || {}).value || '',
      email:     (document.getElementById('email')   || {}).value || '',
      mensaje:   (document.getElementById('message') || {}).value || '',
      fuente:    'formulario_contacto',
      timestamp: new Date().toISOString()
    };

    registrarLead(datos).then(function (resultado) {

      var waUrl    = construirUrlWA();
      var waWindow = null;
      try { waWindow = window.open(waUrl, '_blank', 'noopener,noreferrer'); }
      catch (err) { waWindow = null; }

      var waAbierto = waWindow !== null;

      if (waAbierto) {
        dispararEvento('whatsapp_opened', { event_category: 'contacto' });
        /* Conversión de Google Ads: solo cuando WA se abrió efectivamente */
        if (typeof gtag === 'function') {
          gtag('event', 'ads_conversion_Contacto_1');
        }
      } else {
        dispararEvento('whatsapp_blocked', { event_category: 'contacto' });
      }

      if (waAbierto) {
        mostrarToast(WA_ICON_HTML,
          '\u00a1Listo! Te preparamos el mensaje.<br>' +
          '<small>Revis\u00e1 WhatsApp y toc\u00e1 <strong>Enviar</strong> para contactarnos.</small>',
          'success', 7000);
      } else {
        mostrarToast('\u26a0\ufe0f',
          'No pudimos abrir WhatsApp autom\u00e1ticamente.<br>' +
          '<small>Escrib\u00ednos al <strong>' + WA_DISPLAY + '</strong>: ' +
          '<a href="' + WA_FALLBACK_URL + '" target="_blank" rel="noopener noreferrer" ' +
          'style="color:#FFB800;font-weight:700;">Abrir WhatsApp</a></small>',
          'warning', 10000);
      }

      if (btn) { btn.disabled = false; btn.textContent = 'Enviar consulta'; }

    });
  });
})();

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
        dispararEvento('faq_open', {
          faq_question: toggle.textContent.trim().substring(0, 80)
        });
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



/* ---- Video Presentación — overlay de play ---- */
(function () {
  var overlay = document.getElementById('video-play-overlay');
  var video   = document.getElementById('video-motoreclamo');
  if (!overlay || !video) return;

  function hideOverlay() {
    overlay.classList.add('hidden');
    video.play();
    dispararEvento('video_play');
  }

  /* Click en el overlay */
  overlay.addEventListener('click', hideOverlay);

  /* Accesibilidad: Enter o Space también reproducen */
  overlay.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      hideOverlay();
    }
  });

  /* Si el usuario pausa, vuelve a mostrar el overlay */
  video.addEventListener('pause', function () {
    if (video.ended) return; /* no mostrar si terminó */
    overlay.classList.remove('hidden');
  });

  /* Si reanuda desde los controles nativos, ocultar overlay */
  video.addEventListener('play', function () {
    overlay.classList.add('hidden');
  });

  video.addEventListener('ended', function () {
    dispararEvento('video_complete');
  });
})();
