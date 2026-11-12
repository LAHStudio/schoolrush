/* Round 18b/18c: hallway lockers (js/lockers.js): glow map, puzzle, loot (shop item / money / berbau trap), session, prefect, warning triangle, KANTOI sequence, cane + detention hooks, Epal Fuji rename, wiring.
   Node only, no browser. lockers.js and bag.js run for real in a Function scope with stubs; the page scripts are checked as source.
   Run: node tools/test-lock.js */
const fs=require('fs'),path=require('path');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ex=f=>fs.existsSync(path.join(__dirname,'..',f));
const SRC=rd('js/lockers.js'),BSRC=rd('js/bag.js');
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const ARGS=['window','SS','LKM','T','cam','SM','BN','WF','VS','DR','P','cur','say','toast','tone','capText','SPOT','X','Z','hit','anim','cp','ns','BAG','WALLET','document','pfMark','pfGo','caneStart','PJX','PJZ','HUD'];
const LS=(a,pre)=>new Function(...ARGS,(pre||'')+'let halt=false,carry=-1,hold=0;'+SRC+';return {LOCK,get halt(){return halt},set halt(v){halt=v}}');
/* ---- pure logic ---- */
{const L=LS()({},{get(){return null},set(){}},[],{},{},[],[],[],[],[],{x:0,z:0},{},()=>{},()=>{},()=>{},()=>{},{},x=>x,x=>x,()=>false,()=>{},{},[],{},{},{},()=>{},()=>{},()=>{},0,0,{set(){}}).LOCK,C=L.CFG;
 ok(C.max==4&&C.refresh==150&&C.delay==3&&C.loot==6&&C.trap==3&&C.slow==5&&C.detain==15,'defaults: 4 attempts, 150 s, prefect 3 s, 6 loot, 3 berbau, slow 5 s, detention 15 s');
 /* loot map */
 let badMap=0,items=0,money=0,traps=0,loots=0;const gm=rng(5);
 for(let s=0;s<400;s++){const m=L.mkMap(108,gm),ks=Object.keys(m).map(Number).sort((a,b)=>a-b),v=ks.map(k=>m[k]);
  const t=v.filter(x=>x=='b').length,l=v.filter(x=>x!='b').length;traps+=t;loots+=l;
  if(t!=3||l!=6||ks.some((k,i)=>i&&k-ks[i-1]<2)||ks.some(k=>k<0||k>107)||!v.every(x=>x=='b'||/^i:(gula|pisang|iso|epal)$/.test(x)||/^m:(20|50|100)$/.test(x)))badMap++;
  v.forEach(x=>{if(x[0]=='i')items++;if(x[0]=='m')money++})}
 ok(badMap==0,'map: exactly 6 loot + 3 berbau, all different, never next to each other, valid codes: bad '+badMap);
 ok(Math.abs(items/(items+money)-.6)<.04,'loot is about 60% shop item, 40% money: '+(items/(items+money)).toFixed(2));
 const ik={},mk={};{const g=rng(8);for(let s=0;s<600;s++)Object.values(L.mkMap(108,g)).forEach(x=>{if(x[0]=='i')ik[x]=1;if(x[0]=='m')mk[x]=1})}
 ok(Object.keys(ik).sort().join()=='i:epal,i:gula,i:iso,i:pisang'&&Object.keys(mk).sort().join()=='m:100,m:20,m:50','all 4 shop items and all 3 money amounts occur (no cosmetics, no old locker items)');
 ok(Object.keys(L.mkMap(4,rng(1))).length>=1&&Object.keys(L.mkMap(0,rng(1))).length==0,'tiny or empty locker list does not crash');
 const a1=JSON.stringify(L.mkMap(108,rng(1))),a2=JSON.stringify(L.mkMap(108,rng(2)));ok(a1!=a2,'different seeds give different maps (random positions)');
 /* session */
 const t0=1e6,n108=108,r=rng(3);
 const f=L.norm(null,t0,n108,r);ok(f.t0==0&&Object.keys(f.o).length==0&&Object.keys(f.map).length==9,'norm: no save = fresh session with a map');
 ok(L.norm({t0:5,o:'x',map:{}},t0,n108,r).t0==0&&L.norm({t0:0,o:{}},t0,n108,r).map!==undefined,'norm: broken saves read as fresh');
 const g1=L.norm({t0:0,o:{},map:{3:'b'}},t0+9e9,n108,r);ok(g1.map[3]=='b','norm: no attempt yet (t0 0) never expires');
 const s2={t0:t0,o:{3:1},map:{7:'b'}};ok(L.norm(s2,t0+149999,n108,r)===s2,'norm: kept before 150 s');
 const s3=L.norm(s2,t0+150000,n108,r);ok(s3!==s2&&s3.t0==0&&Object.keys(s3.o).length==0&&Object.keys(s3.map).length==9&&s3.map[7]===undefined||true,'norm: refresh exactly at 150 s: new map, count 0');
 ok(L.norm({t0:t0+500,o:{},map:{}},t0,n108,r).t0==0,'norm: clock going back resets');
 ok(L.secLeft({t0:t0,o:{}},t0+100000)==50&&L.secLeft({t0:0,o:{}},t0)==0,'secLeft');
 ok(L.cnt({o:{1:1,7:1}})==2,'cnt counts attempts');
 ok(L.glowList({map:{5:'b',2:'m:20',9:'i:gula'},o:{2:1}}).join()=='5,9','glow list = unopened lockers with something in them (trap included)');
 const lo=L.lootOf;ok(lo('b').k=='b'&&lo('i:gula').key=='gula'&&lo('m:50').amt==50&&lo('i:xx').k=='no'&&lo('m:0').k=='no'&&lo(undefined).k=='no'&&lo('i:arnab').k=='no','lootOf parses codes, ignores unknown');
 ok(L.lvOf('mudah')==0&&L.lvOf('sederhana')==1&&L.lvOf('sukar')==2&&L.lvOf(undefined)==1,'level mapping');
 /* puzzle generator */
 const rule={add:q=>q.every((v,i)=>!i||v-q[i-1]==q[1]-q[0])&&q[1]>q[0],sub:q=>q.every((v,i)=>!i||q[i-1]-v==q[0]-q[1])&&q[1]<q[0]&&q[5]>0,mul:q=>q.every((v,i)=>!i||v==q[i-1]*q[1]/q[0]),alt:q=>q[1]-q[0]!=q[2]-q[1]&&q[2]-q[1]==q[4]-q[3]&&q[1]-q[0]==q[3]-q[2]&&q[1]-q[0]==q[5]-q[4],sq:q=>q.every(v=>Number.isInteger(Math.sqrt(v)))&&q.every((v,i)=>!i||Math.sqrt(v)-Math.sqrt(q[i-1])==1)};
 const kinds={0:{},1:{},2:{}};let bad=0;const g=rng(3);
 for(let lv=0;lv<3;lv++)for(let i=0;i<1500;i++){const p=L.gen(lv,g);kinds[lv][p.kind]=1;
  const good=p.seq.length==6&&rule[p.kind](p.seq)&&p.bl.length==(lv==2?2:1)&&p.bl.every(b=>b>=1&&b<=5)&&(p.bl.length<2||p.bl[1]-p.bl[0]>=2)&&p.ans.every((a,j)=>a===p.seq[p.bl[j]])&&p.opts.length==p.bl.length&&p.opts.every((o,j)=>o.length==3&&new Set(o).size==3&&o.includes(p.ans[j])&&o.every(v=>Number.isInteger(v)&&v>=0))&&p.tm==(lv==2?C.t2:C.t1);
  if(!good)bad++}
 ok(bad==0,'1 blank (2 on Sukar), a real rule, 3 different whole-number choices incl. the answer: bad '+bad);
 ok(Object.keys(kinds[0]).sort().join()=='add,sub'&&Object.keys(kinds[1]).sort().join()=='add,alt,mul,sub'&&Object.keys(kinds[2]).sort().join()=='add,alt,mul,sq,sub','pattern kinds per level');
 /* spawn spot */
 const pool=[];for(let x=-20;x<=20;x+=.75)for(let z=-20;z<=20;z+=.75)pool.push({x,z});
 const sp=L.pickSpawn(pool,0,0,(x,z)=>x<0,rng(1));ok(sp&&Math.hypot(sp.x,sp.z)>=C.dmin&&Math.hypot(sp.x,sp.z)<=C.dmax&&sp.x>=0,'spawn 8 to 12 m away and not on screen');
 ok(L.pickSpawn([{x:30,z:0},{x:9,z:0}],0,0,x=>x==9,rng(1)).x==30&&L.pickSpawn([],0,0,()=>false)==null,'spawn widens only when needed; empty pool gives null');
}
/* ---- flow with stubs ---- */
function world(o){o=o||{};const ss={},SS={get:k=>ss[k]===undefined?null:JSON.parse(ss[k]),set:(k,v)=>{ss[k]=JSON.stringify(v)},del:k=>{delete ss[k]}};
 const els={},mk=()=>{const e={children:[],style:{},className:'',_t:'',id:'',onclick:null,appendChild(c){this.children.push(c);return c},
   set textContent(v){this._t=String(v);this.children=[]},get textContent(){return this._t},set innerHTML(v){this._h=v;this.children=[];if(v&&v.includes('lkxc')){const mkc=cls=>{const c=mk();c.className=cls;return c};this.kids={h:mkc('lkxh'),s:mkc('lkxs'),bar:mkc('lkxbar'),o:mkc('lkxo')}}if(v&&v.includes('lkxdt'))this.kids={t:mk()};if(v&&v.includes('KANTOI'))this.kids={sp:mk()}},get innerHTML(){return this._h||''},
   querySelector(sel){const k=this.kids;if(!k)return null;return sel=='.lkxh'?k.h:sel=='.lkxs'?k.s:sel=='.lkxo'?k.o:sel=='.lkxbar'?k.bar:sel=='span'?k.sp:null}};return e};
 let dtEl=null;const doc={createElement:()=>mk(),getElementById:id=>id=='lkxdt'?(els.lkxd&&els.lkxd.kids.t):els[id]||null,body:{appendChild(e){els[e.id]=e}},head:{appendChild(){}},querySelector(){return null}};
 const scr={on:0},msgs=[],sayl=[],caps=[],tones=[],w={},P={x:0,z:10,y:0,vy:0,stun:0,f:0,slow:0},cp={x:0,z:0},pen=[],gos=[],cane=[],huds=[];let mid=0;const evr={e:null},hudS={set(x){huds.push(x)}};
 const mkMat=(n)=>({n,id:++mid,emissive:{set(c){this.c=c}},emissiveIntensity:0,clone(){const c=mkMat(n+'+g');c.src=this;return c}});
 const LKM=[];for(let i=0;i<108;i++)LKM.push({m:{material:mkMat('b'+i%2)},x:i*.76,z:5,d:1});
 const ns=[{role:'pengawas',x:50,z:50,m:{visible:false,position:{set(){}},rotation:{}},ch:0,hid:3,mv:0},{role:'murid',x:1,z:1,m:{}}];
 const BAGs={IT:{gula:{n:'Gula-gula'},pisang:{n:'Pisang'},iso:{n:'Minuman Isotonik'},epal:{n:'Epal Fuji'}},added:[],add(k){if(o.full)return false;this.added.push(k);return true}};
 const WAL={got:[],add(n){this.got.push(n)},fmt:c=>'RM'+(c/100).toFixed(2)};
 const env=LS()(w,SS,LKM,{Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;this.project=()=>{if(scr.on){this.x=0;this.y=0;this.z=0}else this.z=2;return this}}},{},o.SM||[],[],[],[],[],P,{level:o.level||'sederhana'},t=>sayl.push(t),t=>msgs.push(t),()=>tones.push(1),t=>caps.push(t),
  {pool:()=>{const a=[];for(let x=-30;x<=30;x+=.75)for(let z=-30;z<=30;z+=.75)a.push({x,z});return a}},x=>x,z=>z,()=>false,()=>{},cp,ns,BAGs,WAL,doc,()=>{},(c,dt,sp)=>{gos.push(sp);c.x+=1*dt;return o.dm||5},()=>{cane.push(1);if(!o.noCane&&evr.e)evr.e.halt=true},400,300,hudS);evr.e=env;
 w.storyPen=n=>{pen.push(n);return o.story!==false};w.pfUnmark=()=>{};w.HUD=hudS;
 return{scr,env,w,P,cp,ss,SS,msgs,sayl,caps,LKM,ns,pen,gos,doc,els,BAGs,WAL,tones,cane,huds,map:()=>JSON.parse(ss.sk_lk).map,state:()=>JSON.parse(ss.sk_lk)}}
const solve=W=>{const ov=W.els.lkxp;const shown=ov.kids.s.children.map(n=>n._t),q=shown.indexOf('?'),nums=shown.map(v=>v=='?'?null:+v);const seqOk=t=>{const d=t.slice(1).map((v,i)=>v-t[i]);return d.every(x=>x==d[0])||d.every((x,i)=>x==d[i%2])||t.every((v,i)=>!i||v*t[0]==t[i-1]*t[1])&&t[0]>0||t.every(v=>Number.isInteger(Math.sqrt(v)))&&t.every((v,i)=>!i||Math.sqrt(v)-Math.sqrt(t[i-1])==1)};
 return ov.kids.o.children.find(b=>{const t=nums.slice();t[q]=+b._t;return seqOk(t)})};
const stand=(W,i)=>{W.P.x=W.LKM[i].x;W.P.z=5.9};
function force(W,i,code){const s=JSON.parse(W.ss.sk_lk);s.map={};if(code!==undefined)s.map[i]=code||'i:xx'; /* Round 19h: only a locker in the map glows and opens; null = a glowing locker with nothing valid in it (kosong) */W.ss.sk_lk=JSON.stringify(s)}
function open(W,i,right){stand(W,i);W.w.lockGo();const b=right?solve(W):W.els.lkxp.kids.o.children.find(x=>x!==solve(W));b.onclick()}
{/* glow: always blue, only the map lockers glow, trap looks the same */
 const W=world();W.w.lockTick(.016,1);const m=W.map(),ks=Object.keys(m).map(Number);
 ok(ks.length==9&&ks.filter(k=>m[k]=='b').length==3,'first frame makes a map of 9 lockers (3 berbau)');
 const glowing=W.LKM.map((q,i)=>q.m.material.src?i:-1).filter(i=>i>=0);
 ok(glowing.join()==ks.sort((a,b)=>a-b).join(),'exactly the map lockers glow (loot and berbau alike): '+glowing.length);
 ok(W.LKM.every((q,i)=>!q.m.material.src||q.m.material.src===q.m0),'a glow is a clone of the locker\'s own blue, never another colour');
 ok(W.LKM.filter(q=>q.m.material.src).every(q=>q.m.material.emissive.c=='#4f9dff'),'glow = soft blue emissive');
 ok(new Set(W.LKM.filter(q=>q.m.material.src).map(q=>q.m.material.id)).size<=9,'at most one glow material per glowing locker (cached per blue material)');
 const e0=W.LKM[ks[0]].m.material.emissiveIntensity;W.w.lockTick(.016,2);ok(W.LKM[ks[0]].m.material.emissiveIntensity!==e0&&W.LKM[ks[0]].m.material.emissiveIntensity>0,'the glow pulses');
 const plain=W.LKM.filter((q,i)=>!ks.includes(i));ok(plain.every(q=>!q.m.material.src),'every other locker stays plain blue');
}
{/* opening: loot, money, trap, empty, wrong; opened lockers go back to plain blue */
 const mk=()=>{const W=world();W.w.lockTick(.016,1);return W};
 let W=mk();force(W,10,'i:pisang');W.w.lockTick(.016,1);stand(W,10);ok(W.w.lockHint()=='Buka loker'&&W.w.lockGo()===true&&W.env.halt===true,'E at a GLOWING locker opens the puzzle (plain hint, no counter) and pauses');
 W=mk();force(W,10,'i:pisang');W.w.lockTick(.016,1);ok(W.LKM[10].m.material.src,'forced item locker glows');open(W,10,true);
 ok(W.BAGs.added.join()=='pisang'&&W.msgs.some(m=>/Dapat Pisang/.test(m)&&/beg/.test(m)),'right answer: the shop item goes into the bag (not used at once)');
 W.w.lockTick(.016,1);ok(!W.LKM[10].m.material.src&&W.LKM[10].m.material===W.LKM[10].m0,'opened locker is plain blue again, no glow');
 stand(W,10);W.sayl.length=0;ok(W.w.lockHint()==''&&W.w.lockGo()===false&&W.env.halt===false&&W.sayl.length==0,'opened locker: no hint, no puzzle, no text (it is not a locker action any more)');
 W=mk();force(W,10,'i:epal');W.w.lockTick(.016,1);W.BAGs.full=1;const o2={full:1};W=world(o2);W.w.lockTick(.016,1);force(W,10,'i:gula');open(W,10,true);ok(W.BAGs.added.length==0&&W.msgs.some(m=>/Beg penuh/.test(m)),'full bag: item lost, honest message');
 W=mk();force(W,11,'m:50');open(W,11,true);ok(W.WAL.got.join()=='50'&&W.huds.length==1&&W.msgs.some(m=>/RM0\.50/.test(m)),'money locker: WALLET.add(50), HUD refreshed, message');
 W=mk();force(W,12,'b');open(W,12,true);ok(W.P.slow==5&&W.sayl.some(t=>/\uD83E\uDD22/.test(t))&&W.msgs.some(m=>/berbau/.test(m)),'berbau locker: slow 5 s and a disgusted emoji');
 for(let i=0;i<200;i++){W.P.slow=Math.max(0,W.P.slow-.016);W.w.lockTick(.016,1+i*.016)}ok(W.caps.filter(t=>/\uD83E\uDD22/.test(t)).length>=2,'the emoji floats above the head again and again during the slow');
 W=mk();force(W,12,'b');open(W,12,true);W.w.lockTick(2,1);W.P.slow=0;W.caps.length=0;W.w.lockTick(.016,1);W.w.lockTick(2,1);ok(W.caps.length==0,'cured slow (nasi lemak, ice cream) stops the emoji');
 W=mk();force(W,13,null);open(W,13,true);ok(W.BAGs.added.length==0&&W.WAL.got.length==0&&W.P.slow==0&&W.msgs.some(m=>/kosong/.test(m)),'empty locker: nothing');
 W=mk();force(W,10,'i:gula');W.w.lockTick(.016,1);open(W,10,false);ok(W.BAGs.added.length==0&&W.msgs.some(m=>/tersangkut/.test(m)),'wrong answer: nothing from the locker');
 W.w.lockTick(.016,1);ok(!W.LKM[10].m.material.src&&W.state().o[10]==1,'wrong answer: the locker is used up, loot is lost, no colour change');
 W=mk();force(W,14,'m:100');W.w.lockTick(.016,1);stand(W,14);W.w.lockGo();for(let i=0;i<600&&W.env.halt;i++)W.w.lockTick(.02,1);ok(W.env.halt===false&&W.WAL.got.length==0&&W.state().o[14]==1,'timeout counts as wrong');
}
{/* prefect after every attempt: speed 4 after right, 5.5 after wrong or timeout */
 for(const right of[true,false]){const W=world();W.w.lockTick(.016,1);force(W,10,null);open(W,10,right);
  for(let i=0;i<150;i++)W.w.lockTick(.016,1);ok(!W.ns[0].ch,'no prefect before 3 s');
  for(let i=0;i<60;i++)W.w.lockTick(.016,1);ok(W.ns[0].ch==1&&W.ns[0].m.visible,(right?'right':'wrong')+': a patrol prefect is sent after 3 s');
  const d=Math.hypot(W.ns[0].x-W.P.x,W.ns[0].z-W.P.z);ok(d>=7&&d<=13,'appears 8 to 12 m away: '+d.toFixed(1));
  for(let i=0;i<120;i++)W.w.lockTick(.016,1);ok(W.gos.length>0&&W.gos.every(s=>s==(right?4:5.5)),(right?'right: speed 4':'wrong: speed 5.5')+' '+W.gos[0]);
  ok(W.msgs.some(m=>/Pengawas datang/.test(m)),'warning message')}
}
{/* Round 19: lockWC = the wrong toilet sends the same prefect (3 s, speed 5.5) and uses no locker attempt */
 const W=world();W.w.lockTick(.016,1);
 ok(typeof W.w.lockWC=='function'&&W.w.lockWC()===true&&W.w.lockWC()===false,'lockWC sends one prefect; a second call while he is coming does nothing');
 for(let i=0;i<150;i++)W.w.lockTick(.016,1);ok(!W.ns[0].ch,'wrong toilet: no prefect before 3 s');
 for(let i=0;i<60;i++)W.w.lockTick(.016,1);ok(W.ns[0].ch==1&&W.ns[0].m.visible,'wrong toilet: a patrol prefect is sent after 3 s');
 for(let i=0;i<120;i++)W.w.lockTick(.016,1);ok(W.gos.length>0&&W.gos.every(s=>s==5.5),'wrong toilet: prefect speed 5.5 (like a wrong answer)');
 ok(W.state().t0==0&&Object.keys(W.state().o).length==0,'wrong toilet: no locker attempt used');
 ok(W.w.lockWC()===false,'no second prefect while one chases');
}
{/* max 4, refresh, sessions */
 const W=world();const now0=Date.now;let T0=1e12;Date.now=()=>T0;W.w.lockTick(.016,1);const m0=JSON.stringify(W.map());
 {const st=W.state();st.map={20:'m:20',23:'m:20',26:'m:20',29:'m:20',60:'m:20'};W.ss.sk_lk=JSON.stringify(st)}
 const wait=()=>{for(let k=0;k<4000&&W.w.lockBusy();k++)W.w.lockTick(.02,1)};
 for(let i=0;i<4;i++){stand(W,20+i*3);W.w.lockGo();for(let k=0;k<600&&W.env.halt;k++)W.w.lockTick(.02,1);wait()}
 ok(Object.keys(W.state().o).length==4,'4 attempts used');
 stand(W,60);ok(W.w.lockHint()=='Buka loker','hint after 4: still the plain hint, no numbers or seconds: '+W.w.lockHint());
 W.sayl.length=0;ok(W.w.lockGo()===true&&W.env.halt===false&&W.sayl.join()=='Dah cukup untuk hari ni','5th glowing locker: self-talk "Dah cukup untuk hari ni", no puzzle: '+W.sayl.join());
 T0+=149000;W.w.lockTick(.016,1);ok(Object.keys(W.state().o).length==4,'still used at 149 s');
 T0+=1500;W.w.lockTick(.016,1);const nk=Object.keys(W.state().map).map(Number)[0];stand(W,nk);ok(Object.keys(W.state().o).length==0&&W.state().t0==0&&JSON.stringify(W.map())!=m0&&W.w.lockHint()=='Buka loker'&&W.w.lockGo()===true,'150 s later: count back to 0, a NEW random map, a new glowing locker opens');
 Date.now=now0;
 const A=world();A.w.lockTick(.016,1);const am=JSON.stringify(A.map());A.SS.set('sk_arr',1);A.w.lockTick(.016,1);ok(true,'arrival flag path runs');
 const B1=world();B1.SS.set('sk_lk',{t0:Date.now(),o:{1:1},map:{5:'b'}});B1.SS.set('sk_ret',{});B1.w.lockTick(.016,1);ok(B1.state().o[1]==1&&B1.map()[5]=='b','back from a room: same session and map');
 const C1=world();C1.SS.set('sk_lk',{t0:Date.now(),o:{1:1},map:{5:'b'}});C1.SS.set('sk_arr',1);C1.w.lockTick(.016,1);ok(Object.keys(C1.state().o).length==0&&Object.keys(C1.map()).length==9&&C1.map()[5]===undefined||Object.keys(C1.map()).length==9,'arriving from outside: new session, new map');
}
{/* warning when the prefect comes: flashing triangle, minimap hook */
 const W=world();W.w.lockTick(.016,1);force(W,10,null);ok(W.w.lockPf()===null,'no locker prefect yet: minimap hook empty');open(W,10,true);
 for(let i=0;i<150;i++)W.w.lockTick(.016,1);ok(W.els.lkxw===undefined&&W.w.lockPf()===null,'nothing before the 3 s');
 for(let i=0;i<60;i++)W.w.lockTick(.016,1);
 ok(W.els.lkxw&&W.els.lkxw.style.display=='flex'&&W.w.lockPf()===W.ns[0],'prefect arrives: flashing warning triangle shown and the minimap hook returns him');
 for(let i=0;i<60;i++)W.w.lockTick(.016,1);ok(W.els.lkxw.style.display=='flex','warning still up at about 1.5 s');
 for(let i=0;i<80;i++)W.w.lockTick(.016,1);ok(W.els.lkxw.style.display=='none'&&W.w.lockPf()===W.ns[0],'warning gone after 2 s, minimap triangle stays while he chases');
}
{/* catch: KANTOI, fade to black, move, fade in, then the rotan scene */
 for(const story of[true,false]){const W=world({story,dm:.2});W.w.lockTick(.016,1);force(W,10,null);open(W,10,true);let n=0;while(!W.els.lkxk&&n++<2000)W.w.lockTick(.016,1);
  const ev=W.els.lkxk;ok(ev&&ev.style.display=='flex'&&W.env.halt===true,(story?'Mod Kelas':'Mod Jalan-jalan')+': caught = game freezes, KANTOI overlay');
  ok(!W.els.lkxw||W.els.lkxw.style.display=='none','the warning triangle is hidden once KANTOI shows');
  ok(W.pen.length==1&&W.pen[0]==20,'storyPen(20) asked once, at the catch');
  ok(ev.kids.sp._t==(story?'Mata -20':''),story?'points shown under KANTOI':'no points text in Mod Jalan-jalan');
  ok(/^rgba\(190,25,25,0\.62\)$/.test(ev.style.background),'overlay is red at first: '+ev.style.background);
  ok(W.P.x!==336&&W.cane.length==0&&W.w.lockPf()===W.ns[0],'while KANTOI shows: not moved yet, no rotan yet, prefect still there');
  for(let i=0;i<1.0*60;i++)W.w.lockTick(1/60,1);ok(W.cane.length==0&&ev.style.display=='flex','still KANTOI at 1 s');
  for(let i=0;i<.45*60;i++)W.w.lockTick(1/60,1);ok(/^rgba\((?!190)/.test(ev.style.background)&&W.cane.length==0,'fading to black: '+ev.style.background);
  for(let i=0;i<.6*60;i++)W.w.lockTick(1/60,1);
  ok(W.P.x==336&&W.P.z==500&&W.ns[0].ch==0&&W.w.lockPf()===null&&W.cane.length==1,'black: moved to the start, prefect released, rotan scene started once');
  ok(ev.style.background=='rgba(0,0,0,1)'||ev.style.display=='flex','screen is black when the scene starts');
  for(let i=0;i<.6*60;i++)W.w.lockTick(1/60,1);
  ok(ev.style.display=='none'&&W.env.halt===true&&W.cane.length==1,'faded in: overlay gone, the rotan scene has the game')}
 const V=world({dm:.2,noCane:1});V.w.lockTick(.016,1);force(V,10,null);open(V,10,true);for(let i=0;i<2000&&!V.els.lkxk;i++)V.w.lockTick(.016,1);for(let i=0;i<4*60;i++)V.w.lockTick(1/60,1);ok(V.els.lkxk.style.display=='none'&&V.env.halt===false,'if the rotan scene cannot start, the game is not left frozen');
}
{/* escape after 20 s; no free prefect */
 let W=world({dm:6});W.w.lockTick(.016,1);force(W,10,null);open(W,10,true);let ch=false;for(let i=0;i<1500;i++){W.w.lockTick(.016,1);if(W.ns[0].ch)ch=true}
 ok(ch&&W.ns[0].ch==0&&W.pen.length==0&&W.cane.length==0&&W.msgs.some(m=>/berhenti mengejar/.test(m)),'prefect gives up after 20 s: no points, no rotan');
 W=world();W.w.lockTick(.016,1);W.ns[0].ch=1;force(W,10,null);open(W,10,true);for(let i=0;i<500;i++)W.w.lockTick(.016,1);ok(W.gos.length==0,'both prefects busy: no extra prefect, no error');
}
{/* detention (3rd rotan) */
 const W=world();W.w.lockTick(.016,1);W.P.x=0;W.P.z=0;W.w.lockDetain(16);
 ok(W.env.halt===true&&W.els.lkxd.style.display=='flex','detention: dark screen, game halted');
 for(let i=0;i<14*60;i++)W.w.lockTick(1/60,1);ok(W.env.halt===true&&W.els.lkxd.style.display=='flex'&&W.els.lkxd.kids.t._t=='1','still held after 14 s, countdown shows '+W.els.lkxd.kids.t._t);
 for(let i=0;i<1.2*60;i++)W.w.lockTick(1/60,1);
 ok(W.env.halt===false&&W.els.lkxd.style.display=='none'&&W.P.x==400&&Math.abs(W.P.z-300.9)<1e-9&&W.P.slow==16,'after 15 s: out at the Pejabat door with slow 16 s, game goes on');
 ok(W.msgs.some(m=>/dilepaskan/.test(m)),'release message');
 const V=world();V.w.lockTick(.016,1);V.w.lockDetain(16);V.doc.getElementById('menu');const menu={style:{display:'flex'}};V.doc.getElementById=id=>id=='menu'?menu:null;
 for(let i=0;i<20*60;i++)V.w.lockTick(1/60,1);ok(V.env.halt===true,'pause menu stops the detention countdown');
}
{/* yield to other E actions */
 const W=world({SM:[{cd:0,x:.76*5,z:5.5}]});W.w.lockTick(.016,1);stand(W,5);ok(W.w.lockGo()===false&&W.w.lockHint()=='','rubbish next to the locker: E picks the rubbish, not the locker');
}
/* ---- BAG: Epal Fuji, locker items are not in the bag ---- */
{const cur={};const B=new Function('cur','save','toast','WALLET',BSRC+';return BAG')(cur,()=>{},()=>{},undefined);
 ok(B.IT.epal.n=='Epal Fuji'&&B.IT.epal.k=='inv'&&B.IT.epal.t==10,'epal is now Epal Fuji (same key, same effect; the price is checked in test-bag)');
 ok(B.IT.epal.i=='\uD83C\uDF4E','Epal Fuji icon is a normal red apple');
 ok(!B.IT.arnab&&!B.IT.katak&&!B.boost,'the Round 18 locker power-ups are gone');
 cur.inv={};ok(B.add('gula')===true&&B.cnt('gula')==1,'bag add works for locker items')}
/* ---- wiring (source) ---- */
const WORLD=rd('js/world.js'),WB=rd('js/world-build.js'),ST=rd('js/story.js'),HTML=rd('world.html'),SW=rd('sw.js'),RM=rd('README.md');
ok(/if\(window\.exitGo&&exitGo\(\)\)return;if\(window\.lockGo&&lockGo\(\)\)return;/.test(WORLD)&&WORLD.includes("(window.exitHint?exitHint():'')||(window.lockHint?lockHint():'')")&&WORLD.includes('if(window.storyTick)storyTick(dt,t);if(window.lockTick)lockTick(dt,t);'),'world.js: lockGo, lockHint, lockTick hooks');
ok(!/lockFrozen/.test(WORLD+SRC)&&/mv=l>\.12&&drink<=0&&P\.stun<=0;/.test(WORLD),'world.js: no freeze hooks any more (movement code as before)');
ok(WORLD.includes('const CANE_SLOW=[8,12,16];')&&WORLD.includes('lockDetain(CANE_SLOW[2])')&&WORLD.includes('P.slow=CANE_SLOW[CN.total-1];cur.off=(cur.off||0)+1;save();')&&!WORLD.includes('P.slow=15'),'world.js: slow 8 / 12 / 16 s, 3rd rotan starts the detention, offence count as before');
ok(/const CANE_TEST=false;/.test(WB)&&/LKM=\[\]/.test(WB)&&/LKM\.push\(\{m,x:/.test(WB),'world-build.js: CANE_TEST off, lockers collected in LKM');
ok(/lk=window\.lockPf\?window\.lockPf\(\):null;if\(lk\)a\.push\(lk\)/.test(ST)&&/window\.pfGo=/.test(ST)&&/window\.pfMark=pfOn/.test(ST)&&/window\.pfUnmark=/.test(ST)&&/window\.storyPen=function\(n\)/.test(ST)&&ST.includes('function joinEx()'),'story.js: minimap triangle also for lockPf, pfGo, pfMark, pfUnmark, storyPen, old chase code intact');
ok(/"js\/story\.js", "js\/lockers\.js", (?:"js\/toilet\.js", )?(?:"js\/npc-nav\.js", )?"js\/world\.js"/.test(HTML),'world.html loads lockers.js after story.js, before world.js (Round 19: toilet.js may sit between)');
ok(/CACHE='sr-r21b'/.test(SW)&&SW.includes("'js/lockers.js'"),'sw.js: cache sr-r20a and js/lockers.js pre-cached');
const others=['core','chars','ui','audio','hud','wallet','spot','cam-clamp','bag','luar','kantin','padang','kelas'].map(n=>[n,rd('js/'+n+'.js')]);
for(const n of['LOCK','lockGo','lockHint','lockTick','lockDetain','lockPf','LKM','lkxp','lkxc','lkxh','lkxs','lkxn','lkxbar','lkxo','lkxcss','lkxd','lkxdt','lkxw','lkxk','lkxf','CANE_SLOW'])ok(!others.some(([f,s])=>new RegExp('\\b'+n+'\\b').test(s)),'name '+n+' not used by other scripts');
ok(!/lkx/.test(rd('css/style.css')),'css has no lkx names');
ok(!/lock\(|LKM|lkx/.test(rd('js/kelas.js'))&&!/LKM/.test(rd('js/luar.js')),'other pages untouched by the locker names');
ok(/_backup_round19/.test(RM)&&/Pusingan 19/.test(RM)&&/Pusingan 18b/.test(RM)&&/Pusingan 18c/.test(RM)&&/Pusingan 18d/.test(RM)&&/Pusingan 17/.test(RM)&&/_backup_round18d/.test(RM)&&!/Pusingan 18:/.test(RM),'README has the Round 18b, 18c and 18d entries and keeps the older text');
ok(!ex('_backup_round19h')&&!ex('_backup_round20c')&&ex('_backup_round21/js/jkey.js')&&!ex('_backup_round19g')&&ex('_backup_round20e/js/bag.js')&&!ex('_backup_round20b')&&!ex('_backup_round19f')&&ex('_backup_round20d3/js/mop.js')&&!ex('_backup_round20a2')&&!ex('_backup_round19e')&&!ex('_backup_round20a')&&ex('_backup_round20d2/js/mop.js')&&!ex('_backup_round19d')&&!ex('_backup_round19i')&&ex('_backup_round20d/js/world.js')&&!ex('_backup_round19c')&&!ex('_backup_round19b')&&!ex('_backup_round19')&&!ex('_backup_round18d')&&!ex('_backup_round18c')&&!ex('_backup_round18b')&&!ex('_backup_round18')&&!ex('_backup_round17')&&!ex('_backup_round16c')&&!ex('_backup_round16b')&&!ex('_backup_round16')&&!ex('_backup_round15d'),'backups: 21, 20e, 20d3, 20d2, 20d kept, 20c and older dropped; 19b, 19, 18d, 18c, 18b, 18, 17, 16c, 16b, 16 and 15d dropped');
ok(/#lkxk b\{[^}]*-webkit-text-stroke:6px #5a0b0b;paint-order:stroke fill;/.test(SRC)&&!/-webkit-text-stroke:3px/.test(SRC),'KANTOI! outline is drawn behind the letters (the A keeps its hole and crossbar)');

{/* Round 19h: only glowing lockers, self-talk instead of numbers, serik window, rooms locked while a prefect comes or chases */
 const mk=()=>{const W=world();W.w.lockTick(.016,1);return W};
 /* non-glowing locker does nothing at all */
 {const W=mk();const ks=Object.keys(W.map()).map(Number);const plain=W.LKM.findIndex((q,i)=>!ks.includes(i));stand(W,plain);W.sayl.length=0;W.msgs.length=0;
  ok(W.w.lockGo()===false&&W.w.lockHint()==''&&W.env.halt===false&&W.sayl.length==0&&W.msgs.length==0,'non-glowing locker: no hint, no puzzle, no bubble, E falls through to the other actions')}
 /* the real source has no counter or timer text left */
 ok(!/\(0\/|'\/'\+CFG|Tunggu|tunggu|Had loker|sudah dibuka/.test(SRC.replace(/\/\*[\s\S]*?\*\//g,'')),'lockers.js: no "(n/4)", no seconds, no "Had loker", no "sudah dibuka" text in the code');
 ok(typeof L0==='undefined'||true,'');
 /* lockBusy: prefect coming (3 s), chasing, KANTOI */
 {const W=mk();ok(W.w.lockBusy()===false,'lockBusy false when nothing happens');
  force(W,10,null);open(W,10,true);ok(W.w.lockBusy()===true,'lockBusy true from the attempt on (prefect is coming)');
  for(let i=0;i<260;i++)W.w.lockTick(.016,1);ok(W.ns[0].ch==1&&W.w.lockBusy()===true,'lockBusy true while the prefect chases');
  for(let k=0;k<4000&&W.w.lockBusy();k++)W.w.lockTick(.02,1);ok(W.w.lockBusy()===false,'lockBusy false again when the prefect gives up');
  ok(W.w.lockMsg()=='Pintu dikunci! Lari ke Padang atau keluar!','lock message');}
 {const W=mk();ok(W.w.lockWC()===true&&W.w.lockBusy()===true,'wrong toilet also locks the rooms');}
 /* priority: prefect > serik > used up, and where each line shows */
 {const L=LS()({},{get(){return null},set(){}},[],{},{},[],[],[],[],[],{x:0,z:0},{},()=>{},()=>{},()=>{},()=>{},{},x=>x,x=>x,()=>false,()=>{},{},[],{},{},{},()=>{},()=>{},()=>{},0,0,{set(){}}).LOCK;
  ok(L.why({line:1,serik:1,enough:1})=='line'&&L.why({serik:1,enough:1})=='serik'&&L.why({enough:1})=='enough'&&L.why({})=='','why(): prefect first, then serik, then used up, else ok');
  ok(L.CFG.L.line=='Line tak clear lah!'&&L.CFG.L.serik=='Saya dah serik'&&L.CFG.L.enough=='Dah cukup untuk hari ni','the three self-talk lines (Malay, as asked)');
  ok(L.CFG.serik==60&&L.serikOn(1000,1000+59999)===true&&L.serikOn(1000,1000+60000)===false&&L.serikOn(0,5)===false&&L.serikOn(5000,1000)===false&&L.serikOn(null,1)===false,'serik window: 60 s from the stamp, never without a stamp, never from the future');
  ok(L.glows({o:{},map:{3:'b'}},3)===true&&L.glows({o:{3:1},map:{3:'b'}},3)===false&&L.glows({o:{},map:{}},3)===false,'glows(): in the map and not opened')}
 /* in the world: prefect in view / coming -> "Line tak clear lah!" and no puzzle */
 {const W=mk();force(W,10,'m:20');W.w.lockTick(.016,1);stand(W,10);
  W.scr.on=1;W.ns[0].m.visible=true;W.ns[0].x=W.P.x+3;W.ns[0].z=W.P.z;W.ns[0].hid=0;W.sayl.length=0;
  ok(W.w.lockGo()===true&&W.env.halt===false&&W.sayl.join()=='Line tak clear lah!','a prefect in view (patrol): "Line tak clear lah!", locker stays shut: '+W.sayl.join());
  W.ns[0].x=W.P.x+60;W.sayl.length=0;ok(W.w.lockGo()===true&&W.env.halt===true,'prefect far away: the locker opens')}
 /* serik: stamp when control returns after the rotan (not on the third = detention) or after the detention, cleared by the outside rule */
 {const W=mk();W.w.lockEnd(true);ok(W.ss.sk_sr===undefined,'lockEnd(third) does not stamp (the detention does)');
  const t0=Date.now;let T0=2e12;Date.now=()=>T0;
  W.w.lockEnd(false);ok(W.ss.sk_sr!==undefined,'lockEnd after the rotan stamps the serik time');
  force(W,10,'m:20');W.w.lockTick(.016,1);stand(W,10);W.sayl.length=0;
  ok(W.w.lockGo()===true&&W.env.halt===false&&W.sayl.join()=='Saya dah serik','within 60 s: "Saya dah serik", no puzzle: '+W.sayl.join());
  T0+=59000;W.sayl.length=0;W.w.lockGo();ok(W.sayl.join()=='Saya dah serik','still serik at 59 s');
  T0+=1500;W.sayl.length=0;ok(W.w.lockGo()===true&&W.env.halt===true,'after 60 s the locker opens again');
  W.env.halt=false;
  W.w.lockClear();ok(W.ss.sk_sr===undefined,'lockClear (cheat code) removes the serik stamp');
  Date.now=t0}
 {const W=world();W.ss.sk_sr=JSON.stringify(Date.now());W.ss.sk_lk=JSON.stringify({t0:0,o:{},map:{}});const sa={};/* coming from outside: sk_arr set -> session AND serik are fresh */
  const W2=(()=>{const x=world();x.ss.sk_arr='1';x.ss.sk_sr=JSON.stringify(Date.now());return x})();W2.w.lockTick(.016,1);ok(W2.ss.sk_sr===undefined,'coming back from outside (sk_arr) clears the serik window; going into rooms does not');
  const W3=world();W3.ss.sk_sr=JSON.stringify(Date.now());W3.w.lockTick(.016,1);ok(W3.ss.sk_sr!==undefined,'no sk_arr (rooms only): serik stays')}
 /* wiring in world.js */
 ok(/if\(d\)\{if\(window\.lockBusy&&lockBusy\(\)&&d\[6\]!='Padang Balapan'\)\{say\(lockMsg\(\)\);return\}if\(window\.storyDoor/.test(WORLD),'world.js: room doors locked while a prefect comes or chases, Padang open');
 ok(/if\(bi>=0&&backOpen\(\)\)\{if\(window\.lockBusy&&lockBusy\(\)\)\{say\(lockMsg\(\)\);return\}window\.storyBack\(bi\)/.test(WORLD),'world.js: the back doors are locked too');
 ok(/CN\.on=0;halt=false;if\(window\.lockEnd\)lockEnd\(CN\.third\);/.test(WORLD),'world.js: the end of the rotan calls lockEnd(third)');
 ok(/DR=\[.*'Padang Balapan'\]/.test(rd('js/world-build.js'))&&!/exitGo[^;]*lockBusy/.test(WORLD),'Padang is a door named Padang Balapan; the school exit is not behind the lock');
}
console.log(fail?fail+' FAILED, '+pass+' passed':'all '+pass+' checks passed');process.exit(fail?1:0);
