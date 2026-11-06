const CACHE_NAME='khulagi-v1.0-shell-r4';
const FILES=['./','index.html','data.js','content/raf.txt','content/bas.txt','content/greg.txt','content/cyr.txt','content/qisam.txt','content/misc.txt','content/bless.txt','content/app.txt','content/intro.txt','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','fonts/amiri-arabic-400-normal.woff2','fonts/amiri-arabic-700-normal.woff2','fonts/noto-sans-coptic-coptic-400-normal.woff2','fonts/noto-sans-coptic-latin-400-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});
