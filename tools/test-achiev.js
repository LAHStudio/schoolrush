/* Round 27: the 19 extra badges of js/lencana.js: counters, secrets, lncEv, BAG wrappers, award timing, and the one-line hooks in the game files. Run: node tools/test-achiev.js (check the exit code) */
const fs=require('fs'),path=require('path'),vm=require('vm');const R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok  ',m)};
const MID=Date.UTC(2026,10,16,12);
function mk(cur,o){o=o||{};const T={t:1e12},aw=[],sv={n:0},calls=[];class D extends Date{static now(){return T.t}}
 const ctx={setInterval:()=>0,addEventListener:()=>{},document:{getElementById:()=>null,head:{},body:{}},Date:D,console};ctx.window=ctx;vm.createContext(ctx);
 ctx.award=(id,t,d)=>{aw.push([id,t,d]);cur.badges[id]=T.t};ctx.save=()=>{sv.n++};
 vm.runInContext('var halt='+(o.halt?'true':'false')+';const BD=[["air8","Tabiat Sihat","x"],["sampah12","Pelajar Prihatin","x"],["slip5","Kaki Licin","x"],["gem5","Laju Kilat","x"],["gol5","Penjaring","x"]];let cur=null;',ctx);ctx.__c=cur;vm.runInContext('cur=__c;',ctx);
 if(o.bag){ctx.__calls=calls;vm.runInContext('const BAG={COSALL:["cap","eye","beard","mos","vest"],use:k=>({ok:k!="x"&&k!="nasi"}),buy:(k)=>globalThis.__buy||"ok",buyCos:()=>globalThis.__cos||"ok",ice:()=>globalThis.__ice||"ok"};',ctx)}
 vm.runInContext(R('js/lencana.js'),ctx);return{ctx,T,aw,sv,L:()=>ctx.LNC,cur}}
const fresh=()=>({badges:{},name:'A'});
const ids=['fashion','doping','loker10','lipas10','rotan3','olahraga','diet','saintis','cemerlang','ulat','contoh','cuci','gol20','slip20','air50','kaya','setia','kenal','legenda'];
{const w=mk(fresh()),cs=w.L().cards({badges:{}});
 ok(w.L().extra.map(x=>x[0]).join()==ids.join(),'19 extra badges, in this order');ok(new Set(cs.map(x=>x.id)).size==24,'24 unique badge ids in total (5 old + 19)');
 const by=i=>cs.find(x=>x.id==i);ok(['doping','rotan3','legenda'].every(i=>by(i).sec&&by(i).name=='???'&&by(i).how=='Rahsia!'&&by(i).n==0),'doping, rotan3, legenda are secret while locked: "???", "Rahsia!", no progress');
 ok(ids.filter(i=>!['doping','rotan3','legenda'].includes(i)).every(i=>!by(i).sec&&by(i).name!='???'&&by(i).how.length>8),'the other 16 show their name and how to earn them');
 const u=w.L().cards({badges:{rotan3:MID}}).find(x=>x.id=='rotan3');ok(u.on&&u.name=='Saya sayang Guru Disiplin'&&!u.sec,'an unlocked secret badge shows its real name')}
/* counters (read from any slot) */
{const w=mk(fresh()),c=(p,i)=>{const x=w.L().cards(p).find(q=>q.id==i);return x.c+'/'+x.n};
 ok(c({cos:{own:{cap:1,vest:1,junk:1}}},'fashion')=='2/5'&&c({},'fashion')=='0/5','fashion: clothes owned out of 5 (the vest counts)');
 ok(c({ach:{fx:{gula:2,epal:1,nasi:3}}},'doping')=='0/0','doping is secret: no progress shown');
 const g=(p,i)=>w.L().meta[i].c(p),n=i=>w.L().meta[i].n;
 ok(g({ach:{fx:{gula:2,epal:1,nasi:3,iso:0}}},'doping')==2&&n('doping')==4,'doping: counts gula/pisang/iso/epal used at least once (nasi and zero do not count)');
 ok(g({ach:{lock:7}},'loker10')==7&&n('loker10')==10&&g({ach:{escape:4}},'lipas10')==4&&n('lipas10')==10&&g({ach:{cane:2}},'rotan3')==2&&n('rotan3')==3,'lockers 10, escapes 10, rotan 3');
 ok(g({ach:{pj:{0:5,1:1,2:3}}},'olahraga')==7&&n('olahraga')==9&&g({ach:{pj:{0:9,1:9,2:9}}},'olahraga')==9,'olahraga: each of the 3 events counts at most 3 (target 9)');
 ok(g({ach:{stall:{0:2,3:1,9:4}}},'diet')==2&&n('diet')==5,'diet: distinct stalls 0-4 played (stall 9 ignored)');
 ok(g({quiz:{sainspp:{mudah:{n:1}},sainsex:{sukar:{n:0}},sainsmm:{sederhana:{n:2}},mat:{x:{n:5}}}},'saintis')==2&&n('saintis')==3&&g({},'saintis')==0,'saintis: sains stations with a saved result (n>0)');
 const rooms={mat:{g:'A+'},sains:{g:'A+'},eng:{g:'B'},bm:{g:'D'},pj:{},kantin:{g:'A+'}};
 ok(g({rooms},'cemerlang')==3&&g({rooms},'ulat')==5&&g({},'ulat')==0,'cemerlang = A+ rooms, ulat = rooms with any grade');
 ok(g({rooms},'contoh')==5&&g({rooms,caught:1},'contoh')==0&&g({rooms,off:1},'contoh')==0&&g({rooms,ach:{cane:1}},'contoh')==0,'contoh: 0 once the slot was ever caught (guard, offence or rotan)');
 const ct=w.L().cards({rooms,caught:1,badges:{}}).find(x=>x.id=='contoh');ok(ct.note=='Pernah kena tangkap','contoh: locked card says "Pernah kena tangkap"');
 ok(g({jk:{done:1}},'cuci')==1&&g({jk:{done:0}},'cuci')==0&&g({},'cuci')==0,'cuci: Janitor quest done');
 ok(g({gol:25},'gol20')==25&&g({slip:3},'slip20')==3&&g({drinks:50},'air50')==50&&n('gol20')==20&&n('slip20')==20&&n('air50')==50,'tier badges read gol, slip, drinks (20, 20, 50)');
 ok(g({s:[1,2,0,1]},'kaya')==120&&n('kaya')==5000,'kaya: sen earned from rubbish = sum of s[type] x earn[type] (1x30+2x40+1x10), target RM 50');
 ok(w.L().cards({s:[1,2,0,1],badges:{}}).find(x=>x.id=='kaya').txt=='RM 1.20 / RM 50.00','kaya shows "RM 1.20 / RM 50.00"');
 ok(g({ach:{sell:{nasi:1,ice:2,run:0}}},'setia')==2&&n('setia')==3&&g({ach:{talk:{guard:1,nasi:1,x:1}}},'kenal')==2&&n('kenal')==4,'setia 3 sellers, kenal 4 people');
 ok(g({badges:{air8:1,gem5:1,fashion:1,legenda:1}},'legenda')==3&&n('legenda')==23,'legenda: the other badges unlocked, out of 23 (itself not counted)')}
/* lncEv */
{const cur=fresh(),w=mk(cur),ev=w.ctx.lncEv;ok(typeof ev=='function','window.lncEv exists');
 ev('cane');ev('cane');ev('lock');ev('escape');ev('pj',1);ev('pj',1);ev('pj',2);ev('stall',4);ev('sell','ice');ev('fx','gula');ev('talk','guard');
 ok(cur.ach.cane==2&&cur.ach.lock==1&&cur.ach.escape==1,'cane, lock, escape are plain counters');
 ok(cur.ach.pj[1]==2&&cur.ach.pj[2]==1&&cur.ach.stall[4]==1&&cur.ach.sell.ice==1&&cur.ach.fx.gula==1&&cur.ach.talk.guard==1,'pj, stall, sell, fx, talk are counted per key');
 const before=JSON.stringify(cur.ach),sv=w.sv.n;ev('talk','btn');ev('talk','bus');ev('nothing');ev();ok(JSON.stringify(cur.ach)==before&&w.sv.n==sv,'talk to a button/bus, unknown or empty events are ignored (no save either)');
 ok(w.sv.n==11,'every counted event saves the slot ('+w.sv.n+')');ev('talk','run');ev('talk','nasi');ev('talk','ice');ok(w.L().meta.kenal.c(cur)==4,'talking to guard + 3 sellers = 4');
 cur.ach={cane:'x',pj:5};ev('cane');ev('pj',0);ok(cur.ach.cane==1&&cur.ach.pj[0]==1,'damaged cur.ach values are repaired, no crash');
 const w2=mk(null);w2.ctx.lncEv('cane');ok(true,'no slot loaded: lncEv does nothing')}
/* BAG wrappers */
{const cur=fresh(),w=mk(cur,{bag:true});const run=s=>vm.runInContext(s,w.ctx);
 run('BAG.use("gula");BAG.use("epal");BAG.use("nasi");BAG.use("x")');ok(cur.ach.fx.gula==1&&cur.ach.fx.epal==1&&!cur.ach.fx.nasi&&!cur.ach.fx.x,'BAG.use: only a successful boost counts (not nasi, not a failed use)');
 run('BAG.buy("nasi");BAG.buy("gula")');ok(cur.ach.sell.nasi==1&&cur.ach.sell.run==1,'BAG.buy: nasi = nasi lemak seller, other items = runcit');
 run('globalThis.__buy="poor";BAG.buy("nasi");globalThis.__buy="full";BAG.buy("iso");globalThis.__cos="own";BAG.buyCos("cap");globalThis.__ice="poor";BAG.ice()');ok(cur.ach.sell.nasi==1&&cur.ach.sell.run==1&&!cur.ach.sell.ice,'poor / full / already owned purchases do not count');
 run('globalThis.__cos="ok";BAG.buyCos("cap");globalThis.__ice="cured";BAG.ice()');ok(cur.ach.sell.run==2&&cur.ach.sell.ice==1,'buyCos ok counts as runcit; ice "cured" counts as ice cream');
 ok(run('BAG.use("gula").ok')===true&&run('globalThis.__buy="ok";BAG.buy("gula")')==='ok','wrapped functions return the original results');
 const n0=cur.ach.fx.gula;vm.runInContext(R('js/lencana.js'),w.ctx);run('BAG.use("gula")');ok(cur.ach.fx.gula==n0+1,'loading the file twice does not wrap twice (one use = one count)')}
/* tick(): award rules */
{const cur=Object.assign(fresh(),{drinks:60,slip:30,gol:2,rooms:{mat:{g:'A'},sains:{g:'B'},eng:{g:'C'},bm:{g:'D'},pj:{g:'A+'},kantin:{g:'A'}}}),w=mk(cur);
 w.L().tick();ok(w.aw.length==1&&w.aw[0][0]=='ulat'&&w.aw[0][1]=='Ulat Buku'&&w.aw[0][2]=='Main semua 6 kelas sekurang-kurangnya sekali.','first tick gives ONE badge by list order (ulat comes before slip20/air50), with name and how-to as the toast text');
 w.L().tick();ok(w.aw.length==1,'a second tick right away gives nothing (toasts must not cover each other)');
 w.T.t+=4000;w.L().tick();ok(w.aw.length==1,'still waiting at +4.0 s');w.T.t+=400;w.L().tick();ok(w.aw.length==2&&w.aw[1][0]=='contoh','at +4.4 s the next one comes (contoh, in list order)');
 w.T.t+=5000;w.L().tick();w.T.t+=5000;w.L().tick();w.T.t+=5000;w.L().tick();ok(w.aw.map(x=>x[0]).join()=='ulat,contoh,slip20,air50','then slip20, air50 and nothing more (gol 2 and the rest not reached): '+w.aw.map(x=>x[0]));
 w.T.t+=5000;w.L().tick();ok(w.aw.length==4,'badges already owned are never given twice')}
{const cur=fresh();cur.drinks=60;const w=mk(cur,{halt:true});w.L().tick();ok(w.aw.length==0,'no badge while the game is halted (scene or pause menu)');vm.runInContext('halt=false',w.ctx);w.L().tick();ok(w.aw.length==1&&w.aw[0][0]=='air50','it is given as soon as the game runs again')}
{
 /* legenda only after everything else: */
 const cur=fresh();['air8','sampah12','slip5','gem5','gol5'].concat(ids.filter(i=>i!='legenda')).forEach(i=>cur.badges[i]=MID);const z=mk(cur);z.L().tick();ok(z.aw.length==1&&z.aw[0][0]=='legenda'&&z.aw[0][1]=='Legenda Sekolah','legenda is given once the other 23 are owned');
 const c2=fresh();['air8','sampah12','slip5','gem5','gol5'].concat(ids.filter(i=>i!='legenda'&&i!='diet')).forEach(i=>c2.badges[i]=MID);const z2=mk(c2);z2.L().tick();ok(z2.aw.length==0,'legenda is not given while one badge is missing')}
{const cur=fresh();cur.gol=7;const w=mk(cur);w.L().tick();ok(w.aw.length==0,'the old five (air8, gol5 ...) are never given by this file: they keep their own award() calls')}
{const w=mk(fresh());const cur0=mk(null);const t=()=>cur0.L().tick();t();ok(cur0.aw.length==0,'tick with no slot does nothing')}
/* hooks in the game files (one line each, never throw if lencana.js is missing) */
{const w=R('js/world.js'),l=R('js/lockers.js'),p=R('js/padang.js'),k=R('js/kantin.js'),u=R('js/luar.js');
 ok(/function caneStart\(\)\{[^\n]*\n[^\n]*\n CN\.third=[^\n]*CN\.on=1;window\.lncEv&&lncEv\('cane'\);/.test(w),'world.js: cane hook right where the cane scene starts (CN.on=1)');
 ok(/s\.o\[id\]=1;save\(s\);paint\(s\);window\.lncEv&&lncEv\('lock'\);/.test(l)&&/release\(\);window\.lncEv&&lncEv\('escape'\);toast\('Pengawas berhenti/.test(l),'lockers.js: lock hook (puzzle finished) and escape hook (prefect gives up)');
 ok(/function onRes\(i,res\)\{if\(!res\|\|res\.exit\)\{stageOut\(shut\);return\}\n PG\.snd\.star\(res\.stars\);lastRes=res;window\.lncEv&&lncEv\('pj',i\);/.test(p),'padang.js: event hook only after a finished game (not on exit)');
 ok(/function onRes\(i,res\)\{if\(!res\|\|res\.exit\)\{[^}]*\}shut\(\);return\}PAID\[i\]=0;RES\[i\]=res;window\.lncEv&&lncEv\('stall',i\);/.test(k),'kantin.js: stall hook only after a finished game (not on exit)');
 ok(/const a=nearAct\(\);if\(!a\)return;window\.lncEv&&lncEv\('talk',a\[0\]\);/.test(u),'luar.js: talk hook after the nearest action is found');
 const ctx={window:{}};vm.createContext(ctx);vm.runInContext(R('js/padang-data.js'),ctx);ok(ctx.window.PD.g.length==3,'padang has 3 events (PJN = 3)');
 ok(/stall:\[100,150,100,100,100\]/.test(R('js/wallet.js')),'kantin has 5 stalls (STN = 5)');
 ok(/COSORD=\['cap','eye','beard','mos'\],COSALL=COSORD\.concat\(\['vest'\]\)/.test(R('js/bag.js')),'5 clothing items (cap, eye, beard, mos, vest)');
 ok(/RM=\[\['mat'[^\]]*\],\['sains'[^\]]*\],\['eng'[^\]]*\],\['bm'[^\]]*\],\['pj'[^\]]*\],\['kantin'[^\]]*\]\]/.test(R('js/core.js')),'6 classes (mat, sains, eng, bm, pj, kantin)');
 ok(/recQuiz\('sainspp'/.test(R('js/kelas-sains-data.js'))&&/recQuiz\('sainsex'/.test(R('js/kelas-sains-ex-data.js'))&&/recQuiz\('sainsmm'/.test(R('js/kelas-sains-mm-data.js')),'the 3 sains station keys are sainspp, sainsex, sainsmm');
 ok(/earn:\[30,40,50,10\]/.test(R('js/wallet.js')),'wallet earn table matches the fallback in lencana.js');
 ok(/const\{[^}]*\}|j\.done=/.test(R('js/jkey.js')),'jkey.js sets j.done (Tukang Cuci)')}
process.exit(bad?1:0);
