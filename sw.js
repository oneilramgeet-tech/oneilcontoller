// Offline support for the DJ O'Neil phone app.
// The first visit saves the app on the phone; after that it opens from the phone even with no internet.
// When you're online it quietly fetches the newest version in the background, which shows up next time you open the app.
const VERSION = '20261112-184219';   // update-phone-app.ps1 changes this each time you copy in a new mixer
const CACHE = 'djoneil-' + VERSION;
const FILES = ['./', 'index.html', 'phone.css', 'phone.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('djoneil-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === 'navigate' ? 'index.html' : req;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(key, { ignoreSearch: true });
    const fresh = fetch(req).then(r => { if (r.ok && r.type === 'basic') c.put(key, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(fresh); return hit; }
    return (await fresh) || new Response('Offline', { status: 503 });
  }));
});
