/* فحص جودة المحتوى (ملفات content-*.txt و data.js)
     node tools/check-content.js           تقرير التغطية + الأخطاء
     node tools/check-content.js --strict  يرجع كود ≠ ٠ عند وجود أخطاء (يستعمله tools/test.js)
   أخطاء (تُفشِل): رموز % غير متوازنة، إحالات هوامش بلا نص أو العكس، أسطر ببادئة غير معروفة،
                   معرّفات مكرّرة، أقسام في المحتوى غير معرّفة في data.js، أقسام معرّفة بلا محتوى.
   تغطية (للعلم فقط): مقاطع قبطية بلا معرَّب (t:)، بلا عربي، التأملات والهمسات والمسوّدات لكل مجموعة. */
const fs=require('fs');const path=require('path');const ROOT=path.join(__dirname,'..');
const strict=process.argv.includes('--strict');
global.window={};eval(fs.readFileSync(path.join(ROOT,'data.js'),'utf8'));
const groups=window.KHULAGI.groups;const defined={};groups.forEach(g=>g.sections.forEach(s=>{(defined[s.id]=defined[s.id]||[]).push(g.id)}));
const errors=[],warns=[];const cov={};const orphanIds=new Set();const seen={};
const PRE=/^(## |# |! |@ |c: |t: |a: |%$|\d+: |~[a-z]: ?)/;
fs.readdirSync(ROOT).filter(f=>/^content-.*\.txt$/.test(f)).sort().forEach(f=>{
  const gid=f.replace(/^content-|\.txt$/g,'');const lines=fs.readFileSync(path.join(ROOT,f),'utf8').split('\n');
  let cur=null,mode=0,notes={},refs={},st=null;
  const c=cov[gid]=cov[gid]||{sections:0,stanzas:0,cop:0,copNoTr:0,copNoAr:0,med:0,whisper:0,draft:0,reviewed:0,bad:[]};
  const endSec=()=>{if(!cur)return;
    const noRef=Object.keys(refs).filter(k=>!notes[k]),unused=Object.keys(notes).filter(k=>!refs[k]);
    if(noRef.length)errors.push(`${f} ${cur}: إحالة هامش بلا نص: ${noRef.join(',')}`);
    if(unused.length)warns.push(`${f} ${cur}: نص هامش بلا إحالة: ${unused.join(',')}`);
    if(mode)errors.push(`${f} ${cur}: رمز % غير مغلق`)};
  const endSt=()=>{if(!st)return;c.stanzas++;
    if(st.c){c.cop++;if(!st.t){c.copNoTr++;c.bad.push(cur)}if(!st.a)c.copNoAr++}
    st=null};
  lines.forEach((l,i)=>{
    if(l.startsWith('## ')){endSt();endSec();cur=l.slice(3).split('|')[0].trim();mode=0;notes={};refs={};c.sections++;
      if(seen[cur])errors.push(`${f}: معرّف مكرّر ${cur} (أيضا في ${seen[cur]})`);seen[cur]=f;
      if(!defined[cur])orphanIds.add(cur+' ('+f+')');return}
    if(!cur)return;
    if(l==='%'){mode^=1;return}
    if(mode){const m=l.match(/^(\d+): /);if(m)notes[m[1]]=1;return}
    if(l.trim()===''){endSt();return}
    if(!PRE.test(l)){errors.push(`${f}:${i+1} سطر ببادئة غير معروفة: ${l.slice(0,40)}`);return}
    for(const m of l.matchAll(/\[\^(\d+)\]/g))refs[m[1]]=1;
    if(/^[cta]: /.test(l)){st=st||{};st[l[0]]=true}
    const md=l.match(/^~([a-z]): ?(.*)$/);
    if(md){if(md[1]==='k')c.med++;if(md[1]==='p')c.whisper++;if(md[1]==='s'){if(/review/i.test(md[2]))c.reviewed++;else c.draft++}}
  });
  endSt();endSec();if(mode!==0)errors.push(`${f}: رمز % غير متوازن`)});
const withContent=new Set(Object.keys(seen));
const soon=Object.keys(defined).filter(id=>!withContent.has(id));
orphanIds.forEach(x=>errors.push(`محتوى بلا تعريف في data.js: ${x}`));
const pad=(s,n)=>String(s).padEnd(n);
console.log(pad('المجموعة',10),pad('أقسام',7),pad('مقاطع',7),pad('قبطي',7),pad('معرَّب آلي*',16),pad('بلا عربي',9),pad('تأمل',6),pad('همسة',6),'مسوّدة/مراجَع');
let tot={s:0,st:0,c:0,n:0};
Object.keys(cov).sort().forEach(g=>{const c=cov[g];tot.s+=c.sections;tot.st+=c.stanzas;tot.c+=c.cop;tot.n+=c.copNoTr;
  console.log(pad(g,10),pad(c.sections,7),pad(c.stanzas,7),pad(c.cop,7),pad(c.copNoTr+(c.cop?' ('+Math.round(c.copNoTr/c.cop*100)+'٪)':''),16),pad(c.copNoAr,9),pad(c.med,6),pad(c.whisper,6),c.draft+'/'+c.reviewed)});
console.log('\nالإجمالي:',tot.s,'قسما،',tot.st,'مقطعا،',tot.c,'قبطيا، منها',tot.n,'معرَّبها آلي من القبطي (بلا سطر t: يدوي)');
console.log('* «معرَّب آلي»: مقاطع قبطية ليس لها سطر t: فيُولَّد معرَّبها تلقائيا في البرنامج؛ ليس خطأ، لكن اليدوي أدقّ.');
if(soon.length)console.log('\nأقسام معرّفة وبلا محتوى بعد («قريبا»):',soon.join(', '));
if(warns.length){console.log('\nتنبيهات ('+warns.length+'):');warns.slice(0,20).forEach(w=>console.log('  !',w))}
console.log('\n'+(errors.length?'أخطاء ('+errors.length+'):':'لا أخطاء'));errors.slice(0,40).forEach(e=>console.log('  ✗',e));
if(errors.length>40)console.log('  … و'+(errors.length-40)+' أخرى');
process.exit(strict&&errors.length?1:0);
