const CACHE='matekopera-v6';
const ROOT=new URL('./',self.location.href).href;
self.addEventListener('install',e=>{e.waitUntil((async()=>{const cache=await caches.open(CACHE);const res=await fetch(ROOT);await cache.put(ROOT,res.clone());const html=await res.text();const urls=[...html.matchAll(/(?:src|href)="([^"\s]+\.(?:js|css))"/g)].map(m=>new URL(m[1],ROOT).href);await cache.addAll(urls);await self.skipWaiting();})());});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return res}).catch(()=>caches.match(e.request).then(res=>res|| (e.request.mode==='navigate'?caches.match(ROOT):Response.error()))));});
