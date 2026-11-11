/* Round 19 / 19b / 19c: the toilets (rooms built by wcRoom() in js/world-build.js, listed in TOIL). They are part of the hallway world: open entrance, no door.
   Using it: E at a green cubicle door (right gender, no locker prefect chasing): the door swings open, you walk into the cubicle, the door swings shut, flush + toast + a funny line, the door swings open, you walk back out and it shuts. The far cubicle is locked ("Berkunci"; place for a bonus item and the treasure hunt in a later round).
   NPCs: when a student/teacher/prefect of the right gender reaches the toilet node (TL boys, BR girls, world.js) they now WALK IN (visible), stand at a sink for a few seconds, walk out and carry on (toiVisit, called from world.js; replaces the old "vanish for 4 to 8 s").
   Wrong toilet: walking into the room of the other gender sends the same prefect as a locker attempt (LOCK.wc via window.lockWC: 3 s later, warning, chase, KANTOI!, rotan) and the students who are INSIDE that room at that moment react (place based, nobody is spawned): girls' room = they scream and run out, boys' room = they stare shocked for a few seconds. Nobody inside = nobody reacts.
   Round 19f: the cubicle door is hinged and swings into the cubicle (its handle is part of the door); the walls just fade by the normal camera rule (no forced hiding).
   Global names: TOI, toiGo, toiHint, toiTick, toiVisit; class tqx (bubble over an NPC head). Tune everything in CFG. */
const TOI=(()=>{
 const CFG={reach:1.15,
  flush:['Lega... baru boleh fokus belajar!','Siram! Tandas bersih, hati pun senang.','Fuh, selesai! Jangan lupa cuci tangan ya.','Pssst... itu rahsia kita berdua.','Alhamdulillah, lega!'],
  locked:['Berkunci! Mana kuncinya ya?','Pintu ini dikunci. Ada orang simpan kunci di mana-mana...','Tak boleh buka. Kena cari kunci dulu.'],
  bad:['Tandas ini bukan untuk kamu!','Eh, salah tandas!'],caught:'Ada pengawas nampak! Cepat keluar!',busy:'Ada pengawas! Tak sempat!',
  use:{walk:2,close:.3,stay:2.6,say:.35,open:.3,swingT:.3},swing:1.5,
  idle:[2.5,5.5],run:4.2,scream:.9,shock:3.4,max:4,maxT:25,
  sayS:['\uD83D\uDE31 AAAH!','\uD83D\uDE31 Keluar!','\uD83D\uDE31 Eee!'],sayH:['\uD83D\uDE33 Eh?!','\uD83D\uDE33 Salah tandas!'],sayH2:['\uD83E\uDD28 Hmm...','\uD83E\uDD28 Pelik...']};
 /* ---- pure logic (tested in tools/test-toilet.js) ---- */
 const inRoom=(r,x,z)=>!!r&&x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1;
 const wrong=(r,g)=>!!r&&(r.girl?1:0)!==(g=='f'?1:0);
 function roomAt(rs,x,z){for(const r of rs||[])if(inRoom(r,x,z))return r;return null}
 function doorAt(rs,x,z,reach){let b=null,bd=reach;for(const r of rs||[])for(const d of r.doors){const k=Math.hypot(x-d.x,z-d.z);if(k<bd){bd=k;b={r,d}}}return b}
 /* hinged door: k 0 = shut, 1 = open (swung into the cubicle by CFG.swing rad about the hinge, the handle child follows) */
 function setDoor(d,k,swing){const th=k*(swing==null?1.5:swing),dx=d.s*Math.cos(th),dz=-Math.sin(th);d.leaf.position.x=d.hinge.x+d.len/2*dx;d.leaf.position.z=d.hinge.z+d.len/2*dz;d.leaf.rotation.y=Math.atan2(Math.sin(th),d.s*Math.cos(th))}
 const pk=(a,r)=>a[Math.min(a.length-1,Math.floor((r||Math.random)()*a.length))];
 const rnd=(a,b)=>a+Math.random()*(b-a);
 /* one walking step toward (tx,tz); returns true when there */
 function walk(o,tx,tz,sp,dt){const dx=tx-o.x,dz=tz-o.z,l=Math.hypot(dx,dz),st=sp*dt;if(l<=st+.03){o.x=tx;o.z=tz;return true}o.x+=dx/l*st;o.z+=dz/l*st;o.f=Math.atan2(dx,dz);return false}
 /* ---- game side (needs the world page: TOIL, ns, P, gen, halt, say, toast, tone, anim, T, cam, cv) ---- */
 let inW=0,use=null;
 function near(){return typeof TOIL!=='undefined'?doorAt(TOIL,P.x,P.z,CFG.reach):null}
 function go(){if(halt||use)return false;const q=near();if(!q)return false;
  if(!q.d.use&&window.jkDoor&&window.jkDoor(q))return true; /* Round 20c: the quest cubicle opens with the key, in either toilet (js/jkey.js) */
  if(wrong(q.r,gen)){say(pk(CFG.bad));return true}
  if(!q.d.use){say(pk(CFG.locked));return true}
  if(window.lockPf&&window.lockPf()){say(CFG.busy);return true}
  use={q,ph:0,t:0,a:0,say:0};halt=true;q.d.kt=1;return true}
 function hint(){if(halt||use)return '';const q=near();if(q&&!q.d.use&&window.jkDoorHint){const h=window.jkDoorHint(q);if(h)return h}if(!q||wrong(q.r,gen))return '';return q.d.use?'Guna tandas':'Pintu berkunci'}
 /* the player's walk in, the flush and the walk out. ph 0 walk to the door then into the cubicle (door open), 1 door closes, 2 inside, 3 door opens, 4 walk out */
 function useStep(dt){const u=use,d=u.q.d,U=CFG.use;u.t+=dt;halt=true;P.sx=P.sz=0;P.vy=0;P.y=0;
  if(u.ph==0){if(!u.a){if(walk(P,d.x,d.z,U.walk,dt))u.a=1}else if(walk(P,d.inn.x,d.inn.z,U.walk,dt)){P.f=Math.PI;u.ph=1;u.t=0;d.kt=0}}
  else if(u.ph==1){if(u.t>=U.close){u.ph=2;u.t=0}}
  else if(u.ph==2){if(!u.say&&u.t>=U.say){u.say=1;try{for(let i=0;i<8;i++)tone(430-i*42,i*.09,.14,'sawtooth',.05);tone(150,.8,.5,'sine',.07)}catch(e){}toast('Guna tandas... SIRAM!',2200);say(pk(CFG.flush))}
   if(u.t>=U.stay){u.ph=3;u.t=0;d.kt=1}}
  else if(u.ph==3){if(u.t>=U.open){u.ph=4;u.t=0}}
  else if(walk(P,d.x,d.z,U.walk,dt)){P.f=0;d.kt=0;use=null;halt=false}}
 /* ---- bubbles over NPC heads ---- */
 function bubble(txt){const e=document.createElement('div');e.className='tqx';e.textContent=txt;e.style.cssText='position:fixed;z-index:9;pointer-events:none;transform:translate(-50%,-100%);font:700 1.15em Fredoka,sans-serif;background:#fff;color:#222;border-radius:.8em;padding:.15em .5em;box-shadow:0 2px 8px #0006;white-space:nowrap;display:none';document.body.appendChild(e);return e}
 function unbub(w){if(w.e){if(w.e.parentNode)w.e.parentNode.removeChild(w.e);w.e=null}}
 function put(o,w){const e=w.e;if(!e)return;const v=new T.Vector3(o.x,2.3,o.z).project(cam);if(v.z>=1){e.style.display='none';return}e.style.left=(v.x*.5+.5)*cv.clientWidth+'px';e.style.top=(-v.y*.5+.5)*cv.clientHeight+'px';e.style.display='block'}
 /* ---- NPCs that visit the toilet (called by world.js when an NPC reaches TL/BR; true = taken over, false = already visited, carry on) ---- */
 function visit(n){if(n.wcX){n.wcX=0;return false}if(typeof TOIL==='undefined'||!n.m||!n.m.userData)return false;
  const r=TOIL.find(q=>q.girl==(n.m.userData.g=='f'?1:0));if(!r)return false;
  n.ch=1;n.wc={r,ph:'in1',t:0,T:0,idle:rnd(CFG.idle[0],CFG.idle[1]),spot:pk(r.spots),e:null,back:null};return true}
 function release(n){const w=n.wc;if(w)unbub(w);n.wc=null;n.ch=0;n.wcX=1;n.tx=n.x;n.tz=n.z;n.w=.2;n.mv=0;n.m.visible=true}
 function npcStep(o,dt,t){const w=o.wc,r=w.r;w.t+=dt;w.T+=dt;o.mv=0;let ph=w.ph,sp=o.sp||1.6;
  if(w.T>CFG.maxT&&ph!='run1'&&ph!='run2'&&ph!='out1'&&ph!='out2'){w.ph=ph='out1'}  /* safety: never stuck inside */
  if(ph=='in1'){if(walk(o,r.door.x,r.door.z,sp,dt))w.ph='in2',w.t=0;else o.mv=1}
  else if(ph=='in2'){if(walk(o,w.spot.x,w.spot.z,sp,dt)){w.ph='idle';w.t=0}else o.mv=1}
  else if(ph=='idle'){if(w.t>=w.idle){w.ph='out1';w.t=0}}
  else if(ph=='out1'){if(walk(o,r.door.x,r.door.z,sp,dt)){w.ph='out2';w.t=0}else o.mv=1}
  else if(ph=='out2'){if(walk(o,r.out.x,r.out.z,sp,dt)){release(o);return false}else o.mv=1}
  else if(ph=='scream'){o.f=Math.atan2(P.x-o.x,P.z-o.z);if(w.t>=CFG.scream){unbub(w);w.ph='run1';w.t=0}}
  else if(ph=='run1'){if(walk(o,r.door.x,r.door.z,CFG.run,dt)){w.ph='run2';w.t=0}else o.mv=1}
  else if(ph=='run2'){if(walk(o,r.out.x,r.out.z,CFG.run,dt)){release(o);return false}else o.mv=1}
  else if(ph=='shock'){o.f=Math.atan2(P.x-o.x,P.z-o.z);if(w.e&&w.t>=CFG.shock*.5&&!w.h2){w.h2=1;w.e.textContent=pk(CFG.sayH2)}if(w.t>=CFG.shock){unbub(w);w.ph=w.back||'idle';w.t=0}}
  o.m.position.set(o.x,0,o.z);o.m.rotation.y=o.f;if(typeof anim=='function')anim(o.m,t,o.mv);put(o,w);return true}
 /* wrong toilet: the students INSIDE that room right now react (place based) */
 function react(r){if(typeof ns==='undefined')return 0;let n=0;
  for(const o of ns){if(n>=CFG.max)break;const w=o.wc;if(!w||w.r!==r||o.role!='murid'||!o.m||!o.m.userData||o.m.userData.g!=(r.girl?'f':'m')||!inRoom(r,o.x,o.z))continue;if(w.ph=='in1'||w.ph=='out2'||w.ph=='scream'||w.ph=='run1'||w.ph=='run2'||w.ph=='shock')continue;
   n++;w.t=0;if(r.girl){w.ph='scream';w.e=bubble(pk(CFG.sayS))}else{w.back=w.ph;w.ph='shock';w.h2=0;w.e=bubble(pk(CFG.sayH))}}
  if(n){try{if(r.girl){tone(1250,0,.12,'square',.05);tone(1650,.1,.22,'square',.05);tone(1400,.3,.2,'square',.04)}else{tone(300,0,.25,'sine',.06);tone(260,.3,.3,'sine',.05)}}catch(e){}}
  return n}
 /* door swing animation for every door that is not where it should be */
 function doors(dt){for(const r of TOIL)for(const d of r.doors){const kt=d.kt||0,k=d.k||0;if(k!==kt){const st=dt/CFG.use.swingT;d.k=k<kt?Math.min(kt,k+st):Math.max(kt,k-st);setDoor(d,d.k,CFG.swing)}}}
 function tick(dt,t){if(typeof TOIL==='undefined')return;dt=dt||.016;t=t||0;
  if(typeof ns!=='undefined')for(const o of ns)if(o.wc&&!npcStep(o,dt,t)){/* released */}
  if(use)useStep(dt);doors(dt);
  if(halt)return;const r=roomAt(TOIL,P.x,P.z);
  if(r&&wrong(r,gen)){if(!inW){inW=1;say(pk(CFG.bad));if(window.lockWC&&window.lockWC())toast(CFG.caught,2600);react(r)}}else inW=0}
 if(typeof window!=='undefined'){window.toiGo=go;window.toiHint=hint;window.toiTick=tick;window.toiVisit=visit}
 return{CFG,inRoom,wrong,roomAt,doorAt,walk,setDoor}
})();
