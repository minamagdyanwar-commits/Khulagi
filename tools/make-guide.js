/* يولّد لقطات شاشة دليل البرنامج + ملف guide-pages.js
   الاستخدام (من جذر المشروع، والسيرفر المحلي شغال على المنفذ 8765):
     python3 -m http.server 8765 &   ثم   node tools/make-guide.js
   كل صفحة = مواصفة واحدة: مسار + تجهيز + علامات مرقّمة (selector, اسم, شرح).
   عند إضافة ميزة جديدة: عدّل المواصفة المتأثرة هنا، أو أضف مواصفة جديدة، ثم أعد التشغيل. */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const ROOT=path.join(__dirname,'..');const OUT=path.join(ROOT,'guide');const U='http://localhost:8765/index.html';
fs.mkdirSync(OUT,{recursive:true});
const LISTS={cur:'l1',lists:[{id:'l1',name:'قداس الأحد',items:['dox_virgin_morning','dox_michael_2','raf-qarabin','dox_antonios']},{id:'l2',name:'عيد الملاك',items:['dox_michael_3']}]};
const SETTINGS={mode:'dark',td:'dawn',tl:'parchment',story:true,stc:false,start:'home'};
const open=async(p,sel)=>{const e=await p.$(sel);if(e){await e.evaluate(x=>x.click());await p.waitForTimeout(800)}};
const SPECS=[
{id:'splash',title:'الشاشة الأولى',hash:'#/',summary:'أول ما تفتح البرنامج تظهر الصورة كاملة بدون أي قوائم، وعليها اسم البرنامج وتاريخ اليوم فقط.',
 marks:[['#btnSet','زر الإعدادات','يفتح الإعدادات: وضع الشاشة والثيم والخط، بداية التطبيق، النسخة الاحتياطية، وهذا الدليل.'],['#btl','عنوان البرنامج','يظهر في أعلى كل صفحة بنفس الشكل.'],['.sbox','صندوق التاريخ','التاريخ القبطي والميلادي، وتحتهما الموسم أو العيد إن وُجد (صوم الميلاد، الخمسين، عيد…).'],['.sgrab','اسحب لأعلى','اسحب الشاشة لأعلى (أو اضغط هنا) لتظهر ورقة اليوم وتتغبّش الصورة وراءها.']],
 nav:'للرجوع لهذه الشاشة: اضغط «اليوم» في الشريط السفلي ثم اسحب الورقة لتحت.'},
{id:'today',title:'ورقة اليوم',hash:'#/',h:900,setup:async p=>{await open(p,'.sgrab')},summary:'الورقة التي تظهر بالسحب. فيها كل ما تحتاجه اليوم دون تفاصيل كثيرة.',
 marks:[['.tsheet .td','تاريخ اليوم','التاريخ والذكصولوجيات المقترحة لهذا التاريخ.'],['.tdc','تابع من حيث وقفت','آخر قسم كنت فيه وشريط التقدم. زر «متابعة» يفتحه مباشرة.'],['.tdp','باكر · العشية · نصف الليل','يختار نفسه تلقائيا حسب الساعة. الأقسام تحته تناسب الوقت.'],['.tsheet .li .dxp','＋','يضيف القسم إلى قائمتك الحالية.'],['.tdstart','ابدأ القداس','يفتح صفحة «قبل القداس» لتجهيز القداس.'],['.bnav','الشريط السفلي','التنقل بين الصفحات الأربع: اليوم، القداس، قوائمي، المكتبة.']],
 nav:'اسحب الورقة لتحت أو اضغط على المقبض في أعلاها لتعود للصورة.'},
{id:'lit',title:'القداس',hash:'#/lit',summary:'الصفحة التي تتابع منها القداس مرحلة مرحلة.',
 marks:[['.seg','اختيار القداس','باسيليوس أو غريغوريوس أو كيرلس. اختيارك يتحفظ.'],['.tl','المراحل الأربع','الاستعداد، قداس الكلمة، قداس المؤمنين، القسمة والتناول. الدائرة الممتلئة = مرحلة أنهيتها.'],['.tl .stgo, .tl .tdgo','فتح / متابعة','يفتح أول جزء لم تقرأه في المرحلة.'],['.tdstart','ابدأ القداس','يفتح «قبل القداس».'],['.tdalt','كل أقسام القداس','قائمة كل أجزاء القداس المختار بترتيب الكتاب.']]},
{id:'pre',title:'قبل القداس',hash:'#/pre',summary:'أربع خطوات قصيرة تجهّز بها قبل أن تبدأ.',
 marks:[['.chk@0','١. القداس','اختر الذي ستصليه.'],['.chk@1','٢. قائمتك','القائمة الحالية وعدد أقسامها. «فتح قوائمي» لتعديلها.'],['.chk@2','٣. اقتراحات اليوم','ذكصولوجيات تناسب تاريخ اليوم. ＋ لإضافتها.'],['.chk@3','٤. حجم الخط','اضبطه الآن ليبقى ثابتا طوال القداس.'],['[data-dmgo="lit"]','ابدأ القداس','يبدأ وضع الشماس من آخر مكان أو أول القداس.'],['[data-dmgo="list"]','ابدأ قائمتي','يبدأ القراءة من أول قسم في قائمتك ويتنقّل بترتيبها.']]},
{id:'reader',title:'القراءة',hash:'#/s/bas-hulul',summary:'شاشة قراءة أي قسم: نص بثلاثة أعمدة (قبطي، معرَّب، عربي) مع إرشادات الطقس.',
 marks:[['#bsub','اسم القسم ▾','اضغط عليه لتنتقل بسرعة لأي قسم آخر.'],['#opts label:nth-of-type(1)','ع · م · ق','تظهر أو تخفي الأعمدة: العربي، المعرَّب، القبطي.'],['#btnSearch','بحث','يبحث في كل نصوص البرنامج.'],['.sts','رحلة المسيح','المحطة التي تقابل هذا الجزء من القداس (تفصيلها في صفحتها).'],['.unh [data-whc]','🕊 همسة','يظهر أو يخفي همسة صلاة قصيرة من وحي القطعة.'],['.unh [data-live]','🕯 وضع الكنيسة','نص كبير داكن للقراءة داخل الكنيسة.'],['.unh [data-uidx]','فهرس','قائمة قطع هذا القسم للانتقال لأي قطعة.'],['.unb','شريط التقدم','نسبة ما قرأته في هذا القسم.'],['.unp .rub, .rub','إرشاد (أحمر)','حركات الكاهن والشعب وما يقال.'],['#dsheet','الدرج السفلي','تبويبات: النص، تأمل، المحطة، ملاحظات وغيرها. اسحبه لأعلى.'],['#dxfab','＋ / ✓','يضيف القسم لأي قائمة من قوائمك، ويفتح قائمة خياراتها.'],['#qfs','أ+ / أ−','تكبير وتصغير الخط فورا.']],
 nav:'للانتقال بين الأجزاء: «التالي» في آخر الصفحة، أو اسحب الشاشة، أو افتح الفهرس. هذه الأزرار تظهر هنا فقط.'},
{id:'story',title:'رحلة المسيح في القداس',hash:'#/s/bas-hulul',setup:async p=>{await open(p,'.sts .sti')},summary:'القداس يعيد رحلة المسيح من الميلاد للصعود. هذه الورقة تشرح أي محطة أنت فيها.',
 marks:[['.jin','ما هذه الخريطة؟','شرح قصير للفكرة.'],['.jt.hr','أنت هنا','المحطة التي تقابل ما تقرؤه الآن.'],['.jt:nth-of-type(1) .jm','يقابل في القداس','الجزء من القداس الذي يقابل هذه المحطة.']],
 nav:'في أعلى القراءة: اضغط الصف لتصغير الشريط لدوائر المحطات فقط، وبنفس الضغطة يكبر.'},
{id:'lists',title:'قوائمي',hash:'#/dxlist',summary:'تجمّع قبل القداس الأقسام التي ستصليها، بالترتيب الذي تريده، وتقرؤها بعدها متتالية.',
 marks:[['.dxtabs','القوائم','لكل قائمة اسم (مثلا قداس الأحد). اضغط لتبديلها، أو «＋ قائمة جديدة».'],['[data-dxren]','تسمية · نسخ · حذف','إدارة القائمة الحالية.'],['.dxtd','اقتراحات اليوم','ذكصولوجيات تناسب اليوم. ＋ لإضافتها، أو «أضف الكل».'],['.dxbar .pri','ابدأ القراءة','يقرأ من أول قسم ويتنقل بترتيب القائمة.'],['.dxi .n','الترتيب','رقم القسم في القائمة.'],['.dxi .mv','▲ ▼ ✕','تحريك القسم لأعلى أو لأسفل أو حذفه.']]},
{id:'library',title:'المكتبة',hash:'#/lib',h:1000,summary:'كل محتوى الكتاب في مكان واحد.',
 marks:[['.search.lib','بحث','اضغط وابحث بالعربي أو القبطي.'],['.grid .g','أقسام الكتاب','رفع البخور، القداسات، القسمة، الذكصولوجيات، دليل الطقس وغيرها.'],['.chips','أدوات','الفهرس الكامل، تأملاتي (وما كتبته أنت)، ودراسة (مقارنة القداسات وقاموس القبطي).']]},
{id:'doxologies',title:'الذكصولوجيات',hash:'#/g/dox',setup:async p=>{await open(p,'[data-ddt="l"]');await open(p,'[data-ddl="م"]');await open(p,'[data-dds="ميخائيل رئيس الملائكه"]')},summary:'١٥٣ ذكصولوجية. تصل لأي واحدة بثلاث قوائم صغيرة: الحرف ثم القديس ثم الذكصولوجية.',
 marks:[['.dxbar .pri','قائمتي','اسم قائمتك الحالية وعدد أقسامها. يفتح «قوائمي».'],['.ddw>.ddf:nth-child(1) .ddsel','١. الحرف','يعرض الحروف الموجودة فعلا فقط. اختيار الحرف يفتح قائمة القديسين تلقائيا.'],['.ddw>.ddf:nth-child(2) .ddsel','٢. القديس','أسماء القديسين داخل الحرف بترتيب أبجدي بدون ألقاب، وتحت الاسم عدد ذكصولوجياته لو أكثر من واحدة.'],['.ddw>.ddf:nth-child(3) .ddsel','٣. الذكصولوجية','لو للقديس أكثر من ذكصولوجية تظهر مرقّمة (ذكصولوجية ١، ٢…) ومعها أول ٣ كلمات منها لتعرف أيها تفتح. لو له واحدة فقط تُختار وحدها.'],['.pdm .o:nth-child(2)','اختيار نسخة','اضغط الذكصولوجية المطلوبة فتظهر بطاقتها تحت القوائم مع ＋ للإضافة لقائمتك وزر «فتح».']]},
{id:'deacon',title:'وضع الشماس',hash:'#/pre',setup:async p=>{await open(p,'[data-dmgo="lit"]');await p.waitForTimeout(900);await open(p,'.dmt')},summary:'أثناء القداس تبقى القراءة فقط: داكنة، بخط كبير، وأزرار قليلة.',
 marks:[['#dmbar','اسم القسم','اضغطه لفتح خيارات سريعة.'],['#dmpanel','أ+ · أ− · إنهاء القداس','تكبير وتصغير الخط، أو إنهاء القداس والذهاب لصفحة «بعد القداس».'],['#dmnav .nx','التالي','زر كبير في منطقة الإبهام، ينقلك للجزء التالي (أو التالي في قائمتك).'],['#dmnav .pv','السابق','الرجوع للجزء السابق.']]},
{id:'post',title:'بعد القداس',hash:'#/post',summary:'ملخص هادئ لما صليته، وسطر شخصي يبقى في سجلك.',
 marks:[['.sum','الملخص','عدد الأقسام التي صليتها وعدد القداسات في سجلك.'],['#pnote','أصلي من أجل','اكتب سطرا يبقى في سجلك.'],['[data-postsave]','حفظ في سجلي','يحفظ الملاحظة وما صليته، وتظهر لاحقا تحت «آخر ما سجّلت».']]},
{id:'notes',title:'تأملي الشخصي',hash:'#/s/bas-hulul',setup:async p=>{await open(p,'.mnb')},summary:'اكتب تأملك الخاص تحت أي قطعة.',
 marks:[['#mnt','خانة التأمل','اكتب ما تأملته في هذه القطعة.'],['[data-mnsave]','حفظ','يُحفظ على جهازك فقط، ويظهر تحت القطعة وفي «تأملاتي» داخل المكتبة.']]},
{id:'settings',title:'الإعدادات',hash:'#/',h:900,setup:async p=>{await open(p,'#btnSet');await open(p,'[data-stg="start"]')},summary:'كل قوائم الإعدادات مقفولة افتراضيا، وتفتح بالضغط على عنوانها.',
 marks:[['[data-stg="look"]','المظهر والخط','وضع الشاشة (تلقائي، فاتح، غامق) مع ثيمات مستقلة لكل وضع، ونوع الخط وحجمه.'],['[data-stg="start"]','بداية التطبيق','تفتح على الرئيسية، أو آخر صفحة، أو صفحة تختارها.'],['[data-stg="lay"]','التخطيط والكثافة','شكل الصفحات وكثافة العرض.'],['[data-stg="read"]','القراءة والدراسة','تشغيل وإيقاف: الإرشادات، التأملات، رحلة المسيح، التنقل بالسحب وغيرها.'],['[data-stg="bk"]','النسخة الاحتياطية','تصدير واسترجاع قوائمك وإعداداتك وتأملاتك.']],
 nav:'للوصول للإعدادات: زر ☰ أعلى الشاشة. في الصفحات الطويلة، بعد ما تمرّر لتحت يظهر زر ☰ عائم أعلى الشاشة. وفي وضع الشماس: اضغط اسم القسم ثم ⚙.'}
];
(async()=>{const b=await chromium.launch();const pages=[];
for(const sp of SPECS){
 const ctx=await b.newContext({viewport:{width:390,height:sp.h||800},deviceScaleFactor:1.5,colorScheme:'dark'});const p=await ctx.newPage();
 await p.clock.setFixedTime(new Date('2026-11-14T10:00:00'));
 await p.goto(U,{waitUntil:'domcontentloaded'});
 await p.evaluate(([s,l])=>{['v16','v17','v18','v19','v20'].forEach(k=>localStorage.setItem('khulagi.'+k,'1'));localStorage.setItem('khulagi.settings',JSON.stringify(s));localStorage.setItem('khulagi.dxlists',JSON.stringify(l));localStorage.setItem('khulagi.last','bas-hulul');localStorage.setItem('khulagi.sess',JSON.stringify(['bas-istid','bas-hulul']));localStorage.setItem('khulagi.log',JSON.stringify([{t:Date.now()-864e5,n:6,note:'للمرضى'}]))},[SETTINGS,LISTS]);
 await p.goto(U+sp.hash,{waitUntil:'domcontentloaded'});await p.reload();await p.waitForTimeout(3200);
 if(sp.setup)await sp.setup(p);
 // numbered badges
 const found=await p.evaluate(marks=>{const out=[];let n=0;marks.forEach(m=>{const sp2=m[0].split('@');const el=sp2[1]!==undefined?document.querySelectorAll(sp2[0])[+sp2[1]]:document.querySelector(m[0]);if(!el){out.push(null);return}const r=el.getBoundingClientRect();if(r.width<2||r.height<2||r.top>(window.innerHeight-40)||r.bottom<0){out.push(null);return}n++;const d=document.createElement('div');d.textContent=n;d.className='__gm';d.style.cssText='position:fixed;z-index:99999;width:24px;height:24px;border-radius:50%;background:#ff5a36;color:#fff;font:700 14px sans-serif;display:grid;place-items:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5);left:'+Math.max(4,Math.min(366,r.left+4))+'px;top:'+Math.max(4,Math.min(window.innerHeight-30,r.top+2))+'px';document.body.appendChild(d);out.push(n)});return out},sp.marks);
 await p.waitForTimeout(300);
 const file=sp.id+'.jpg';await p.screenshot({path:path.join(OUT,file),type:'jpeg',quality:72});
 const items=[];sp.marks.forEach((m,i)=>{if(found[i])items.push([found[i],m[1],m[2]])});
 pages.push({id:sp.id,title:sp.title,img:'guide/'+file,summary:sp.summary,items,nav:sp.nav||''});
 console.log(sp.id,items.length+'/'+sp.marks.length);await ctx.close()}
fs.writeFileSync(path.join(ROOT,'guide-pages.js'),'/* مولَّد تلقائيا من tools/make-guide.js — لا تعدّله يدويا */\nwindow.KG_PAGES='+JSON.stringify(pages,null,1)+';\n');
await b.close()})();
