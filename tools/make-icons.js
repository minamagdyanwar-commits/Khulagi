/* يولّد icon-192.png و icon-512.png من tools/icon.svg:   node tools/make-icons.js
   الأيقونة: نافذة مقوّسة بسماء الفجر وصليب قبطي ذهبي؛ المحتوى داخل ٧٠٪ الوسطى لتناسب maskable. */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const b=await chromium.launch();const svg=fs.readFileSync(path.join(__dirname,'icon.svg'),'utf8');
for(const [n,sz] of [['icon-512.png',512],['icon-192.png',192]]){const p=await b.newPage({viewport:{width:sz,height:sz}});
 await p.setContent('<html><body style="margin:0;background:#120f0b">'+svg.replace('width="512" height="512"','width="'+sz+'" height="'+sz+'"')+'</body></html>');
 await p.screenshot({path:path.join(__dirname,'..',n)});await p.close()}
await b.close();console.log('تم')})();
