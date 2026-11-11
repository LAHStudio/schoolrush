/* Round 20d: Mop Terbang (global MOP). World page only. The reward of the girls' locked cubicle (js/jkey.js, cur.jk.lt[1]).
   The bag row "Mop Terbang" (Naik / Turun) calls mopToggle. Riding is a LOOK only, it is no upgrade:
   - speed, collisions, obstacles, slow and boost are exactly the walking ones: this file never writes P.x, P.z, P.sx, P.sz, P.slow or P.boost. It only keeps P.y and P.vy at 0 (so there is no jump while riding and
     obstacles that need a jump to clear stay as hard as when walking) and lifts the drawn player mesh by CFG.hover (+ a small bob);
   - the rider sits on a horizontal mop (handle along the facing direction, the mop head trailing behind); water droplets drip from the head (a pool of CFG.n recycled meshes, no allocation while playing).
   Getting off: the bag row, or automatically when the player enters a toilet room, a prefect chases (lockBusy), the player is stunned (a banana peel) or presses E at anything that opens a door, locker or cubicle (mopAct, called first in act() of world.js).
   Riding is NOT saved: a new page or a reload starts on foot; the mop itself (owning it) is saved in cur.jk.lt[1].
   Hooks: world.js calls mopAct() at the start of act() and mopTick(dt,t) every frame (after the pm mesh is placed and animated). Global names: MOP, mopToggle, mopOn, mopAct, mopTick. Tune everything in CFG. Tested in tools/test-mop.js. */
const MOP=(()=>{
 const CFG={hover:.45,bob:.04,bobSpd:3,legs:-1,arms:-1,n:24,rate:.07,idle:.4,life:[.55,.9],g:6,headY:.46,headZ:-.82,size:.05,col:'#7fd0ff',
  on:'Naik mop! Tekan butang Turun dalam beg untuk turun.',off:'Turun dari mop.',no:'Kamu belum ada Mop Terbang.',wc:'Tak boleh naik mop di dalam tandas.',chase:'Pengawas tengah kejar! Mana sempat naik mop!',fall:'Aduh! Jatuh dari mop!',wow:'Wuuu! Terbang!',margin:.3};
 let on=false,G=null,pool=[],acc=0,lx=null,lz=null,rs=Math.random;
 const HV=typeof T!=='undefined'?new T.Vector3():null;
 const owned=()=>{try{const s=typeof JK!=='undefined'&&JK.st?JK.st(false):null;return !!(s&&s.lt&&s.lt[1])}catch(e){return false}};
 const inToilet=()=>{if(typeof TOIL==='undefined'||typeof P==='undefined')return false;const m=CFG.margin;return TOIL.some(r=>P.x>=r.x0-m&&P.x<=r.x1+m&&P.z>=r.z0-m&&P.z<=r.z1+m)};
 const chased=()=>typeof window!=='undefined'&&!!window.lockBusy&&!!window.lockBusy();
 const mt=c=>typeof mat=='function'?mat(c):new T.MeshLambertMaterial({color:c});
 /* the mop: handle along +z (the facing direction), head trailing behind at -z */
 function build(){const g=new T.Group(),h=new T.Mesh(new T.CylinderGeometry(.025,.025,1.7,6),mt('#b98a4e'));h.rotation.x=Math.PI/2;h.position.set(0,.5,.1);g.add(h);
  const f=new T.Mesh(new T.BoxGeometry(.07,.07,.12),mt('#9aa0a8'));f.position.set(0,.5,-.68);g.add(f);
  const hd=new T.Mesh(new T.BoxGeometry(.34,.09,.3),mt('#cfd8e0'));hd.position.set(0,CFG.headY,CFG.headZ);g.add(hd);
  const bd=new T.Mesh(new T.BoxGeometry(.36,.05,.07),mt('#8aa0b4'));bd.position.set(0,CFG.headY+.05,CFG.headZ+.12);g.add(bd);
  g.visible=false;return g}
 function mkPool(){if(pool.length||typeof sc==='undefined')return;const geo=new T.SphereGeometry(CFG.size,6,4);
  for(let i=0;i<CFG.n;i++){const m=new T.Mesh(geo,new T.MeshBasicMaterial({color:CFG.col,transparent:true,opacity:.85}));m.visible=false;m.userData.d={life:0,max:1,vx:0,vy:0,vz:0};m.castShadow=false;sc.add(m);pool.push(m)}}
 function spawn(){let m=pool.find(p=>p.userData.d.life<=0);if(!m){m=pool[0];pool.forEach(p=>{if(p.userData.d.life<m.userData.d.life)m=p})}
  const d=m.userData.d;pm.updateMatrixWorld(true);HV.set(0,CFG.headY,CFG.headZ);pm.localToWorld(HV);m.position.set(HV.x+(rs()-.5)*.14,HV.y,HV.z+(rs()-.5)*.14);
  d.max=d.life=CFG.life[0]+rs()*(CFG.life[1]-CFG.life[0]);d.vx=(rs()-.5)*.5;d.vy=.15+rs()*.35;d.vz=(rs()-.5)*.5;m.scale.setScalar(1);m.material.opacity=.85;m.visible=true}
 function drops(dt){pool.forEach(m=>{const d=m.userData.d;if(d.life<=0)return;d.life-=dt;d.vy-=CFG.g*dt;m.position.x+=d.vx*dt;m.position.y+=d.vy*dt;m.position.z+=d.vz*dt;
   if(d.life<=0||m.position.y<.03){d.life=0;m.visible=false;return}const k=d.life/d.max;m.scale.setScalar(.35+.65*k);m.material.opacity=.85*Math.min(1,k*2)})}
 function mount(){if(on)return;mkPool();if(!G)G=build();on=true;G.visible=true;if(G.parent!==pm)pm.add(G);lx=lz=null;acc=0}
 function dismount(quiet,why){if(!on)return;on=false;if(G)G.visible=false;pool.forEach(m=>{m.userData.d.life=0;m.visible=false});
  if(typeof P!=='undefined'){P.y=0;P.vy=0}if(typeof pm!=='undefined'&&pm){pm.position.y=0}if(!quiet&&why&&typeof toast=='function')toast(why,2200)}
 /* the bag row: {msg,close} for js/bag.js */
 function toggle(){if(on){dismount(true);return{msg:CFG.off,close:true}}
  if(!owned())return{msg:CFG.no};if(inToilet())return{msg:CFG.wc};if(chased())return{msg:CFG.chase};if(typeof pm==='undefined'||!pm||typeof sc==='undefined')return{msg:CFG.no};
  mount();try{if(typeof say=='function')say(CFG.wow)}catch(e){}return{msg:CFG.on,close:true}}
 /* E pressed (world.js act): anything that opens a door, locker or cubicle gets off first. Boards and hiding places do not */
 function act(){if(!on)return;const w=typeof window!=='undefined'?window:{};
  if((w.exitHint&&w.exitHint())||(w.lockHint&&w.lockHint())||(w.toiHint&&w.toiHint())||(typeof w.near=='function'&&w.near()))dismount(true)}
 function tick(dt,t){if(!on)return;dt=dt||0;t=t||0;
  if(typeof pm==='undefined'||!pm||typeof P==='undefined'){return}
  if(inToilet()){dismount(false,CFG.wc);return}if(chased()){dismount(false,CFG.chase);return}if(P.stun>0){dismount(false,CFG.fall);return}
  if(G&&G.parent!==pm)pm.add(G);                                   /* the player mesh is rebuilt when the outfit changes */
  P.y=0;P.vy=0;                                                    /* no jump while riding: obstacles stay as with walking */
  pm.position.y=CFG.hover+Math.sin(t*CFG.bobSpd)*CFG.bob;
  const u=pm.userData;if(u&&u.legs){u.legs.forEach(l=>{l.rotation.x=CFG.legs});u.arms[0].rotation.x=CFG.arms;
   const hold=(typeof drink!=='undefined'&&drink>0)||(typeof carry!=='undefined'&&carry>=0);if(!hold)u.arms[1].rotation.x=CFG.arms}
  const mv=lx!==null&&Math.hypot(P.x-lx,P.z-lz)>.001;lx=P.x;lz=P.z;acc+=dt;const every=mv?CFG.rate:CFG.idle;
  if(acc>=every){acc=0;spawn()}drops(dt)}
 if(typeof window!=='undefined'){window.mopToggle=toggle;window.mopOn=()=>on;window.mopAct=act;window.mopTick=tick}
 return{CFG,toggle,mount,dismount,act,tick,isOn:()=>on,pool:()=>pool,build,setRnd:f=>{rs=f}}
})();
