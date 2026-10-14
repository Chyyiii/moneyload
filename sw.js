/* Кассовая книга: работа без интернета. Файлы приложения сохраняются при первом открытии. */
var V = 'kassa-v1';
var CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== location.origin && !/(^|\.)(googleapis|gstatic)\.com$/.test(u.hostname)) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(r).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) {
        var cp = res.clone();
        caches.open(V).then(function (c) { c.put(r, cp); });
      }
      return res;
    }).catch(function () {
      return hit || (r.mode === 'navigate' ? caches.match('index.html') : Response.error());
    });
    return hit || net;
  }));
});
