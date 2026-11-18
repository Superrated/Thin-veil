// Thin Veil: the smallest service worker that lets browsers offer "install". It caches nothing; the game always loads fresh.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
