/* Round 10e: Node stub check of js/kelas-lib.js (no browser): builds the Perpustakaan with a fake THREE and checks counts, bounds and collisions. Run: node tools/test-kelas-lib.js */
const fs=require('fs');let ok=0,bad=0;const t=(n,c)=>{if(c)ok++;else{bad++;console.log('FAIL',n)}};
class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
class O{constructor(){this.position=new V();this.rotation=new V();this.scale=new V().set(1,1,1);this.children=[];this.visible=true;this.castShadow=false;this.userData={legs:[]}}add(...a){a.forEach(c=>this.children.push(c))}}
class M extends O{constructor(g,m){super();this.geometry=g;this.material=m}}
const G=function(){return{}};
global.T={Group:O,Mesh:M,BoxGeometry:G,CylinderGeometry:G,ConeGeometry:G,SphereGeometry:G,IcosahedronGeometry:G,PlaneGeometry:G,MeshPhongMaterial:function(o){return Object.assign({},o)}};
eval(fs.readFileSync('js/chars.js','utf8').split('\n').slice(0,2).join('\n').replace('const mat=','global.mat=').replace('function bx','global.bx=function bx'));
global.npc=()=>new O();
let src=fs.readFileSync('js/kelas-lib.js','utf8').replace(/^const (LBW|LBK)=/mg,'global.$1=').replace(/^function (libWindow|buildLib)/mg,'global.$1=function');eval(src);
eval(fs.readFileSync('js/kelas-data.js','utf8').replace('const KL=','global.KL='));
const sc=new O(),cols=[],FG={back:[],left:[],right:[],front:[]},FDS=[],fset=(g,b)=>FDS.push({g,b});
const sign=()=>new O();
const RX=9.75,RZ0=-7,RZ1=7,WH=3.4,DX=-3.5,DW=1.2,K=KL.bm;
const GL=libWindow({sc,cols,FG,RX,RZ0,RZ1,WH,WALL:K.wall,STR:K.strip});
const LB=buildLib({sc,cols,FG,fset,sign,RX,RZ0,RZ1,DX,DW,WH,K});
t('2 glass panes',GL.length==2);t('room data lib flag',K.lib==1&&K.room==1);t('4 posters',K.posters.length==4);
t('mesh count sane (<600)',sc.children.length<600);console.log('meshes in scene:',sc.children.length,'groups faded:',FDS.length);
const hit=(x,z,r)=>cols.some(c=>x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1);
t('spawn free',!hit(DX,RZ1-1.8,.35));t('quiz chair stand spot free',!hit(LB.QC[0],LB.QC[1]+.95,.35));
t('back door spot free',!hit(LB.BDX,RZ0+1.4,.35));t('vase corner not inside a col at (8.85,-6.2) before vase',!hit(RX-.9,RZ0+.8,.05));
t('globe trigger spot free',!hit(LB.GB[0],LB.GB[1],.35));t('notice board spot free',!hit(LB.NB[0],LB.NB[1],.35));t('hidden note spot free',!hit(LB.HID[0],LB.HID[1],.35));
/* reachability: grid flood fill from the spawn (cell .25, player radius .35) must reach every trigger spot and the back door */
const S=.25,nx=Math.round(2*RX/S),nz=Math.round((RZ1-RZ0)/S),seen=new Set(),q=[[DX,RZ1-1.8]],key=(x,z)=>Math.round(x/S)+','+Math.round(z/S);
seen.add(key(q[0][0],q[0][1]));while(q.length){const[x,z]=q.pop();[[S,0],[-S,0],[0,S],[0,-S]].forEach(d=>{const a=x+d[0],b=z+d[1];if(a<-RX+.4||a>RX-.4||b<RZ0+.4||b>RZ1-.4)return;const k=key(a,b);if(seen.has(k)||hit(a,b,.35))return;seen.add(k);q.push([a,b])})}
const reach=(x,z,r)=>{for(let a=x-r;a<=x+r;a+=S)for(let b=z-r;b<=z+r;b+=S)if(Math.hypot(a-x,b-z)<r&&seen.has(key(a,b)))return true;return false};
t('reach back door',reach(LB.BDX,RZ0+1.2,1.4));t('reach notice board',reach(LB.NB[0],LB.NB[1],2.2));t('reach globe',reach(LB.GB[0],LB.GB[1],1.8));t('reach hidden note',reach(LB.HID[0],LB.HID[1],1.6));
t('reach quiz chair',reach(LB.QC[0],LB.QC[1]+.9,1.3));LB.PS.forEach((p,i)=>t('reach poster '+i,reach(p[0],p[1],1.4)));t('reach vase corner',reach(RX-.9,RZ0+.8,1.5));
let rc=0;LB.mm(()=>rc++);t('minimap draws',rc>8);
console.log(ok+' ok, '+bad+' failed');process.exit(bad?1:0);
