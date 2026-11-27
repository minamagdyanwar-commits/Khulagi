/* اختبارات انحدار سريعة للخولاجي — تُشغَّل قبل كل Merge:
     node tools/test.js
   تشغّل سيرفرا محليا بنفسها (منفذ 8766) وتفحص: صحة الجافاسكربت، ظهور رأس القراءة وأزرار المقابل،
   الدرج السفلي (فتح بالسحب فقط)، ألوان التأمل/الشرح/الهمسة المتباينة، فهرس الانتقال السريع، وأن الإعدادات مطوية.
   ترجع كود خروج ≠ ٠ لو فشل أي فحص. */
const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');
const ROOT=path.join(__dirname,'..');const PORT=8766;const U='http://localhost:'+PORT+'/index.html';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/,'')||'index.html');
  fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});r.end(d)})});
let fails=0,passes=0;const ok=(name,cond,info)=>{if(cond){passes++;console.log('  ✓',name)}else{fails++;console.log('  ✗',name,info!==undefined?'→ '+JSON.stringify(info):'')}};
const SET=(o)=>Object.assign({mode:'dark',story:false,stc:true,start:'home'},o||{});
async function page(b,settings,hash,opts){
  const ctx=await b.newContext(Object.assign({viewport:{width:390,height:850},colorScheme:'dark'},opts||{}));const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.__errs=errs;
  await p.goto(U,{waitUntil:'domcontentloaded'});
  await p.evaluate(s=>{['v16','v17','v18','v19','v20','v22'].forEach(x=>localStorage.setItem('khulagi.'+x,'1'));localStorage.setItem('khulagi.settings',JSON.stringify(s))},settings);
  await p.goto(U+hash,{waitUntil:'domcontentloaded'});await p.reload();await p.waitForTimeout(2200);return p}
(async()=>{
  await new Promise(r=>srv.listen(PORT,r));const b=await chromium.launch();
  try{
    console.log('الجافاسكربت');
    const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    const code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
    let syn=true;try{new Function(code)}catch(e){syn=e.message}ok('index.html بلا أخطاء صياغة',syn===true,syn);
    for(const f of ['calendar.js','study.js','story.js','swipe.js','live.js','guide-news.js','sw.js']){let s=true;try{new Function(fs.readFileSync(path.join(ROOT,f),'utf8'))}catch(e){s=e.message}ok(f+' بلا أخطاء صياغة',s===true,s)}
    const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');const files=(sw.match(/const FILES=\[([^\]]*)\]/)||[,''])[1].match(/'([^']+)'/g)||[];
    const missing=files.map(x=>x.replace(/'/g,'')).filter(f=>f!=='./'&&!fs.existsSync(path.join(ROOT,f)));ok('كل ملفات sw.js موجودة',!missing.length,missing);

    console.log('سلامة المحتوى');
    {const cp=require('child_process').spawnSync('node',[path.join(__dirname,'check-content.js'),'--strict'],{encoding:'utf8'});ok('ملفات المحتوى سليمة البنية (node tools/check-content.js)',cp.status===0,(cp.stdout.split('أخطاء')[1]||'').slice(0,300))}
    console.log('رأس القراءة وأزرار المقابل');
    let p=await page(b,SET({rm:'unit'}),'#/s/bas-solh');
    const hd=await p.evaluate(()=>({syb:[...document.querySelectorAll('.syb')].map(x=>x.textContent.trim()),btn:document.querySelectorAll('.unhb button').length}));
    ok('زرّا القداسين الآخرين ظاهران في الصلح الباسيلي',hd.syb.length===2&&/غريغوري/.test(hd.syb[0])&&/كيرلسي/.test(hd.syb[1]),hd);
    await p.click('.syb[data-sl="2"]');await p.waitForTimeout(900);
    ok('الزر ينقل إلى أول الصلح الكيرلسي',await p.evaluate(()=>location.hash==='#/s/cyr-solh'&&window.KH.pos().u===0));
    await p.evaluate(()=>{location.hash='#/s/bas-before-comm'});await p.waitForTimeout(900);
    ok('زر الغريغوري باهت حين لا مقابل',await p.evaluate(()=>{const x=[...document.querySelectorAll('.syb')];return x.length===2&&x[0].disabled}));
    ok('بلا أخطاء جافاسكربت',p.__errs.length===0,p.__errs);await p.context().close();

    console.log('الدرج السفلي');
    p=await page(b,SET({rm:'unit'}),'#/s/bas-hulul',{hasTouch:true});
    const h=()=>p.evaluate(()=>document.getElementById('dsheet').getAttribute('data-h'));
    ok('الدرج مغلق عند الفتح',await h()==='0');
    await p.evaluate(()=>document.querySelector('#untabs button').click());await p.waitForTimeout(250);ok('الضغط على أيقونة وهو مغلق لا يفتحه',await h()==='0');
    await p.evaluate(()=>{const t=document.querySelector('#untabs'),r=t.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;const mk=(ty,yy)=>{const c=new Touch({identifier:1,target:t,clientX:x,clientY:yy});return new TouchEvent(ty,{touches:ty==='touchend'?[]:[c],changedTouches:[c],bubbles:true,cancelable:true})};t.dispatchEvent(mk('touchstart',y));t.dispatchEvent(mk('touchmove',y-40));t.dispatchEvent(mk('touchend',y-80))});
    await p.waitForTimeout(350);ok('السحب لأعلى يفتحه',await h()==='1');
    ok('الأيقونات بلا نص ظاهر',await p.evaluate(()=>[...document.querySelectorAll('#untabs button')].every(x=>!/[؀-ۿ]/.test(x.textContent))));
    ok('بلا أخطاء جافاسكربت',p.__errs.length===0,p.__errs);await p.context().close();

    console.log('ألوان التأمل والشرح والهمسة');
    p=await page(b,SET({rm:'flow',ml:'para',wh:'open',ex:'open',medAll:'open'}),'#/s/bas-istid');
    const cols=await p.evaluate(()=>{const g=s=>{const e=document.querySelector(s);return e?getComputedStyle(e).backgroundColor:null};return {med:g('.med'),exp:g('.exp'),wh:g('.wh')}});
    {const v=Object.values(cols).filter(Boolean);ok('ألوان التأمل/الشرح/الهمسة الموجودة مختلفة عن بعضها',v.length>=2&&new Set(v).size===v.length,cols)};await p.context().close();

    console.log('الفهرس الجانبي والإعدادات');
    p=await page(b,SET({}),'#/s/bas-hulul');
    await p.evaluate(()=>document.getElementById('idxh').click());await p.waitForTimeout(500);
    ok('لوحة الانتقال السريع في أعلى الفهرس',await p.evaluate(()=>{const q=document.querySelector('.ixqj');return !!q&&q.getBoundingClientRect().top<120&&q.querySelectorAll('button').length>=8}));
    await p.evaluate(()=>{document.querySelector('.ixqj button:not(.on)').click()});await p.waitForTimeout(500);ok('زر قسم آخر ينقل إليه',await p.evaluate(()=>/^#\/g\//.test(location.hash)));
    await p.evaluate(()=>document.getElementById('btnSet').click());await p.waitForTimeout(500);
    ok('كل مجموعات الإعدادات مطوية',await p.evaluate(()=>document.querySelectorAll('.sheet .stg').length>3&&document.querySelectorAll('.sheet .stg.open').length===0));
    ok('بلا أخطاء جافاسكربت',p.__errs.length===0,p.__errs);await p.context().close();
  }catch(e){fails++;console.log('  ✗ استثناء',e.message)}
  await b.close();srv.close();
  console.log('\n'+(fails?'فشل '+fails+' من ':'نجح ')+(passes+fails)+' فحصا');process.exit(fails?1:0)})();
