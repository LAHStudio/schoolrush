/* Luar Sekolah (Round 12): the road in front of the school. The start and the finish of Mod Kelas and the start of Mod Jalan-jalan.
   Morning: the school bus rolls in, stops at the far kerb, you step out, use the zebra crossing, pass the guard and climb the stairs (E at the door).
   Going home (Mod Kelas, after the balik bell): you start at the foot of the stairs, walk to the bus stop, wait for the bus and board it (E at the door).
   Cars never trap you: they stop for the zebra, and a bump on the road only slows you down for a while and puts you back on the pavement.
   Round 16: the kedai runcit (two old empty stalls, x 13 to 24.5), the nasi lemak stall (moved to the right stall, x 28.5) and the ice cream man sell through js/bag.js (BAG); the guard only talks.
   Pure logic (cars, bus, crossing, flow) is in js/luar-logic.js (LUC / LUL). Sizes are in game units (1 unit is about 1 m). */
/* ======== TUNING ======== */
const CAMW={d:5.4,h:1.2,k:.85,la:.6,ly:.9};            /* walking camera (same feel as the Padang) */
const SLOW={t:15,k:.5};                                /* bumped by a car: seconds of slow walking, speed factor */
const SIGNT=['SEKOLAH KEBANGSAAN','HERO KAMPUS'];      /* signboard over the school door */
/* ============================ */
const STORY=LS.get('sk_mode','roam')=='story';
const ren=new T.WebGLRenderer({canvas:$('cv'),antialias:true}),cv=$('cv');ren.shadowMap.enabled=true;ren.setPixelRatio(Math.min(devicePixelRatio,2));
const sc=new T.Scene();sc.background=new T.Color('#bfe3f5');sc.fog=new T.Fog('#bfe3f5',60,130);const cam=new T.PerspectiveCamera(55,1,.5,150);
sc.add(new T.HemisphereLight(0xffffff,0x9aa7b8,.95));
const dl=new T.DirectionalLight(0xffffff,.55);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);Object.assign(dl.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:50});sc.add(dl,dl.target);
const {BX0,BX1,BZ0,BZ1,RZ0,RZ1,ZX,ZW}=LUC;
const cols=[],DYNS=[],hitS=(x,z,r)=>cols.some(c=>x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1),
 hit=(x,z,r)=>hitS(x,z,r)||DYNS.some(d=>Math.hypot(x-d.x,z-d.z)<r+d.r)||WLK.some(w=>Math.hypot(x-w.x,z-w.z)<r+.4); /* Round 12c: people are solid too (DYNS = people standing still, WLK = walkers) */
const hitG=(x,z,r)=>cols.some(c=>c.w&&x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1),hitP=(x,z,r)=>BAG.inv()?hitG(x,z,r):hit(x,z,r); /* Round 16: invisible = only the school building blocks (no objects, people or cars) */
const colBox=(x,z,hx,hz)=>cols.push({x0:x-hx,x1:x+hx,z0:z-hz,z1:z+hz});
function flat(w,d,c,x,z,y){const m=new T.Mesh(new T.PlaneGeometry(w,d),mat(c));m.rotation.x=-Math.PI/2;m.position.set(x,y||0,z);m.receiveShadow=true;sc.add(m);return m}
function bxm(w,h,d,c,x,y,z,col,s){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=!!s;m.receiveShadow=true;sc.add(m);if(col)colBox(x,z,w/2,d/2);return m}
function pn(w,h,c,x,y,z,ry){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c}));m.position.set(x,y,z);m.rotation.y=ry||0;sc.add(m);return m}
function sgn(L,bg,fg,w,h,fs,x,y,z,ry,cw){const W=cw||256,k=W/256,c=document.createElement('canvas');c.width=W;c.height=Math.round(W*h/w);const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,W,c.height);g.fillStyle=fg;g.font='bold '+fs*k+'px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';L.forEach((s,i)=>g.fillText(s,W/2,c.height*(i+1)/(L.length+1),W*.92));
 const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));m.position.set(x,y,z);m.rotation.y=ry||0;sc.add(m);return m}
/* ---- ground, path, pavements, road, zebra ---- */
flat(800,800,'#8fc27a',0,0,-.02);
LUC.LAY.forEach(l=>flat(l.x1-l.x0,l.z1-l.z0,l.c,(l.x0+l.x1)/2,(l.z0+l.z1)/2,l.y)); /* 12c: every layer has its own height (no flicker) */
for(let x=-34;x<34;x+=3)flat(1.5,.18,'#f4f4f4',x+.75,2,.02);[RZ0+.3,RZ1-.3].forEach(z=>flat(70,.15,'#f4f4f4',0,z,.02));
for(let z=RZ0+.25;z<RZ1;z+=1)flat(ZW*2,.5,'#f7f7f7',ZX,z+.25,.025);
[RZ0-.15,RZ1+.15].forEach(z=>bxm(70,.14,.3,'#a8aab2',0,.07,z,false));
/* ---- school building, stairs, door, sign, windows ---- */
bxm(64,7,7,'#f1e2b8',0,3.5,-30.5,true,true);cols[cols.length-1].w=1; /* Round 16: the school building is the only wall that still blocks an invisible player */bxm(65,.8,8,'#c9553a',0,7.4,-30.5,false);
for(let k=0;k<4;k++)bxm(8,.15*(k+1),.75,k%2?'#d6d0c2':'#c4bdb0',0,.075*(k+1),-24.375-k*.75,false);
const SD=-26.99;pn(2.9,3.1,'#f5f5f5',0,.6+1.55,SD,0);[-.68,.68].forEach(o=>{pn(1.25,2.8,'#7a5236',o,.6+1.4,SD+.02,0);pn(.8,1.1,'#a9d8f0',o,.6+1.95,SD+.04,0);pn(.08,.4,'#e8c53a',o*.12,.6+1.35,SD+.04,0)});sgn(['PINTU MASUK'],'#1c2f6b','#ffffff',2.4,.6,34,0,.6+3.55,SD+.04,0); /* 12d: the same double door as the inside one (world-build.js), each part on its own depth */
sgn(SIGNT,'#1c2f6b','#ffd23f',9,2.2,17.5,0,5.6,SD+.03,0,1024); /* 12c: big canvas, the old one was far too small for two lines */
for(let x=-28;x<=28;x+=5){if(Math.abs(x)<6)continue;[2.6,5.3].forEach(y=>{pn(2.2,1.5,'#9fd0e8',x,y,SD,0);pn(2.4,.12,'#8a7a60',x,y-.8,SD+.02,0)})}
/* ---- fence with a 6 wide gate, gate pillars ---- */
const FZ=-19;[[-35,-3],[3,35]].forEach(a=>{const cx=(a[0]+a[1])/2,w=a[1]-a[0];colBox(cx,FZ,w/2,.2);bxm(w,.1,.1,'#2f6f5a',cx,1.7,FZ,false);bxm(w,.1,.1,'#2f6f5a',cx,.8,FZ,false);for(let x=a[0]+.5;x<a[1];x+=1.6)bxm(.14,1.8,.14,'#3f8f74',x,.9,FZ,false)});
[-3.2,3.2].forEach(x=>{bxm(.6,2.6,.6,'#c9553a',x,1.3,FZ,true,true)});
/* ---- guard post and the guard ---- */
bxm(2.6,.2,2.6,'#8a8f9a',6.2,2.9,-20.6,false);bxm(2.4,2.8,2.4,'#e7ecf2',6.2,1.4,-20.6,true,true);pn(1.1,.9,'#a9d8f0',5,1.6,-19.38,0);sgn(['PENGAWAL'],'#1c2f6b','#fff',2,.5,40,6.2,3.4,-19.38,0);
function mkGuard(){const o={skin:SK[1],hc:'#14161d',h:1.28,w:1.08,mouth:1,es:1,bw:4,hs:'short',stache:true,o:{top:'#3a5a8c',bot:'#1c2236',shoe:'#111',ls:1}};return build(o)}
const guard=mkGuard();guard.position.set(LUC.GUARD.x,0,LUC.GUARD.z);guard.rotation.y=0;sc.add(guard);const GDY={x:LUC.GUARD.x,z:LUC.GUARD.z,r:.5};DYNS.push(GDY);
/* ---- Round 12d: chaser markers (red ring under the feet, "!" bubble, red triangle on the minimap, faster beep when close). Only the chaser has them. CHS = chase state (logic in luar-logic.js) */
const CHS=LUL.chaseMake(LUC.GUARD.x,LUC.GUARD.z);
const chRing=new T.Mesh(new T.RingGeometry(.55,.8,28),new T.MeshBasicMaterial({color:'#e02424',side:T.DoubleSide,transparent:true,opacity:.85}));chRing.rotation.x=-Math.PI/2;chRing.visible=false;sc.add(chRing);
const chBub=document.createElement('div');chBub.id='chb';chBub.textContent='!';chBub.style.cssText='position:fixed;z-index:8;pointer-events:none;display:none;transform:translate(-50%,-100%);font:900 2.2em Fredoka,sans-serif;color:#fff;background:#e02424;border:3px solid #fff;border-radius:50%;width:1.3em;height:1.3em;line-height:1.25em;text-align:center;box-shadow:0 2px 6px #0006';document.body.appendChild(chBub);
const chFree=(x,z)=>x>BX0+.4&&x<BX1-.4&&z>BZ0+.4&&z<BZ1-.4&&!hitS(x,z,LUC.CH.r)&&!DYNS.some(d=>d!==GDY&&Math.hypot(x-d.x,z-d.z)<LUC.CH.r+d.r)&&!WLK.some(w=>Math.hypot(x-w.x,z-w.z)<LUC.CH.r+.4);
/* ---- flagpole, flowers, benches, trees ---- */
{const fx=-10,fz=-22;bxm(.8,.3,.8,'#9a9a9a',fx,.15,fz,true);const pole=new T.Mesh(new T.CylinderGeometry(.07,.09,7,6),mat('#e8e8ee'));pole.position.set(fx,3.8,fz);sc.add(pole);
 const c=document.createElement('canvas');c.width=224;c.height=112;const g=c.getContext('2d');for(let i=0;i<14;i++){g.fillStyle=i%2?'#ffffff':'#cc0001';g.fillRect(0,i*8,224,8)}g.fillStyle='#010066';g.fillRect(0,0,112,64);g.fillStyle='#ffcc00';g.beginPath();g.arc(48,32,20,0,7);g.fill();g.fillStyle='#010066';g.beginPath();g.arc(55,32,17,0,7);g.fill();
 const f=new T.Mesh(new T.PlaneGeometry(2.4,1.2),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),side:T.DoubleSide}));f.position.set(fx+1.25,6.4,fz);sc.add(f)}
function bed(x,z,w){bxm(w,.3,1.4,'#6b4a2f',x,.15,z,true);for(let i=0;i<w*2.2;i++){const m=new T.Mesh(new T.BoxGeometry(.3,.3,.3),mat(R(['#e24b4b','#ffd23f','#f08ad0','#ffffff','#ff9f43'])));m.position.set(x-w/2+.3+i*.42%w,.45,z+(i%2?.35:-.35));sc.add(m)}}
bed(-9,-13,4);bed(9,-13,4);bed(-9,-8,4);bed(9,-8,4);bed(-16,-22.5,3);
function bench(x,z,ry){const g=new T.Group();[['#8a5a32',2,.12,.6,0,.5,0],['#8a5a32',2,.5,.1,0,.8,-.3],['#444',.1,.5,.5,-.8,.25,0],['#444',.1,.5,.5,.8,.25,0]].forEach(a=>{const m=new T.Mesh(new T.BoxGeometry(a[1],a[2],a[3]),mat(a[0]));m.position.set(a[4],a[5],a[6]);g.add(m)});g.position.set(x,0,z);g.rotation.y=ry||0;sc.add(g);colBox(x,z,1.05,.45)}
bench(-5.8,-11,0);bench(5.8,-11,0);bench(-5.8,-6.5,Math.PI);bench(5.8,-6.5,Math.PI);bench(-4,-22,0);
const BSG=new T.DodecahedronGeometry(.55,0),BSM=[mat('#3f8f4e'),mat('#4aa05a')],BSH=[]; /* Round 12b: bushes round the foot of every tree */
function bushes(x,z,s){for(let i=0;i<3;i++){const a=i*2.1+x,r=(.95+.15*(i%2))*s,m=new T.Mesh(BSG,BSM[i%2]);m.position.set(x+Math.cos(a)*r,.36*s,z+Math.sin(a)*r);m.scale.set(s*(1+.2*(i%2)),s*.8,s);sc.add(m);BSH.push(m)}}
const TRG=[new T.CylinderGeometry(.18,.24,1.2,5),new T.ConeGeometry(1.2,2.2,6),new T.ConeGeometry(.9,1.8,6)],TRM=[mat('#7a5236'),mat('#3f9d54'),mat('#4aae5f')],LOWH=[];
function mkTree(x,z,s,col){const g=new T.Group();[[0,.6],[1,2.1],[2,3.3]].forEach(a=>{const m=new T.Mesh(TRG[a[0]],TRM[a[0]]);m.position.set(0,a[1],0);g.add(m)});g.position.set(x,0,z);g.scale.setScalar(s||1);sc.add(g);bushes(x,z,s||1);if(col)colBox(x,z,.5*(s||1),.5*(s||1));return g}
[-28,-17,17,28].forEach((x,i)=>mkTree(x,-13+(i%2)*2,1.5,true)); /* the four trees of the sketch */
for(let x=-33;x<=33;x+=6.5){if(Math.abs(x)>9)LOWH.push(mkTree(x+1,-17.2,1.1,true));LOWH.push(mkTree(x,15.2+(x%3)*.2,1.2,false))}
/* ---- ice cream cart and the man ---- */
{const x=LUC.ICE.x,z=LUC.ICE.z-1.2;bxm(2.8,1,1.8,'#ffffff',x,.85,z,true,true);bxm(2.8,.3,1.8,'#4aa3e8',x,1.5,z,false);bxm(.12,2.2,.12,'#999',x,2.5,z,false);const um=new T.Mesh(new T.ConeGeometry(1.8,.7,8),mat('#f08ad0'));um.position.set(x,3.5,z);um.castShadow=true;sc.add(um);
 [-.9,.9].forEach(o=>{const w=new T.Mesh(new T.CylinderGeometry(.4,.4,.2,10),mat('#333'));w.rotation.z=Math.PI/2;w.position.set(x+o,.4,z+1);sc.add(w)});sgn(['AISKRIM'],'#ffffff','#e24b88',2.4,.5,40,x,1.05,z+.92,0)}
const iceMan=npc('penjual','m');iceMan.position.set(LUC.ICE.x,0,LUC.ICE.z+.75);iceMan.rotation.y=0;sc.add(iceMan);DYNS.push({x:LUC.ICE.x,z:LUC.ICE.z+.75,r:.5}); /* 12c: in front of the cart, not inside it */
/* ---- zebra crossing signals (Round 12b): push button, pedestrian heads with a countdown, car lights; the cycle is in LUL.sigTick ---- */
const SGS=LUL.makeSig(),PED=[],CLM=[];
[[LUC.BTN[0],-1],[LUC.BTN[1],1]].forEach(a=>{const b=a[0],dz=a[1],ry=dz<0?Math.PI:0;bxm(.14,3.2,.14,'#555',b.x,1.6,b.z,false);bxm(.7,1.45,.4,'#1a1a1a',b.x,3,b.z,false);
 const cn=document.createElement('canvas');cn.width=64;cn.height=128;const tx=new T.CanvasTexture(cn),hd=new T.Mesh(new T.PlaneGeometry(.58,1.15),new T.MeshBasicMaterial({map:tx}));hd.position.set(b.x,3,b.z+dz*.21);hd.rotation.y=ry;sc.add(hd);PED.push({c:cn,tx,key:''});
 bxm(.28,.5,.2,'#e8c11a',b.x,1.25,b.z+dz*.16,false);const bb=new T.Mesh(new T.CylinderGeometry(.09,.09,.06,10),new T.MeshBasicMaterial({color:'#e24b4b'}));bb.rotation.x=Math.PI/2;bb.position.set(b.x,1.32,b.z+dz*.28);sc.add(bb);sgn(['TEKAN'],'#1c2f6b','#ffffff',.6,.22,34,b.x,1.7,b.z+dz*.27,ry)});
[[ZX-ZW-2,-2.9,-1],[ZX+ZW+2.2,6.9,1]].forEach(a=>{bxm(.14,3.2,.14,'#555',a[0],1.6,a[1],false);bxm(.4,1.3,.4,'#1a1a1a',a[0],3.1,a[1],false);const L=[0,1,2].map(k=>{const m=new T.Mesh(new T.BoxGeometry(.06,.24,.24),new T.MeshBasicMaterial({color:'#333'}));m.position.set(a[0]+a[2]*.21,3.45-k*.35,a[1]);sc.add(m);return m.material});CLM.push(L)});
const LC={r:['#ff3b3b','#4a1c1c'],a:['#ffb020','#4a3a14'],g:['#35ff6c','#14401f']};
function sigVis(){const k=SGS.carL;CLM.forEach(l=>{l[0].color.set(LC.r[k=='r'?0:1]);l[1].color.set(LC.a[k=='a'?0:1]);l[2].color.set(LC.g[k=='g'?0:1])});
 const ph=SGS.flash?Math.floor(SGS.t*4)%2:1,key=SGS.ped+SGS.n+ph;PED.forEach(p=>{if(p.key==key)return;p.key=key;const g=p.c.getContext('2d'),gr=SGS.ped=='g',on=gr&&ph;g.fillStyle='#0d0d0d';g.fillRect(0,0,64,128);
  g.lineCap='round';g.lineWidth=5;g.strokeStyle=g.fillStyle=gr?(on?'#35ff6c':'#14401f'):'#ff3b3b';const y=34,w=gr;g.beginPath();g.arc(32,y-20,7,0,7);g.fill();g.beginPath();g.moveTo(32,y-12);g.lineTo(32,y+8);g.moveTo(32,y-8);g.lineTo(w?44:22,y+2);g.moveTo(32,y-8);g.lineTo(w?20:42,y+2);g.moveTo(32,y+8);g.lineTo(w?42:26,y+24);g.moveTo(32,y+8);g.lineTo(w?22:38,y+24);g.stroke();
  g.font='bold 46px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle=SGS.n?'#35ff6c':'#262626';g.fillText(SGS.n?String(SGS.n):'-',32,98);p.tx.needsUpdate=true})}
let lastBeep='';function sigBeep(){if(SGS.st!='walk'){lastBeep='';return}const k=(SGS.flash?'f':'s')+(SGS.flash?Math.floor(SGS.t*4):Math.floor(SGS.t));if(k==lastBeep)return;lastBeep=k;tone(SGS.flash?1250:880,0,.07,'square',.07)}
sigVis();
/* ---- bus stop (far pavement, left), Round 12b: orange shelter like the reference picture (curved roof, glass, map board, poster box, bench, bin) ---- */
const roofM=new T.MeshPhongMaterial({color:'#f5a31a',flatShading:true,transparent:true,opacity:1});
function glass(w,h,x,y,z,ry){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:'#e6ecb0',transparent:true,opacity:.28,side:T.DoubleSide,depthWrite:false}));m.position.set(x,y,z);m.rotation.y=ry||0;sc.add(m)}
{const x=LUC.BUS.xs,z=8.3,OR='#f5a31a',GR='#8d8f96',add=(w,h,d,c,px,py,pz,col)=>bxm(w,h,d,c,x+px,py,z+pz,col,true);
 const rg=new T.Group();rg.position.set(x,3.05,z);rg.rotation.x=-.05;sc.add(rg);const m1=new T.Mesh(new T.BoxGeometry(6.4,.2,2.9),roofM);m1.castShadow=true;rg.add(m1);
 [-1.45,1.45].forEach(o=>{const c=new T.Mesh(new T.CylinderGeometry(.14,.14,6.4,10),roofM);c.rotation.z=Math.PI/2;c.position.set(0,0,o);rg.add(c)});[-3.2,3.2].forEach(o=>{const c=new T.Mesh(new T.CylinderGeometry(.14,.14,2.9,10),roofM);c.rotation.x=Math.PI/2;c.position.set(o,0,0);rg.add(c)});
 [[-2.95,-1.2],[2.95,-1.2],[-2.95,1.2],[2.95,1.2],[-1,1.2],[1,1.2]].forEach(a=>add(.12,2.95,.12,GR,a[0],1.5,a[1],false));add(6,.1,.1,GR,0,.45,1.2,false);add(6,.1,.1,GR,0,2.6,1.2,false);
 [-1.95,0,1.95].forEach(o=>glass(1.85,2.05,x+o,1.52,z+1.2));glass(2.3,2.05,x+2.95,1.52,z,Math.PI/2);colBox(x,z+1.2,3.1,.12);colBox(x+2.95,z,.1,1.3);
 /* route map board on the back glass */
 {const c=document.createElement('canvas');c.width=192;c.height=150;const g=c.getContext('2d');g.fillStyle='#e8eef2';g.fillRect(0,0,192,150);g.fillStyle='#9cc8e8';g.fillRect(0,50,80,100);g.fillStyle='#bfe0a8';g.fillRect(80,30,112,120);g.lineWidth=4;[['#e24b4b',[[10,20],[70,70],[120,60],[180,110]]],['#2e6fd0',[[20,140],[90,100],[130,40],[185,25]]],['#f5a31a',[[100,145],[110,90],[160,70]]]].forEach(r=>{g.strokeStyle=r[0];g.beginPath();r[1].forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()});g.fillStyle='#1c2f6b';g.fillRect(0,0,192,26);g.fillStyle='#fff';g.font='bold 18px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('LALUAN BAS',96,14);
  add(1.5,1.2,.08,'#33363d',0,1.6,1.08,false);const mp=new T.Mesh(new T.PlaneGeometry(1.4,1.1),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));mp.position.set(x,1.6,z+1.03);mp.rotation.y=Math.PI;sc.add(mp)}
 /* poster box at the east end */
 add(1.5,2.2,.15,'#33363d',3.55,1.4,-.2,true);sgn(['SCHOOL','RUSH','LAH?'],'#f5a31a','#1c2f6b',1.34,2.04,56,x+3.55,1.4,z-.29,Math.PI);
 /* orange bench with a grey end, and the round domed bin */
 add(2.6,.14,.7,OR,-.6,.5,.65,true);add(2.6,.3,.08,OR,-.6,.35,.33,false);add(.12,.5,.6,GR,.7,.25,.65,false);{const e=new T.Mesh(new T.CylinderGeometry(.35,.35,.14,12),mat(OR));e.position.set(x-1.9,.5,z+.65);sc.add(e)}
 {const bx=x-4.2,bz=z+.4,b=new T.Mesh(new T.CylinderGeometry(.42,.38,1,12),mat(OR));b.position.set(bx,.5,bz);b.castShadow=true;sc.add(b);const bd=new T.Mesh(new T.CylinderGeometry(.43,.43,.16,12),mat('#33363d'));bd.position.set(bx,.88,bz);sc.add(bd);const dm=new T.Mesh(new T.SphereGeometry(.5,10,6,0,6.283,0,1.57),mat(OR));dm.scale.set(1,.55,1);dm.position.set(bx,.96,bz);sc.add(dm);colBox(bx,bz,.45,.45)}}
/* pole sign, yellow with a black border like the reference picture, readable from both sides (the pole stays behind the board) */
{const x=LUC.BUS.xs-4.6,z=7.2,pl=new T.Mesh(new T.CylinderGeometry(.06,.07,1.9,8),mat('#9aa0a8'));pl.position.set(x,.95,z);pl.castShadow=true;sc.add(pl);colBox(x,z,.12,.12);
 const c=document.createElement('canvas');c.width=192;c.height=256;const g=c.getContext('2d'),rr=(x0,y0,w,h,r,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(x0+r,y0);g.arcTo(x0+w,y0,x0+w,y0+h,r);g.arcTo(x0+w,y0+h,x0,y0+h,r);g.arcTo(x0,y0+h,x0,y0,r);g.arcTo(x0,y0,x0+w,y0,r);g.closePath();g.fill()};
 rr(0,0,192,256,22,'#161616');rr(9,9,174,238,16,'#f5c518');g.fillStyle='#161616';g.textAlign='center';g.textBaseline='middle';g.font='bold 22px sans-serif';g.fillText('PERHENTIAN',96,62,150);g.font='bold 59px sans-serif';g.fillText('BAS',96,126,150);g.font='bold 32px sans-serif';g.fillText('SEKOLAH',96,198,150); /* 12c: text 80%, inside the black frame */g.fillStyle='#8a8f98';[24,232].forEach(y=>{g.beginPath();g.arc(96,y,5,0,7);g.fill()});
 const tx=new T.CanvasTexture(c);bxm(1.3,1.7,.1,'#161616',x,2.75,z,false);[[.056,0],[-.056,Math.PI]].forEach(a=>{const m=new T.Mesh(new T.PlaneGeometry(1.3,1.7),new T.MeshBasicMaterial({map:tx}));m.position.set(x,2.75,z+a[0]);m.rotation.y=a[1];sc.add(m)})}
/* ---- nasi lemak stall ---- */
{const x=LUC.NASI.x,z=12;bxm(5,1.1,1,'#e8c07a',x,.55,z,true,true);bxm(5.2,.12,1.4,'#e8dfd0',x,1.15,z,false);[[-2.4,11.4],[2.4,11.4],[-2.4,13.9],[2.4,13.9]].forEach(a=>bxm(.14,3,.14,'#555',x+a[0],1.5,a[1],false));bxm(5.6,.2,3.2,'#d94a3a',x,3.05,12.65,false,true);bxm(5,2.2,.1,'#c9a060',x,1.1,14.05,false);
 for(let i=0;i<5;i++)bxm(.5,.18,.5,i%2?'#3f9d54':'#f4f1e8',x-1.6+i*.8,1.3,z-.1,false);sgn(['NASI LEMAK'],'#ffd23f','#7a2a1a',4,.8,40,x,2.4,11.35,0)}
const seller=npc('penjual','f');seller.position.set(LUC.NASI.x,0,13.2);seller.rotation.y=Math.PI;sc.add(seller);DYNS.push({x:LUC.NASI.x,z:13.2,r:.5});
/* ---- Round 12b: a livelier world: empty stalls, more benches, picnic and cafe tables, notice boards, grass, flowers, students ---- */
function stallEmpty(x,aw){bxm(5,1.1,1,'#d9d2c0',x,.55,12,true,true);bxm(5.2,.12,1.4,'#e8dfd0',x,1.15,12,false);[[-2.4,11.4],[2.4,11.4],[-2.4,13.9],[2.4,13.9]].forEach(a=>bxm(.14,3,.14,'#555',x+a[0],1.5,a[1],false));bxm(5.6,.2,3.2,aw,x,3.05,12.65,false,true);bxm(5,2.2,.1,'#cfc7b4',x,1.1,14.05,false);sgn(['GERAI','KOSONG'],'#ffffff','#666666',2.4,.8,36,x,2.45,11.35,0)}
/* ---- Round 16: kedai runcit (replaces the two empty stalls; the nasi lemak stall now stands at the right-hand place) ---- */
{const x=LUC.RUN.x,z=12,cl=['#e8523f','#3f9d54','#f2b81f','#3f7fd0','#d86bb0'];
 bxm(11.6,1.1,1,'#c98f4a',x,.55,z,true,true);bxm(11.6,.12,1.4,'#efe6d2',x,1.15,z,false);
 bxm(11.8,3,.15,'#e6d6b0',x,1.5,14.05,true);[-5.9,5.9].forEach(o=>bxm(.15,3,2.2,'#e6d6b0',x+o,1.5,12.95,true));
 [[-5.5,11.4],[-1.8,11.4],[1.8,11.4],[5.5,11.4]].forEach(a=>bxm(.14,3,.14,'#555',x+a[0],1.5,a[1],false));
 bxm(12.6,.22,3.4,'#d94a3a',x,3.05,12.7,false,true);
 [1.5,2.2].forEach(y=>bxm(10.6,.1,.5,'#8a5a2a',x,y,13.7,false));
 for(let i=0;i<12;i++)[1.5,2.2].forEach((y,j)=>bxm(.55,.5,.4,cl[(i+j*2)%5],x-4.7+i*.85,y+.3,13.7,false));
 sgn(['KEDAI RUNCIT'],'#ffd23f','#7a2a1a',6.4,1,44,x,2.55,11.3,0)}
const keeper=npc('penjual','m');keeper.position.set(LUC.RUN.x,0,13.2);keeper.rotation.y=Math.PI;sc.add(keeper);DYNS.push({x:LUC.RUN.x,z:13.2,r:.5});
LUC.BENCH.forEach(a=>bench(a[0],a[1],a[2])); /* 12c: pavement benches moved off the walkers' lanes (LUC.BENCH / LUC.WALK) */
function picnic(x,z){const g=new T.Group(),a=(w,h,d,c,px,py,pz)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(px,py,pz);m.castShadow=true;g.add(m)};a(2.2,.1,1,'#a9713f',0,.85,0);[-.9,.9].forEach(o=>a(.12,.8,.8,'#6b4a2f',o,.45,0));[-.95,.95].forEach(o=>{a(2.2,.1,.4,'#a9713f',0,.5,o);[-.9,.9].forEach(q=>a(.1,.45,.1,'#6b4a2f',q,.25,o))});g.position.set(x,0,z);sc.add(g);colBox(x,z,1.2,1.4)}
[[-22,-15.5],[22,-8.5],[12,-16]].forEach(a=>picnic(a[0],a[1]));
function cafe(x,z){const g=new T.Group(),m=(geo,c,px,py,pz)=>{const o=new T.Mesh(geo,mat(c));o.position.set(px,py,pz);o.castShadow=true;g.add(o)};m(new T.CylinderGeometry(.62,.62,.07,12),'#e8c07a',0,.82,0);m(new T.CylinderGeometry(.07,.07,.8,6),'#555',0,.4,0);[[1,0],[-1,0],[0,1],[0,-1]].forEach(a=>{m(new T.CylinderGeometry(.24,.24,.07,10),'#d94a3a',a[0]*1,.5,a[1]*1);m(new T.CylinderGeometry(.05,.05,.5,6),'#555',a[0]*1,.25,a[1]*1)});g.position.set(x,0,z);sc.add(g);colBox(x,z,1.35,1.35)}
cafe(11.4,11.6);cafe(32.8,11.6);
function nboard(x,z){[-1.3,1.3].forEach(o=>bxm(.15,2.2,.15,'#6b4a2f',x+o,1.1,z,false));bxm(3,1.7,.12,'#8a5a32',x,1.85,z,false,true);bxm(2.76,1.46,.06,'#c8955a',x,1.85,z+.08,false);
 for(let i=0;i<6;i++)pn(.55,.55,R(['#ffffff','#fff3a8','#ffd1e0','#cfe8ff']),x-.9+(i%3)*.9+(i%2?.05:-.04),(i/3|0)?1.5:2.2,z+.135+i*.006,0); /* 12d: rows no longer overlap (1.225-1.775 and 1.925-2.475) and every paper has its own depth */
 sgn(['PAPAN KENYATAAN'],'#1c2f6b','#ffffff',2.6,.45,24,x,3,z+.07,0);colBox(x,z,1.5,.2)}
nboard(-7.5,-22.3);nboard(9,-17.4);
const GRS=[];{const RG=[[-34.5,-5,-18.5,-5.5],[5,34.5,-18.5,-5.5],[-34.5,9.5,10,16.6],[9.5,34.5,14.3,16.6]],d=new T.Object3D(),mk=(geo,col,n)=>{const im=new T.InstancedMesh(geo,mat(col),n);im.frustumCulled=false;sc.add(im);GRS.push(im);return im},
 g1=mk(new T.ConeGeometry(.1,.5,4),'#6fb35d',300),g2=mk(new T.ConeGeometry(.08,.38,4),'#5da24f',300),fl=['#ff6b6b','#ffd23f','#ffffff','#f08ad0'].map(c=>mk(new T.BoxGeometry(.14,.14,.14),c,22)),fi=[0,0,0,0];
 const pt=k=>{const r=RG[k%4];return[r[0]+Math.random()*(r[1]-r[0]),r[2]+Math.random()*(r[3]-r[2])]};
 for(let k=0;k<300;k++){const q=pt(k);d.position.set(q[0],.22,q[1]);d.rotation.set((Math.random()-.5)*.3,Math.random()*3,(Math.random()-.5)*.3);d.scale.setScalar(.8+Math.random()*.7);d.updateMatrix();g1.setMatrixAt(k,d.matrix);d.position.x+=.18;d.position.z+=.1;d.scale.setScalar(.7+Math.random()*.6);d.updateMatrix();g2.setMatrixAt(k,d.matrix)}
 for(let k=0;k<88;k++){const q=pt(k),j=k%4;d.position.set(q[0],.08,q[1]);d.rotation.set(0,Math.random()*3,0);d.scale.setScalar(1);d.updateMatrix();fl[j].setMatrixAt(fi[j]++,d.matrix)}
 GRS.forEach(m=>m.instanceMatrix.needsUpdate=true)}
/* students: a chatting pair in the shelter, one by the guard, two who walk along the pavements */
const STU=[],WLK=[];{const mk=(g,x,z,lx,lz)=>{const m=npc('murid',g);m.position.set(x,0,z);m.rotation.y=Math.atan2(lx-x,lz-z);sc.add(m);DYNS.push({x,z,r:.45});return m};
 STU.push(mk('f',-10.6,8,-9.2,8),mk('m',-9.2,8,-10.6,8),mk('f',-5.3,-21.2,LUC.GUARD.x,LUC.GUARD.z));
 LUC.WALK.forEach(a=>{const m=npc('murid',a.g);sc.add(m);WLK.push({m,z:a.z,x0:a.x0,x1:a.x1,v:a.v,x:a.x,dir:1,cool:0})})}
/* ---- cars and the bus ---- */
function mkCar(c,dir){const g=new T.Group(),K=LUC.CAR;[[mat(c),K.len,.7,K.w,0,.8,0],[mat('#32465f'),2.3,.7,K.w-.15,-dir*.25,1.45,0],[mat(c),2.4,.1,K.w-.1,-dir*.25,1.85,0]].forEach(a=>{const m=new T.Mesh(new T.BoxGeometry(a[1],a[2],a[3]),a[0]);m.position.set(a[4],a[5],a[6]);m.castShadow=true;g.add(m)});
 [[1.4,.9],[-1.4,.9],[1.4,-.9],[-1.4,-.9]].forEach(w=>{const m=new T.Mesh(new T.CylinderGeometry(.38,.38,.25,10),mat('#222'));m.rotation.x=Math.PI/2;m.position.set(w[0],.38,w[1]);g.add(m)});
 [-.6,.6].forEach(o=>{const m=new T.Mesh(new T.BoxGeometry(.1,.2,.4),new T.MeshBasicMaterial({color:'#ffe9a0'}));m.position.set(dir*K.len/2,.85,o);g.add(m)});sc.add(g);return g}
const CARS=[LUL.makeCar(1,-48,9),LUL.makeCar(1,18,8.2),LUL.makeCar(-1,45,8.6)];
CARS.forEach((c,i)=>c.m=mkCar(['#e24b4b','#3da36b','#8a5bd0'][i],c.dir));const WCAR=CARS[2];
const bus=LUL.makeBus(),BG=new T.Group(),BU=LUC.BUS;let busDoor,busOpen;
{const add=(w,h,d,c,x,y,z,basic)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),basic?new T.MeshBasicMaterial({color:c}):mat(c));m.position.set(x,y,z);m.castShadow=!basic;BG.add(m);return m};
 add(BU.len,1.9,BU.w,'#f2b81f',0,1.45,0);add(BU.len-.4,.9,BU.w+.02,'#27415e',0,2.35,0);add(BU.len,.25,BU.w,'#f2b81f',0,3.07,0);add(.1,.3,BU.w,'#e24b4b',0,1.2,0);
 [[3,1.3],[-3,1.3],[3,-1.3],[-3,-1.3]].forEach(w=>{const m=new T.Mesh(new T.CylinderGeometry(.55,.55,.3,12),mat('#222'));m.rotation.x=Math.PI/2;m.position.set(w[0],.55,w[1]);BG.add(m)});
 [-.8,.8].forEach(o=>add(.1,.25,.45,'#ffe9a0',-BU.len/2,1,o,true));
 busDoor=add(1.1,2.2,.06,'#1b2a3a',-3.8,1.3,BU.w/2+.02,true);busOpen=add(1.1,2.2,.06,'#8aa4b8',-3.8,1.3,BU.w/2+.03,true);busOpen.visible=false;
 [[BU.w/2+.04,0],[-BU.w/2-.04,Math.PI]].forEach(a=>{const m=sgn(['BAS SEKOLAH'],'#f2b81f','#1c2f6b',4,.6,36,1.2,2.4,a[0],a[1]);sc.remove(m);BG.add(m)}); /* 12b: the board belongs to the bus, on both sides */
 BG.position.set(BU.x0,0,LUC.LW);sc.add(BG);BG.visible=false}
/* ---- player ---- */
const P={x:0,z:0,y:0,vy:0,f:Math.PI,gy:0},cp={x:0,z:0};let gen='m',pm,cy=0,hold=0,curL=null,flow='arrive',slowT=0,eatT=0,ghS=false,ghP=null,ghO=1,greet=0,callT=-1,fin=0,boardT=-1,gt=1,gFrom=null,lastLook=[0,1,0];
let mode='boot'; /* boot / bus (arrival scene) / walk / board (stepping on the bus) */
function mkP(){if(pm)sc.remove(pm);pm=player(gen,'uni',curL);sc.add(pm)}mkP();
const gy=(x,z)=>Math.abs(x)<4&&z<=-24&&z>=-27?Math.min(4,Math.floor((-24-z)/.75)+1)*.15:0;
/* ---- input (same as the Padang) ---- */
const keys={},jv={x:0,z:0};let jmp=0;
addEventListener('keydown',e=>{if(mode=='bus'&&(e.code=='KeyE'||e.code=='Space')){skipBus();return}if(halt)return;keys[e.code]=1;if(e.code=='Space')e.preventDefault();if(e.code=='KeyE')act()});addEventListener('keyup',e=>keys[e.code]=0);
if(matchMedia('(pointer:coarse)').matches)document.body.classList.add('touch');
const jz=$('jz'),jb=$('jb'),jk=$('jk');let jid=null,bx0,by0;
jz.onpointerdown=e=>{jid=e.pointerId;jz.setPointerCapture(jid);bx0=e.clientX;by0=e.clientY;const r=jz.getBoundingClientRect();jb.style.left=(bx0-r.left-50)+'px';jb.style.top=(by0-r.top-50)+'px';jb.style.display='block';jk.style.transform='none'};
{const jd=jz.onpointerdown;jz.onpointerdown=e=>{if(mode=='bus')skipBus();jd(e)}} /* a tap anywhere skips the bus arrival, also on the stick area */
jz.onpointermove=e=>{if(e.pointerId!=jid)return;let dx=e.clientX-bx0,dy=e.clientY-by0;const l=Math.hypot(dx,dy);if(l>50){dx*=50/l;dy*=50/l}jk.style.transform=`translate(${dx}px,${dy}px)`;jv.x=dx/50;jv.z=dy/50};
jz.onpointerup=jz.onpointercancel=()=>{jid=null;jb.style.display='none';jv.x=jv.z=0};
$('bj').onpointerdown=()=>jmp=1;$('bj').onpointerup=$('bj').onpointercancel=()=>jmp=0;$('be').onpointerdown=()=>act();$('ex').onclick=()=>pause();
let od=null;cv.onpointerdown=e=>{if(mode=='bus')skipBus();od=e;cv.setPointerCapture(e.pointerId)};cv.onpointermove=e=>{if(od&&e.pointerId==od.pointerId){cy-=(e.clientX-od.clientX)*.007;od=e;hold=1.5}};cv.onpointerup=cv.onpointercancel=()=>od=null;
function fit(){ren.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',fit);fit();
let bt=0,bm;const bv=new T.Vector3();function say(t){const b=$('bub');b.textContent=t;b.style.display='block';bt=4;clearTimeout(bm);bm=setTimeout(()=>b.style.display='none',2800)}
/* ---- what is near (hint and E) ---- */
function nearAct(){const n=LUL.near,home=STORY&&flow=='home';
 if(LUL.nearBtn(P))return['btn',SGS.st=='idle'?'Tekan butang lintasan':'Tunggu lampu hijau'];
 if(home&&bus.st=='stop'&&bus.door&&LUL.nearDoor(P))return['bus','Naik bas pulang'];
 if(n(P,LUC.SCHOOL,3.4))return['door',home?'Pintu sekolah (dah tamat)':'Masuk sekolah'];
 if(CHS.st=='off'&&n(P,LUC.GUARD,2.8))return['guard','Cakap dengan pengawal'];
 if(n(P,LUC.NASI,3))return['nasi','Nasi lemak'];
 if(n(P,LUC.RUN,3.6))return['run','Kedai runcit'];
 if(n(P,LUC.ICE,2.8))return['ice','Aiskrim'];
 if(n(P,{x:LUC.BUS.xs,z:7.6},4.5))return['stop','Perhentian bas'];
 return null}
function act(){if(mode=='bus'){skipBus();return}if(halt||mode!='walk')return;const a=nearAct();if(!a)return;const nm=cur&&cur.name||'';
 if(a[0]=='btn'){if(LUL.sigPress(SGS)){tone(660,0,.1,'triangle',.12);say('Tunggu lampu hijau...')}else say(SGS.st=='walk'?'Lampu hijau! Melintas sekarang.':'Tunggu sebentar...');return}
 if(a[0]=='bus'){board();return}
 if(a[0]=='door'){if(STORY&&flow=='home'){say('Sekolah dah tamat. Jom naik bas!');return}enter();return}
 if(a[0]=='guard'){say(flow=='home'?'Hati-hati di jalan, '+nm+'. Jumpa esok!':STORY?'Selamat pagi, '+nm+'! Tengok kiri kanan bila melintas jalan.':'Selamat datang, '+nm+'. Jalan-jalan sekitar sekolah ya.');return}
 if(a[0]=='nasi'){say('Nasi lemak telur '+WALLET.fmt(WALLET.CFG.nasi)+' sebungkus!');BAG.openNasi();return}
 if(a[0]=='ice'){say('Aiskrim '+WALLET.fmt(WALLET.CFG.ice)+'! Vanila, coklat, jagung.');BAG.openIce();return}
 if(a[0]=='run'){say('Selamat datang ke kedai runcit!');BAG.openRuncit();return}
 if(a[0]=='stop'){say(STORY?(flow=='home'?'Tunggu bas sekolah sampai.':'Bas pulang datang selepas loceng balik.'):'Bas sekolah datang waktu balik (Mod Kelas).')}}
function enter(){if(fin)return;fin=1;halt=true;SS.set('sk_in',1);SS.set('sk_arr',1);SS.del('sk_out');if(flow=='exit'&&STORY)SS.set('sk_ret',{exit:1}); /* 12d: back in the middle of the day, story.js restores the day */loading(()=>nav('world'))}
/* Round 12d: the guard caught a pupil who left during lessons: back inside, no points lost, only the counter goes up (cur.caught, optional field) */
function caught(){if(fin)return;fin=1;halt=true;cur.caught=(cur.caught||0)+1;save();SRA.whistle();say('Balik ke dalam! Waktu belajar!');toast('Balik ke dalam! Waktu belajar!',2400);SS.set('sk_in',1);SS.set('sk_arr',1);SS.del('sk_out');SS.set('sk_ret',{exit:1,caught:1});setTimeout(()=>loading(()=>nav('world')),1300)}
function board(){if(mode!='walk')return;mode='board';halt=true;pm.visible=false;boardT=0;tone(520,0,.1,'triangle',.12)}
function skipBus(){if(flow!='arrive'||mode!='bus')return;LUL.busSkip(bus);spawnOut()}
function spawnOut(){P.x=LUC.DOOR.x;P.z=LUC.DOOR.z;P.y=0;P.vy=0;P.f=Math.PI;P.gy=0;cy=0;cp.x=P.x;cp.z=P.z;pm.visible=true;mode='walk';halt=false;document.body.classList.remove('mn');gFrom={p:cam.position.toArray(),l:lastLook.slice()};gt=0;
 bus.st='stop';$('hint').style.display='none';toast(STORY?'Selamat datang ke sekolah! Melintas guna lintasan pejalan kaki.':'Jom jalan-jalan di luar sekolah.',3200)}
function bump(c){tone(380,0,.16,'square',.14);tone(300,.2,.16,'square',.14);c.v=0;P.z=LUL.kerbZ(P);P.y=0;P.vy=0;slowT=SLOW.t;toast('Aduh! Tengok kiri kanan sebelum melintas.',2800);say('Tengok kiri kanan!')}
/* ---- camera ---- */
const ASP=()=>cam.aspect<1?1.25:1;
const LCR=[camRect([LUC.BX0,LUC.BX1,LUC.BZ0,LUC.BZ1],.3)]; /* Round 14: walking camera stays inside the map rectangle */
function walkCam(){const D=CAMW.d*(cam.aspect<1?1.15:1),sx=Math.sin(cy),sz=Math.cos(cy),cc=camClamp(cp.x,cp.z,sx,sz,D,LCR);return{p:[cc[0],CAMW.h+D*CAMW.k,cc[1]],l:[cp.x-sx*CAMW.la,CAMW.ly,cp.z-sz*CAMW.la]}}
function busCam(){const x=Math.max(bus.x,LUC.BUS.xs-14);return{p:[x+4,5.6,-4.5],l:[x-1.5,1.4,4]}}
function setCam(c){cam.position.set(c.p[0],c.p[1],c.p[2]);cam.lookAt(c.l[0],c.l[1],c.l[2]);lastLook=c.l}
/* ---- minimap ---- */
const mc=$('mm'),mg=mc.getContext('2d'),mb=document.createElement('canvas');mb.width=320;mb.height=232;const MS=Math.min(300/(BX1-BX0),216/(BZ1-BZ0)),mf=(x,z)=>[160+x*MS,116+(z-(BZ0+BZ1)/2)*MS];
(()=>{const g=mb.getContext('2d'),r=(x0,z0,x1,z1,c)=>{const a=mf(x0,z0),b=mf(x1,z1);g.fillStyle=c;g.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1])};g.fillStyle='#2b2f38';g.fillRect(0,0,320,232);r(BX0,BZ0,BX1,BZ1,'#79c06a');r(-32,-34,32,-27,'#d8c690');r(-4,-27,4,-4,'#b3aa95');r(BX0,-5,BX1,-2,'#9ea2ac');r(BX0,RZ0,BX1,RZ1,'#3b3f47');r(BX0,6,BX1,9,'#9ea2ac');r(10,9,34,14,'#aaa493');
 g.fillStyle='#f4f4f4';for(let z=RZ0;z<RZ1;z+=1){const a=mf(ZX-ZW,z);g.fillRect(a[0],a[1],ZW*2*MS,MS*.5)}
 g.strokeStyle='#2f6f5a';g.lineWidth=2;[[-35,-3],[3,35]].forEach(a=>{const p=mf(a[0],-19),q=mf(a[1],-19);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke()});
 [[LUC.SCHOOL.x,-25,'#ffd23f','S'],[LUC.GUARD.x,LUC.GUARD.z,'#4a86c8','P'],[LUC.BUS.xs,8,'#2e6fd0','B'],[LUC.NASI.x,LUC.NASI.z+1.5,'#ff9f43','N'],[LUC.RUN.x,LUC.RUN.z+1.5,'#e24b4b','K'],[LUC.ICE.x,LUC.ICE.z,'#f08ad0','A']].forEach(a=>{const p=mf(a[0],a[1]);g.fillStyle=a[2];g.beginPath();g.arc(p[0],p[1],10,0,7);g.fill();g.fillStyle='#fff';g.font='bold 15px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(a[3],p[0],p[1]+1)})})();
function drawMM(){mg.drawImage(mb,0,0);CARS.forEach(c=>{if(!c.on)return;const p=mf(c.x,c.z);mg.fillStyle='#e8e8ee';mg.fillRect(p[0]-3,p[1]-2,6,4)});if(bus.st!='idle'){const p=mf(bus.x,LUC.LW);mg.fillStyle='#f2b81f';mg.fillRect(p[0]-BU.len*MS/2,p[1]-3,BU.len*MS,6)}
 if(CHS.st=='wait'||CHS.st=='run'){const q=mf(CHS.x,CHS.z),k=1+.15*Math.sin(Date.now()/90);mg.fillStyle='#e02424';mg.strokeStyle='#fff';mg.lineWidth=2.5;mg.beginPath();mg.moveTo(q[0],q[1]-13*k);mg.lineTo(q[0]-11*k,q[1]+9*k);mg.lineTo(q[0]+11*k,q[1]+9*k);mg.closePath();mg.fill();mg.stroke()} /* 12d: red triangle = chaser */
 const a=mf(P.x,P.z),s=Math.sin(P.f),c=Math.cos(P.f);mg.fillStyle='#2f6fd0';mg.strokeStyle='#fff';mg.lineWidth=3;mg.beginPath();mg.moveTo(a[0]+s*14,a[1]+c*14);mg.lineTo(a[0]-s*8+c*8,a[1]-c*8-s*8);mg.lineTo(a[0]-s*8-c*8,a[1]-c*8+s*8);mg.closePath();mg.fill();mg.stroke()}
/* ---- pause and Android back (same behaviour as the Padang) ---- */
const paused=()=>{const m=$('menu');return m.classList.contains('pz')&&m.style.display!='none'};
function pause(){halt=true;$('menu').classList.add('pz');$('menu').style.display='flex';document.body.classList.add('mn');view('vp')}
$('pS').onclick=()=>{$('menu').style.display='none';$('menu').classList.remove('pz');document.body.classList.remove('mn');if(mode=='walk')halt=false};$('pH').onclick=()=>{frm='vp';view('vh')};$('pT').onclick=()=>{frm='vp';applySet();view('vt')};$('pQ').onclick=()=>{SS.del('sk_day');SS.del('sk_ret');SS.del('sk_in');SS.del('sk_out');nav('index')};
(function(){if(SR_IFR)return;let on=0;const E=['pointerdown','keydown','touchend'],arm=()=>{if(on)return;on=1;backKeep();E.forEach(e=>removeEventListener(e,arm,true))};E.forEach(e=>addEventListener(e,arm,true));
addEventListener('popstate',()=>{if(!on||!SR_TRAP)return;backKeep();const ld=$('ld');if(ld&&ld.style.display!='none')return;if(mode=='boot')return;const m=$('menu');if(m.style.display=='flex'){const vp=$('vp');if(vp&&!vp.hidden)$('pS').click();else view('vp')}else pause()})})();
window.gfxHook=()=>{ren.shadowMap.enabled=!SET.lo;dl.castShadow=!SET.lo;ren.setPixelRatio(SET.lo?1:Math.min(devicePixelRatio,2));LOWH.forEach((o,i)=>o.visible=!(SET.lo&&i%2));BSH.forEach((o,i)=>o.visible=!(SET.lo&&i%2));GRS.forEach((o,i)=>o.visible=!SET.lo||i<2);fit();sc.traverse(o=>{if(o.material)o.material.needsUpdate=true})};
/* ---- main loop ---- */
let last=0,wasSlow=false;
function loop(ts){requestAnimationFrame(loop);let dt=Math.min((ts-last)/1000||0,.05);const t=ts/1000;last=ts;if(paused())dt=0;
 if(halt){keys.KeyW=keys.KeyA=keys.KeyS=keys.KeyD=keys.ArrowUp=keys.ArrowDown=keys.ArrowLeft=keys.ArrowRight=keys.Space=0;jv.x=jv.z=0;jmp=0}
 let ix=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+jv.x,iz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+jv.z;const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}
 const mv=l>.12&&!halt&&mode=='walk',ox=P.x,oz=P.z;let want=0;
 if(mode=='walk'){if(mv){const m=camMap(cy,ix,iz,true,od||hold>0),spd=5*(slowT>0?SLOW.k:1)*BAG.spd(),dx=m[0]*spd*dt,dz=m[1]*spd*dt;want=Math.hypot(dx,dz);if(!hitP(P.x+dx,P.z,.35))P.x+=dx;if(!hitP(P.x,P.z+dz,.35))P.z+=dz;P.f=la(P.f,Math.atan2(m[0],m[1]),Math.min(1,dt*14))}else camMap(cy,0,0,false,false);
  P.x=Math.max(BX0+.4,Math.min(BX1-.4,P.x));P.z=Math.max(BZ0+.4,Math.min(BZ1-.4,P.z));
  cy=camStep(cy,dt,mv,mv&&Math.hypot(P.x-ox,P.z-oz)<CAMC.block*want,P.f,hold);hold-=dt;slowT=Math.max(0,slowT-dt);
  if((keys.Space||jmp)&&P.y<=0)P.vy=6.8*BAG.jmp();P.vy-=22*dt;P.y+=P.vy*dt;if(P.y<=0){P.y=0;P.vy=0}P.gy+=(gy(P.x,P.z)-P.gy)*Math.min(1,dt*18)}
 if(pm.visible){pm.position.set(P.x,P.y+P.gy,P.z);pm.rotation.y=P.f;anim(pm,t,mv&&P.y==0)}
 BAG.tick(dt,1);BAG.sync(slowT);{const gi=BAG.inv(),lf=BAG.left(),op=gi?((lf<2&&(Math.floor(lf*6)&1))?.85:.4):1;if(op!==ghO||(gi&&pm!==ghP)){BAG.ghost(pm,gi,op);ghO=op;ghP=pm}if(ghS&&!gi)BAG.unstick(P,hit);BAG.track(P.x,P.z,hit);ghS=gi}if(eatT>0){eatT-=dt;pm.userData.arms[1].rotation.x=-2.4;if(eatT<=0&&mode=='walk')halt=false} /* Round 16: carried slow debuff, food animation */
 /* traffic: cars stop at the zebra while someone is on it (and only while the player is walking, never during the bus scene) */
 LUL.sigTick(SGS,dt,{clear:LUL.zoneClear(CARS),empty:!(mode=='walk'&&LUL.pedZone(P))});sigVis();sigBeep(); /* 12b: the cycle runs after the button is pressed; cars hold at the line while SGS.carsStop */
 CARS.forEach(c=>{LUL.carTick(c,dt,SGS.carsStop,LUL.leaderOf(c,CARS),Math.random);c.m.visible=c.on;if(c.on)c.m.position.set(c.x,0,c.z);
  if(mode=='walk'&&!halt&&dt>0&&!BAG.inv()&&LUL.hitCar({x:P.x,z:P.z,y:P.y+P.gy},c,SGS))bump(c)});
 /* bus: the arrival scene, the waiting bus, boarding */
 if(callT>=0){callT-=dt;if(callT<=0&&LUL.busCall(bus)){callT=-1}}
 const bs=bus.st,dw=bus.door;LUL.busTick(bus,dt);
 if(bs=='arr'&&bus.st=='stop')tone(240,0,.35,'sawtooth',.08);
 if(!dw&&bus.door)tone(520,0,.1,'triangle',.1);
 if(bus.st=='stop'&&mode=='bus'&&LUL.outReady(bus))spawnOut();
 if(bus.st=='stop'&&flow!='home'&&mode=='walk'&&bus.t>=BU.door+BU.out+BU.stay&&(P.z<LUC.LW-1.8||P.z>LUC.LW+1.8))LUL.busLeave(bus); /* waits until the player is off the bus lane */
 if(bs=='leave'&&bus.st=='idle'){WCAR.hold=false;WCAR.wait=3;WCAR.on=false}
 {const nr=Math.abs(P.x-LUC.BUS.xs)<6.5&&P.z>5&&P.z<12,tg=nr?.25:1;roofM.opacity+=(tg-roofM.opacity)*Math.min(1,dt*6)} /* the roof turns see-through when it would hide the player */
 STU.forEach((m,i)=>anim(m,t+i,0));WLK.forEach(w=>{LUL.walkTick(w,dt,(x,z)=>hitS(x,z,.4)||DYNS.some(d=>Math.hypot(x-d.x,z-d.z)<.4+d.r),mode=='walk'?P:null);w.m.position.set(w.x,0,w.z);w.m.rotation.y=w.dir>0?Math.PI/2:-Math.PI/2;anim(w.m,t,1)});
 if(CHS.st=='wait'||CHS.st=='run'){if(mode=='walk'&&!halt&&dt>0){const ev=LUL.chaseTick(CHS,dt,P,chFree);if(LUL.chaseBeep(CHS,dt,Math.hypot(P.x-CHS.x,P.z-CHS.z)))tone(740,0,.07,'square',.07);if(ev=='caught')caught()}
  guard.position.set(CHS.x,0,CHS.z);GDY.x=CHS.x;GDY.z=CHS.z;guard.rotation.y=CHS.f;anim(guard,t,CHS.mv);chRing.visible=true;chRing.position.set(CHS.x,.06,CHS.z);chRing.scale.setScalar(1+.12*Math.sin(t*8));
  bv.set(CHS.x,2.4,CHS.z).project(cam);if(bv.z<1){chBub.style.display='block';chBub.style.left=(bv.x*.5+.5)*cv.clientWidth+'px';chBub.style.top=(-bv.y*.5+.5)*cv.clientHeight+'px'}else chBub.style.display='none'}else{chRing.visible=false;chBub.style.display='none'}
 BG.visible=bus.st!='idle';BG.position.x=bus.x;busDoor.visible=!bus.door;busOpen.visible=bus.door;
 if(mode=='board'){boardT+=dt;if(boardT>.9&&bus.st=='stop')LUL.busLeave(bus);if(boardT>.9&&bus.x<-30&&!fin){fin=1;SS.set('sk_ret',{home:1});SS.set('sk_in',1);SS.del('sk_out');loading(()=>nav('world'))}}
 /* camera */
 if(mode=='walk'){cp.x+=(P.x-cp.x)*Math.min(1,dt*10);cp.z+=(P.z-cp.z)*Math.min(1,dt*10);let c=walkCam();if(gt<1&&gFrom){gt=Math.min(1,gt+dt/.9);const s=gt*gt*(3-2*gt),mx=(a,b)=>a.map((v,k)=>v+(b[k]-v)*s);c={p:mx(gFrom.p,c.p),l:mx(gFrom.l,c.l)}}setCam(c);dl.position.set(cp.x+6,14,cp.z+8);dl.target.position.set(cp.x,0,cp.z)}
 else if(mode=='bus'||mode=='board'){setCam(busCam());dl.position.set(bus.x+6,14,10);dl.target.position.set(bus.x,0,2)}
 /* HUD */
 iceMan.rotation.y=Math.atan2(P.x-LUC.ICE.x,P.z-LUC.ICE.z);seller.rotation.y=Math.atan2(P.x-LUC.NASI.x,P.z-13.2);keeper.rotation.y=Math.atan2(P.x-LUC.RUN.x,P.z-13.2);if(CHS.st=='off'){guard.rotation.y=Math.atan2(P.x-LUC.GUARD.x,P.z-LUC.GUARD.z);anim(guard,t,0)}[iceMan,seller,keeper].forEach(m=>anim(m,t,0));
 const h=$('hint');
 if(mode=='walk'){bt-=dt;const cw=cv.clientWidth,ch=cv.clientHeight,bb=$('bub');if(bb.style.display=='block'){bv.set(P.x,P.y+P.gy+2.3,P.z).project(cam);bb.style.left=(bv.x*.5+.5)*cw+'px';bb.style.top=(-bv.y*.5+.5)*ch+'px'}
  const a=nearAct(),pe=document.body.classList.contains('touch')?'Tekan E':'E';if(halt)h.style.display='none';else if(a){h.textContent=pe+' · '+a[1];h.style.display='block'}else h.style.display='none';
  if(!greet&&LUL.near(P,LUC.GUARD,3.6)){greet=1;if(flow=='home')say('Hati-hati di jalan, '+(cur&&cur.name||'')+'!');else say('Selamat pagi, '+(cur&&cur.name||'')+'!')}
  if(wasSlow&&slowT<=0)toast('Kaki dah okey semula.',1800);wasSlow=slowT>0}
 else if(mode=='bus'){h.textContent='Tekan untuk langkau';h.style.display='block'}else h.style.display='none';
 drawMM();ren.render(sc,cam)}requestAnimationFrame(loop);
/* ---- start ---- */
function boot(){const k=LS.get('sk_cur',null);if(!k||!PF[k]){SS.del('sk_day');SS.del('sk_ret');SS.del('sk_in');nav('index');return}
 cur=PF[k];gen=cur.gen||'m';curL=cur.L||null;mkP();applySet();slowT=BAG.slow0();BAG.world=1;BAG.onCure=()=>{slowT=0};BAG.onEat=(ic,msg)=>{eatT=2;halt=true;say(msg)}; /* Round 16 */
 const out=SS.get('sk_out'),day=SS.get('sk_day');flow=LUL.flow({story:STORY,out,hasDay:!!day,savedDay:dayOk(cur.save)});
 /* Round 15: the MOD line is written by js/hud.js */
 if(flow=='skip'){SS.set('sk_in',1);SS.del('sk_out');loading(()=>nav('world'));return} /* a Mod Kelas day is saved: carry on inside, no second bus ride */
 if(flow=='arrive')SS.del('sk_out');
 $('scr').textContent=flow=='home'?'Naik bas pulang':STORY?'Masuk ke sekolah':'Luar sekolah';
 WCAR.on=false;WCAR.hold=true; /* the west-bound lane belongs to the bus until it has left */
 loading(()=>{document.body.classList.remove('mn');
  if(flow=='home'){P.x=0;P.z=-23;P.f=0;P.y=0;P.gy=0;cy=Math.PI;cp.x=P.x;cp.z=P.z;mode='walk';halt=false;callT=BU.callIn;toast('Loceng balik! Pergi ke perhentian bas di seberang jalan.',3600)}
  else if(flow=='exit'){P.x=0;P.z=-23;P.f=0;P.y=0;P.gy=0;cy=Math.PI;cp.x=P.x;cp.z=P.z;mode='walk';halt=false;greet=1;WCAR.hold=false;WCAR.wait=1;WCAR.on=false; /* 12d: came out of the school door: foot of the stairs, no bus scene */
   if(STORY&&!(day&&day.free)){LUL.chaseStart(CHS);SRA.whistle();say('Hoi! Masuk balik, waktu belajar!');toast('Kamu keluar waktu sekolah! Pengawal dah nampak kamu.',3400)}else toast(STORY?'Sekolah dah tamat. Jalan-jalan di luar!':'Jom jalan-jalan di luar sekolah.',2600)}
  else{mode='bus';halt=true;pm.visible=false;LUL.busCall(bus);toast(STORY?'Bas sekolah dah sampai!':'Bas sekolah dah sampai. Selamat pagi!',2600)}})}
boot();
