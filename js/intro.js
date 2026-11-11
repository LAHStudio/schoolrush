/* LAH? publisher splash (separate from the menu code).
   - Shows once per browser tab/session (sessionStorage), about 1.4 s, fade in / fade out only.
   - Skip: tap/click anywhere, the Langkau button, or Esc/Space/Enter.
   - Force it for testing: open index.html?intro
   - Branding changes: edit assets/brand/lah-logo.jpg and the colour in css/intro.css (#lah background). */
(function(){
  var KEY='lah_intro_seen',force=/[?&]intro(=|&|$)/.test(location.search);
  try{ if(!force&&sessionStorage.getItem(KEY))return; sessionStorage.setItem(KEY,'1'); }catch(e){}
  var el=document.createElement('div');el.id='lah';el.setAttribute('role','img');el.setAttribute('aria-label','LAH? Little Acts of Havoc');
  el.innerHTML='<img src="assets/brand/lah-logo.jpg" width="480" height="480" alt="" draggable="false"><button id="lahskip" type="button">Langkau</button>';
  document.body.insertBefore(el,document.body.firstChild);
  var done=false,t0=Date.now(),timers=[];
  function later(f,ms){timers.push(setTimeout(f,ms))}
  function menuReady(){var m=document.getElementById('menu');return !m||getComputedStyle(m).display!=='none'}
  function finish(fast){
    if(done)return;done=true;timers.forEach(clearTimeout);
    if(fast)el.classList.add('fast');
    el.classList.add('out');
    setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);removeEventListener('keydown',key)},fast?170:340);
  }
  function key(e){if(e.key==='Escape'||e.key===' '||e.key==='Enter'){e.preventDefault();finish(true)}}
  el.addEventListener('click',function(){finish(true)});
  addEventListener('keydown',key);
  requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add('in')})});
  /* hold ~1.1 s, then fade out; if the menu is not drawn yet (slow connection) keep waiting, max 8 s */
  later(function wait(){
    if(done)return;
    if(menuReady()||Date.now()-t0>8000)finish(false);else later(wait,100);
  },1100);
})();
