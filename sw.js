// Thin Veil service worker: lets the game be installed and played offline after one online visit.
// The game page is always fetched fresh when online (so updates arrive at once); the saved copy is only used offline.
// three.js and the font come from CDNs and never change at a fixed version, so they are kept once fetched.
const CACHE='thin-veil-v1';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // network first: fresh game when online, saved copy when not
    e.respondWith(fetch(r).then(res=>{ if(res&&res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })
      .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):undefined))));
    return;
  }
  if(/cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname)){
    // cache first for the fixed-version libraries and the font
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res&&(res.ok||res.type==='opaque')){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })));
  }
});
