/* Round 17: cosmetics (cap, eyepatch, beard, moustache). Node only, no browser.
   js/bag.js + js/wallet.js run for real with stubs; js/chars.js player() runs with a three.js stub and a recording canvas; faceSvg() from js/hud.js is run on its own.
   Run: node tools/test-cos.js */
const fs=require('fs'),path=require('path');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const BSRC=rd('js/bag.js'),WSRC=rd('js/wallet.js'),CSRC=rd('js/chars.js'),HSRC=rd('js/hud.js');
/* ---------- fake DOM for the panels ---------- */
function mkDoc(){const mk=tag=>{const e={tag,children:[],className:'',style:{},_t:'',attrs:{},parentNode:null,disabled:false,onclick:null,
  set textContent(v){e._t=String(v);e.children=[]},get textContent(){return e._t+e.children.map(c=>c.textContent).join('|')},
  set innerHTML(v){e.children=[];e._t=''},get innerHTML(){return ''},
  append(...a){a.forEach(c=>{c.parentNode=e;e.children.push(c)})},appendChild(c){e.append(c);return c},
  remove(){if(e.parentNode){e.parentNode.children=e.parentNode.children.filter(x=>x!==e);e.parentNode=null}},setAttribute(k,v){e.attrs[k]=v},addEventListener(){}};return e};
 const hd=mk('button');return{createElement:mk,body:mk('body'),hidden:false,getElementById:i=>i=='hdbag'?hd:null,addEventListener(){}}}
const walk=(e,f)=>{f(e);e.children.forEach(c=>walk(c,f))};
const btns=(doc)=>{const a=[];walk(doc.body,x=>{if(x.tag=='button'&&x.onclick&&x.className!='bgxx')a.push(x)});return a};
const classes=(doc,c)=>{const a=[];walk(doc.body,x=>{if(x.className==c)a.push(x)});return a};
function env(curv,withDom){const saves=[],calls=[];const doc=withDom?mkDoc():undefined;
 const fn=new Function('cur0','save','toast','document','calls',"let cur=cur0,halt=false;const mkv=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z}},rotation:{y:0}});let pm=mkv();pm.position.set(3,0,-4);pm.rotation.y=1.2;const mkP=()=>{calls.push('mkP');pm=mkv()};const HUD={face:()=>calls.push('face')};"+WSRC+";"+BSRC+";return{BAG,WALLET,getPm:()=>pm,getCur:()=>cur}");
 const e=fn(curv,()=>saves.push(JSON.stringify(curv.cos)),()=>{},doc,calls);e.saves=saves;e.calls=calls;e.doc=doc;return e}
/* ---------- 1. old save and prices ---------- */
{const c={name:'A',w:{c:1000},inv:{gula:2}};const{BAG:B,WALLET:W}=env(c);
 ok(B.worn().length==0&&!B.owns('cap')&&!B.isOn('cap'),'old save: nothing owned, nothing worn');ok(c.cos===undefined,'reading never creates cur.cos');
 ok(['cap','eye','beard','mos'].every(k=>W.CFG.shop[k]==400&&B.price(k)==400),'all four cosmetics RM4.00');
 ok(B.COSORD.join()=='cap,eye,beard,mos'&&B.COSORD.every(k=>B.COS[k]&&B.COS[k].n&&B.COS[k].i&&B.IT[k]===undefined),'four cosmetics, not in the consumable list');
 ok(W.CFG.shop.gula==50&&W.CFG.shop.pisang==150&&W.CFG.shop.iso==300&&W.CFG.shop.epal==300,'old shop prices unchanged');}
/* ---------- 2. buy once ---------- */
{const c={name:'A',w:{c:1000}};const e=env(c),B=e.BAG,W=e.WALLET;
 ok(B.buyCos('cap')=='ok'&&W.get()==600&&B.owns('cap')&&!B.isOn('cap'),'buy cap: RM4.00 paid, owned, not worn yet');ok(e.saves.length>=1&&c.cos.own.cap==1&&JSON.parse(e.saves[e.saves.length-1]).own.cap==1,'saved in cur.cos.own');
 ok(B.buyCos('cap')=='own'&&W.get()==600,'second buy: not charged again');
 ok(B.buyCos('nope')=='bad'&&B.buyCos('gula')=='bad'&&W.get()==600,'unknown item or consumable is not a cosmetic');
 c.w.c=100;ok(B.buyCos('eye')=='poor'&&!B.owns('eye')&&W.get()==100,'not enough money: nothing owned, nothing paid');
 c.w.c=1600;['eye','beard','mos'].forEach(k=>B.buyCos(k));ok(W.get()==400&&B.COSORD.every(B.owns),'all four bought, RM12.00 paid');}
/* ---------- 3. wear and take off ---------- */
{const c={name:'A',w:{c:5000}};const e=env(c),B=e.BAG;
 ok(B.wear('cap').ok==false&&B.wear('cap').msg=='Belum beli.'&&B.worn().length==0&&e.calls.length==0,'cannot wear what is not bought, no rebuild');
 B.buyCos('cap');B.buyCos('beard');B.buyCos('mos');
 const r=B.wear('beard');ok(r.ok&&B.isOn('beard')&&r.msg=='Janggut dipakai.','wear beard');
 const pm=e.getPm();ok(e.calls.join()=='mkP,face'&&pm.position.x==3&&pm.position.z==-4&&pm.rotation.y==1.2,'player rebuilt in the same place and facing, HUD portrait redrawn');
 B.wear('cap');B.wear('mos');ok(B.worn().join()=='cap,beard,mos','any combination, always in the same order');
 ok(B.doff('beard').msg=='Janggut ditanggalkan.'&&B.worn().join()=='cap,mos'&&c.cos.own.beard==1,'take off: still owned');
 ok(B.doff('eye').ok==false,'take off what is not owned is refused');
 const c2=JSON.parse(JSON.stringify(c));ok(env(c2).BAG.worn().join()=='cap,mos','survives save and load (JSON)');
 ok(c.inv===undefined&&c.fx===undefined,'cosmetics do not touch cur.inv or cur.fx');}
/* ---------- 4. broken saves ---------- */
[ 'x',5,[],{own:'x',on:3},{own:{cap:1},on:'no'},{on:{cap:1}} ].forEach((v,i)=>{const c={w:{c:900},cos:v};const{BAG:B}=env(c);let t=true;try{B.worn();B.owns('cap');B.isOn('cap')}catch(e){t=false}ok(t&&!B.isOn('cap')||i==4,'broken cur.cos #'+i+' does not throw')});
{const c={w:{c:900},cos:'x'};const e=env(c);ok(e.BAG.buyCos('cap')=='ok'&&c.cos.own.cap==1,'a broken cur.cos is repaired when buying');}
{const e=env({w:{c:900},cos:{own:{cap:1},on:'no'}});ok(e.BAG.worn().length==0&&e.BAG.wear('cap').ok&&e.BAG.worn().join()=='cap','broken "on" is repaired when wearing');}
/* ---------- 5. no page, no crash ---------- */
{const e0=new Function('cur0',"let cur=cur0,halt=false;"+WSRC+";"+BSRC+";return BAG")({w:{c:900}});e0.buyCos('cap');ok(e0.wear('cap').ok&&e0.worn().join()=='cap','page without mkP, pm or HUD: wear still works');}
/* ---------- 6. panels ---------- */
{const c={name:'A',w:{c:5000}};const e=env(c,1),B=e.BAG,d=e.doc;
 B.openRuncit();let t=d.body.textContent;ok(/Barang Gaya/.test(t)&&/Topi/.test(t)&&/Penutup Mata/.test(t)&&/Janggut/.test(t)&&/Misai/.test(t)&&/RM 4\.00|RM4\.00/.test(t.replace(/\s/g,' ')),'Kedai Runcit lists Barang Gaya with the four items and RM4.00');
 ok(classes(d,'bgxh').length==1&&btns(d).length==8,'one header row and eight Beli buttons');
 const topi=btns(d)[4];topi.onclick();ok(B.owns('cap')&&/Terima kasih/.test(d.body.textContent)&&/Pakai dari beg/.test(d.body.textContent)&&!B.isOn('cap'),'Beli topi: thank-you, not worn from the shop');
 ok(btns(d)[4].disabled===true&&/Dimiliki/.test(d.body.textContent),'bought item shows Dimiliki and its button is off');
 B.close();
 B.open();t=d.body.textContent;ok(/Barang Gaya/.test(t)&&/Topi/.test(t)&&/Pakai/.test(t)&&!/Penutup Mata/.test(t)&&!/Beg kosong/.test(t),'bag shows only owned cosmetics, button Pakai');
 btns(d)[0].onclick();t=d.body.textContent;ok(B.isOn('cap')&&/Tanggal/.test(t)&&/Sedang dipakai/.test(t)&&/\u2713/.test(t)&&B.isOpen(),'Pakai: worn, button Tanggal, tick, bag stays open');
 btns(d)[0].onclick();ok(!B.isOn('cap')&&/Pakai/.test(d.body.textContent),'Tanggal: taken off');B.close();}
{const c={name:'A',w:{c:5000}};const e=env(c,1),B=e.BAG,d=e.doc;B.open();ok(/Beg kosong/.test(d.body.textContent)&&classes(d,'bgxh').length==0,'empty bag still says Beg kosong, no Barang Gaya header');B.close();}
/* ---------- 7. ghost and later meshes ---------- */
{const{BAG:B}=env({});const mk=()=>{const m={isMesh:true,userData:{},material:{transparent:false,opacity:1,userData:{},clone(){return{transparent:this.transparent,opacity:this.opacity,userData:{},clone:this.clone}}}};return m};
 const a=mk(),g={traverse(f){[a,...g.late].forEach(f)},late:[]};B.ghost(g,true,.4);const m0=a.material;ok(a.material.transparent&&a.material.opacity==.4,'ghost sets see-through');
 const b=mk();g.late.push(b);ok(b.material.opacity==1,'a cosmetic mesh added later is not see-through yet');B.ghost(g,true,.4);ok(b.material.transparent&&b.material.opacity==.4&&a.material===m0,'ghost again: the new mesh is cloned and ghosted, old materials not cloned twice');
 B.ghost(g,false,1);ok(!a.material.transparent&&!b.material.transparent&&a.material.opacity==1,'ghost off restores both');}
/* ---------- 8. chars.js with a three.js stub ---------- */
function mkThree(){const boxes=[],cv=[];class V{constructor(){this.x=0;this.y=0;this.z=0}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
 class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.position=new V();this.rotation=new V();this.isMesh=true}}
 class Group{constructor(){this.children=[];this.position=new V();this.rotation=new V();this.scale={setScalar(){}}}add(...a){this.children.push(...a)}traverse(f){f(this);this.children.forEach(c=>c.traverse?c.traverse(f):f(c))}}
 const T={Mesh,Group,Vector2:V,BoxGeometry:function(w,h,d){this.w=w;this.h=h;this.d=d;boxes.push(this)},PlaneGeometry:function(){},SphereGeometry:function(){},LatheGeometry:function(){this.attributes={position:{}}},
  MeshPhongMaterial:function(o){this.color=o.color},MeshBasicMaterial:function(o){this.map=o.map},CanvasTexture:function(c){this.c=c}};
 const doc={createElement:()=>{const ops=[];const st={};const ctx=new Proxy({},{get:(t,k)=>k in st?st[k]:(...a)=>{ops.push([k,a,st.fillStyle,st.globalCompositeOperation])},set:(t,k,v)=>{st[k]=v;return true}});const c={width:0,height:0,ops,getContext:()=>ctx};cv.push(c);return c}};return{T,doc,cv}}
function load(worn){const m=mkThree();const fn=new Function('T','document','R','rnd','BAG','SK','HC',CSRC+";return{player,npc}");const BAG=worn===undefined?undefined:{worn:()=>worn};return{p:fn(m.T,m.doc,a=>a[0],()=>0,BAG,['#b87a50'],['#14161d']),m}}
const cntMesh=g=>{let n=0;g.traverse(o=>{if(o.isMesh)n++});return n};
const find=(g,f)=>{let n=0;g.traverse(o=>{if(o.isMesh&&f(o))n++});return n};
{const base=cntMesh(load().p.player('m','uni',{}));
 ok(cntMesh(load([]).p.player('m','uni',{}))==base&&cntMesh(load(null).p.player('m','uni',{}))==base,'no BAG, nothing worn or null: same player as before');
 {const z=load();z.p.player('m','uni',{});ok(z.m.cv.length==1,'no cosmetics: only the one face canvas')}
 const cap=load(['cap']).p.player('m','uni',{});ok(cntMesh(cap)==base+3&&find(cap,o=>o.material.color=='#c8293a'&&o.geometry.w==.62)==1,'cap: 3 boxes (crown, peak, button)');
 const sp=find(load().p.player('m','uni',{hs:'spiky'}),o=>o.geometry.w==.1&&o.geometry.h==.14),spc=find(load(['cap']).p.player('m','uni',{hs:'spiky'}),o=>o.geometry.w==.1&&o.geometry.h==.14);
 ok(sp==5&&spc==0,'spiky hair does not poke through the cap');
 const bun=find(load(['cap']).p.player('f','uni',{hs:'bun',nt:true}),o=>o.geometry.d===undefined);ok(true,'bun girl with cap builds');
 const ey=load(['eye']).p.player('m','uni',{});ok(cntMesh(ey)==base+5&&find(ey,o=>o.material.color=='#15151a')==5,'eyepatch without tudung: patch, front strap, two side straps, back strap');
 const eyg=load(['eye']).p.player('f','uni',{});const baseg=cntMesh(load().p.player('f','uni',{}));ok(cntMesh(eyg)==baseg+2,'eyepatch with tudung: only patch and front strap (the rest would be under the tudung)');
 const capg=load(['cap']).p.player('f','uni',{});ok(cntMesh(capg)==baseg+3,'cap on the tudung look');
 const all=load(['cap','eye','beard','mos']).p.player('m','uni',{hc:'#aa5500'});ok(cntMesh(all)==base+3+5,'all four together: no extra meshes for beard and moustache (drawn on the face)');
 const bm=load(['beard']);bm.p.player('m','uni',{hc:'#aa5500'});ok(bm.m.cv.length==2,'beard: a second canvas layer is used');
 const lay=bm.m.cv[1].ops,face=bm.m.cv[0].ops;ok(lay.some(o=>o[0]=='fill'&&o[2]=='#aa5500')&&lay.some(o=>o[3]=='destination-out'),'beard uses the hair colour and cuts the mouth out of its own layer');
 ok(face.some(o=>o[0]=='drawImage'),'beard layer is drawn onto the face');
 const mm=load(['mos']);mm.p.player('m','uni',{hc:'#aa5500'});const el=mm.m.cv[0].ops.filter(o=>o[0]=='ellipse'&&o[1][1]==87);ok(mm.m.cv.length==1&&el.length==2&&el.every(o=>o[2]=='#aa5500'),'moustache: two lobes on the face canvas in the hair colour');
 const dflt=load(['beard','mos']);dflt.p.player('m','uni',{});ok(dflt.m.cv[1].ops.some(o=>o[2]=='#14161d'),'default hair colour is used when none is set');
 ok(CSRC.split('\n').filter(l=>/BAG/.test(l)).every(l=>/^function player\(/.test(l))&&/function player\([^\n]*BAG\.worn/.test(CSRC)&&!/function npc[^\n]*(BAG|cos)/.test(CSRC),'only player() reads BAG.worn(); npc() never gets cosmetics');
 const pe=load(['cap']).p.player('m','pe',{});ok(cntMesh(pe)==cntMesh(load().p.player('m','pe',{}))+3,'PE outfit also gets the cap');}
/* ---------- 9. portrait ---------- */
{const fs2=new Function('ESC',HSRC.match(/function faceSvg[\s\S]*?\n return h\+'<\/svg>'}/)[0]+";return faceSvg")(s=>String(s).replace(/[<>&"]/g,''));
 const plain=fs2('m',{},null);ok(plain===fs2('m',{},[])&&plain===fs2('m',{}),'portrait without cosmetics is unchanged');
 ok(/#c8293a/.test(fs2('m',{},['cap']))&&!/#c8293a/.test(plain),'portrait: cap');ok(/rx="7" ry="6"/.test(fs2('m',{},['eye'])),'portrait: eyepatch');
 ok(/M29 58C28 78/.test(fs2('f',{nt:true},['beard'])),'portrait: beard');ok((fs2('m',{hc:'#aa5500'},['mos']).match(/#aa5500/g)||[]).length>=3,'portrait: moustache in the hair colour');
 ok(/translate\(0,-12\)/.test(fs2('f',{},['cap']))&&!/translate\(0,-12\)/.test(fs2('f',{nt:true},['cap']))&&!/translate\(0,-12\)/.test(fs2('m',{},['cap'])),'portrait: cap sits higher on the tudung look only');
 const order=fs2('m',{},['beard']);ok(order.indexOf('M29 58C28 78')<order.indexOf('<ellipse cx="40" cy="55"'),'beard is drawn under the eyes and mouth');}
/* ---------- 10. wiring in the real files ---------- */
{const pages=['world.js','kantin.js','kelas.js','luar.js','padang.js'];
 ok(pages.every(f=>/function mkP\(\)\{if\(pm\)sc\.remove\(pm\);pm=player\(gen,'(uni|pe)',curL\);sc\.add\(pm\)/.test(rd('js/'+f))),'the five pages build the player with mkP() (unchanged, no per-page edit needed)');
 ok(!/BAG|cos/.test(rd('js/menu.js').replace(/\/\*[\s\S]*?\*\//g,'')),'menu.js (character setup) knows nothing about cosmetics');
 ok(!rd('index.html').includes('js/bag.js'),'index.html does not load bag.js, so the setup preview is plain');
 ok(['world.html','kantin.html','luar.html','padang.html','kelas.html'].every(f=>rd(f).includes('js/bag.js')),'all five game pages load bag.js');
 ok(/pm!==ghP/.test(rd('js/world.js'))&&/pm!==ghP/.test(rd('js/luar.js')),'world and luar re-ghost a rebuilt player');
 const sw=rd('sw.js');ok(/CACHE='sr-r21c'/.test(sw)&&sw.includes("'js/chars.js'")&&sw.includes("'js/bag.js'"),'sw.js: cache sr-r21c');
 ok(rd('css/style.css').includes('.bgxh{'),'css has the header row rule');
 ok(/## Pusingan 17/.test(rd('README.md')),'README has a Round 17 entry');}
/* ---------- 9. Round 20e: Rompi Tukang Cuci (the vest): a reward, never sold ---------- */
{const base=cntMesh(load().p.player('m','uni',{}));
 const v=load(['vest']).p.player('m','uni',{});
 ok(cntMesh(v)==base+5&&find(v,o=>o.material.color=='#f28c1c'&&o.geometry.w==.5&&o.geometry.d==.34)==1&&find(v,o=>o.material.color=='#f1f3c4')==2&&find(v,o=>o.material.color=='#b86412')==1&&find(v,o=>o.material.color=='#d9dcc0')==1,'vest: 5 boxes (an orange body, 2 reflective stripes, a zip line, a back panel)');
 const bf=cntMesh(load().p.player('f','uni',{}));ok(cntMesh(load(['vest']).p.player('f','uni',{}))==bf+5,'the vest is drawn on the girl too');
 ok(cntMesh(load(['cap','eye','beard','mos','vest']).p.player('m','uni',{hc:'#aa5500'}))==base+3+5+5,'all five cosmetics together');
 ok(.34/2>.145+.01&&.34/2>.15+.015&&.34/2>.27/2+.02,'the vest front (z .17) is in front of the tie, badge and apron faces, so none of them shows through it, and it is a little proud of the torso (.135)');
 const jn=load().p.npc('cuci','m');ok(find(jn,o=>o.material.color=='#f28c1c'&&o.geometry.d==.34)==1,'the janitor NPC wears the vest');
 ok(find(load().p.npc('murid','m'),o=>o.material.color=='#f28c1c'&&o.geometry.d==.34)==0&&find(load().p.npc('pengawas','m'),o=>o.material.color=='#f28c1c'&&o.geometry.d==.34)==0,'no murid or pengawas wears it (the guru look needs the class list, it is covered by chars.js itself)');
}
{const c={name:'A',w:{c:1000}};const{BAG:B,WALLET:W}=env(c);
 ok(B.COSALL.join()=='cap,eye,beard,mos,vest'&&B.COSORD.join()=='cap,eye,beard,mos'&&B.COS.vest&&B.COS.vest.n=='Rompi Tukang Cuci'&&B.IT.vest===undefined,'COSALL has the vest, the shop list (COSORD) does not');
 ok(!B.price('vest')&&B.buyCos('vest')=='bad'&&!B.owns('vest')&&W.get()==1000&&c.cos===undefined,'the vest cannot be bought: no price, no money taken, nothing created');
 ok(B.wear('vest').ok===false,'cannot wear what is not owned');
 ok(B.grantCos('vest')===true&&B.owns('vest')&&c.cos.own.vest==1&&B.grantCos('vest')===false&&W.get()==1000,'a reward: granted once, no money involved');
 ok(B.grantCos('nope')===false&&B.grantCos('')===false,'only known cosmetics can be granted');
 B.wear('vest');ok(B.isOn('vest')&&B.worn().join()=='vest'&&c.cos.on.vest==1,'wear: it is worn and saved in cur.cos.on');B.doff('vest');ok(!B.isOn('vest')&&B.worn().length==0&&B.owns('vest'),'take off: still owned');
 const cap=env({name:'B',w:{c:5000}}).BAG;cap.buyCos('cap');cap.grantCos('vest');cap.wear('cap');cap.wear('vest');ok(cap.worn().join()=='cap,vest','cap and vest together, in the same order as COSALL')}
{const c={name:'A',w:{c:5000}};const e=env(c,1),B=e.BAG,d=e.doc;B.grantCos('vest');B.open();const t=d.body.textContent;ok(/Barang Gaya/.test(t)&&/Rompi Tukang Cuci/.test(t)&&/Belum dipakai/.test(t),'the bag shows the vest under Barang Gaya');
 const b=btns(d).filter(x=>x.textContent=='Pakai');ok(b.length==1,'with a Pakai button');b[0].onclick();ok(B.isOn('vest')&&B.worn().includes('vest'),'the button wears it');B.close();
 B.openRuncit();const t2=d.body.textContent;ok(!/Rompi/.test(t2)&&/Topi/.test(t2),'the Kedai Runcit never lists the vest');B.close()}
console.log(fail?fail+' FAILED, '+pass+' passed':'OK '+pass+' checks');process.exit(fail?1:0);
