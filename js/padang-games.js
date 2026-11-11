/* Padang Balapan mini games (Round 9): Lari Pecut 100m, Lari Berpagar 60m, Lompat Jauh. Numbers live in js/padang-data.js.
   The 2.5D side-view stage is built once, far away from the field (z = SZ), so it is never seen while walking. padang.js moves the camera
   (see CAMSIDE at the top of padang.js) and calls PG.begin(i,cb) when the camera has arrived.
   cb({exit:true}) if the player quits, or cb({i,score,stars,txt,tip}) when the game is finished. Score 0-100 -> starsOf() / gradeOf() in core.js.
   All sounds go through PG.snd, so the audio round can replace them in one place. */
(function(){
const SZ=-180,LZ=[-2.4,0,2.4],LEN=130,JH=1.1;
let stg=null,GS=null,cb=null,fin,hur=[],jmpG,flag,cheer=[];
const snd={tick(){tone(520,0,.04,'square',.04)},bad(){tone(180,0,.25,'sawtooth',.06)},beep(go){tone(go?900:520,0,go?.35:.15,'square',.08)},
 star(n){for(let i=0;i<n;i++)tone(600+i*160,i*.14,.18,'triangle',.12)},jump(){tone(420,0,.12,'sine',.1);tone(620,.08,.12,'sine',.08)},
 land(){tone(160,0,.15,'triangle',.1)},cheer(){[0,1,2,3].forEach(i=>tone(500+i*120,i*.07,.12,'triangle',.07))}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),R2=v=>Math.round(v*100)/100;
function hud(id,t){const e=$(id);if(e&&e._t!==t){e._t=t;e.textContent=t}}
function banner(t){const e=$('cd');e.textContent=t;e.style.display=t?'block':'none'}
/* ---- the stage: 3 lanes along +x, runner on the middle lane, camera looks from +z ---- */
function init(){if(stg)return;stg=new T.Group();stg.visible=false;sc.add(stg);
 LZ.forEach((z,k)=>bx(stg,LEN,.05,2.3,k==1?'#c75b3c':'#d2694a',55,0,SZ+z));
 [-3.6,-1.2,1.2,3.6].forEach(z=>bx(stg,LEN,.06,.09,'#ffffff',55,.04,SZ+z));
 for(let x=0;x<=120;x+=10)bx(stg,x?.12:.25,.06,7.3,'#ffffff',x,.04,SZ);
 bx(stg,LEN,1.1,.2,'#2f6fd0',55,.55,SZ-5.2);bx(stg,LEN,.15,.22,'#ffd23f',55,1.1,SZ-5.2);
 for(let x=-4;x<=120;x+=11)mkTree(stg,x,SZ-12-(x%3),1+(x%4)*.1);
 [12,30,52,70,90,108].forEach(x=>{const m=npc('murid');m.position.set(x,0,SZ-4+rnd(-.5,.5));stg.add(m);cheer.push({m,ph:rnd(0,6)})});
 fin=new T.Group();for(let k=0;k<6;k++)bx(fin,.35,.06,1.2,k%2?'#222222':'#ffffff',0,.05,-3.0+k*1.2);
 [-1,1].forEach(s=>bx(fin,.1,1.7,.1,'#ffffff',0,.85,s*3.8));bx(fin,.06,.35,7.7,'#e24b4b',0,1.55,0);fin.position.z=SZ;stg.add(fin);
 for(let k=0;k<6;k++){const h=new T.Group();[-1,1].forEach(s=>bx(h,.07,.55,.07,'#f5f5f5',0,.275,s*1.0));bx(h,.08,.12,2.1,'#e8730c',0,.5,0);bx(h,.085,.06,2.1,'#ffffff',0,.38,0);h.position.z=SZ;stg.add(h);hur.push(h)}
 const J=PD.g[2],B=J.board;jmpG=new T.Group();stg.add(jmpG);
 bx(jmpG,J.gz,.03,2.3,'#4ccf5a',B-J.gz/2,.035,SZ);bx(jmpG,J.rz,.03,2.3,'#e04a4a',B+J.rz/2,.035,SZ);bx(jmpG,.3,.1,2.3,'#ffffff',B,.05,SZ);
 const p0=B+J.rz+1.2,pl=6.4,pm=p0+pl/2; /* sand and frame are separate boards (no overlapping tops = no flicker) */
 bx(jmpG,pl,.08,2.8,'#ead08a',pm,.04,SZ);[-1,1].forEach(k=>bx(jmpG,pl+.4,.14,.1,'#a67c52',pm,.07,SZ+k*1.45));bx(jmpG,.1,.14,2.8,'#a67c52',p0-.05,.07,SZ);bx(jmpG,.1,.14,2.8,'#a67c52',p0+pl+.05,.07,SZ);
 for(let k=1;k<6;k++)bx(jmpG,.04,.11,2.8,'#c9a95a',p0+k,.055,SZ);
 flag=new T.Group();bx(flag,.04,.9,.04,'#ffffff',0,.45,0);bx(flag,.4,.25,.03,'#e24b4b',.2,.8,0);flag.position.z=SZ+1.6;flag.visible=false;stg.add(flag);
 const press=(el,fn)=>{el.onpointerdown=e=>{e.preventDefault();el.classList.add('dn');fn()};el.onpointerup=el.onpointercancel=el.onpointerleave=()=>el.classList.remove('dn');el.oncontextmenu=e=>e.preventDefault()};
 press($('sL'),()=>tap('L'));press($('sR'),()=>tap('R'));press($('sJ'),()=>jump());$('sx').onclick=()=>quit();
 addEventListener('keydown',e=>{if(!GS||e.repeat)return;const c=e.code;
  if(c=='KeyA'||c=='ArrowLeft'){tap('L');e.preventDefault()}else if(c=='KeyD'||c=='ArrowRight'){tap('R');e.preventDefault()}
  else if(c=='Space'||c=='ArrowUp'||c=='KeyW'||c=='KeyE'){jump();e.preventDefault()}})}
/* ---- helpers ---- */
function btns(){const p=GS?GS.ph:'',i=GS?GS.i:-1;
 $('sL').hidden=$('sR').hidden=!(((i==0||i==1)&&(p=='count'||p=='run'))||(i==2&&(p=='ready'||p=='runup')));
 $('sJ').hidden=!((i==1&&(p=='count'||p=='run'))||(i==2&&p=='auto'));$('sJ').classList.toggle('nr',i==1);
 $('sHt').hidden=$('sL').hidden;$('sHt').firstChild.textContent=i==1?'◀ ▶ bergilir-gilir · LOMPAT di pagar':'◀ ▶ bergilir-gilir'}
function setPh(p,cd){GS.ph=p;GS.cd=cd||0;btns()}
/* Tap rules (Lari Pecut and the Lompat Jauh run-up): alternate ◀ ▶ (L/R inside). The same side twice = stumble */
function tap(side){if(!GS||GS.stun>0)return;const k=GS.g;if(!(((GS.i==0||GS.i==1)&&GS.ph=='run')||(GS.i==2&&GS.ph=='runup')))return;
 if(GS.last===side){GS.mis++;GS.v=0;GS.stun=k.stun;GS.last=null;snd.bad();toast('Tersadung! Gilir ◀ ▶.',900)}
 else{GS.v=Math.min(k.vmax,GS.v+k.imp);GS.last=side;snd.tick()}}
function jump(){if(!GS)return;const k=GS.g;
 if(GS.i==1&&GS.ph=='run'){if(GS.y<=0&&!GS.air){GS.vy=k.jv;GS.air=1;snd.jump()}}
 else if(GS.i==2&&GS.ph=='auto'){if(GS.d>=k.board)return foul('Terlebih papan! Batal.');GS.x0=GS.d;GS.F=GS.v*k.air;GS.at=0;setPh('air');snd.jump()}}
function foul(m){GS.res.push(null);banner(m);snd.bad();GS.fall=1;setPh('after',1.8)}
function nextTry(){const k=GS.g;GS.d=0;GS.v=0;GS.y=0;GS.last=null;GS.stun=0;GS.fall=0;flag.visible=false;PG.rx=0;PG.snap=1;
 banner('Percubaan '+(GS.res.length+1)+' daripada '+k.tries);setPh('ready',1.3)}
function finish(res){GS.res2=res;banner(res.head);snd.cheer();setPh('end',1.8)}
function pack(score,txt,tip,sum){return{i:GS.i,score,stars:starsOf(score),txt,tip,sum}} /* sum = short result for the summary card */
/* ---- begin / quit / end ---- */
function begin(i,callback){init();cb=callback;const g=PD.g[i];
 GS={i,g,ph:'count',cd:1,cs:0,t:0,d:0,v:0,y:0,vy:0,air:0,last:null,stun:0,mis:0,hits:0,slow:0,sp:0,fall:0,res:[],bn:0};
 fin.visible=i<2;if(i<2)fin.position.x=g.len;jmpG.visible=i==2;flag.visible=false;
 hur.forEach((h,k)=>{h.visible=i==1&&k<(g.hd||[]).length;if(h.visible){h.position.x=g.hd[k];h.rotation.z=0;h.userData={down:0,passed:0}}});
 document.body.classList.remove('mn');document.body.classList.add('sg');hud('sn',g.n);hud('stm2','');hud('sd','');PG.rx=0;PG.snap=1;
 if(i==2){nextTry()}else{banner('Bersedia...');snd.beep(0);setPh('count',1)}}
function quit(){if(!GS)return;GS=null;banner('');$('sL').hidden=$('sR').hidden=$('sJ').hidden=$('sHt').hidden=true;const f=cb;cb=null;if(f)f({exit:true})}
/* ---- every frame ---- */
function update(dt,t){if(!stg||!stg.visible)return;
 cheer.forEach(c=>{const u=c.m.userData,w=Math.sin(t*7+c.ph);u.arms[0].rotation.x=u.arms[1].rotation.x=-2.5+w*.4;u.B.position.y=Math.abs(w)*.1});
 if(!GS)return;const g=GS.g,i=GS.i;
 if(GS.bn>0){GS.bn-=dt;if(GS.bn<=0)banner('')}
 if(GS.stun>0)GS.stun-=dt;
 if(GS.ph=='count'){GS.cd-=dt;if(GS.cd<=0){GS.cs++;if(GS.cs==1){banner('Sedia...');snd.beep(0);GS.cd=1}else{banner('LARI!');snd.beep(1);GS.bn=.7;setPh('run');GS.cs=0}}}
 else if(GS.ph=='ready'){GS.cd-=dt;if(GS.cd<=0){banner('');setPh('runup')}}
 else if(GS.ph=='run'||GS.ph=='runup'||GS.ph=='auto'||GS.ph=='air'||GS.ph=='end'||GS.ph=='after')stepGame(dt);
 /* runner pose */
 const u=pm.userData,v=GS?GS.v:0,air=GS&&(GS.y>.02||GS.ph=='air');
 GS.sp+=dt*(2+v*1.25);const w=Math.sin(GS.sp),amp=Math.min(1,.25+v/8)*.9,mv=v>.3&&GS.stun<=0&&!GS.fall;
 pm.position.set(GS.d,GS.y,SZ);pm.rotation.y=Math.PI/2;
 if(air){u.legs[0].rotation.x=-1.3;u.legs[1].rotation.x=.7;u.arms[0].rotation.x=-2.3;u.arms[1].rotation.x=-2.3;u.B.rotation.x=.05;u.B.position.y=0}
 else if(GS.stun>0||GS.fall){u.legs.forEach(l=>l.rotation.x=0);u.arms[0].rotation.x=u.arms[1].rotation.x=-1.2;u.B.rotation.x=.55;u.B.position.y=0}
 else if(mv){u.legs[0].rotation.x=w*amp;u.legs[1].rotation.x=-w*amp;u.arms[0].rotation.x=-w*amp*.9;u.arms[1].rotation.x=w*amp*.9;u.B.rotation.x=.14*Math.min(1,v/6);u.B.position.y=Math.abs(w)*.04}
 else{u.legs.forEach(l=>l.rotation.x=0);u.arms.forEach(a=>a.rotation.x=0);u.B.rotation.x=0;u.B.position.y=0}
 PG.rx=GS.d;
 if(!GS.hudOff){if(i==2){hud('stm2','Percubaan '+Math.min(g.tries,GS.res.length+1)+'/'+g.tries);const b=Math.max.apply(null,GS.res.map(r=>r||0).concat([0]));
   hud('sd',GS.ph=='runup'||GS.ph=='ready'?'Larian '+Math.min(g.ru,Math.floor(GS.d))+'/'+g.ru+' m':GS.ph=='auto'?'Pilih LOMPAT di zon hijau!':'Terbaik: '+(b?b.toFixed(2)+' m':'—'))}
  else{hud('stm2',GS.t.toFixed(2)+' s');hud('sd',Math.min(g.len,Math.floor(GS.d))+' / '+g.len+' m'+(i==1?' · Pagar jatuh: '+GS.hits:''))}}}
function stepGame(dt){const g=GS.g,i=GS.i;
 if(GS.ph=='end'){GS.v*=Math.max(0,1-dt*2.5);GS.d+=GS.v*dt;GS.cd-=dt;if(GS.cd<=0){const r=GS.res2,f=cb;GS.ph='done';GS.hudOff=1;banner('');btns();cb=null;if(f)f(r)}return}
 if(GS.ph=='after'){GS.v*=Math.max(0,1-dt*3);GS.d+=GS.v*dt;GS.cd-=dt;if(GS.cd<=0){GS.fall=0;
   if(GS.res.length>=g.tries){const ok=GS.res.filter(Boolean),best=ok.length?Math.max.apply(null,ok):0,sc=best?clamp(Math.round(70+(best>=g.tgt?(best-g.tgt)*g.up:-(g.tgt-best)*g.dn)),15,100):15;
    GS.res2=pack(sc,best?'Terbaik: '+best.toFixed(2)+' m  ('+GS.res.map((r,k)=>(k+1)+': '+(r?r.toFixed(2)+' m':'Batal')).join(' · ')+')':'Semua percubaan Batal.',
     best?(best>=3.3?'Lompatan hebat!':'Cuba lompat tepat di zon hijau dan lari lebih laju.'):'Pilih LOMPAT di zon hijau, sebelum papan merah.',best?best.toFixed(2)+' m':'Batal');
    finish(GS.res2)}else nextTry()}return}
 if(i==0){ /* Lari Pecut: alternate taps build speed, drag slows it */
  GS.t+=dt;if(GS.stun>0)GS.v=0;else GS.v=Math.max(0,GS.v-GS.v*g.drag*dt);GS.d+=GS.v*dt;
  if(GS.d>=g.len){GS.d=g.len;const T0=GS.t,sc=clamp(Math.round(70+(g.tgt-T0)*(T0<=g.tgt?g.up:g.dn)),15,100);
   finish(Object.assign(pack(sc,'Masa: '+T0.toFixed(2)+' saat'+(GS.mis?' · Tersadung: '+GS.mis:''),T0<=g.tgt?'Laju! Tahan rentak ◀ ▶.':'Cuba ◀ ▶ lebih laju dan jangan tersadung.',T0.toFixed(2)+' s'),{head:T0.toFixed(2)+' s'}))}}
 else if(i==1){ /* Lari Berpagar (15c): alternate taps build speed like Lari Pecut, LOMPAT over each hurdle */
  GS.t+=dt;if(GS.stun>0)GS.v=0;else GS.v=Math.max(0,GS.v-GS.v*g.drag*dt);GS.d+=GS.v*dt;
  GS.y+=GS.vy*dt;GS.vy-=g.g*dt;if(GS.y<=0){GS.y=0;GS.vy=0;GS.air=0}
  hur.forEach((h,k)=>{if(k>=g.hd.length)return;const u=h.userData;
   if(!u.passed&&GS.d>=g.hd[k]){u.passed=1;if(GS.y<g.hh){u.down=1;GS.hits++;GS.v*=g.slow;snd.bad();toast('Aduh! Pagar jatuh.',900)}else snd.tick()}
   if(u.down&&h.rotation.z>-1.35)h.rotation.z=Math.max(-1.35,h.rotation.z-dt*9)});
  if(GS.d>=g.len){GS.d=g.len;const T0=GS.t,sc=stallScore(GS.hits,T0,g.tgt);
   finish(Object.assign(pack(sc,'Masa: '+T0.toFixed(2)+' saat · Pagar jatuh: '+GS.hits+'/'+g.hd.length+(GS.mis?' · Tersadung: '+GS.mis:''),GS.hits?'Lompat sedikit lebih awal atau lewat? Cuba lagi!':'Tiada pagar jatuh! Mantap!',T0.toFixed(2)+' s · '+GS.hits+' pagar jatuh'),{head:T0.toFixed(2)+' s'}))}}
 else{ /* Lompat Jauh */
  if(GS.ph=='runup'){if(GS.stun>0)GS.v=0;else GS.v=Math.max(0,GS.v-GS.v*g.drag*dt);GS.d+=GS.v*dt;
   if(GS.d>=g.ru){GS.v=Math.max(g.vmin,GS.v);setPh('auto');banner('LOMPAT di zon hijau!');GS.bn=1.2}}
  else if(GS.ph=='auto'){GS.d+=GS.v*dt;if(GS.d>=g.board+g.rz)foul('Terlepas papan! Batal.')}
  else if(GS.ph=='air'){GS.at+=dt;const u=Math.min(1,GS.at/g.air);GS.d=GS.x0+GS.F*u;GS.y=4*g.jh*u*(1-u);
   if(u>=1){GS.y=0;const dist=Math.max(.2,R2(GS.x0+GS.F-g.board));GS.res.push(dist);flag.position.x=GS.x0+GS.F;flag.visible=true;banner(dist.toFixed(2)+' m');snd.land();setPh('after',1.9)}}}}
const PG={z:SZ,rx:0,snap:0,snd,
 show(){init();stg.visible=true},end(){if(stg)stg.visible=false;GS=null;cb=null;banner('');$('sL').hidden=$('sR').hidden=$('sJ').hidden=$('sHt').hidden=true;document.body.classList.remove('sg')},
 begin,update,quit,tap,jump,open:()=>!!GS&&GS.ph!='done',st:()=>GS};
window.PG=PG;
})();
