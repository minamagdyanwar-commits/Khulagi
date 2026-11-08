/* التنقل بالسحب بين أجزاء القداس — مأخوذ من «رفيق روحي» (سحب «دفع الكارت»):
   يمين = التالي · يسار = السابق. المحتوى يتبع الإصبع، والترويسة وقائمة الأجزاء تبقى ثابتة.
   سحبة قصيرة تعيد القديم، وتقليل الحركة يبدّل فورًا، والضغط المطوّل/التظليل لا يُحسب سحبة. */
(function(){
"use strict";
var K=window.KH;if(!K)return;
var EASE="cubic-bezier(.22,.8,.25,1)",MS=340;
var st=null,drag=null,busy=false;
function on(){try{return K.S().swipe!==false}catch(e){return true}}
function calm(){try{return !!K.S().calm||matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){return false}}
function curId(){var m=location.hash.match(/^#\/s\/([^?]+)/);return m?m[1]:null}
function sel(){try{return String(window.getSelection())!==""}catch(e){return false}}
function nav(dir){return K.step(dir)}
function hscroll(t){
  for(;t&&t!==document.body&&t.nodeType===1;t=t.parentElement){
    var o=getComputedStyle(t).overflowX;if((o==="auto"||o==="scroll")&&t.scrollWidth>t.clientWidth+4)return true}
  return false}
function blocked(t){
  return !t||!t.closest||!!t.closest("input,textarea,select,[contenteditable],.sheet.on,.scrim.on,#opts,#selw")||hscroll(t)||sel()}
function go(to,from){K.render(to.id,to.u);if(to.id!==from.id){try{history.pushState(null,"","#/s/"+to.id)}catch(e){location.hash="#/s/"+to.id}}window.scrollTo(0,0)}
function clean(app){
  app.style.transition="";app.style.transform="";app.style.willChange="";
  document.documentElement.style.overflowX="";document.body.style.overflowX=""}
function begin(dx){
  if(!curId())return null;var from=K.pos();
  var sign=dx>0,to=nav(sign?1:-1);if(!to)return null;
  var app=K.app,r=app.getBoundingClientRect(),W=Math.max(app.clientWidth,200),oldY=window.scrollY;
  var ghost=document.createElement("div");ghost.className="swg";ghost.setAttribute("aria-hidden","true");ghost.innerHTML=app.innerHTML;
  ghost.style.cssText="position:fixed;z-index:5;pointer-events:none;top:"+r.top+"px;left:"+r.left+"px;width:"+r.width+"px;transform:translateX(0)";
  document.documentElement.style.overflowX="hidden";document.body.style.overflowX="hidden";
  K.render(to.id,to.u);window.scrollTo(0,0);
  var r2=app.getBoundingClientRect();
  ghost.style.clipPath="inset("+Math.max(0,r2.top-r.top)+"px 0 0 0)";
  document.body.appendChild(ghost);app.style.willChange="transform";
  return {sign:sign,to:to,from:from,ghost:ghost,app:app,W:W,oldY:oldY,dx:0}}
function move(d,dx){
  dx=d.sign?Math.max(0,dx):Math.min(0,dx);d.dx=dx;
  d.ghost.style.transition="none";d.app.style.transition="none";
  d.ghost.style.transform="translateX("+dx+"px)";
  d.app.style.transform="translateX("+(dx+(d.sign?-d.W:d.W))+"px)"}
function finish(d,commit){
  busy=true;var t="transform "+MS+"ms "+EASE;d.ghost.style.transition=t;d.app.style.transition=t;
  if(commit){
    d.ghost.style.transform="translateX("+(d.sign?d.W:-d.W)+"px)";d.app.style.transform="translateX(0)";
    setTimeout(function(){d.ghost.remove();clean(d.app);if(d.to.id!==d.from.id){try{history.pushState(null,"","#/s/"+d.to.id)}catch(e){}}busy=false},MS+20)}
  else{
    d.ghost.style.transform="translateX(0)";d.app.style.transform="translateX("+(d.sign?-d.W:d.W)+"px)";
    setTimeout(function(){d.ghost.remove();clean(d.app);K.render(d.from.id,d.from.u);window.scrollTo(0,d.oldY);busy=false},MS+20)}}
var P={passive:true},tgt=null;
function unbind(){if(tgt){tgt.removeEventListener("touchmove",onMove,P);tgt.removeEventListener("touchend",onEnd,P);tgt.removeEventListener("touchcancel",onCancel,P);tgt=null}}
/* الحدث يُرسل للعنصر الأصلي حتى بعد أن يُستبدل المحتوى، ولا يصعد إلى document؛ لذلك نسمع عليه مباشرة */
function once(e){if(e.__sw)return false;e.__sw=1;return true}
function onMove(e){if(once(e))moved(e)}
function onEnd(e){if(once(e)){unbind();end(e,false)}}
function onCancel(e){if(once(e)){unbind();end(e,true)}}
document.addEventListener("touchstart",function(e){
  unbind();st=null;drag=null;
  if(busy||!on()||!curId()||e.touches.length!==1||blocked(e.target))return;
  st={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now(),h:false,moved:false};
  tgt=e.target;tgt.addEventListener("touchmove",onMove,P);tgt.addEventListener("touchend",onEnd,P);tgt.addEventListener("touchcancel",onCancel,P)},P);
function moved(e){
  if(!st)return;var p=e.touches[0],dx=p.clientX-st.x,dy=p.clientY-st.y;
  if(!st.moved&&(Math.abs(dx)>5||Math.abs(dy)>5)){st.moved=true;if(Date.now()-st.t>=380){st=null;return}}
  if(!st.h){
    if(Math.abs(dx)>16&&Math.abs(dx)>1.8*Math.abs(dy)){st.h=true;if(!calm())drag=begin(dx)}
    else if(Math.abs(dy)>22){st=null}
    return}
  if(drag)move(drag,dx)}
document.addEventListener("touchmove",onMove,P);
document.addEventListener("touchend",onEnd,P);
document.addEventListener("touchcancel",onCancel,P);
function end(e,cancel){
  var s=st,d=drag;st=null;drag=null;if(!s||!s.h)return;
  var p=e.changedTouches&&e.changedTouches[0],dx=p?p.clientX-s.x:0,dy=p?p.clientY-s.y:0,dt=Math.max(1,Date.now()-s.t);
  var fast=Math.abs(dx)/dt*1000>480&&Math.abs(dx)>40;
  if(d){finish(d,!cancel&&!sel()&&(Math.abs(d.dx)>0.22*d.W||fast)&&(dx>0)===d.sign&&Math.abs(dy)<Math.abs(dx));return}
  if(!cancel&&!sel()&&Math.abs(dx)>=64&&Math.abs(dy)<=80&&Math.abs(dx)>=1.6*Math.abs(dy)&&dt<=800){
    var from=K.pos(),to=nav(dx>0?1:-1);if(to)go(to,from)}}

})();
