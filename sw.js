// DocMan2021 Hoops service worker: works offline, updates in the background.
const V="hoops-8d9978b677",CORE=["./","index.html","league-data.json","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"].concat(["assets/props2/door.png", "assets/props2/trophycase.png", "assets/props2/pennant.png", "assets/props2/bulletin.png", "assets/props2/hoop_06.png", "assets/props2/doubledoor.png", "assets/maps/hall.png", "assets/bg/city_day.png", "assets/bg/city_night.png", "assets/bg/city_sunset.png", "assets/hoops/pA.png", "assets/hoops/pB.png"]);
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)))});
self.addEventListener("message",e=>{if(e.data==="skip")self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=="hoops-fonts").map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET")return;
  if(u.hostname.includes("fonts.googleapis.com")||u.hostname.includes("fonts.gstatic.com")){e.respondWith(caches.open("hoops-fonts").then(async c=>{const hit=await c.match(e.request);const net=fetch(e.request).then(r=>{if(r.ok||r.type==="opaque")c.put(e.request,r.clone());return r}).catch(()=>hit);return hit||net}));return}
  if(u.origin!==location.origin)return;
  e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});if(hit)return hit;const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>caches.match("index.html")));
});
