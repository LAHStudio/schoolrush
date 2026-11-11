/* Classroom page (Round 10, roam only). One page for Matematik and English; the subject comes from sessionStorage key sk_kelas ('mat'|'eng'), data in js/kelas-data.js.
   Round 10b2: vase easter egg in the back-right corner (key click only, VASE_NEED/vaseHit in core.js) and a locked back door next to the bookshelf (opens after the ritual; the outside side comes with the world round).
   Round 10b: E triggers (board and map info cards, poster bubbles, hidden note 1 at the bookshelf, sit on the quiz chair). The quiz itself is not built yet (Round 10c).
   Round 10: the player walks in, looks around and leaves by the door.
   Mod Kelas: coming in counts as attended (no grade yet). Mod Jalan-jalan: free in and out. No windows in Matematik/English (they sit in the middle of the building). Round 10e: the Perpustakaan (lib:1) is an outer room: glass window wall on the right, built in js/kelas-lib.js.
   Same pattern as kantin.js: shared camera (core.js), see-through walls, minimap, pause, Android back. Layout numbers are in the room block below. */
const CAMD=.8;   /* camera distance, 1 = Kantin value, lower = closer */
const OKGO=!!SS.get('sk_go');SS.del('sk_go');
const STORY=LS.get('sk_mode','roam')=='story';
const SUB=SS.get('sk_kelas')||'mat',K=KL[SUB]||KL.mat,LIB=!!K.lib,LAB=!!K.lab; /* Round 10h: lab:1 = Makmal Sains (sains), built by js/kelas-lab.js */ /* Round 10e: lib:1 = Perpustakaan (BM), built by js/kelas-lib.js */
const QBM=SUB=='bm'&&typeof SUS!='undefined',QENG=SUB=='eng'&&typeof SP!='undefined',QLAB=LAB&&typeof SAP!='undefined',QE=QLAB?(typeof SAM!='undefined'?{open:o=>(o&&o.sub=='sainsex'&&typeof SAE!='undefined'?SAE:o&&o.sub=='sainsmm'?SAM:SAP).open(o),back:()=>{typeof SAE!='undefined'&&SAE.isOpen()?SAE.back():SAM.isOpen()?SAM.back():SAP.back()},isOpen:()=>SAP.isOpen()||SAM.isOpen()||(typeof SAE!='undefined'&&SAE.isOpen())}:SAP):QBM?SUS:QENG?SP:QZ; /* Round 10i: the lab points QE at the Sains screen (SAP) so Android Back closes it; Round 10j: a tiny router sends sub 'sainsmm' to SAM (Meja Makmal) and Back/isOpen cover both; HASQ stays false (no door rule yet) */ /* Round 10f: BM uses Susun Ayat (SUS) */ /* Round 10d: English uses the spelling game (SP), Matematik the ABCD quiz (QZ); both have the same open/back/isOpen */
const HASQ=QENG||QBM||(typeof QD!='undefined'&&!!QD[SUB]);const HASL=QLAB&&typeof SAM!='undefined'&&typeof SAE!='undefined';let QDONE=!HASQ&&!HASL,QRES=null,SXB=[null,null,null]; /* Round 10k: HASL = the Sains lab has all 3 stations; Mod Kelas needs all 3 played to the results screen once in this visit (any score) before the door works; SXB = best station mark per station in this visit (10-mark scale) */ /* Round 10c/10d: Matematik and English have a quiz; Mod Kelas needs it finished once before the door works */
const ren=new T.WebGLRenderer({canvas:$('cv'),antialias:true}),cv=$('cv');ren.shadowMap.enabled=true;ren.setPixelRatio(Math.min(devicePixelRatio,2));
const sc=new T.Scene();sc.background=new T.Color('#bfe3f5');const cam=new T.PerspectiveCamera(55,1,.5,150);
sc.add(new T.HemisphereLight(0xffffff,0x9aa7b8,.95));
const dl=new T.DirectionalLight(0xffffff,.55);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);Object.assign(dl.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:50});sc.add(dl,dl.target);
/* ---- room: x from -RX to RX, z from RZ0 (board wall, north) to RZ1 (door wall, south); the door is at x = DX ---- */
const RX=LIB?9.75:8.5,RZ0=-7,RZ1=7,WH=3.4,DW=1.2,DX=LIB?-3.5:5.2,MZ=(RZ0+RZ1)/2,cols=[],WALL=K.wall,STR=K.strip;
const hit=(x,z,r)=>cols.some(c=>x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1);
const gm=new T.Mesh(new T.PlaneGeometry(300,300),mat('#8fc27a'));gm.rotation.x=-Math.PI/2;gm.position.y=-.02;gm.receiveShadow=true;sc.add(gm);
(()=>{const w=2*RX,d=RZ1-RZ0,c=document.createElement('canvas');c.width=c.height=2;const g=c.getContext('2d');const FL=K.fl||(LIB?['#e6e8ec','#d3d7de']:['#b8bdc5','#a5acb6']);g.fillStyle=FL[0];g.fillRect(0,0,2,2);g.fillStyle=FL[1];g.fillRect(0,0,1,1);g.fillRect(1,1,1,1);
 const t=new T.CanvasTexture(c);t.magFilter=T.NearestFilter;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(w/3,d/3);
 const m=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshPhongMaterial({map:t,shininess:0,specular:0}));m.rotation.x=-Math.PI/2;m.position.set(0,.01,MZ);m.receiveShadow=true;sc.add(m)})();
const FG={back:[],left:[],right:[],front:[]},FDS=[]; /* wall pieces (and what hangs on them) that fade when they block the view of the player */
FG.back.push(bx(sc,2*RX+2,WH,1,WALL,0,WH/2,RZ0-.5));cols.push({x0:-RX-1,x1:RX+1,z0:RZ0-1,z1:RZ0});
let GLS=[];
[-1,1].forEach(s=>{if(LIB&&s>0){GLS=libWindow({sc,cols,FG,RX,RZ0,RZ1,WH,WALL,STR});return}if(LAB&&s<0){GLS=labWindow({sc,cols,FG,RX,RZ0,RZ1,WH,WALL,STR});return}(s<0?FG.left:FG.right).push(bx(sc,1,WH,RZ1-RZ0+2,WALL,s*(RX+.5),WH/2,MZ));cols.push({x0:s>0?RX:-RX-1,x1:s>0?RX+1:-RX,z0:RZ0-1,z1:RZ1+1.2});
 (s<0?FG.left:FG.right).push(bx(sc,.12,.9,RZ1-RZ0,STR,s*(RX-.06),.45,MZ))});
FG.back.push(bx(sc,2*RX,.9,.12,STR,0,.45,RZ0+.06));
(()=>{const a=-RX-1,b=DX-DW,c=DX+DW,d=RX+1;[[a,b],[c,d]].forEach(p=>{const w=p[1]-p[0];FG.front.push(bx(sc,w,WH,1,WALL,p[0]+w/2,WH/2,RZ1+.5));cols.push({x0:p[0],x1:p[1],z0:RZ1,z1:RZ1+1.2});
 const q0=Math.max(p[0],-RX),q1=Math.min(p[1],RX);FG.front.push(bx(sc,q1-q0,.9,.12,STR,(q0+q1)/2,.45,RZ1-.06))});
 FG.front.push(bx(sc,2*DW,WH-2.5,1,WALL,DX,2.5+(WH-2.5)/2,RZ1+.5));cols.push({x0:b,x1:c,z0:RZ1,z1:RZ1+1.2}); /* the doorway is solid too: the exit works with E at the door, nobody walks outside */
 if(LIB||LAB)FG.front.push(...gdoor(sc,DX,RZ1,Math.PI,2*DW-.2,2.5,LAB?'#3b5368':'#3d3578',-.1)); /* Round 10g: glass double door in the Perpustakaan; Round 10i3: also in the Makmal Sains, steel-blue frame to suit its grey walls (the same frame colour as outside in world-build.js) */
 else{FG.front.push(pn(2*DW-.2,2.5,'#d9b184',DX,1.25,RZ1+.1,Math.PI));[-1,1].forEach(s=>FG.front.push(pn(.1,2.5,'#7a5236',DX+s*(DW-.05),1.25,RZ1-.02,Math.PI)));
 FG.front.push(bx(sc,.12,.12,.12,'#444444',DX-.7,1.1,RZ1-.1))}})();
function pn(w,h,c,x,y,z,ry){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c}));m.position.set(x,y,z);m.rotation.y=ry;sc.add(m);return m}
function sign(L,bg,fg,w,h,fs,x,y,z,r){const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,512,c.height);g.fillStyle=fg;g.font='bold '+fs*2+'px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';L.forEach((s,i)=>g.fillText(s,256,c.height*(i+.5)/L.length));
 const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));m.position.set(x,y,z);m.rotation.y=r;sc.add(m);return m}
FG.front.push(sign(['KELUAR'],'#1c2f6b','#ffffff',2,.5,26,DX,3.0,RZ1-.03,Math.PI));
/* ---- front wall (north): board, ledge, clock, notice board, lockers ---- */
if(!LIB&&!LAB)FG.back.push(bx(sc,6.6,2.2,.12,'#ececec',0,1.95,RZ0+.07),sign(K.board,'#2f6f5e','#f4f4f4',6.2,2,30,0,1.95,RZ0+.14,0),bx(sc,6.2,.06,.2,'#d8d8d8',0,.93,RZ0+.12));
(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#ffffff';g.beginPath();g.arc(32,32,30,0,7);g.fill();g.strokeStyle='#333';g.lineWidth=5;g.beginPath();g.arc(32,32,30,0,7);g.stroke();g.lineWidth=4;g.beginPath();g.moveTo(32,32);g.lineTo(32,12);g.moveTo(32,32);g.lineTo(46,38);g.stroke();
 const m=new T.Mesh(new T.PlaneGeometry(.5,.5),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true}));m.position.set(LIB?LBW.NB[0]:LAB?6.55:0,3.12,RZ0+.1);sc.add(m);FG.back.push(m)})();
if(!LIB&&!LAB){FG.back.push(bx(sc,1.9,1.4,.08,'#8a5a3a',-5.7,1.95,RZ0+.06),bx(sc,1.7,1.2,.08,'#c9955a',-5.7,1.95,RZ0+.1));
[['#ffffff',-.45,.25],['#ffd23f',.05,.3],['#ff8fb1',.5,.2],['#9be0a8',-.3,-.25],['#8ec5ff',.3,-.25]].forEach(a=>FG.back.push(bx(sc,.38,.46,.02,a[0],-5.7+a[1],1.95+a[2],RZ0+.15)))}
function fset(g,box){const fm=[];g.traverse(o=>{if(o.isMesh)fm.push(o)});FDS.push({m:fm,boxes:[box],op:1,tg:1})}
const LB=LAB?buildLab({sc,cols,FG,fset,sign,RX,RZ0,RZ1,DX,DW,WH,K}):LIB?buildLib({sc,cols,FG,fset,sign,RX,RZ0,RZ1,DX,DW,WH,K}):null;
if(!LIB&&!LAB)(()=>{const g=new T.Group(),x=5.4,z=RZ0+.4;bx(g,2.3,2.5,.7,'#2fa39c',0,1.25,0);[-.77,0,.77].forEach(o=>{bx(g,.04,2.3,.02,'#1d6f6a',o+.385,1.25,.36);bx(g,.3,.05,.02,'#1d6f6a',o,2.05,.36);bx(g,.1,.3,.03,'#e8e8e8',o+.25,1.2,.37)});
 g.position.set(x,0,z);sc.add(g);cols.push({x0:x-1.2,x1:x+1.2,z0:RZ0,z1:RZ0+.8});fset(g,[x-1.2,x+1.2,0,2.6,RZ0,RZ0+.8])})();
/* ---- side walls: world map, posters, bookshelf ---- */
if(!LIB&&!LAB)(()=>{const c=document.createElement('canvas');c.width=512;c.height=300;const g=c.getContext('2d');g.fillStyle='#5aa9e6';g.fillRect(0,0,512,300);g.fillStyle='#6fbf73';
 [[70,60,110,70],[120,150,60,100],[230,50,70,60],[250,120,70,110],[340,50,120,80],[400,160,60,40],[430,230,40,25]].forEach(a=>{g.beginPath();g.roundRect?g.roundRect(a[0],a[1],a[2],a[3],18):g.rect(a[0],a[1],a[2],a[3]);g.fill()});
 g.strokeStyle='#ffffff';g.lineWidth=14;g.strokeRect(0,0,512,300);
 const m=new T.Mesh(new T.PlaneGeometry(3.6,2.1),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));m.position.set(-RX+.08,1.95,-3.2);m.rotation.y=Math.PI/2;sc.add(m);FG.left.push(m)})();
if(!LIB&&!LAB)FG.left.push(sign(K.posters[0].t,K.posters[0].c,'#ffffff',1.7,2.1,22,-RX+.08,1.95,1.6,Math.PI/2),sign(K.posters[1].t,K.posters[1].c,'#ffffff',1.7,2.1,22,-RX+.08,1.95,4.4,Math.PI/2));
if(!LIB&&!LAB)FG.right.push(sign(K.posters[2].t,K.posters[2].c,'#ffffff',1.7,2.1,22,RX-.08,1.95,.2,-Math.PI/2),sign(K.posters[3].t,K.posters[3].c,'#ffffff',1.7,2.1,22,RX-.08,1.95,3.2,-Math.PI/2));
if(!LIB&&!LAB)(()=>{const g=new T.Group(),x=RX-.45,z=-3.7,W='#d9b184';bx(g,.7,2.4,.08,W,0,1.2,-.96);bx(g,.7,2.4,.08,W,0,1.2,.96);bx(g,.08,2.4,2,W,.31,1.2,0);
 [.05,.8,1.5,2.2].forEach((y,i)=>{bx(g,.7,.07,2,W,0,y+.03,0);if(i<3)for(let k=0;k<5;k++)bx(g,.45,.5+((k+i)%3)*.08,.2,['#e24b4b','#4aa3ff','#f4c542','#5ccf4a','#b266ff'][(k+i)%5],0,y+.35,-.75+k*.37)});
 const p=new T.Mesh(new T.CylinderGeometry(.2,.15,.3,6),mat('#c0693f')),f=new T.Mesh(new T.IcosahedronGeometry(.3,0),mat('#3f9d54'));p.position.set(0,2.55,.5);f.position.set(0,2.95,.5);g.add(p,f);
 g.position.set(x,0,z);sc.add(g);cols.push({x0:x-.4,x1:x+.4,z0:z-1.05,z1:z+1.05});fset(g,[x-.4,x+.4,0,3.2,z-1.05,z+1.05])})();
/* ---- teacher platform, desk and teacher ---- */
if(!LIB&&!LAB)(()=>{const z=RZ0+1.5;bx(sc,6.4,.18,2.6,'#b8956a',0,.09,z);cols.push({x0:-3.2,x1:3.2,z0:RZ0,z1:RZ0+2.8});
 bx(sc,2.8,.1,1.05,'#d2b183',0,1.02,z+.45);[-1,1].forEach(s=>bx(sc,.1,.77,.95,'#a9814f',s*1.3,.57,z+.45));bx(sc,2.5,.7,.06,'#a9814f',0,.62,z+.9);
 [['#e24b4b',-1],['#4aa3ff',-.5],['#f4c542',.9]].forEach(a=>bx(sc,.35,.07,.5,a[0],a[1],1.1,z+.4));bx(sc,.14,.2,.14,'#6b4a30',.55,1.17,z+.2)})();
const TCH=npc('guru');if(LIB){TCH.position.set(LB.TCH[0],0,LB.TCH[1]);TCH.rotation.y=Math.PI}else if(LAB){TCH.position.set(LB.TCH[0],.18,LB.TCH[1]);TCH.rotation.y=0}else{TCH.position.set(0,.18,RZ0+1.05);TCH.rotation.y=0}sc.add(TCH);
/* ---- student desks (2 rows x 2) with chairs and a few students ---- */
function chair(x,z){bx(sc,.56,.07,.5,'#c8a26a',x,.46,z);bx(sc,.56,.5,.07,'#c8a26a',x,.8,z+.25);[-1,1].forEach(s=>bx(sc,.05,.46,.46,'#4a4f58',x+s*.24,.23,z))}
const SEATS=[],QC=LIB?LB.QC:[2.2,3.4]; /* QC = the quiz chair (always empty): left chair at the right desk of the row nearest the door */
const DK=K.dk||['#d9b88a','#5a5f69','#b79866'];function desk(x,z){bx(sc,3.4,.08,1,DK[0],x,.88,z);[-1,1].forEach(s=>bx(sc,.08,.8,.9,DK[1],x+s*1.6,.44,z));bx(sc,3.1,.5,.06,DK[2],x,.6,z-.4);
 bx(sc,.45,.06,.32,'#4aa3ff',x-.8,.95,z);bx(sc,.45,.06,.32,'#e24b4b',x+.8,.95,z-.05);
 [-.8,.8].forEach(o=>{chair(x+o,z+1);SEATS.push([x+o,z+1.05])});cols.push({x0:x-1.8,x1:x+1.8,z0:z-.6,z1:z+1.4})}
if(!LIB)[[-3,-2],[3,-2],[-3,2.4],[3,2.4]].forEach(a=>desk(a[0],a[1]));
SEATS.filter(s=>!(Math.abs(s[0]-QC[0])<.01&&Math.abs(s[1]-(QC[1]+.05))<.01)).sort(()=>Math.random()-.5).slice(0,5).forEach(s=>{const m=npc('murid');m.position.set(s[0],.04,s[1]);m.rotation.y=Math.PI;m.userData.legs.forEach(l=>l.rotation.x=-Math.PI/2);sc.add(m)});
/* ---- small things: red bin, plant, two balls ---- */
if(!LIB)(()=>{const x=-RX+.8,z=RZ1-.8,b=new T.Mesh(new T.CylinderGeometry(.3,.24,.55,8),mat('#e0463a'));b.position.set(x,.275,z);b.castShadow=true;sc.add(b);cols.push({x0:x-.34,x1:x+.34,z0:z-.34,z1:z+.34});if(LAB)return;
 const p=new T.Mesh(new T.CylinderGeometry(.28,.2,.45,6),mat('#c0693f')),f=new T.Mesh(new T.IcosahedronGeometry(.42,0),mat('#3f9d54'));p.position.set(-RX+.9,.225,RZ0+.9);f.position.set(-RX+.9,.85,RZ0+.9);sc.add(p,f);cols.push({x0:-RX+.58,x1:-RX+1.22,z0:RZ0+.58,z1:RZ0+1.22});
 [['#f4f4f4',-6.4,3.6],['#e8923a',-.6,-3.9]].forEach(a=>{const m=new T.Mesh(new T.SphereGeometry(.22,10,8),mat(a[0]));m.position.set(a[1],.22,a[2]);m.castShadow=true;sc.add(m)})})();
/* ---- Round 10b2: the vase in the back-right corner (easter egg, no hint) and the locked back door next to the bookshelf ---- */
const VX=LIB?RX-.9:7.7,VZ=RZ0+.8,BDZ=-1.6;
mkVase(sc,VX,VZ);cols.push({x0:VX-.4,x1:VX+.4,z0:VZ-.4,z1:VZ+.4});
let LK;
/* the whole door sits IN FRONT of the wall stripe (x < RX-.12) so nothing overlaps it: no flicker */
if(LIB||LAB)LK=LB.LK;else(()=>{const D=RX-.12;FG.right.push(bx(sc,.04,2.4,1.6,'#8a5a3a',D-.02,1.2,BDZ),bx(sc,.1,2.5,.12,'#5a3a22',D-.05,1.25,BDZ-.86),bx(sc,.1,2.5,.12,'#5a3a22',D-.05,1.25,BDZ+.86),bx(sc,.1,.14,1.84,'#5a3a22',D-.05,2.45,BDZ),bx(sc,.04,.9,.5,'#6f4a2c',D-.06,1.2,BDZ));
 LK=bx(sc,.1,.3,.22,'#444444',D-.1,1.1,BDZ+.55);FG.right.push(LK)})();
function refreshBack(){LK.material.color.set(backOpen()?'#5ccf4a':'#444444')}
function backTap(){if(!backOpen()){say('Berkunci.',1800);return}if(STORY){say('Pintu belakang tak boleh digunakan waktu kelas.',2600);return}SS.set('sk_ret',{room:K.room,roam:1,back:1});loading(()=>nav('world'))}
FDS.push({m:FG.back,boxes:[[-RX-1,RX+1,0,WH,RZ0-1,RZ0]],op:1,tg:1},{m:FG.left,boxes:[[-RX-1,-RX,0,WH,RZ0-1,RZ1+1.2]],op:1,tg:1},{m:FG.right,boxes:[[RX,RX+1,0,WH,RZ0-1,RZ1+1.2]],op:1,tg:1},
 {m:FG.front,boxes:[[-RX-1,DX-DW,0,WH,RZ1,RZ1+1.2],[DX+DW,RX+1,0,WH,RZ1,RZ1+1.2],[DX-DW,DX+DW,2.5,WH,RZ1,RZ1+1.2]],op:1,tg:1});
const FRW=FDS.find(f=>f.m===FG.right),FLW=FDS.find(f=>f.m===FG.left); /* the right wall entry (the glass in the Perpustakaan hides while this wall is faded) */
const EX={x:DX,z:RZ1-1.1},em=new T.Mesh(new T.ConeGeometry(.4,.8,4),new T.MeshBasicMaterial({color:'#5ccf4a'}));em.rotation.x=Math.PI;sc.add(em);
const qm=new T.Mesh(new T.ConeGeometry(.3,.6,4),new T.MeshBasicMaterial({color:'#ffd23f'}));qm.rotation.x=Math.PI;sc.add(qm); /* yellow marker over the quiz chair */
const STM=LAB?LB.ST.map(()=>{const m=new T.Mesh(new T.ConeGeometry(.3,.6,4),new T.MeshBasicMaterial({color:'#ffd23f'}));m.rotation.x=Math.PI;sc.add(m);return m}):[]; /* Round 10h: one yellow marker over each of the 3 Sains stations */
/* ---- teacher speech bubble ---- */
const sb=document.createElement('div');sb.className='sb';document.body.appendChild(sb);let tline=null;
/* ---- player ---- */
const P={x:DX,z:RZ1-1.8,y:0,vy:0,f:Math.PI,slow:0},cp={x:P.x,z:P.z};let gen='m',pm,cy=0,hold=0,curL=null;
function mkP(){if(pm)sc.remove(pm);pm=player(gen,'uni',curL);sc.add(pm)}mkP();
/* ---- input (same controls as the Kantin) ---- */
const keys={},jv={x:0,z:0};let jmp=0;
addEventListener('keydown',e=>{if(halt)return;keys[e.code]=1;if(e.code=='Space')e.preventDefault();if(e.code=='KeyE')act()});addEventListener('keyup',e=>keys[e.code]=0);
if(matchMedia('(pointer:coarse)').matches)document.body.classList.add('touch');
const jz=$('jz'),jb=$('jb'),jk=$('jk');let jid=null,bx0,by0;
jz.onpointerdown=e=>{jid=e.pointerId;jz.setPointerCapture(jid);bx0=e.clientX;by0=e.clientY;const r=jz.getBoundingClientRect();jb.style.left=(bx0-r.left-50)+'px';jb.style.top=(by0-r.top-50)+'px';jb.style.display='block';jk.style.transform='none'};
jz.onpointermove=e=>{if(e.pointerId!=jid)return;let dx=e.clientX-bx0,dy=e.clientY-by0;const l=Math.hypot(dx,dy);if(l>50){dx*=50/l;dy*=50/l}jk.style.transform=`translate(${dx}px,${dy}px)`;jv.x=dx/50;jv.z=dy/50};
jz.onpointerup=jz.onpointercancel=()=>{jid=null;jb.style.display='none';jv.x=jv.z=0};
$('bj').onpointerdown=()=>jmp=1;$('bj').onpointerup=$('bj').onpointercancel=()=>jmp=0;$('be').onpointerdown=()=>act();$('ex').onclick=()=>pause();
let od=null;cv.onpointerdown=e=>{od=e;cv.setPointerCapture(e.pointerId)};cv.onpointermove=e=>{if(od&&e.pointerId==od.pointerId){cy-=(e.clientX-od.clientX)*.007;od=e;hold=1.5}};cv.onpointerup=cv.onpointercancel=()=>od=null;
function fit(){ren.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',fit);fit();
const bv=new T.Vector3();
const nearDoor=()=>Math.hypot(P.x-EX.x,P.z-EX.z)<2.3;
let bt=0,bm,sitting=false;function say(t,ms){const b=$('bub');b.textContent=t;b.style.whiteSpace='normal';b.style.width='min(78vw,300px)';b.style.textAlign='center';b.style.display='block';clearTimeout(bm);bm=setTimeout(()=>b.style.display='none',ms||3600)}
/* ---- info cards (board, map, hidden note, sitting): small overlay, text only ---- */
const ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.35);z-index:30;padding:16px';
const cd=document.createElement('div');cd.style.cssText='background:var(--pn);color:var(--fg);border-radius:18px;padding:18px 20px;max-width:440px;width:100%;max-height:80%;overflow:auto;box-shadow:0 8px 30px rgba(0,0,0,.35);font-family:Fredoka,sans-serif;line-height:1.35';ov.appendChild(cd);document.body.appendChild(ov);
const cardOpen=()=>ov.style.display=='flex';
function card(title,lines,btns){cd.innerHTML='';const h=document.createElement('h2');h.textContent=title;h.style.margin='0 0 10px';cd.appendChild(h);
 lines.forEach(l=>{const p=document.createElement('p');p.textContent=l;p.style.margin='6px 0';cd.appendChild(p)});
 const r=document.createElement('div');r.style.cssText='display:flex;gap:10px;margin-top:14px;flex-wrap:wrap';btns.forEach(b=>{const e=document.createElement('button');e.textContent=b[0];e.style.cssText='background:var(--ac);color:#fff;border:0;border-radius:12px;padding:10px 18px;font:inherit;font-weight:700;cursor:pointer';e.onclick=b[1];r.appendChild(e)});cd.appendChild(r);
 ov.style.display='flex';halt=true;document.body.classList.add('mn')}
function stand(){if(!sitting)return;sitting=false;P.x=QC[0];P.z=QC[1]+.95;P.f=Math.PI}
function shut(){ov.style.display='none';stand();document.body.classList.remove('mn');halt=false}
const info=d=>card(d.t,d.l,[['Tutup',shut]]);
function findNote(){cur.sec=cur.sec||{};const first=!cur.sec[K.hid.id];if(first){cur.sec[K.hid.id]=Date.now();save()}card(K.hid.t,K.hid.l,[['Tutup',shut]]);if(first)toast('Nota tersembunyi dijumpai!',2600)}
/* Round 10h: the 3 Sains stations only show an info card for now; the mini games hook in here in the next rounds (same QE open/back/isOpen API) */
function station(i){if(i==0&&QLAB){halt=true;document.body.classList.add('mn');QE.open({sub:'sainspp',lock:null,onClose:shut,onDone:r=>stationDone(0,r)});return} /* Round 10i: Papan Putih is the Kitaran Kehidupan quiz (one level, Mudah, so no lock); no onDone: no class grade or door rule until all 3 stations exist */
 if(i==1&&QLAB&&typeof SAM!='undefined'){halt=true;document.body.classList.add('mn');QE.open({sub:'sainsmm',lock:null,onClose:shut,onDone:r=>stationDone(1,r)});return} /* Round 10j: Meja Makmal = Rantai Makanan (Sederhana), same rules as Papan Putih: no lock, no onDone */
 if(i==2&&QLAB&&HASL){halt=true;document.body.classList.add('mn');QE.open({sub:'sainsex',lock:null,onClose:shut,onDone:r=>stationDone(2,r)});return} /* Round 10k: Stesen Eksperimen = Penyiasatan Saintifik (Sukar); the three onDone calls drive the Sains door rule and class grade */
 const x=K.stn[i];card(x.n+' · '+x.t,[x.lv+' · markah penuh 30',x.d,'Aktiviti ini akan datang tidak lama lagi. Sabar ya!'],[['Tutup',shut]])}
function sit(){sitting=true;P.x=QC[0];P.z=QC[1];P.f=Math.PI;P.y=0;P.vy=0;if(HASQ){halt=true;document.body.classList.add('mn');QE.open({sub:SUB,lock:STORY?(cur.level||'sederhana'):null,onClose:shut,onDone:quizDone})}else card('Mini Kuiz '+K.n,['Kuiz akan datang tidak lama lagi. Sabar ya!'],[['Bangun',shut]])}
/* ---- E triggers: [x, z, radius, hint, action]; the nearest one inside its radius wins ---- */
const TR=[[0,RZ0+3.3,3,'Baca papan',()=>info(K.nb)],[-RX+.7,-3.2,2.1,'Lihat peta dunia',()=>info(K.nm)],
 [-RX+.7,1.6,1.4,'Baca poster',()=>say(K.posters[0].b)],[-RX+.7,4.4,1.4,'Baca poster',()=>say(K.posters[1].b)],[RX-.7,.2,1.4,'Baca poster',()=>say(K.posters[2].b)],[RX-.7,3.2,1.4,'Baca poster',()=>say(K.posters[3].b)],
 [RX-1.5,-3.7,1.8,'Periksa rak buku',findNote],[QC[0],QC[1]+.9,1.3,'Duduk',sit],
 [VX,VZ,1.5,'',()=>{if(vaseHit(SUB+'_vase'))refreshBack()}],[RX-1.2,BDZ,1.4,'Pintu belakang',backTap]];
if(LIB){TR.length=0;TR.push([LB.NB[0],LB.NB[1],2.2,'Baca papan',()=>info(K.nb)],[LB.GB[0],LB.GB[1],1.8,'Lihat glob dunia',()=>info(K.nm)],...LB.PS.map((p,i)=>[p[0],p[1],1.4,'Baca poster',()=>say(K.posters[i].b)]),[LB.HID[0],LB.HID[1],1.6,'Periksa rak buku',findNote],[QC[0],QC[1]+.9,1.3,'Duduk',sit],[VX,VZ,1.5,'',()=>{if(vaseHit(SUB+'_vase'))refreshBack()}],[LB.BDX,RZ0+1.2,1.4,'Pintu belakang',backTap])}
if(LAB){TR.length=0;TR.push([LB.ST[0][0],LB.ST[0][1],2,'Papan Putih',()=>station(0)],[LB.ST[1][0],LB.ST[1][1],1.9,'Meja Makmal',()=>station(1)],[LB.ST[2][0],LB.ST[2][1],1.9,'Stesen Eksperimen',()=>station(2)],[LB.NB[0],LB.NB[1],1.6,'Baca papan nota',()=>info(K.nb)],[LB.MD[0],LB.MD[1],1.9,'Lihat model Sistem Suria',()=>info(K.nm)],[LB.P0[0],LB.P0[1],1.4,'Baca poster',()=>say(K.posters[0].b)],[LB.P1[0],LB.P1[1],1.3,'Baca poster',()=>say(K.posters[1].b)],[LB.HID[0],LB.HID[1],1.8,'Periksa almari kaca',findNote],[VX,VZ,1.5,'',()=>{if(vaseHit(SUB+'_vase'))refreshBack()}],[LB.BDX,RZ0+1.2,1.4,'Pintu belakang',backTap])}
const nearTr=()=>{let b=null,bd=1e9;TR.forEach(a=>{const d=Math.hypot(P.x-a[0],P.z-a[1]);if(d<a[2]&&d<bd){bd=d;b=a}});return b};
/* ---- the way out: Mod Kelas = attended (no grade yet), Mod Jalan-jalan = free ---- */
function leave(){if(STORY&&!QDONE){say(HASL?'Selesaikan ketiga-tiga stesen eksperimen dahulu.':'Selesaikan kuiz dahulu. Duduk di kerusi kuning.',3200);return}SS.set('sk_ret',STORY?(QRES?{room:K.room,grade:QRES.g,score:QRES.pct}:{room:K.room}):{room:K.room,roam:1});loading(()=>nav('world'))}
/* a finished quiz: the first finish opens the door in Mod Kelas; the grade (the quiz letter) becomes this class's grade in Pencapaian and the day card */
/* Round 10k: a Sains station finished (results screen shown). Class grade = plain average of the 3 best station marks of this visit (10-mark scale), only once all 3 are done; the door opens at the same moment */
function stationDone(i,r){if(!HASL||!r)return;SXB[i]=Math.max(SXB[i]===null?0:SXB[i],r.sc);if(SXB.some(v=>v===null))return;const avg=(SXB[0]+SXB[1]+SXB[2])/3;quizDone({g:quizGrade(Math.round(avg)).g,pct:Math.round(avg*10)})}
function quizDone(r){QDONE=true;QRES=r;if(STORY){const x=recRoom(SUB,r.pct);x.g=quizGrade(Math.round(x.best/10)).g;save()}}
function act(){if(halt)return;if(nearDoor()){leave();return}const a=nearTr();if(a)a[4]()}
/* ---- minimap ---- */
const mc=$('mm'),mg=mc.getContext('2d'),mb=document.createElement('canvas');mb.width=mb.height=320;const MS=Math.min(300/(2*RX),300/(RZ1-RZ0+3)),mf=(x,z)=>[160+x*MS,160+(z-MZ)*MS];
(()=>{const g=mb.getContext('2d');g.fillStyle='#2b2f38';g.fillRect(0,0,320,320);const a=mf(-RX,RZ0),b=mf(RX,RZ1);g.fillStyle='#b8bdc5';g.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);g.strokeStyle=STR;g.lineWidth=6;g.strokeRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);
 g.fillStyle='#b8bdc5';const d0=mf(DX-DW,RZ1),d1=mf(DX+DW,RZ1);g.fillRect(d0[0],d0[1]-4,d1[0]-d0[0],10);
 const rc=(x0,x1,z0,z1,c)=>{const p=mf(x0,z0),q=mf(x1,z1);g.fillStyle=c;g.fillRect(p[0],p[1],q[0]-p[0],q[1]-p[1])};
 if(LIB||LAB)LB.mm(rc);else{rc(-3.2,3.2,RZ0,RZ0+2.8,'#b8956a');rc(4.2,6.6,RZ0,RZ0+.8,'#2fa39c');rc(RX-.85,RX,-4.75,-2.65,'#d9b184');[[-3,-2],[3,-2],[-3,2.4],[3,2.4]].forEach(a=>rc(a[0]-1.7,a[0]+1.7,a[1]-.5,a[1]+.5,'#d9b88a'))}})();
function drawMM(){mg.drawImage(mb,0,0);const e=mf(EX.x,RZ1-.2);mg.fillStyle='#5ccf4a';mg.beginPath();mg.arc(e[0],e[1],8,0,7);mg.fill();
 const a=mf(P.x,P.z),s=Math.sin(P.f),c=Math.cos(P.f);mg.fillStyle='#2f6fd0';mg.strokeStyle='#fff';mg.lineWidth=3;mg.beginPath();mg.moveTo(a[0]+s*14,a[1]+c*14);mg.lineTo(a[0]-s*8+c*8,a[1]-c*8-s*8);mg.lineTo(a[0]-s*8-c*8,a[1]-c*8+s*8);mg.closePath();mg.fill();mg.stroke()}
/* ---- pause, Android back (same behaviour as the Kantin), graphics ---- */
function pause(){halt=true;$('menu').classList.add('pz');$('menu').style.display='flex';document.body.classList.add('mn');view('vp')}
$('pS').onclick=()=>{$('menu').style.display='none';halt=false;document.body.classList.remove('mn')};$('pH').onclick=()=>{frm='vp';view('vh')};$('pT').onclick=()=>{frm='vp';applySet();view('vt')};$('pQ').onclick=()=>{SS.del('sk_day');SS.del('sk_ret');nav('index')};
(function(){if(SR_IFR)return;let on=0;const E=['pointerdown','keydown','touchend'],arm=()=>{if(on)return;on=1;backKeep();E.forEach(e=>removeEventListener(e,arm,true))};E.forEach(e=>addEventListener(e,arm,true));
addEventListener('popstate',()=>{if(!on||!SR_TRAP)return;backKeep();const ld=$('ld');if(ld&&ld.style.display!='none')return;
if(QE.isOpen()){QE.back();return}if(cardOpen()){shut();return}
const m=$('menu');if(m.style.display=='flex'){const vp=$('vp');if(vp&&!vp.hidden)$('pS').click();else view('vp')}else pause()})})();
window.gfxHook=()=>{ren.shadowMap.enabled=!SET.lo;dl.castShadow=!SET.lo;ren.setPixelRatio(SET.lo?1:Math.min(devicePixelRatio,2));fit();sc.traverse(o=>{if(o.material)o.material.needsUpdate=true})};
/* ---- see-through: a wall or cupboard that is between the camera and the player fades to 25% (same code as the Kantin) ---- */
const CAMP={x:0,y:6,z:0},FADE=.25;
function segBox(C,Q,b){let t0=0,t1=1;const d=[Q.x-C.x,Q.y-C.y,Q.z-C.z],o=[C.x,C.y,C.z];
 for(let i=0;i<3;i++){const lo=b[i*2]-.12,hi=b[i*2+1]+.12;if(Math.abs(d[i])<1e-6){if(o[i]<lo||o[i]>hi)return false}else{let a=(lo-o[i])/d[i],c=(hi-o[i])/d[i];if(a>c){const k=a;a=c;c=k}t0=Math.max(t0,a);t1=Math.min(t1,c);if(t0>t1)return false}}return true}
function fades(dt){const Q={x:P.x,y:P.y+1.1,z:P.z};FDS.forEach(f=>{f.tg=f.boxes.some(b=>segBox(CAMP,Q,b))?FADE:1;if(f.op===f.tg)return;
 const k=SET.lo?1:Math.min(1,dt*10);f.op=Math.abs(f.tg-f.op)<.01?f.tg:f.op+(f.tg-f.op)*k;const tr=f.op<.995;
 f.m.forEach(m=>{const mt=m.material;mt.opacity=f.op;if(mt.transparent!==tr){mt.transparent=tr;mt.needsUpdate=true}})});if(GLS.length)GLS.forEach(m=>m.visible=(LIB?FRW:FLW).op>.9)}
/* ---- main loop ---- */
/* Round 13b: the camera stays inside the room. Near a wall it slides along the wall (clamped x and z) instead of swinging through the wall to the outside. */
function camIn(px,pz,sx,sz,D,rx,z0,z1,m){return[Math.max(-rx+m,Math.min(rx-m,px+sx*D)),Math.max(z0+m,Math.min(z1-m,pz+sz*D))]}
const CM=[6*CAMD,1.2,.85,.6,.9];let last=0;
function loop(ts){requestAnimationFrame(loop);const dt=Math.min((ts-last)/1000||0,.05),t=ts/1000;last=ts;BAG.tick(dt,0);
 if(halt){keys.KeyW=keys.KeyA=keys.KeyS=keys.KeyD=keys.ArrowUp=keys.ArrowDown=keys.ArrowLeft=keys.ArrowRight=keys.Space=0;jv.x=jv.z=0;jmp=0}
 let ix=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+jv.x,iz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+jv.z;const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}
 const mv=l>.12&&!halt;
 const ox=P.x,oz=P.z;let want=0;if(mv){const m=camMap(cy,ix,iz,true,od||hold>0),mx=m[0],mz=m[1],spd=5*BAG.sl(),dx=mx*spd*dt,dz=mz*spd*dt;want=Math.hypot(dx,dz);if(!hit(P.x+dx,P.z,.35))P.x+=dx;if(!hit(P.x,P.z+dz,.35))P.z+=dz;P.f=la(P.f,Math.atan2(mx,mz),Math.min(1,dt*14))}else camMap(cy,0,0,false,false);
 P.x=Math.max(-RX+.4,Math.min(RX-.4,P.x));P.z=Math.max(RZ0+.4,Math.min(RZ1-.4,P.z)); /* never outside the room */
 cy=camStep(cy,dt,mv,mv&&Math.hypot(P.x-ox,P.z-oz)<CAMC.block*want,P.f,hold);hold-=dt;
 if((keys.Space||jmp)&&P.y<=0)P.vy=6.8;P.vy-=22*dt;P.y+=P.vy*dt;if(P.y<=0){P.y=0;P.vy=0}
 pm.position.set(P.x,sitting?.04:P.y,P.z);pm.rotation.y=P.f;if(sitting)pm.userData.legs.forEach(l=>l.rotation.x=-Math.PI/2);else anim(pm,t,mv&&P.y==0);
 const D=CM[0]*(cam.aspect<1?1.15:1);cp.x+=(P.x-cp.x)*Math.min(1,dt*10);cp.z+=(P.z-cp.z)*Math.min(1,dt*10);const sx=Math.sin(cy),sz=Math.cos(cy);
 const cc=camIn(cp.x,cp.z,sx,sz,D,RX,RZ0,RZ1,.3);CAMP.x=cc[0];CAMP.y=CM[1]+D*CM[2];CAMP.z=cc[1];cam.position.set(CAMP.x,CAMP.y,CAMP.z);cam.lookAt(cp.x-sx*CM[3],CM[4],cp.z-sz*CM[3]);dl.position.set(cp.x+6,14,cp.z+8);dl.target.position.set(cp.x,0,cp.z);
 fades(dt);
 em.position.set(EX.x,3.2+Math.abs(Math.sin(t*3))*.3,EX.z);qm.visible=!sitting&&!LAB;qm.position.set(QC[0],1.9+Math.abs(Math.sin(t*3))*.25,QC[1]);STM.forEach((m,i)=>m.position.set(LB.ST[i][0],2.1+Math.abs(Math.sin(t*3+i))*.25,LB.ST[i][1]));
 const bb=$('bub');if(bb.style.display=='block'){bv.set(P.x,P.y+2.3,P.z).project(cam);bb.style.left=(bv.x*.5+.5)*cv.clientWidth+'px';bb.style.top=(-bv.y*.5+.5)*cv.clientHeight+'px'}
 const cw=cv.clientWidth,ch=cv.clientHeight,near=!halt&&Math.hypot(P.x-TCH.position.x,P.z-TCH.position.z)<5;
 if(near){if(!tline)tline=R(K.teach);bv.set(TCH.position.x,2.9,TCH.position.z).project(cam);sb.textContent=tline;sb.style.left=(bv.x*.5+.5)*cw+'px';sb.style.top=(-bv.y*.5+.5)*ch+'px';sb.style.display='block'}else{tline=null;sb.style.display='none'}
 const h=$('hint'),pe=document.body.classList.contains('touch')?'Tekan E':'E';
 const nt=nearTr();if(!halt&&nearDoor()){h.textContent=pe+' · Keluar kelas';h.style.display='block'}else if(!halt&&nt&&nt[3]){h.textContent=pe+' · '+nt[3];h.style.display='block'}else h.style.display='none';
 drawMM();ren.render(sc,cam)}requestAnimationFrame(loop);
/* ---- start ---- */
function boot(){const k=LS.get('sk_cur',null);if(!OKGO||!k||!PF[k]){SS.del('sk_day');SS.del('sk_ret');nav('index');return}
 cur=PF[k];gen=cur.gen||'m';curL=cur.L||null;mkP();applySet();$('scr').style.display='none';refreshBack();if(SS.get('sk_back')){SS.del('sk_back');if(LIB||LAB){P.x=LB.BDX;P.z=RZ0+1.4;P.f=0}else{P.x=RX-1.4;P.z=BDZ;P.f=-Math.PI/2}cy=P.f+Math.PI;cp.x=P.x;cp.z=P.z}/* Round 15: the MOD line is written by js/hud.js */
 loading(()=>{document.body.classList.remove('mn');halt=false;toast(K.hello+(STORY&&HASQ?' Duduk di kerusi kuning untuk kuiz.':'')+(STORY&&HASL?' Selesaikan 3 stesen untuk membuka pintu.':''),3600)})}
boot();
