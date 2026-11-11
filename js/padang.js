/* Padang Balapan (Round 9; 9b layout; 9c one-way track, speed boost, joggers, futsal lines). An open field with an oval track, 3 stations (stand on a painted start line, E), a vertical long jump venue outside the track, props,
   and stray balls to push into the goals. Each station opens one PJ mini game (js/padang-games.js) in a 2.5D side view: the camera glides
   from the walking camera to a low side camera and back. Same hand-off as the Kantin: only reachable from world.html (sk_go token).
   Mod Kelas: all 3 stations must be finished before the gate works, the grade (average) is saved as the PJ grade with recRoom('pj',...).
   Mod Jalan-jalan: free to leave any time, stations can be replayed, nothing is graded. The goals are just for fun (hidden badge "Penjaring"). */
/* ======== TUNING: change these numbers to adjust the feel ======== */
const CAMW={d:5.4,h:1.2,k:.85,la:.6,ly:.9};          /* walking camera: distance, height, extra height per distance, look ahead, look height (same feel as the Kantin) */
const CAMSIDE={dz:8,h:1.7,ahead:4.5,lookH:1.1,follow:8}; /* 2.5D side view: distance from the middle lane, camera height, how far ahead of the runner the view is centred, look height, follow speed */
const GLIDE=1.0;                                      /* seconds for the camera to glide between the field and the side view */
const BALL={r:.3,touch:.7,min:2.2,mul:1.6,max:12,fr:1.5,n:2}; /* stray ball: radius, touch distance, weakest push, push per walking speed, top speed, rolling friction, how many balls */
const GOAL5=5;                                        /* goals needed for the hidden badge */
const BOOST={k:.4,ease:6,anim:.6,wind:26};            /* walking on the red track: extra speed (.4 = +40%), how fast it eases in/out, faster run animation, wind streaks per second at full boost */
const JOG={v:[2.6,3.3,4.0,3.0,4.6],lane:[.15,.45,.8,.3,.65]}; /* students jogging on the track: speeds (units per second) and lane (0 = inner edge, 1 = outer edge), one student per entry */
/* ================================================================== */
const OKGO=!!SS.get('sk_go');SS.del('sk_go');
const STORY=LS.get('sk_mode','roam')=='story';
const ren=new T.WebGLRenderer({canvas:$('cv'),antialias:true}),cv=$('cv');ren.shadowMap.enabled=true;ren.setPixelRatio(Math.min(devicePixelRatio,2));
const sc=new T.Scene();sc.background=new T.Color('#bfe3f5');sc.fog=new T.Fog('#bfe3f5',70,140);const cam=new T.PerspectiveCamera(55,1,.5,150);
sc.add(new T.HemisphereLight(0xffffff,0x9aa7b8,.95));
const dl=new T.DirectionalLight(0xffffff,.55);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);Object.assign(dl.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:50});sc.add(dl,dl.target);
/* ---- layout: track = stadium shape (straights 2*SL long, inner radius RI, lane width LW) ---- */
const SL=14,RI=8,LW=5,RO=RI+LW,BX0=-31,BX1=42,BZ0=-19,BZ1=19,EX={x:0,z:BZ1-1.1};
const VX=36,VZ0=-13.5,VB=5.5,JV=PD.g[2],PIT0=VB+JV.rz+1.2,PITL=6.4; /* long jump venue: runway centre x, runway start z, board z (north to south), pit start and length */
const cols=[],hit=(x,z,r)=>cols.some(c=>x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1);
const colBox=(x,z,hx,hz)=>cols.push({x0:x-hx,x1:x+hx,z0:z-hz,z1:z+hz});
function flat(geo,c,y){const m=new T.Mesh(geo,mat(c));m.rotation.x=-Math.PI/2;m.position.y=y;m.receiveShadow=true;sc.add(m);return m}
flat(new T.PlaneGeometry(800,800),'#8fc27a',-.02);
function band(r0,r1,c,y){const add=(g,x,z)=>{const m=flat(g,c,y);m.position.x=x;m.position.z=z},P2=Math.PI;
 if(r0<=0){add(new T.PlaneGeometry(2*SL,2*r1),0,0);add(new T.CircleGeometry(r1,32,-P2/2,P2),SL,0);add(new T.CircleGeometry(r1,32,P2/2,P2),-SL,0)}
 else{const w=r1-r0,m=(r0+r1)/2;add(new T.PlaneGeometry(2*SL,w),0,-m);add(new T.PlaneGeometry(2*SL,w),0,m);add(new T.RingGeometry(r0,r1,32,1,-P2/2,P2),SL,0);add(new T.RingGeometry(r0,r1,32,1,P2/2,P2),-SL,0)}}
band(0,RI,'#79c06a',.01);band(RI,RO,'#c9633f',.02);[RI,RI+LW/3,RI+2*LW/3,RO].forEach(r=>band(r-.06,r+.06,'#ffffff',.03));
{const m=flat(new T.PlaneGeometry(.35,LW),'#ffffff',.035);m.position.set(0,.035,(RI+RO)/2)}
function pn(w,h,c,x,y,z,ry){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c}));m.position.set(x,y,z);m.rotation.y=ry;sc.add(m);return m}
function sign(L,bg,fg,w,h,fs,x,y,z,r){const c=document.createElement('canvas');c.width=256;c.height=Math.round(256*h/w);const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,256,c.height);g.fillStyle=fg;g.font='bold '+fs+'px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';L.forEach((s,i)=>g.fillText(s,128,c.height*(i+1)/(L.length+1)));
 const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));m.position.set(x,y,z);m.rotation.y=r;sc.add(m);return m}
/* ---- fence (looks only; the walking area is clamped), gate at the bottom ---- */
(function(){const cx=(BX0+BX1)/2,wx=BX1-BX0,cz=(BZ0+BZ1)/2,wz=BZ1-BZ0,rail=(w,d,x,z)=>{bx(sc,w,.1,d,'#ffffff',x,.9,z);bx(sc,w,.1,d,'#ffffff',x,.5,z)},G=3.5;
 rail(wx,.1,cx,BZ0-.2);rail(.1,wz,BX0-.2,cz);rail(.1,wz,BX1+.2,cz);rail(-G-BX0,.1,(BX0-G)/2,BZ1+.2);rail(BX1-G,.1,(BX1+G)/2,BZ1+.2);
 for(let x=BX0;x<=BX1;x+=8)bx(sc,.16,1.1,.16,'#2f6fd0',x,.55,BZ0-.2);for(let z=BZ0;z<=BZ1;z+=8){bx(sc,.16,1.1,.16,'#2f6fd0',BX0-.2,.55,z);bx(sc,.16,1.1,.16,'#2f6fd0',BX1+.2,.55,z)}
 for(let x=BX0;x<-G;x+=8)bx(sc,.16,1.1,.16,'#2f6fd0',x,.55,BZ1+.2);for(let x=8;x<=BX1;x+=8)bx(sc,.16,1.1,.16,'#2f6fd0',x,.55,BZ1+.2);
 [-1,1].forEach(s=>bx(sc,.4,2.8,.4,'#2f6fd0',s*G,1.4,BZ1+.2));bx(sc,2*G+.4,.5,.3,'#2f6fd0',0,2.75,BZ1+.2);
 sign(['PINTU KELUAR'],'#1c2f6b','#ffffff',2.6,.6,30,0,3.4,BZ1+.02,Math.PI)})();
/* ---- trees (far away outside the fence, just for depth) ---- */
const TRG=[new T.CylinderGeometry(.18,.24,1.2,5),new T.ConeGeometry(1.2,2.2,6),new T.ConeGeometry(.9,1.8,6)],TRM=[mat('#7a5236'),mat('#3f9d54'),mat('#4aae5f')],LOWH=[];
function mkTree(p,x,z,s){const g=new T.Group();[[0,.6,0],[1,2.1,0],[2,3.3,0]].forEach(a=>{const m=new T.Mesh(TRG[a[0]],TRM[a[0]]);m.position.set(0,a[1],0);m.castShadow=false;g.add(m)});g.position.set(x,0,z);g.scale.setScalar(s||1);p.add(g);return g}
for(let x=-44;x<=56;x+=8){[-30,-36].forEach((z,k)=>LOWH.push(mkTree(sc,x+k*4,z,1+((x+99)%5)*.08)));if(x<-8||x>8)LOWH.push(mkTree(sc,x+2,31+(x%3),1+((x+50)%4)*.1))}
[-42,-37].forEach(x=>{for(let z=-24;z<=24;z+=8)LOWH.push(mkTree(sc,x,z,1.1))});[48,53].forEach(x=>{for(let z=-24;z<=24;z+=8)LOWH.push(mkTree(sc,x,z,1.1))});
/* ---- goals: football goals at both ends of the green infield ---- */
const GL=[];
function goal(s){const f=s*19.4,b=s*21.2,m=(f+b)/2,net=o=>{o.material.transparent=true;o.material.opacity=.4;return o};
 [-1,1].forEach(k=>{bx(sc,.14,2,.14,'#ffffff',f,1,k*2.2);colBox(f,k*2.2,.14,.14);net(bx(sc,Math.abs(b-f),1.9,.06,'#e8eef5',m,.95,k*2.2));colBox(m,k*2.2,Math.abs(b-f)/2,.1)});
 bx(sc,.14,.14,4.5,'#ffffff',f,2,0);net(bx(sc,.06,1.9,4.5,'#e8eef5',b,.95,0));colBox(b,0,.1,2.3);GL.push({s,f,b})}
goal(-1);goal(1);
/* ---- futsal pitch lines painted on the infield between the goals (the goal line is the front of each goal) ---- */
(function(){const PX=19.4,PZ=5.4,GZ=2.2,R=3.1,LT=.06,Y=.04,M=paintMat('#ffffff'),P2=Math.PI;
 const put=(g,x,z)=>{const m=new T.Mesh(g,M);m.rotation.x=-P2/2;m.position.set(x,Y,z);sc.add(m)};
 const hl=(x1,x2,z)=>put(new T.PlaneGeometry(x2-x1,LT*2),(x1+x2)/2,z),vl=(z1,z2,x)=>put(new T.PlaneGeometry(LT*2,z2-z1),x,(z1+z2)/2);
 const arc=(cx,cz,r,a0,len)=>put(new T.RingGeometry(r-LT,r+LT,28,1,a0,len),cx,cz),dot=(x,z)=>put(new T.CircleGeometry(.16,12),x,z);
 hl(-PX,PX,-PZ);hl(-PX,PX,PZ);vl(-PZ,PZ,-PX);vl(-PZ,PZ,PX);vl(-PZ,PZ,0);arc(0,0,3,0,2*P2);dot(0,0);
 [1,-1].forEach(sd=>{const gx=sd*PX;vl(-GZ,GZ,sd*(PX-R));dot(sd*(PX-R),0);dot(sd*(PX-R-3.2),0);
  arc(gx,GZ,R,sd>0?P2:1.5*P2,P2/2);arc(gx,-GZ,R,sd>0?P2/2:0,P2/2);
  arc(gx,PZ,.7,sd>0?P2/2:0,P2/2);arc(gx,-PZ,.7,sd>0?P2:1.5*P2,P2/2)})})();
/* ---- benches, cheering squad, cones ---- */
const CHEER=[];
function bench(x,z,ry,sit){bx(sc,2.2,.08,.5,'#a9744a',x,.46,z);bx(sc,2.2,.5,.07,'#a9744a',x,.8,z-Math.cos(ry)*.27);[-1,1].forEach(a=>bx(sc,.1,.42,.1,'#5a5f69',x+a*.95,.21,z));colBox(x,z,1.15,.4);
 (sit||[]).forEach(a=>{const m=npc('murid');m.position.set(x+a,.04,z);m.rotation.y=ry;m.userData.legs.forEach(l=>l.rotation.x=-Math.PI/2);sc.add(m);LOWH.push(m)})}
[[-15,[-.5]],[-7,[.4]],[1,[-.4,.5]]].forEach(a=>bench(a[0],-16.4,0,a[1]));
const PV={x:3.1,z:-16.4};mkVase(sc,PV.x,PV.z);colBox(PV.x,PV.z,.4,.4); /* Round 10b3: easter egg vase beside the bench nearest the Lari Berpagar station, silent (vaseHit in core.js) */[[8,[0]],[18,[0]]].forEach(a=>bench(a[0],16.6,Math.PI,a[1]));
[[-18,-17.9],[-10,-18],[-2,-17.9],[5,-18],[24,16.9]].forEach((a,i)=>{const m=npc('murid');m.position.set(a[0],0,a[1]);m.rotation.y=a[1]<0?0:Math.PI;sc.add(m);CHEER.push({m,ph:i*1.3});if(i%2)LOWH.push(m)});
{const cg=new T.ConeGeometry(.22,.5,6),cm=mat('#ff7a1a'),cone=(x,z)=>{const m=new T.Mesh(cg,cm);m.position.set(x,.25,z);sc.add(m)};
 [-12,-6,0,6,12].forEach(x=>{cone(x,-(RI-.5));cone(x,RI-.5)});[-1,1].forEach(s=>{cone(VX+s*1.9,VZ0-.6);cone(VX+s*1.9,VZ0+1.6)})}
/* ---- painted start boxes: thick start line at the back (stand here), START + event name painted ahead of it, thin closing line.
   dir 'x' = runs along +x, '-x' = along -x, 'z' = along +z. The track is one way, counter-clockwise (like a real track): bottom straight to the right, top straight to the left. Text is painted so it reads for a runner facing the run direction (START ahead = upper line). ---- */
function paintMat(c){return new T.MeshBasicMaterial({color:c,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})}
function startBox(x,z,dir,W,n2,len){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=dir=='z'?-Math.PI/2:dir=='-x'?Math.PI:0;sc.add(g);
 const strip=(w,lx,c)=>{const m=new T.Mesh(new T.PlaneGeometry(w,W),paintMat(c));m.rotation.x=-Math.PI/2;m.position.set(lx,.045,0);g.add(m)};
 strip(.35,.175,'#ffffff');strip(.15,len,'#ffffff');
 const tl=len-.7,cn=document.createElement('canvas');cn.width=W>3?512:256;cn.height=Math.round(cn.width*tl/W);const c2=cn.getContext('2d');c2.fillStyle='#ffffff';c2.textAlign='center';c2.textBaseline='middle';
 c2.font='bold '+Math.round(cn.width*.19)+'px Fredoka,sans-serif';c2.fillText('START',cn.width/2,cn.height*.3);c2.font='bold '+Math.round(cn.width*(n2.length>11?.095:.115))+'px Fredoka,sans-serif';c2.fillText(n2,cn.width/2,cn.height*.72);
 const tg=new T.Group();tg.rotation.y=-Math.PI/2;tg.position.set(.5+tl/2,.05,0);g.add(tg);
 const t=new T.Mesh(new T.PlaneGeometry(W,tl),new T.MeshBasicMaterial({map:new T.CanvasTexture(cn),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));t.rotation.x=-Math.PI/2;tg.add(t)}
startBox(12.4,-(RI+RO)/2,'-x',LW,'LARI BERPAGAR',3.4);startBox(-12.4,(RI+RO)/2,'x',LW,'100M PECUT',3.4);
/* ---- long jump venue (vertical, outside the track to the right): runway runs north to south: start line, green zone, board, red zone, sand pit.
   The sand and its wooden frame are separate boards (no overlapping tops), so the sand does not flicker. ---- */
(function(){const J=JV,w=2.4,zE=PIT0+PITL+.9;bx(sc,w,.05,VB+1-VZ0,'#d2694a',VX,0,(VZ0+VB+1)/2);bx(sc,w,.03,J.gz,'#4ccf5a',VX,.035,VB-J.gz/2);bx(sc,w,.03,J.rz,'#e04a4a',VX,.035,VB+J.rz/2);bx(sc,w,.1,.3,'#ffffff',VX,.05,VB);
 const pm=PIT0+PITL/2;bx(sc,2.8,.08,PITL,'#ead08a',VX,.04,pm);[-1,1].forEach(k=>bx(sc,.1,.14,PITL+.4,'#a67c52',VX+k*1.45,.07,pm));bx(sc,2.8,.14,.1,'#a67c52',VX,.07,PIT0-.05);bx(sc,2.8,.14,.1,'#a67c52',VX,.07,PIT0+PITL+.05);
 [-1,1].forEach(k=>bx(sc,.12,.04,zE-VZ0+1.4,'#ffffff',VX+k*2.3,.02,(VZ0-.7+zE)/2));bx(sc,4.72,.04,.12,'#ffffff',VX,.02,VZ0-.7);bx(sc,4.72,.04,.12,'#ffffff',VX,.02,zE);
 startBox(VX,VZ0,'z',w,'LOMPAT JAUH',3.2)})();
/* ---- stations: signs ---- */
const RES=[null,null,null],STN=[],MK=[],SGN=[],SD=[[-10.8,14.6,Math.PI,-12.4,(RI+RO)/2],[10.8,-14.6,0,12.4,-(RI+RO)/2],[VX-3.4,VZ0+.9,Math.PI/2,VX,VZ0+.4]]; /* sign x,z,rotation, stand point on the start line (E here); order = games: 100m (bottom straight), pagar (top straight), lompat jauh */
const mkMark=c=>{const m=new T.Mesh(new T.ConeGeometry(.35,.7,4),mat(c));m.rotation.x=Math.PI;sc.add(m);return m};
function drawSign(i){const s=SGN[i],g=s.cv.getContext('2d'),d=PD.g[i],r=RES[i];g.fillStyle=d.c;g.fillRect(0,0,512,128);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font='bold 52px Fredoka,sans-serif';g.fillText(d.s,256,r?36:44);
 g.font=r?'34px sans-serif':'bold 28px Fredoka,sans-serif';g.fillText(r?'⭐'.repeat(r.stars)+'☆'.repeat(3-r.stars)+'  ✔':(i+1)+'. '+d.sub,256,98);s.tex.needsUpdate=true}
PD.g.forEach((d,i)=>{const a=SD[i],g=new T.Group(),sw=Math.abs(Math.sin(a[2]))>.5;g.position.set(a[0],0,a[1]);g.rotation.y=a[2];sc.add(g);
 [-1.7,1.7].forEach(x=>bx(g,.12,2.7,.12,'#666666',x,1.35,0));const cn=document.createElement('canvas');cn.width=512;cn.height=128;const tex=new T.CanvasTexture(cn),bd=new T.Mesh(new T.PlaneGeometry(3.8,.95),new T.MeshBasicMaterial({map:tex}));bd.position.set(0,2.7,.05);g.add(bd);
 bx(g,3.9,1.05,.08,'#ffffff',0,2.7,-.03);SGN.push({cv:cn,tex});colBox(a[0],a[1],sw?.2:1.85,sw?1.85:.2);STN.push({x:a[0],z:a[1],wx:a[3],wz:a[4]});drawSign(i);MK.push(mkMark('#ffd23f'))});
const em=mkMark('#5ccf4a');em.visible=false;
/* ---- stray balls ---- */
const BL=[],bgeo=new T.IcosahedronGeometry(BALL.r,1),bmat=mat('#ffffff'),bwire=new T.MeshBasicMaterial({color:'#222222',wireframe:true});
function spawn(b){for(let k=0;k<20;k++){b.x=rnd(-12,12);b.z=rnd(-4.5,4.5);if(Math.hypot(b.x-P.x,b.z-P.z)>4&&!hit(b.x,b.z,BALL.r))break}b.vx=b.vz=0;b.cd=0;b.m.position.set(b.x,BALL.r,b.z)}
/* ---- player ---- */
const P={x:0,z:BZ1-1.8,y:0,vy:0,f:Math.PI},cp={x:P.x,z:P.z};let gen='m',pm,cy=0,hold=0,curL=null,recorded=false,grade=null;
function mkP(){if(pm)sc.remove(pm);pm=player(gen,'pe',curL);sc.add(pm)}mkP();
for(let i=0;i<BALL.n;i++){const m=new T.Mesh(bgeo,bmat),w=new T.Mesh(bgeo,bwire);w.scale.setScalar(1.02);m.add(w);m.castShadow=true;sc.add(m);BL.push({m,x:0,z:0,vx:0,vz:0,cd:0});spawn(BL[i])}
const doneN=()=>RES.filter(Boolean).length;
/* ---- track: the red ring around the infield. Walking on it = automatic speed boost with wind streaks ---- */
function onTrack(x,z){const r=Math.hypot(Math.max(0,Math.abs(x)-SL),z);return r>=RI&&r<=RO}
const WIND=[],WGEO=new T.BoxGeometry(1,.03,.03);let boost=0,aph=0,wacc=0;
for(let i=0;i<14;i++){const m=new T.Mesh(WGEO,new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false}));m.visible=false;sc.add(m);WIND.push({m,life:0,max:.5})}
function wind(dt){const hx=Math.sin(P.f),hz=Math.cos(P.f),lim=SET.lo?5:WIND.length;
 if(mode=='walk'&&boost>.35){wacc+=dt*BOOST.wind*boost;while(wacc>=1){wacc-=1;const w=WIND.slice(0,lim).find(q=>q.life<=0);if(!w)break;const sd=rnd(-.9,.9),bk=rnd(.5,1.6);
  w.life=w.max=rnd(.35,.55);w.m.position.set(P.x-hx*bk+hz*sd,rnd(.25,1.7),P.z-hz*bk-hx*sd);w.m.rotation.y=Math.atan2(-hz,hx);w.m.scale.x=.5+.9*boost;w.m.visible=true}}
 WIND.forEach(w=>{if(w.life<=0)return;w.life-=dt;if(w.life<=0){w.m.visible=false;return}w.m.material.opacity=.6*(w.life/w.max)})}
/* ---- joggers: students running laps counter-clockwise (bottom straight to the right, up the right curve, top straight to the left, down the left curve). Not solid. ---- */
const JOGR=JOG.v.map((v,i)=>{const r=RI+LW*JOG.lane[i],m=npc('murid'),Lp=4*SL+2*Math.PI*r;sc.add(m);if(i%2)LOWH.push(m);return{m,v,r,Lp,s:rnd(0,Lp),o:rnd(0,6)}});
function jogPos(j){const s=j.s,r=j.r,A=2*SL,C=Math.PI*r;let x,z,hx,hz,f;
 if(s<A){x=-SL+s;z=r;hx=1;hz=0}
 else if(s<A+C){f=(s-A)/r;x=SL+r*Math.sin(f);z=r*Math.cos(f);hx=Math.cos(f);hz=-Math.sin(f)}
 else if(s<2*A+C){x=SL-(s-A-C);z=-r;hx=-1;hz=0}
 else{f=(s-2*A-C)/r;x=-SL-r*Math.sin(f);z=-r*Math.cos(f);hx=-Math.cos(f);hz=Math.sin(f)}
 j.m.position.set(x,0,z);j.m.rotation.y=Math.atan2(hx,hz)}
JOGR.forEach(jogPos);
function joggers(dt,t){JOGR.forEach(j=>{if(!j.m.visible)return;j.s=(j.s+j.v*dt)%j.Lp;jogPos(j);anim(j.m,t*1.6+j.o,true)})}
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
function nearSt(){let b=-1,bd=3;STN.forEach((s,i)=>{const k=Math.hypot(P.x-s.wx,P.z-s.wz);if(k<bd){bd=k;b=i}});return b}
const nearDoor=()=>Math.hypot(P.x-EX.x,P.z-EX.z)<2.3;
/* ---- cards (same look as the Kantin cards) ---- */
const kov=document.createElement('div');kov.id='kov';document.body.appendChild(kov);let cardBack=null;
function card(h,back){kov.innerHTML='<div class="kcd">'+h+'</div>';kov.style.display='flex';cardBack=back||null}
function closeCard(){kov.style.display='none';kov.innerHTML='';cardBack=null}
/* ---- stations, games and the way out ---- */
let mode='walk',gt=0,gFrom=null,swapped=0,afterOut=null,ssx=0,lastLook=[0,.9,0],curI=-1,lastRes=null;
function shut(){closeCard();document.body.classList.remove('mn');halt=false}
function talk(i){const d=PD.g[i];if(RES[i]&&STORY){say('Stesen ini sudah selesai ✔');return}
 halt=true;document.body.classList.add('mn');
 card('<h3>'+d.n+'</h3><p>'+d.t+'</p><p class="kh">'+d.kh+'</p><div class="rw"><button onclick="PN.go('+i+')">Mula ▶</button><button class="kx" onclick="PN.shut()">Nanti dulu</button></div>',shut)}
/* camera: walkCam() follows the player, sideCam() follows the runner on the stage; a glide blends between them */
const ASP=()=>cam.aspect<1?1.25:1;
const PCR=[camRect([BX0,BX1,BZ0,BZ1],.3)]; /* Round 14: walking camera stays inside the fence */
function walkCam(){const D=CAMW.d*(cam.aspect<1?1.15:1),sx=Math.sin(cy),sz=Math.cos(cy),cc=camClamp(cp.x,cp.z,sx,sz,D,PCR);return{p:[cc[0],CAMW.h+D*CAMW.k,cc[1]],l:[cp.x-sx*CAMW.la,CAMW.ly,cp.z-sz*CAMW.la]}}
function sideCam(){const x=ssx+CAMSIDE.ahead;return{p:[x,CAMSIDE.h,PG.z+CAMSIDE.dz*ASP()],l:[x,CAMSIDE.lookH,PG.z]}}
function setCam(c){cam.position.set(c.p[0],c.p[1],c.p[2]);cam.lookAt(c.l[0],c.l[1],c.l[2]);lastLook=c.l}
function startGlide(m){mode=m;gt=0;swapped=0;gFrom={p:cam.position.toArray(),l:lastLook.slice()}}
function stageIn(i){curI=i;halt=true;closeCard();document.body.classList.add('mn');ssx=0;PG.show();startGlide('in')}
function stageOut(fn){afterOut=fn||null;document.body.classList.remove('sg');document.body.classList.add('mn');cp.x=P.x;cp.z=P.z;cy=P.f+Math.PI;startGlide('out')}
function swapModel(){swapped=1;
 if(mode=='in'){pm.position.set(0,0,PG.z);pm.rotation.y=Math.PI/2;PG.snap=1}
 else{PG.end();pm.position.set(P.x,P.y,P.z);pm.rotation.y=P.f;pm.userData.B.rotation.x=0;anim(pm,0,false)}}
function onRes(i,res){if(!res||res.exit){stageOut(shut);return}
 PG.snd.star(res.stars);lastRes=res;
 card('<h2>'+'⭐'.repeat(res.stars)+'☆'.repeat(3-res.stars)+'</h2><p>'+res.txt+'</p><p class="kh">'+res.tip+'</p><div class="rw"><button onclick="PN.ok('+i+')">Teruskan ▶</button>'+(STORY?'':'<button class="kx" onclick="PN.again('+i+')">Main lagi</button>')+'</div>')}
function done(i){RES[i]=lastRes;drawSign(i);MK[i].visible=false;const n=doneN();$('scr').textContent='Stesen '+n+'/3';closeCard();
 stageOut(()=>{if(n==3){em.visible=STORY;summary()}else{shut();toast('Stesen '+PD.g[i].sub+' siap! '+n+'/3',2400)}})}
function summary(){const rs=RES,avg=rs.reduce((a,r)=>a+r.score,0)/3;let g=null;halt=true;document.body.classList.add('mn');
 if(STORY){g=gradeOf(avg);if(!recorded){recorded=true;recRoom('pj',avg,rs.map(r=>r.score));grade={g,s:Math.round(avg)}}}
 const rows=PD.g.map((d,i)=>'<div class="gr1"><span>'+(i+1)+'. '+d.n+'<small>'+rs[i].sum+'</small></span><b>'+'⭐'.repeat(rs[i].stars)+'</b></div>').join('');
 card('<h2>Semua stesen selesai!</h2><div class="grg">'+rows+'</div>'+(STORY?'<p>Gred Pendidikan Jasmani: <b class="'+gcls(g)+'" style="font-size:1.6em">'+g+'</b> · '+Math.round(avg)+'/100</p>':'<p class="kh">Gred hanya dikira dalam Mod Kelas.</p>')+'<div class="rw"><button onclick="PN.leave()">Keluar padang ▶</button><button class="kx" onclick="PN.shut()">Kekal di sini</button></div>')}
function leave(){SS.set('sk_ret',STORY&&grade?{room:4,grade:grade.g,score:grade.s}:{room:4,roam:1});closeCard();loading(()=>nav('world'))}
window.PN={go:stageIn,shut,leave,ok:done,again(i){closeCard();PG.begin(i,r=>onRes(i,r))}};
function act(){if(halt)return;if(Math.hypot(P.x-PV.x,P.z-PV.z)<1.5){vaseHit('padang');return}const i=nearSt();if(i>=0){talk(i);return}
 if(nearDoor()){if(!STORY)leave();else if(doneN()==3)summary();else{toast('Siapkan semua stesen dahulu! ('+doneN()+'/3)',2600);say('Belum boleh keluar!')}}}
/* ---- balls: walk into a ball to push it; into a goal = Gol! ---- */
function gol(){cur.gol=(cur.gol||0)+1;save();say('Gol!!! ⚽');toast('GOL! ⚽',1400);[0,1,2,3].forEach(i=>tone(520+i*130,i*.08,.14,'triangle',.1));if(cur.gol>=GOAL5)award('gol5','Penjaring','Jaring '+GOAL5+' gol di Padang Balapan.')}
function balls(dt,pspd){const r=BALL.r;BL.forEach((b,i)=>{if(!b.m.visible)return;const live=b.cd<=0;
 if(live){const dx=b.x-P.x,dz=b.z-P.z,d=Math.hypot(dx,dz);if(d<BALL.touch&&d>.001&&P.y<.6){const sp=Math.min(BALL.max,Math.max(BALL.min,pspd*BALL.mul));b.vx=dx/d*sp;b.vz=dz/d*sp}}
 let nx=b.x+b.vx*dt,nz=b.z+b.vz*dt;if(hit(nx,b.z,r)||nx<BX0+.5||nx>BX1-.5){b.vx*=-.55;nx=b.x}if(hit(nx,nz,r)||nz<BZ0+.5||nz>BZ1-.5){b.vz*=-.55;nz=b.z}
 b.x=nx;b.z=nz;const k=Math.exp(-BALL.fr*dt);b.vx*=k;b.vz*=k;if(Math.hypot(b.vx,b.vz)<.05)b.vx=b.vz=0;
 b.m.position.set(b.x,r,b.z);b.m.rotation.z-=b.vx*dt/r;b.m.rotation.x+=b.vz*dt/r;
 if(live){if(GL.some(g=>Math.sign(b.x)==g.s&&Math.abs(b.x)>Math.abs(g.f)+.05&&Math.abs(b.z)<2.1)){b.cd=1.6;gol()}}else{b.cd-=dt;if(b.cd<=0)spawn(b)}})}
/* ---- minimap ---- */
const mc=$('mm'),mg=mc.getContext('2d'),mb=document.createElement('canvas');mb.width=320;mb.height=168;const MS=Math.min(300/(BX1-BX0),156/(BZ1-BZ0)),MCX=(BX0+BX1)/2,mf=(x,z)=>[160+(x-MCX)*MS,84+z*MS]; /* the field is wide, so this minimap is a wide box (see the #mm style in padang.html) */
(()=>{const g=mb.getContext('2d');g.fillStyle='#2b2f38';g.fillRect(0,0,320,168);const a=mf(BX0,BZ0),b=mf(BX1,BZ1);g.fillStyle='#79c06a';g.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);g.strokeStyle='#ffffff';g.lineWidth=3;g.strokeRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);
 const m=(RI+RO)/2,L=mf(-SL,0),Rr=mf(SL,0);g.strokeStyle='#c9633f';g.lineWidth=LW*MS;g.beginPath();g.moveTo(L[0],L[1]-m*MS);g.lineTo(Rr[0],Rr[1]-m*MS);g.arc(Rr[0],Rr[1],m*MS,-Math.PI/2,Math.PI/2);g.lineTo(L[0],L[1]+m*MS);g.arc(L[0],L[1],m*MS,Math.PI/2,Math.PI*1.5);g.closePath();g.stroke();
 const r1=mf(VX-1.2,VZ0),r2=mf(VX+1.2,VB+1);g.fillStyle='#d2694a';g.fillRect(r1[0],r1[1],r2[0]-r1[0],r2[1]-r1[1]);const q1=mf(VX-1.4,PIT0),q2=mf(VX+1.4,PIT0+PITL);g.fillStyle='#ead08a';g.fillRect(q1[0],q1[1],q2[0]-q1[0],q2[1]-q1[1]);
 g.fillStyle='#ffffff';GL.forEach(x=>{const p=mf(x.f,-2.2);g.fillRect(Math.min(p[0],mf(x.b,0)[0]),p[1],Math.abs(mf(x.b,0)[0]-p[0])+1,4.4*MS)});
 [-15,-7,1].forEach(x=>{const p=mf(x,-16.4);g.fillStyle='#a9744a';g.fillRect(p[0]-1.1*MS,p[1]-3,2.2*MS,6)});
 STN.forEach((s,i)=>{const p=mf(s.wx,s.wz);g.fillStyle=PD.g[i].c;g.beginPath();g.arc(p[0],p[1],11,0,7);g.fill();g.fillStyle='#fff';g.font='bold 17px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(i+1,p[0],p[1]+1)})})();
function drawMM(){mg.drawImage(mb,0,0);STN.forEach((s,i)=>{if(!RES[i])return;const p=mf(s.wx,s.wz);mg.fillStyle='#2e9d4a';mg.beginPath();mg.arc(p[0],p[1],11,0,7);mg.fill();mg.fillStyle='#fff';mg.font='bold 16px sans-serif';mg.textAlign='center';mg.textBaseline='middle';mg.fillText('✓',p[0],p[1]+1)});
 const e=mf(EX.x,BZ1-.2);mg.fillStyle=doneN()==3?'#5ccf4a':'#ffd23f';mg.beginPath();mg.arc(e[0],e[1],8,0,7);mg.fill();
 const a=mf(P.x,P.z),s=Math.sin(P.f),c=Math.cos(P.f);mg.fillStyle='#2f6fd0';mg.strokeStyle='#fff';mg.lineWidth=3;mg.beginPath();mg.moveTo(a[0]+s*14,a[1]+c*14);mg.lineTo(a[0]-s*8+c*8,a[1]-c*8-s*8);mg.lineTo(a[0]-s*8-c*8,a[1]-c*8+s*8);mg.closePath();mg.fill();mg.stroke()}
/* ---- pause, Android back (same behaviour as world.html), graphics ---- */
function pause(){halt=true;$('menu').classList.add('pz');$('menu').style.display='flex';document.body.classList.add('mn');view('vp')}
$('pS').onclick=()=>{$('menu').style.display='none';if(mode=='walk'){halt=false;document.body.classList.remove('mn')}};$('pH').onclick=()=>{frm='vp';view('vh')};$('pT').onclick=()=>{frm='vp';applySet();view('vt')};$('pQ').onclick=()=>{SS.del('sk_day');SS.del('sk_ret');nav('index')};
(function(){if(SR_IFR)return;let on=0;const E=['pointerdown','keydown','touchend'],arm=()=>{if(on)return;on=1;backKeep();E.forEach(e=>removeEventListener(e,arm,true))};E.forEach(e=>addEventListener(e,arm,true));
addEventListener('popstate',()=>{if(!on||!SR_TRAP)return;backKeep();const ld=$('ld');if(ld&&ld.style.display!='none')return;
if(PG.open()){PG.quit();return} /* back leaves a running mini game first */
if(kov.style.display=='flex'){if(cardBack)cardBack();return}
if(mode!='walk')return;
const m=$('menu');if(m.style.display=='flex'){const vp=$('vp');if(vp&&!vp.hidden)$('pS').click();else view('vp')}else pause()})})();
window.gfxHook=()=>{ren.shadowMap.enabled=!SET.lo;dl.castShadow=!SET.lo;ren.setPixelRatio(SET.lo?1:Math.min(devicePixelRatio,2));LOWH.forEach((o,i)=>o.visible=!(SET.lo&&i%2));BL.forEach((b,i)=>{b.m.visible=!(SET.lo&&i>0)});fit();sc.traverse(o=>{if(o.material)o.material.needsUpdate=true})};
/* ---- main loop ---- */
let last=0;
function loop(ts){requestAnimationFrame(loop);const dt=Math.min((ts-last)/1000||0,.05),t=ts/1000;last=ts;BAG.tick(dt,0);
 if(halt){keys.KeyW=keys.KeyA=keys.KeyS=keys.KeyD=keys.ArrowUp=keys.ArrowDown=keys.ArrowLeft=keys.ArrowRight=keys.Space=0;jv.x=jv.z=0;jmp=0}
 const onField=mode=='walk'||(mode=='in'&&!swapped)||(mode=='out'&&swapped);
 let ix=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+jv.x,iz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+jv.z;const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}
 const mv=l>.12&&!halt,ox=P.x,oz=P.z;let want=0;
 boost+=(((mode=='walk'&&mv&&onTrack(P.x,P.z))?1:0)-boost)*Math.min(1,dt*BOOST.ease);aph+=dt*(1+BOOST.anim*boost);
 if(mode=='walk'){if(mv){const m=camMap(cy,ix,iz,true,od||hold>0),mx=m[0],mz=m[1],spd=5*(1+BOOST.k*boost)*BAG.sl(),dx=mx*spd*dt,dz=mz*spd*dt;want=Math.hypot(dx,dz);if(!hit(P.x+dx,P.z,.35))P.x+=dx;if(!hit(P.x,P.z+dz,.35))P.z+=dz;P.f=la(P.f,Math.atan2(mx,mz),Math.min(1,dt*14))}else camMap(cy,0,0,false,false);
  P.x=Math.max(BX0+.4,Math.min(BX1-.4,P.x));P.z=Math.max(BZ0+.4,Math.min(BZ1-.4,P.z));
  cy=camStep(cy,dt,mv,mv&&Math.hypot(P.x-ox,P.z-oz)<CAMC.block*want,P.f,hold);hold-=dt;
  if((keys.Space||jmp)&&P.y<=0)P.vy=6.8;P.vy-=22*dt;P.y+=P.vy*dt;if(P.y<=0){P.y=0;P.vy=0}}
 if(onField){pm.position.set(P.x,P.y,P.z);pm.rotation.y=P.f;anim(pm,aph,mode=='walk'&&mv&&P.y==0)}
 if(mode!='stage'){balls(dt,mode=='walk'?Math.hypot(P.x-ox,P.z-oz)/Math.max(dt,.001):0);CHEER.forEach(c=>{const u=c.m.userData,w=Math.sin(t*6+c.ph);u.arms[0].rotation.x=u.arms[1].rotation.x=-2.5+w*.35;u.B.position.y=Math.abs(w)*.08})}
 if(mode!='stage')joggers(dt,t);
 wind(dt);
 PG.update(dt,t);
 /* camera */
 if(mode=='walk'){cp.x+=(P.x-cp.x)*Math.min(1,dt*10);cp.z+=(P.z-cp.z)*Math.min(1,dt*10);setCam(walkCam());dl.position.set(cp.x+6,14,cp.z+8);dl.target.position.set(cp.x,0,cp.z)}
 else{if(PG.snap){ssx=PG.rx;PG.snap=0}else ssx+=(PG.rx-ssx)*Math.min(1,dt*CAMSIDE.follow);
  if(mode=='stage'){setCam(sideCam());dl.position.set(ssx+6,14,PG.z+8);dl.target.position.set(ssx,0,PG.z)}
  else{gt=Math.min(1,gt+dt/GLIDE);const s=gt*gt*(3-2*gt),to=mode=='in'?sideCam():walkCam(),mx=(a,b)=>a.map((v,k)=>v+(b[k]-v)*s);
   if(mode=='in'){ssx=0}else{cp.x=P.x;cp.z=P.z}
   setCam({p:mx(gFrom.p,to.p),l:mx(gFrom.l,to.l)});const tx=mode=='in'?ssx:P.x,tz=mode=='in'?PG.z:P.z;dl.position.set(tx+6,14,tz+8);dl.target.position.set(tx,0,tz);
   if(!swapped&&gt>=.5)swapModel();
   if(gt>=1){if(mode=='in'){mode='stage';PG.begin(curI,r=>onRes(curI,r))}else{mode='walk';halt=false;document.body.classList.remove('mn');const f=afterOut;afterOut=null;if(f)f()}}}}
 /* HUD */
 MK.forEach((m,i)=>{m.visible=!RES[i]&&mode=='walk';if(m.visible)m.position.set(STN[i].x,3.9+Math.abs(Math.sin(t*3))*.3,STN[i].z)});if(em.visible)em.position.set(EX.x,4.2+Math.abs(Math.sin(t*3))*.3,EX.z);
 if(mode=='walk'){bt-=dt;const cw=cv.clientWidth,ch=cv.clientHeight,bb=$('bub');if(bb.style.display=='block'){bv.set(P.x,P.y+2.3,P.z).project(cam);bb.style.left=(bv.x*.5+.5)*cw+'px';bb.style.top=(-bv.y*.5+.5)*ch+'px'}
  const ns=nearSt(),h=$('hint'),pe=document.body.classList.contains('touch')?'Tekan E':'E';
  if(halt)h.style.display='none';else if(ns>=0){h.textContent=RES[ns]&&STORY?'Stesen '+(ns+1)+' sudah selesai ✔':pe+' · Main '+PD.g[ns].n;h.style.display='block'}else if(nearDoor()){h.textContent=pe+(!STORY||doneN()==3?' · Keluar padang':' · Pintu keluar ('+doneN()+'/3 stesen)');h.style.display='block'}else h.style.display='none';
  drawMM()}
 ren.render(sc,cam)}requestAnimationFrame(loop);
/* ---- start ---- */
function boot(){const k=LS.get('sk_cur',null);if(!OKGO||!k||!PF[k]){SS.del('sk_day');SS.del('sk_ret');nav('index');return}
 cur=PF[k];gen=cur.gen||'m';curL=cur.L||null;mkP();applySet();/* Round 15: the MOD line is written by js/hud.js */
 loading(()=>{document.body.classList.remove('mn');halt=false;toast(STORY?'Pendidikan Jasmani! Cuba semua 3 stesen.':'Jom main di padang. Tolak bola ke gol!',2600)})}
boot();
