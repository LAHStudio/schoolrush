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
/* ---------- 8. chars.js with a three.js stub (Round 23: the chibi engine; tools/three-stub.js builds real vertex arrays, so tris and meshes are real counts) ---------- */
const {mk:mkStub,stats:stubStats}=require('./three-stub.js');
function load(worn){const m=mkStub();let cv=0;const doc={createElement:t=>{if(t==='canvas')cv++;return m.doc.createElement(t)}};const fn=new Function('T','document','R','rnd','BAG','SK','HC',CSRC+";return{player,npc}");const BAG=worn===undefined?undefined:{worn:()=>worn};return{p:fn(m.T,doc,a=>a[0],()=>0,BAG,['#b87a50'],['#14161d']),cv:()=>cv}}
const cntMesh=g=>stubStats(g).meshes;
const find=(g,f)=>{let n=0;g.traverse(o=>{if(o.isMesh&&f(o))n++});return n};
{const base=cntMesh(load().p.player('m','uni',{})),baseg=cntMesh(load().p.player('f','uni',{}));
 ok(cntMesh(load([]).p.player('m','uni',{}))==base&&cntMesh(load(null).p.player('m','uni',{}))==base,'no BAG, nothing worn or null: same player as before');
 {const z=load();z.p.player('m','uni',{});ok(z.cv()==1,'no cosmetics: only the one face canvas')}
 {const z=load();z.p.player('m','uni',{});z.p.player('f','uni',{});z.p.npc('murid','m');ok(z.cv()<=3,'face textures are cached by eye size and mouth, not one canvas per character')}
 const d=k=>cntMesh(load([k]).p.player('m','uni',{hc:'#aa5500'}))-base,dg=k=>cntMesh(load([k]).p.player('f','uni',{}))-baseg;
 ok(d('cap')==3&&dg('cap')==3&&find(load(['cap']).p.player('m','uni',{}),o=>o.material.color=='#c8293a')==1,'cap: crown, peak and button (red crown), also on the tudung look');
 ok(d('eye')==4&&dg('eye')==4,'eyepatch: patch and straps');ok(d('beard')==5&&dg('beard')==5,'beard: its own meshes');ok(d('mos')==1&&dg('mos')==1,'moustache: one mesh');
 ok(cntMesh(load(['cap','eye','beard','mos']).p.player('m','uni',{hc:'#aa5500'}))==base+3+4+5+1-1,'four together (the beard already carries the lip bridge, so one mesh less)');
 ok(find(load(['cap']).p.player('f','uni',{hs:'bun',nt:true}),o=>o.material.color=='#c8293a')==1,'bun girl with cap builds');
 const pe=cntMesh(load(['cap']).p.player('m','pe',{}))-cntMesh(load().p.player('m','pe',{}));ok(pe==3,'PE outfit also gets the cap');
 const bm=load(['beard','mos']);bm.p.player('m','uni',{});ok(bm.cv()==1,'beard and moustache are meshes, no extra canvas layer');
 const D=load();const pl=D.p.player('m','uni',{});ok(pl.userData.legs.length==2&&pl.userData.arms.length==2&&pl.userData.B&&pl.userData.g=='m'&&Math.abs(pl.userData.legs[0].position.y-.39)<1e-9&&Math.abs(pl.userData.arms[0].position.y-.72)<1e-9,'rig contract kept: legs[2], arms[2], B, g; hips y .39, shoulders y .72');
 ok(Math.abs(pl.userData.arms[0].userData.z0+.26)<1e-9&&Math.abs(pl.userData.arms[1].userData.z0-.26)<1e-9&&pl.userData.arms[0].rotation.z==pl.userData.arms[0].userData.z0,'arms keep their A-pose angle in userData.z0 (mop.js restores it)');
 const st=stubStats(pl);ok(st.tris<1500&&st.meshes<45,'budget: a player stays under 1500 triangles and 45 meshes ('+st.tris+' tris, '+st.meshes+' meshes)');
 const fnsrc=CSRC.slice(CSRC.indexOf('function npc(role, g, x) {'),CSRC.indexOf('function anim(G, t, mv) {'));ok(fnsrc.length>500&&!/BAG|cos\.|BAG\.worn/.test(fnsrc),'npc() never reads BAG.worn() (the janitor has its own cos list)');
 ok(CSRC.split('\n').map(l=>l.replace(/\/\*.*?\*\//g,'')).filter(l=>/BAG/.test(l)).length==1&&/cos: typeof BAG !== 'undefined' && BAG\.worn \? BAG\.worn\(\) : null/.test(CSRC),'only player() reads BAG.worn()');}
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
 const sw=rd('sw.js');ok(/CACHE='sr-r27'/.test(sw)&&sw.includes("'js/chars.js'")&&sw.includes("'js/bag.js'"),'sw.js: cache sr-r27');
 ok(rd('css/style.css').includes('.bgxh{'),'css has the header row rule');
 ok(/## Pusingan 17/.test(rd('README.md')),'README has a Round 17 entry');}
/* ---------- 9. Round 20e: Rompi Tukang Cuci (the vest): a reward, never sold. Round 23: drawn by the chibi engine ---------- */
{const base=cntMesh(load().p.player('m','uni',{}));
 const v=load(['vest']).p.player('m','uni',{});
 ok(cntMesh(v)==base+3&&find(v,o=>o.material.color=='#f28c1c')==1&&find(v,o=>o.material.color=='#eef0be')==2,'the vest: one orange body and two reflective stripes');
 const bf=cntMesh(load().p.player('f','uni',{}));ok(cntMesh(load(['vest']).p.player('f','uni',{}))==bf+3,'the vest is drawn on the girl too');
 ok(cntMesh(load(['cap','eye','beard','mos','vest']).p.player('m','uni',{hc:'#aa5500'}))==base+15,'all five cosmetics together');
 const jn=load().p.npc('cuci','m');ok(find(jn,o=>o.material.color=='#f28c1c')==1&&jn.userData.g=='m','the janitor NPC wears the vest and is always a man');
 ok(find(load().p.npc('murid','m'),o=>o.material.color=='#f28c1c')==0&&find(load().p.npc('pengawas','m'),o=>o.material.color=='#f28c1c')==0,'no murid or pengawas wears the vest');
 const roles=['murid','pengawas','guru','cuci','guard','canteen','icecream','runcit','nasilemak','penjual'];let okr=true;for(const r of roles)for(const g of ['m','f',undefined]){try{const n=load().p.npc(r,g);if(!n.userData.legs||n.userData.arms.length!=2||!n.userData.g)okr=false}catch(e){okr=false;console.log(r,g,e.message)}}
 ok(okr,'every role builds for m, f and no gender (penjual, guard, canteen, icecream, runcit, nasilemak, guru, cuci, murid, pengawas)');
 ok(load().p.npc('nasilemak','m').userData.g=='f'&&load().p.npc('guard','f').userData.g=='m','nasilemak is always a woman, guard always a man');
 const cn=load().p.npc('canteen','f',{apronCol:'#2fa39c',h:2.1});ok(find(cn,o=>o.material.color=='#2fa39c')>=1&&Math.abs(cn.scale.x-2.1*1.08)<1e-9,'canteen staff: apron in the stall colour, height from the caller, times the adult scale 1.08');
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
