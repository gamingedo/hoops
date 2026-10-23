// Hoops Dynasty service worker: the game works offline; fonts and player photos are kept once seen.
const V="dynasty-bb94a78cc5",CORE=["./","index.html","manifest.webmanifest","icons/icon-192-v3.png","icons/icon-512-v3.png","icons/apple-touch-icon-v3.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("dynasty-")&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET")return;
  const side=u.hostname.includes("fonts.g")?"dyn-fonts":u.hostname==="cdn.nba.com"?"dyn-photos":null;
  if(side){e.respondWith(caches.open(side).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;try{const r=await fetch(e.request);if(r.ok||r.type==="opaque")c.put(e.request,r.clone());return r}catch(err){return hit||Response.error()}}));return}
  if(u.origin!==location.origin)return;
  /* the game's own files: try the network for a fresh copy, but never wait more than 2.5 seconds for it (a weak signal
     on the road), and fall back to the saved copy at once when there's no signal */
  e.respondWith((async()=>{const saved=()=>caches.match(e.request,{ignoreSearch:true}).then(h=>h||caches.match("index.html"));
    const net=fetch(e.request.url,{cache:"no-store"}).then(r=>{if(r.ok){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp))}return r});
    const slow=new Promise(res=>setTimeout(()=>res("slow"),2500));
    try{const r=await Promise.race([net,slow]);if(r!=="slow")return r;const h=await saved();return h||await net}catch(err){return saved()}})());
});