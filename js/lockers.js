/* Round 18b: hallway lockers (the blue boxes along the walls, LKM from world-build.js).
   Lockers are ALWAYS blue. A few of them glow a little (soft pulse on the blue): up to 6 hold loot (a Kedai Runcit item for the bag, or money) and up to 3 are "berbau" traps (slow + disgusted emoji). The trap glows the same as the loot.
   Which lockers is random (never two next to each other). The map is made at the start of a session and again at every refresh, and kept in sessionStorage 'sk_lk': {t0 = time of the first attempt (0 = none yet), o = {locker: 1 opened}, map = {locker: 'i:gula' | 'm:50' | 'b'}}.
   E near a locker = a number-pattern puzzle (6 numbers, 1 blank, or 2 on Sukar). Right answer: you get what is inside. Wrong answer or timeout: nothing, the locker is used up. Every attempt counts toward the 4 per session and sends a prefect 3 s later (faster after a wrong answer or timeout).
   An opened locker stops glowing and stays closed until the refresh, 150 s after the first attempt. A new session starts when you arrive from outside (sk_arr); going into a room and back keeps it.
   Warning when he comes: a flashing ⚠ on screen for 2 s, two beeps, and a red triangle on the minimap while he chases (storyMM in story.js asks lockPf).
   Caught by the prefect: the game freezes, red "KANTOI!" overlay (-20 points in Mod Kelas shown under it), fade to black, back to the start while black, fade in, then the existing rotan scene (caneStart in world.js): 1st catch 1 rotan, 2nd 2 rotan, 3rd 3 rotan + 15 s detention in the Pejabat (lockDetain), slow 8 / 12 / 16 s afterwards.
   Global names: LOCK, lockWC (Round 19), lockGo, lockHint, lockTick, lockDetain, lockPf. Ids and classes: lkxp, lkxc, lkxh, lkxs, lkxn, lkxbar, lkxo, lkxcss, lkxd, lkxdt, lkxw, lkxk, lkxf. Tune everything in CFG. */
const LOCK=(()=>{
 const CFG={max:4,refresh:150,delay:3,spd:4,spdBad:5.5,run:20,grace:1,dmin:8,dmax:12,catchR:.85,pen:20,t1:6,t2:8,
  loot:6,trap:3,pItem:.6,money:[20,50,100],      /* up to 6 loot lockers (60% item, else money in sen), up to 3 berbau lockers */
  slow:5,smell:1.1,detain:15,warn:2,kantoi:1.2,fout:.5,hold:.2,fin:.5,key:'sk_lk',reach:1.2,pf:5,glow:'#4f9dff',serik:60,sk:'sk_sr',seen:16,
  L:{line:'Line tak clear lah!',serik:'Saya dah serik',enough:'Dah cukup untuk hari ni'},lockMsg:'Pintu dikunci! Lari ke Padang atau keluar!'}; /* Round 19h: self-talk lines (no numbers on screen); serik = seconds after being caught; seen = how far a prefect counts as in view */
 const ITEMS=['gula','pisang','iso','epal'];
 const pk=(a,r)=>a[Math.min(a.length-1,Math.floor(r()*a.length))];
 /* ---- pure logic (tested in tools/test-lock.js) ---- */
 /* the loot map: loot and trap lockers, all different and never next to each other */
 function mkMap(n,r){r=r||Math.random;const m={};if(!(n>0))return m;const a=[];for(let i=0;i<n;i++)a.push(i);for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}
  const used={};let want=CFG.loot+CFG.trap,k=0;const put=v=>{for(;k<a.length;k++){const i=a[k];if(used[i-1]||used[i+1]||used[i])continue;used[i]=1;k++;return i}return -1};
  for(let c=0;c<want;c++){const i=put();if(i<0)break;m[i]=c<CFG.trap?'b':(r()<CFG.pItem?'i:'+pk(ITEMS,r):'m:'+pk(CFG.money,r))}
  return m}
 const fresh=(n,r)=>({t0:0,o:{},map:mkMap(n,r)});
 const okState=s=>s&&typeof s=='object'&&s.t0>=0&&s.o&&typeof s.o=='object'&&s.map&&typeof s.map=='object';
 function norm(s,now,n,r){if(!okState(s)||(s.t0>0&&(now<s.t0||now-s.t0>=CFG.refresh*1000)))return fresh(n,r);return s}
 const cnt=s=>Object.keys(s.o).length;
 const secLeft=(s,now)=>s.t0>0?Math.max(0,Math.ceil(CFG.refresh-(now-s.t0)/1000)):0;
 const glowList=s=>Object.keys(s.map).filter(i=>!s.o[i]).sort((a,b)=>a-b);
 function lootOf(c){if(c=='b')return{k:'b'};const p=String(c||'').split(':');return p[0]=='i'&&ITEMS.includes(p[1])?{k:'i',key:p[1]}:p[0]=='m'&&+p[1]>0?{k:'m',amt:+p[1]}:{k:'no'}}
 const lvOf=l=>l=='mudah'?0:l=='sukar'?2:1;
 function gen(lv,r){r=r||Math.random;const ri=(a,b)=>a+Math.floor(r()*(b-a+1)),ks=lv==0?['add','sub']:lv==1?['add','sub','mul','alt']:['add','sub','mul','alt','sq'],kind=ks[ri(0,ks.length-1)],q=[];
  if(kind=='add'){const s=ri(1,20),d=ri(2,lv?9:5);for(let i=0;i<6;i++)q.push(s+i*d)}
  else if(kind=='sub'){const d=ri(2,lv?9:5),s=ri(5*d+2,5*d+30);for(let i=0;i<6;i++)q.push(s-i*d)}
  else if(kind=='mul'){const m=lv==2?ri(2,3):2;let v=ri(1,m==3?2:4);for(let i=0;i<6;i++){q.push(v);v*=m}}
  else if(kind=='alt'){const a=ri(2,6);let b=ri(1,4);if(b==a)b=a>1?a-1:2;let v=ri(1,15);for(let i=0;i<6;i++){q.push(v);v+=i%2?b:a}}
  else{const k=ri(1,5);for(let i=0;i<6;i++)q.push((k+i)*(k+i))}
  const bl=lv==2?[ri(1,2),ri(4,5)]:[ri(2,4)];
  const dis=v=>{const c=[v+1,v-1,v+2,v-2,v+3,v+10,v-10].filter(x=>x>=0&&x!=v),o=[v];while(o.length<3)o.push(c.splice(ri(0,c.length-1),1)[0]);for(let i=2;i>0;i--){const j=ri(0,i),t=o[i];o[i]=o[j];o[j]=t}return o};
  return{kind,seq:q,bl,ans:bl.map(i=>q[i]),opts:bl.map(i=>dis(q[i])),tm:bl.length==2?CFG.t2:CFG.t1}}
 /* spawn spot: from the walkable pool, CFG.dmin..dmax m from the player, not on screen (vis(x,z) = true when on screen); widens the ring if nothing fits */
 function pickSpawn(pool,px,pz,vis,r){r=r||Math.random;if(!pool||!pool.length)return null;
  for(const w of[0,3,6]){const l=pool.filter(p=>{const d=Math.hypot(p.x-px,p.z-pz);return d>=CFG.dmin-w&&d<=CFG.dmax+w&&!vis(p.x,p.z)});if(l.length)return l[Math.floor(r()*l.length)]}
  const l=pool.filter(p=>Math.hypot(p.x-px,p.z-pz)>=CFG.dmin);return l.length?l[Math.floor(r()*l.length)]:pool[Math.floor(r()*pool.length)]}
 /* ---- game side (needs the world page) ---- */
 let sig='',gm=new Map(),puz=null,sw=0,pf=null,pool=null,sp=null,ready=0,smell=0,sm2=0,dtn=0,dtS=0,wT=0,kn=null;
 const now=()=>Date.now();
 function load(){const raw=SS.get(CFG.key),s=norm(raw,now(),LKM.length);if(s!==raw)SS.set(CFG.key,s);return s}
 const save=s=>SS.set(CFG.key,s);
 function init(){if(ready)return;ready=1;try{if(SS.get('sk_arr')){SS.set(CFG.key,fresh(LKM.length));SS.del(CFG.sk)}}catch(e){}} /* sk_arr is still set here: story.js removes it later in boot() */
 const menuOpen=()=>{const m=document.getElementById('menu');return !!m&&m.style.display=='flex'};
 function busy(){return SM.some(u=>u.cd<=0&&Math.hypot(P.x-u.x,P.z-u.z)<1.1)||(carry>=0&&BN.some(b=>Math.hypot(P.x-b.x,P.z-b.z)<1.3))||WF.some(q=>Math.hypot(P.x-q[0],P.z-q[1])<1.6)||VS.some(v=>Math.hypot(P.x-v.x,P.z-v.z)<1.5)||DR.some(d=>Math.hypot(P.x-d[7],P.z-d[8])<1.2)}
 function near(){if(!LKM.length||busy())return -1;let b=-1,bd=CFG.reach;LKM.forEach((q,i)=>{if(Math.sign(P.z-q.z)!=q.d)return;const d=Math.hypot(P.x-q.x,P.z-q.z);if(d<bd){bd=d;b=i}});return b}
 /* glow = the locker's own blue with a pulsing emissive; the closed, opened and empty lockers keep their normal material */
 function glowMat(m0){let g=gm.get(m0);if(!g){g=m0.clone();if(g.emissive){g.emissive.set(CFG.glow);g.emissiveIntensity=.3}else if(g.color&&g.color.offsetHSL)g.color.offsetHSL(0,0,.1);gm.set(m0,g)}return g}
 function paint(s){const gl=glowList(s),k=gl.join(',');if(k===sig)return;sig=k;const on={};gl.forEach(i=>on[i]=1);
  LKM.forEach((q,i)=>{if(!q.m0)q.m0=q.m.material;q.m.material=on[i]?glowMat(q.m0):q.m0})}
 const state=()=>{const s=load();paint(s);return s};
 /* ---- puzzle overlay ---- */
 function css(){if(document.getElementById('lkxcss'))return;const e=document.createElement('style');e.id='lkxcss';e.textContent='#lkxp{position:fixed;inset:0;z-index:15;display:none;align-items:center;justify-content:center;background:rgba(12,20,50,.55);font-family:Fredoka,sans-serif}.lkxc{box-sizing:border-box;background:#fff;border-radius:1.2em;padding:1em .9em;width:min(92vw,26em);text-align:center;box-shadow:0 6px 24px #0007}.lkxh{font-weight:700;font-size:1.3em;color:#1c2f6b}.lkxs{display:flex;gap:.25em;justify-content:center;margin:.7em 0;flex-wrap:nowrap}.lkxn{flex:1 1 0;min-width:0;padding:.3em .1em;border-radius:.5em;background:#e8efff;font-weight:700;font-size:1.3em;color:#17202b}.lkxn.q{background:#ffd23f}.lkxbar{height:.7em;background:#d9deea;border-radius:1em;overflow:hidden}.lkxbar i{display:block;height:100%;width:100%;background:#2f6fd0}.lkxo{display:flex;gap:.6em;margin-top:.9em}.lkxo button{flex:1;min-height:3.2em;font:700 1.5em Fredoka,sans-serif;border:0;border-radius:.7em;background:#2f6fd0;color:#fff}#lkxd{position:fixed;inset:0;z-index:16;display:none;flex-direction:column;align-items:center;justify-content:center;background:#0b1020;color:#fff;font-family:Fredoka,sans-serif;text-align:center}#lkxd b{font-size:1.5em;padding:0 1em}#lkxdt{font-size:5em;font-weight:700;color:#ffd23f;margin-top:.2em}#lkxw{position:fixed;top:17%;left:50%;transform:translateX(-50%);z-index:14;display:none;align-items:center;gap:.3em;padding:.15em .6em;border-radius:.6em;background:#e02424;color:#fff;border:3px solid #fff;font:900 1.8em Fredoka,sans-serif;box-shadow:0 3px 10px #0007;pointer-events:none;animation:lkxf .45s steps(2) infinite}#lkxw i{font-style:normal;font-size:1.3em;color:#ffd23f}@keyframes lkxf{50%{opacity:.4}}#lkxk{position:fixed;inset:0;z-index:17;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff;font-family:Fredoka,sans-serif;pointer-events:none}#lkxk b{font-size:4.2em;letter-spacing:.04em;-webkit-text-stroke:6px #5a0b0b;paint-order:stroke fill;text-shadow:0 5px 0 #5a0b0b}#lkxk span{font-size:1.5em;font-weight:700;margin-top:.3em}';document.head.appendChild(e)}
 function ui(){let e=document.getElementById('lkxp');if(e)return e;css();e=document.createElement('div');e.id='lkxp';e.innerHTML='<div class="lkxc"><div class="lkxh"></div><div class="lkxs"></div><div class="lkxbar"><i></i></div><div class="lkxo"></div></div>';document.body.appendChild(e);return e}
 function draw(){const e=ui(),p=puz,g=p.g,h=e.querySelector('.lkxh'),sq=e.querySelector('.lkxs'),op=e.querySelector('.lkxo');h.textContent='Buka Loker! Pilih nombor yang hilang'+(g.bl.length>1?' ('+(p.i+1)+'/'+g.bl.length+')':'');sq.textContent='';
  g.seq.forEach((v,k)=>{const n=document.createElement('span'),bi=g.bl.indexOf(k);n.className='lkxn'+(bi>=0&&bi>=p.i?' q':'');n.textContent=bi>=0&&bi>=p.i?'?':String(bi>=0?p.pick[bi]:v);sq.appendChild(n)});
  op.textContent='';g.opts[p.i].forEach(v=>{const b=document.createElement('button');b.textContent=String(v);b.onclick=()=>choose(v);op.appendChild(b)});e.style.display='flex'}
 function openPuz(id){const lv=lvOf(typeof cur!=='undefined'&&cur?cur.level:'');puz={id,g:gen(lv),i:0,pick:[],t:0};puz.t=puz.g.tm;halt=true;draw();bar()}
 function bar(){const i=document.querySelector('#lkxp .lkxbar i');if(i&&puz)i.style.width=Math.max(0,puz.t/puz.g.tm*100)+'%'}
 function choose(v){if(!puz)return;const p=puz;p.pick[p.i]=v;if(v!==p.g.ans[p.i]){finish(false);return}p.i++;if(p.i>=p.g.bl.length)finish(true);else draw()}
 function finish(ok){const id=puz.id;puz=null;const e=document.getElementById('lkxp');if(e)e.style.display='none';halt=false;
  const s=load();if(!s.t0)s.t0=now();s.o[id]=1;save(s);paint(s);
  if(ok)reward(lootOf(s.map[id]));else{say('Alamak, salah!');toast('Loker tersangkut! Salah jawapan.',2600)}
  sw=CFG.delay;sp=ok?CFG.spd:CFG.spdBad}
 /* ---- what is inside ---- */
 function reward(l){let t,y='Yeay!';
  if(l.k=='i'){const n=BAG.IT[l.key].n;t=BAG.add(l.key)?'Dapat '+n+'! Ada dalam beg.':'Beg penuh! '+n+' hilang.'}
  else if(l.k=='m'){WALLET.add(l.amt);if(window.HUD)HUD.set({});t='Jumpa duit '+WALLET.fmt(l.amt)+'!'}
  else if(l.k=='b'){P.slow=Math.max(P.slow||0,CFG.slow);smell=Math.max(smell,P.slow);sm2=0;t='Euw! Loker berbau! Kamu perlahan '+CFG.slow+' saat.';y='\uD83E\uDD22 Euw!'}
  else{t='Loker kosong.';y='Kosong...'}
  toast('Loker terbuka! '+t,3000);say(y)}
 /* ---- the prefect ---- */
 function vis(x,z){const v=new T.Vector3(x,1,z).project(cam);return v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1}
 function spawn(){const o=ns.filter(n=>n.role=='pengawas'&&!n.ch&&n.m).sort((a,b)=>Math.hypot(b.x-P.x,b.z-P.z)-Math.hypot(a.x-P.x,a.z-P.z))[0];if(!o)return;
  if(!pool||!pool.length)pool=SPOT.pool({x0:X(104),x1:X(576),z0:Z(154),z1:Z(534),sx:X(336),sz:Z(500),hit}); /* Round 19c: the flood fill starts at the hallway start spot, not at the player: from inside a toilet (outside this rectangle) it returned an empty list and the empty list was kept, so no prefect came, from the toilet or from any locker, until the page was reloaded. An empty list is never kept. */
  const q=pickSpawn(pool,P.x,P.z,vis);if(!q)return;
  o.ch=1;o.hid=0;o.m.visible=true;o.x=q.x;o.z=q.z;o.f=Math.atan2(P.x-q.x,P.z-q.z);o.mv=0;o.m.position.set(o.x,0,o.z);o.m.rotation.y=o.f;
  pf={o,t:0,sp:sp||CFG.spd,b:0};tone(520,0,.18,'sine',.1);tone(520,.25,.18,'sine',.1);toast('Pengawas datang! Lari!',2400);warn()}
 function release(){if(!pf)return;const o=pf.o;o.ch=0;o.tx=o.x;o.tz=o.z;o.w=.3+Math.random()*.7;o.mv=0;pf=null;if(window.pfUnmark)window.pfUnmark(CFG.pf)}
 function caught(){const pen=window.storyPen&&window.storyPen(CFG.pen);say('Kena tangkap!');kantoi(pen)} /* the prefect stays until the screen is black (kTick releases him); the rotan scene starts at the fade in */
 function runPf(dt,t){const o=pf.o;pf.t+=dt;if(pf.t<CFG.grace){o.mv=0;anim(o.m,t,0);pfMark(t,o,CFG.pf);return}
  const dm=pfGo(o,dt,pf.sp);o.m.position.set(o.x,0,o.z);o.m.rotation.y=o.f;anim(o.m,t,o.mv);pfMark(t,o,CFG.pf);
  pf.b-=dt;if(pf.b<=0){pf.b=Math.max(.25,Math.min(1.2,.25+dm*.045));tone(740,0,.07,'square',.07)}
  if(dm<CFG.catchR)caught();else if(pf.t>=CFG.run){release();toast('Pengawas berhenti mengejar. Fuh, lepas!',2600)}}
 /* ---- warning when the prefect comes: flashing triangle on screen, 2 s ---- */
 function warn(){css();let e=document.getElementById('lkxw');if(!e){e=document.createElement('div');e.id='lkxw';e.innerHTML='<i>\u26A0</i><span>PENGAWAS!</span>';document.body.appendChild(e)}e.style.display='flex';wT=CFG.warn}
 /* ---- KANTOI!: freeze, red overlay, fade to black, move you while black, fade in, then the rotan scene ---- */
 function kantoi(pen){css();let e=document.getElementById('lkxk');if(!e){e=document.createElement('div');e.id='lkxk';e.innerHTML='<b>KANTOI!</b><span></span>';document.body.appendChild(e)}
  const sub=e.querySelector('span');if(sub)sub.textContent=pen?'Mata -'+CFG.pen:'';e.style.display='flex';kn={ph:1,t:0,e,pen};halt=true;wT=0;const wn=document.getElementById('lkxw');if(wn)wn.style.display='none';kShade(0);tone(110,0,.3,'sawtooth',.16);tone(98,.32,.4,'sawtooth',.16)}
 function kShade(u,a){const e=kn.e;/* u 0 = red, 1 = black; a = overall opacity */a=a==null?.62+.38*u:a;e.style.background='rgba('+Math.round(190*(1-u))+','+Math.round(25*(1-u))+','+Math.round(25*(1-u))+','+a+')';e.style.color='rgba(255,255,255,'+(1-u)+')'}
 function kTick(dt){const k=kn;k.t+=dt;if(k.ph<4)halt=true;
  if(k.ph==1){if(k.t>=CFG.kantoi){k.ph=2;k.t=0}}
  else if(k.ph==2){const u=Math.min(1,k.t/CFG.fout);kShade(u);if(u>=1){k.ph=3;k.t=0;release();P.x=X(336);P.z=Z(500);P.y=0;P.vy=0;P.stun=0;cp.x=P.x;cp.z=P.z;hold=0}}
  else if(k.ph==3){if(k.t>=CFG.hold){k.ph=4;k.t=0;halt=false;if(typeof caneStart=='function')caneStart()}} /* caneStart halts the game itself */
  else{const u=Math.min(1,k.t/CFG.fin);kShade(1,1-u);if(u>=1){k.e.style.display='none';kn=null}}}
 /* ---- detention (3rd rotan): dark screen with a countdown, then out of the Pejabat door with slow. Called by caneTick in world.js ---- */
 function detain(slow){css();let e=document.getElementById('lkxd');if(!e){e=document.createElement('div');e.id='lkxd';e.innerHTML='<b>Ditahan di Pejabat</b><b style="font-size:1em;opacity:.8">Fikir balik kesalahan kamu...</b><div id="lkxdt"></div>';document.body.appendChild(e)}
  e.style.display='flex';dtn=CFG.detain;dtS=slow;halt=true;detText()}
 function detText(){const e=document.getElementById('lkxdt');if(e)e.textContent=String(Math.max(0,Math.ceil(dtn)))}
 function endDetain(){dtn=0;const e=document.getElementById('lkxd');if(e)e.style.display='none';
  P.x=PJX;P.z=PJZ+.9;P.y=0;P.vy=0;P.stun=0;cp.x=P.x;cp.z=P.z;P.slow=dtS;halt=false;serikStamp();toast('Kamu dilepaskan. Perlahan '+dtS+' saat. Jangan buat salah lagi!',3200)}
 /* ---- hooks called by world.js ---- */
 function tick(dt,t){init();const s=state();
  if(gm.size)for(const g of gm.values())if(g.emissive)g.emissiveIntensity=.22+.2*Math.sin(t*3.2);
  if(wT>0){wT-=dt;if(wT<=0){const w=document.getElementById('lkxw');if(w)w.style.display='none'}}
  if(kn){kTick(dt);return}
  if(dtn>0){halt=true;if(!menuOpen()){dtn-=dt;detText();if(dtn<=0)endDetain()}return}
  if(puz){if(!menuOpen()){halt=true;puz.t-=dt;bar();if(puz.t<=0)finish(false)}return}
  if(halt)return;
  if(smell>0){if(!(P.slow>0))smell=0;else{smell-=dt;sm2-=dt;if(sm2<=0){sm2=CFG.smell;if(typeof capText=='function')capText('\uD83E\uDD22',0)}}}
  if(sw>0){sw-=dt;if(sw<=0)spawn()}
  if(pf)runPf(dt,t)}
 /* Round 19h: only a GLOWING locker (loot or berbau, not yet opened) can be opened. Anything else is not a locker action at all (go() gives false, hint is empty). */
 const glows=(s,i)=>!s.o[i]&&s.map[i]!==undefined;
 const serikOn=(t,n)=>t>0&&n>=t&&n-t<CFG.serik*1000;
 function serikStamp(){try{SS.set(CFG.sk,now())}catch(e){}}
 const inSerik=()=>{try{return serikOn(SS.get(CFG.sk),now())}catch(e){return false}};
 function pfSeen(){try{return ns.some(n=>n.role=='pengawas'&&n.m&&n.m.visible!==false&&Math.hypot(n.x-P.x,n.z-P.z)<CFG.seen&&vis(n.x,n.z))}catch(e){return false}}
 /* the reason a glowing locker will not open (priority: prefect, serik, used up) or '' when it can be opened */
 const why=(c)=>c.line?'line':c.serik?'serik':c.enough?'enough':'';
 const busyPf=()=>!!(pf||sw>0||kn||dtn>0);
 function go(){init();if(halt||puz)return false;const i=near();if(i<0)return false;const s=state();
  if(!glows(s,i))return false;
  const w=why({line:busyPf()||pfSeen(),serik:inSerik(),enough:cnt(s)>=CFG.max});
  if(w){say(CFG.L[w]);return true}
  openPuz(i);return true}
 function hint(){init();if(halt||puz)return '';const i=near();if(i<0)return '';return glows(state(),i)?'Buka loker':''}
 /* Round 19: the wrong toilet sends the same prefect as a locker attempt (3 s later, fast like after a wrong answer), without using up a locker attempt. false when a prefect is already coming or the game is busy. */
 function wc(){if(pf||kn||puz||dtn>0||sw>0)return false;sw=CFG.delay;sp=CFG.spdBad;return true}
 if(typeof window!=='undefined'){window.lockBusy=()=>busyPf();window.lockMsg=()=>CFG.lockMsg;window.lockClear=()=>{try{SS.del(CFG.sk)}catch(e){}};window.lockEnd=third=>{if(!third)serikStamp()};window.lockWC=wc;window.lockGo=go;window.lockHint=hint;window.lockTick=tick;window.lockDetain=detain;window.lockPf=()=>pf?pf.o:null}
 return{CFG,mkMap,norm,cnt,secLeft,glowList,lootOf,lvOf,gen,pickSpawn,serikOn,why,glows}
})();
