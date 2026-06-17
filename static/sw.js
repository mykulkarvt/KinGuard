// KinGuard service worker — makes the app installable, works offline for the
// static shell, and shows push notifications. It deliberately does NOT cache
// /api/ so alerts stay live.

// Shared RULES/UI tables so a push notification uses the same wording + language
// as the rest of the app.
importScripts('/static/rules.js');

const CACHE = 'kinguard-v4';   // bump when cached assets (rules.js, templates) change
const ASSETS = [
  '/', '/senior', '/family', '/setup',
  '/static/style.css', '/static/rules.js', '/static/manifest.json',
  '/static/icon-192.png', '/static/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// A push arrived from the server — show it even if every KinGuard tab is closed.
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) {}
  const lang = (typeof langOf === 'function') ? langOf({ lang: d.lang }) : 'hi';
  const U = (typeof UI !== 'undefined' && UI[lang]) ? UI[lang] : null;
  const R = (typeof RULES !== 'undefined' && RULES[lang]) ? RULES[lang] : null;
  const senior = d.senior || '';
  const title = U ? fmt(U.maybeScam, { senior }) : '🛡️ KinGuard';
  const body = (R && d.rule && R[d.rule]) ? R[d.rule].label : '';
  e.waitUntil(self.registration.showNotification(title, {
    body: body,
    icon: '/static/icon-192.png',
    badge: '/static/icon-192.png',
    lang: lang,
    tag: 'kinguard-alert',
    renotify: true,
    requireInteraction: true,
    vibrate: [400, 200, 400, 200, 400],
    data: { url: '/family' }
  }));
});

// Tapping the notification focuses an open family tab, or opens /family.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/family';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
    for (const w of wins) {
      if (w.url.indexOf('/family') !== -1 && 'focus' in w) return w.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Live data (alerts, settings) must always hit the network — never cache it.
  if (url.pathname.startsWith('/api/')) return;
  // Everything else: serve from cache, fall back to network.
  e.respondWith(
    caches.match(e.request).then(
      (cached) => cached || fetch(e.request).catch(() => caches.match('/'))
    )
  );
});
