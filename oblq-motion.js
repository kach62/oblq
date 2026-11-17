/* ============================================================
   OBLQ · MOTION CONTROLLER  —  oblq-motion.js
   À charger EN DERNIER, après porto-stage.js, avec defer.
   Zéro dépendance. Zéro listener de scroll. Zéro reflow en boucle.
   ============================================================ */
(() => {
  'use strict';

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');

  /* ----------------------------------------------------------
     01 · Révélation au scroll
     IntersectionObserver, pas de listener scroll : le navigateur
     fait le travail hors du thread principal.
     ---------------------------------------------------------- */

  // Ce qui se révèle, dans l'ordre de lecture de la page.
  const REVEAL_TARGETS = [
    '.masthead > div',
    '.masthead > p',
    '.editorial-promise',
    '.edition-cadence',
    '.search-heading',
    '.search-workspace .toolbar',
    '.search-prompts',
    '.filter-panel',
    '.stage-home .stage-hero',
    '.stage-news > button',
    '.stage-item',
    'footer > *'
  ].join(',');

  const observer = ('IntersectionObserver' in window) && new IntersectionObserver(
    (entries) => {
      // Stagger calculé par paquet visible : la cadence de tirage.
      let i = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        el.style.setProperty('--reveal-delay', (i++ * 55) + 'ms');
        el.classList.add('is-in');
        observer.unobserve(el);               // une seule fois, puis on oublie
        el.addEventListener('transitionend', () => {
          el.classList.add('is-done');        // libère la couche GPU
          el.style.removeProperty('--reveal-delay');
        }, { once: true });
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
  );

  function arm(root = document) {
    if (REDUCED.matches || !observer) return;
    for (const el of root.querySelectorAll(REVEAL_TARGETS)) {
      if (el.dataset.reveal !== undefined) continue;   // déjà armé
      el.dataset.reveal = '';
      observer.observe(el);
    }
  }

  /* ----------------------------------------------------------
     02 · Le contenu est injecté dynamiquement (#content).
     On réarme, mais une seule fois par frame : un MutationObserver
     non debouncé sur une collection de 500 ko coûte des secondes.
     ---------------------------------------------------------- */

  const content = document.getElementById('content');
  if (content) {
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; arm(content); });
    }).observe(content, { childList: true, subtree: true });
  }

  /* ----------------------------------------------------------
     03 · Changement de vue : View Transitions API
     On enveloppe setView() sans le réécrire.
     ---------------------------------------------------------- */

  if (typeof window.setView === 'function' &&
      typeof document.startViewTransition === 'function') {
    const native = window.setView;
    window.setView = function (...args) {
      if (REDUCED.matches) return native.apply(this, args);
      return document.startViewTransition(() => native.apply(this, args));
    };
  }

  /* ----------------------------------------------------------
     04 · Toast : on anime l'entrée/sortie que le CSS attend.
     ---------------------------------------------------------- */

  const toast = document.getElementById('toast');
  if (toast) {
    let hide;
    new MutationObserver(() => {
      const hasText = toast.textContent.trim().length > 0;
      toast.classList.toggle('is-visible', hasText);
      clearTimeout(hide);
      if (hasText) {
        hide = setTimeout(() => toast.classList.remove('is-visible'), 3200);
      }
    }).observe(toast, { childList: true, characterData: true, subtree: true });
  }

  /* ----------------------------------------------------------
     05 · Horloge : 1 écriture par minute, alignée sur la minute,
     suspendue quand l'onglet est caché.
     Remplace setInterval(clock, 1000) — 86 400 reflows par jour.
     ---------------------------------------------------------- */

  function takeOverClock() {
    const node = document.querySelector('.stage-rail .stage-clock');
    if (!node) return;

    // Deux nœuds texte stables : plus aucun innerHTML.
    node.textContent = '';
    const dayEl = document.createElement('span');
    const timeEl = document.createElement('span');
    node.append(dayEl, document.createElement('br'), timeEl);

    const dayFmt = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris'
    });
    const timeFmt = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris'
    });

    let timer;
    const tick = () => {
      if (document.hidden) return;             // onglet caché : on ne peint pas
      const now = new Date();
      const d = dayFmt.format(now);
      const t = 'Paris, ' + timeFmt.format(now);
      if (dayEl.textContent !== d) dayEl.textContent = d;
      if (timeEl.textContent !== t) timeEl.textContent = t;
    };
    const schedule = () => {
      clearTimeout(timer);
      tick();
      // On se recale sur la seconde 0 de la minute suivante.
      const ms = 60000 - (Date.now() % 60000) + 50;
      timer = setTimeout(schedule, ms);
    };

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) schedule();
    });
    schedule();
  }

  /* ----------------------------------------------------------
     06 · Démarrage
     ---------------------------------------------------------- */

  function boot() {
    document.body.classList.add('oblq-ready');   // déclenche l'anomalie du Q
    arm();
    takeOverClock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // Si l'utilisateur change son réglage système en cours de route.
  REDUCED.addEventListener('change', () => {
    if (!REDUCED.matches) return arm();
    for (const el of document.querySelectorAll('[data-reveal]')) {
      el.classList.add('is-in', 'is-done');
    }
  });
})();

/* ============================================================
   OBLQ · MOTION, SECONDE COUCHE
   Morphing carte → fiche, masthead réactif, séquence d'ouverture.
   ============================================================ */
(() => {
  'use strict';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
  const supportsVT = typeof document.startViewTransition === 'function';

  /* --- 11 · La couverture cliquée devient celle de la fiche --- */

  let lastCover = null;
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    lastCover = btn ? btn.querySelector('img') : null;
  }, true);

  const nativeOpen = window.openDetail;
  if (typeof nativeOpen === 'function' && supportsVT) {
    window.openDetail = function (id) {
      if (REDUCED.matches) return nativeOpen.call(this, id);
      const cover = lastCover;
      if (cover) cover.style.viewTransitionName = 'oblq-cover';
      let vt;
      try {
        vt = document.startViewTransition(() => nativeOpen.call(this, id));
      } catch {
        if (cover) cover.style.viewTransitionName = '';
        return nativeOpen.call(this, id);
      }
      vt.finished.catch(() => {}).finally(() => {
        if (cover) cover.style.viewTransitionName = '';
      });
      return vt;
    };
  }

  /* --- 12 · Masthead réactif au curseur, une écriture par frame --- */

  const masthead = document.querySelector('.masthead');
  if (masthead && matchMedia('(hover: hover)').matches) {
    let mx = 0, my = 0, queued = false;
    const write = () => {
      queued = false;
      masthead.style.setProperty('--mx', mx.toFixed(3));
      masthead.style.setProperty('--my', my.toFixed(3));
    };
    masthead.addEventListener('pointermove', (e) => {
      if (REDUCED.matches) return;
      const r = masthead.getBoundingClientRect();
      // Normalisé entre -1 et 1 depuis le centre.
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!queued) { queued = true; requestAnimationFrame(write); }
    }, { passive: true });
    masthead.addEventListener('pointerleave', () => {
      mx = 0; my = 0;
      if (!queued) { queued = true; requestAnimationFrame(write); }
    }, { passive: true });
  }

  /* --- 13 · Séquence d'ouverture, une seule fois --- */

  if (!REDUCED.matches) {
    document.body.classList.add('oblq-open');
    // On retire la classe à la fin : plus aucune animation ne pèse ensuite,
    // et un re-render ne rejoue pas la séquence.
    setTimeout(() => document.body.classList.remove('oblq-open'), 1600);
  }
})();
