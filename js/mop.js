/* Round 20d: Mop Terbang (global MOP). World page only. The reward of the girls' locked cubicle (js/jkey.js, cur.jk.lt[1]).
   The bag row "Mop Terbang" (Naik / Turun) calls mopToggle. Riding is a LOOK only, it is no upgrade:
   - speed, collisions, obstacles, slow and boost are exactly the walking ones: this file never writes P.x, P.z, P.sx, P.sz, P.slow or P.boost. It only keeps P.y and P.vy at 0 (so there is no jump while riding and
     obstacles that need a jump to clear stay as hard as when walking) and lifts the drawn player mesh by CFG.hover (+ a small bob);
   - Round 20d3: the look follows the WoW flying-broom references. The pole is a wooden handle lying horizontally along the facing direction (no pitch) with a darker carved knob at the front and, at the back end, a blue binding band and a
     broom-shaped bundle of 9 WET strings (grey-lavender, three layers, fanning out wider towards the back, drooping at the tips). Water drips from the string tips (random tip each time) and keeps dripping slowly when standing still.
     The rider sits upright on the pole (the pole runs under the pelvis, the legs hang down on both sides, one a little further forward), both arms reach forward and inward so the hands rest in front of the lap, just above the pole.
     The arms of the character model are rigid (no elbow), so the hands hover about 16 cm above the pole instead of touching it.
   Getting off: the bag row, or automatically when the player enters a toilet room, a prefect chases (lockBusy), the player is stunned (a banana peel) or presses E at anything that opens a door, locker or cubicle (mopAct, called first in act() of world.js).
   Riding is NOT saved: a new page or a reload starts on foot; the mop itself (owning it) is saved in cur.jk.lt[1].
   Hooks: world.js calls mopAct() at the start of act() and mopTick(dt,t) every frame (after the pm mesh is placed and animated). Global names: MOP, mopToggle, mopOn, mopAct, mopTick. Tune everything in CFG. Tested in tools/test-mop.js. */
const MOP=(()=>{
 const CFG={hover:.45,bob:.04,bobSpd:3,lean:.05,pitch:0,seat:.52,legW:[-.28,-.12],armF:[-.8,.45],n:32,rate:.05,idle:.28,life:[.55,.9],g:6,size:.05,col:'#7fd0ff',
  on:'Naik mop! Tekan butang Turun dalam beg untuk turun.',off:'Turun dari mop.',no:'Kamu belum ada Mop Terbang.',wc:'Tak boleh naik mop di dalam tandas.',chase:'Pengawas tengah kejar! Mana sempat naik mop!',fall:'Aduh! Jatuh dari mop!',wow:'Wuuu! Terbang!',margin:.3,
  hip:.46};   /* hip = the character model in chars.js build() */
 let on=false,G=null,pool=[],acc=0,lx=null,lz=null,rs=Math.random;
 const HV=typeof T!=='undefined'?new T.Vector3():null;
 const owned=()=>{try{const s=typeof JK!=='undefined'&&JK.st?JK.st(false):null;return !!(s&&s.lt&&s.lt[1])}catch(e){return false}};
 const inToilet=()=>{if(typeof TOIL==='undefined'||typeof P==='undefined')return false;const m=CFG.margin;return TOIL.some(r=>P.x>=r.x0-m&&P.x<=r.x1+m&&P.z>=r.z0-m&&P.z<=r.z1+m)};
 const chased=()=>typeof window!=='undefined'&&!!window.lockBusy&&!!window.lockBusy();
 const mt=c=>typeof mat=='function'?mat(c):new T.MeshLambertMaterial({color:c});
 /* the mop: a wooden handle (+z = the facing direction), a dark carved knob at the front and, at the back, a blue band and a broom-shaped bundle of wet strings. g.userData.tips = where each string ends (for the drips) */
 function build(){const g=new T.Group(),tips=[];
  const bx=(w,h,d,c,x,y,z,rx,ry)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mt(c));m.position.set(x,y,z);m.rotation.x=rx||0;m.rotation.y=ry||0;g.add(m);return m};
  const pole=new T.Mesh(new T.CylinderGeometry(.025,.025,1.7,6),mt('#b98a4e'));pole.rotation.x=Math.PI/2;pole.position.set(0,0,.1);g.add(pole);
  const knob=new T.Mesh(new T.CylinderGeometry(.042,.042,.13,6),mt('#8a5a2b'));knob.rotation.x=Math.PI/2;knob.position.set(0,0,.93);g.add(knob);
  const band=new T.Mesh(new T.CylinderGeometry(.06,.06,.09,6),mt('#2f55c8'));band.rotation.x=Math.PI/2;band.position.set(0,0,-.8);g.add(band);
  /* 9 wet strings in 3 layers: [x at the band, length, droop (rotation.x, negative = the tip is lower), colour]. The further out, the wider the fan */
  [[-.07,.5,-.3,'#8f98c0'],[0,.55,-.35,'#7e87b4'],[.07,.5,-.3,'#8f98c0'],[-.11,.52,-.5,'#a2a9cc'],[0,.45,-.55,'#8f98c0'],[.11,.52,-.5,'#a2a9cc'],[-.15,.48,-.7,'#7e87b4'],[.02,.4,-.75,'#a2a9cc'],[.15,.48,-.7,'#7e87b4']].forEach(a=>{const x0=a[0],d=a[1],ex=a[2],ry=-x0*3.2,dir=[-Math.sin(ry),Math.cos(ry)*Math.sin(ex),-Math.cos(ry)*Math.cos(ex)],at=[x0*.4,-.02,-.84];   /* at = where the string leaves the band, dir = unit vector towards its tip */
   bx(.05,.032,d,a[3],at[0]+dir[0]*d/2,at[1]+dir[1]*d/2,at[2]+dir[2]*d/2,ex,ry);tips.push([at[0]+dir[0]*d,at[1]+dir[1]*d,at[2]+dir[2]*d])});
  g.rotation.x=-CFG.pitch;g.position.set(0,CFG.seat,0);g.userData.tips=tips;g.visible=false;return g}
 /* ---- the riding pose (upright, sitting on the pole) ---- */
 const rotX=(v,a)=>[v[0],v[1]*Math.cos(a)-v[2]*Math.sin(a),v[1]*Math.sin(a)+v[2]*Math.cos(a)];
 /* where a point of the body (B space) is in pm space after the lean about the hips */
 function lean(v){const th=CFG.lean,h=CFG.hip,r=rotX(v,th);return[r[0],r[1]+h*(1-Math.cos(th)),r[2]-h*Math.sin(th)]}
 function polePt(s){return[0,CFG.seat+s*Math.sin(CFG.pitch),s*Math.cos(CFG.pitch)]}
 function pose(){const u=pm.userData;if(!u||!u.legs||!u.B)return;const th=CFG.lean;
  u.B.rotation.x=th;u.B.position.y=CFG.hip*(1-Math.cos(th));u.B.position.z=-CFG.hip*Math.sin(th);                 /* a slight lean from the hips, the hips stay on the pole */
  u.legs[0].rotation.x=CFG.legW[0]-th;u.legs[1].rotation.x=CFG.legW[1]-th;                                           /* the legs hang down, one a little further forward */
  u.arms[0].rotation.x=CFG.armF[0]-th;u.arms[0].rotation.z=CFG.armF[1];                                              /* both arms forward and inward, hands in front of the lap */
  const hold=(typeof drink!=='undefined'&&drink>0)||(typeof carry!=='undefined'&&carry>=0);if(!hold){u.arms[1].rotation.x=CFG.armF[0]-th;u.arms[1].rotation.z=-CFG.armF[1]}}
 function unpose(){const u=typeof pm!=='undefined'&&pm?pm.userData:null;if(!u||!u.B)return;u.B.rotation.x=0;u.B.position.z=0;u.B.position.y=0;u.arms.forEach(a=>{a.rotation.z=0})}
 function mkPool(){if(pool.length||typeof sc==='undefined')return;const geo=new T.SphereGeometry(CFG.size,6,4);
  for(let i=0;i<CFG.n;i++){const m=new T.Mesh(geo,new T.MeshBasicMaterial({color:CFG.col,transparent:true,opacity:.85}));m.visible=false;m.userData.d={life:0,max:1,vx:0,vy:0,vz:0};m.castShadow=false;sc.add(m);pool.push(m)}}
 function spawn(){let m=pool.find(p=>p.userData.d.life<=0);if(!m){m=pool[0];pool.forEach(p=>{if(p.userData.d.life<m.userData.d.life)m=p})}
  const d=m.userData.d,tp=G.userData.tips,t=tp[Math.floor(rs()*tp.length)%tp.length];pm.updateMatrixWorld(true);HV.set(t[0],t[1]-.03,t[2]);G.localToWorld(HV);m.position.set(HV.x+(rs()-.5)*.14,HV.y,HV.z+(rs()-.5)*.14);
  d.max=d.life=CFG.life[0]+rs()*(CFG.life[1]-CFG.life[0]);d.vx=(rs()-.5)*.5;d.vy=.15+rs()*.35;d.vz=(rs()-.5)*.5;m.scale.setScalar(1);m.material.opacity=.85;m.visible=true}
 function drops(dt){pool.forEach(m=>{const d=m.userData.d;if(d.life<=0)return;d.life-=dt;d.vy-=CFG.g*dt;m.position.x+=d.vx*dt;m.position.y+=d.vy*dt;m.position.z+=d.vz*dt;
   if(d.life<=0||m.position.y<.03){d.life=0;m.visible=false;return}const k=d.life/d.max;m.scale.setScalar(.35+.65*k);m.material.opacity=.85*Math.min(1,k*2)})}
 function mount(){if(on)return;mkPool();if(!G)G=build();on=true;G.visible=true;if(G.parent!==pm)pm.add(G);lx=lz=null;acc=0}
 function dismount(quiet,why){if(!on)return;on=false;if(G)G.visible=false;pool.forEach(m=>{m.userData.d.life=0;m.visible=false});
  unpose();if(typeof P!=='undefined'){P.y=0;P.vy=0}if(typeof pm!=='undefined'&&pm){pm.position.y=0}if(!quiet&&why&&typeof toast=='function')toast(why,2200)}
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
  pose();
  const mv=lx!==null&&Math.hypot(P.x-lx,P.z-lz)>.001;lx=P.x;lz=P.z;acc+=dt;const every=mv?CFG.rate:CFG.idle;
  if(acc>=every){acc=0;spawn()}drops(dt)}
 if(typeof window!=='undefined'){window.mopToggle=toggle;window.mopOn=()=>on;window.mopAct=act;window.mopTick=tick}
 return{CFG,toggle,mount,dismount,act,tick,isOn:()=>on,pool:()=>pool,build,polePt,lean,rotX,setRnd:f=>{rs=f}}
})();
