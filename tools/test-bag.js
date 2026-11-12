/* Round 16: school bag, boosts, carried slow debuff (js/bag.js) and the kedai runcit wiring. Node only, no browser.
   js/bag.js and js/wallet.js run for real in a Function scope with stubs (cur, save, toast, halt and a tiny fake DOM). The page scripts are checked as source.
   Run: node tools/test-bag.js */
const fs=require('fs'),path=require('path');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const BSRC=rd('js/bag.js'),WSRC=rd('js/wallet.js');
/* tiny fake DOM: enough for the panel */
function mkDoc(){const bag=null;const mk=tag=>{const e={tag,children:[],className:'',style:{},_t:'',attrs:{},parentNode:null,disabled:false,onclick:null,
  set textContent(v){e._t=String(v);e.children=[]},get textContent(){return e._t+e.children.map(c=>c.textContent).join('|')},
  set innerHTML(v){e.children=[];e._t=''},get innerHTML(){return ''},
  append(...a){a.forEach(c=>{c.parentNode=e;e.children.push(c)})},appendChild(c){e.append(c);return c},
  remove(){if(e.parentNode){e.parentNode.children=e.parentNode.children.filter(x=>x!==e);e.parentNode=null}},
  setAttribute(k,v){e.attrs[k]=v},addEventListener(){}};return e};
 const hd=mk('button');const d={createElement:mk,body:mk('body'),hidden:false,hd,getElementById:i=>i=='hdbag'?hd:null,addEventListener(){}};return d}
const walk=(e,f)=>{f(e);e.children.forEach(c=>walk(c,f))};
function env(curv,opt){opt=opt||{};const saves=[],toasts=[];const doc=opt.dom?mkDoc():undefined;
 const fn=new Function('cur0','save','toast','document',"let cur=cur0,halt=false;"+WSRC+";"+BSRC+";return{BAG,WALLET,getHalt:()=>halt,setHalt:v=>{halt=v},getCur:()=>cur}");
 const e=fn(curv,()=>saves.push(JSON.stringify([curv.inv,curv.fx])),m=>toasts.push(m),doc);e.saves=saves;e.toasts=toasts;e.doc=doc;return e}
const buttons=(doc,skip)=>{const a=[];walk(doc.body,x=>{if(x.tag=='button'&&x.onclick&&(!skip||x.className!='bgxx'))a.push(x)});return a};
const txt=doc=>doc.body.textContent;
/* ---- old save: nothing created by reading ---- */
{const c={name:'A',w:{c:1000}};const {BAG:B}=env(c);
 ok(B.cnt('gula')==0&&B.slow0()==0&&B.spd()==1&&B.jmp()==1&&B.inv()===false&&B.sl()==1&&B.debuff()===false,'old save: empty bag, no effects');
 ok(c.inv===undefined&&c.fx===undefined,'reading never creates cur.inv or cur.fx');B.tick(0.5,0);B.sync(0);ok(c.fx===undefined,'tick and sync(0) on a clean save create nothing');
 ok(B.chipText()==='','no chip text when nothing is active');}
{const c={inv:'junk',fx:'junk',w:{c:500}};const {BAG:B}=env(c);ok(B.cnt('gula')==0&&B.slow0()==0&&B.buy('gula')=='ok'&&c.inv.gula==1,'junk cur.inv / cur.fx are replaced when something is written');}
/* ---- shop: prices, poor, full, nothing taken before the bag check ---- */
{const c={w:{c:800}};const {BAG:B,WALLET:W,saves}=env(c);
 ok(['gula','pisang','iso','epal','nasi'].map(k=>B.price(k)).join()=='50,150,300,300,150'&&B.price('ice')==100,'prices: gula .50, pisang 1.50, isotonik 3.00, epal pelangi 3.00, nasi lemak 1.50, ice cream 1.00');
 ok(W.CFG.shop.epal==300&&W.CFG.ice==100&&W.CFG.nasi==150&&W.CFG.pocket==300,'WALLET.CFG: shop prices added, the rest unchanged');
 ok(B.buy('gula')=='ok'&&W.get()==750&&B.cnt('gula')==1&&saves.length>0,'buy gula-gula: RM0.50 paid, one in the bag, saved');
 ok(B.buy('epal')=='ok'&&W.get()==450&&B.cnt('epal')==1,'buy epal fuji RM3.00');
 ok(B.buy('iso')=='ok'&&B.buy('iso')=='poor'&&W.get()==150&&B.cnt('iso')==1,'second isotonik: not enough money, nothing taken');
 ok(B.buy('nope')=='bad'&&B.buy('ice')=='bad'&&W.get()==150,'unknown item and ice cream cannot be bought into the bag');
 for(let i=0;i<9;i++)B.add('pisang');ok(B.cnt('pisang')==9&&B.add('pisang')===false,'bag holds at most 9 of one item');
 const m=W.get();ok(B.buy('pisang')=='full'&&W.get()==m,'full bag: no money taken');
 ok(Object.keys(c.inv).every(k=>['nasi','gula','pisang','iso','epal'].includes(k)),'only known items are stored (ice cream never)');}
/* ---- boosts ---- */
{const c={w:{c:5000},inv:{gula:2,iso:1,pisang:1,epal:1}};const e=env(c),B=e.BAG;
 let r=B.use('gula');ok(!r.ok&&B.cnt('gula')==2&&/sekolah atau di luar/.test(r.msg),'boost on Kantin, Padang or a classroom (BAG.world 0): refused and not used up');
 B.world=1;r=B.use('gula');ok(r.ok&&B.cnt('gula')==1&&c.fx.b=='gula'&&c.fx.t==5&&B.spd()==1.5&&B.jmp()==1&&B.inv()===false,'gula-gula: speed x1.5 for 5 s');
 B.tick(2,1);ok(Math.abs(c.fx.t-3)<1e-9&&B.spd()==1.5,'tick counts the boost down');
 B.tick(3.01,1);ok(c.fx.b===undefined&&B.spd()==1,'boost ends after its time');
 B.use('iso');ok(c.fx.t==10&&B.spd()==1.5,'isotonik: speed x1.5 for 10 s');
 B.use('pisang');ok(c.fx.b=='pisang'&&c.fx.t==5&&B.spd()==1&&B.jmp()==1.35,'a new boost replaces the old one (no stacking); pisang = jump x1.35');
 B.use('epal');ok(B.inv()===true&&B.spd()==1&&B.jmp()==1&&c.fx.t==10&&B.left()==10,'epal fuji: invisible 10 s');
 B.tick(9.9,1);ok(B.inv()===true&&B.left()<.2,'still invisible just before the end');B.tick(.2,1);ok(B.inv()===false&&B.left()==0,'invisibility ends after 10 s');
 r=B.use('epal');ok(!r.ok&&/Tiada/.test(r.msg),'using something you do not have: refused');
 B.world=1;B.use('gula');B.world=0;B.tick(4,1);ok(c.fx.t==5,'boost time is kept (not counted) on pages that are not the school world');
 ok(B.chipText().includes('5'),'chip text shows the boost seconds');}
/* ---- slow debuff carried across pages ---- */
{const c={w:{c:1000},inv:{nasi:2}};const e=env(c),B=e.BAG;let cured=0;B.onCure=()=>cured++;
 B.sync(8);ok(B.slow0()==8&&B.debuff()&&B.sl()==.5&&c.fx.sl==8,'sync writes the page timer to cur.fx.sl; sl() is the 0.5 factor');
 B.tick(3,0);ok(Math.abs(B.slow0()-5)<1e-9,'a page without a timer of its own (Padang, classrooms) counts it down with tick(dt,0)');
 B.tick(3,1);ok(Math.abs(B.slow0()-5)<1e-9,'a page with its own timer (ext=1) is not counted twice');
 B.sync(-4);ok(B.slow0()==0&&!B.debuff(),'sync never stores a negative time');B.sync(9.5);
 ok(/\uD83D\uDC22/.test(B.chipText())&&/10/.test(B.chipText()),'chip shows the slow seconds');
 B.world=0;let r=B.use('nasi');ok(r.ok&&B.cnt('nasi')==1&&B.slow0()==0&&cured==1,'nasi lemak from the bag removes the slow debuff (any page) and calls the page hook');
 r=B.use('nasi');ok(!r.ok&&B.cnt('nasi')==1&&/Tiada kesan/.test(r.msg),'nasi lemak is NOT used up when there is no debuff');
 B.sync(6);const w0=e.WALLET.get();let ice=B.ice();ok(ice=='cured'&&e.WALLET.get()==w0-100&&B.slow0()==0&&cured==2&&!('ice' in c.inv),'ice cream: RM1.00, removes the debuff, never stored');
 ice=B.ice();ok(ice=='ok'&&e.WALLET.get()==w0-200,'ice cream with no debuff is just eaten');
 c.w.c=50;ice=B.ice();ok(ice=='poor'&&c.w.c==50,'ice cream without enough money: nothing happens');
 const h=env({inv:{nasi:1},fx:{sl:4}});ok(h.BAG.slow0()==4&&h.BAG.debuff(),'a saved slow is read back at boot (carried to the next page)');}
/* ---- panels with the fake DOM ---- */
{const c={w:{c:1000},inv:{nasi:1,gula:2},fx:{sl:6}};const e=env(c,{dom:1}),B=e.BAG,d=e.doc;B.world=1;
 B.open();ok(B.isOpen()&&e.getHalt()===true,'bag opens and pauses the game (halt)');
 ok(/Nasi Lemak/.test(txt(d))&&/Gula-gula/.test(txt(d))&&!/Pisang/.test(txt(d))&&/x2/.test(txt(d)),'bag lists only what you have, with counts');
 B.close();ok(!B.isOpen()&&e.getHalt()===false,'closing gives the game back');
 e.setHalt(true);B.open();ok(!B.isOpen()&&e.toasts.length==1,'cannot open the bag while the game is already halted (quiz, cutscene)');e.setHalt(false);
 B.open();let nb=buttons(d,1);nb[0].onclick();ok(c.inv.nasi==0&&B.slow0()==0&&B.isOpen(),'tap Guna on nasi lemak: cured, panel stays open');
 ok(/Segar/.test(txt(d))&&!/Nasi Lemak/.test(txt(d)),'panel is redrawn with the message and without the used item');
 nb=buttons(d,1);nb[0].onclick();ok(c.fx.b=='gula'&&B.spd()==1.5&&!B.isOpen()&&e.getHalt()===false,'tap Guna on a boost: it starts and the panel closes');
 B.openRuncit();ok(B.isOpen()&&/KEDAI|Kedai Runcit/i.test(txt(d))&&/RM0\.50/.test(txt(d))&&/RM3\.00/.test(txt(d))&&!/Nasi/.test(txt(d)),'kedai runcit menu: 4 items with prices (cosmetics come later)');
 nb=buttons(d,1);ok(nb.length==8,'eight Beli buttons (four items, four cosmetics)');const m0=e.WALLET.get();nb[3].onclick();ok(e.WALLET.get()==m0-300&&B.cnt('epal')==1&&/Terima kasih/.test(txt(d)),'Beli epal pelangi: RM3.00 paid, in bag, thank-you note, menu stays open');
 c.w.c=10;buttons(d,1)[0].onclick();ok(/Tak cukup duit/.test(txt(d))&&B.cnt('gula')==1,'not enough money message, nothing bought');
 c.w.c=5000;c.inv.gula=9;buttons(d,1)[0].onclick();ok(/Beg penuh/.test(txt(d))&&c.w.c==5000,'full bag message, no money taken');
 B.close();B.openNasi();ok(/Nasi Lemak/.test(txt(d))&&/RM1\.50/.test(txt(d)),'nasi lemak stall menu');buttons(d,1)[0].onclick();ok(B.cnt('nasi')==1,'buy nasi lemak: goes into the bag');B.close();
 /* ice cream: three flavours, asks once when there is nothing to cure, eats on the spot */
 let eat=[];B.onEat=(ic,msg)=>eat.push(msg);c.fx={};c.w.c=1000;B.openIce();nb=buttons(d,1);
 ok(nb.length==3&&/Vanila/.test(txt(d))&&/Coklat/.test(txt(d))&&/Jagung/.test(txt(d)),'ice cream menu: Vanila, Coklat, Jagung');
 nb[0].onclick();ok(c.w.c==1000&&/sekali lagi/.test(txt(d))&&B.isOpen(),'no debuff: first tap only asks (nothing paid)');
 nb=buttons(d,1);nb[1].onclick();ok(c.w.c==1000&&B.isOpen(),'choosing another flavour asks again');
 nb=buttons(d,1);nb[1].onclick();return_ice();
 function return_ice(){ok(c.w.c==900&&!B.isOpen()&&e.getHalt()===false,'second tap on the same flavour: RM1.00 paid, menu closes, game continues')}
 setTimeout(()=>{ok(eat.length==1&&/Coklat/.test(eat[0]),'the page food animation hook is called once after the menu closes');
  const c2={w:{c:1000},fx:{sl:7}};const e2=env(c2,{dom:1});e2.BAG.openIce();let eat2=[];e2.BAG.onEat=(i,m)=>eat2.push(m);buttons(e2.doc,1)[0].onclick();
  ok(c2.w.c==900&&c2.fx.sl==0&&!e2.BAG.isOpen(),'with a debuff the first tap buys at once and cures');
  setTimeout(()=>{ok(eat2.length==1&&/segar/i.test(eat2[0]),'cured message');done()},5)},5);}
function done(){
/* ---- the real kedai runcit geometry code from luar.js, run against stubs ---- */
{const L=rd('js/luar.js'),i=L.indexOf('/* ---- Round 16: kedai runcit'),j=L.indexOf("DYNS.push({x:LUC.RUN.x,z:13.2,r:.5});")+"DYNS.push({x:LUC.RUN.x,z:13.2,r:.5});".length;ok(i>0&&j>i,'kedai runcit block found in luar.js');
 const LUC=new Function(rd('js/luar-logic.js')+';return LUC')(),calls=[],signs=[],DYNS=[],added=[];
 const npc=()=>({position:{set(){}},rotation:{}}),sc={add:o=>added.push(o)};
 try{new Function('LUC','bxm','sgn','npc','sc','DYNS',L.slice(i,j))(LUC,(w,h,d,c,x,y,z,col)=>{calls.push({w,h,d,x,y,z,col})},(...a)=>signs.push(a),npc,sc,DYNS);ok(true,'runs')}catch(e){ok(false,'kedai runcit block runs without error: '+e.message)}
 const cols=calls.filter(c=>c.col).map(c=>({x0:c.x-c.w/2,x1:c.x+c.w/2,z0:c.z-c.d/2,z1:c.z+c.d/2}));
 const hit=(x,z,r)=>cols.some(c=>x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1)||DYNS.some(d=>Math.hypot(x-d.x,z-d.z)<r+d.r);
 ok(cols.length==4&&hit(14.5,12,.35)&&hit(23,12,.35)&&!hit(18.75,9.8,.35),'counter, two side walls and back wall are solid; the E spot in front of the counter is free to stand on');
 {const seen=new Set(),q=[[18.75,9.8]];let inside=false;const key=(x,z)=>Math.round(x*4)+','+Math.round(z*4);seen.add(key(18.75,9.8));
  while(q.length&&seen.size<40000){const [x,z]=q.pop();if(Math.abs(x-18.75)<5.5&&z>12.6&&z<13.9)inside=true;for(const [dx,dz] of [[.25,0],[-.25,0],[0,.25],[0,-.25]]){const nx=x+dx,nz=z+dz;if(nx<8||nx>30||nz<7||nz>17)continue;const k=key(nx,nz);if(seen.has(k)||hit(nx,nz,.35))continue;seen.add(k);q.push([nx,nz])}}
  ok(!inside&&seen.size>200,'nobody can walk into the shop: the inside is closed off (counter, walls) and the outside is big and connected');}
 ok(!hit(12.2,12,.35)&&!hit(25.4,12,.35),'the strip beside the shop and the gap to the nasi lemak stall stay walkable');
 ok(signs.length==1&&signs[0][0][0]=='KEDAI RUNCIT'&&DYNS.length==1&&DYNS[0].x==18.75&&added.length==1,'sign, shopkeeper (solid, at the counter) added');
 const roof=calls.find(c=>c.w>12&&c.y>3);ok(roof&&roof.x-roof.w/2>12.4&&roof.x+roof.w/2<25.3,'roof stays between the paved edge and the nasi lemak stall (x 26 to 31)');}
/* ---- Round 16b: invisibility = phase through objects, put back when it ends ---- */
{const c={fx:{b:'epal',t:10}};const e=env(c),B=e.BAG;const box={x0:5,x1:7,z0:-1,z1:1},hitF=(x,z,r)=>x+r>box.x0&&x-r<box.x1&&z+r>box.z0&&z-r<box.z1;
 const p={x:3,z:0};B.track(p.x,p.z,hitF);p.x=4.5;B.track(p.x,p.z,hitF);p.x=6;B.track(p.x,p.z,hitF);ok(hitF(p.x,p.z,.35),'test setup: player is inside the box');
 ok(B.unstick(p,hitF)===true&&p.x==4.5&&!hitF(p.x,p.z,.35),'when it ends inside an object the player goes back to the last free spot');
 const q={x:6,z:0};ok(B.unstick(q,hitF)===true&&!hitF(q.x,q.z,.35),'unstick with a stale last-free spot still finds a free spot (ring search)');
 const fr={x:0,z:0};ok(B.unstick(fr,hitF)===false&&fr.x==0,'not inside anything: nothing moves');
 const never=env({});const nv=never.BAG;const b2={x:6,z:0};ok(nv.unstick(b2,hitF)===true&&!hitF(b2.x,b2.z,.35),'never tracked: ring search puts the player outside');
 const solidAll=()=>true;ok(never.BAG.unstick({x:0,z:0},solidAll)===false,'nowhere free within 6 m: gives up without moving');
 const meshes=[];const mk=()=>({isMesh:true,userData:{},material:{transparent:false,opacity:1,clone(){return{...this,clone:this.clone}}}});const root={traverse(f){[mk0,mk1,{isMesh:false}].forEach(f)}};const mk0=mk(),mk1=mk(),shared=mk0.material;
 const face={isMesh:true,userData:{},material:{transparent:true,opacity:1,clone(){return{...this,clone:this.clone}}}};const root2={traverse(f){f(face)}};
 B.ghost(root2,true,.4);ok(face.material.transparent===true&&face.material.opacity==.4,'ghost on: the face overlay is see-through');B.ghost(root2,false,1);ok(face.material.transparent===true&&face.material.opacity==1,'ghost off: the face overlay stays transparent (clear pixels must not turn black)');
 const half={isMesh:true,userData:{},material:{transparent:true,opacity:.9,clone(){return{...this,clone:this.clone}}}};B.ghost({traverse(f){f(half)}},true,.4);ok(Math.abs(half.material.opacity-.36)<1e-9,'ghost on multiplies the original opacity');B.ghost({traverse(f){f(half)}},false,1);ok(half.material.opacity==.9&&half.material.transparent===true,'ghost off restores the original opacity and transparency');
 B.ghost(root,true,.4);ok(mk0.material!==shared&&mk0.material.transparent===true&&mk0.material.opacity==.4&&shared.opacity==1,'ghost: the player gets its own material copies (shared ones, used by other people, stay untouched)');
 const own=mk0.material;B.ghost(root,true,.85);ok(mk0.material===own&&own.opacity==.85,'ghost: copied only once, opacity can change (last-2-seconds flicker)');B.ghost(root,false,1);ok(own.transparent===false&&own.opacity==1,'ghost off: an opaque material is opaque again');B.ghost(null,true,.4);ok(true,'ghost(null) is harmless');}
{/* real world-build.js: walls are tagged, objects are not; the real hitP line from world.js against those boxes */
 const wsrc=rd('js/world-build.js'),wj=rd('js/world.js');
 function deep(){const f=function(){};const p=new Proxy(f,{get:(t,k)=>{if(k===Symbol.unscopables)return undefined;if(k===Symbol.toPrimitive)return()=>0;if(k==='length')return 0;return p},apply:()=>p,construct:()=>p,set:()=>true,has:()=>true});return p}
 function runSrc(src,ret){const D=deep();const g=new Proxy({},{has:(t,k)=>typeof k=='string'&&!(k in globalThis)&&k!='SPOT'&&k!='SS',get:(t,k)=>k===Symbol.unscopables?undefined:D,set:()=>true});return new Function('g','SPOT','SS','with(g){'+src+';return{'+ret+'}}')(g,undefined,undefined)}
 let W=null;try{W=runSrc(wsrc,'cols,X,Z,hit,OB')}catch(e){ok(false,'world-build.js runs against the stub: '+e.message)}
 if(W){const walls=W.cols.filter(c=>c.w===1),objs=W.cols.filter(c=>!c.w);
  ok(walls.length>=10&&objs.length>=30,'world-build.js: '+walls.length+' wall boxes tagged, '+objs.length+' object boxes left untagged');
  ok(walls.some(c=>Math.abs(c.x0-W.X(92))<1e-6&&Math.abs(c.x1-W.X(100))<1e-6),'the perimeter wall is tagged as a wall');
  ok(!walls.some(c=>Math.abs((c.x1-c.x0)-.8)<1e-6&&Math.abs((c.z1-c.z0)-.8)<1e-6),'vases (0.8 m boxes) are objects, not walls');
  const m=/const hitNS=[\s\S]*?hitP=[^\n]*;\n/.exec(wj);ok(!!m,'world.js: hitNS/hitG/hitP line found');
  if(m){const NNAVR=new Function(require('fs').readFileSync(require('path').join(__dirname,'..','js/npc-nav.js'),'utf8')+';return NNAV')();const mkB=(inv,jmp,y)=>({inv:()=>inv,jmp:()=>jmp});const run=(inv,jmp,y)=>new Function('cols','OB','P','BAG','hit','ns','NNAV',m[0]+';return{hitG,hitP,hitNS}')(W.cols,[{t:'sign',x:99,z:99}],{y},mkB(inv,jmp),W.hit,[],NNAVR);
   const wall=walls[0],obj=objs.find(c=>c.x1-c.x0<3&&c.z1-c.z0<3),ctr=c=>[(c.x0+c.x1)/2,(c.z0+c.z1)/2];
   const a=run(false,1,0),b=run(true,1,0);
   ok(a.hitP(...ctr(obj),.35)===true&&a.hitP(...ctr(wall),.35)===true,'normal player: objects and walls both block');
   ok(b.hitP(...ctr(obj),.35)===false&&b.hitP(...ctr(wall),.35)===true,'invisible player: phases through the object, the wall still blocks');
   const sg=W.OB.find(o=>o.t=='sign');ok(!!sg,'a wet-floor sign exists in the real map');
   if(sg){const hi=new Function('cols','OB','P','BAG','hit','ns','NNAV',m[0]+';return hitP')(W.cols,W.OB,{y:1},mkB(false,1.35,1),W.hit,[],NNAVR),lo=new Function('cols','OB','P','BAG','hit','ns','NNAV',m[0]+';return hitP')(W.cols,W.OB,{y:0},mkB(false,1.35,0),W.hit,[],NNAVR),no=new Function('cols','OB','P','BAG','hit','ns','NNAV',m[0]+';return hitP')(W.cols,W.OB,{y:1},mkB(false,1,1),W.hit,[],NNAVR);
    ok(hi(sg.x,sg.z,.35)===false&&lo(sg.x,sg.z,.35)===true&&no(sg.x,sg.z,.35)===true,'pisang jump: a high jump clears the wet-floor sign, a low jump or no pisang does not')}}}
 /* luar.js: only the school building is tagged; the real hitG/hitP line against fake boxes */
 const L=rd('js/luar.js'),lm=/const hitG=[^\n]*\n/.exec(L);ok(!!lm&&/bxm\(64,7,7,'#f1e2b8',0,3\.5,-30\.5,true,true\);cols\[cols\.length-1\]\.w=1;/.test(L),'luar.js: the school building box is tagged as the wall');
 if(lm){const cols=[{x0:-32,x1:32,z0:-34,z1:-27,w:1},{x0:5,x1:7,z0:0,z1:1},{x0:-35,x1:-3,z0:-19.2,z1:-18.8}];const mk=inv=>new Function('cols','BAG','hit',lm[0]+';return hitP')(cols,{inv:()=>inv},(x,z,r)=>cols.some(c=>x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1)||Math.hypot(x-10,z-10)<1);
  const n=mk(false),g=mk(true);ok(n(6,.5,.35)&&n(-10,-19,.35)&&n(10,10,.35)&&n(0,-30,.35),'luar normal: bench, fence, a person and the building all block');
  ok(!g(6,.5,.35)&&!g(-10,-19,.35)&&!g(10,10,.35)&&g(0,-30,.35),'luar invisible: bench, fence and people are phased through, the school building still blocks')}
 ok((L.match(/!hitP\(P\.x/g)||[]).length==2&&!/!hit\(P\.x/.test(L),'luar.js: both player collision tests use hitP');
 ok(/spd=5\*\(slowT>0\?SLOW\.k:1\)\*BAG\.spd\(\)/.test(L)&&/P\.vy=6\.8\*BAG\.jmp\(\)/.test(L)&&/BAG\.world=1/.test(L),'luar.js: speed and jump boosts apply outside too');
 ok(/&&!BAG\.inv\(\)&&LUL\.hitCar\(/.test(L),'luar.js: an invisible player is not bumped by cars');
 ok(/BAG\.unstick\(P,hit\)/.test(L)&&/BAG\.track\(P\.x,P\.z,hit\)/.test(L)&&/BAG\.unstick\(P,hit\)/.test(wj)&&/BAG\.track\(P\.x,P\.z,hit\)/.test(wj),'world.js and luar.js: last free spot tracked, player put back when invisibility ends');
 ok(!/prefect|pfM|catch|chase/i.test((wj.match(/hitNS=[^\n]*/)||[''])[0]),'invisibility code does not touch the prefect chase');
 ok(/BAG\.inv\(\)/.test(wj)&&!/BAG\.inv\(\)[^;]{0,60}(pfOn|pfOff|chase|caught|lateT)/.test(wj),'world.js: invisibility is not used in any prefect or catch logic');}
/* ---- chip on the bag button ---- */
{const c={fx:{b:'iso',t:7.2,sl:3.1}};const e=env(c,{dom:1});e.BAG.world=1;e.BAG.tick(0,1);const chip=e.doc.hd.children[0];ok(chip&&chip.attrs&&chip.id=='bgxe'&&chip.style.display=='block'&&/8/.test(chip.textContent)&&/4/.test(chip.textContent),'chip next to #hdbag (under the pause button) shows boost and slow seconds');
 e.BAG.cure();e.BAG.tick(0,1);ok(!/\uD83D\uDC22/.test(chip.textContent),'chip drops the slow after a cure');}
/* ---- wiring (source checks) ---- */
const W=rd('js/world.js'),K=rd('js/kantin.js'),P=rd('js/padang.js'),KL=rd('js/kelas.js'),L=rd('js/luar.js'),LL=rd('js/luar-logic.js'),H=rd('js/hud.js'),S=rd('sw.js'),CSS=rd('css/style.css');
ok(/BAG\.world=1/.test(W)&&/BAG\.tick\(dt,1\);BAG\.sync\(P\.slow\)/.test(W)&&/\*BAG\.spd\(\)/.test(W)&&/P\.vy=6\.8\*BAG\.jmp\(\)/.test(W)&&/P\.slow=BAG\.slow0\(\)/.test(W)&&/BAG\.onCure=\(\)=>\{P\.slow=0;P\.stun=0\}/.test(W),'world.js: boosts, slow carry in and out, cure hook');
ok((W.match(/!hitP\(P\.x/g)||[]).length==4&&!/!hit\(P\.x/.test(W),'world.js: all 4 player collision tests go through hitP (signs ignored when invisible or high-jumping)');
ok((W.match(/!BAG\.inv\(\)/g)||[]).length==2,'world.js: banana, litter and sampah ignore an invisible player');
ok(/o\.t=='sign'&&Math\.abs\(\(c\.x0\+c\.x1\)\/2-o\.x\)<\.01/.test(W)&&/BAG\.jmp\(\)>1&&P\.y>\.75/.test(W),'world.js: only wet-floor sign boxes are skipped, and a pisang jump must be high enough');
ok(/BAG\.tick\(dt,1\);BAG\.sync\(P\.slow\)/.test(K)&&/P\.slow=BAG\.slow0\(\)/.test(K)&&/BAG\.onCure=\(\)=>\{P\.slow=0\}/.test(K),'kantin.js: slow carried');
ok(/\*BAG\.sl\(\)/.test(P)&&/BAG\.tick\(dt,0\)/.test(P)&&/spd=5\*BAG\.sl\(\)/.test(KL)&&/BAG\.tick\(dt,0\)/.test(KL),'padang.js and kelas.js: the carried slow applies while walking');
ok(/BAG\.sync\(slowT\)/.test(L)&&/slowT=BAG\.slow0\(\)/.test(L)&&/BAG\.onCure=\(\)=>\{slowT=0\}/.test(L)&&/BAG\.openRuncit\(\)/.test(L)&&/BAG\.openNasi\(\)/.test(L)&&/BAG\.openIce\(\)/.test(L),'luar.js: slow carried, the three shops open');
ok(!/stallEmpty\(/.test(L.replace(/function stallEmpty[^\n]*/,''))&&/KEDAI RUNCIT/.test(L)&&!/PRICE\./.test(L),'luar.js: the two empty stalls are gone (no stallEmpty calls), kedai runcit built, old price text gone');
ok(/NASI:\{x:28\.5,z:9\.8\}/.test(LL)&&/RUN:\{x:18\.75,z:9\.8\}/.test(LL),'luar-logic.js: nasi lemak at x 28.5, kedai runcit at x 18.75');
{const nasiL=28.5-2.5,runR=18.75+6.3;ok(runR<nasiL&&18.75-6.3>10,'kedai runcit (12.45 to 25.05) and nasi stall (26 to 31) do not overlap and both stay on the paved strip');
 ok(Math.hypot(28.5-18.75,0)>3+3.6,'the E ranges of the two stalls do not overlap');}
ok(/BAG\.onEat=/.test(L)&&/eatT/.test(L)&&/arms\[1\]\.rotation\.x=-2\.4/.test(L),'luar.js: eating stops the player for 2 s and raises the hand');
ok(/typeof BAG!=='undefined'&&BAG\.open/.test(H),'hud.js: the bag button opens the bag');
for(const f of ['world','kantin','luar','padang','kelas'])ok(/"js\/bag\.js"/.test(rd(f+'.html')),f+'.html loads js/bag.js');
ok(rd('luar.html').indexOf('js/wallet.js')<rd('luar.html').indexOf('js/bag.js')&&rd('luar.html').indexOf('js/bag.js')<rd('luar.html').indexOf('js/luar.js'),'luar.html: wallet.js, then bag.js, before luar.js');
ok(S.includes("'js/bag.js'")&&/CACHE='sr-r21c'/.test(S),'sw.js: cache sr-r20a and js/bag.js pre-cached');
ok(rd('js/core.js').indexOf('BAG')<0&&rd('js/ui.js').indexOf('BAG')<0,'core.js and ui.js are not changed (no bag code there)');
/* ---- names and ids are free ---- */
{const others=fs.readdirSync(path.join(__dirname,'..','js')).filter(f=>f!='bag.js').map(f=>[f,rd('js/'+f)]);
 for(const n of ['BAG','keeper','eatT','hitNS','hitG','hitP','ghost','ghS','ghP','ghO']){const used=others.filter(([f,s])=>new RegExp('\\b'+n+'\\b').test(s)).map(x=>x[0]);const allowed=n=='BAG'?['world.js','kantin.js','padang.js','kelas.js','luar.js','hud.js','chars.js','lockers.js']:n=='keeper'||n=='eatT'?['luar.js']:n=='hitNS'?['world.js']:['world.js','luar.js'];ok(used.every(f=>allowed.includes(f)),'name '+n+' only in '+allowed.join('/')+(used.length?' (found '+used.join(',')+')':''))}
 const ids=['bgxp','bgxe','bgxc','bgxm','bgxl','bgxr','bgxi','bgxt','bgxq','bgxn','bgxs','bgxx','bgxp2','bgxb'];const html=['index','world','kantin','luar','padang','kelas'].map(f=>rd(f+'.html')).join('\n');
 ok(ids.every(i=>!html.includes(i)&&others.every(([f,s])=>!s.includes(i))),'bgx* ids and classes are used by nobody else');
 ok(ids.slice(0,2).every(i=>CSS.includes(i)),'css for the panel and the chip exists');}
console.log(fail?fail+' FAILED, '+pass+' passed':'OK '+pass+' checks');process.exit(fail?1:0)}
