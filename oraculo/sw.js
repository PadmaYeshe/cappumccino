// Network first for the page (so updates always arrive when online); cache as offline fallback.
const CACHE="mo-iching-v5";
const CORE=["./","index.html","manifest.webmanifest","apple-touch-icon.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  const font=u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com";
  if(u.origin!==location.origin&&!font)return;
  if(font){
    e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r})));
    return;
  }
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r})
    .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(h=>h||caches.match("index.html"))));
});
