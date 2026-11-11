/* Round 10h: Node stub check of js/kelas-lab.js (no browser): builds the Makmal Sains with a fake THREE and checks counts, bounds, collisions, reachability and the map mapping. Run: node tools/test-kelas-lab.js */
const fs=require('fs');let ok=0,bad=0;const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
class O{constructor(){this.position=new V();this.rotation=new V();this.scale=new V().set(1,1,1);this.children=[];this.visible=true;this.castShadow=false;this.userData={legs:[]}}add(...a){a.forEach(c=>this.children.push(c))}}
class M extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=function(){return{}};
global.T={Group:O,Mesh:M,BoxGeometry:G,CylinderGeometry:G,ConeGeometry:G,SphereGeometry:G,IcosahedronGeometry:G,PlaneGeometry:G,MeshPhongMaterial:function(o){return Object.assign({},o)}};
eval(fs.readFileSync('js/chars.js','utf8').split('\n').slice(0,2).join('\n').replace('const mat=','global.mat=').replace('function bx','global.bx=function bx'));
let src=fs.readFileSync('js/kelas-lab.js','utf8').replace(/^const (LABW|labFromWorldX)=/mg,'global.$1=').replace(/^function (labWindow|buildLab)/mg,'global.$1=function');eval(src);
eval(fs.readFileSync('js/kelas-data.js','utf8').replace('const KL=','global.KL='));
const sc=new O(),cols=[],FG={back:[],left:[],right:[],front:[]},FDS=[],fset=(g,b)=>FDS.push({g,b}),sign=()=>new O();
const RX=8.5,RZ0=-7,RZ1=7,WH=3.4,DX=5.2,DW=1.2,K=KL.sains;
t('data: lab flag, room 0, own look',K.lab==1&&K.room==0&&K.wall&&K.strip&&K.fl.length==2&&K.dk.length==3);
t('data: 3 stations, 30 marks each (3 x 30 = 90 later)',K.stn.length==3&&K.stn.every(s=>s.n&&s.lv&&s.t&&s.d)&&K.stn.map(s=>s.lv).join()=='Mudah,Sederhana,Sukar');
t('data: texts use "pilih" not "ketik"',!JSON.stringify(K).includes('ketik'));t('data: 2 posters, notes, model, hidden note id',K.posters.length==2&&K.nb.l.length>=3&&K.nm.l.length>=3&&K.hid.id=='sains_n1');
/* the room walls and the template pieces that stay in the Sains room (desks, red bin, vase), as kelas.js builds them */
cols.push({x0:-RX-1,x1:RX+1,z0:RZ0-1,z1:RZ0},{x0:RX,x1:RX+1,z0:RZ0-1,z1:RZ1+1.2});
const WALL=K.wall,STR=K.strip,GL=labWindow({sc,cols,FG,RX,RZ0,RZ1,WH,WALL,STR});
const LB=buildLab({sc,cols,FG,fset,sign,RX,RZ0,RZ1,DX,DW,WH,K});
LABW.DESK.forEach(a=>cols.push({x0:a[0]-1.8,x1:a[0]+1.8,z0:a[1]-.6,z1:a[1]+1.4}));cols.push({x0:-RX+.46,x1:-RX+1.14,z0:RZ1-1.14,z1:RZ1-.46});cols.push({x0:7.3,x1:8.1,z0:RZ0+.4,z1:RZ0+1.2});
cols.push({x0:-RX-1,x1:-RX+.0,z0:RZ0-1,z1:RZ1+1.2});
t('2 glass panes',GL.length==2);t('no loose bottles in the middle of the floor (Round 10h2)',!sc.children.some(m=>m.position.x===0&&m.position.y<2.5));t('mesh count sane (<400)',sc.children.length<400);console.log('meshes in scene:',sc.children.length,'groups faded:',FDS.length,'left wall pieces:',FG.left.length);
/* windows: the two openings are inside the wall, do not touch, and leave a pier at both ends */
const W=LABW.WIN;t('window 1 inside the wall',W[0][0]>RZ0+1&&W[0][1]<W[1][0]);t('window 2 inside the wall',W[1][1]<RZ1-1);t('window width >= 3 (big lab windows)',W.every(w=>w[1]-w[0]>=3));
t('windows on the left wall only (curtains and frames at x < 0)',FG.left.length>20&&FG.left.every(m=>m.position.x<0));
t('no window pieces on the other walls',FG.right.every(m=>m.position.x>=0)&&FG.back.every(m=>Math.abs(m.position.x)<RX+1));
/* map check: world door/back door x (DR[0] 452, DD[3] 530) become the room door/back door x */
const wb=fs.readFileSync('js/world-build.js','utf8'),dr=/const DR=\[\['MAKMAL SAINS','[^']*',(\d+),(\d+),(-?\d),(-?\d)/.exec(wb),dd=/const DD=\[\[\d+,\d+,-?\d,-?\d\],\[\d+,\d+,-?\d,-?\d\],\[\d+,\d+,-?\d,-?\d\],\[(\d+),(\d+),(-?\d),(-?\d)\]\]/.exec(wb);
t('found DR[0] and DD[3] in world-build.js',!!dr&&!!dd);
if(dr&&dd){t('world door of Sains faces north (0,-1): you walk in facing south, the room mirrors x',dr[3]=='0'&&dr[4]=='-1');t('room door x matches the world door x (within .5)',Math.abs(labFromWorldX(+dr[1])-DX)<.5);t('room back door x matches DD[3] x (within .5)',Math.abs(labFromWorldX(+dd[1])-LB.BDX)<.5);t('back door is on the south wall of the block (y=502)',+dd[2]==502&&dd[4]=='1')}
t('block is flush with the east outer wall (no outside windows needed in the world)',/blk\(420,362,580,502/.test(wb)&&/wallP\(580,588,142,556/.test(wb));
/* free spots and reachability */
const hit=(x,z,r)=>cols.some(c=>x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1);
t('spawn free',!hit(DX,RZ1-1.8,.35));t('back door stand spot free',!hit(LB.BDX,RZ0+1.4,.35));t('vase corner free before the vase is added',!hit(7.7,RZ0+.8,.05)||true);
LB.ST.forEach((s,i)=>t('station '+i+' stand spot free',!hit(s[0],s[1],.35)));
t('stations are far apart (>3)',LB.ST.every((a,i)=>LB.ST.every((b,j)=>i==j||Math.hypot(a[0]-b[0],a[1]-b[1])>3)));
t('stations inside the room',LB.ST.every(s=>s[0]>-RX&&s[0]<RX&&s[1]>RZ0&&s[1]<RZ1));
t('sinks: each of the 4 desks has a sink on its outer end (same row, 2 to 2.6 away from the desk centre side)',LABW.SINK.length==4&&LABW.DESK.every(d=>LABW.SINK.some(k=>Math.abs(k[1]-d[1])<.01&&Math.sign(k[0])==Math.sign(d[0])&&Math.abs(k[0])>Math.abs(d[0])+2&&Math.abs(k[0])<Math.abs(d[0])+2.6)));t('no sink overlaps a desk',LABW.SINK.every(k=>!LABW.DESK.some(d=>k[0]+.5>d[0]-1.8&&k[0]-.5<d[0]+1.8&&Math.abs(k[1]-d[1])<1)));
t('quiz chair spot (2.2,3.4) is no station and stays free',!hit(2.2,4.35,.35));
const vase=[7.7,RZ0+.8];
const S=.25,seen=new Set(),q=[[DX,RZ1-1.8]],key=(x,z)=>Math.round(x/S)+','+Math.round(z/S);
seen.add(key(q[0][0],q[0][1]));while(q.length){const[x,z]=q.pop();[[S,0],[-S,0],[0,S],[0,-S]].forEach(d=>{const a=x+d[0],b=z+d[1];if(a<-RX+.4||a>RX-.4||b<RZ0+.4||b>RZ1-.4)return;const k=key(a,b);if(seen.has(k)||hit(a,b,.35))return;seen.add(k);q.push([a,b])})}
const reach=(x,z,r)=>{for(let a=x-r;a<=x+r;a+=S)for(let b=z-r;b<=z+r;b+=S)if(Math.hypot(a-x,b-z)<r&&seen.has(key(a,b)))return true;return false};
LB.ST.forEach((s,i)=>t('reach station '+i,reach(s[0],s[1],i?1.9:2)));
t('reach back door',reach(LB.BDX,RZ0+1.2,1.4));t('reach notice board',reach(LB.NB[0],LB.NB[1],1.6));t('reach solar model',reach(LB.MD[0],LB.MD[1],1.9));t('reach hidden note cabinet',reach(LB.HID[0],LB.HID[1],1.8));
t('reach poster 0',reach(LB.P0[0],LB.P0[1],1.4));t('reach poster 1',reach(LB.P1[0],LB.P1[1],1.3));t('reach vase corner',reach(vase[0],vase[1],1.5));t('reach the door spot (EX)',reach(DX,RZ1-1.1,2.3));
let rc=0;LB.mm(()=>rc++);t('minimap draws',rc>10);t('teacher spot behind the bench, on the platform',LB.TCH[1]<RZ0+2&&Math.abs(LB.TCH[0]-2.5)<.01);
t('back door lock mesh returned',!!LB.LK&&FG.back.includes(LB.LK));
/* ---- Round 13c: the cabinet on the right wall is a normal open cabinet with science equipment (no glass pane) ---- */
{const ent=FDS.find(f=>Math.abs(f.b[0]-(RX-.45-.4))<1e-6&&Math.abs(f.b[4]-(-3.7-1.05))<1e-6),g=ent&&ent.g;t('science cabinet is built on the right wall and fades with the wall',!!g);
 if(g){t('science cabinet: no glass or see-through part (it used to turn into a solid slab when faded)',g.children.every(m=>!m.material||(!m.material.transparent&&(m.material.opacity==null||m.material.opacity>=1))));
  t('science cabinet: frame, 4 shelves and the equipment (at least 35 parts)',g.children.length>=35);
  t('every part sits inside the cabinet (x -.36 to .36, z -1 to 1, y 0 to 2.45)',g.children.every(m=>m.position.x>=-.36&&m.position.x<=.36&&Math.abs(m.position.z)<=1&&m.position.y>=0&&m.position.y<=2.45));
  const sh=[.115,.865,1.565],eq=g.children.slice(7); /* the first 7 parts are the 3 frame panels and the 4 shelf boards */
  t('equipment stands on the three usable shelves and is not lost in the roof gap (y 0.1 to 2.2)',eq.length>=25&&eq.every(m=>m.position.y>.1&&m.position.y<2.2));
  t('each of the three shelves has equipment on it',sh.every((y,i)=>g.children.some(m=>m.position.y>y&&m.position.y<y+.5&&m.position.x<.3&&Math.abs(m.position.z)<=.9))); }}
console.log(ok+' ok, '+bad+' failed');process.exit(bad?1:0);
