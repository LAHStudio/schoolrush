/* Perpustakaan room builder (Round 10e). Used by js/kelas.js when the subject data has lib:1 (BM = DR index 1).
   Room frame (same as every kelas room): x from -RX to RX, z from RZ0 (north, far wall) to RZ1 (south, door wall); you enter at the door on the LEFT (x = DX < 0) and face north.
   Left side = books and counter, right side = study tables and one big glass window (the west outer wall of the building). Back door on the far wall, left corner.
   libWindow(c) builds the right wall; buildLib(c) builds the rest and returns the positions kelas.js needs for triggers, the back door lock, glass and the minimap. */
const LBW={BDX:-6.3,GB:[8.4,-4.8],NB:[-2.4,-5.6]};
const LBK=['#e24b4b','#4aa3ff','#f4c542','#5ccf4a','#b266ff','#ff8f5a','#3fb5a8'];
function libWindow(c){const{sc,cols,FG,RX,RZ0,RZ1,WH,WALL,STR}=c,MZ=(RZ0+RZ1)/2,xw=RX+.5,L=RZ1-RZ0+2,GL=[];
 const wp=(h,d,y,z)=>FG.right.push(bx(sc,1,h,d,WALL,xw,y,z));
 wp(.6,L,.3,MZ);wp(.3,L,WH-.15,MZ);wp(2.5,2.6,1.85,-6.7);wp(2.5,2.6,1.85,6.7);wp(2.5,.7,1.85,0); /* sill strip, header, two end piers, centre pillar */
 cols.push({x0:RX,x1:RX+1,z0:RZ0-1,z1:RZ1+1.2});
 FG.right.push(bx(sc,.12,.6,RZ1-RZ0,STR,RX-.06,.3,MZ),bx(sc,.35,.07,RZ1-RZ0,'#ffffff',RX-.17,.635,MZ));
 [-1,1].forEach(s=>{const zc=s*2.875,fr='#1c1c1c';
  const g=new T.Mesh(new T.BoxGeometry(.04,2.5,5.05),new T.MeshPhongMaterial({color:'#cfe8f2',transparent:true,opacity:.22,shininess:60,flatShading:true,depthWrite:false}));g.position.set(xw,1.85,zc);sc.add(g);GL.push(g);
  for(let k=0;k<5;k++)FG.right.push(bx(sc,.12,2.5,.1,fr,xw,1.85,zc-2.525+k*1.2625));
  [.62,1.35,2.15,3.08].forEach(y=>FG.right.push(bx(sc,.12,.08,5.05,fr,xw,y,zc)))});
 /* outside: gravel, low white garden wall, palms, cacti and bushes (nothing here is solid, nobody can walk out) */
 const gv=new T.Mesh(new T.PlaneGeometry(9,24),mat('#e8e0cb'));gv.rotation.x=-Math.PI/2;gv.position.set(RX+5.4,.005,0);sc.add(gv);
 const ow=bx(sc,.5,1.3,24,'#f2efe8',RX+8.4,.65,0);ow.castShadow=false;
 const palm=(x,z,h)=>{const t=new T.Mesh(new T.CylinderGeometry(.12,.2,h,6),mat('#8a6a46'));t.position.set(x,h/2,z);const a=new T.Mesh(new T.IcosahedronGeometry(1,0),mat('#3f9d54'));a.scale.set(1.5,.45,1.5);a.position.set(x,h+.1,z);const b=new T.Mesh(new T.IcosahedronGeometry(.8,0),mat('#4fb063'));b.scale.set(1.3,.4,1.3);b.rotation.y=.8;b.position.set(x,h+.35,z);sc.add(t,a,b)};
 [[RX+3.2,-5.6,3.4],[RX+4.4,-2.2,4.2],[RX+3.4,2.6,3.6],[RX+4.8,5.4,4]].forEach(a=>palm(a[0],a[1],a[2]));
 [[RX+2.1,-3.4],[RX+2.4,4.2]].forEach(a=>{const t=new T.Mesh(new T.CylinderGeometry(.16,.18,1.3,6),mat('#4a9a5a'));t.position.set(a[0],.65,a[1]);const s=new T.Mesh(new T.CylinderGeometry(.1,.12,.6,6),mat('#4a9a5a'));s.position.set(a[0]+.3,.9,a[1]);sc.add(t,s)});
 [[RX+2,-.6],[RX+2.2,1.2],[RX+1.9,6.2],[RX+2.4,-6.4]].forEach(a=>{const b=new T.Mesh(new T.IcosahedronGeometry(.55,0),mat('#3f9d54'));b.position.set(a[0],.4,a[1]);sc.add(b)});
 return GL}
function buildLib(c){const{sc,cols,FG,fset,sign,RX,RZ0,RZ1,DX,DW,WH}=c,BDX=LBW.BDX,W='#d9b184',W2='#b88a5a';
 const nb=(g,w,h,d,col,x,y,z)=>{const m=bx(g,w,h,d,col,x,y,z);m.castShadow=false;return m};
 const colBox=(x0,x1,z0,z1)=>cols.push({x0,x1,z0,z1});
 /* ---- back door on the far wall (in front of the wall stripe, same look as the Mat/Eng side door) ---- */
 const Z=RZ0+.12;FG.back.push(bx(sc,1.6,2.4,.04,'#8a5a3a',BDX,1.2,Z+.02),bx(sc,.12,2.5,.1,'#5a3a22',BDX-.86,1.25,Z+.05),bx(sc,.12,2.5,.1,'#5a3a22',BDX+.86,1.25,Z+.05),bx(sc,1.84,.14,.1,'#5a3a22',BDX,2.45,Z+.05),bx(sc,.5,.9,.04,'#6f4a2c',BDX,1.2,Z+.06));
 const LK=bx(sc,.22,.3,.1,'#444444',BDX+.55,1.1,Z+.1);FG.back.push(LK);
 /* ---- bookshelves: shelf(x, z centre, length along z, depth, height, double sided?) ---- */
 const lv=[.05,.7,1.35,2.0];
 function shelf(x,z,len,dp,h,dbl,n){const g=new T.Group();
  [-1,1].forEach(s=>nb(g,dp,h,.08,W2,0,h/2,s*len/2));nb(g,.08,h,len,W2,dbl?0:-dp/2+.04,h/2,0);
  lv.forEach((y,i)=>{if(i<=n){nb(g,dp,.07,len,W,0,y+.035,0)}});
  const sd=dbl?[-1,1]:[1],sg=len/6;
  for(let i=0;i<n;i++)sd.forEach(s=>{for(let k=0;k<6;k++){const bh=.42+((i+k)%3)*.07,bw=dbl?dp/2-.06:dp-.1;nb(g,bw,bh,sg-.05,LBK[(k+i*2+(s>0?3:0))%7],dbl?s*(bw/2+.04):.04,lv[i]+.07+bh/2,-len/2+(k+.5)*sg)}});
  g.position.set(x,0,z);sc.add(g);colBox(x-dp/2-.05,x+dp/2+.05,z-len/2-.05,z+len/2+.05);fset(g,[x-dp/2,x+dp/2,0,h+.2,z-len/2,z+len/2])}
 shelf(-RX+.3,-1.65,9.1,.5,2.4,false,4); /* wall shelf on the left wall */
 shelf(-7.6,-1.9,7,.8,2.1,true,3);shelf(-5.0,-2.6,5.6,.8,2.1,true,3); /* two free rows; the aisle between them (x about -6.3) leads to the back door */
 /* ---- counter, librarian spot, return trolley ---- */
 (()=>{const x=-7.55,z=4.3;bx(sc,3.3,1.05,.8,W2,x,.525,z);bx(sc,3.5,.08,1,'#d2b183',x,1.07,z);bx(sc,.5,.34,.04,'#2b2f38',x-.9,1.28,z+.05);bx(sc,.14,.2,.1,'#6b7280',x-.9,1.18,z+.05);[['#e24b4b',.45,1.18,.4],['#f4c542',.45,1.325,.34],['#4aa3ff',1.2,1.18,.4]].forEach(a=>nb(sc,a[3],.14,.3,a[0],x+a[1],a[2],z-.1)); /* Round 10e2: books no longer overlap (two side by side, one stacked with a gap-free offset) */
  colBox(-9.35,-5.8,3.7,4.9);
  const tr=new T.Group();bx(tr,.9,.08,.55,W2,0,.5,0);[-1,1].forEach(s=>bx(tr,.06,.5,.5,W2,s*.4,.25,0));[0,1,2,3].forEach(k=>nb(tr,.18,.3+(k%2)*.08,.4,LBK[k],-.32+k*.21,.7+(k%2)*.04,0));tr.position.set(-5.2,0,4.8);sc.add(tr);colBox(-5.7,-4.7,4.5,5.1)})();
 const TCH=[-7.55,5.6];
 /* ---- study tables (2 columns x 3 rows, 4 teal chairs each), reading lamps and a few students ---- */
 const SEATS=[],QC=[.6,3.0];
 const chair=(x,z,d)=>{nb(sc,.54,.07,.5,'#3a9ea0',x,.46,z);nb(sc,.54,.5,.07,'#3a9ea0',x,.8,z+d*.25);nb(sc,.08,.46,.08,'#4a4f58',x,.23,z)};
 [[1.2,-4.6],[1.2,-1.3],[1.2,2],[5.7,-4.6],[5.7,-1.3],[5.7,2]].forEach(a=>{const x=a[0],z=a[1];
  bx(sc,3.2,.08,1.2,'#d9b88a',x,.88,z);[-1,1].forEach(s=>bx(sc,.1,.8,1,'#5a5f69',x+s*1.45,.44,z));
  const lb=new T.Mesh(new T.CylinderGeometry(.1,.14,.08,6),mat('#444444')),ls=new T.Mesh(new T.ConeGeometry(.2,.22,6),mat('#f4c542'));lb.position.set(x,.96,z);ls.position.set(x,1.16,z);sc.add(lb,ls);
  nb(sc,.4,.05,.3,'#4aa3ff',x-.9,.93,z+.15);nb(sc,.4,.05,.3,'#e24b4b',x+.8,.93,z-.15);
  [-.8,.8].forEach(o=>{chair(x+o,z+1,1);SEATS.push([x+o,z+1.05,Math.PI]);chair(x+o,z-1,-1);SEATS.push([x+o,z-1.05,0])});
  colBox(x-1.7,x+1.7,z-1.15,z+1.15)});
 SEATS.filter(s=>!(Math.abs(s[0]-QC[0])<.01&&Math.abs(s[1]-(QC[1]+.05))<.01)).sort(()=>Math.random()-.5).slice(0,6).forEach(s=>{const m=npc('murid');m.position.set(s[0],.04,s[1]);m.rotation.y=s[2];m.userData.legs.forEach(l=>l.rotation.x=-Math.PI/2);sc.add(m)});
 /* ---- notice board and clock-side wall, globe by the window, rug with beanbags, plant ---- */
 const nx=LBW.NB[0];FG.back.push(bx(sc,3.4,1.5,.08,'#8a5a3a',nx,2,RZ0+.06),bx(sc,3.2,1.3,.08,'#c9955a',nx,2,RZ0+.1));
 [['#ffffff',-1,.3],['#ffd23f',-.35,.35],['#ff8fb1',.3,.25],['#9be0a8',.95,.3],['#8ec5ff',-.6,-.3],['#ffffff',.35,-.3]].forEach(a=>FG.back.push(bx(sc,.42,.5,.02,a[0],nx+a[1],2+a[2],RZ0+.15)));
 {const g=LBW.GB,gg=new T.Group();bx(gg,.7,.1,.7,W2,0,.05,0);bx(gg,.08,.9,.08,'#5a5f69',0,.55,0);
  const s=new T.Mesh(new T.SphereGeometry(.42,10,8),mat('#3b8fd6')),p1=new T.Mesh(new T.IcosahedronGeometry(.2,0),mat('#4fb063')),p2=new T.Mesh(new T.IcosahedronGeometry(.15,0),mat('#4fb063'));s.position.set(0,1.3,0);p1.position.set(.28,1.4,.18);p2.position.set(-.22,1.2,.28);gg.add(s,p1,p2);gg.position.set(g[0],0,g[1]);sc.add(gg);colBox(g[0]-.4,g[0]+.4,g[1]-.4,g[1]+.4)}
 bx(sc,1.8,.03,5.2,'#b86f50',8.5,.03,1);[['#3a9ea0',-.8],['#e8923a',1],['#f4c542',2.8]].forEach(a=>{const b=new T.Mesh(new T.SphereGeometry(.5,8,6),mat(a[0]));b.scale.set(1,.6,1);b.position.set(8.5,.3,a[1]);b.castShadow=true;sc.add(b)});
 {const x=RX-.9,z=RZ1-.8,p=new T.Mesh(new T.CylinderGeometry(.28,.2,.45,6),mat('#c0693f')),f=new T.Mesh(new T.IcosahedronGeometry(.42,0),mat('#3f9d54'));p.position.set(x,.225,z);f.position.set(x,.85,z);sc.add(p,f);colBox(x-.34,x+.34,z-.34,z+.34)}
 /* ---- four posters on the south (door) wall, right of the door ---- */
 const PS=[[-.5,RZ1-.7],[2.3,RZ1-.7],[5.1,RZ1-.7],[7.9,RZ1-.7]];
 PS.forEach((p,i)=>FG.front.push(sign(c.K.posters[i].t,c.K.posters[i].c,'#ffffff',1.7,2.1,22,p[0],1.95,RZ1-.08,Math.PI)));
 return{BDX,LK,QC,TCH,PS,GB:[LBW.GB[0],LBW.GB[1]+1],NB:[LBW.NB[0],RZ0+1.4],HID:[-6.3,-2.4],
  mm(rc){rc(-RX,-RX+.5,-6.2,2.9,'#b88a5a');rc(-8.0,-7.2,-5.4,1.6,'#b88a5a');rc(-5.4,-4.6,-5.4,.2,'#b88a5a');rc(-9.2,-5.9,3.9,4.7,'#a9814f');
   [[1.2,-4.6],[1.2,-1.3],[1.2,2],[5.7,-4.6],[5.7,-1.3],[5.7,2]].forEach(a=>rc(a[0]-1.6,a[0]+1.6,a[1]-.6,a[1]+.6,'#d9b88a'));rc(7.6,9.4,-1.6,3.6,'#b86f50');
   rc(RX-.3,RX,-5.4,5.4,'#8fd0ee');rc(BDX-.8,BDX+.8,RZ0,RZ0+.35,'#8a5a3a')}}}
