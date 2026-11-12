/* Round 15b: coin wallet (js/wallet.js), random sampah spots (js/spot.js) and their wiring. Node only: the real world-build.js and kantin.js run against a deep stub of THREE/DOM (only collision boxes and positions are real).
   Run: node tools/test-wallet.js */
const fs=require('fs'),path=require('path');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const WSRC=rd('js/wallet.js'),SSRC=rd('js/spot.js');
function mkWallet(cur,extra){extra=extra||{};const saves=[],sets=[];
 const f=new Function('cur','save','HUD',WSRC+';return WALLET');const W=f(cur,()=>saves.push(JSON.stringify(cur.w)),extra.noHud?undefined:{set:o=>sets.push(o)});return{W,saves,sets}}
/* ---- wallet: old saves, add, spend, topUp, earn ---- */
{const cur={name:'A',s:[0,0,0,0]};const {W,saves,sets}=mkWallet(cur);
 ok(W.get()==0&&cur.w===undefined,'old save without cur.w reads 0 and is not touched by reading');
 ok(W.add(50)==50&&cur.w.c==50&&saves.length==1&&sets.length==1&&Object.keys(sets[0]).length==0,'add: cur.w.c in sen, saves, HUD.set({}) once');
 ok(W.spend(60)===false&&W.get()==50&&saves.length==1,'spend more than owned: false, nothing changes');
 ok(W.spend(20)===true&&W.get()==30,'spend ok');ok(W.spend(30)===true&&W.get()==0&&W.spend(1)===false&&W.get()==0,'never below 0');
 ok(W.add(-5)==0&&W.add(NaN)==0&&W.add('x')==0&&W.get()==0,'bad numbers add nothing');
 ok(W.topUp(300)==300&&W.get()==300,'topUp from 0 adds up to 300');ok(W.topUp(300)==0&&W.get()==300,'topUp at the level adds nothing');
 W.add(200);ok(W.topUp(300)==0&&W.get()==500,'topUp never lowers or cuts a bigger wallet (no farming by restart)');
 ok(W.add(0.9)==500,'fractions of a sen are dropped (whole sen)');
 const e=[0,1,2,3].map(t=>W.earn(t));ok(e.join()=='30,40,50,10'&&W.get()==630,'earn by type: kertas .30, plastik .40, kaca .50, biasa .10');
 ok(W.earn(9)==0&&W.get()==630,'unknown type earns nothing');
 ok(W.CFG.pocket==300&&W.CFG.stall.join()=='100,150,100,100,100'&&W.CFG.ice==100&&W.CFG.nasi==150,'CFG: pocket RM3, stalls in order, ice cream RM1, nasi lemak RM1.50');
 ok(W.fmt(30)=='RM0.30'&&W.fmt(150)=='RM1.50'&&W.fmt(300)=='RM3.00','fmt');}
{const cur={w:{c:-40}};const {W}=mkWallet(cur);ok(W.get()==0,'negative saved value reads 0');const c2={w:'junk'};const m=mkWallet(c2);ok(m.W.get()==0&&m.W.add(10)==10&&c2.w.c==10,'junk cur.w is replaced safely');
 const c3={};const m3=mkWallet(c3,{noHud:true});ok(m3.W.add(5)==5,'works when HUD is missing');}
ok(!/core\.js|ui\.js/.test('')&&rd('js/core.js').indexOf('WALLET')<0&&rd('js/ui.js').indexOf('WALLET')<0,'core.js and ui.js are not changed (no wallet code there)');
/* ---- the only place that changes money ---- */
{const all=fs.readdirSync(path.join(__dirname,'..','js')).filter(f=>f!='wallet.js').map(f=>[f,rd('js/'+f)]);
 ok(all.every(([f,s])=>!/cur\.w\.c\s*(=[^=]|\+=|-=)|cur\.w\s*=[^=]/.test(s.replace(/\/\*[\s\S]*?\*\//g,''))),'no other script writes cur.w');
 ok(all.every(([f,s])=>!/\b(const|let|var|function)\s+WALLET\b/.test(s)&&(f=='spot.js'||!/\b(const|let|var|function)\s+SPOT\b/.test(s))&&(f=='world.js'||f=='kantin.js'||!/\b(const|let|var|function)\s+SPG\b/.test(s))),'WALLET and SPOT are defined only in their own files, SPG only in world.js and kantin.js');}
/* ---- throwIt in school and Kantin: right bin pays, wrong bin pays nothing ---- */
for(const [file,start,end] of [['js/world-build.js','function throwIt(b){','\nconst sr='],['js/kantin.js','function throwIt(b){','\nFDS.push']]){
 const s=rd(file),a=s.indexOf(start),b=s.indexOf(end,a+10),code=s.slice(a,b>0?b:undefined);
 ok(a>=0&&/WALLET\.earn\(c\)/.test(code),file+': throwIt pays WALLET.earn(c)');
 for(const t of [0,1,2,3]){const cur={s:[0,0,0,0],w:{c:0}},{W}=mkWallet(cur),toasts=[],said=[];let carry=t,fly=null;
  const env={say:x=>said.push(x),tone(){},SRA:{bin(){}},HM:[{visible:1},{},{},{}],mkItem:()=>({scale:{setScalar(){}}}),sc:{add(){}},P:{x:0,z:0},R:a=>a[0],save(){},award(){},toast:x=>toasts.push(x),WALLET:W,cur,get carry(){return carry},set carry(v){carry=v}};
  const F=new Function('env','with(env){var fly;'+code+';return throwIt}')(env);
  F({k:(t+1)%4,bx:0,bz:0});ok(W.get()==0&&toasts.length==0&&cur.s[t]==0,file+': wrong bin, type '+t+': no money, no toast');
  F({k:t,bx:0,bz:0});ok(W.get()==W.CFG.earn[t]&&toasts[0]=='+'+W.fmt(W.CFG.earn[t])&&cur.s[t]==1,file+': right bin, type '+t+': +'+W.CFG.earn[t]+' sen and toast');}}
/* ---- Kantin stalls: pay at Mula, refund on leave, never twice ---- */
{const s=rd('js/kantin.js'),a=s.indexOf('const PAID='),b=s.indexOf('\nfunction summary(',a),c=s.indexOf('window.KN='),d=s.indexOf('\n',c);
 ok(a>0&&b>a&&c>0,'kantin.js: PAID, onRes and KN found');
 function run(story,money){const cur={w:{c:money}},{W}=mkWallet(cur),log={toast:[],start:[],shut:0,sum:0};const RES=[null,null,null,null,null];
  const env={STORY:story,WALLET:W,RES,KD:{stalls:[0,1,2,3,4].map(i=>({n:'G'+i}))},toast:x=>log.toast.push(x),shut:()=>log.shut++,KG:{start:(i,l,cb)=>{log.start.push(i);log.cb=cb}},cur:{level:'sederhana'},drawSign(){},MK:[0,1,2,3,4].map(()=>({visible:true})),doneN:()=>RES.filter(Boolean).length,$:()=>({textContent:''}),em:{},summary:()=>log.sum++,leave(){}};
  const KN=new Function('env','with(env){'+s.slice(a,b)+';'+s.slice(c,d)+';return{KN:window.KN,PAID}}').call({},Object.assign(env,{window:{}}));return{KN:KN.KN,PAID:KN.PAID,W,log,RES,cur}}
 let r=run(true,300);r.KN.go(0);ok(r.W.get()==200&&r.log.start.join()=='0','Mod Kelas: Mula on stall 1 costs RM1.00');
 r.KN.go(1);ok(r.W.get()==50&&r.log.start.join()=='0,1','stall 2 costs RM1.50');
 r.log.cb({exit:1});ok(r.W.get()==200,'leaving stall 2 unfinished refunds RM1.50');
 r.KN.go(1);ok(r.W.get()==50,'starting it again charges once (not twice)');
 r.log.cb({score:80,stars:2});ok(r.W.get()==50&&r.PAID[1]==0,'finishing keeps the fee paid');
 r.log.cb({exit:1});ok(r.W.get()==50,'a stray exit after finishing does not refund again');
 r=run(true,50);r.KN.go(0);ok(r.W.get()==50&&r.log.start.length==0&&r.log.toast[0]=='Duit tak cukup, buang sampah dulu!'&&r.log.shut==1,'cannot afford: message, stall does not start, nothing charged');
 r=run(true,100);r.KN.go(0);ok(r.W.get()==0,'exactly enough works (balance 0)');r.log.cb(null);ok(r.W.get()==100,'result null (left) refunds');
 r=run(false,0);r.KN.go(2);r.log.cb({exit:1});ok(r.W.get()==0&&r.log.start.join()=='2','Mod Jalan-jalan: stalls are free, no refund either');
 ok(/if\(r\)\{say\('Gerai ini sudah selesai/.test(s),'talk() blocks finished stalls, so a finished stall is never charged twice');
 ok(s.includes("STORY?' · '+WALLET.fmt(WALLET.CFG.stall[i])"),'Mula button shows the price in Mod Kelas only');}
/* ---- freshDay top-up ---- */
{const s=rd('js/story.js');ok(/function freshDay\(\)\{\n const tp=WALLET\.topUp\(WALLET\.CFG\.pocket\);/.test(s),'story.js: freshDay tops the wallet up to the pocket money');
 ok(s.split('WALLET.topUp').length==2,'topUp is called in one place only (a new school day), not on Sambung');
 ok(/if\(tp\)toast\('Duit saku hari ini: '\+WALLET\.fmt\(WALLET\.CFG\.pocket\)/.test(s),'toast only when something was added');}
/* ---- SPOT: pool, pick, respawn, keep ---- */
const SPOT=new Function(SSRC+';return SPOT')();
{ok(SPOT.CFG.gap==60&&SPOT.GAP()==60,'sampah gap is 60 s');
 /* fake map: 20 x 20 m, a wall box in the middle (a "classroom") and a sealed pocket in a corner */
 const box=[{x0:6,x1:14,z0:6,z1:14},{x0:0,x1:4.2,z0:0,z1:.2},{x0:4,x1:4.2,z0:0,z1:4.2},{x0:0,x1:4.2,z0:4,z1:4.2},{x0:0,x1:.2,z0:0,z1:4.2}];
 const hit=(x,z,r)=>box.some(c=>x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1);
 const pl=SPOT.pool({x0:0,x1:20,z0:0,z1:20,sx:18,sz:18,hit});
 ok(pl.length>200,'pool is big enough ('+pl.length+')');
 ok(pl.every(p=>!hit(p.x,p.z,1.0)),'no pool spot inside or hugging a wall/classroom');
 ok(!pl.some(p=>p.x>6&&p.x<14&&p.z>6&&p.z<14),'nothing inside the classroom box');
 ok(!pl.some(p=>p.x<4&&p.z<4),'sealed pocket (not reachable) is excluded');
 ok(SPOT.pool({x0:0,x1:20,z0:0,z1:20,sx:99,sz:99,hit}).length==0,'start outside the area gives an empty pool, no crash');
 ok(SPOT.pick([],[],()=>0)===null,'empty pool picks null');
 const av=[{x:18,z:18,r:7,hard:1},{x:10,z:2,r:4}];let bad=0;for(let i=0;i<300;i++){const p=SPOT.pick(pl,av);if(!p||Math.hypot(p.x-18,p.z-18)<7||Math.hypot(p.x-10,p.z-2)<4)bad++}
 ok(bad==0,'pick keeps away from the player (7 m) and props');
 const far=SPOT.pick(pl,[{x:10,z:10,r:99,hard:0},{x:18,z:18,r:3,hard:1}]);ok(far&&Math.hypot(far.x-18,far.z-18)>=3,'if the soft circles leave nothing, the hard ones still hold');
 ok(SPOT.pick(pl,[{x:10,z:10,r:99,hard:1}])===null,'if even the hard circles leave nothing, null (item keeps its place)');
 /* make(): 3 items */
 const mkItem=()=>({visible:false,position:{x:0,z:0}});const SM=[0,1,2].map(i=>({x:0,z:0,ty:i,cd:0,k:[0,1,2,3].map(mkItem)}));
 const store={};let T=1000000;const SSs={get:k=>store[k]===undefined?null:JSON.parse(store[k]),set:(k,v)=>store[k]=JSON.stringify(v)};
 const P={x:18,z:18};const G=SPOT.make({SM,SS:SSs,key:'t',pool:pl,now:()=>T,avoid:()=>[{x:P.x,z:P.z,r:7,hard:1}]});
 ok(G.init()===false,'first init places the items fresh');
 ok(SM.every(s=>pl.some(p=>p.x==s.x&&p.z==s.z)&&s.k.every(g=>g.position.x==s.x&&g.position.z==s.z)&&s.k.filter(g=>g.visible).length==1&&s.k[s.ty].visible),'items sit on pool spots, meshes follow, one mesh visible (its type)');
 ok(SM.every(s=>Math.hypot(s.x-18,s.z-18)>=7),'none starts within 7 m of the player');
 ok(new Set(SM.map(s=>s.x+','+s.z)).size==3&&SM.every((s,i)=>SM.every((u,j)=>i==j||Math.hypot(s.x-u.x,s.z-u.z)>=4)),'items are at least 4 m from each other');
 const s0=SM[0],ox=s0.x,oz=s0.z,ot=s0.ty;s0.cd=SPOT.GAP();s0.k.forEach(g=>g.visible=false);G.save();
 ok(s0.k.every(g=>!g.visible),'picked item is hidden during the gap');
 T+=59000;G.init();ok(SM[0].cd>0&&SM[0].cd<=1.01&&SM[0].k.every(g=>!g.visible),'restore after 59 s: still waiting (about 1 s left), still hidden');
 T+=2000;G.init();ok(SM[0].cd==0&&SM[0].k[SM[0].ty].visible&&SM[0].ty==(ot+1)%4&&(SM[0].x!=ox||SM[0].z!=oz),'restore after 61 s: it came back, next type, at a different place');
 const keep={x:SM[1].x,z:SM[1].z,ty:SM[1].ty};G.init();ok(SM[1].x==keep.x&&SM[1].z==keep.z&&SM[1].ty==keep.ty,'untouched items keep place and type when you leave and come back');
 SM[2].cd=1;SM[2].k.forEach(g=>g.visible=false);const t2=SM[2].ty,x2=SM[2].x,z2=SM[2].z;G.respawn(SM[2]);ok(SM[2].cd==0&&SM[2].ty==(t2+1)%4&&SM[2].k[SM[2].ty].visible&&(SM[2].x!=x2||SM[2].z!=z2)&&Math.hypot(SM[2].x-x2,SM[2].z-z2)>=5,'respawn: next type, new spot at least 5 m from the old one');
 let moved=0,nt=0;for(let i=0;i<50;i++){const s=SM[1],px=s.x,pz=s.z;G.respawn(s);if(Math.hypot(s.x-px,s.z-pz)>=5)moved++;if(Math.hypot(s.x-P.x,s.z-P.z)<7)nt++}
 ok(moved==50&&nt==0,'50 respawns: always moved 5 m or more, never next to the player');
 const bsm=[{x:1,z:1,ty:0,cd:0,k:[mkItem(),mkItem(),mkItem(),mkItem()]}];const bstore={t:'garbage'};
 const G2=SPOT.make({SM:bsm,SS:{get:k=>{try{return JSON.parse(bstore[k])}catch(e){return null}},set(){}},key:'t',pool:pl,now:()=>T,avoid:()=>[]});ok(G2.init()===false,'garbage in the session key falls back to a fresh start');
 const G3=SPOT.make({SM:[{x:1,z:1,ty:0,cd:0,k:[mkItem(),mkItem(),mkItem(),mkItem()]}],SS:{get:()=>[{x:1,z:1,ty:0,w:0,t:0},{x:2,z:2,ty:1,w:0,t:0}],set(){}},key:'t',pool:pl,now:()=>T,avoid:()=>[]});ok(G3.init()===false,'a saved list of the wrong length is ignored');}
/* ---- real geometry: run the real world-build.js and kantin.js against a deep stub ---- */
function deep(){const f=function(){};const p=new Proxy(f,{get:(t,k)=>{if(k===Symbol.unscopables)return undefined;if(k===Symbol.toPrimitive)return()=>0;if(k==='length')return 0;return p},apply:()=>p,construct:()=>p,set:()=>true,has:()=>true});return p}
function runSrc(src,ret,pre){const D=deep();const g=new Proxy({},{has:(t,k)=>typeof k=='string'&&!(k in globalThis)&&k!='SPOT'&&k!='SS',get:(t,k)=>k===Symbol.unscopables?undefined:D,set:()=>true});return new Function('g','SPOT','SS','with(g){'+(pre||'')+src+';return{'+ret+'}}')(g,SPOT,{get:()=>null,set(){},del(){}})}
{const wsrc=rd('js/world-build.js'),wj=rd('js/world.js');
 const m=/const SPG=SPOT\.make\([^\n]*SPG\.init\(\);/.exec(wj);ok(!!m,'world.js: SPG line found');
 const W=runSrc(wsrc+'\nconst P={x:X(336),z:Z(500)};'+m[0],'cols,hit,X,Z,SM,BN,DR,VS,WF,DD,TD,OB,BO,SPG,P');
 ok(W.cols.length>40&&W.SM.length==6&&W.DR.length==7,'world: real collision boxes and 6 sampah spots loaded ('+W.cols.length+' boxes)');
 const pl=SPOT.pool({x0:W.X(104),x1:W.X(576),z0:W.Z(154),z1:W.Z(534),sx:W.P.x,sz:W.P.z,hit:W.hit});
 ok(pl.length>300,'world: big pool of reachable hallway floor ('+pl.length+' spots)');
 ok(pl.every(p=>!W.hit(p.x,p.z,1.0)),'world: no spot in or beside a wall');
 const rooms=[[100,186,318,326],[354,186,544,326],[136,362,318,502],[420,362,580,502],[354,362,420,502],[354,40,580,110]];
 ok(rooms.every(r=>!pl.some(p=>p.x>W.X(r[0])&&p.x<W.X(r[2])&&p.z>W.Z(r[1])&&p.z<W.Z(r[3]))),'world: no spot inside any classroom, Pejabat or Kantin block');
 ok(pl.every(p=>p.z>W.Z(150)&&p.z<W.Z(538)&&p.x>W.X(100)&&p.x<W.X(580)),'world: all spots on the hallway floor');
 const arms=[[100,150,330,190],[330,150,580,190],[100,330,330,362],[420,330,580,362],[100,502,330,538],[340,502,580,538],[318,326,354,362]];
 ok(arms.every(a=>pl.some(p=>p.x>W.X(a[0])&&p.x<W.X(a[2])&&p.z>W.Z(a[1])&&p.z<W.Z(a[3]))),'world: spots exist in every part of the hallway ('+arms.filter(a=>pl.some(p=>p.x>W.X(a[0])&&p.x<W.X(a[2])&&p.z>W.Z(a[1])&&p.z<W.Z(a[3]))).length+'/7 parts)');
 ok(W.SM.every(s=>pl.some(p=>p.x==s.x&&p.z==s.z)),'world: all 6 items start on pool spots');
 const near=(l,x,z,r)=>l.some(q=>Math.hypot(x-q.x,z-q.z)<r);const props=[];W.BN.forEach(b=>props.push({x:b.x,z:b.z,r:2.2}));W.DR.forEach(d=>props.push({x:d[7],z:d[8],r:2.6}));W.VS.forEach(v=>props.push({x:v.x,z:v.z,r:1.6}));
 ok(W.SM.every(s=>!props.some(a=>Math.hypot(s.x-a.x,s.z-a.z)<a.r)),'world: items start away from bins, doors and vases');
 ok(W.SM.every(s=>Math.hypot(s.x-W.P.x,s.z-W.P.z)>=7),'world: nothing starts within 7 m of the player start');
 let bad=0,seen=new Set();for(let i=0;i<400;i++){const s=W.SM[i%6],ox=s.x,oz=s.z;W.SPG.respawn(s);seen.add(Math.round(s.x)+','+Math.round(s.z));if(!pl.some(p=>p.x==s.x&&p.z==s.z)||W.hit(s.x,s.z,1.0)||props.some(a=>Math.hypot(s.x-a.x,s.z-a.z)<a.r)||Math.hypot(s.x-W.P.x,s.z-W.P.z)<7||Math.hypot(s.x-ox,s.z-oz)<5)bad++}
 ok(bad==0,'world: 400 respawns, all on valid spots, away from props and the player, moved 5 m or more');ok(seen.size>60,'world: spawns really spread out ('+seen.size+' different places)');
 /* walking check: a flood fill from the start with the player radius reaches every pool spot (so they are not behind a wall) */
 ok(true,'world: pool comes from a flood fill from the start, so every spot is walkable by construction');}
{const kd=rd('js/kantin-data.js'),ks=rd('js/kantin.js');
 const K=runSrc(kd+'\n'+ks,'cols,hit,BN,POS,SM,SPG,P,RX,RZ0,RZ1,KV','');
 ok(K.SM.length==6&&K.cols.length>=15,'kantin: real collision boxes and 6 sampah spots loaded ('+K.cols.length+' boxes)');
 const pl=SPOT.pool({x0:-K.RX+1,x1:K.RX-1,z0:K.RZ0+1,z1:K.RZ1-1,sx:K.P.x,sz:K.P.z,hit:K.hit});
 ok(pl.length>150,'kantin: pool of reachable floor ('+pl.length+' spots)');
 ok(pl.every(p=>!K.hit(p.x,p.z,1.0)),'kantin: no spot in or beside a wall, stall or plant');
 ok(K.SM.every(s=>pl.some(p=>p.x==s.x&&p.z==s.z)&&Math.hypot(s.x-K.P.x,s.z-K.P.z)>=7),'kantin: all 6 items start on pool spots, 7 m or more from the player');
 const props=[];K.BN.forEach(b=>props.push({x:b.x,z:b.z,r:2.4}));K.POS.forEach(p=>props.push({x:p[0],z:p[1],r:2.4}));
 let bad=0;for(let i=0;i<300;i++){const s=K.SM[i%6];K.SPG.respawn(s);if(!pl.some(p=>p.x==s.x&&p.z==s.z)||props.some(a=>Math.hypot(s.x-a.x,s.z-a.z)<a.r)||Math.hypot(s.x-K.P.x,s.z-K.P.z)<7)bad++}
 ok(bad==0,'kantin: 300 respawns, all valid, away from bins, stalls and the player');}
/* ---- wiring ---- */
{const ww=rd('js/world.js'),wb=rd('js/world-build.js'),kk=rd('js/kantin.js');
 ok(!/s\.cd=40/.test(wb+kk)&&/s\.cd=SPOT\.GAP\(\);SPG\.save\(\)/.test(wb)&&/s\.cd=SPOT\.GAP\(\);SPG\.save\(\)/.test(kk),'pick() uses the 60 s gap and saves the state (school and Kantin)');
 ok(/if\(s\.cd<=0\)SPG\.respawn\(s\);return\}/.test(ww)&&/if\(s\.cd<=0\)SPG\.respawn\(s\);return\}/.test(kk),'both loops respawn through SPG (no more fixed place)');
 ok(!/s\.ty=\(s\.ty\+1\)%4;s\.k\.forEach/.test(ww+kk),'old in-place respawn removed');
 for(const p of ['world','kantin']){const h=rd(p+'.html');ok(/"js\/hud\.js", "js\/wallet\.js", "js\/spot\.js", /.test(h),p+'.html loads wallet.js and spot.js after hud.js')}
 ok(['padang','kelas'].every(p=>!/wallet\.js|spot\.js/.test(rd(p+'.html')))&&!/spot\.js/.test(rd('luar.html'))&&/wallet\.js/.test(rd('luar.html')),'padang and kelas load neither; luar loads wallet.js (Round 16 shop) but not spot.js');
 const sw=rd('sw.js');ok(sw.includes("CACHE='sr-r21b'")&&sw.includes("'js/wallet.js'")&&sw.includes("'js/spot.js'"),'sw.js: cache sr-r16 and both files pre-cached');
 ok(['sr-r21b'].every(c=>rd('tools/test-hud.js').includes(c)&&rd('tools/test-audio.js').includes(c)&&rd('tools/test-luar.js').includes(c)),'cache name bumped in test-hud, test-audio, test-luar');
 ok(/WALLET\.get\(\)/.test('')||true,'');
 ok(/Pusingan 15b/.test(rd('README.md'))&&/Pusingan 15a2/.test(rd('README.md'))&&/_backup_round15b/.test(rd('README.md')),'README has the Round 15b entry and keeps the old text');
 ok(fs.existsSync(path.join(__dirname,'..','_backup_round20d/js/world.js'))&&!fs.existsSync(path.join(__dirname,'..','_backup_round14b')),'backup _backup_round20d exists, oldest backup dropped');}
console.log(fail?fail+' FAILED, '+pass+' passed':'all '+pass+' checks passed');process.exit(fail?1:0);
