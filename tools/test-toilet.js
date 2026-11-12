/* Round 19 / 19b / 19c: the toilets (js/toilet.js, wcRoom in js/world-build.js), the open entrances in the hallway wall, the prefect pool fix, wrong-toilet wiring and the bag icon.
   Node only, no browser. The wall and room code of world-build.js runs for real with stub blk/flr/box3/pn; toilet.js runs for real with stubs.
   Run: node tools/test-toilet.js */
const fs=require('fs'),path=require('path');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const MCL=()=>({opacity:1,transparent:false,depthWrite:true,clone(){return MCL()}});
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ex=f=>fs.existsSync(path.join(__dirname,'..',f));
const WB=rd('js/world-build.js'),TS=rd('js/toilet.js'),WJ=rd('js/world.js'),HTML=rd('world.html'),HUD=rd('js/hud.js'),LK=rd('js/lockers.js'),SP=rd('js/spot.js');
/* ---- geometry: run the real wall + room code ---- */
const i0=WB.indexOf('function wallP('),i1=WB.indexOf('\n',WB.indexOf('const WHB=')),w1=WB.slice(i0,i1);
const CALLS='wcRoom(47,135,92,201,-1,168,0);wcRoom(588,484,639,556,1,520,1);';
const j0=WB.indexOf('const TOIL=[];'),j1=WB.indexOf(CALLS)+CALLS.length;
ok(i0>0&&j0>0&&j1>j0,'wall and room code found');
function mkMesh(x,y,z,geo){return{isMesh:true,isLight:false,visible:true,userData:{},children:[],add(c){this.children.push(c)},position:{x,y,z,set(a,b,c){this.x=a;this.y=b;this.z=c}},rotation:{x:0,y:0},geometry:{type:geo||'BoxGeometry'},material:{clone(){return MCL()}},traverse(fn){fn(this)}}}
function build(){const K=.112,X=x=>(x-340)*K,Z=y=>(y-344)*K,cols=[],WC='#f3ead8',made={roofs:[],boxes:[],pn:0,pns:[],tx:[],planes:[],sc:[]};
 const WLs=[],rects=[],tx=(L,bg,fg,w,h,fs,x,y,z,r)=>{made.tx.push({L,w,h,x,y,z,r})},blk=(a,b,c,d,h,col,solid,y0)=>{if(solid)cols.push({x0:X(a),x1:X(c),z0:Z(b),z1:Z(d),w:h>=2.5?1:0});const m=Object.assign(mkMesh(0,0,0),{castShadow:true,h,y0:y0||0});if((y0||0)>=4)made.roofs.push(m);rects.push({m,x0:X(a),x1:X(c),z0:Z(b),z1:Z(d),top:(y0||0)+h});if((y0||0)+h>=3.5)WLs.push({m,b:[X(a),X(c),y0||0,(y0||0)+h,Z(b),Z(d)]});return m};
 const flr=()=>{},box3=(x,z,w,d,h,c,y0)=>{const m=mkMesh(x,(y0||0)+h/2,z);Object.assign(m,{x,z,w,d,h,c,y0:y0||0});made.boxes.push(m);return m},pn=(w,h,c,x,y,z,r)=>{made.pn++;made.pns.push({w,h,c,x,y,z,r})};
 const wS=WB.indexOf('function win('),winSrc=WB.slice(wS,WB.indexOf('\n',wS));
 const mkC=()=>{const t={},px=new Proxy(t,{get:(o,k)=>k in o?o[k]:(...a)=>px,set:(o,k,v)=>{o[k]=v;return true}});return px};
 const TB={Group:function(){Object.assign(this,mkMesh(0,0,0,'Group'));this.isMesh=false;this.rotation={x:0,y:0,z:0}},Mesh:function(geo,mt){Object.assign(this,mkMesh(0,0,0,geo.type));this.geometry=geo;this.material=mt;made.planes.push(this)},BoxGeometry:function(w,h,d){this.type='BoxGeometry';this.w=w;this.h=h;this.d=d},PlaneGeometry:function(w,h){this.type='PlaneGeometry';this.w=w;this.h=h},MeshBasicMaterial:function(o){this.map=o.map},CanvasTexture:function(c){this.c=c},Shape:function(){this.pts=[];this.moveTo=(x,y)=>this.pts.push([x,y]);this.lineTo=(x,y)=>this.pts.push([x,y]);this.closePath=()=>{}},ExtrudeGeometry:function(sh,o){this.type='ExtrudeGeometry';this.shape=sh;this.o=o}},mat=c=>({c,clone(){return MCL()}}),docR={createElement:()=>({width:0,height:0,getContext:()=>mkC()})},scR={add(o){made.sc.push(o)}};
 const f=new Function('X','Z','cols','WC','blk','flr','box3','pn','tx','T','mat','document','sc','WL','Math',winSrc+'\n'+w1+'\n'+WB.slice(j0,j1)+'\nreturn {TOIL,WHB,WHG}');
 const o=f(X,Z,cols,WC,blk,flr,box3,pn,tx,TB,mat,docR,scR,WLs,Math);return{T:o.TOIL,WHB:o.WHB,WHG:o.WHG,cols,X,Z,made,WLs,rects}}
const B=build(),T=B.T,hit=(x,z,r)=>B.cols.some(c=>x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1);
ok(T.length==2&&T[0].girl==0&&T[1].girl==1,'two rooms: boys then girls');
ok(T.every(r=>r.doors.length==3&&r.doors[0].use==1&&r.doors[1].use==1&&r.doors[2].use==0&&r.doors.every(d=>d.leaf&&d.inn)),'each room: 3 cubicles, the two nearer the hallway usable (green), the far one locked (red), each with a door leaf and an inside spot');
const panels=B.made.sc.filter(m=>m.geometry&&m.geometry.type=='ExtrudeGeometry'),hallP=panels.filter(m=>Math.abs(m.rotation.y+Math.PI/2)<1e-9),uP=panels.filter(m=>Math.abs(m.rotation.x+Math.PI/2)<1e-9);
ok(/WHB=wallP\(92,100,135,546,WC,\{f:155,t:181\}\),WHG=wallP\(580,588,142,556,WC,\{f:507,t:533\}\)/.test(WB)&&panels.length==4&&hallP.length==2&&uP.length==2,'the toilet walls are 4 single solids: ONE hallway wall panel per side (boys y135-546, girls y142-556, entrance notch y155-181 / y507-533) and ONE U panel per room');
{const NOTCH=[[0,0],[1,0],[1,2.3],[2,2.3],[2,0],[3,0],[3,4.2],[0,4.2]];
 ok(hallP.every(m=>{const q=m.geometry.shape.pts;return q.length==8&&Math.abs(q[2][1]-2.3)<1e-9&&Math.abs(q[3][1]-2.3)<1e-9&&Math.abs(q[6][1]-4.2)<1e-9&&Math.abs((q[4][0]-q[1][0])-2.912)<.01&&q[0][0]==0&&q[7][0]==0}),'each hallway panel is ONE elevation profile: a notch 2.9 m wide and 2.3 m high for the entrance, with the header and the full-height ends in the same solid (no touching boxes, no seams)');
 ok(Math.abs(hallP[0].geometry.o.depth-(B.X(100)-B.X(92)))<1e-9&&Math.abs(hallP[1].geometry.o.depth-(B.X(588)-B.X(580)))<1e-9&&hallP.every(m=>m.geometry.o.bevelEnabled===false),'the panels are as thick as the old walls (0.9 m)');}
ok(!/pn\(1\.7,2\.3,'#5a3d2b'/.test(WB)&&!/blk\(92,161,100,175/.test(WB)&&!/blk\(580,513,588,527/.test(WB)&&!/blk\(92,135,100,155/.test(WB)&&!/blk\(580,533,588,556/.test(WB),'no door panel and no old 1.6 m gap pieces');
ok(Math.abs((181-155)*.112-2.91)<.01,'entrance width 2.9 m');
ok(/GX=-36,GZ=-38,GW=144/.test(WB),'path-finding grid widened to x -36..36 for the bigger rooms');
ok(T.every(r=>r.x0>=-36&&r.x1<=36&&r.z0>=-38&&r.z1<=26),'rooms are inside the path-finding grid and inside the hedge (x +-36)');
const dim=r=>[(r.x1-r.x0),(r.z1-r.z0)];
ok(dim(T[0])[0]>=5&&dim(T[0])[1]>=7.3&&dim(T[1])[0]>=5.6&&dim(T[1])[1]>=8,'rooms are 150% of Round 19 (boys 5.0 x 7.4 m outer, girls 5.7 x 8.1 m): '+dim(T[0]).map(v=>v.toFixed(1))+' / '+dim(T[1]).map(v=>v.toFixed(1)));
ok(T.every(r=>r.hide===undefined&&r.in===undefined)&&!/vis\(r,/.test(TS)&&!/FDS/.test(TS)&&!/\.hide\b/.test(WB.slice(WB.indexOf('function wcRoom'))),'no hide list, hide area or forced hiding is left anywhere: the walls fade by the normal rule (Round 19f)');
ok(B.made.roofs.length==0&&!/blk\(a,b,c,d,\.25/.test(WB.slice(WB.indexOf('function wcRoom'),WB.indexOf('wcRoom(47,135'))),'no roof is built for either toilet: they are open from above like the rest of the world');
{/* the extrusion maths: put every shape point through the mesh's rotation and position (three.js: Ry = [[c,0,s],[0,1,0],[-s,0,c]], Rx = [[1,0,0],[0,c,-s],[0,s,c]]) and compare with the fade/collision boxes */
 const world=(m,sx,sy,ez)=>{let x=sx,y=sy,z=ez;const ry=m.rotation.y,rx=m.rotation.x;if(rx){const c=Math.cos(rx),sn=Math.sin(rx),yy=y*c-z*sn,zz=y*sn+z*c;y=yy;z=zz}if(ry){const c=Math.cos(ry),sn=Math.sin(ry),xx=x*c+z*sn,zz=-x*sn+z*c;x=xx;z=zz}return[x+m.position.x,y+m.position.y,z+m.position.z]};
 const bbox=m=>{const g=m.geometry,d=g.o.depth,lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(const[sx,sy]of g.shape.pts)for(const ez of[0,d]){const w=world(m,sx,sy,ez);for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],w[i]);hi[i]=Math.max(hi[i],w[i])}}return{lo,hi}};
 const same=(m,b)=>{const q=bbox(m);return Math.abs(q.lo[0]-b[0])<1e-6&&Math.abs(q.hi[0]-b[1])<1e-6&&Math.abs(q.lo[1]-b[2])<1e-6&&Math.abs(q.hi[1]-b[3])<1e-6&&Math.abs(q.lo[2]-b[4])<1e-6&&Math.abs(q.hi[2]-b[5])<1e-6};
 ok(panels.every(m=>same(m,B.WLs.find(w=>w.m===m).b)),'every extruded panel, once rotated and positioned, fills exactly its stored box: x, height and z (so the walls stand where the collision and the fade boxes say)');
 const hp=bbox(hallP[0]);ok(hp.lo[1]==0&&Math.abs(hp.hi[1]-4.2)<1e-9,'the walls stand on the floor and are 4.2 m high');}
ok(B.WHB&&B.WHG&&[B.WHB,B.WHG].every(m=>B.WLs.some(w=>w.m===m&&w.bs.length==3&&w.bs[2][2]==2.3&&w.bs[2][3]==4.2))&&B.WLs.filter(w=>w.da&&w.da.length==3).length==2&&uP.every(m=>B.WLs.some(w=>w.m===m&&w.bs.length==3)),'each panel is ONE entry in the fading wall list WL: the hallway panels fade on their two solid parts and the header, the U panels on their three walls');
ok(!/const HWB|const HWG|blk\(92,135,100,142|blk\(92,198,100,546|blk\(580,142,588,487|blk\(580,546,588,556/.test(WB)&&!/blk\(a,b,c,b\+t,4\.2/.test(WB.slice(WB.indexOf('function wcRoom'))),'none of the old wall boxes (pieces, corner caps, shell walls) is built any more');
{const pb=[];B.WLs.filter(w=>w.da||w.m===B.WHB||w.m===B.WHG).forEach((w,pi)=>w.bs.forEach(q=>pb.push({pi,q})));let worst=0;for(let i=0;i<pb.length;i++)for(let j=i+1;j<pb.length;j++){const a=pb[i].q,b=pb[j].q,ox=Math.min(a[1],b[1])-Math.max(a[0],b[0]),oy=Math.min(a[3],b[3])-Math.max(a[2],b[2]),oz=Math.min(a[5],b[5])-Math.max(a[4],b[4]);if(ox>1e-6&&oy>1e-6&&oz>1e-6)worst=Math.max(worst,ox*oy*oz)}ok(worst==0,'no two wall boxes of the toilet walls overlap (they only touch), so there are no doubled faces to z-fight when the walls go see-through: overlap volume '+worst)}
function reach(room,start,fx){const r=.3,st=.1,seen=new Set(),q=[start],key=(x,z)=>Math.round(x/st)+','+Math.round(z/st);seen.add(key(start[0],start[1]));
 const lim=[room.x0-8,room.x1+8,room.z0-8,room.z1+8];let n=0;while(q.length&&n++<900000){const[x,z]=q.shift();for(const[dx,dz]of[[st,0],[-st,0],[0,st],[0,-st]]){const a=x+dx,b=z+dz;if(a<lim[0]||a>lim[1]||b<lim[2]||b>lim[3])continue;const k=key(a,b);if(seen.has(k)||hit(a,b,r))continue;seen.add(k);q.push([a,b])}}return{has:(x,z)=>seen.has(key(x,z)),seen}}
const cellsIn=(R,r)=>[...R.seen].map(k=>k.split(',').map(v=>v*.1)).filter(([x,z])=>x>r.x0+.2&&x<r.x1-.2&&z>r.z0+.2&&z<r.z1-.2).length;
const nm=i=>i?'girls':'boys';
for(const[i,r] of T.entries()){const hx=i?B.X(560):B.X(120),hz=i?B.Z(520):B.Z(168),R=reach(r,[hx,hz]);
 ok(!hit(hx,hz,.3),nm(i)+': hallway start spot is free');
 const inside=cellsIn(R,r);ok(inside>1200,nm(i)+': the player can walk from the hallway into the room: '+inside+' cells');
 r.doors.forEach((d,k)=>{ok(R.has(d.x,d.z)&&inRoomC(r,d.x,d.z),nm(i)+': cubicle '+(k+1)+' outside-door spot is inside the room and reachable');
  ok(hit(d.inn.x,d.inn.z,0)&&inRoomC(r,d.inn.x,d.inn.z)&&Math.abs(d.inn.x-d.x)<1e-9,nm(i)+': cubicle '+(k+1)+' inside spot is inside the cubicle block, straight in line with its door')});
 ok(R.has((r.x0+r.x1)/2,B.Z(i?520:168)),nm(i)+': the middle of the room is walkable');
 ok(B.cols.filter(c=>c.x0>=r.x0-.01&&c.x1<=r.x1+.01&&c.z0>=r.z0&&c.z1<=r.z1).length>=3,nm(i)+': 2 cubicles and the sink counter block the player');
 ok(r.spots.length==3&&r.spots.every(p=>p.x>r.x0+.3&&p.x<r.x1-.3&&p.z>r.z0+.3&&p.z<r.z1-.3&&!hit(p.x,p.z,.3)&&R.has(p.x,p.z)),nm(i)+': 3 idle spots inside the room, free and reachable');
 ok(R.has(r.door.x,r.door.z)&&R.has(r.out.x,r.out.z)&&(i?r.out.x<B.X(580):r.out.x>B.X(100))&&(i?r.door.x>B.X(588):r.door.x<B.X(92)),nm(i)+': the door spot (inside the entrance) and the out spot (in the hallway) are free, on the right sides of the wall');
 const leg=(a,b)=>{for(let k=0;k<=60;k++){const x=a.x+(b.x-a.x)*k/60,z=a.z+(b.z-a.z)*k/60;if(hit(x,z,.25))return false}return true};
 ok(r.spots.every(p=>leg(r.door,p)&&leg(p,r.door))&&leg(r.door,r.out)&&leg(r.out,r.door),nm(i)+': NPC walk out -> door -> spot and back is a clear straight line (no walls, cubicles or counter)');
 /* a visitor starts at the hallway node (TL / BR) */
 const node=i?{x:B.X(572),z:B.Z(520)}:{x:B.X(108),z:B.Z(168)};ok(leg(node,r.door),nm(i)+': from the hallway node straight to the door spot is clear');}
function inRoomC(r,x,z){return x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1}
for(const[i,r] of T.entries()){const gz=i?[B.Z(507),B.Z(533)]:[B.Z(155),B.Z(181)],gx=i?[B.X(580),B.X(588)]:[B.X(92),B.X(100)],plug={x0:gx[0],x1:gx[1],z0:gz[0],z1:gz[1]};B.cols.push(plug);
 for(const st of[[i?B.X(560):B.X(120),B.Z(i?520:168)],[i?B.X(645):B.X(-60+340),B.Z(i?520:168)]]){const R=reach(r,st);ok(cellsIn(R,r)==0,nm(i)+': entrance plugged, nothing reaches the room from '+(Math.abs(st[0])>30?'outside':'the hallway'))}
 B.cols.splice(B.cols.indexOf(plug),1)}
ok(WB.indexOf('wcRoom(47,135')<WB.indexOf('const TD='),'rooms are built before TD and the see-through sets (fades read sc.children after TD)');
ok(/function box3\([^)]*\)\{[^}]*return m\}/.test(WB),'box3 returns its mesh (door leaves need it)');
ok(B.made.boxes.filter(b=>b.c=='#4fa86b').length==4&&B.made.boxes.filter(b=>b.c=='#b8483a').length==2&&B.made.planes.filter(m=>m.userData.mirror).length==4,'green doors (2 per room), red door (1 per room), two mirror glasses per room');
/* ---- toilet.js pure logic ---- */
const mkEnv=(ns0,fds)=>{const env={P:{x:0,z:0,f:0,sx:0,sz:0,vy:0,y:0},say:[],toast:[],tones:0,lock:0,lockPf:null,ns:ns0||[],bub:[],anim:0,halt:false,gen:'m'};
 env.body={appendChild(e){e.parentNode=env.body;env.bub.push(e)},removeChild(e){env.bub.splice(env.bub.indexOf(e),1);e.parentNode=null}};return env};
const mkT=(ns0,fds)=>{const W={},env=mkEnv(ns0,fds);
 const Tt={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;this.project=()=>{this.x=0;this.y=0;this.z=.5;return this}}},doc={createElement:()=>({style:{},textContent:'',parentNode:null}),body:env.body};
 const f=new Function('window','TOIL','FDS','P','say','toast','tone','ns','T','cam','cv','document','anim',"let halt=false,gen='m';"+TS+';return {TOI,get halt(){return halt},set halt(v){halt=v},set gen(v){gen=v}}');
 const o=f(W,T,fds||[],env.P,t=>env.say.push(t),t=>env.toast.push(t),()=>{env.tones++},env.ns,Tt,{},{clientWidth:400,clientHeight:300},doc,()=>{env.anim++});
 W.lockWC=()=>{env.lock++;return env.lock<2};W.lockPf=()=>env.lockPf;return{W,env,o}};
const run=(m,sec,dt)=>{dt=dt||.016;for(let k=0;k<sec/dt;k++)m.W.toiTick(dt,k*dt)};
const mkN=(g,role,x,z)=>({role:role||'murid',m:{userData:{g},position:{set(x,y,z){this.x=x;this.z=z}},rotation:{y:0},visible:true},hid:0,ch:0,x:x||0,z:z||0,tx:0,tz:0,w:0,mv:0,f:0,sp:1.8,to:'TL',from:'TS'});
{const{o}=mkT(),TO=o.TOI,r0=T[0],r1=T[1];
 ok(TO.inRoom(r0,(r0.x0+r0.x1)/2,(r0.z0+r0.z1)/2)&&!TO.inRoom(r0,0,0)&&!TO.inRoom(null,0,0),'inRoom: inside, outside, no room');
 ok(TO.wrong(r0,'f')&&!TO.wrong(r0,'m')&&TO.wrong(r1,'m')&&!TO.wrong(r1,'f'),'wrong: girl in the boys room and boy in the girls room');
 ok(TO.roomAt(T,(r1.x0+r1.x1)/2,(r1.z0+r1.z1)/2)===r1&&TO.roomAt(T,0,0)===null,'roomAt finds the room or null');
 const d0=r0.doors[0];
 ok(TO.doorAt(T,d0.x,d0.z,1.15).d===d0&&TO.doorAt(T,r0.doors[2].x,r0.doors[2].z,1.15).d===r0.doors[2]&&TO.doorAt(T,0,0,1.15)===null,'doorAt picks the nearest door within reach');
 const d1=r0.doors[2],d01=r0.doors[1];ok(Math.hypot(d0.x-d01.x,d0.z-d01.z)>1.5&&Math.hypot(d01.x-d1.x,d01.z-d1.z)>1.5&&TO.doorAt(T,d01.x,d01.z,1.15).d===d01,'neighbouring cubicle doors are far enough apart that E never mixes them up: '+Math.hypot(d0.x-d01.x,d0.z-d01.z).toFixed(2));
 ok(TO.CFG.flush.length>=4&&TO.CFG.locked.length>=3&&[].concat(TO.CFG.flush,TO.CFG.locked,TO.CFG.bad).every(s=>!/ketik/i.test(s)),'funny lines are Malay and there are several');
 const p={x:0,z:0};ok(TO.walk(p,1,0,2,.25)===false&&Math.abs(p.x-.5)<1e-9&&TO.walk(p,1,0,2,.25)===true&&p.x==1,'walk: steps toward a point and arrives exactly');}
/* ---- the hinged doors ---- */
{const TO=mkT().o.TOI,alld=[].concat(T[0].doors,T[1].doors),p0=alld.map(d=>[d.leaf.position.x,d.leaf.position.z]);
 /* Round 19h: the knob must be on the ROOM side of the door in WORLD space, for BOTH rooms, straight after the build (before any setDoor call). World z of a child at local (0,0,lz) of a leaf turned by ry about y is leaf.z + lz*cos(ry). The room side is the side the player stands on (d.z > hinge.z). */
 ok(new Set(alld.map(d=>d.s)).size==2&&alld.length==6,'both rooms are tested for the knob side (boys s=-1 and girls s=1, 6 doors)');
 ok(alld.every(d=>{const h=d.leaf.children[0],wz=d.leaf.position.z+h.position.z*Math.cos(d.leaf.rotation.y);return d.z>d.hinge.z&&wz>d.leaf.position.z+.04&&wz<d.leaf.position.z+.06}),'knob WORLD side: on the room side of the leaf (+5 cm) for all 6 doors, boys and girls, straight after the build');
 alld.forEach(d=>TO.setDoor(d,0,1.5));
 ok(alld.every((d,i)=>Math.abs(d.leaf.position.x-p0[i][0])<1e-9&&Math.abs(d.leaf.position.z-p0[i][1])<1e-9),'setDoor(0): a shut door sits exactly where the door box was built');
 const cub=d=>B.cols.find(c=>d.inn.x>c.x0&&d.inn.x<c.x1&&d.inn.z>c.z0&&d.inn.z<c.z1);
 alld.forEach(d=>TO.setDoor(d,1,1.5));
 ok(alld.every(d=>{const c=cub(d),L=d.len,th=1.5,e={x:d.hinge.x+L*d.s*Math.cos(th),z:d.hinge.z-L*Math.sin(th)},m={x:d.hinge.x+L/2*d.s*Math.cos(th),z:d.hinge.z-L/2*Math.sin(th)};return c&&[e,m].every(q=>q.x>c.x0-.05&&q.x<c.x1+.05&&q.z>c.z0&&q.z<c.z1+.001)}),'setDoor(1): the open door lies inside its own cubicle (end and middle of the leaf are inside the cubicle block): it swings into the cubicle, not into the room');
 ok(alld.every(d=>Math.abs(Math.abs(d.leaf.rotation.y)-Math.PI/2)<.1),'the open leaf turns about 86 degrees');
 ok(alld.every(d=>d.leaf.userData.nf==1&&d.leaf.visible!==false&&d.leaf.children.length==1&&d.leaf.children[0].geometry.type=='BoxGeometry'&&Math.abs(d.leaf.children[0].position.z-d.s*.05)<1e-9),'each door keeps its handle as a child (it moves with the leaf, so it can never float), is never hidden and is exempt from the wall decor rule');
 ok(B.made.boxes.filter(b=>b.c=='#e8c53a').length==0,'no loose handle box is built any more');
 alld.forEach(d=>TO.setDoor(d,0,1.5));}
/* ---- Guna tandas: the door swings, walk into the cubicle, flush, walk out ---- */
{const m=mkT(),r=T[0],d0=r.doors[0],d1=r.doors[2],leaf=d0.leaf;
 m.env.P.x=d0.x+.6;m.env.P.z=d0.z+.2;m.o.gen='m';
 ok(m.W.toiHint()=='Guna tandas','boy at a usable boys cubicle: hint Guna tandas');
 ok(m.W.toiGo()===true&&m.o.halt===true&&d0.kt===1&&m.env.toast.length==0&&leaf.visible!==false,'E: controls locked, the door starts to swing open, no flush yet, the door is never hidden');
 ok(m.W.toiHint()=='','no hint during the sequence');
 let openedBeforeEntry=0,inside=0,shutInside=0,maxK=0,k=0;for(;k<900&&m.o.halt;k++){m.W.toiTick(.016,k*.016);maxK=Math.max(maxK,d0.k||0);const P=m.env.P;if(Math.abs(P.z-d0.z)<.02&&Math.abs(P.x-d0.x)<.02&&(d0.k||0)>=.99)openedBeforeEntry=1;if(Math.abs(P.x-d0.inn.x)<.02&&Math.abs(P.z-d0.inn.z)<.02){inside=1;if((d0.k||0)<.001&&m.env.toast.length==0||(d0.k||0)<.001)shutInside=1}}
 ok(maxK==1&&inside,'the door swings fully open and the player walks right into the cubicle (inside spot)');
 ok(shutInside,'the door has swung shut behind him while he is inside');
 ok(m.env.toast.some(t=>/SIRAM/.test(t))&&m.env.say.length==1&&m.env.tones>0,'inside: flush sound, toast and one funny line');
 ok(m.o.halt===false&&Math.abs(m.env.P.x-d0.x)<.02&&Math.abs(m.env.P.z-d0.z)<.02&&m.env.P.f===0,'after the sequence he is back out in front of the door, facing out, controls free');
 for(let j=0;j<60;j++)m.W.toiTick(.016,0);ok((d0.k||0)===0&&d0.kt===0&&Math.abs(leaf.position.x-(d0.hinge.x+d0.s*d0.len/2))<1e-9&&Math.abs(leaf.position.z-d0.hinge.z)<1e-9,'the door swings shut again after he leaves and ends exactly in its shut place');
 ok(m.env.toast.length==1&&m.env.lock==0,'only one flush, no prefect from using the toilet');
 const d01=r.doors[1];m.env.P.x=d01.x;m.env.P.z=d01.z;ok(m.W.toiHint()=='Guna tandas'&&m.W.toiGo()===true&&d01.kt===1,'the second cubicle is usable too and has its own door');
 for(let j=0;j<900&&m.o.halt;j++)m.W.toiTick(.016,j*.016);for(let j=0;j<60;j++)m.W.toiTick(.016,0);
 m.env.P.x=d1.x;m.env.P.z=d1.z;ok(m.W.toiHint()=='Pintu berkunci'&&m.W.toiGo()===true&&m.o.halt===false&&d1.kt===undefined&&m.env.say.length==3,'locked cubicle: hint Pintu berkunci, E says it is locked, no sequence, its door never moves');
 m.env.P.x=0;m.env.P.z=0;ok(m.W.toiHint()==''&&m.W.toiGo()===false,'away from the doors: no hint, E not taken');
 m.env.P.x=d0.x;m.env.P.z=d0.z;m.o.gen='f';ok(m.W.toiHint()==''&&m.W.toiGo()===true&&m.o.halt===false&&d0.kt===0,'girl at the boys cubicle: no hint, no sequence, the door stays shut');
 const g=T[1].doors[0];m.env.P.x=g.x;m.env.P.z=g.z;ok(m.W.toiHint()=='Guna tandas','girl at the girls cubicle: usable');
 const m2=mkT();m2.env.P.x=d0.x;m2.env.P.z=d0.z;m2.env.lockPf={x:0,z:0};ok(m2.W.toiGo()===true&&m2.o.halt===false&&m2.env.say.some(s=>/pengawas/i.test(s))&&d0.kt===0,'a locker prefect is chasing: "Ada pengawas! Tak sempat!", no sequence');
 const m3=mkT();m3.env.P.x=d0.x;m3.env.P.z=d0.z;m3.o.halt=true;ok(m3.W.toiHint()==''&&m3.W.toiGo()===false,'paused game: nothing happens');}
/* ---- NPCs visit like in a real toilet ---- */
{const r=T[0],n=mkN('m','murid',B.X(108),B.Z(168)),ns=[n],m=mkT(ns);m.env.P.x=B.X(300);m.env.P.z=B.Z(300);
 ok(m.W.toiVisit(n)===true&&n.ch==1&&n.wc&&n.wc.ph=='in1'&&n.wc.r===r,'a boy reaching TL is taken over (visible, walking in), world loop leaves him alone');
 let phases=new Set(),vis=1,minX=1e9,maxX=-1e9,k=0;for(;k<4000&&n.wc;k++){m.W.toiTick(.016,k*.016);phases.add(n.wc&&n.wc.ph);if(!n.m.visible)vis=0;minX=Math.min(minX,n.x)}
 ok(!n.wc&&n.ch==0&&n.wcX==1&&vis&&k<4000,'he walks in, stands at a sink, walks out and is released after '+(k*.016).toFixed(1)+' s, visible the whole time');
 ok(['in1','in2','idle','out1','out2'].every(p=>phases.has(p))&&minX<r.x1-1.5,'phases: in1, in2, idle, out1, out2; he really goes deep into the room');
 ok(Math.abs(n.x-r.out.x)<.05&&Math.abs(n.z-r.out.z)<.05&&n.tx==n.x&&n.tz==n.z&&n.w>0,'released in the hallway just outside the entrance, ready to carry on from the node');
 ok(m.W.toiVisit(n)===false&&n.wcX==0,'the next arrival call (same node) just lets the world loop carry on, then the flag is cleared');
 const g=mkN('f','guru',B.X(572),B.Z(520));ok(m.W.toiVisit(g)===true&&g.wc.r===T[1],'a female teacher goes to the girls room, any role may visit');
 const lone=mkN('m');lone.m.userData=null;ok(m.W.toiVisit(lone)===false,'an NPC without a gender is ignored');}
ok(/\{if\(window\.toiVisit\)\{if\(toiVisit\(n\)\)return\}else\{n\.hid=rnd\(4,8\);n\.m\.visible=false\}\}/.test(WJ),'world.js: reaching TL/BR calls toiVisit (old vanish only as a fallback)');
/* ---- wrong toilet: prefect + place-based reactions ---- */
{const r=T[0],mid={x:(r.x0+r.x1)/2,z:(r.z0+r.z1)/2},put=(n,ph,x,z)=>{n.ch=1;n.x=x;n.z=z;n.wc={r,ph,t:0,T:0,idle:99,spot:r.spots[0],e:null,back:null};return n};
 /* shocked boys: two inside (one idle, one walking to a sink), one in the hallway, one inside but a girl, a teacher inside */
 const a=put(mkN('m'),'idle',r.spots[0].x,r.spots[0].z),b=put(mkN('m'),'in2',r.door.x,r.door.z),c=mkN('m','murid',B.X(200),B.Z(168)),d=put(mkN('f'),'idle',r.spots[1].x,r.spots[1].z),e=put(mkN('m','guru'),'idle',r.spots[2].x,r.spots[2].z);
 const ns=[a,b,c,d,e],m=mkT(ns);m.env.P.x=B.X(300);m.env.P.z=B.Z(300);m.o.gen='f';run(m,.05);ok(m.env.lock==0&&m.env.bub.length==0,'in the hallway: nothing happens');
 m.env.P.x=mid.x;m.env.P.z=mid.z;m.W.toiTick(.016,1);
 ok(m.env.lock==1&&m.env.toast.some(t=>/pengawas/i.test(t)),'girl walks into the boys room: the locker prefect is sent (lockWC), with a warning toast');
 ok(a.wc.ph=='shock'&&b.wc.ph=='shock'&&m.env.bub.length==2&&m.env.bub.every(x=>/\uD83D\uDE33/.test(x.textContent)),'the two boys inside are shocked (😳): place based, whoever is in the room');
 ok(c.wc===undefined&&d.wc.ph=='idle'&&e.wc.ph=='idle'&&ns.length==5,'a boy in the hallway, a girl and a teacher are untouched, and nobody is spawned');
 run(m,CFG_S(m)*.55);ok(m.env.bub.every(x=>/\uD83E\uDD28/.test(x.textContent)),'after a moment the face changes to 🤨');
 const st=a.x;run(m,.1);ok(Math.abs(a.x-st)<1e-9,'shocked boys stand still facing the player');
 run(m,CFG_S(m));ok(a.wc.ph!='shock'&&a.wc.ph!='scream'&&m.env.bub.length==0,'the shock ends, the bubbles go, they carry on with what they were doing ('+a.wc.ph+', '+b.wc.ph+')');
 m.env.P.x=0;m.env.P.z=0;run(m,.05);const n1=m.env.lock;m.env.P.x=mid.x;m.env.P.z=mid.z;run(m,.05);ok(m.env.lock==n1+1,'walking in again asks LOCK again (LOCK refuses while a prefect is on the way)');
 const m1=mkT([]);m1.env.P.x=mid.x;m1.env.P.z=mid.z;m1.o.gen='f';m1.W.toiTick(.016,1);ok(m1.env.lock==1&&m1.env.bub.length==0,'nobody inside: nobody reacts (and nobody appears), the prefect still comes');
 const mh=mkT([a]);mh.env.P.x=mid.x;mh.env.P.z=mid.z;mh.o.gen='f';mh.o.halt=true;mh.W.toiTick(.016,1);ok(mh.env.lock==0,'paused game: no trigger');}
function CFG_S(m){return m.o.TOI.CFG.shock}
{/* screaming girls run out */
 const r=T[1],mid={x:(r.x0+r.x1)/2,z:(r.z0+r.z1)/2},mkG=(x,z,ph)=>{const n=mkN('f','murid',x,z);n.ch=1;n.wc={r,ph,t:0,T:0,idle:99,spot:r.spots[0],e:null,back:null};return n};
 const g1=mkG(r.spots[0].x,r.spots[0].z,'idle'),g2=mkG(r.spots[1].x,r.spots[1].z,'in2'),g3=mkG(B.X(560),B.Z(520),'in1'),g4=mkG(r.spots[2].x,r.spots[2].z,'idle');g4.role='guru';const ns=[g1,g2,g3,g4],m=mkT(ns);
 m.env.P.x=mid.x;m.env.P.z=mid.z;m.o.gen='m';m.W.toiTick(.016,1);
 ok(g1.wc.ph=='scream'&&g2.wc.ph=='scream'&&g3.wc.ph=='in1'&&g4.wc.ph=='idle'&&m.env.bub.length==2&&m.env.bub.every(x=>/\uD83D\uDE31/.test(x.textContent))&&m.env.tones>0&&m.env.lock==1,'boy walks into the girls room: the two girls inside scream (😱 and a sound), the one still in the hallway and the teacher do not, the prefect comes');
 const x0=g1.x;run(m,.5);ok(g1.x==x0&&g1.mv==0,'they scream on the spot first');
 let k=0,minZ=1e9;for(;k<900&&(g1.wc||g2.wc);k++){m.W.toiTick(.016,k*.016);if(g1.wc&&g1.wc.ph=='run1')minZ=Math.min(minZ,Math.abs(g1.z-r.door.z))}
 ok(!g1.wc&&!g2.wc&&g1.ch==0&&g2.ch==0&&Math.abs(g1.x-r.out.x)<.05&&Math.abs(g2.x-r.out.x)<.05&&m.env.bub.length==0,'both run out through the entrance, end in the hallway outside it, are released, no bubble left');
 ok(minZ<.5||k<900,'they pass through the doorway (the run goes spot -> door -> out, never into a wall)');
 ok(g1.x>0&&g1.x<B.X(580),'and they end on the hallway side of the wall: x = '+g1.x.toFixed(1));
 /* the repeat: in and out again does not make new screamers */
 m.env.P.x=0;m.env.P.z=0;run(m,.05);m.env.P.x=mid.x;m.env.P.z=mid.z;run(m,.05);ok(!g1.wc&&!g2.wc&&ns.length==4&&m.env.bub.length<=1&&m.env.bub.length==(g3.wc&&g3.wc.ph=='scream'?1:0),'walking in and out again: the two who ran out do not scream again, nobody is spawned; only a girl who has walked in meanwhile (place based) could react');
 /* safety: nobody stays stuck inside */
 const s=mkG(r.spots[0].x,r.spots[0].z,'idle');s.wc.idle=999;const ms=mkT([s]);ms.env.P.x=B.X(300);ms.env.P.z=B.Z(300);run(ms,ms.o.TOI.CFG.maxT+20);ok(!s.wc&&s.ch==0,'safety: an NPC that stays too long is sent out and released');}
/* ---- the prefect pool bug (locker prefect never came from inside a toilet) ---- */
{const SPOT=new Function(SP+';return SPOT')();const rect={x0:B.X(104),x1:B.X(576),z0:B.Z(154),z1:B.Z(534),hit:(x,z,r)=>hit(x,z,r)};
 const inside=SPOT.pool(Object.assign({sx:(T[0].x0+T[0].x1)/2,sz:B.Z(168)},rect)),start=SPOT.pool(Object.assign({sx:B.X(336),sz:B.Z(500)},rect));
 ok(inside.length==0,'documents the bug: a pool started from inside a toilet is empty ('+inside.length+')');
 ok(start.length>500,'a pool started at the hallway start spot is full: '+start.length);
 ok(/if\(!pool\|\|!pool\.length\)pool=SPOT\.pool\(\{[^}]*sx:X\(336\),sz:Z\(500\),hit\}\)/.test(LK)&&!/sx:P\.x,sz:P\.z,hit\}\);\s*\n?/.test(LK.slice(LK.indexOf('pool=SPOT.pool'),LK.indexOf('pool=SPOT.pool')+160)),'lockers.js builds the pool from the hallway start spot and never keeps an empty one');}
/* ---- Round 19d: the tan stripes, the decor on the wall pieces, closed corners, poster, tissue ---- */
{const lit=WB.match(/(\[\[100,318,186,0,-1\][\s\S]*?\]\])\.forEach\(a=>band\(\.\.\.a\)\)/);const bands=new Function('return '+lit[1])();
 const west=bands.filter(b=>b[2]==100&&b[3]==1),east=bands.filter(b=>b[2]==580&&b[3]==-1);
 ok(west.length>=2&&east.length>=3&&west.every(b=>!(b[0]<181&&b[1]>155))&&east.every(b=>!(b[0]<533&&b[1]>507)),'no tan stripe plane runs across either entrance any more (west y155-181, east y507-533)');
 ok(west.some(b=>b[0]==150&&b[1]==155)&&west.some(b=>b[0]==181&&b[1]==186)&&east.some(b=>b[0]==502&&b[1]==507)&&east.some(b=>b[0]==533&&b[1]==538),'the stripe pieces beside the entrances are kept');
 /* the real fade-set builder: which wall piece does each stripe / sign belong to? (the old stripe belonged to NONE: it never faded or hid) */
 const k0=WB.indexOf('(()=>{const E=.3'),k1=WB.indexOf('FDS.push(f)})})();')+'FDS.push(f)})})();'.length;ok(k0>0&&k1>k0,'fade-set builder found');
 const K=.112,X=B.X,Z=B.Z,mkD=(x,y,z)=>({isMesh:true,position:{x,y,z},rotation:{x:0},geometry:{type:'Plane'},material:{clone(){return MCL()}},traverse(fn){fn(this)}});
 const dec=[];const decOf=new Map();
 for(const b of bands){if(b[2]!=100&&b[2]!=580)continue;const d=mkD(X(b[2])+b[3]*.02,1,Z((b[0]+b[1])/2));dec.push(d);decOf.set(d,'band '+b.join(','))}
 /* the REAL sign function (the stand-in sign of the 19d test sat at the right height and hid the bug: the real sign was a group at y 0) */
 const tS=WB.indexOf('function toilet('),tE=WB.indexOf('return[x+nx*1.2,z+nz*1.2]}',tS)+'return[x+nx*1.2,z+nz*1.2]}'.length,scS={children:[],add(o){this.children.push(o)}},ctxs=[],fills=[];
 const mkCtx=()=>{const t={};const px=new Proxy(t,{get:(o,k)=>k in o?o[k]:(...a)=>{if(k=='fillText')fills.push(a)},set:(o,k,v)=>{if(k=='fillStyle'&&!o.first)o.first=v;o[k]=v;return true}});ctxs.push(px);return px};
 const TT={Mesh:function(geo,mat){Object.assign(this,mkMesh(0,0,0,geo.type));this.geometry=geo;this.material=mat},PlaneGeometry:function(w,h){this.type='PlaneGeometry';this.w=w;this.h=h},MeshBasicMaterial:function(o){this.map=o.map;this.clone=()=>({opacity:1,transparent:false,depthWrite:true})},CanvasTexture:function(c){this.c=c}};
 const docS={createElement:()=>({width:0,height:0,getContext:()=>mkCtx()})};
 const toiletFn=new Function('X','Z','sc','T','document',WB.slice(tS,tE)+';return toilet')(X,Z,scS,TT,docS);
 toiletFn(100,168,1,0,'LELAKI','#2f6fd0',0);toiletFn(580,520,-1,0,'PEREMPUAN','#d6568f',1);
 const sg0=scS.children[0],sg1=scS.children[1];dec.push(sg0,sg1);
 ok(scS.children.length==2&&scS.children.every(m=>m.geometry.type=='PlaneGeometry'&&m.geometry.w==1.4&&m.geometry.h==.4),'each sign is ONE flat plate straight in the scene (no group), 1.4 x 0.4 m (your red box: about 3.5 : 1)');
 ok(Math.abs(sg0.position.y-2.75)<1e-9&&Math.abs(sg1.position.y-2.75)<1e-9&&Math.abs(sg0.position.x-(X(100)+.08))<1e-9&&Math.abs(sg1.position.x-(X(580)-.08))<1e-9&&Math.abs(sg0.position.z-Z(168))<1e-9&&Math.abs(sg1.position.z-Z(520))<1e-9&&Math.abs(sg0.rotation.y-Math.PI/2)<1e-9&&Math.abs(sg1.rotation.y+Math.PI/2)<1e-9,'signs hang at 2.75 m on the hallway face of each wall, facing into the hallway, centred on the entrance');
 ok(ctxs.length==2&&ctxs[0].first=='#3a56a5'&&ctxs[1].first=='#ed1c24'&&fills.length==2&&fills.every(f=>f[0]=='TOILET'),'boys sign blue, girls sign red (the colours of your picture), the text is TOILET and nothing else is written (no arrow)');
 const parts=B.made.boxes.filter(b=>b.c=='#d9cdb4'),wb0=B.WLs.find(w=>w.m===B.WHB).b,gl=B.made.pns.filter(p=>p.c=='#a9d8f0'),glM=gl.map(p=>{const m=mkMesh(p.x,p.y,p.z,'PlaneGeometry');m.rotation.y=p.r;return m});
 const FDS=[];new Function('WL','sc','cam','FDS',WB.slice(k0,k1))(B.WLs,{children:dec.concat(parts,glM)},{},FDS);
 const owner=d=>FDS.find(f=>f.m.some(x=>x.o===d));
 const orphan=dec.filter(d=>!owner(d));ok(orphan.length==0,'every stripe on the toilet-side hallway walls and both signs belong to a wall piece (none is left floating): orphans '+orphan.length);
 const hideB=new Set([B.WHB]),hideG=new Set([B.WHG]),nearB=dec.filter(d=>d.position.x<0&&d.position.z>Z(142)&&d.position.z<Z(198)),nearG=dec.filter(d=>d.position.x>0&&d.position.z>Z(487)&&d.position.z<Z(546));
 ok(nearB.length>=3&&nearB.every(d=>hideB.has(owner(d).m[0].o)),'boys side: the stripe pieces and the sign beside the entrance are decor of the one hallway panel ('+nearB.length+')');
 ok(nearG.length>=3&&nearG.every(d=>hideG.has(owner(d).m[0].o)),'girls side: the stripe pieces and the sign beside the entrance are decor of the one hallway panel ('+nearG.length+')');
 ok(owner(sg0).m[0].o===B.WHB&&owner(sg1).m[0].o===B.WHG,'each real sign is decor of its own hallway wall panel (the header is part of it), so it fades with the wall');
 {const inE=p=>p.position.x>=wb0[0]-.3&&p.position.x<=wb0[1]+.3&&p.position.z>=wb0[4]-.3&&p.position.z<=wb0[5]+.3&&p.position.y>=wb0[2]-.05&&p.position.y<=wb0[3]+.05;
  ok(parts.length==8&&parts.every(p=>p.userData.nf==1),'all 8 cubicle partitions are marked nf (never wall decor)');
  ok(parts.some(inE),'documents the bug: a partition next to the hallway wall lies within 30 cm of it, so the old rule took it for decor of that wall');
  ok(parts.every(p=>!owner(p)),'the real builder leaves every partition alone: it never fades with the hallway wall, the cubicle side wall stays');
  ok(gl.length==6&&gl.every(p=>Math.abs(p.y-2.75)<1e-9&&p.w==1.6&&p.h==.75),'three high windows of 1.6 x 0.75 m per room, centred at 2.75 m (the three blue boxes of your screenshot, replacing the two old ones at 1.9 m)');
  const gB=gl.filter(p=>p.x<0).sort((a,b)=>a.z-b.z),gG=gl.filter(p=>p.x>0).sort((a,b)=>a.z-b.z);
  ok(gB.length==3&&gG.length==3&&gB.every(p=>Math.abs(p.x-(X(50)+.09))<1e-6&&Math.abs(p.r-Math.PI/2)<1e-9)&&gG.every(p=>Math.abs(p.x-(X(636)-.09))<1e-6&&Math.abs(p.r+Math.PI/2)<1e-9),'the windows sit on the far end wall of each room (boys west, girls east) facing into the room');
  ok(T.every((r,i)=>(i?gG:gB).every(p=>p.z-.9>r.z0+.3&&p.z+.9<r.z1-.3))&&[gB,gG].every(g=>Math.abs(g[1].z-g[0].z-1.848)<.01&&Math.abs(g[2].z-g[1].z-1.848)<.01)&&Math.abs(gB[1].z-(T[0].z0+T[0].z1)/2)<.01&&Math.abs(gG[1].z-B.Z(520))<.01,'the three windows are evenly spaced (1.85 m, a hand-width between frames), centred on the room, and fit inside the wall');
  ok(glM.every(m=>owner(m)&&uP.includes(owner(m).m[0].o))&&glM.filter(m=>m.position.x<0).every(m=>owner(m).m[0].o===uP[0])&&glM.filter(m=>m.position.x>0).every(m=>owner(m).m[0].o===uP[1]),'every window belongs to the U panel of its own room (fades with it)');
  const mir=B.made.planes.filter(m=>m.userData.mirror),basin=B.made.boxes.filter(b=>b.c=='#9cc3d6'),frames=B.made.boxes.filter(b=>b.c=='#ffffff'&&b.h>=.05&&Math.abs(b.d-.03)<1e-9);
  ok(mir.length==4&&mir.every(m=>m.geometry.w==1.1&&m.geometry.h==.95&&Math.abs(m.position.y-1.65)<1e-9&&Math.abs(m.rotation.y-Math.PI)<1e-9),'two separate mirrors per room, 1.1 x 0.95 m, facing into the room');
  ok(basin.length==4&&mir.every(m=>basin.some(b=>Math.abs(b.x-m.position.x)<1e-6))&&mir.every(m=>basin.filter(b=>Math.abs(b.x-m.position.x)<1e-6).every(b=>Math.abs(b.z-m.position.z)<.9)),'each mirror hangs right above one sink');
  ok(frames.length==16,'every mirror has a real four-sided white frame (boxes standing in front of the wall): '+frames.length);
  ok(mir.every(m=>{const fs=frames.filter(f=>Math.abs(f.x-m.position.x)<.7&&Math.abs(f.z-m.position.z)<.1);return fs.length>=4&&fs.every(f=>m.position.z<f.z-.02+1e-9)}),'the glass sits 2 cm in front of its own four frame boxes');
  const tissue=B.made.boxes.filter(b=>b.c=='#f6f6f2'),poster=B.made.tx;
  ok(T.every((r,i)=>{const ms=mir.filter(m=>m.position.z>r.z0&&m.position.z<r.z1).map(m=>[m.position.x-.55,m.position.x+.55]),o=[[tissue[i].x-.14,tissue[i].x+.14],[poster[i].x-.4,poster[i].x+.4]].concat(ms),ov=(a,b)=>a[0]<b[1]&&b[0]<a[1];for(let u=0;u<o.length;u++)for(let v=u+1;v<o.length;v++)if(ov(o[u],o[v]))return false;return ms.length==2}),'the two mirrors, the tissue dispenser and the poster do not overlap each other on the sink wall');}
 ok(dec.filter(d=>decOf.has(d)).length==7&&dec.filter(d=>decOf.has(d)).every(d=>owner(d).m[0].o===(d.position.x<0?B.WHB:B.WHG)),'every tan stripe on the two hallway walls belongs to its own single wall panel');
 {const ctr=[].concat(...T.map(r=>[mkD((r.x0+r.x1)/2,1,(r.z0+r.z1)/2),mkD((r.x0+r.x1)/2,.5,(r.z0+r.z1)/2+.5)])),F2=[];new Function('WL','sc','cam','FDS',WB.slice(k0,k1))(B.WLs,{children:ctr},{},F2);
  ok(ctr.every(d=>!F2.find(f=>f.m.some(x=>x.o===d))),'decor in the middle of a room belongs to no wall: the U panel only takes decor near its three walls (da), so cubicle parts, counters and such are never swallowed by its fade');}
 /* corners: whatever is hidden, the room is still closed by pieces that are never hidden */
 const solid=B.WLs.filter(w=>w.da||w.m===B.WHB||w.m===B.WHG).reduce((o,w)=>o.concat(w.bs.filter(q=>q[3]>=4.2).map(q=>({x0:q[0],x1:q[1],z0:q[4],z1:q[5]}))),[]);
 const covered=(x,z)=>solid.some(q=>x>=q.x0-.001&&x<=q.x1+.001&&z>=q.z0-.001&&z<=q.z1+.001);
 const room=[[47,135,92,201,-1],[588,484,639,556,1]];
 for(const[i,[a,b,c,d,s]] of room.entries()){let miss=0,n=0;const ex=B.X(s<0?c:a),hx=B.X(s<0?100:580),zb=[B.Z(b),B.Z(b+3)],zd=[B.Z(d-3),B.Z(d)];
  for(const[z0,z1] of[zb,zd])for(let k=0;k<=10;k++)for(let l=0;l<=10;l++){const x=Math.min(ex,hx)+(Math.abs(hx-ex))*k/10,z=z0+(z1-z0)*l/10;n++;if(!covered(x,z))miss++}
  const wx=s<0?[B.X(a),B.X(a+3)]:[B.X(c-3),B.X(c)];for(let l=0;l<=40;l++){const z=B.Z(b)+(B.Z(d)-B.Z(b))*l/40;for(let k=0;k<=4;k++){const x=Math.min(...wx)+Math.abs(wx[1]-wx[0])*k/4;n++;if(!covered(x,z))miss++}}
  for(let l=0;l<=60;l++){const x=Math.min(B.X(a),B.X(c))+Math.abs(B.X(c)-B.X(a))*l/60;for(const z of[B.Z(b+1.5),B.Z(d-1.5)]){n++;if(!covered(x,z))miss++}}
  if(miss&&process.env.DBG)console.log('open',i,miss);ok(miss==0,nm(i)+': the union of the single panels closes the room corners, its own walls and the strip where the U meets the hallway panel ('+miss+' of '+n+' sample points open)')}
 /* poster and tissue */
 ok(B.made.tx.length==2&&B.made.tx.every(t=>t.L.includes('JIMATKAN')&&t.L.includes('AIR')&&t.L.some(l=>/paip/.test(l))&&t.r==Math.PI&&t.y>1.4&&t.y<2.2),'a "JIMATKAN AIR" poster (Tutup paip selepas guna) in each room, facing into the room');
 for(const[i,r] of T.entries()){const t=B.made.tx[i];ok(t.z>r.z0&&t.z<r.z1&&t.x>r.x0&&t.x<r.x1,nm(i)+': poster is inside the room, on the sink wall');const po=hit(t.x,t.z-.5,.01);}
 ok(B.made.boxes.filter(b=>b.c=='#f6f6f2').length==2&&B.made.boxes.filter(b=>b.c=='#444444').length==2,'a tissue dispenser (body, slot, sheet) in each room');
 for(const[i,r] of T.entries()){const tb=B.made.boxes.filter(b=>b.c=='#f6f6f2')[i];const mir=T[i];ok(tb.x>r.x0+.3&&tb.x<r.x1-.3&&tb.z>r.z0&&tb.z<r.z1&&!B.cols.some(c=>tb.x>c.x0&&tb.x<c.x1&&tb.z>c.z0&&tb.z<c.z1&&c.z1-c.z0<1.5&&c.x1-c.x0>2.5&&tb.y0<.9),nm(i)+': the tissue dispenser is on the wall above the floor, beside the sink counter, not inside it')}}
/* ---- wiring ---- */
ok(/lockGo\(\)\)return;if\(window\.toiGo&&toiGo\(\)\)return;/.test(WJ)&&/\(window\.lockHint\?lockHint\(\):''\)\|\|\(window\.toiHint\?toiHint\(\):''\)/.test(WJ)&&/lockTick\(dt,t\);if\(window\.toiTick\)toiTick\(dt,t\);/.test(WJ),'world.js: E, hint and tick call the toilet hooks right after the locker hooks');
ok(/s=k\[2\]\+': masuk ke dalam\.'/.test(WJ)&&/Tak boleh masuk sini!/.test(WJ),'world.js: entrance message, the wrong-gender warning at the entrance stays');
ok(/"js\/lockers\.js", "js\/toilet\.js", "js\/npc-nav\.js", "js\/world\.js", "js\/cheat\.js"/.test(HTML),'world.html loads toilet.js after lockers.js, npc-nav.js before world.js, cheat.js last');
ok(/'js\/lockers\.js','js\/toilet\.js'/.test(rd('sw.js'))&&/CACHE='sr-r21c'/.test(rd('sw.js')),'sw.js: cache sr-r20a and toilet.js pre-cached');
ok(!/toilet\.js/.test(rd('kantin.html')+rd('padang.html')+rd('kelas.html')+rd('luar.html')),'other pages do not load toilet.js');
ok(/window\.lockWC=wc/.test(LK)&&/function wc\(\)\{if\(pf\|\|kn\|\|puz\|\|dtn>0\|\|sw>0\)return false;sw=CFG\.delay;sp=CFG\.spdBad;return true\}/.test(LK),'lockers.js: lockWC reuses the prefect timer and the fast speed');
const others=['js/core.js','js/chars.js','js/ui.js','js/audio.js','js/hud.js','js/wallet.js','js/spot.js','js/cam-clamp.js','js/bag.js','js/story.js','js/lockers.js','js/kantin.js','js/padang.js','js/luar.js','js/luar-logic.js','js/kelas.js','js/menu.js'].map(f=>[f,rd(f)]);
for(const n of['TOI','toiGo','toiHint','toiTick','toiVisit','TOIL','wcRoom','wallP','roomU','WHB','WHG'])ok(!others.some(([f,s])=>new RegExp('\\b'+n+'\\b').test(s.replace(/lockWC/g,''))),'name '+n+' not used by other scripts');
ok(!/\bTOI\b|\bTOIL\b|wcRoom|tqx/.test(rd('js/kantin-games.js')+rd('js/padang-games.js')+rd('css/style.css')),'no clash in games and css');
/* ---- bag icon ---- */
const ic=HUD.match(/mk\('button','hdbag','hp','(<svg[\s\S]*?<\/svg>)'\)/);
ok(ic&&/viewBox="0 0 24 24"/.test(ic[1])&&(ic[1].match(/<path/g)||[]).length>=4&&/currentColor/.test(ic[1])&&!/\\uD83C\\uDF92|🎒/.test(HUD),'bag button: a drawn backpack (handle, body, side pockets, front pocket, zip), no emoji, follows the button colour');
ok(/aria-label','Beg sekolah'/.test(HUD)&&/BAG\.open/.test(HUD),'bag button keeps its label and still opens the bag');
/* ---- docs and backups ---- */
const RM=rd('README.md');
ok(/Pusingan 19g/.test(RM)&&/Pusingan 19f/.test(RM)&&/Pusingan 19e/.test(RM)&&/Pusingan 19d/.test(RM)&&/Pusingan 19c/.test(RM)&&/Pusingan 19b/.test(RM)&&/Pusingan 19:/.test(RM)&&/Pusingan 17/.test(RM)&&/_backup_round19g/.test(RM),'README has the Round 19c entry and keeps the older text');
ok(!ex('_backup_round19g')&&ex('_backup_round20e/js/bag.js')&&!ex('_backup_round20b')&&!ex('_backup_round19f')&&ex('_backup_round20d3/js/mop.js')&&!ex('_backup_round20a2')&&!ex('_backup_round19e')&&!ex('_backup_round20a')&&ex('_backup_round20d2/js/mop.js')&&!ex('_backup_round19d')&&!ex('_backup_round19i')&&ex('_backup_round20d/js/world.js')&&!ex('_backup_round19h')&&!ex('_backup_round20c')&&ex('_backup_round21/js/jkey.js')&&!ex('_backup_round19c')&&!ex('_backup_round19b')&&!ex('_backup_round19')&&!ex('_backup_round18d')&&!ex('_backup_round18c')&&!ex('_backup_round18b')&&!ex('_backup_round18')&&!ex('_backup_round17'),'backups: 21, 20e, 20d3, 20d2, 20d kept, 20c and older dropped; 19b, 19, 18d, 18c, 18b, 18 and 17 dropped');
const core=rd('js/core.js'),ui=rd('js/ui.js');ok(core.length>0&&ui.length>0,'core.js and ui.js still there (tools/test-audio.js checks them by hash)');
console.log(fail?fail+' FAILED, '+pass+' passed':'all '+pass+' checks passed');process.exit(fail?1:0);
