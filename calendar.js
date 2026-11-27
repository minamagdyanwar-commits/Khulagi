/* التقويم القبطي — مواسم السنة (ثابتة ومتحركة) محسوبة بالخوارزمية لسنوات 1900–2099.
   منقول من تطبيق «رفيق روحي» (القيامة القبطية = حساب إسكندري يوليانيّ + 13 يومًا، وكل المواسم المتحركة تُشتق منها).
   يُستعمل لربط اليوم بالذكصولوجيات وألحان التوزيع المناسبة (انظر occasions). */
(function(){
"use strict";
function ard(n){return String(n).replace(/\d/g,function(d){return "٠١٢٣٤٥٦٧٨٩"[d]})}
var CM=['توت','بابه','هاتور','كيهك','طوبة','أمشير','برمهات','برمودة','بشنس','بؤونة','أبيب','مسرى','النسيء'];
var GM=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function D(y,m,d){ return new Date(y,m,d,12,0,0); }          /* ظهرًا لتفادي فروق التوقيت الصيفي */
  function addDays(dt,n){ return D(dt.getFullYear(),dt.getMonth(),dt.getDate()+n); }
  function dnum(dt){ return Math.round(Date.UTC(dt.getFullYear(),dt.getMonth(),dt.getDate())/864e5); }
  function same(a,b){ return dnum(a)===dnum(b); }
  /* ----- التاريخ القبطي (نفس خوارزمية الرئيسية) ----- */
  function coptic(dt){
    var y=dt.getFullYear(),m=dt.getMonth()+1,dd=dt.getDate();
    var leap=(y%4===0&&y%100!==0)||y%400===0, corr=m<=2?0:(leap?-1:-2);
    var rd=365*(y-1)+Math.floor((y-1)/4)-Math.floor((y-1)/100)+Math.floor((y-1)/400)+Math.floor((367*m-362)/12)+corr+dd;
    var E=103605;
    function fc(yy,mm,d2){return E-1+365*(yy-1)+Math.floor(yy/4)+30*(mm-1)+d2}
    var yr=Math.floor((4*(rd-E)+1463)/1461), mo=Math.floor((rd-fc(yr,1,1))/30)+1;
    return {y:yr,m:mo,d:rd-fc(yr,mo,1)+1};
  }
  /* ----- القيامة (ميوس، يوليانية) + 13 يومًا ----- */
  var _e={};
  function easter(y){
    if(_e[y]) return _e[y];
    var a=y%4,b=y%7,c=y%19,d=(19*c+15)%30,e=(2*a+4*b-d+34)%7,t=d+e+114;
    var jm=Math.floor(t/31),jd=t%31+1;                         /* التاريخ اليوليانيّ */
    return (_e[y]=addDays(D(y,jm-1,jd),13));                    /* 1900–2099 */
  }
  /* ----- صوم/مواسم متحركة وثابتة لسنة ميلادية y ----- */
  var _s={};
  function seasons(y){
    if(_s[y]) return _s[y];
    var E=easter(y), S=[];
    function mov(id,name,a,b,kind,note){ S.push({id:id,name:name,from:addDays(E,a),to:addDays(E,b),kind:kind,note:note||''}); }
    function fix(id,name,fm,fd,tm,td,kind,note,ty){ S.push({id:id,name:name,from:D(y,fm-1,fd),to:D(ty||y,tm-1,td),kind:kind,note:note||''}); }
    mov('jonah','صوم يونان (نينوى)',-69,-67,'fast','ثلاثة أيام، ويليه عيد نينوى');
    mov('lent','الصوم الكبير',-55,-1,'fast','٥٥ يومًا تبدأ بأسبوع الاستعداد وتنتهي بأسبوع الآلام');
    mov('holy','أسبوع الآلام',-7,-1,'holy','من أحد الشعانين إلى سبت الفرح');
    mov('pasc','الخمسون المقدسة (الخماسين)',0,49,'joy','من القيامة إلى العنصرة؛ لا صوم ولا سجود');
    S.push({id:'apostles',name:'صوم الرسل',from:addDays(E,50),to:D(y,6,11),kind:'fast',note:'من الاثنين بعد العنصرة إلى ٥ أبيب (عيد الرسل)'});
    /* الصيامان الثابتان يبدآن بالتاريخ القبطي لا بتاريخ ميلادي ثابت (يتحرك يومًا بين السنوات) */
    function cStart(m,mm,dd,cm,cd){ var a=D(y,m-1,dd), b=D(y,m-1,dd+1); return (coptic(a).m===cm&&coptic(a).d===cd)?[mm,dd]:[mm,dd+1]; }
    var vs=cStart(8,8,7,12,1), ve=cStart(8,8,21,12,15), as=cStart(11,11,24,3,15);
    fix('virgin','صوم السيدة العذراء',8,vs[1],8,ve[1],'fast','١–١٥ مسرى');
    fix('advA','صوم الميلاد',11,as[1],12,31,'fast','١٥ هاتور–٢٨ كيهك، ويستمر إلى ٦ يناير');
    S.push({id:'advB',name:'صوم الميلاد',from:D(y,0,1),to:D(y,0,6),kind:'fast',note:'١٥ هاتور–٢٨ كيهك'});
    if(S[S.length-1].to < S[S.length-1].from) S.pop();
    return (_s[y]=S);
  }
  /* الأعياد المتحركة (بالنسبة للقيامة) */
  function movFeasts(y){
    var E=easter(y);
    return [
      {d:addDays(E,-66),n:'عيد نينوى',t:'minor'},
      {d:addDays(E,-7),n:'أحد الشعانين',t:'major'},
      {d:addDays(E,-3),n:'خميس العهد',t:'major'},
      {d:addDays(E,-2),n:'الجمعة العظيمة',t:'holy'},
      {d:addDays(E,-1),n:'سبت الفرح',t:'major'},
      {d:E,n:'عيد القيامة المجيد',t:'major'},
      {d:addDays(E,1),n:'ثاني أيام القيامة (شم النسيم)',t:'minor'},
      {d:addDays(E,39),n:'عيد الصعود',t:'major'},
      {d:addDays(E,49),n:'عيد العنصرة (حلول الروح القدس)',t:'major'}
    ];
  }
  /* الأعياد الثابتة بالتاريخ القبطي (شهر،يوم) */
  var FIXED=[
    [1,1,'عيد النيروز (رأس السنة القبطية)','major'],
    [1,17,'عيد الصليب المجيد','major'],
    [3,12,'عيد رئيس الملائكة ميخائيل','minor'],
    [4,29,'عيد الميلاد المجيد','major'],
    [5,11,'عيد الغطاس','major'],
    [5,13,'عرس قانا الجليل','minor'],
    [5,21,'نياحة السيدة العذراء (الأولى)','minor'],
    [6,8,'عيد دخول المسيح الهيكل','minor'],
    [7,10,'عيد الصليب (الصليب الثاني)','minor'],
    [7,29,'عيد البشارة','major'],
    [9,24,'عيد دخول المسيح أرض مصر','minor'],
    [11,5,'عيد الرسل بطرس وبولس','major'],
    [12,13,'عيد التجلي','major'],
    [12,16,'نياحة السيدة العذراء','major']
  ];
  function dayInfo(dt){
    var y=dt.getFullYear(), c=coptic(dt), n=dnum(dt), out={date:dt,c:c,wd:dt.getDay(),fasts:[],feasts:[],seasons:[]};
    [y-1,y,y+1].forEach(function(yy){ if(yy<1900||yy>2099) return;
      seasons(yy).forEach(function(s){ if(dnum(s.from)<=n&&n<=dnum(s.to)){
        var k=s.id==='advA'||s.id==='advB'?'adv':s.id;
        if(!out.seasons.some(function(z){return z.k===k})) out.seasons.push({k:k,name:s.name,kind:s.kind,day:n-dnum(s.from)+1,len:dnum(s.to)-dnum(s.from)+1,note:s.note});
      }});
    });
    var E=easter(y), rel=n-dnum(E);
    FIXED.forEach(function(f){ if(f[0]===c.m&&f[1]===c.d) out.feasts.push({n:f[2],t:f[3]}); });
    movFeasts(y).forEach(function(f){ if(same(f.d,dt)) out.feasts.push({n:f.n,t:f.t}); });
    /* أحاد الصوم */
    if(dt.getDay()===0&&rel>=-55&&rel<=-8){ var k=Math.round((rel+55+1)/7); if(k>=1&&k<=7) out.sun='الأحد '+['','الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع'][k]+' من الصوم الكبير'; }
    /* صوم أسبوعي: الأربعاء والجمعة خارج الخمسين المقدسة */
    var inPasc=rel>=0&&rel<=49;
    out.weekly=(dt.getDay()===3||dt.getDay()===5)&&!inPasc;
    /* برامون الميلاد والغطاس */
    if(c.m===4&&c.d===28||c.m===5&&c.d===10) out.paramoun=true;
    out.fast=out.seasons.some(function(s){return s.kind==='fast'})||out.weekly||!!out.paramoun;
    out.holy=out.feasts.some(function(f){return f.t==='holy'});
    return out;
  }
  /* وصف مختصر للموسم لعرضه في الرئيسية/الخلوة */
  function labelOf(dt){
    var i=dayInfo(dt), parts=[];
    var main=null;
    ['holy','lent','jonah','pasc','apostles','virgin','adv'].some(function(k){ main=i.seasons.filter(function(s){return s.k===k})[0]; return !!main; });
    if(i.feasts.length) parts.push(i.feasts.map(function(f){return f.n}).join(' · '));
    if(main) parts.push(main.name+' — اليوم '+ard(main.day)+' من '+ard(main.len));
    if(i.sun) parts.push(i.sun);
    if(!main&&i.weekly) parts.push('يوم صوم (الأربعاء والجمعة)');
    return {text:parts.join(' · '),info:i,main:main};
  }
  

  
/* مفاتيح المناسبات لتاريخ ما — تُربط بـ occ في data.js */
function occasions(dt){
  var i=dayInfo(dt),c=i.c,y=dt.getFullYear(),E=easter(y),rel=dnum(dt)-dnum(E),o=[],names=[];
  function add(k,n){if(o.indexOf(k)<0)o.push(k);if(n)names.push(n)}
  if(c.m===4)add('kiahk','شهر كيهك');
  if(c.d===29&&c.m!==4&&c.m!==7&&c.m!==12&&c.m!==13){}
  if(c.m===1&&c.d===1)add('nayrouz','عيد النيروز');
  if((c.m===1&&c.d===17)||(c.m===7&&c.d===10))add('cross','عيد الصليب');
  if(c.d===12)add('michael',c.m===3?'عيد رئيس الملائكة ميخائيل':'التذكار الشهري لرئيس الملائكة ميخائيل');
  if(c.d===21)add('virgin',c.m===5||c.m===12?'':'التذكار الشهري للسيدة العذراء');
  if(c.m===4&&c.d===29)add('nativity','عيد الميلاد المجيد');
  if(c.d===29&&c.m!==4)add('nativity-monthly','تذكار الميلاد (٢٩ من الشهر)');
  if(c.m===5&&c.d===11)add('epiphany','عيد الغطاس المجيد');
  if(c.m===7&&c.d===29)add('annunciation','عيد البشارة');
  if(c.m===11&&c.d===5)add('apostles','عيد الرسل بطرس وبولس');
  if(c.m===3&&c.d===12)add('michael');
  if(rel===-66||rel===-67||rel===-68||rel===-69)add('nineveh','صوم نينوى');
  if(rel>=-55&&rel<=-8)add('lent','الصوم الكبير');
  if(rel===-8)add('lazarus','سبت لعازر');
  if(rel===-7)add('palm','أحد الشعانين');
  if(rel>=-6&&rel<=-1)add('holyweek','أسبوع الآلام');
  if(rel===0)add('resurrection','عيد القيامة المجيد');
  if(rel>=0&&rel<=49)add('pascha','الخمسين المقدسة');
  if(rel===7)add('thomas','أحد توما');
  if(rel===39)add('ascension','عيد الصعود');
  if(rel===49)add('pentecost','عيد العنصرة');
  if(rel>=50&&dnum(dt)<=dnum(D(y,6,11)))add('apostlesfast','صوم الرسل');
  if((c.m===12&&c.d<=15)||(c.m===11&&c.d>=24&&false))add('virginfast','صوم العذراء');
  if(c.m===12&&c.d===16)add('virgin');
  if(c.m===5&&c.d===21)add('virgin');
  /* أحاد كيهك */
  if(c.m===4&&dt.getDay()===0){var k=Math.min(4,Math.floor((c.d-1)/7)+1);add('kiahk-sun'+k,'الأحد '+['','الأول','الثاني','الثالث','الرابع'][k]+' من كيهك')}
  /* أحاد الخمسين */
  if(rel>=7&&rel<=42&&rel%7===0)add('pascha-sun'+(rel/7),'الأحد '+['','الأول','الثاني','الثالث','الرابع','الخامس','السادس'][rel/7]+' من الخمسين');
  return {keys:o,names:names,info:i,label:labelOf(dt)};
}
window.KCAL={coptic:coptic,easter:easter,seasons:seasons,dayInfo:dayInfo,label:labelOf,occasions:occasions,CM:CM,GM:GM,ard:ard,fixed:FIXED};
})();
