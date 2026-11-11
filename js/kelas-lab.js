/* Makmal Sains room builder (Round 10h). Used by js/kelas.js when the subject data has lab:1 (sains = DR index 0).
   Room frame is the same as every kelas room: x from -RX to RX, z from RZ0 (north, far wall) to RZ1 (south, door wall); you enter at the door on the RIGHT (x = DX > 0) and face north.
   Map check (world block x420-580, y362-502, door on its north side): facing into the room the LEFT wall is the outer east wall of the school (windows),
   the right wall is shared with the Pejabat, the far wall faces the indoor lower corridor, and the back door sits on the far wall left of centre (world x=530 -> room x about -3.4).
   Round 10h builds the room and the 3 station spots only; the three mini games (Papan Putih, Meja Makmal, Stesen Eksperimen) come in later rounds.
   labWindow(c) builds the left wall (2 big windows with curtains); buildLab(c) builds the rest and returns the positions kelas.js needs. */
const LABW={BDX:-3.4,WIN:[[-5,-1.4],[.8,4.4]],ST:[[2.5,-3.7],[-3,-3.4],[6.4,.9]],NB:[-5.7,-5.6],MD:[-7,5],TCH:[2.5,-5.95],SINK:[[-5.35,-2],[-5.35,2.4],[5.35,-2],[5.35,2.4]],DESK:[[-3,-2],[3,-2],[-3,2.4],[3,2.4]]};
const labFromWorldX=wx=>-(wx-500)*.112; /* block centre x=500, K=.112, the room is seen from the door so the world x axis is mirrored */
function labWindow(c){const{sc,cols,FG,RX,RZ0,RZ1,WH,WALL,STR}=c,MZ=(RZ0+RZ1)/2,xw=RX+.5,L=RZ1-RZ0+2,GL=[],W=LABW.WIN;
 const wp=(h,d,y,z)=>FG.left.push(bx(sc,1,h,d,WALL,-xw,y,z));
 wp(.95,L,.475,MZ);wp(WH-2.85,L,2.85+(WH-2.85)/2,MZ); /* sill strip and header over the whole wall */
 [[RZ0-1,W[0][0]],[W[0][1],W[1][0]],[W[1][1],RZ1+1]].forEach(p=>wp(1.9,p[1]-p[0],1.9,(p[0]+p[1])/2)); /* piers: back end, middle, front end */
 cols.push({x0:-RX-1,x1:-RX,z0:RZ0-1,z1:RZ1+1.2});
 FG.left.push(bx(sc,.12,.6,RZ1-RZ0,STR,-(RX-.06),.3,MZ));
 W.forEach((w,wi)=>{const zc=(w[0]+w[1])/2,wd=w[1]-w[0],fr='#f4f4f4';
  const g=new T.Mesh(new T.BoxGeometry(.04,1.9,wd),new T.MeshPhongMaterial({color:'#cfe8f2',transparent:true,opacity:.22,shininess:60,flatShading:true,depthWrite:false}));g.position.set(-xw,1.9,zc);sc.add(g);GL.push(g);
  for(let k=0;k<4;k++)FG.left.push(bx(sc,.12,1.9,.08,fr,-xw,1.9,w[0]+k*wd/3)); /* white frame: 3 panes across */
  [.95,1.9,2.85].forEach(y=>FG.left.push(bx(sc,.12,.08,wd,fr,-xw,y,zc)));
  FG.left.push(bx(sc,.35,.07,wd+.2,'#ffffff',-(RX-.17),.96,zc));
  /* blue curtain on a rod, pulled to the pier side (window 1 to the back, window 2 to the front) */
  const sg=.3,n=6,cx=-(RX-.5);FG.left.push(bx(sc,.08,.08,wd+.9,'#3a3f48',cx+.1,3.05,zc)); /* Round 10h2: the curtain hangs in front of the white sill (x clear of the ledge), thicker and wider so it covers the window edge */
  for(let k=0;k<n;k++)FG.left.push(bx(sc,.22+(k%2)*.08,2.6,sg,k%2?'#2a49a8':'#1d3a8f',cx-(k%2)*.04,1.7,wi?w[1]+.35-(k+.5)*sg:w[0]-.35+(k+.5)*sg))});
 /* outside (nothing here is solid, nobody can walk out): gravel path, low white wall, two trees and bushes */
 const gv=new T.Mesh(new T.PlaneGeometry(9,24),mat('#e8e0cb'));gv.rotation.x=-Math.PI/2;gv.position.set(-(RX+5.4),.005,0);sc.add(gv);
 const ow=bx(sc,.5,1.1,24,'#f2efe8',-(RX+8.4),.55,0);ow.castShadow=false;
 [[-(RX+3.2),-5.2,3.2],[-(RX+4),3.6,3.8]].forEach(a=>{const t=new T.Mesh(new T.CylinderGeometry(.14,.2,a[2],6),mat('#8a6a46'));t.position.set(a[0],a[2]/2,a[1]);const f=new T.Mesh(new T.IcosahedronGeometry(1.5,0),mat('#3f9d54'));f.position.set(a[0],a[2]+.6,a[1]);sc.add(t,f)});
 [[-(RX+2),-1.2],[-(RX+2.3),6],[-(RX+2.1),-6.6]].forEach(a=>{const b=new T.Mesh(new T.IcosahedronGeometry(.55,0),mat('#3f9d54'));b.position.set(a[0],.4,a[1]);sc.add(b)});
 return GL}
function buildLab(c){const{sc,cols,FG,fset,sign,RX,RZ0,RZ1,DX,DW,WH,K}=c,BDX=LABW.BDX,T0=LABW.TCH,nb=(g,w,h,d,col,x,y,z)=>{const m=bx(g,w,h,d,col,x,y,z);m.castShadow=false;return m},colBox=(x0,x1,z0,z1)=>cols.push({x0,x1,z0,z1});
 const cyl=(r1,r2,h,col,x,y,z)=>{const m=new T.Mesh(new T.CylinderGeometry(r1,r2,h,8),mat(col));m.position.set(x,y,z);m.castShadow=true;sc.add(m);return m};
 const ball=(r,col,x,y,z)=>{const m=new T.Mesh(new T.SphereGeometry(r,10,8),mat(col));m.position.set(x,y,z);m.castShadow=true;sc.add(m);return m};
 /* ---- back door on the far wall, left of centre (in front of the wall stripe, same look as the other side doors) ---- */
 const Z=RZ0+.12;FG.back.push(bx(sc,1.6,2.4,.04,'#8a5a3a',BDX,1.2,Z+.02),bx(sc,.12,2.5,.1,'#5a3a22',BDX-.86,1.25,Z+.05),bx(sc,.12,2.5,.1,'#5a3a22',BDX+.86,1.25,Z+.05),bx(sc,1.84,.14,.1,'#5a3a22',BDX,2.45,Z+.05),bx(sc,.5,.9,.04,'#6f4a2c',BDX,1.2,Z+.06));
 const LK=bx(sc,.22,.3,.1,'#444444',BDX+.55,1.1,Z+.1);FG.back.push(LK);
 /* ---- far wall: white board (Papan Putih station), marker tray, notice board, fire extinguisher ---- */
 FG.back.push(bx(sc,5.9,1.9,.1,'#2b2b2b',2.5,2.05,RZ0+.1),bx(sc,5.6,1.6,.06,'#f6f6f2',2.5,2.05,RZ0+.16),sign(['KITARAN','HIDUPAN'],'#f6f6f2','#2a49a8',5.3,1.4,20.8,2.5,2.05,RZ0+.2,0),bx(sc,5.6,.06,.2,'#bdbdbd',2.5,1.2,RZ0+.22));
 FG.back.push(bx(sc,1.9,1.4,.08,'#8a5a3a',-5.7,1.95,RZ0+.06),bx(sc,1.7,1.2,.08,'#c9955a',-5.7,1.95,RZ0+.1));
 [['#ffffff',-.45,.25],['#ffd23f',.05,.3],['#ff8fb1',.5,.2],['#9be0a8',-.3,-.25],['#8ec5ff',.3,-.25]].forEach(a=>FG.back.push(bx(sc,.38,.46,.02,a[0],-5.7+a[1],1.95+a[2],RZ0+.15)));
 const ext=(par,x,y,z)=>{const g=new T.Group();bx(g,.2,.55,.2,'#d23a2e',0,0,0);bx(g,.12,.12,.12,'#222',0,.34,0);bx(g,.05,.05,.2,'#222',0,.38,.1);g.position.set(x,y,z);sc.add(g);par.push(g);return g};
 ext(FG.back,-1.4,1.0,RZ0+.2);ext(FG.right,RX-.2,1.0,-5.4);
 /* ---- teacher platform and demo bench (the teacher stands behind it) ---- */
 nb(sc,5.4,.18,2.4,'#8f98a3',2.5,.09,RZ0+1.2);
 (()=>{const z=RZ0+2.1,x=2.5;bx(sc,3.2,.1,1,'#e9edf0',x,1.02,z);[-1,1].forEach(s=>bx(sc,.1,.77,.95,'#7a8591',x+s*1.4,.57,z));bx(sc,2.9,.7,.06,'#7a8591',x,.62,z+.45);
  [['#e24b4b',-1],['#4aa3ff',-.4],['#6fd36f',.8]].forEach(a=>{cyl(.12,.12,.34,'#cfe8f2',x+a[1],1.24,z);cyl(.1,.1,.2,a[0],x+a[1],1.17,z)})})();
 colBox(2.5-2.7,2.5+2.7,RZ0,RZ0+2.55);
 /* ---- sinks beside the desks (the desks themselves come from kelas.js) ---- */
 function sink(x,z){bx(sc,.8,.85,.62,'#8a5a3a',x,.425,z);bx(sc,.92,.06,.72,'#e9edf0',x,.88,z);bx(sc,.52,.02,.38,'#2b2f38',x,.915,z);bx(sc,.05,.42,.05,'#2b2f38',x,1.1,z-.26);bx(sc,.05,.05,.28,'#2b2f38',x,1.3,z-.14);colBox(x-.5,x+.5,z-.42,z+.42)}
 LABW.SINK.forEach(s=>sink(s[0],s[1]));
 /* ---- desk props: microscope on the Meja Makmal desk, test tube racks, flasks ---- */
 const micro=(x,z)=>{bx(sc,.36,.05,.3,'#333333',x,.94,z);bx(sc,.07,.42,.07,'#e8e8e8',x,1.14,z-.08);bx(sc,.1,.12,.26,'#444444',x+0,1.32,z);bx(sc,.08,.2,.08,'#444444',x,1.1,z+.1)};
 const rack=(x,z)=>{bx(sc,.52,.05,.2,'#9aa2ab',x,.93,z);['#e24b4b','#4aa3ff','#f4c542','#6fd36f'].forEach((col,i)=>{cyl(.04,.04,.3,'#cfe8f2',x-.18+i*.12,1.1,z);cyl(.035,.035,.14,col,x-.18+i*.12,1.03,z)})};
 const flask=(x,z,col)=>{cyl(.04,.14,.3,'#cfe8f2',x,1.07,z);cyl(.12,.12,.08,col,x,.98,z)};
 micro(-3.9,-2.05);rack(-2.2,-2.1);flask(-3.1,-1.9,'#4aa3ff');
 rack(2.2,-2.05);flask(3.5,-1.95,'#e24b4b');flask(-2.4,2.35,'#6fd36f');rack(-3.7,2.4);micro(3.8,2.35);flask(2.2,2.5,'#f4c542');
 /* tent card on the Meja Makmal desk */
 bx(sc,.95,.06,.12,'#2a49a8',-3,.95,-2.28);const tent=sign(['MEJA','MAKMAL'],'#2a49a8','#ffffff',.9,.5,18,-3,1.22,-2.28,0);
 /* ---- experiment station on the right wall: a long bench with a plant pair, an ice beaker and a battery with a bulb ---- */
 (()=>{const x=RX-.85,z=.9,L=3;bx(sc,1.0,.85,L-.1,'#8a5a3a',x,.425,z);bx(sc,1.12,.08,L,'#e9edf0',x,.89,z);
  [[-1.1,'#3f9d54'],[-.6,'#a5b04a']].forEach(a=>{cyl(.16,.12,.24,'#c0693f',x,1.05,z+a[0]);const f=new T.Mesh(new T.IcosahedronGeometry(.22,0),mat(a[1]));f.position.set(x,1.35,z+a[0]);f.castShadow=true;sc.add(f)});
  cyl(.14,.14,.3,'#cfe8f2',x,1.08,z-.05);bx(sc,.14,.1,.14,'#bfe9ff',x,1.1,z-.05);
  bx(sc,.2,.16,.34,'#3a3a3a',x,.99,z+.45);bx(sc,.06,.06,.2,'#d23a2e',x,1.09,z+.45);ball(.1,'#fff2a8',x,1.07,z+1.0);bx(sc,.03,.03,.5,'#c07a2e',x,.95,z+.72);
  colBox(x-.6,x+.6,z-L/2,z+L/2)})();
 FG.right.push(sign(['STESEN','EKSPERIMEN'],'#2a49a8','#ffffff',2.2,.9,24,RX-.08,2.75,.9,-Math.PI/2));
 /* ---- science cabinet on the right wall (the hidden note is here). Round 13c: normal open cabinet, no glass, with science equipment on the shelves ---- */
 (()=>{const g=new T.Group(),x=RX-.45,z=-3.7,W='#b9bfc7';nb(g,.7,2.4,.08,W,0,1.2,-.96);nb(g,.7,2.4,.08,W,0,1.2,.96);nb(g,.08,2.4,2,W,.31,1.2,0);
  [.05,.8,1.5,2.2].forEach((y,i)=>{nb(g,.7,.07,2,W,0,y+.03,0);});
  const it=(geo,col,px,py,pz)=>{const m=new T.Mesh(geo,mat(col));m.position.set(px,py,pz);m.castShadow=false;g.add(m);return m},CY=(a,b,h)=>new T.CylinderGeometry(a,b,h,8),BX=(w,h,d)=>new T.BoxGeometry(w,h,d),G='#cfe8f2';
  const s1=.115,s2=.865,s3=1.565; /* tops of the three usable shelves (about .6 free above each) */
  [[-.65,'#b9772e'],[-.3,'#3f8f5a'],[.05,'#b9772e']].forEach(a=>{it(CY(.1,.1,.3),a[1],0,s1+.15,a[0]);it(CY(.04,.04,.1),a[1],0,s1+.35,a[0]);it(CY(.045,.045,.04),'#2b2b2b',0,s1+.42,a[0])}); /* reagent bottles */
  it(BX(.4,.22,.3),'#e8c75a',0,s1+.11,.5);it(BX(.4,.22,.3),'#4aa3ff',0,s1+.33,.5); /* specimen boxes */
  it(BX(.3,.04,.22),'#2b2b2b',0,s2+.02,-.62);it(BX(.07,.36,.07),'#e9edf0',.1,s2+.2,-.62);it(CY(.04,.04,.24),'#e9edf0',-.02,s2+.28,-.62);it(CY(.025,.025,.08),'#2b2b2b',-.02,s2+.44,-.62);it(BX(.2,.02,.16),'#8f98a3',-.02,s2+.14,-.62); /* microscope */
  [[-.15,.2,'#3aa0e0'],[.15,.2,'#e0603a']].forEach(a=>{it(CY(.09,.09,.2),G,0,s2+.1,a[0]);it(CY(.082,.082,.02),a[2],0,s2+.205,a[0])}); /* beakers with coloured liquid */
  it(CY(.05,.05,.38),G,0,s2+.19,.5);it(CY(.045,.045,.02),'#3aa0e0',0,s2+.385,.5); /* measuring cylinder */
  [-.65,-.3].forEach(zz=>{it(CY(.04,.12,.22),'#e6f3c8',0,s3+.11,zz);it(CY(.045,.045,.03),'#c0693f',0,s3+.235,zz)}); /* conical flasks */
  it(BX(.16,.04,.5),'#c9a14a',0,s3+.02,.2);['#e24b4b','#4aa3ff','#f4c542','#5ccf4a','#b266ff'].forEach((c,k)=>it(CY(.025,.025,.2),c,0,s3+.14,-.02+k*.09)); /* test tube rack */
  [0,1,2].forEach(i=>it(CY(.11,.11,.025),'#e8f4f8',0,s3+.0125+i*.03,.75)); /* petri dishes */
  g.position.set(x,0,z);sc.add(g);colBox(x-.4,x+.4,z-1.05,z+1.05);fset(g,[x-.4,x+.4,0,2.6,z-1.05,z+1.05])})();
 /* ---- solar system model (front left), two yellow chemical barrels (back left), red bin ---- */
 (()=>{const x=LABW.MD[0],z=LABW.MD[1];cyl(.3,.4,.9,'#8a6a46',x,.45,z);ball(.42,'#e8c75a',x,1.35,z);const r=new T.Mesh(new T.CylinderGeometry(.75,.75,.04,20),mat('#c9a14a'));r.position.set(x,1.35,z);r.rotation.x=.35;sc.add(r);ball(.12,'#4aa3ff',x+.7,1.0,z+.35);colBox(x-.5,x+.5,z-.5,z+.5)})();
 [[-7.55,-6.2],[-6.75,-6.3]].forEach(a=>{cyl(.4,.4,.95,'#e8c52e',a[0],.475,a[1]);cyl(.41,.41,.12,'#2b2b2b',a[0],.55,a[1]);colBox(a[0]-.42,a[0]+.42,a[1]-.42,a[1]+.42)});
 /* ---- posters: the periodic table (right wall) and the body (far wall, right) ---- */
 FG.right.push(sign(K.posters[0].t,K.posters[0].c,'#ffffff',2.4,1.8,18,RX-.08,1.95,3.5,-Math.PI/2));
 FG.back.push(sign(K.posters[1].t,K.posters[1].c,'#ffffff',1.4,1.8,16,6.55,1.95,RZ0+.08,0));
 /* ---- minimap ---- */
 const mm=rc=>{rc(2.5-2.7,2.5+2.7,RZ0,RZ0+2.55,'#8f98a3');LABW.DESK.forEach(a=>rc(a[0]-1.7,a[0]+1.7,a[1]-.5,a[1]+.5,'#e9edf0'));LABW.SINK.forEach(s=>rc(s[0]-.5,s[0]+.5,s[1]-.4,s[1]+.4,'#4aa3ff'));rc(RX-1.45,RX-.25,.9-1.5,.9+1.5,'#e9edf0');rc(RX-.85,RX,-4.75,-2.65,'#b9bfc7');rc(-8.4,-5.8,-6.6,-5.9,'#e8c52e');LABW.ST.forEach(s=>rc(s[0]-.3,s[0]+.3,s[1]-.3,s[1]+.3,'#ffd23f'))};
 return{BDX,LK,TCH:T0,ST:LABW.ST,NB:[LABW.NB[0],RZ0+1.4],MD:LABW.MD,HID:[RX-1.5,-3.7],P0:[RX-.7,3.5],P1:[6.55,RZ0+1.4],mm}}
