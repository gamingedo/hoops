// Hoops Dynasty service worker: the game works offline; fonts and player photos are kept once seen.
const V="dynasty-115e85382e",CORE=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("dynasty-")&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET")return;
  const side=u.hostname.includes("fonts.g")?"dyn-fonts":u.hostname==="cdn.nba.com"?"dyn-photos":null;
  if(side){e.respondWith(caches.open(side).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;try{const r=await fetch(e.request);if(r.ok||r.type==="opaque")c.put(e.request,r.clone());return r}catch(err){return hit||Response.error()}}));return}
  if(u.origin!==location.origin)return;
  e.respondWith(fetch(e.request.url,{cache:"no-store"}).then(r=>{if(r.ok)caches.open(V).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(h=>h||caches.match("index.html"))));
});