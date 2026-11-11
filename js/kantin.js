/* Kantin room (Round 7, updated in 7b). A red room with 5 stalls, all open at once. Each stall opens one mini game (js/kantin-games.js).
   Rule: every stall must be finished before the exit door works. Mod Kelas: the result is saved as the Kantin grade and carried
   back to world.html. Mod Jalan-jalan: casual revision, nothing is graded or saved. The player can only get here from world.html
   (sk_go token), so a killed or reloaded app goes back to the start screen and the day restarts.
   7c: Mod Jalan-jalan can leave any time (the all-5-stalls rule is Mod Kelas only), taller stall staff, see-through walls and stalls, shared camera (core.js).
   7b: room size and camera in ROOM / CAMD below, 4 table sets, walking students, rubbish + bins (same mechanic as the hallway), wall posters. */
const ROOM=.85;   /* room size, 1 = first Kantin build (try .8 or .9) */
const CAMD=.9;    /* camera distance, 1 = first build, lower = closer */
const OKGO=!!SS.get('sk_go');SS.del('sk_go');
const STORY=LS.get('sk_mode','roam')=='story';
const ren=new T.WebGLRenderer({canvas:$('cv'),antialias:true}),cv=$('cv');ren.shadowMap.enabled=true;ren.setPixelRatio(Math.min(devicePixelRatio,2));
const sc=new T.Scene();sc.background=new T.Color('#bfe3f5');const cam=new T.PerspectiveCamera(55,1,.5,150);
sc.add(new T.HemisphereLight(0xffffff,0x9aa7b8,.95));
const dl=new T.DirectionalLight(0xffffff,.55);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);Object.assign(dl.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:50});sc.add(dl,dl.target);
/* ---- room (all positions come from these numbers; stalls keep their size, the room around them scales with ROOM) ---- */
const RX=19.5*ROOM,RZ1=11*ROOM,RZ0=RZ1-26*ROOM,WH=3.4,WALL='#d9604a',DW=1.7,cols=[],MZ=(RZ0+RZ1)/2;
const hit=(x,z,r)=>cols.some(c=>x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1);
const KCR=[camRect([-RX,RX,RZ0,RZ1],.3)];
const SX=RX-1.8,ZB=RZ0+1.8,ZF=RZ0+4.25,ZN=RZ0+10.25,TX=RX*.34,TZ=[RZ0+8.35,RZ1-7.15];
const LX=(TX+2+RX-2.58)/2,L0=RZ0+5.45,LM=(TZ[0]+TZ[1])/2,LF=RZ1-2.75,WPX=RX-3.7;
const gm=new T.Mesh(new T.PlaneGeometry(300,300),mat('#8fc27a'));gm.rotation.x=-Math.PI/2;gm.position.y=-.02;gm.receiveShadow=true;sc.add(gm);
(()=>{const w=2*RX,d=RZ1-RZ0,c=document.createElement('canvas');c.width=c.height=2;const g=c.getContext('2d');g.fillStyle='#a9aeb6';g.fillRect(0,0,2,2);g.fillStyle='#949ba5';g.fillRect(0,0,1,1);g.fillRect(1,1,1,1);
 const t=new T.CanvasTexture(c);t.magFilter=T.NearestFilter;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(w/3,d/3);
 const m=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshPhongMaterial({map:t,shininess:0,specular:0}));m.rotation.x=-Math.PI/2;m.position.set(0,.01,MZ);m.receiveShadow=true;sc.add(m)})();
const FG={back:[],left:[],right:[],front:[]},FDS=[]; /* wall pieces (and what hangs on them) that fade when they block the view of the player */
FG.back.push(bx(sc,2*RX+2,WH,1,WALL,0,WH/2,RZ0-.5));cols.push({x0:-RX-1,x1:RX+1,z0:RZ0-1,z1:RZ0});
[-1,1].forEach(s=>{(s<0?FG.left:FG.right).push(bx(sc,1,WH,RZ1-RZ0+2,WALL,s*(RX+.5),WH/2,MZ));cols.push({x0:s>0?RX:-RX-1,x1:s>0?RX+1:-RX,z0:RZ0-1,z1:RZ1+1.2});
 (s<0?FG.left:FG.right).push(bx(sc,.12,.9,RZ1-RZ0,'#b84a38',s*(RX-.06),.45,MZ))});
FG.back.push(bx(sc,2*RX,.9,.12,'#b84a38',0,.45,RZ0+.06));
[-1,1].forEach(s=>{const a=DW,b=RX+1,w=b-a;FG.front.push(bx(sc,w,WH,1,WALL,s*(a+w/2),WH/2,RZ1+.5));cols.push({x0:s>0?a:-b,x1:s>0?b:-a,z0:RZ1,z1:RZ1+1.2})});
FG.front.push(bx(sc,2*DW,WH-2.5,1,WALL,0,2.5+(WH-2.5)/2,RZ1+.5));
cols.push({x0:-DW,x1:DW,z0:RZ1,z1:RZ1+1.2}); /* the doorway is solid too: the exit works with E at the door, nobody walks outside */
function pn(w,h,c,x,y,z,ry){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c}));m.position.set(x,y,z);m.rotation.y=ry;sc.add(m);return m}
function sign(L,bg,fg,w,h,fs,x,y,z,r){const c=document.createElement('canvas');c.width=256;c.height=Math.round(256*h/w);const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,256,c.height);g.fillStyle=fg;g.font='bold '+fs+'px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';L.forEach((s,i)=>g.fillText(s,128,c.height*(i+.5)/L.length));
 const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));m.position.set(x,y,z);m.rotation.y=r;sc.add(m);return m}
FG.front.push(sign(['PINTU KELUAR'],'#1c2f6b','#ffffff',2.6,.6,30,0,3.05,RZ1-.03,Math.PI));
FG.back.push(sign(['KANTIN SEKOLAH'],'#fff3d6','#b84a38',5,.9,30,0,2.5,RZ0+.14,0));
(()=>{FG.front.push(...gdoor(sc,0,RZ1,Math.PI,2*DW-.2,2.5,'#7a5236',-.1))})(); /* Round 10g: glass double door */
function plant(x,z){const p=new T.Mesh(new T.CylinderGeometry(.28,.2,.45,6),mat('#c0693f')),f=new T.Mesh(new T.IcosahedronGeometry(.42,0),mat('#3f9d54'));p.position.set(x,.225,z);f.position.set(x,.85,z);p.castShadow=f.castShadow=true;sc.add(p,f);cols.push({x0:x-.32,x1:x+.32,z0:z-.32,z1:z+.32})}
plant(-RX+.9,RZ1-.9);plant(RX-.9,RZ1-.9);
const KV={x:RX-.9,z:RZ1-2.1};mkVase(sc,KV.x,KV.z);cols.push({x0:KV.x-.4,x1:KV.x+.4,z0:KV.z-.4,z1:KV.z+.4}); /* Round 10b3: easter egg vase next to the right plant, silent (vaseHit in core.js) */
/* ---- wall posters: plain colour panels (drawn shapes or an emoji + two lines), tiny textures ---- */
function poster(i,x,y,z,ry,pw,ph){const d=KD.posters[i],c=document.createElement('canvas');c.width=256;c.height=320;const g=c.getContext('2d');
 g.fillStyle='#ffffff';g.fillRect(0,0,256,320);g.fillStyle=d.c;g.fillRect(10,10,236,300);
 if(d.s=='pyr'){const C=['#b266ff','#4aa3ff','#5ccf4a','#f4c542'],Y=[40,80,120,155,190],h=y=>80*(y-40)/150;C.forEach((col,k)=>{g.fillStyle=col;g.beginPath();g.moveTo(128-h(Y[k]),Y[k]);g.lineTo(128+h(Y[k]),Y[k]);g.lineTo(128+h(Y[k+1]),Y[k+1]);g.lineTo(128-h(Y[k+1]),Y[k+1]);g.closePath();g.fill()})}
 else if(d.s=='plate'){const arc=(a0,a1,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(128,120);g.arc(128,120,72,a0,a1);g.closePath();g.fill()};g.fillStyle='#ffffff';g.beginPath();g.arc(128,120,80,0,7);g.fill();arc(Math.PI/2,Math.PI*1.5,'#5ccf4a');arc(-Math.PI/2,0,'#ff9a3c');arc(0,Math.PI/2,'#f4c542')}
 else{g.font='110px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(d.e,128,120)}
 g.fillStyle='#ffffff';g.font='bold 31px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';d.t.forEach((s,k)=>g.fillText(s,128,232+k*38));
 const m=new T.Mesh(new T.PlaneGeometry(pw||1.9,ph||2.4),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));m.position.set(x,y,z);m.rotation.y=ry;sc.add(m);return m}
[[0,-RX*.7],[1,-RX*.44],[2,RX*.44],[3,RX*.7]].forEach(a=>FG.back.push(poster(a[0],a[1],1.95,RZ0+.08,0)));
FG.front.push(poster(5,-6.2,2.35,RZ1-.03,Math.PI,1.5,1.9),poster(4,RX*.5,1.95,RZ1-.03,Math.PI)); /* the sampah poster sits above the bin labels */
/* ---- tables: 4 sets with benches, students sitting ---- */
function table(x,z,sit){bx(sc,3.7,.1,1.45,'#c8a26a',x,.9,z);[-1,1].forEach(a=>[-1,1].forEach(b=>bx(sc,.12,.85,.12,'#5a5f69',x+a*1.6,.42,z+b*.55)));
 [-1,1].forEach(s=>{bx(sc,3.7,.08,.45,'#a9744a',x,.46,z+s*1.2);[-1,1].forEach(a=>bx(sc,.12,.42,.12,'#5a5f69',x+a*1.6,.21,z+s*1.2))});
 cols.push({x0:x-2,x1:x+2,z0:z-1.7,z1:z+1.7});
 (sit||[]).forEach(a=>{const m=npc('murid');m.position.set(x+a[0],.04,z+a[1]*1.2);m.rotation.y=a[1]>0?Math.PI:0;m.userData.legs.forEach(l=>l.rotation.x=-Math.PI/2);sc.add(m)})}
const TBL=[[-TX,TZ[0],[[-.9,1],[.9,-1]]],[TX,TZ[0],[[0,1]]],[-TX,TZ[1],[[-.9,-1],[.9,-1]]],[TX,TZ[1],[[.9,1],[-.9,1]]]];
TBL.forEach(t=>table(t[0],t[1],t[2]));
/* ---- stalls ---- */
const RES=[null,null,null,null,null],ST=[],SG=[],MK=[],SP=.78,POS=[[-SX,ZN,Math.PI/2],[-SX,ZF,Math.PI/2],[0,ZB,0],[SX,ZF,-Math.PI/2],[SX,ZN,-Math.PI/2]];
function msh(p,geo,c,x,y,z){const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;p.add(m);return m}
function food(g,i,col){
 if(i==0){[['#f4c542',2.2,.5],['#5ccf4a',1.5,.5],['#b266ff',.8,.5]].forEach((a,k)=>bx(g,a[1],a[2],.9,a[0],0,1.8+.25+k*.5,0))}
 else if(i==1){msh(g,new T.CylinderGeometry(.7,.7,.08,14),'#ffffff',0,1.58,0);[['#f4c542',-.3,.1],['#ff8c6b',.3,.1],['#7ed957',-.25,-.3],['#ff6b81',.3,-.25]].forEach(a=>bx(g,.3,.2,.3,a[0],a[1],1.72,a[2]))}
 else if(i==2){msh(g,new T.CylinderGeometry(.9,.6,.4,10),'#c0693f',0,1.7,0);[['#e24b4b',-.3,0],['#ffd23f',.25,.15],['#ff9a3c',.05,-.3]].forEach(a=>msh(g,new T.IcosahedronGeometry(.28,0),a[0],a[1],2,a[2]))}
 else if(i==3){[[-1.8,'#4aa3ff'],[-.6,'#ff6b81'],[.6,'#f4c542'],[1.8,'#7ed957']].forEach(a=>{msh(g,new T.CylinderGeometry(.25,.2,.6,8),a[1],1.8,0).position.x=a[0];bx(g,.05,.5,.05,'#ffffff',a[0]+.1,2.3,0)})}
 else{[[-1.6,'#7ed957'],[-.7,'#4aa3ff']].forEach(a=>msh(g,new T.CylinderGeometry(.2,.22,.7,8),a[1],1.85,0).position.x=a[0]);bx(g,.8,.14,.6,'#ffffff',1,1.6,0);bx(g,.8,.14,.6,'#ffffff',1,1.74,0)}}
function mkSeller(i){const f=i%2==0,c=KD.stalls[i].c,o={skin:R(SK),hc:R(HC),h:1.8,w:1.05,mouth:0,es:1,bw:4}; /* tall enough to stand above the counter */
 if(f){o.o={top:'#f6f7fb',bot:'#f6f7fb',long:1,shoe:'#2a2a30',ls:1,ap:c};o.tud=R(['#f6f7fb','#e8d6c0',c])}else{o.o={top:'#f4f6fa',bot:'#222633',shoe:'#1a1a1e',ls:1,ap:c};o.hs='short';o.stache=Math.random()<.5}
 const G=build(o);G.userData.g=f?'f':'m';return G}
function drawSign(i){const s=SG[i],g=s.cv.getContext('2d'),d=KD.stalls[i],r=RES[i];g.fillStyle=d.c;g.fillRect(0,0,512,128);g.fillStyle='#fff';g.font='bold '+((i+1+'. '+d.n).length>16?44:54)+'px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText((i+1)+'. '+d.n,256,r?44:64);
 if(r){g.font='38px sans-serif';g.fillText('⭐'.repeat(r.stars)+'☆'.repeat(3-r.stars)+'  ✔',256,98)}s.tex.needsUpdate=true}
KD.stalls.forEach((d,i)=>{const p=POS[i],g=new T.Group(),col=d.c,th=p[2];
 bx(g,7,1.4,1.8,'#8a5a3a',0,.7,0);bx(g,7.3,.14,2.1,'#e8d6b0',0,1.47,0);bx(g,6.4,.55,.08,col,0,.7,.92);
 [-3.2,3.2].forEach(x=>bx(g,.18,3.4,.18,'#666666',x,1.7,.95));
 for(let k=0;k<7;k++){const m=bx(g,1,.14,2.8,k%2?'#ffffff':col,k-3,3.45,.4);m.rotation.x=.12}
 bx(g,6.6,2.3,.2,'#6b4a30',0,1.6,-2.4);bx(g,6.4,.1,.6,'#a67c52',0,1.75,-2.05);bx(g,6.4,.1,.6,'#a67c52',0,2.5,-2.05);
 food(g,i,col);
 const cn=document.createElement('canvas');cn.width=512;cn.height=128;const tex=new T.CanvasTexture(cn),sm=new T.Mesh(new T.PlaneGeometry(5.6,1.4),new T.MeshBasicMaterial({map:tex}));sm.position.set(0,4.55,.5);sm.rotation.x=-.25;g.add(sm);SG.push({cv:cn,tex});
 const fm=[];g.traverse(o=>{if(o.isMesh)fm.push(o)}); /* the stall fades when it blocks the view; the seller stays solid */
 const sl=mkSeller(i);sl.position.set(0,0,-1.3);sl.userData.arms.forEach(a=>a.rotation.x=-1.2);g.add(sl);
 g.scale.setScalar(SP);g.position.set(p[0],0,p[1]);g.rotation.y=th;sc.add(g);
 const nx=Math.sin(th),nz=Math.cos(th),b=th==0?[p[0]-2.9,p[0]+2.9,p[1]-1.7,p[1]+.78]:th>0?[p[0]-1.7,p[0]+.78,p[1]-2.9,p[1]+2.9]:[p[0]-.78,p[0]+1.7,p[1]-2.9,p[1]+2.9];
 cols.push({x0:b[0],x1:b[1],z0:b[2],z1:b[3]});
 const sb=document.createElement('div');sb.className='sb';document.body.appendChild(sb);
 const mk=new T.Mesh(new T.ConeGeometry(.4,.8,4),new T.MeshBasicMaterial({color:'#ffd23f'}));mk.rotation.x=Math.PI;sc.add(mk);MK.push(mk);
 const fb=th==0?[p[0]-2.9,p[0]+2.9,0,4.2,p[1]-1.95,p[1]+1.48]:th>0?[p[0]-1.95,p[0]+1.48,0,4.2,p[1]-2.9,p[1]+2.9]:[p[0]-1.48,p[0]+1.95,0,4.2,p[1]-2.9,p[1]+2.9],fd={m:fm,boxes:[fb],op:1,tg:1};FDS.push(fd);
 ST.push({x:p[0],z:p[1],wx:p[0]+nx*1.9,wz:p[1]+nz*1.9,sb,line:null,col,fd});drawSign(i)});
/* exit door marker (shows when every stall is finished) */
const EX={x:0,z:RZ1-1.1},em=new T.Mesh(new T.ConeGeometry(.4,.8,4),new T.MeshBasicMaterial({color:'#5ccf4a'}));em.rotation.x=Math.PI;em.visible=false;sc.add(em);
/* ---- rubbish and bins (same mechanic as the hallway: pick up with E, put in the right bin, counts toward the Pelajar Prihatin badge) ---- */
function mkItem(ty){const g=new T.Group(),a=(geo,c,x,y,z)=>{const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
 if(ty==0){a(new T.IcosahedronGeometry(.15,0),'#f4f4f4',0,.15,0);a(new T.IcosahedronGeometry(.09,0),'#cfe3ff',.1,.2,.05)}
 else if(ty==1){a(new T.CylinderGeometry(.07,.07,.3,8),'#ffe0b8',0,.15,0);a(new T.CylinderGeometry(.04,.04,.07,8),'#e8730c',0,.33,0)}
 else if(ty==2){a(new T.CylinderGeometry(.075,.075,.2,8),'#7a4a24',0,.1,0);a(new T.CylinderGeometry(.035,.035,.14,8),'#7a4a24',0,.27,0);a(new T.CylinderGeometry(.045,.045,.03,8),'#c9a227',0,.36,0)}
 else{a(new T.BoxGeometry(.14,.07,.07),'#ff5fa2',0,.05,0);a(new T.ConeGeometry(.05,.08,4),'#ffd23f',.11,.05,0).rotation.z=-Math.PI/2;a(new T.ConeGeometry(.05,.08,4),'#ffd23f',-.11,.05,0).rotation.z=Math.PI/2}
 return g}
const NM=['Kertas','Botol plastik','Botol kaca','Bungkus gula-gula'],HM=[0,1,2,3].map(t=>{const g=mkItem(t);g.visible=false;g.scale.setScalar(1.15);g.position.set(0,-.42,.12);return g});
const BN=[];[['#3b7fd0','KERTAS',0],['#e8923a','PLASTIK',1],['#7a5236','KACA',2],['#4d6a58','BIASA',3]].forEach((a,i)=>{const x=-(DW+2.4)-i*1.4,z=RZ1-.6,b=new T.Mesh(new T.CylinderGeometry(.27,.22,.7,6),mat(a[0]));b.position.set(x,.35,z);b.castShadow=true;sc.add(b);bx(sc,.6,.08,.6,'#222222',x,.7,z);cols.push({x0:x-.32,x1:x+.32,z0:z-.32,z1:z+.32});
 sign([a[1]],a[0],'#ffffff',.9,.3,22,x,1.15,RZ1-.03,Math.PI);BN.push({x,z:z-.7,bx:x,bz:z,k:a[2]})});
const SM=[[9.6,5.9],[-9.6,4.8],[.9,-3],[-LX,-5.6],[LX,-6],[-2.6,L0-.4]].map((a,i)=>{const x=a[0],z=a[1],k=[0,1,2,3].map(t=>{const g=mkItem(t),l=t==1||t==2;g.scale.setScalar(1.5);g.position.set(x,l?.11:0,z);g.rotation.set(0,rnd(0,6),l?Math.PI/2:0);g.visible=t==i%4;sc.add(g);return g});return{x,z,ty:i%4,cd:0,k}});
let carry=-1,fly=null;
function pick(s){carry=s.ty;s.k.forEach(g=>g.visible=false);s.cd=SPOT.GAP();SPG.save();HM.forEach((g,i)=>g.visible=i==carry);say('Dapat '+NM[carry].toLowerCase()+'!');tone(500,0,.08,'sine',.12)}
function throwIt(b){const H=['Kertas masuk tong biru.','Botol plastik masuk tong oren.','Botol kaca masuk tong coklat.','Bungkus gula-gula masuk tong biasa.'];
 if(b.k!=carry){say('Salah tong! '+H[carry]);tone(200,0,.3,'sawtooth',.08);return}
 SRA.bin();const c=carry;carry=-1;HM.forEach(g=>g.visible=false);const g=mkItem(c);g.scale.setScalar(1.2);sc.add(g);fly={g,t:0,x0:P.x,z0:P.z,x1:b.bx,z1:b.bz};
 say(R(['Bagus!','Pandai!','Terima kasih, kawan!']));tone(600,.2,.1,'sine',.15);tone(800,.3,.12,'sine',.15);
 cur.s[c]++;save();toast('+'+WALLET.fmt(WALLET.earn(c)),1600);if(cur.s[0]+cur.s[1]+cur.s[2]+cur.s[3]==12)award('sampah12','Pelajar Prihatin','Anda sudah membuang 12 sampah dengan betul.')}
FDS.push({m:FG.back,boxes:[[-RX-1,RX+1,0,WH,RZ0-1,RZ0]],op:1,tg:1},{m:FG.left,boxes:[[-RX-1,-RX,0,WH,RZ0-1,RZ1+1.2]],op:1,tg:1},{m:FG.right,boxes:[[RX,RX+1,0,WH,RZ0-1,RZ1+1.2]],op:1,tg:1},
 {m:FG.front,boxes:[[-RX-1,-DW,0,WH,RZ1,RZ1+1.2],[DW,RX+1,0,WH,RZ1,RZ1+1.2],[-DW,DW,2.5,WH,RZ1,RZ1+1.2]],op:1,tg:1});
/* ---- students walking between the stalls (fixed loops through the open lanes; they never block the player for long) ---- */
const WK=[],lp=(s)=>[[s*LX,LF],[s*LX,ZN],[s*WPX,ZN,2.5,s*SX,ZN],[s*LX,ZN],[s*LX,ZF],[s*WPX,ZF,2.5,s*SX,ZF],[s*LX,ZF],[s*LX,LF]];
[lp(-1),lp(1),[[0,LF],[0,RZ0+3.7,2.5,0,ZB],[0,L0],[LX,L0],[LX,LF],[0,LF]],[[-LX,LM],[LX,LM],[LX,LF],[0,LF],[-LX,LF],[-LX,LM]]].forEach((pts,k)=>{const g=npc('murid');g.visible=true;sc.add(g);const i=(k*2+1)%pts.length,p=pts[i];WK.push({g,pts,i,x:p[0],z:p[1],pz:0,bk:0,o:k*1.7,sp:1.25+k*.1,fa:null});g.position.set(p[0],0,p[1])});
function walkers(dt,t){WK.forEach(w=>{if(!w.g.visible)return;
 if(w.pz>0){w.pz-=dt;if(w.fa!=null)w.g.rotation.y=la(w.g.rotation.y,w.fa,Math.min(1,dt*8));anim(w.g,t+w.o,false);return}
 const p=w.pts[w.i],dx=p[0]-w.x,dz=p[1]-w.z,d=Math.hypot(dx,dz);
 if(d<.15){w.pz=p[2]||0;w.fa=p[2]?Math.atan2(p[3]-w.x,p[4]-w.z):null;w.i=(w.i+1)%w.pts.length;return}
 const ax=dx/d,az=dz/d,qx=P.x-w.x,qz=P.z-w.z,ahead=Math.hypot(qx,qz)<1.1&&qx*ax+qz*az>0;
 if(ahead)w.bk+=dt;else w.bk=0;
 if(ahead&&w.bk<1.2){anim(w.g,t+w.o,false);return} /* wait for the player; after 1.2 s walk on */
 w.x+=ax*w.sp*dt;w.z+=az*w.sp*dt;w.g.position.set(w.x,0,w.z);w.g.rotation.y=la(w.g.rotation.y,Math.atan2(ax,az),Math.min(1,dt*8));anim(w.g,t+w.o,true)})}
/* ---- player ---- */
const P={x:0,z:RZ1-1.8,y:0,vy:0,f:Math.PI,slow:0},cp={x:P.x,z:P.z};let gen='m',pm,cy=0,hold=0,curL=null,recorded=false,grade=null;
/* Round 15b: sampah spots are random on reachable floor (not wall, not inside a stall), away from the bins, the stalls, the vase and the door; picked item returns after SPOT.CFG.gap s somewhere else. */
const SPG=SPOT.make({SM,SS,key:'sk_smk',pool:SPOT.pool({x0:-RX+1,x1:RX-1,z0:RZ0+1,z1:RZ1-1,sx:P.x,sz:P.z,hit}),avoid:()=>{const a=[];BN.forEach(b=>a.push({x:b.x,z:b.z,r:2.4}));POS.forEach(p=>a.push({x:p[0],z:p[1],r:2.4}));a.push({x:KV.x,z:KV.z,r:1.6},{x:0,z:RZ1,r:3.5,hard:1},{x:P.x,z:P.z,r:7,hard:1});return a}});SPG.init();
function mkP(){if(pm)sc.remove(pm);pm=player(gen,'uni',curL);sc.add(pm);pm.userData.arms[1].add(...HM)}mkP();
const doneN=()=>RES.filter(Boolean).length;
/* ---- input (same controls as world.html) ---- */
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
let bt=0,bm;const bv=new T.Vector3();function say(t){const b=$('bub');b.textContent=t;b.style.display='block';bt=4;clearTimeout(bm);bm=setTimeout(()=>b.style.display='none',2200)}
function nearSt(){let b=-1,bd=2.3;ST.forEach((s,i)=>{const k=Math.hypot(P.x-s.wx,P.z-s.wz);if(k<bd){bd=k;b=i}});return b}
const nearDoor=()=>Math.hypot(P.x-EX.x,P.z-EX.z)<2.3;
const nearBin=()=>{let b=null,bd=1.3;BN.forEach(n=>{const k=Math.hypot(P.x-n.x,P.z-n.z);if(k<bd){bd=k;b=n}});return b};
const nearLit=()=>SM.find(u=>u.cd<=0&&Math.hypot(P.x-u.x,P.z-u.z)<1.1);
/* ---- stalls, games and the way out ---- */
function shut(){KG.close();document.body.classList.remove('mn');halt=false}
function talk(i){const d=KD.stalls[i],r=RES[i];if(r){say('Gerai ini sudah selesai ✔');return}
 halt=true;document.body.classList.add('mn');
 KG.show('<h3>'+d.n+'</h3><p><b>'+d.v+'</b>: Hai! '+d.t+'</p><p class="kh">Siap dalam '+d.lim+' saat tanpa kesilapan untuk bintang penuh ⭐</p><div class="rw"><button onclick="KN.go('+i+')">Mula ▶'+(STORY?' · '+WALLET.fmt(WALLET.CFG.stall[i]):'')+'</button><button class="kx" onclick="KN.shut()">Nanti dulu</button></div>')}
const PAID=[0,0,0,0,0]; /* Round 15b: Mod Kelas stall fee paid at Mula, refunded if you leave without finishing, never charged again once finished */
function onRes(i,res){if(!res||res.exit){if(PAID[i]){WALLET.add(WALLET.CFG.stall[i]);PAID[i]=0}shut();return}PAID[i]=0;RES[i]=res;drawSign(i);MK[i].visible=false;const n=doneN();$('scr').textContent='Gerai '+n+'/5';
 if(n==5){em.visible=STORY;summary()}else{shut();toast('Gerai '+KD.stalls[i].n+' siap! '+n+'/5',2400)}}
function summary(){const rs=RES,avg=rs.reduce((a,r)=>a+r.score,0)/5;let g=null;halt=true;document.body.classList.add('mn');
 if(STORY){g=gradeOf(avg);if(!recorded){recorded=true;recRoom('kantin',avg,rs.map(r=>r.score));grade={g,s:Math.round(avg)}}}
 const rows=KD.stalls.map((d,i)=>'<div class="gr1"><span>'+(i+1)+'. '+d.n+'</span><b>'+'⭐'.repeat(rs[i].stars)+'</b></div>').join('');
 KG.show('<h2>Semua gerai selesai!</h2><div class="grg">'+rows+'</div>'+(STORY?'<p>Gred Kantin: <b class="'+gcls(g)+'" style="font-size:1.6em">'+g+'</b> · '+Math.round(avg)+'/100</p>':'<p class="kh">Gred hanya dikira dalam Mod Kelas.</p>')+'<div class="rw"><button onclick="KN.leave()">Keluar kantin ▶</button><button class="kx" onclick="KN.shut()">Kekal di sini</button></div>')}
function leave(){SS.set('sk_ret',STORY&&grade?{grade:grade.g,score:grade.s}:{roam:1});KG.close();loading(()=>nav('world'))}
window.KN={go(i){if(STORY&&!PAID[i]){if(!WALLET.spend(WALLET.CFG.stall[i])){shut();toast('Duit tak cukup, buang sampah dulu!',2800);return}PAID[i]=1}KG.start(i,cur.level,r=>onRes(i,r))},shut,leave};
function act(){if(halt)return;
 if(Math.hypot(P.x-KV.x,P.z-KV.z)<1.5){vaseHit('kantin');return}
 if(carry>=0){const b=nearBin();if(b){throwIt(b);return}}else{const q=nearLit();if(q){pick(q);return}}
 const i=nearSt();if(i>=0){talk(i);return}
 if(nearDoor()){if(!STORY)leave();else if(doneN()==5)summary();else{const m=$('msg');m.textContent='Jumpa semua penjual dahulu! ('+doneN()+'/5 gerai siap)';m.style.display='block';clearTimeout(mt);mt=setTimeout(()=>m.style.display='none',2600);say('Belum boleh keluar!')}}}
/* ---- minimap ---- */
const mc=$('mm'),mg=mc.getContext('2d'),mb=document.createElement('canvas');mb.width=mb.height=320;const MS=Math.min(300/(2*RX),300/(RZ1-RZ0+3)),mf=(x,z)=>[160+x*MS,160+(z-MZ)*MS];
(()=>{const g=mb.getContext('2d');g.fillStyle='#2b2f38';g.fillRect(0,0,320,320);const a=mf(-RX,RZ0),b=mf(RX,RZ1);g.fillStyle='#a9aeb6';g.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);g.strokeStyle=WALL;g.lineWidth=5;g.strokeRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);
 g.fillStyle='#a9aeb6';const d0=mf(-DW,RZ1),d1=mf(DW,RZ1);g.fillRect(d0[0],d0[1]-4,d1[0]-d0[0],10);
 ST.forEach((s,i)=>{const th=POS[i][2],w=th==0?5.8:3.2,h=th==0?3.2:5.8,p=mf(s.x+(th>0?.45:th<0?-.45:0),s.z+(th==0?-.45:0));g.fillStyle=KD.stalls[i].c;g.fillRect(p[0]-w*MS/2,p[1]-h*MS/2,w*MS,h*MS);g.fillStyle='#fff';g.font='bold 20px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(i+1,p[0],p[1])});
 TBL.forEach(t=>{const p=mf(t[0],t[1]);g.fillStyle='#c8a26a';g.fillRect(p[0]-1.85*MS,p[1]-.75*MS,3.7*MS,1.5*MS)});
 const rcy=(g,a,b,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(a,b,r,0,7);g.fill();g.strokeStyle=g.fillStyle='#fff';g.lineWidth=r*.2;for(let k=0;k<3;k++){const s0=k*2.0944-1.2,e0=s0+1.45;g.beginPath();g.arc(a,b,r*.55,s0,e0);g.stroke();const hx=a+Math.cos(e0)*r*.55,hy=b+Math.sin(e0)*r*.55,tx=-Math.sin(e0),ty=Math.cos(e0),nx=Math.cos(e0),ny=Math.sin(e0);g.beginPath();g.moveTo(hx+tx*r*.32,hy+ty*r*.32);g.lineTo(hx+nx*r*.28,hy+ny*r*.28);g.lineTo(hx-nx*r*.28,hy-ny*r*.28);g.fill()}}; /* Round 10g: coloured round badge + white recycle symbol for the 3 recycling bins */
 BN.forEach((n,i)=>{const p=mf(n.bx,n.bz),c=['#3b7fd0','#e8923a','#7a5236','#4d6a58'][i];if(i<3)rcy(g,p[0],p[1],9,c);else{g.fillStyle=c;g.fillRect(p[0]-4,p[1]-4,8,8)}})})();
function drawMM(){mg.drawImage(mb,0,0);ST.forEach((s,i)=>{if(!RES[i])return;const p=mf(s.x+(POS[i][2]>0?.45:POS[i][2]<0?-.45:0),s.z+(POS[i][2]==0?-.45:0));mg.fillStyle='#2e9d4a';mg.beginPath();mg.arc(p[0],p[1],11,0,7);mg.fill();mg.fillStyle='#fff';mg.font='bold 16px sans-serif';mg.textAlign='center';mg.textBaseline='middle';mg.fillText('✓',p[0],p[1]+1)});
 const e=mf(EX.x,RZ1-.2);mg.fillStyle=doneN()==5?'#5ccf4a':'#ffd23f';mg.beginPath();mg.arc(e[0],e[1],8,0,7);mg.fill();
 const a=mf(P.x,P.z),s=Math.sin(P.f),c=Math.cos(P.f);mg.fillStyle='#2f6fd0';mg.strokeStyle='#fff';mg.lineWidth=3;mg.beginPath();mg.moveTo(a[0]+s*14,a[1]+c*14);mg.lineTo(a[0]-s*8+c*8,a[1]-c*8-s*8);mg.lineTo(a[0]-s*8-c*8,a[1]-c*8+s*8);mg.closePath();mg.fill();mg.stroke()}
/* ---- pause, Android back (same behaviour as world.html), graphics ---- */
function pause(){halt=true;$('menu').classList.add('pz');$('menu').style.display='flex';document.body.classList.add('mn');view('vp')}
$('pS').onclick=()=>{$('menu').style.display='none';halt=false;document.body.classList.remove('mn')};$('pH').onclick=()=>{frm='vp';view('vh')};$('pT').onclick=()=>{frm='vp';applySet();view('vt')};$('pQ').onclick=()=>{SS.del('sk_day');SS.del('sk_ret');nav('index')};
(function(){if(SR_IFR)return;let on=0;const E=['pointerdown','keydown','touchend'],arm=()=>{if(on)return;on=1;backKeep();E.forEach(e=>removeEventListener(e,arm,true))};E.forEach(e=>addEventListener(e,arm,true));
addEventListener('popstate',()=>{if(!on||!SR_TRAP)return;backKeep();const ld=$('ld');if(ld&&ld.style.display!='none')return;
if(KG.open()){shut();return} /* back closes a mini game or card first */
const m=$('menu');if(m.style.display=='flex'){const vp=$('vp');if(vp&&!vp.hidden)$('pS').click();else view('vp')}else pause()})})();
window.gfxHook=()=>{ren.shadowMap.enabled=!SET.lo;dl.castShadow=!SET.lo;ren.setPixelRatio(SET.lo?1:Math.min(devicePixelRatio,2));WK.forEach((w,i)=>w.g.visible=!(SET.lo&&i>1)); /* low graphics: 2 walkers instead of 4 */ fit();sc.traverse(o=>{if(o.material)o.material.needsUpdate=true})};
/* ---- see-through: a wall or stall that is between the camera and the player fades to 25% ---- */
const CAMP={x:0,y:6,z:0},FADE=.25;
function segBox(C,Q,b){let t0=0,t1=1;const d=[Q.x-C.x,Q.y-C.y,Q.z-C.z],o=[C.x,C.y,C.z];
 for(let i=0;i<3;i++){const lo=b[i*2]-.12,hi=b[i*2+1]+.12;if(Math.abs(d[i])<1e-6){if(o[i]<lo||o[i]>hi)return false}else{let a=(lo-o[i])/d[i],c=(hi-o[i])/d[i];if(a>c){const k=a;a=c;c=k}t0=Math.max(t0,a);t1=Math.min(t1,c);if(t0>t1)return false}}return true}
function fades(dt){const Q={x:P.x,y:P.y+1.1,z:P.z};FDS.forEach(f=>{f.tg=f.boxes.some(b=>segBox(CAMP,Q,b))?FADE:1;if(f.op===f.tg)return;
 const k=SET.lo?1:Math.min(1,dt*10);f.op=Math.abs(f.tg-f.op)<.01?f.tg:f.op+(f.tg-f.op)*k;const tr=f.op<.995;
 f.m.forEach(m=>{const mt=m.material;mt.opacity=f.op;if(mt.transparent!==tr){mt.transparent=tr;mt.needsUpdate=true}})})}
/* ---- main loop ---- */
const CM=[6*CAMD,1.2,.85,.6,.9],HI=KD.hi;let last=0;
function loop(ts){requestAnimationFrame(loop);const dt=Math.min((ts-last)/1000||0,.05),t=ts/1000;last=ts;
 if(halt){keys.KeyW=keys.KeyA=keys.KeyS=keys.KeyD=keys.ArrowUp=keys.ArrowDown=keys.ArrowLeft=keys.ArrowRight=keys.Space=0;jv.x=jv.z=0;jmp=0}
 let ix=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+jv.x,iz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+jv.z;const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}
 const mv=l>.12&&!halt;
 const ox=P.x,oz=P.z;let want=0;if(mv){const m=camMap(cy,ix,iz,true,od||hold>0),mx=m[0],mz=m[1],spd=P.slow>0?2.4:5,dx=mx*spd*dt,dz=mz*spd*dt;want=Math.hypot(dx,dz);if(!hit(P.x+dx,P.z,.35))P.x+=dx;if(!hit(P.x,P.z+dz,.35))P.z+=dz;P.f=la(P.f,Math.atan2(mx,mz),Math.min(1,dt*14))}else camMap(cy,0,0,false,false);
 P.x=Math.max(-RX+.4,Math.min(RX-.4,P.x));P.z=Math.max(RZ0+.4,Math.min(RZ1-.4,P.z)); /* never outside the room */
 cy=camStep(cy,dt,mv,mv&&Math.hypot(P.x-ox,P.z-oz)<CAMC.block*want,P.f,hold);hold-=dt; /* camera: see camStep in core.js; blocked = stick held but (almost) not moving */
 if((keys.Space||jmp)&&P.y<=0)P.vy=6.8;P.vy-=22*dt;P.y+=P.vy*dt;if(P.y<=0){P.y=0;P.vy=0}
 pm.position.set(P.x,P.y,P.z);pm.rotation.y=P.f;anim(pm,t,mv&&P.y==0);if(carry>=0)pm.userData.arms[1].rotation.x=-.9;
 P.slow-=dt;BAG.tick(dt,1);BAG.sync(P.slow);SM.forEach(s=>{if(s.cd>0){s.cd-=dt;if(s.cd<=0)SPG.respawn(s);return}if(P.slow<=0&&P.y<.5&&Math.hypot(P.x-s.x,P.z-s.z)<.45){P.slow=1.2;say('Ish, sampah!')}});
 if(fly){fly.t+=dt/.5;const u=Math.min(fly.t,1);fly.g.position.set(fly.x0+(fly.x1-fly.x0)*u,1.3-.6*u+Math.sin(Math.PI*u)*.9,fly.z0+(fly.z1-fly.z0)*u);if(fly.t>=1){sc.remove(fly.g);fly=null}}
 walkers(dt,t);
 const D=CM[0]*(cam.aspect<1?1.15:1);cp.x+=(P.x-cp.x)*Math.min(1,dt*10);cp.z+=(P.z-cp.z)*Math.min(1,dt*10);const sx=Math.sin(cy),sz=Math.cos(cy);
 const cc=camClamp(cp.x,cp.z,sx,sz,D,KCR);CAMP.x=cc[0];CAMP.y=CM[1]+D*CM[2];CAMP.z=cc[1]; /* Round 14: camera stays inside the Kantin */cam.position.set(CAMP.x,CAMP.y,CAMP.z);cam.lookAt(cp.x-sx*CM[3],CM[4],cp.z-sz*CM[3]);dl.position.set(cp.x+6,14,cp.z+8);dl.target.position.set(cp.x,0,cp.z);
 fades(dt);
 MK.forEach((m,i)=>{if(m.visible)m.position.set(ST[i].x,4.6+Math.abs(Math.sin(t*3))*.3,ST[i].z)});if(em.visible)em.position.set(EX.x,3.7+Math.abs(Math.sin(t*3))*.3,EX.z);
 bt-=dt;const cw=cv.clientWidth,ch=cv.clientHeight,bb=$('bub');if(bb.style.display=='block'){bv.set(P.x,P.y+2.3,P.z).project(cam);bb.style.left=(bv.x*.5+.5)*cw+'px';bb.style.top=(-bv.y*.5+.5)*ch+'px'}
 ST.forEach((s,i)=>{const near=!halt&&Math.hypot(P.x-s.x,P.z-s.z)<6.5;if(near){if(!s.line)s.line=RES[i]?'Terima kasih!':R(HI);bv.set(s.x,3.1,s.z).project(cam);s.sb.textContent=s.line;s.sb.style.left=(bv.x*.5+.5)*cw+'px';s.sb.style.top=(-bv.y*.5+.5)*ch+'px';s.sb.style.display='block'}else{s.line=null;s.sb.style.display='none'}});
 const ns=nearSt(),h=$('hint'),pe=document.body.classList.contains('touch')?'Tekan E':'E',bn=carry>=0&&nearBin(),sn=carry<0&&nearLit();
 if(halt)h.style.display='none';else if(bn){h.textContent=pe+' · Buang sampah';h.style.display='block'}else if(sn){h.textContent=pe+' · Ambil sampah';h.style.display='block'}else if(ns>=0){h.textContent=RES[ns]?'Gerai '+(ns+1)+' sudah selesai ✔':pe+' · Cakap dengan '+KD.stalls[ns].v;h.style.display='block'}else if(nearDoor()){h.textContent=pe+(!STORY||doneN()==5?' · Keluar kantin':' · Pintu keluar ('+doneN()+'/5 gerai)');h.style.display='block'}else h.style.display='none';
 drawMM();ren.render(sc,cam)}requestAnimationFrame(loop);
/* ---- start ---- */
function boot(){const k=LS.get('sk_cur',null);if(!OKGO||!k||!PF[k]){SS.del('sk_day');SS.del('sk_ret');nav('index');return}
 cur=PF[k];P.slow=BAG.slow0();BAG.onCure=()=>{P.slow=0};gen=cur.gen||'m';curL=cur.L||null;mkP();applySet();/* Round 15: the MOD line is written by js/hud.js */
 loading(()=>{document.body.classList.remove('mn');halt=false;toast(STORY?'Waktu rehat! Jumpa semua penjual.':'Jom jumpa semua penjual.',2600)})}
boot();
