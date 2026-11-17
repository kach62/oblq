/* ============================================================
   OBLQ · COUCHE DE COLLECTION
   À charger APRÈS app.js.

   Le problème qu'elle corrige :
   /api/collection renvoie 3,48 Mo (520 ko compressés) en
   cache-control: no-store. app.js l'appelle au chargement ET à
   chaque retour sur l'onglet (visibilitychange). Sans cache HTTP,
   chaque occurrence est un téléchargement complet.

   La réponse : stale-while-revalidate côté client.
   La collection en cache est rendue immédiatement, le réseau n'est
   consulté qu'au-delà du TTL, et l'écran n'est rafraîchi que si
   updatedAt a réellement changé.
   ============================================================ */
(() => {
  'use strict';

  const API      = '/api/collection';
  const FALLBACK = 'data-fallback.json';
  const CACHE    = 'oblq-collection-v1';
  const HDR      = 'x-oblq-fetched-at';
  const HDR_TAG  = 'x-oblq-updated-at';
  const TTL      = 10 * 60 * 1000;   // au-delà, on revalide en arrière-plan
  const MAX_AGE  = 24 * 60 * 60 * 1000; // au-delà, on attend le réseau

  const canCache = typeof caches !== 'undefined' && self.isSecureContext !== false;
  const nativeFetch = window.fetch.bind(window);

  let revalidating = false;
  let replaying = false;

  const ageOf = (res) => {
    const t = Number(res.headers.get(HDR) || 0);
    return t ? Date.now() - t : Infinity;
  };

  const stamp = (text, updatedAt) => new Response(text, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      [HDR]: String(Date.now()),
      [HDR_TAG]: String(updatedAt || '')
    }
  });

  async function store(text) {
    if (!canCache) return null;
    let updatedAt = '';
    try { updatedAt = JSON.parse(text).updatedAt || ''; } catch { /* ignoré */ }
    const cache = await caches.open(CACHE);
    await cache.put(API, stamp(text, updatedAt));
    return updatedAt;
  }

  async function cached() {
    if (!canCache) return null;
    try { return (await caches.open(CACHE)).match(API); } catch { return null; }
  }

  /* Va chercher le réseau et met le cache à jour.
     Renvoie le nouveau updatedAt, ou null si rien n'a bougé. */
  async function revalidate(previousTag) {
    if (revalidating) return null;
    revalidating = true;
    try {
      const res = await nativeFetch(API, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const updatedAt = await store(text);
      return updatedAt && updatedAt !== previousTag ? updatedAt : null;
    } catch (err) {
      console.warn('[OBLQ] revalidation impossible :', err.message);
      return null;
    } finally {
      revalidating = false;
    }
  }

  /* Rejoue le chargement d'app.js pour qu'il relise le cache frais. */
  function replay() {
    if (replaying || typeof window.refreshCollection !== 'function') return;
    replaying = true;
    Promise.resolve(window.refreshCollection())
      .finally(() => { replaying = false; });
  }

  async function serve() {
    const hit = await cached();

    if (hit) {
      const age = ageOf(hit);
      const tag = hit.headers.get(HDR_TAG) || '';

      if (age < TTL) {
        // Assez frais : aucun octet sur le réseau. C'est ce qui éteint
        // la rafale de téléchargements au retour sur l'onglet.
        return hit.clone();
      }

      if (age < MAX_AGE) {
        // On sert tout de suite, on revalide derrière, on ne rafraîchit
        // l'écran que si l'édition a effectivement changé.
        revalidate(tag).then((changed) => { if (changed) replay(); });
        return hit.clone();
      }
    }

    // Rien en cache, ou trop vieux : le réseau, puis le repli hors-ligne.
    try {
      const res = await nativeFetch(API, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      await store(text);
      return new Response(text, {
        status: 200, headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      if (hit) {
        console.warn('[OBLQ] API injoignable, collection en cache servie');
        return hit.clone();
      }
      console.warn('[OBLQ] API injoignable, repli statique :', err.message);
      return nativeFetch(FALLBACK, { cache: 'force-cache' });
    }
  }

  /* --- Interception ciblée : seul /api/collection passe par ici --- */
  window.fetch = function (input, init) {
    const url = typeof input === 'string'
      ? input
      : (input && typeof input.url === 'string' ? input.url : '');
    if (url === API || url.endsWith(API)) return serve();
    return nativeFetch(input, init);
  };

  window.OBLQCollection = {
    async purge() {
      if (canCache) await caches.delete(CACHE);
      replay();
    },
    async status() {
      const hit = await cached();
      if (!hit) return { cached: false };
      return {
        cached: true,
        ageSeconds: Math.round(ageOf(hit) / 1000),
        updatedAt: hit.headers.get(HDR_TAG) || null
      };
    }
  };
})();
