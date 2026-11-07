/* وحدة الدراسة: روابط الآيات، دليل الجزء، بطاقات الحركات، المقارنة، الخطة، تاريخ اليوم، إعدادات إضافية */
(function(){
"use strict";
var K=window.KH,DT=window.KS_DATA||{};
if(!K)return;
var S=function(){return K.S()},esc=K.esc;
var AD="٠١٢٣٤٥٦٧٨٩";
function n(s){return String(s).replace(/[٠-٩]/g,function(c){return AD.indexOf(c)})}
function ar(x){return String(x).replace(/\d/g,function(c){return AD[c]})}
function jget(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function jset(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

/* ---------- الكتاب المقدس ---------- */
var BIB=null,BIBP=null,BIDX=null;
function loadBible(){
  if(BIBP)return BIBP;
  BIBP=new Promise(function(res,rej){
    if(typeof DecompressionStream==="undefined"){rej(new Error("nogz"));return}
    var s=document.createElement("script");s.src="data-bible.js";
    s.onload=function(){try{
      var bin=atob(window.__RF_DATA.bibleData),u=new Uint8Array(bin.length);
      for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
      new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).json().then(function(j){
        BIB=j.books;BIDX={};BIB.forEach(function(b,i){BIDX[b.n]=i});res(BIB)},rej)}catch(e){rej(e)}};
    s.onerror=rej;document.head.appendChild(s)});
  BIBP.catch(function(){BIBP=null});
  return BIBP}
var BK={"تك":"التكوين","خر":"الخروج","لا":"اللاويين","عد":"العدد","تث":"التثنية","يش":"يشوع","را":"راعوث","١صم":"صموئيل الأول","٢صم":"صموئيل الثاني","١مل":"الملوك الأول","٢مل":"الملوك الثاني","١أخ":"أخبار الأيام الأول","٢أخ":"أخبار الأيام الثاني","١أي":"أخبار الأيام الأول","٢أي":"أخبار الأيام الثاني","عز":"عزرا","نح":"نحميا","أس":"أستير","أي":"أيوب","مز":"المزامير","أم":"الأمثال","جا":"الجامعة","نش":"نشيد الأنشاد","حك":"الحكمة","سيراخ":"يشوع بن سيراخ","إش":"إشعياء","إر":"إرميا","مرا":"مراثي إرميا","حز":"حزقيال","دا":"دانيال","هو":"هوشع","يؤ":"يوئيل","عا":"عاموس","عو":"عوبديا","يون":"يونان","مي":"ميخا","ميخا":"ميخا","نا":"ناحوم","حب":"حبقوق","صف":"صفنيا","حج":"حجي","زك":"زكريا","ملا":"ملاخي","مت":"متى","مر":"مرقس","لو":"لوقا","يو":"يوحنا","أع":"أعمال الرسل","رو":"رومية","١كو":"كورنثوس الأولى","٢كو":"كورنثوس الثانية","غل":"غلاطية","أف":"أفسس","في":"فيلبي","فيلبي":"فيلبي","كو":"كولوسي","١تس":"تسالونيكي الأولى","٢تس":"تسالونيكي الثانية","١تي":"تيموثاوس الأولى","٢تي":"تيموثاوس الثانية","تي":"تيطس","فل":"فليمون","عب":"العبرانيين","يع":"يعقوب","١بط":"بطرس الأولى","٢بط":"بطرس الثانية","١يو":"يوحنا الأولى","٢يو":"يوحنا الثانية","٣يو":"يوحنا الثالثة","يه":"يهوذا","رؤ":"رؤيا يوحنا"};
var ABK=Object.keys(BK).sort(function(a,b){return b.length-a.length});
var RE=new RegExp("(^|[^ء-ي٠-٩])(و?)("+ABK.join("|")+")\\s?([٠-٩]{1,3})\\s?:\\s?","g");
var ITEM="[٠-٩]{1,3}(?:\\s?[-–]\\s?[٠-٩]{1,3})?";
var SPEC=new RegExp("^("+ITEM+")((?:\\s?و\\s?|،\\s?)("+ITEM+")(?!\\s?:|[٠-٩]))*");
var CONT=/^،\s?([٠-٩]{1,3})\s?:\s?/;
/* يُرجع مصفوفة {b,c,v,from,to,label} */
function scan(text){
  var out=[],m;RE.lastIndex=0;
  while((m=RE.exec(text))){
    var b=m[3],c=m[4],start=m.index+m[1].length+m[2].length,pos=m.index+m[0].length;
    while(true){
      var rest=text.slice(pos),sm=rest.match(SPEC);
      if(!sm)break;
      var from=start,to=pos+sm[0].length;
      out.push({b:b,c:n(c),v:n(sm[0]).replace(/\s?و\s?|،\s?/g,",").replace(/\s?[-–]\s?/g,"-"),from:from,to:to,label:text.slice(from,to)});
      var cm=text.slice(to).match(CONT);
      if(!cm)break;
      c=cm[1];start=to+1;pos=to+cm[0].length;
      while(text.charAt(start)===" ")start++;
    }
    RE.lastIndex=Math.max(RE.lastIndex,pos)}
  return out}
function linkRefs(html){
  if(!S().vref)return html;
  return String(html).split(/(<[^>]+>)/).map(function(seg){
    if(seg.charAt(0)==="<")return seg;
    var refs=scan(seg);if(!refs.length)return seg;
    var o="",last=0;refs.forEach(function(r){
      o+=seg.slice(last,r.from)+'<a class="vref" data-ks="v" data-b="'+r.b+'" data-c="'+r.c+'" data-v="'+r.v+'">'+seg.slice(r.from,r.to)+'</a>';last=r.to});
    return o+seg.slice(last)}).join("")}
function mtPsalm(c){c=+c;if(c<=8)return c;if(c===9)return 9;if(c>=10&&c<=112)return c+1;if(c===113)return 114;if(c===114||c===115)return 116;if(c>=116&&c<=145)return c+1;if(c===146||c===147)return 147;return c}
function parseV(v){var set={};(v||"").split(",").forEach(function(p){if(!p)return;var a=p.split("-");var x=+a[0],y=+(a[1]||a[0]);for(var i=x;i<=y;i++)set[i]=1});return set}
function openVerse(b,c,v,full){
  var name=BK[b];if(!name){return}
  K.sheet('<h3>'+esc(name)+' '+ar(c)+(v&&!full?': '+ar(v.replace(/,/g,"، ")):'')+'</h3><div class="nt">جارٍ التحميل…</div>');
  loadBible().then(function(){
    var bi=BIDX[name];if(bi===undefined)throw 0;
    var bk=BIB[bi],isPs=name==="المزامير",cc=isPs?mtPsalm(c):+c;
    var ch=bk.c[cc-1];if(!ch)throw 0;
    var sel=(!full&&!isPs)?parseV(v):{};
    var h='<h3>'+esc(name)+' '+ar(cc)+((!full&&v&&!isPs)?': '+ar(v.replace(/,/g,"، ")):'')+'</h3>';
    if(isPs)h+='<p class="hint">ترقيم المزامير في الخولاجي بحسب السبعينية، فيُعرض هنا المزمور المقابل في الترجمة المطبوعة ('+ar(cc)+'). قد يختلف رقم الآية بمقدار آية.</p>';
    var any=Object.keys(sel).length>0;
    h+='<div class="vtext">';
    ch.forEach(function(t,i){var k=i+1,on=any?!!sel[k]:true;if(any&&!on&&!full)return;h+='<p class="vl'+(any&&on&&full?' vh':'')+'"><b>'+ar(k)+'</b> '+esc(t)+'</p>'});
    h+='</div>';
    if(!full&&any)h+='<div class="vnav"><button data-ks="vfull" data-b="'+b+'" data-c="'+c+'" data-v="'+v+'">الأصحاح كاملًا</button></div>';
    else if(full)h+='<div class="vnav"><button data-ks="vchap" data-b="'+b+'" data-c="'+(+c-1)+'">‹ السابق</button><button data-ks="vchap" data-b="'+b+'" data-c="'+(+c+1)+'">التالي ›</button></div>';
    h+='<p class="hint">النص: الترجمة العربية المطبوعة (فان دايك) من تطبيق «الرفيق الروحي».</p>';
    K.sheet(h)
  }).catch(function(){K.sheet('<h3>'+esc(name)+' '+ar(c)+'</h3><div class="nt">تعذّر عرض النص هنا (يحتاج متصفحًا حديثًا). المرجع: '+esc(name+' '+ar(c)+(v?': '+ar(v.replace(/,/g,"، ")):''))+'</div>')})}

/* ---------- المراحل والدليل ---------- */
function stageOf(s){var m=DT.stageOf&&DT.stageOf[s.group.id];return m&&m[s.id]!==undefined?m[s.id]:null}
function speakers(c){var o={pr:0,di:0,pe:0};c.items.forEach(function(i){if(i.k==="p"&&i.sp)o[i.sp]++});return o}
function refsOf(c){var seen={},list=[];Object.keys(c.notes||{}).forEach(function(k){scan(c.notes[k]).forEach(function(r){var key=r.b+r.c+":"+r.v;if(seen[key])return;seen[key]=1;list.push(r)})});return list}
var SYNC=[["bas-hijab","greg-hijab","cyr-hijab"],["bas-solh","greg-solh","cyr-solh"],["bas-anaphora","greg-anaphora",null],["bas-mustahiq","greg-mustahiq","cyr-mustahiq"],["bas-ewash-before","greg-ewash","cyr-ewash1"],["bas-qudduus","greg-qudduus","cyr-qudduus"],["bas-hulul","greg-taqdis","cyr-holool"],["bas-ewash-after","greg-ewash","cyr-ewash2"],["bas-majma","greg-majma","cyr-majma"],["bas-tarheem","greg-tarheem","cyr-tarheem"],["bas-qisma-intro","greg-qisma-intro","cyr-qisma-intro"],["bas-qisma","greg-qisma","cyr-qisma"],["bas-after-qisma",null,"cyr-after-qisma"],["bas-itiraf","greg-itiraf","cyr-itiraf"],["bas-before-comm",null,"cyr-before-comm"],["bas-after-comm","greg-after-comm","cyr-after-comm"],["bas-blessing","greg-blessing","cyr-blessing"]];
var SALT={"greg-hijab2":"greg-hijab","greg-solh2":"greg-solh"};
var LNAME=["القداس الباسيلي","القداس الغريغوري","القداس الكيرلسي"];
function syncBar(id){
  id=SALT[id]||id;var row=null;SYNC.forEach(function(r){if(!row&&r.indexOf(id)>-1)row=r});if(!row)return"";
  var me=row.indexOf(id),b="";
  row.forEach(function(t,i){if(i===me||!t||!K.BYID[t]||!K.BYID[t].has)return;b+='<button class="lsb" data-nav="#/s/'+t+'">↔ '+LNAME[i]+'</button>'});
  return b?'<div class="lsw"><small>نفس الجزء في:</small>'+b+'</div>':""}
function guideHtml(id,s,c){
  var sb=syncBar(id);
  return sb+(guideInner(id,s,c)||"")}
function guideInner(id,s,c){
  if(!S().guide||!c)return"";
  var g=(DT.guides||{})[id],st=stageOf(s),sp=speakers(c),refs=refsOf(c),moves=c.items.filter(function(i){return i.k==="r"}).length;
  var h='<details class="kg"><summary>📖 دليل هذا الجزء'+(st!==null?' · '+esc(DT.stages[st][0]):'')+'</summary><div class="kgb">';
  if(st!==null)h+='<div class="kgs">'+DT.stages.map(function(x,i){return '<span class="'+(i===st?'on':'')+'">'+esc(x[0])+'</span>'}).join("")+'</div>';
  if(g){
    h+='<p><b>ما الذي يحدث؟</b> '+linkRefs(esc(g.what))+'</p>';
    h+='<p><b>لماذا نقول هذا؟</b> '+linkRefs(esc(g.why))+'</p>';
    h+='<p><b>ركّز على:</b> '+esc(g.focus)+'</p>';
    h+='<p><b>اسأل نفسك:</b> '+esc(g.q)+'</p>';
    h+='<p><b>مهمة:</b> '+linkRefs(esc(g.task))+'</p>';
    h+='<small class="ms">مسوّدة — تحتاج مراجعة كنسية. المصدر: الكتاب المقدس والطقس.</small>'}
  else h+='<p class="hint">لا يوجد شرح مكتوب لهذا الجزء بعد. تظهر هنا المعلومات المستخرجة من النص نفسه.</p>';
  h+='<p><b>من يتكلم:</b> '+(sp.pr?'الكاهن ('+ar(sp.pr)+') ':'')+(sp.di?'· الشماس ('+ar(sp.di)+') ':'')+(sp.pe?'· الشعب ('+ar(sp.pe)+')':'')+(!(sp.pr+sp.di+sp.pe)?'غير محدد في هذا الجزء':'')+'</p>';
  if(moves)h+='<p><b>الإرشادات والحركات:</b> '+ar(moves)+' إرشادًا في هذا الجزء.</p>';
  if(st!==null&&st<4&&(DT.taqs||{})[st]){var tl=DT.taqs[st].filter(function(x){return K.BYID[x]});if(tl.length)h+='<p><b>شرح الحركات في دليل الطقس:</b> '+tl.map(function(x){return '<a class="vref" data-nav="#/s/'+x+'">'+esc((K.BYID[x].title||x))+'</a>'}).join(" · ")+'</p>';
    var lx=(DT.lex||[]).filter(function(e){return e.st===st});if(lx.length)h+='<p><b>قبطي معرَّب في هذه المرحلة:</b> '+lx.slice(0,6).map(function(e){return esc(e.c)}).join(" · ")+' <a class="vref" data-nav="#/lex">القاموس كله ‹</a></p>'}
  if(refs.length)h+='<p><b>الآيات في هذا الجزء:</b> '+refs.slice(0,24).map(function(r){return '<a class="vref" data-ks="v" data-b="'+r.b+'" data-c="'+r.c+'" data-v="'+r.v+'">'+esc(r.label)+'</a>'}).join(" · ")+(refs.length>24?' …':'')+'</p>';
  return h+'</div></details>'}

/* ---------- بطاقات الحركات ---------- */
var ACT=[["الكاهن","🕯","pr"],["الشماس","🔔","di"],["الشعب","🙏","pe"],["الأسقف","✠","pr"],["البطريرك","✠","pr"]];
var MV=/(يرشم|يأخذ|يضع|يلتفت|يرفع|يغطي|يكشف|يمسك|يخرج|يدور|يسجد|يطامن|يصب|يغسل|يفرك|يقبل|يقسم|يكسر|يغمس|يلف|يبسط|يرش|يوقد|يعطي|يناول|يضرب|يمسح|يقف|يتقدم|يبخر|يحني|ينزل|يعود)/;
var SAY=/(يقول|يصرخ|يقرأ|يرتل|يجاوب|يردون|يصلي|يُصلّي|يقولون|ينادي)/;
function rubHtml(raw,inner){
  if(!S().mov)return'<div class="rub">'+inner+'</div>';
  var act=null;ACT.forEach(function(a){if(!act&&raw.indexOf(a[0])>-1)act=a});
  var kind=MV.test(raw)?["حركة","✋"]:SAY.test(raw)?["قول","💬"]:["إرشاد","ℹ"];
  var mv=null;(DT.moves||[]).forEach(function(m,i){if(mv===null&&new RegExp(m.re).test(raw))mv=i});
  return '<div class="rub mv'+(act?' mv-'+act[2]:'')+'"><span class="mvc">'+(act?act[1]+' '+act[0]:kind[1]+' '+kind[0])+(act?' · '+kind[0]:'')+'</span><span class="mvt">'+inner+'</span>'+(mv!==null?'<button class="mvq" data-ks="mv" data-i="'+mv+'">ما معناها؟</button>':'')+'</div>'}
function openMove(i){var m=DT.moves[i];if(!m)return;
  K.sheet('<h3>'+esc(m.t)+'</h3><div class="nt">'+esc(m.m)+(m.v?'<br><br><b>في الكتاب:</b> '+linkRefs(esc(m.v)):'')+'</div>'+(m.s?'<button class="ksb" data-nav="#/s/'+m.s+'">📖 افتح في دليل الطقس</button>':'')+'<small class="ms">'+(m.src==="taqs"?'المصدر: دليل ترتيب القداس وحركات الكاهن (دير الأنبا بيشوي) — يحتاج مراجعة كنسية':'مسوّدة — تحتاج مراجعة كنسية')+'</small>')}

/* ---------- التاريخ القبطي ---------- */
var CM=["توت","بابة","هاتور","كيهك","طوبة","أمشير","برمهات","برمودة","بشنس","بؤونة","أبيب","مسرى","النسيء"];
function leap(y){return(y%4===0&&y%100!==0)||y%400===0}
function copticOf(d){
  var Y=d.getFullYear();
  function ny(y){return Date.UTC(y,8,leap(y+1)?12:11)}
  var t=Date.UTC(Y,d.getMonth(),d.getDate()),sy=Y;
  if(t<ny(Y))sy=Y-1;
  var days=Math.round((t-ny(sy))/864e5);
  return {y:sy-283,m:Math.floor(days/30),d:days%30+1}}
function nm(t){return String(t).replace(/[ً-ٰٟ]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/ؤ/g,"و")}
function todayDox(cd){
  var out=[],key=nm(CM[cd.m]);
  K.D.groups.forEach(function(g){if(g.id!=="dox")return;g.sections.forEach(function(s){
    if(!s.sub)return;var re=/([٠-٩]+)\s*([ء-ي]+)/g,m;
    while((m=re.exec(s.sub))){if(+n(m[1])===cd.d&&nm(m[2])===key){out.push(s);break}}})});
  return out}
/* ---------- الخطة ---------- */
function planItems(lit){var g=K.D.groups.filter(function(x){return x.id===lit})[0];return g?g.sections.filter(function(s){return K.BYID[s.id]&&K.BYID[s.id].has}):[]}
function plan(){return jget("khulagi.plan",{lit:"bas",pace:1,done:{},since:new Date().toISOString().slice(0,10)})}
function savePlan(p){jset("khulagi.plan",p)}
function weekItems(p){var all=planItems(p.lit).filter(function(s){return !p.done[s.id]});return all.slice(0,p.pace)}
function planCard(){
  var p=plan(),all=planItems(p.lit),done=all.filter(function(s){return p.done[s.id]}).length,wk=weekItems(p);
  var h='<div class="ksc"><b>📅 خطتي</b><span>'+ar(done)+' من '+ar(all.length)+' جزءًا</span>';
  if(wk.length)h+='<div class="ksl">'+wk.map(function(s){return '<button class="sec" data-nav="#/s/'+s.id+'"><span>'+esc(s.title)+'</span><span class="pn">'+(s.page?'ص '+ar(s.page):'')+'</span></button>'}).join("")+'</div>';
  else h+='<p class="hint">أنهيتَ الخطة. اختر قداسًا آخر من «خطتي».</p>';
  return h+'<button class="ksb" data-nav="#/plan">فتح الخطة</button></div>'}
function homeHtml(){
  var h='';
  if(S().today){
    var cd=copticOf(new Date()),dx=todayDox(cd);
    h+='<div class="ksc"><b>🗓 اليوم</b><span>'+ar(cd.d)+' '+CM[cd.m]+' '+ar(cd.y)+' للشهداء</span>';
    if(dx.length)h+='<div class="ksl"><small>ذكصولوجيات اليوم (ثابتة بحسب الكتاب):</small>'+dx.map(function(s){return '<button class="sec" data-nav="#/s/'+s.id+'"><span>'+esc(s.title)+'</span></button>'}).join("")+'</div>';
    h+='</div>'}
  h+=planCard();
  h+='<div class="ksc"><b>🔎 دراسة</b><div class="ksl"><button class="sec" data-nav="#/compare"><span>مقارنة بين القداسات الثلاثة</span><span class="pn">‹</span></button><button class="sec" data-nav="#/lex"><span>قاموس القبطي المعرَّب</span><span class="pn">‹</span></button><button class="sec" data-nav="#/g/taqs"><span>دليل طقس القداس وحركات الكاهن</span><span class="pn">‹</span></button></div></div>';
  return h}
function lexView(){
  K.ctl(false);var q=(window.__lq||""),h='<div class="crumb"><button data-nav="#/">⌂ الرئيسية</button></div><div class="gh"><h2>قاموس القبطي المعرَّب</h2></div><p class="hint">عبارات قبطية معرَّبة كما وردت في دليل الطقس، مع معناها وموضعها في القداس. مسوّدة تحتاج مراجعة.</p><div class="dd"><label>بحث<input data-ks="lq" value="'+esc(q)+'" placeholder="اكتب جزءًا من العبارة أو معناها"></label></div><div class="list" id="lexl">';
  h+=lexList(q)+'</div>';document.getElementById("app").innerHTML=h}
function lexList(q){var n0=nm(q),o="";DT.lex.forEach(function(e){if(n0&&nm(e.c+e.m+e.w).indexOf(n0)<0)return;
  o+='<div class="cmc"><b>'+esc(e.c)+'</b><br>'+esc(e.m)+'<br><small>'+esc(e.w)+(e.st<4?' · '+esc(DT.stages[e.st][0]):' · الصوم المقدس')+'</small> <a class="vref" data-nav="#/s/'+e.s+'">في الدليل ‹</a></div>'});
  return o||'<p class="hint">لا نتائج.</p>'}
function planView(){
  K.ctl(false);var p=plan(),h='<div class="crumb"><button data-nav="#/">⌂ الرئيسية</button></div><div class="gh"><h2>خطتي</h2></div><div class="dd">';
  h+='<label>القداس<select data-ks="plit"><option value="bas"'+(p.lit==="bas"?" selected":"")+'>باسيليوس</option><option value="greg"'+(p.lit==="greg"?" selected":"")+'>غريغوريوس</option><option value="cyr"'+(p.lit==="cyr"?" selected":"")+'>كيرلس</option></select></label>';
  h+='<label>الأجزاء في الأسبوع<select data-ks="ppace">'+[1,2,3,5].map(function(x){return '<option value="'+x+'"'+(p.pace===x?" selected":"")+'>'+ar(x)+'</option>'}).join("")+'</select></label></div>';
  var all=planItems(p.lit);
  h+='<div class="list">';
  all.forEach(function(s){var d=!!p.done[s.id];h+='<div class="sec plr'+(d?' pd':'')+'"><button class="pk" data-ks="pdone" data-id="'+s.id+'" aria-label="تم">'+(d?'✓':'')+'</button><span class="pt" data-nav="#/s/'+s.id+'">'+esc(s.title)+'</span><span class="pn">'+(s.page?'ص '+ar(s.page):'')+'</span></div>'});
  h+='</div><p class="hint">الأجزاء التي في هذا الأسبوع هي أول '+ar(p.pace)+' من الأجزاء غير المنجزة.</p>';
  K.app.innerHTML=h;window.scrollTo(0,0)}
/* ---------- المقارنة ---------- */
var CMP=[["صلاة الحجاب",["bas-hijab","greg-hijab","cyr-hijab"]],["صلاة الصلح",["bas-solh","greg-solh","cyr-solh"]],["مستحق ومستوجب",["bas-mustahiq","greg-mustahiq","cyr-mustahiq"]],["قدوس",["bas-qudduus","greg-qudduus","cyr-qudduus"]],["حلول الروح القدس / التقديس",["bas-hulul","greg-taqdis","cyr-holool"]],["المجمع",["bas-majma","greg-majma","cyr-majma"]],["الترحيم",["bas-tarheem","greg-tarheem","cyr-tarheem"]],["مقدمة القسمة",["bas-qisma-intro","greg-qisma-intro","cyr-qisma-intro"]],["القسمة",["bas-qisma","greg-qisma","cyr-qisma"]],["الاعتراف",["bas-itiraf","greg-itiraf","cyr-itiraf"]],["صلوات ما بعد التناول",["bas-after-comm","greg-after-comm","cyr-after-comm"]],["البركة والتسريح",["bas-blessing","greg-blessing","cyr-blessing"]]];
var LN=["باسيليوس","غريغوريوس","كيرلس"];
var CS=jget("khulagi.cmp",{t:0,a:0,b:1});
function textOf(id){var c=K.D.content[id];if(!c)return'<p class="hint">لم يُنقل بعد</p>';
  return c.items.map(function(i){if(i.k==="r")return'<p class="cr">'+esc(i.t)+'</p>';if(i.k==="p"&&i.ar)return'<p>'+esc(i.ar).replace(/ \/ /g," ")+'</p>';return""}).join("")}
function compare(){
  K.ctl(false);var h='<div class="crumb"><button data-nav="#/">⌂ الرئيسية</button></div><div class="gh"><h2>مقارنة القداسات</h2></div><div class="dd">';
  h+='<label>الموضع<select data-ks="ct">'+CMP.map(function(x,i){return '<option value="'+i+'"'+(CS.t===i?" selected":"")+'>'+esc(x[0])+'</option>'}).join("")+'</select></label>';
  [["ca","الأول",CS.a],["cb","الثاني",CS.b]].forEach(function(z){h+='<label>'+z[1]+'<select data-ks="'+z[0]+'">'+LN.map(function(l,i){return '<option value="'+i+'"'+(z[2]===i?" selected":"")+'>'+l+'</option>'}).join("")+'</select></label>'});
  h+='</div><div class="cmp">';
  [CS.a,CS.b].forEach(function(i){var id=CMP[CS.t][1][i];h+='<div class="cmc"><h4>'+LN[i]+'</h4><div class="cmt">'+textOf(id)+'</div><button class="ksb" data-nav="#/s/'+id+'">فتح الجزء</button></div>'});
  h+='</div><p class="hint">المقارنة بين النصوص العربية كما في الخولاجي. الفروق تُلاحَظ بالقراءة؛ لم تُكتب شروح للفروق بعد.</p>';
  K.app.innerHTML=h;window.scrollTo(0,0)}
/* ---------- إعدادات إضافية ---------- */
var TOG=[["vref","روابط الآيات (اضغط الآية لقراءتها)"],["guide","دليل كل جزء"],["mov","بطاقات الحركات والإرشادات"],["today","تاريخ اليوم والذكصولوجيات"],["calm","تقليل الحركة"],["wake","إبقاء الشاشة مضاءة"]];
function settingsHtml(){
  var o={study:'',home:'',backup:''};
  TOG.forEach(function(r){o.study+='<div class="set"><span>'+r[1]+'</span><button class="tg'+(S()[r[0]]?' on':'')+'" data-tg="'+r[0]+'" aria-label="'+r[1]+'"></button></div>'});
  K.D.groups.forEach(function(g){var hid=(S().hide||[]).indexOf(g.id)>-1;o.home+='<div class="set"><span>'+esc(g.title)+'</span><button class="tg'+(hid?'':' on')+'" data-ks="hide" data-g="'+g.id+'" aria-label="'+esc(g.title)+'"></button></div>'});
  o.backup+='<div class="set"><button class="ksb" data-ks="export">تصدير ملاحظاتي وإعداداتي</button><label class="ksb" for="ksimp">استرجاع</label><input id="ksimp" type="file" accept="application/json" hidden></div>';
  if(deferred)o.backup+='<div class="set"><span>تثبيت التطبيق</span><button class="ksb" data-ks="install">تثبيت الآن</button></div>';
  return o}
var deferred=null;
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferred=e});
function applyPrefs(){
  document.documentElement.classList.toggle("calm",!!S().calm);
  if(S().wake&&navigator.wakeLock&&document.visibilityState==="visible"){navigator.wakeLock.request("screen").catch(function(){})}}
document.addEventListener("visibilitychange",applyPrefs);
function exportAll(){
  var o={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k.indexOf("khulagi")===0)o[k]=localStorage.getItem(k)}}catch(e){}
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:"application/json"}));a.download="khulagi-backup.json";a.click()}
document.addEventListener("input",function(e){var t=e.target;if(t.getAttribute&&t.getAttribute("data-ks")==="lq"){window.__lq=t.value;var l=document.getElementById("lexl");if(l)l.innerHTML=lexList(t.value)}});
document.addEventListener("change",function(e){var t=e.target;
  if(t.id==="ksimp"&&t.files[0]){var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);Object.keys(o).forEach(function(k){if(k.indexOf("khulagi")===0)localStorage.setItem(k,o[k])});location.reload()}catch(x){alert("ملف غير صالح")}};r.readAsText(t.files[0]);return}
  var d=t.getAttribute&&t.getAttribute("data-ks");if(!d)return;
  var p=plan();
  if(d==="plit"){p.lit=t.value;savePlan(p);planView()}
  else if(d==="ppace"){p.pace=+t.value;savePlan(p);planView()}
  else if(d==="ct"){CS.t=+t.value;jset("khulagi.cmp",CS);compare()}
  else if(d==="ca"){CS.a=+t.value;jset("khulagi.cmp",CS);compare()}
  else if(d==="cb"){CS.b=+t.value;jset("khulagi.cmp",CS);compare()}});
document.addEventListener("click",function(e){
  var t=e.target.closest("[data-ks]");if(!t)return;var d=t.getAttribute("data-ks");
  if(d==="v"){e.preventDefault();openVerse(t.dataset.b,t.dataset.c,t.dataset.v)}
  else if(d==="vfull")openVerse(t.dataset.b,t.dataset.c,t.dataset.v,true);
  else if(d==="vchap")openVerse(t.dataset.b,t.dataset.c,"",true);
  else if(d==="mv")openMove(+t.dataset.i);
  else if(d==="pdone"){var p=plan();if(p.done[t.dataset.id])delete p.done[t.dataset.id];else p.done[t.dataset.id]=1;savePlan(p);planView()}
  else if(d==="hide"){var s=S(),h=s.hide||[],i=h.indexOf(t.dataset.g);if(i>-1)h.splice(i,1);else h.push(t.dataset.g);s.hide=h;K.save();K.settings();K.route()}
  else if(d==="export")exportAll();
  else if(d==="install"&&deferred){deferred.prompt();deferred=null;K.close()}});
window.KS={lex:lexView,linkRefs:linkRefs,guide:guideHtml,rub:rubHtml,home:homeHtml,plan:planView,compare:compare,settings:settingsHtml,apply:applyPrefs,scan:scan};
})();
