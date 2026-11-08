/* وضع الكنيسة: عبارة واحدة في كل شاشة بخط كبير وزر «التالي» كبير. شاشة داكنة تبقى مضاءة. */
(function(){
"use strict";
var K=window.KH;if(!K)return;
var L={id:null,i:0,items:[],el:null,wl:null};
function S(){return K.S()}
function strip(t){return String(t||"").replace(/\[\^\d+\]/g,"").replace(/ \/ /g," ")}
function load(id){
  var c=K.D.content[id];if(!c)return false;
  var out=[],pend=[];
  c.items.forEach(function(it){
    if(it.k==="r"){pend.push(strip(it.t));return}
    if(it.k!=="p")return;
    out.push({it:it,rub:pend});pend=[]});
  if(!out.length)return false;
  L.id=id;L.items=out;return true}
function neighbor(dir){
  var s=K.BYID[L.id],a=s.group.sections,i=a.indexOf(s);
  for(i+=dir;i>=0&&i<a.length;i+=dir){var x=K.BYID[a[i].id];if(x&&x.has&&K.D.content[x.id]&&K.D.content[x.id].items.some(function(q){return q.k==="p"}))return a[i].id}
  return null}
function spk(it){
  if(it.who)return it.who.replace(/\s*[\(\[].*$/,"");
  return it.sp==="pr"?"الكاهن":it.sp==="di"?"الشماس":it.sp==="pe"?"الشعب":""}
function paint(){
  var o=L.items[L.i],it=o.it,s=S(),h="";
  var sec=K.BYID[L.id];
  var cols=[];
  var html='<div class="lvh"><button class="lvx" data-lvx="1" aria-label="إغلاق">✕</button><span class="lvt">'+K.esc(sec.title)+' · '+num(L.i+1)+' من '+num(L.items.length)+'</span><span class="lvc">'
    +[["ar","ع"],["tr","م"],["cop","ق"]].map(function(x){return '<button data-lvo="'+x[0]+'" class="'+(s[x[0]]?'on':'')+'">'+x[1]+'</button>'}).join("")+'</span></div>';
  html+='<div class="lvb"><i style="width:'+Math.round((L.i+1)/L.items.length*100)+'%"></i></div>';
  var sp=spk(it);
  html+='<div class="lvm" data-lvn="1">'+(sp?'<span class="lvs">'+K.esc(sp)+'</span>':'');
  if(o.rub.length)html+='<div class="lvr">'+o.rub.map(K.esc).join(" · ")+'</div>';
  if(s.cop&&it.cop)html+='<div class="lvcop">'+K.esc(it.cop)+'</div>';
  if(s.tr){var t=it.tr||(it.cop?K.trLine(it.cop):"");if(t)html+='<div class="lvtr">'+K.esc(t)+'</div>'}
  if(s.ar&&it.ar)html+='<div class="lvar">'+K.esc(strip(it.ar))+'</div>';
  html+='</div>';
  var nx=L.items[L.i+1];
  html+='<div class="lvn">'+(nx?'التالي: '+K.esc(strip(nx.it.ar||nx.it.cop||"").split(/\s+/).slice(0,8).join(" "))+'…':(neighbor(1)?'التالي: '+K.esc(K.BYID[neighbor(1)].title):'نهاية الأجزاء'))+'</div>';
  html+='<div class="lvk"><button data-lvp="-1">السابق</button><button data-lvp="1" class="main">التالي ‹</button></div>';
  L.el.innerHTML=html;
  try{localStorage.setItem("khulagi.last",L.id)}catch(e){}}
function num(n){return String(n).replace(/\d/g,function(d){return "٠١٢٣٤٥٦٧٨٩"[d]})}
function step(d){
  var j=L.i+d;
  if(j>=0&&j<L.items.length){L.i=j;paint();return}
  var nb=neighbor(d);if(!nb)return;
  var prev=L.id;if(!load(nb))return;L.i=d>0?0:L.items.length-1;paint()}
function wake(on){
  try{
    if(on&&navigator.wakeLock){navigator.wakeLock.request("screen").then(function(w){L.wl=w}).catch(function(){})}
    else if(L.wl){L.wl.release().catch(function(){});L.wl=null}}catch(e){}}
function open(){
  var pos=K.pos(),id=pos.id||(function(){try{return localStorage.getItem("khulagi.last")}catch(e){return null}})();
  if(!id||!K.BYID[id]||!load(id)){K.toast&&K.toast("لا يوجد نص في هذا الجزء");return}
  L.i=0;
  /* ابدأ من أول عبارة في القطعة الحالية */
  var us=K.unitsOf(id);if(us&&pos.id===id&&us[pos.u]){var first=us[pos.u].items.filter(function(x){return x.k==="p"})[0];
    for(var q=0;q<L.items.length;q++){if(L.items[q].it===first){L.i=q;break}}}
  if(!L.el){L.el=document.createElement("div");L.el.id="live";L.el.className="live";document.body.appendChild(L.el)}
  L.el.hidden=false;document.documentElement.classList.add("liveon");K.close&&K.close();paint();wake(true)}
function close(){
  if(!L.el)return;L.el.hidden=true;document.documentElement.classList.remove("liveon");wake(false);
  /* ارجع إلى القراءة عند القطعة التي وقفت عندها */
  var us=K.unitsOf(L.id),u=0;
  if(us){var it=L.items[L.i].it;for(var k=0;k<us.length;k++){if(us[k].items.indexOf(it)>-1){u=k;break}}}
  try{var m=JSON.parse(localStorage.getItem("khulagi.unit")||"{}");m[L.id]=u;localStorage.setItem("khulagi.unit",JSON.stringify(m))}catch(e){}
  if(location.hash!=="#/s/"+L.id)location.hash="#/s/"+L.id;else K.render(L.id,u)}
document.addEventListener("click",function(e){
  var t=e.target;if(!t.closest)return;
  if(t.closest("[data-live]")){open();return}
  if(!L.el||L.el.hidden)return;
  if(!L.el.contains(t))return;
  if(t.closest("[data-lvx]")){close();return}
  var o=t.closest("[data-lvo]");if(o){var k=o.getAttribute("data-lvo");S()[k]=!S()[k];K.save();paint();return}
  var p=t.closest("[data-lvp]");if(p){step(+p.getAttribute("data-lvp"));return}
  if(t.closest("[data-lvn]")){step(1)}});
document.addEventListener("keydown",function(e){
  if(!L.el||L.el.hidden)return;
  if(e.key==="Escape")close();else if(e.key==="ArrowLeft"||e.key===" ")step(1);else if(e.key==="ArrowRight")step(-1)});
var tx=null;
document.addEventListener("touchstart",function(e){tx=(L.el&&!L.el.hidden&&e.touches.length===1)?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
document.addEventListener("touchend",function(e){
  if(!tx)return;var d=e.changedTouches[0],dx=d.clientX-tx.x,dy=d.clientY-tx.y;tx=null;
  if(Math.abs(dx)>60&&Math.abs(dx)>1.6*Math.abs(dy))step(dx>0?1:-1)},{passive:true});
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"&&L.el&&!L.el.hidden)wake(true)});
window.KL={open:open,close:close};
})();
