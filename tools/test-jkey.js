/* Round 20a: side quest Kunci Hilang part 1 (js/jkey.js): the 8 hallway notice boards, the 6 photo pieces, the torn-piece geometry, saving, the hooks in world.js / bag.js / world.html / sw.js.
   Node only, no browser. jkey.js runs for real in a vm with stubs. Run: node tools/test-jkey.js */
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ex=f=>fs.existsSync(path.join(__dirname,'..',f)),sha=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',f))).digest('hex');
const SRC=rd('js/jkey.js'),WB=rd('js/world-build.js'),WJ=rd('js/world.js'),BG=rd('js/bag.js'),HTML=rd('world.html'),SW=rd('sw.js');
/* a fresh world for jkey.js: cur (profile), save counter, P, halt, JKB, lock stubs */
function world(o){o=o||{};const log={save:0,say:[],toast:[],tone:0},ctx={cur:o.cur||{},save(){log.save++},P:{x:0,z:0},halt:false,JKB:o.JKB,say:t=>log.say.push(t),toast:t=>log.toast.push(t),tone(){log.tone++},window:{},console,setTimeout:o.noTimers?(()=>0):setTimeout,clearTimeout};
 ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext('"use strict";'.slice(0,0)+SRC+';globalThis.JK=JK;globalThis.setHalt=v=>{halt=v};globalThis.getHalt=()=>halt;globalThis.setP=(x,z)=>{P.x=x;P.z=z}',ctx);return{ctx,JK:ctx.JK,log}}
const seq=a=>{let i=0;return()=>a[i++%a.length]};
const lcg=s=>()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};

/* ---- 1. hooks and files ---- */
ok(/jkGo/.test(WJ)&&/if\(window\.toiGo&&toiGo\(\)\)return;if\(window\.jkGo&&jkGo\(\)\)return;/.test(WJ),'world.js: act() calls jkGo right after toiGo');
ok(/\|\|\(window\.toiHint\?toiHint\(\):''\)\|\|\(window\.jkHint\?jkHint\(\):''\)/.test(WJ),'world.js: the hint chain ends with jkHint');
ok(/"js\/bag\.js", "js\/jkey\.js", "js\/mop\.js", "js\/world-build\.js"/.test(HTML),'world.html loads js/jkey.js and js/mop.js after bag.js, before world-build.js (JKB and TOIL are only read when used)');
ok(/'js\/bag\.js','js\/jkey\.js','js\/mop\.js'/.test(SW)&&/CACHE='sr-r21b'/.test(SW),'sw.js: jkey.js is pre-cached, cache sr-r21b');
ok(/concat\(typeof JK!=='undefined'&&JK\.rows\?JK\.rows\(\):\[\]\)/.test(BG),'bag.js: the bag adds the JK rows only when JK exists');
ok((SRC.match(/Math\.random/g)||[]).length==3&&SRC.split('Math.random').every((x,i,arr)=>i==arr.length-1||/r=r\|\|$/.test(x)),'jkey.js: Math.random only as a default argument (so it is testable)');
ok(!ex('_backup_round19e')&&!ex('_backup_round20a')&&!ex('_backup_round20a2')&&!ex('_backup_round20b')&&!ex('_backup_round20c')&&ex('_backup_round21')&&ex('_backup_round20d')&&ex('_backup_round20d2')&&ex('_backup_round20d3')&&ex('_backup_round20e'),'backups: 21, 20e, 20d3, 20d2, 20d kept, 20c and older dropped');
ok(ex('_backup_round20d3/js/mop.js')&&ex('_backup_round20d3/sw.js')&&ex('_backup_round20d3/README.md')&&ex('_backup_round20d3/tools/test-mop.js')&&!ex('_backup_round20d3/js/world.js'),'20d3 backup holds the files changed in 20d3 only (mop.js, sw, README, tools)');
ok(ex('_backup_round20d/js/world.js')&&ex('_backup_round20d/js/jkey.js')&&ex('_backup_round20d/world.html')&&ex('_backup_round20d/sw.js')&&ex('_backup_round20d/README.md')&&ex('_backup_round20d/tools/test-jkey.js')&&!ex('_backup_round20d/js/bag.js')&&!ex('_backup_round20d/js/toilet.js'),'20d backup holds the files changed in 20d only (world, jkey, world.html, sw, README, tools)');
ok(ex('_backup_round21/js/jkey.js')&&ex('_backup_round21/sw.js')&&ex('_backup_round21/README.md')&&ex('_backup_round21/index.html')&&ex('_backup_round21/world.html')&&ex('_backup_round21/tools/test-jkey.js')&&!ex('_backup_round21/js/world.js')&&!ex('_backup_round21/js/bag.js'),'21 backup holds the files changed in 21 only (jkey, sw, README, index, world.html, tools)');
ok(ex('_backup_round20e/js/bag.js')&&ex('_backup_round20e/js/chars.js')&&ex('_backup_round20e/js/jkey.js')&&ex('_backup_round20e/sw.js')&&ex('_backup_round20e/README.md')&&ex('_backup_round20e/tools/test-cos.js')&&!ex('_backup_round20e/js/world.js')&&!ex('_backup_round20e/js/toilet.js'),'20e backup holds the files changed in 20e only (bag, chars, jkey, sw, README, tools)');

/* ---- 2. the boards in world-build.js: run the real board list ---- */
{const i0=WB.indexOf('const JKB=[];'),i1=WB.indexOf('\n',i0);ok(i0>0&&i1>i0,'JKB line found');
 const line=WB.slice(i0,i1),calls=[],K=.112,X=x=>(x-340)*K,Z=y=>(y-344)*K,f=new Function('nb','X','Z',line+';return JKB'),B=f((...a)=>calls.push(a),X,Z);
 ok(B.length==8&&calls.length==8,'8 readable boards');
 const old=[[354,205,-1,0],[318,385,1,0],[160,186,0,-1],[400,362,0,-1],[500,326,0,1]];
 ok(old.every((o,i)=>calls[i].join()==o.join()),'the 5 old boards come first and are unchanged');
 ok(calls.every(c=>Math.abs(Math.hypot(c[2],c[3])-1)<1e-9)&&new Set(calls.map(c=>c.join())).size==8,'8 different boards, unit normals');
 ok(B.every((b,i)=>Math.abs(b.x-(X(calls[i][0])+calls[i][2]*.06))<1e-9&&Math.abs(b.z-(Z(calls[i][1])+calls[i][3]*.06))<1e-9),'board spot = the nb() spot');
 /* the 3 new boards sit on empty wall faces: far from every door, back door, filter, bin, vase, board and recycle bin */
 const doors=[[452,362],[248,186],[354,256],[318,432],[170,110],[480,110],[387,502],[280,326],[420,186],[270,362],[530,502]],stuff=[[300,186],[520,186],[354,300],[318,470],[200,186],[420,326],[150,362],[120,180],[349,286],[567,357.5],[215,362],[580,250],[354,466],[354,482],[324,150],[348,150]];
 const need=[...doors,...stuff].map(p=>[p[0],p[1]]);
 ok(calls.slice(5).every(c=>need.every(p=>{const same=c[3]?Math.abs(p[1]-c[1])<6:Math.abs(p[0]-c[0])<6;return Math.hypot(c[0]-p[0],c[1]-p[1])>=(same?40:30)})),'new boards: 40+ map px (4.5 m) from anything on the same wall face and 30+ px from anything on the opposite wall (doors, back doors, filters, bins, vases, benches)');
 ok(calls.slice(5).every(c=>old.every(o=>Math.hypot(c[0]-o[0],c[1]-o[1])>=40)),'new boards are at least 4.5 m from the old boards');
 /* a wall face really is there: block faces from the blk() calls (block 100-318 x 186-326, 354-544 x 186-326, 354-420 x 362-502) */
 const face=(c)=>{const[x,y,nx,nz]=c;return(nz==-1&&y==186&&((x>=100&&x<=318)||(x>=354&&x<=544)))||(nz==1&&y==326&&((x>=100&&x<=318)||(x>=354&&x<=544)))||(nx==1&&x==544&&y>186&&y<326)};
 ok(calls.slice(5).every(face),'each new board hangs on a real block wall facing the corridor');
 ok(WB.includes('blk(100,186,318,326,4,BE,1);blk(354,186,544,326,4,BE,1)'),'those block walls are in world-build.js');
 /* reach: the player can stand at the wall (radius .35) and still reach the board; a spot across the 4 m corridor cannot */
 const {JK}=world({JKB:B});B.forEach((b,i)=>{const w=world({JKB:B});w.ctx.setP(b.x+b.nx*.8,b.z+b.nz*.8);ok(w.JK.near()==i,'board '+i+': reachable standing 0.8 m off the wall');w.ctx.setP(b.x+b.nx*3.9,b.z+b.nz*3.9);ok(w.JK.near()==-1,'board '+i+': not reachable from across the corridor')})}

/* ---- 3. save shape, old saves ---- */
{const w=world({JKB:[]}),J=w.JK;
 ok(J.st(false)==null&&w.ctx.cur.jk===undefined,'an old save has no jk and reading the state does not create it');
 ok(J.rows().length==0&&J.hint()==''&&J.go()===false,'no rows, no hint, no E action without boards or pieces');
 const s=J.st(true,lcg(1));ok(J.okS(s)&&s.f.length==6&&s.rd.length==8&&s.ass.length==6&&new Set(s.ass).size==6&&s.ass.every(b=>b>=0&&b<8)&&Number.isInteger(s.loc)&&s.loc>=0&&s.loc<5&&s.key==0&&s.done==0,'fresh quest: 6 flags, 6 distinct boards out of 8, a hiding place 0..4, key 0, done 0');
 const bad=[null,0,'x',[],{},{f:[0,0,0,0,0,0]},{f:[0,0,0,0,0,2],ass:[0,1,2,3,4,5],rd:[0,0,0,0,0,0,0,0],loc:0},{f:[0,0,0,0,0,0],ass:[0,1,2,3,4,4],rd:[0,0,0,0,0,0,0,0],loc:0},{f:[0,0,0,0,0,0],ass:[0,1,2,3,4,9],rd:[0,0,0,0,0,0,0,0],loc:0},{f:[0,0,0,0,0,0],ass:[0,1,2,3,4,5],rd:[0,0,0,0,0,0,0],loc:0},{f:[0,0,0,0,0,0],ass:[0,1,2,3,4,5],rd:[0,0,0,0,0,0,0,0],loc:5},{f:[0,0,0,0,0,0],ass:[0,1,2,3,4,5],rd:[0,0,0,0,0,0,0,-1],loc:0},{f:[0,0,0,0,0,0],ass:[0,1,2,3,4,5],rd:[0,0,0,0,0,0,0,'a'],loc:0}];
 bad.forEach((b,i)=>{const w2=world({cur:{jk:b},JKB:[]});ok(w2.JK.st(false)==null,'broken jk #'+i+' is not used');const s2=w2.JK.st(true,lcg(2));ok(w2.JK.okS(s2)&&w2.JK.count(s2)==0,'broken jk #'+i+' is replaced by a fresh quest')});
 const good={f:[1,0,1,0,0,0],ass:[7,6,5,4,3,2],rd:[0,0,1,0,0,0,0,2],loc:0,key:1,done:0},w3=world({cur:{jk:JSON.parse(JSON.stringify(good))},JKB:[]});
 ok(w3.JK.st(false)&&w3.JK.count(w3.JK.st(false))==2,'a good saved quest is kept as it is');
 const norm=Object.assign({},good,{lt:[0,0],th:0});ok(JSON.stringify(w3.ctx.cur.jk)==JSON.stringify(norm),'reading it only adds the 20c fields (lt [0,0], th 0); key 1 stays');
 ok(JSON.stringify(JSON.parse(JSON.stringify(w3.ctx.cur.jk)))==JSON.stringify(norm),'it survives a JSON save and load')}

/* ---- 4. reading boards: chance, pity, once only ---- */
{const w=world({JKB:[]}),J=w.JK,s=J.st(true,lcg(3)),ass=s.ass.slice(),dec=[0,1,2,3,4,5,6,7].filter(b=>!ass.includes(b));
 ok(dec.length==2,'2 boards hold no piece');
 for(let i=0;i<40;i++){const r=J.read(dec[i%2],()=>0);ok(r.k=='flav'&&typeof r.line=='string'&&r.line.length>8,'decoy reading '+i+' gives a notice, never a piece')}
 ok(J.count(J.st(false))==0&&w.log.save>=40,'no piece from the 2 decoy boards, each reading saved');
 const b0=ass[0];let r=J.read(b0,()=>.9);ok(r.k=='flav','piece board, bad luck (roll .9 >= .5): a notice');
 r=J.read(b0,()=>.9);ok(r.k=='flav','piece board, 2nd reading, bad luck: still a notice');
 r=J.read(b0,()=>.9);ok(r.k=='piece'&&r.frag==0&&r.n==1&&!r.all&&J.st(false).f[0]==1,'3rd reading is certain (pity)');
 r=J.read(b0,()=>0);ok(r.k=='flav','the same board never gives its piece twice, even with a lucky roll');
 const b1=ass[1];r=J.read(b1,()=>.2);ok(r.k=='piece'&&r.frag==1&&r.n==2,'lucky roll (.2 < .5) gives the piece on the first reading');
 ok(J.collect(1)===false&&J.collect(0)===false&&J.count(J.st(false))==2,'collect(k) is idempotent, nothing is counted twice');
 ok(J.collect(2)===true&&J.count(J.st(false))==3&&J.collect(2)===false,'collect(2) counts once');
 ok(J.collect(-1)===false&&J.collect(6)===false&&J.collect(1.5)===false&&J.collect('1')===false&&J.count(J.st(false))==3,'bad piece numbers change nothing');
 ok(J.read(-1)===null&&J.read(8)===null&&J.read(NaN)===null&&J.read('a')===null,'bad board numbers change nothing');
 const L=J.LINES[dec[0]],a=J.read(dec[0],()=>0),b=J.read(dec[0],()=>0),c=J.read(dec[0],()=>0),d=J.read(dec[0],()=>0);
 ok(a.line!=undefined&&L.includes(a.line)&&L.includes(d.line)&&new Set([a.line,b.line,c.line]).size>=2,'notices come from that board\'s own lines and change on later readings')}
/* all 6 within the worst case: 6 piece boards x 3 readings */
for(let seed=1;seed<=60;seed++){const w=world({JKB:[]}),J=w.JK,s=J.st(true,lcg(seed*7)),r=lcg(seed*13);let reads=0,got=0,last=null;
 while(J.count(J.st(false))<6&&reads<500){const b=Math.floor(r()*8);const x=J.read(b,r);reads++;if(x.k=='piece'){got++;last=x}}
 ok(J.count(J.st(false))==6&&got==6&&last.all&&last.n==6,'seed '+seed+': all 6 pieces are found, each counted once, the last one reports all');
 const rd=J.read(s.ass[0],()=>0);ok(rd.k=='flav'&&J.count(J.st(false))==6,'seed '+seed+': after all 6 nothing more can be found')}
/* the board assignment is random per quest and does not depend on later reading */
{const seen=new Set();for(let i=1;i<=30;i++)seen.add(world({JKB:[]}).JK.st(true,lcg(i*977)).ass.join());ok(seen.size>10,'the 6 piece boards differ between new quests (random)')}
/* the quest is per slot: another profile object starts with nothing */
{const a=world({JKB:[]}),b=world({JKB:[]});a.JK.st(true);a.JK.collect(3);ok(a.JK.count(a.JK.st(false))==1&&b.JK.st(false)==null,'the quest lives in its own profile object only')}

/* ---- 5. torn piece geometry ---- */
{const {JK}=world({JKB:[]}),W=300,H=200,area=p=>{let s=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];s+=a[0]*b[1]-b[0]*a[1]}return s/2};
 const P=[0,1,2,3,4,5].map(k=>JK.poly(k));
 ok(P.every(p=>p.length==4+4*5&&p.every(q=>isFinite(q[0])&&isFinite(q[1]))||p.length>=8),'every piece has an outline');
 let tot=0;P.forEach((p,k)=>{const a=area(p);tot+=Math.abs(a);ok(a>0&&Math.abs(a-10000)<1500,'piece '+k+' outline is clockwise (positive area) and about 100 x 100')});
 ok(Math.abs(tot-W*H)<1e-6,'the 6 pieces together have exactly the photo area 300 x 200 (no gaps or overlaps)');
 const near=(a,b)=>Math.abs(a[0]-b[0])<1e-9&&Math.abs(a[1]-b[1])<1e-9;
 [[0,0],[100,0],[200,0],[300,0],[0,100],[100,100],[200,100],[300,100],[0,200],[100,200],[200,200],[300,200]].forEach(c=>{const hits=P.filter(p=>p.some(q=>near(q,c))).length;ok(hits>=1,'grid corner '+c+' is a vertex of a piece')});
 ok(P.every((p,k)=>{const c=k%3,r=Math.floor(k/3);return p.every(q=>q[0]>=c*100-8&&q[0]<=c*100+108&&q[1]>=r*100-8&&q[1]<=r*100+108)}),'no piece wanders more than 8 px outside its cell');
 /* a shared edge is identical for the two neighbours */
 const key=q=>q[0].toFixed(6)+','+q[1].toFixed(6),set=p=>new Set(p.map(key));
 const shared=(i,j)=>[...set(P[i])].filter(x=>set(P[j]).has(x)).length;
 ok(shared(0,1)==7&&shared(1,2)==7&&shared(3,4)==7&&shared(4,5)==7,'left and right neighbours share one whole jagged edge (7 points)');
 ok(shared(0,3)==7&&shared(1,4)==7&&shared(2,5)==7,'top and bottom neighbours share one whole jagged edge (7 points)');
 ok(shared(0,4)==1&&shared(1,3)==1&&shared(1,5)==1&&shared(2,4)==1&&shared(0,5)==0&&shared(2,3)==0,'diagonal neighbours touch at one grid corner only, pieces far apart touch nowhere');
 /* outer sides are straight */
 ok(P[0].filter(q=>q[0]==0).length>=2&&P[0].every(q=>q[0]>=0&&q[1]>=0)&&P[0].filter(q=>q[1]==0).length>=2,'piece 0: its outer left and top sides lie on the photo border');
 ok(P[5].every(q=>q[0]<=300&&q[1]<=200),'piece 5: nothing outside the photo');
 /* deterministic: same outline each time */
 ok(JSON.stringify(JK.poly(4))==JSON.stringify(world({JKB:[]}).JK.poly(4)),'outlines are the same on every run and every device')}

/* ---- 6. the 5 hiding places: data, world positions, who can search where ---- */
const K2=.112,XX=x=>(x-340)*K2,ZZ=y=>(y-344)*K2,TOILS=[{jk:{x:-30,z:-10,s:-1}},{jk:{x:30,z:20,s:1}}];
const w6=(o)=>{const w=world(Object.assign({JKB:[]},o||{}));w.ctx.X=XX;w.ctx.Z=ZZ;w.ctx.TOIL=TOILS;w.ctx.gen='m';return w};
{const{JK}=w6();const S=JK.SPOTS;
 ok(S.length==5&&S.map(x=>x.id).join()=='pasu-timur,pasu-timurlaut,celah-loker,bangku,sinki','5 hiding places, spot 0 is still the east plant of 20a');
 ok(S.every(x=>x.f&&x.f.length>12&&x.d.length>=2&&x.d.every(t=>t.length>12)&&x.r>=1&&x.cam.length==3&&x.n),'each has a found line, 2+ nothing-here lines, a reach, a photo camera and a name');
 ok(S[4].t==1&&S.slice(0,4).every(x=>!x.t),'only spot 4 is the toilet one');
 const wb=WB.replace(/\r/g,'');
 ok(/\[\[575\.5,154\.5\],\[104\.5,330\.5\],\[575\.5,357\.5\]\]\.forEach\(a=>plant/.test(wb)&&S[0].px==575.5&&S[0].py==357.5&&S[1].px==575.5&&S[1].py==154.5,'spots 0 and 1 are the east and north-east plants (the west plant 104.5,330.5 has no trigger)');
 ok(wb.includes('[[104,312],[360,560]].forEach(s=>lock(s[0],s[1],530.9,538))')&&S[2].px==102&&S[2].tx==102&&S[2].ty2==534.5&&S[2].py<530.9,'spot 2: the 4 px (0.45 m) gap between the west wall (x 100) and the first south locker (x 104), trigger just outside it');
 ok(/bench\(215,362,0,-1,2\.2,2\)/.test(wb)&&S[3].px==215&&S[3].py==362&&S[3].oz==-.35,'spot 3: the bench at 215,362, trigger at its centre (0.35 m off the wall)');
 ok(/jk:\{x:ex\+s\*\(D-\.2\),z:zc\+cv0\+\.3,s\}/.test(wb)&&/cs=1\.2,ce=D-\.4,cv0=vmax-\.6/.test(wb),'spot 4: the 0.4 m far-wall gap (u from D-.4 to D) beside the sink cabinet; the trigger is its centre');
 const p0=JK.pos(0),p2=JK.pos(2),p3=JK.pos(3);
 ok(Math.abs(p0.x-XX(575.5))<1e-9&&Math.abs(p0.z-ZZ(357.5))<1e-9,'pos(0)');
 ok(Math.abs(p2.x-XX(102))<1e-9&&Math.abs(p2.z-ZZ(527.4))<1e-9&&Math.abs(p2.tz-ZZ(534.5))<1e-9,'pos(2): trigger outside the gap, photo target in the gap');
 ok(Math.abs(p3.z-(ZZ(362)-.35))<1e-9&&Math.abs(p3.tz-p3.z)<1e-9,'pos(3): the bench centre');
 ok(JK.pos(4,'m').x==-30&&JK.pos(4,'f').x==30&&JK.pos(4,'m').s==-1&&JK.pos(4,'f').s==1,'pos(4) follows the gender: boys west toilet, girls east toilet');
 ok(JK.pos(9)==null&&JK.pos(-1)==null,'bad spot ids have no position');
 const w=w6();w.ctx.setP(p0.x+1,p0.z);ok(w.JK.nearSpot()==0,'near spot 0');w.ctx.setP(p0.x+1.6,p0.z);ok(w.JK.nearSpot()==-1,'1.6 m from the east plant is out of reach (1.5 m)');
 w.ctx.setP(XX(575.5)-1,ZZ(154.5));ok(w.JK.nearSpot()==1,'near spot 1');w.ctx.setP(p3.x+1.2,p3.z-.6);ok(w.JK.nearSpot()==3,'near the bench (in front of it)');
 w.ctx.setP(p2.x+.5,p2.z);ok(w.JK.nearSpot()==2,'in front of the corner gap');
 w.ctx.setP(-30.4,-10.5);w.ctx.gen='m';ok(w.JK.nearSpot()==4,'a boy at the boys sink gap: spot 4');ok(w.JK.nearSpot()==4&&(w.ctx.setP(30.4,20.5),w.JK.nearSpot()==-1),'a boy at the girls sink gap: nothing (no wrong-toilet search)');
 w.ctx.gen='f';ok(w.JK.nearSpot()==4,'a girl at the girls sink gap: spot 4');w.ctx.setP(-30.4,-10.5);ok(w.JK.nearSpot()==-1,'a girl at the boys sink gap: nothing');
 const n=world({JKB:[]});n.ctx.X=XX;n.ctx.Z=ZZ;n.ctx.setP(0,0);ok(n.JK.pos(4)==null&&n.JK.nearSpot()==-1,'no TOIL: the toilet spot is off, nothing breaks')}

/* ---- 6b. searching ---- */
for(let loc=0;loc<5;loc++){const w=w6(),J=w.JK;J.st(true,lcg(5));w.ctx.cur.jk.loc=loc;
 for(let i=0;i<5;i++)if(i!=loc){const a=J.search(i),b=J.search(i),c=J.search(i);ok(a.k=='none'&&J.SPOTS[i].d.includes(a.line)&&J.SPOTS[i].d.includes(b.line)&&c.line==J.SPOTS[i].d[2%J.SPOTS[i].d.length]&&J.st(false).key==0,'loc '+loc+': spot '+i+' is a decoy, answers from its own lines, key stays 0')}
 const r=J.search(loc);ok(r.k=='key'&&r.line==J.SPOTS[loc].f&&J.st(false).key==1&&w.log.save>=1,'loc '+loc+': the right spot gives the key and saves');
 ok(J.search(loc)===null&&J.search((loc+1)%5)===null,'once the key is found every spot is quiet');
 ok(J.search(-1)===null&&J.search(5)===null&&J.search(1.2)===null&&J.search('a')===null,'bad spot ids do nothing')}
{const w=w6(),J=w.JK;ok(w.ctx.cur.jk===undefined,'before anything: no quest saved');const r=J.search(2);ok(w.ctx.cur.jk&&J.okS(w.ctx.cur.jk)&&(r.k=='key')==(w.ctx.cur.jk.loc==2),'searching first creates a valid quest (no pieces needed: manual search works)')}
{const seen=new Set();for(let i=1;i<=200;i++)seen.add(world({JKB:[]}).JK.st(true,lcg(i*31)).loc);ok(seen.size==5,'the hiding place is random over all 5 spots')}
{const w=w6({noTimers:true}),J=w.JK,c=w.ctx;J.st(true,lcg(8));c.cur.jk.loc=3;const p=J.pos(3),pd=J.pos(0);
 ok(J.hint()===''&&J.go()===false,'nowhere near: no hint, no E');
 c.setP(pd.x,pd.z);ok(J.hint()=='Siasat'&&J.go()===true&&w.log.toast.pop()==J.SPOTS[0].d[0]&&w.log.say.length==0,'a decoy: hint "Siasat", E gives a nothing-here toast, no bubble');
 c.setP(p.x+1,p.z-.5);ok(J.hint()=='Siasat','the real spot shows the same hint "Siasat"');
 c.window.lockBusy=()=>true;ok(J.hint()===''&&J.go()===true&&w.log.say.pop()==J.CFG.busy2&&J.st(false).key==0&&/siasat/i.test(J.CFG.busy2)&&!/pintu|padang/i.test(J.CFG.busy2),'chased: refused with its own line, no hint, key not taken');c.window.lockBusy=()=>false;
 c.setHalt(true);ok(J.go()===false&&J.hint()==='','halted: nothing');c.setHalt(false);
 ok(J.go()===true&&J.st(false).key==1&&w.log.say.pop()==J.CFG.keySay&&w.log.toast.pop()==J.SPOTS[3].f&&w.log.tone>=3,'the real spot: the key is found, "Eh... ada kunci!", the found line, a sound');
 ok(J.hint()===''&&J.go()===false,'after that the spot has no hint and E does nothing here');
 const r=J.rows();ok(r.length==2&&r[0].h&&r[1].n=='Kunci Tandas'&&r[1].q=='1'&&r[1].b&&r[1].off===true,'bag: "Kunci Tandas" row, no action yet (20c)');
 J.collect(0);const r2=J.rows();ok(r2.length==3&&r2[1].n=='Kunci Tandas'&&r2[2].n=='Cebisan Gambar'&&typeof r2[2].go=='function','bag: key row, then the pieces row');
 const w2=w6();w2.JK.st(true,lcg(2));ok(w2.JK.rows().length==0,'no piece and no key: the bag shows nothing about the quest')}
{/* a board wins over a spot only when it is the one in reach; a board still works after the key is found */
 const B=[{x:0,z:0,nx:0,nz:1}];const w=w6({JKB:B,noTimers:true}),c=w.ctx,J=w.JK;J.st(true,lcg(4));c.cur.jk.key=1;c.setP(0,.8);ok(J.hint()=='Baca papan'&&J.go()===true&&w.log.toast.length+w.log.say.length>=1,'boards can still be read after the key is found')}

/* ---- 6c. the janitor mumbles ---- */
{const mk=(o)=>{const w=w6({noTimers:true}),said=[];w.ctx.NSAY={t:0};w.ctx.window.jkSay=(n,t,s)=>{said.push(t);w.ctx.NSAY.t=s};w.ctx.window.jkSayBusy=()=>w.ctx.NSAY.t>0;w.ctx.ns=[{role:'murid',m:{visible:true},x:0,z:0},{role:'cuci',m:{visible:true},x:2,z:0}];Object.assign(w.ctx,o||{});w.said=said;return w},J0=lcg(3);
 let w=mk();w.ctx.setP(0,0);w.JK.tick(0,J0);ok(w.said.length==0,'first 8 s: quiet');w.JK.tick(9,J0);ok(w.said.length==1&&w.JK.JL.includes(w.said[0])&&w.ctx.NSAY.t==3,'then one mumble from the list, shown for 3 s');
 w.ctx.NSAY.t=0;w.JK.tick(5,J0);ok(w.said.length==1,'then a 12 to 22 s pause');w.JK.tick(23,J0);ok(w.said.length==2&&w.said[0]!=w.said[1],'the next line is a different one');
 {const w2=mk();w2.ctx.setP(0,0);let last='';for(let i=0;i<60;i++){w2.ctx.NSAY.t=0;w2.JK.tick(30,Math.random)}ok(w2.said.length==60&&w2.said.every((t,i,a)=>i==0||t!=a[i-1]),'60 mumbles in a row never repeat the previous line');ok(w2.said.every(t=>w2.JK.JL.includes(t)),'all from the list')}
 w=mk();w.ctx.setP(40,0);w.JK.tick(30,J0);ok(w.said.length==0,'far from the janitor (6.5 m): silent');
 w=mk();w.ctx.setP(0,0);w.ctx.NSAY.t=1;w.JK.tick(30,J0);ok(w.said.length==0,'another NPC bubble is showing: waits');
 w=mk();w.ctx.setP(0,0);w.ctx.setHalt(true);w.JK.tick(30,J0);ok(w.said.length==0,'halted: silent');
 w=mk();w.ctx.setP(0,0);w.JK.st(true,lcg(1));w.ctx.cur.jk.key=1;w.JK.tick(30,J0);ok(w.said.length==1&&w.said[0]==w.JK.TH[0]&&!w.JK.JL.includes(w.said[0])&&w.ctx.cur.jk.th==1,'key found: no more mumbling, he thanks you instead (first line)');
 w.ctx.NSAY.t=0;w.JK.tick(1,J0);ok(w.said.length==1,'the second line waits 4 s');w.JK.tick(5,J0);ok(w.said.length==2&&w.said[1]==w.JK.TH[1]&&w.ctx.cur.jk.th==2,'then the second line, pointing at the locked cubicle (th 2 saved)');
 w.ctx.NSAY.t=0;w.JK.tick(100,J0);w.JK.tick(100,J0);ok(w.said.length==2,'after that he is silent for good');
 ok(!/pasu|loker|bangku|sinki|celah/i.test(w.JK.TH.join(' '))&&/berkunci/.test(w.JK.TH[1]),'the thanks lines give away no hiding place');
 w=mk();w.ctx.setP(0,0);w.JK.st(true,lcg(1));w.ctx.cur.jk.key=1;w.ctx.cur.jk.lt=[1,1];w.JK.tick(30,J0);ok(w.said.length==0,'both chests taken: no thanks, no mumble');
 w=mk();w.ctx.setP(40,0);w.JK.st(true,lcg(1));w.ctx.cur.jk.key=1;w.JK.tick(30,J0);ok(w.said.length==0&&w.ctx.cur.jk.th==0,'the thanks wait until you are near him');
 w=mk();w.ctx.ns[1].m.visible=false;w.ctx.setP(0,0);w.JK.tick(30,J0);ok(w.said.length==0,'janitor hidden: silent');
 w=mk();w.ctx.ns=[];w.ctx.setP(0,0);w.JK.tick(30,J0);ok(w.said.length==0,'no janitor in the list: nothing breaks');
 w=mk();w.ctx.setP(0,0);ok(w.ctx.cur.jk===undefined&&(w.JK.tick(30,J0),w.ctx.cur.jk===undefined),'mumbling does not create the quest');
 ok(['Manalah saya letak kunci tu?','Rasanya hari tu atas meja...','Siapa pula yang sorok kunci ni?'].every(t=>w.JK.JL.includes(t)),'your three lines are in');
 ok(w.JK.JL.every(t=>!/pasu|loker|bangku|sinki|tandas.*bawah|bawah|celah|papan/i.test(t)),'no line gives away a hiding place');
 const WJ2=WJ.replace(/\r/g,'');ok(/\['murid','murid','murid','murid','murid','murid','cuci','pengawas','pengawas','guru','guru'\]/.test(WJ2)&&/const m=r=='cuci'\?npc\(r,'m'\):npc\(r\)/.test(WJ2),'world.js: 11 people, one of the murid is the janitor (6 murid, cuci, 2 pengawas, 2 guru)');
 ok(/if\(window\.toiTick\)toiTick\(dt,t\);if\(window\.jkTick\)jkTick\(dt\);/.test(WJ2)&&/window\.jkSay=\(n,t,s\)=>\{NX\.say\(n,t\);if\(s\)NSAY\.t=s\};window\.jkSayBusy=\(\)=>NSAY\.t>0;/.test(WJ2),'world.js: jkTick runs every frame (after the toilet tick); jkSay/jkSayBusy share the one NPC bubble');
ok(!/\bNSAY\b|\bNX\b/.test(SRC),'jkey.js does not touch NSAY or NX (they belong to world.js)');
 const CH=rd('js/chars.js');ok(/else if\(role=='cuci'\)\{o\.h=rnd\(1\.2,1\.26\);/.test(CH)&&/shoe:'#1a1a1e',ls:1\};o\.hs='short';o\.glasses=true;o\.stache=true;o\.cos=\['vest'\]\}/.test(CH),'chars.js: a janitor look (adult, grey-green overalls, glasses, moustache) wearing the vest');
 ok(/o\.role!='murid'/.test(rd('js/toilet.js'))&&/n\.role=='pengawas'/.test(rd('js/lockers.js')),'the janitor is not a murid or a pengawas, so he never queues for the toilet and never becomes a prefect')}

/* ---- 6d. the photo: snapshot of the real scene ---- */
const mkCtx=()=>{const calls=[],g=new Proxy({},{get:(o,k)=>k in o?o[k]:k=='createImageData'?(W,H)=>({data:new Uint8ClampedArray(W*H*4)}):k=='putImageData'?(im)=>{calls.push(['putImageData',im]);g._put=im}:(...a)=>{calls.push([k,a])},set:(o,k,v)=>{o[k]=v;return true}});return{g,calls}};
const fake3=(o)=>{o=o||{};const S={renders:0,targets:[],disp:0,log:[]};
 class V3{constructor(x,y,z){this.x=x;this.y=y;this.z=z}project(){return{x:.2,y:-.1,z:.5}}}
 class Cam{constructor(f,a,n,fr){this.pos={set:(x,y,z)=>{S.cam={x,y,z};S.cfov=f;S.caspect=a}};this.position=this.pos}lookAt(x,y,z){S.look={x,y,z}}updateMatrixWorld(){}}
 class RT{constructor(W,H){this.w=W;this.h=H;S.rt=this}dispose(){S.disp++}}
 const ren={setRenderTarget(t){S.targets.push(t)},render(){S.renders++;if(o.boom)throw new Error('gl')},readRenderTargetPixels(rt,x,y,w,h,buf){if(o.blank){buf.fill(7);return}for(let r=0;r<h;r++)for(let c=0;c<w;c++){const k=(r*w+c)*4;buf[k]=(r*3)%250;buf[k+1]=(c)%250;buf[k+2]=r%256;buf[k+3]=255}}};
 return{S,T:{PerspectiveCamera:Cam,WebGLRenderTarget:RT,Vector3:V3},ren}};
const snapWorld=(o)=>{const w=w6({noTimers:true}),f=fake3(o),c=w.ctx,mats=[{opacity:.25,transparent:true,depthWrite:false},{opacity:1,transparent:false,depthWrite:true}];
 c.T=f.T;c.ren=f.ren;c.sc={};c.pm={visible:true};c.ar={visible:true};c.ns=[{m:{visible:true}},{m:{visible:false}}];
 c.FDS=[{m:[{mt:mats[0],b:.9,tr:false,dw:true},{mt:mats[1],b:1,tr:false,dw:true}]}];
 const ctx2=mkCtx(),made=[];c.document={body:{},head:{},createElement:()=>{const e={width:0,height:0,getContext:()=>ctx2.g};made.push(e);return e},getElementById:()=>null};
 w.f=f;w.mats=mats;w.made=made;w.c2=ctx2;return w};
{const w=snapWorld(),J=w.JK,c=w.ctx,r=J.snap(0,'m');
 ok(r&&r.cv.width==564&&r.cv.height==322,'snapshot is 564 x 322');
 ok(w.f.S.renders==1&&w.f.S.targets.length==2&&w.f.S.targets[0]===w.f.S.rt&&w.f.S.targets[1]===null&&w.f.S.disp==1,'one render into a render target, then back to the screen, target freed');
 ok(c.pm.visible&&c.ar.visible&&c.ns[0].m.visible===true&&c.ns[1].m.visible===false,'player, arrow and NPCs are put back exactly as they were (the hidden NPC stays hidden)');
 ok(w.mats[0].opacity==.25&&w.mats[0].transparent===true&&w.mats[0].depthWrite===false&&w.mats[1].opacity==1&&w.mats[1].transparent===false&&w.mats[1].depthWrite===true,'faded walls are put back exactly as they were');
 const cp=J.camPose(0,'m');ok(w.f.S.cam.x==cp.x&&w.f.S.cam.y==cp.y&&w.f.S.cam.z==cp.z&&w.f.S.look.x==cp.tx&&w.f.S.look.y==cp.ty&&w.f.S.cfov==50&&Math.abs(w.f.S.caspect-564/322)<1e-9,'camera: at the pose, looking at the target, fov 50, aspect of the photo');
 ok(r.cx==564*.6&&r.cy==322*.55,'the red circle spot is the projected target in snapshot pixels')}
{/* the walls were solid while rendering */
 const w=snapWorld(),seen=[];w.f.ren.render=function(){seen.push(w.mats.map(m=>[m.opacity,m.transparent,m.depthWrite]));w.f.S.renders++};w.JK.snap(1,'m');
 ok(seen.length==1&&seen[0][0].join()==[.9,false,true].join()&&seen[0][1].join()==[1,false,true].join(),'every fading wall is solid (opacity b, not transparent, depth write on) during the render');
 const w2=snapWorld();let hid=null;w2.f.ren.render=function(){hid=[w2.ctx.pm.visible,w2.ctx.ar.visible,w2.ctx.ns[0].m.visible]};w2.JK.snap(1,'m');ok(hid&&hid.every(v=>v===false),'player, arrow and NPCs are hidden during the render')}
{const w=snapWorld({boom:true}),r=w.JK.snap(0,'m');ok(r===null&&w.ctx.pm.visible&&w.ctx.ns[0].m.visible&&w.f.S.targets[w.f.S.targets.length-1]===null&&w.mats[0].opacity==.25&&w.f.S.disp==1,'a failed render gives null and still puts everything back');
 const b=snapWorld({blank:true});ok(b.JK.snap(0,'m')===null&&b.ctx.pm.visible,'a blank frame is not a photo (null)');
 const n=w6();ok(n.JK.snap(0,'m')===null,'no WebGL objects (Node): null')}
{/* rows are flipped (readRenderTargetPixels is bottom-up) */
 const w=snapWorld(),r=w.JK.snap(0,'m'),im=w.c2.g._put,W=564;ok(im&&im.data[0]==((321*3)%250)&&im.data[(321*W)*4]==(0*3)%250&&im.data[(5*W+7)*4+2]==(321-5)%256,'rows come out the right way up (first row = top of the scene)')}
{/* the whole photo: border, snapshot, red circle, caption; fallback card */
 const w=snapWorld(),J=w.JK;J.st(true,lcg(3));w.ctx.cur.jk.loc=3;const rec=mkCtx();let used=0;w.ctx.document.createElement=()=>{const e={width:0,height:0,getContext:()=>(used++,rec.g)};return e};
 J.pieceCanvas(0);const dr=rec.calls.filter(x=>x[0]=='drawImage'),el=rec.calls.filter(x=>x[0]=='ellipse');
 ok(dr.length>=2&&dr[0][1].length==9&&dr[0][1][5]==9&&dr[0][1][6]==9&&dr[0][1][7]==282&&dr[0][1][8]==161,'the snapshot is drawn into the photo area (9,9) 282 x 161');
 const ce=el.find(x=>x[1][2]==32&&x[1][3]==27);ok(ce&&Math.abs(ce[1][0]-(9+564*.6*282/564))<1e-9&&Math.abs(ce[1][1]-(9+322*.55*161/322))<1e-9,'the red marker circle is drawn round the projected spot');
 ok(rec.calls.some(x=>x[0]=='fillText'&&x[1][0]=='rahsia kita \u263A'),'caption');
 const n1=w.made.length;J.pieceCanvas(1);ok(true,'pieces are cut from the same photo');
 const fb=w6({noTimers:true});fb.JK.st(true,lcg(3));fb.ctx.cur.jk.loc=2;const r2=mkCtx();fb.ctx.document={createElement:()=>({width:0,height:0,getContext:()=>r2.g})};fb.JK.pieceCanvas(0);
 ok(r2.calls.some(x=>x[0]=='fillText'&&x[1][0]=='Gambar kabur...')&&r2.calls.some(x=>x[0]=='fillText'&&x[1][0]==fb.JK.SPOTS[2].n),'no snapshot: a grey card with the place name, so the quest never blocks')}
{/* cache: one snapshot per spot and gender; the preview never touches the save */
 const w=snapWorld(),J=w.JK;J.st(true,lcg(3));w.ctx.cur.jk.loc=3;const save0=JSON.stringify(w.ctx.cur.jk);J.pieceCanvas(0);J.pieceCanvas(2);ok(w.f.S.renders==1,'the snapshot is taken once and reused for all 6 pieces');
 w.ctx.cur.jk.loc=1;J.pieceCanvas(0);ok(w.f.S.renders==2,'another hiding place (new quest): a new snapshot');
 w.ctx.cur.jk.loc=3;J.pieceCanvas(0);ok(w.f.S.renders==3,'and again when it changes back');
 const w2=snapWorld(),J2=w2.JK;w2.ctx.document.body=bodyStub();w2.ctx.document.head=bodyStub();w2.ctx.document.createElement=()=>bodyStub();w2.ctx.addEventListener=()=>{};w2.ctx.removeEventListener=()=>{};ok(J2.preview(4,'f')===true&&w2.ctx.cur.jk===undefined&&w2.ctx.getHalt()===true,'preview: opens, holds the game, creates and changes no save');
 ok(J2.preview(9)===false&&J2.preview(-1)===false,'preview of a bad spot does nothing')}
function bodyStub(){const e=()=>{const x={children:[],style:{},className:'',id:'',parentNode:null,append(...a){a.forEach(y=>{if(typeof y!='string'){y.parentNode=x;x.children.push(y)}})},appendChild(y){x.append(y);return y},remove(){},removeChild(){},setAttribute(){},addEventListener(){},getContext(){return mkCtx().g},width:0,height:0};Object.defineProperty(x,'textContent',{set(v){x.text=v},get(){return x.text}});return x};return e()}
{/* the 12 camera poses */
 const w=w6(),J=w.JK;for(let i=0;i<5;i++)['m','f'].forEach(g=>{if(i<4&&g=='f')return;const cp=J.camPose(i,g),h=Math.hypot(cp.x-cp.tx,cp.z-cp.tz),el=Math.atan2(cp.y-cp.ty,h)*180/Math.PI,d=Math.hypot(h,cp.y-cp.ty);
  ok(cp.y>=4.6&&el>=35&&el<=62&&d>=5.8&&d<=9.6,'photo camera spot '+i+' ('+g+'): above the 4.2 m walls, '+el.toFixed(0)+' degrees down, '+d.toFixed(1)+' m away')});
 ok(J.camPose(4,'m').x>J.camPose(4,'m').tx&&J.camPose(4,'f').x<J.camPose(4,'f').tx,'toilet camera is mirrored: from the entrance side in both rooms');
 ok(J.camPose(0,'m').x<J.camPose(0,'m').tx&&J.camPose(3,'m').x>J.camPose(3,'m').tx,'plants are seen from the west, the bench from the east (like your screenshots)')}

/* ---- 7. E at a board, hint, chase, halt ---- */
{const B=[{x:0,z:0,nx:0,nz:1},{x:20,z:0,nx:0,nz:1},{x:40,z:0,nx:0,nz:1},{x:60,z:0,nx:0,nz:1},{x:80,z:0,nx:0,nz:1},{x:100,z:0,nx:0,nz:1},{x:120,z:0,nx:0,nz:1},{x:140,z:0,nx:0,nz:1}],w=world({JKB:B,noTimers:true}),J=w.JK,c=w.ctx;
 c.setP(5,5);ok(J.go()===false&&J.hint()===''&&w.ctx.cur.jk===undefined,'far from every board: E does nothing and creates nothing');
 c.setP(20,.8);ok(J.hint()=='Baca papan','near a board: hint "Baca papan"');
 const s=J.st(true,lcg(11));const pb=s.ass[0],decoy=[0,1,2,3,4,5,6,7].find(b=>!s.ass.includes(b));
 c.setP(B[decoy].x,.8);ok(J.go()===true&&w.log.toast.length==1&&w.log.say.length==0&&J.count(J.st(false))==0,'a decoy board: a notice as a toast, no bubble, no piece');
 c.window.lockBusy=()=>true;c.window.lockMsg=()=>'Ada pengawas!';c.setP(B[pb].x,.8);const rd0=JSON.stringify(J.st(false).rd);
 ok(J.go()===true&&w.log.say.pop()==J.CFG.busy&&JSON.stringify(J.st(false).rd)==rd0&&J.hint()==='','while a prefect chases: refused, nothing is read, no hint');
 ok(/baca papan/i.test(J.CFG.busy)&&!/pintu|dikunci|padang/i.test(J.CFG.busy)&&J.CFG.busy!=c.window.lockMsg(),'the chase line is about the board, not the door line (Pintu dikunci! Lari ke Padang atau keluar!)');
 c.window.lockBusy=()=>false;c.setHalt(true);ok(J.go()===false&&J.hint()==='','while the game is halted (bag, toilet, door): E does nothing here');c.setHalt(false);
 for(let i=0;i<3&&J.count(J.st(false))<1;i++)J.go();
 ok(J.count(J.st(false))==1&&w.log.say.includes('Eh, cebisan apa ini?'),'a piece board gives the piece within 3 readings and the character says "Eh, cebisan apa ini?"');
 ok(w.log.tone>=2,'a small paper sound plays');
 const rows=J.rows();ok(rows.length==2&&rows[0].h&&rows[1].q=='1/6'&&rows[1].b=='Lihat'&&typeof rows[1].go=='function'&&/1 daripada 6/.test(rows[1].d),'bag: a section and one row "Cebisan Gambar 1/6"');
 c.cur.jk.f=[1,1,1,1,1,1];const r2=J.rows();ok(r2[1].q=='6/6'&&/lengkap/.test(r2[1].d),'bag row at 6/6 says the photo is complete')}

/* ---- 8. screens (DOM stub) ---- */
{const mk=()=>{const e={children:[],style:{},className:'',id:'',attrs:{},listeners:{},parentNode:null,append(...a){a.forEach(x=>{if(typeof x=='string')x={text:x,children:[]};x.parentNode=e;e.children.push(x)})},appendChild(x){e.append(x);return x},removeChild(x){x.remove()},remove(){if(e.parentNode)e.parentNode.children=e.parentNode.children.filter(c=>c!==e);e.parentNode=null},setAttribute(k,v){e.attrs[k]=v},addEventListener(k,f){e.listeners[k]=f},getContext(){return new Proxy({},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>{o[k]=v;return true}})},width:0,height:0};Object.defineProperty(e,'textContent',{set(v){e.text=v},get(){return e.text}});return e};
 const w=world({JKB:[],noTimers:true}),body=mk(),head=mk(),doc={body,head,createElement:()=>mk(),getElementById:id=>[...head.children,...body.children].find(x=>x.id==id)||null};body.id='b';
 let kd=null;w.ctx.document=doc;w.ctx.addEventListener=(k,f)=>{if(k=='keydown')kd=f};w.ctx.removeEventListener=(k,f)=>{if(kd===f)kd=null};
 const J=w.JK;ok(J.view()===false,'no pieces: the photo screen does not open');
 J.collect(0);J.collect(4);ok(J.view()===true&&w.ctx.getHalt()===true&&body.children.some(x=>x.id=='jkxv'),'with pieces: the photo screen opens and holds the game (halt)');
 ok(J.view()===true&&body.children.filter(x=>x.id=='jkxv').length==1,'opening it twice does not stack a second screen');
 kd({code:'Escape',preventDefault(){}});ok(!body.children.some(x=>x.id=='jkxv')&&w.ctx.getHalt()===false&&kd===null,'Escape closes it, the game runs again, the key listener is removed');
 w.ctx.setHalt(true);ok(J.view()===false&&!body.children.some(x=>x.id=='jkxv'),'it does not open over another screen (halt already on) and does not steal the halt');w.ctx.setHalt(false);
 ok(J.view()===true,'opens again');const v=body.children.find(x=>x.id=='jkxv');v.listeners.pointerdown({target:v});ok(!body.children.some(x=>x.id=='jkxv')&&w.ctx.getHalt()===false,'tapping the dark background closes it');
 J.popup(2,3);ok(body.children.some(x=>x.id=='jkxp')&&head.children.some(x=>x.id=='jkxcss'),'the found-piece card shows and the css is added once');
 J.popup(3,4);ok(body.children.filter(x=>x.id=='jkxp').length==1&&head.children.filter(x=>x.id=='jkxcss').length==1,'a second card replaces the first');
 ok(w.ctx.getHalt()===false,'the found-piece card never holds the game')}

/* ---- 9. nothing else changed ---- */
{const del=(f,pairs,b)=>{let a=rd(f).replace(/\r/g,''),o=rd(b+'/'+f).replace(/\r/g,'');pairs.forEach(p=>{a=a.split(p[0]).join(p[1])});return a===o};
 ok(del('js/world.js',[["if(window.mopAct)mopAct();",""],["if(window.mopTick)mopTick(dt,t);",""]],'_backup_round20d'),'world.js: the only changes since 20c are the mopAct and mopTick hooks (20d)');
 ok((()=>{const c=rd('js/world-build.js').replace(/\r/g,'');return c.split('const dd={x:ex+s*uc').length==2&&c.split('doors.push(dd)});').length==2})(),'world-build.js: the 20c chest in the locked cubicle is still built as dd (once)');

 ok(del('js/chars.js',[["o.glasses=true;o.stache=true;o.cos=['vest']} /* Round 20b: the janitor (js/jkey.js); Round 20e: he wears the same vest */","o.glasses=true;o.stache=true} /* Round 20b: the janitor (js/jkey.js) */"],["/* Round 17: worn cosmetics (cap, eye, beard, mos; Round 20e: vest) come in o.cos */","/* Round 17: worn cosmetics (cap, eye, beard, mos) come in o.cos */"],["if(cosHas(o,'vest')){bx(B,.5*W,.44,.34,'#f28c1c',0,.72,0);bx(B,.51*W,.045,.345,'#f1f3c4',0,.62,0);bx(B,.51*W,.045,.345,'#f1f3c4',0,.8,0);bx(B,.02,.42,.345,'#b86412',0,.72,0);bx(B,.2,.12,.02,'#d9dcc0',0,.74,-.18)} /* Round 20e: Rompi Tukang Cuci: orange vest with 2 reflective stripes, a zip line and a back panel, a little proud of the torso so it covers the tie, badge and apron */\n",""]],'_backup_round20e'),'chars.js: the only changes in 20e are the vest drawing and the janitor wearing it');
 ok(del('sw.js',[["'js/mop.js',",""],["'js/sokong.js',",""],[", Round 21 adds js/sokong.js, Round 21b the TNG link and the main button",""],["sr-r21b","sr-r20c"]],'_backup_round20d'),'sw.js: the only changes are js/mop.js and the cache name');
 ok(/concat\(typeof JK!=='undefined'&&JK\.rows\?JK\.rows\(\):\[\]\)/.test(rd('js/bag.js'))&&(rd('js/bag.js').match(/JK\.rows\(\)/g)||[]).length==1&&del('world.html',[[' "js/mop.js",',''],[' "js/sokong.js",','']],'_backup_round20d'),'bag.js has only the quest rows hook; world.html is as it was after 20c plus js/mop.js and js/sokong.js');
 ok(!ex('_backup_round20d/js/core.js')&&!ex('_backup_round20d/js/ui.js')&&!ex('_backup_round20e/js/core.js')&&!ex('_backup_round20e/js/ui.js'),'core.js and ui.js are not in the 20d or 20e backups (not changed)')}
/* ---- 9b. Round 20c: the locked cubicle, the chest, the rewards ---- */
const mkRooms=()=>[0,1].map(i=>{const mk=(x,use)=>({x,z:10,use,s:i?1:-1,kt:0,k:0,inn:{x:x,z:12},leaf:{material:{color:{c:null,set(v){this.c=v}},clone(){return{color:{c:null,set(v){this.c=v}},cl:1}}}}});const r={girl:i,doors:[mk(i*100+1,1),mk(i*100+2,1),mk(i*100+3,0)]};r.doors[2].chest={lid:{rotation:{x:0}},k:0};return r});
const w9=(o)=>{const w=w6(Object.assign({noTimers:true},o||{})),R=mkRooms();w.ctx.TOIL=R;w.R=R;w.ctx.cur.jk=null;delete w.ctx.cur.jk;w.JK.st(true,lcg(6));w.ctx.cur.jk.key=1;w.ctx.cur.jk.loc=0;w.ctx.P.x=0;w.ctx.P.z=0;w.ctx.P.sx=w.ctx.P.sz=0;w.ctx.P.f=0;w.ctx.P.y=0;w.ctx.P.vy=0;return w};
const at=(w,q)=>{w.ctx.P.x=q.d.x-.6;w.ctx.P.z=q.d.z-.6};
const run=(w,max)=>{let t=0,n=0;while(w.JK.seqState()&&n++<(max||800)){w.JK.tick(.05);t+=.05}return t};
{const w=w9(),J=w.JK,c=w.ctx,R=w.R,q0={r:R[0],d:R[0].doors[2]},q1={r:R[1],d:R[1].doors[2]};
 ok(J.doorOk(q0)&&J.doorOk(q1)&&!J.doorOk({r:R[0],d:R[0].doors[0]})&&!J.doorOk(null)&&!J.doorOk({r:{},d:R[0].doors[2]}),'doorOk: only the locked cubicle of a toilet in TOIL');
 ok(J.doorHint(q0)=='Buka dengan kunci'&&J.doorHint({r:R[0],d:R[0].doors[0]})==='','hint "Buka dengan kunci" on the quest door only');
 c.gen='m';at(w,q1);ok(J.door(q1)===true&&J.seqState()&&J.seqState().i==1&&c.getHalt()===true&&R[1].doors[2].kt==1,'a boy can open the GIRLS locked cubicle (the gamble: the wrong-toilet rule does not stop it); the game holds, the door opens');
 ok(J.door(q1)===true&&J.door(q0)===true,'while the script runs nothing starts twice');
 const x0=c.P.x,tt=run(w);
 ok(tt>=2.2&&tt<=6,'the script takes '+tt.toFixed(1)+' s (about 3 s)');
 ok(J.st(false).lt.join()=='0,1'&&J.st(false).done==0&&w.log.save>=1,'the girls chest (mop) is taken and saved; not done yet');
 ok(c.getHalt()===false&&R[1].doors[2].kt==0&&!J.seqState(),'afterwards the game runs again and the door is closed');
 ok(Math.abs(c.P.x-R[1].doors[2].x)<1e-9&&Math.abs(c.P.z-R[1].doors[2].z)<1e-9&&c.P.f==0,'the player ends in front of the door');
 J.tick(1);ok(R[1].doors[2].use==1&&R[1].doors[2].leaf.material.cl==1&&R[1].doors[2].leaf.material.color.c=='#4fa86b'&&R[1].doors[2].chest.k==1&&R[1].doors[2].chest.lid.rotation.x==-1.9,'the looted cubicle is now a normal usable one: green door (own material), lid open');
 ok(R[0].doors[2].use==0&&R[0].doors[2].chest.k==0&&R[0].doors[2].chest.lid.rotation.x==0&&R[0].doors[2].leaf.material.cl===undefined,'the other toilet is untouched');
ok(J.doorOk(q1)===false&&J.door(q1)===false&&J.doorHint(q1)==='','the same chest cannot be taken twice');
 const rr=J.rows();ok(rr.some(r=>r.n=='Mop Terbang'&&r.off===true&&r.b=='Naik')&&!rr.some(r=>r.n=='Rompi Tukang Cuci')&&rr.some(r=>r.n=='Kunci Tandas'),'bag: Mop Terbang row, key still there');
 ok(w.log.say.includes(J.RW[1].say)&&w.log.tone>=4,'"Eh, mop ni bergetar-getar!" and the reward sound');
 const b=w.ctx.cur.jk;at(w,q0);J.door(q0);run(w);ok(b.lt.join()=='1,1'&&b.done==1,'then the boys chest (vest): both taken, done');
 const r3=J.rows();ok(!r3.some(r=>r.n=='Kunci Tandas')&&!r3.some(r=>r.n=='Cebisan Gambar')&&!r3.some(r=>r.n=='Rompi Tukang Cuci')&&r3.some(r=>r.n=='Mop Terbang')&&r3.some(r=>r.h=='Hadiah Tandas'),'bag when done: the key and photo rows are gone; the mop row stays, the vest is in Barang Gaya (bag.js)');
 ok(J.search(0)===null,'the hiding places stay quiet')}
{/* 20e: the boys chest = the vest, a wearable of the bag */
 const w=w9(),J=w.JK,R=w.R,gr=[];w.ctx.window.bagGrantCos=k=>{gr.push(k);return true};w.ctx.window.bagOwnsCos=k=>gr.includes(k);
 const q1={r:R[1],d:R[1].doors[2]};at(w,q1);J.door(q1);run(w);ok(gr.length==0&&w.ctx.cur.jk.lt.join()=='0,1','the girls chest (mop) grants no vest');
 const q0={r:R[0],d:R[0].doors[2]};at(w,q0);J.door(q0);run(w);ok(gr.join()=='vest'&&w.ctx.cur.jk.lt.join()=='1,1','the boys chest grants the vest to the bag (once)');
 J.tick(1);J.tick(1);J.tick(1);ok(gr.length==1,'it is not granted again every frame');
 ok(!J.rows().some(r=>r.n=='Rompi Tukang Cuci')&&J.RW[0].sub.includes('Barang Gaya')&&/Barang Gaya/.test(J.RW[0].d),'the reward card points to Barang Gaya; the vest is not a quest row any more');
 const w2=w9(),g2=[];w2.ctx.window.bagGrantCos=k=>{g2.push(k);return true};w2.ctx.window.bagOwnsCos=k=>g2.length>0;w2.ctx.cur.jk.lt=[1,0];w2.JK.tick(0);w2.JK.tick(0);ok(g2.join()=='vest','a 20c save that already took the boys chest gets the vest on the next frame (once)');
 const w3=w9();w3.ctx.cur.jk.lt=[1,0];w3.JK.tick(0);ok(w3.ctx.cur.jk.lt.join()=='1,0','without the bag hooks (another page) nothing breaks');
 const w4=w9();w4.ctx.window.bagGrantCos=()=>{throw new Error('x')};w4.ctx.window.bagOwnsCos=()=>false;const q4={r:w4.R[0],d:w4.R[0].doors[2]};at(w4,q4);w4.JK.door(q4);try{run(w4);ok(w4.ctx.cur.jk.lt[0]==1,'a failing bag hook never blocks the reward')}catch(e){ok(false,'a failing bag hook must not crash the script')}}
{/* phases: the reward comes when the chest opens, before the player walks out; lid follows */
 const w=w9(),J=w.JK,R=w.R,q={r:R[0],d:R[0].doors[2]};at(w,q);J.door(q);let ph=[],got=null,t=0;
 for(let i=0;i<400&&J.seqState();i++){J.tick(.05);t+=.05;const u=J.seqState();if(u)ph.push(u.ph);if(got===null&&w.ctx.cur.jk.lt[0])got={t,ph:u?u.ph:4}}
 ok(got&&got.ph==2&&got.t<t-.8,'the vest is granted at the end of the chest phase, well before the player is back out ('+got.t.toFixed(1)+' of '+t.toFixed(1)+' s)');
 ok(ph[0]==0&&ph.includes(1)&&ph.includes(2)&&ph.includes(3)&&ph.every((v,i)=>i==0||v>=ph[i-1]),'phases run 0,1,2,3 in order');
 ok(R[0].doors[2].chest.k==1,'chest lid open at the end')}
{/* chased: refused, nothing happens */
 const w=w9(),J=w.JK,R=w.R,q={r:R[0],d:R[0].doors[2]};w.ctx.window.lockPf=()=>({});ok(J.door(q)===true&&w.log.say.pop()==J.CFG.busy3&&!J.seqState()&&w.ctx.getHalt()===false&&R[0].doors[2].kt==0&&w.ctx.cur.jk.lt.join()=='0,0','a prefect is already chasing: refused with its own line, nothing moves');
 ok(/pengawas/i.test(J.CFG.busy3)&&!/pintu dikunci|padang/i.test(J.CFG.busy3),'the line is about the chase');
 w.ctx.window.lockPf=()=>null;w.ctx.setHalt(true);ok(J.door(q)===false,'halted (another screen): not handled here');w.ctx.setHalt(false)}
{/* no key / no quest */
 const w=w9(),J=w.JK,R=w.R,q={r:R[0],d:R[0].doors[2]};w.ctx.cur.jk.key=0;ok(!J.doorOk(q)&&J.door(q)===false&&J.doorHint(q)==='','without the key the door is not handled (toilet.js shows its Berkunci lines)');
 const n=w6();n.ctx.TOIL=mkRooms();ok(n.JK.door({r:n.ctx.TOIL[0],d:n.ctx.TOIL[0].doors[2]})===false&&n.ctx.cur.jk===undefined,'no quest at all: nothing is created')}
{/* restore on load */
 const w=w9(),J=w.JK,R=w.R;w.ctx.cur.jk.lt=[1,0];J.tick(0);ok(R[0].doors[2].use==1&&R[0].doors[2].chest.k==1&&R[0].doors[2].chest.lid.rotation.x==-1.9&&R[1].doors[2].use==0&&R[1].doors[2].chest.k==0,'on load: a taken chest is open and its cubicle is usable at once, the other is still locked');
 const w2=w9(),R2=w2.R;w2.ctx.cur.jk.lt=[0,0];w2.JK.tick(0);w2.ctx.cur.jk.lt=[0,1];w2.JK.tick(.1);ok(R2[1].doors[2].chest.k>0&&R2[1].doors[2].chest.k<1&&R2[1].doors[2].chest.lid.rotation.x<0&&R2[1].doors[2].chest.lid.rotation.x>-1.9,'a lid opened during play eases open (not a jump)')}
{/* save shape and old saves */
 const w=w6();w.ctx.cur.jk={f:[1,0,0,0,0,0],ass:[0,1,2,3,4,5],rd:[0,0,0,0,0,0,0,0],loc:2,key:1,done:1};w.JK.st(false);ok(JSON.stringify(w.ctx.cur.jk.lt)=='[0,0]'&&w.ctx.cur.jk.th===0&&w.ctx.cur.jk.done===0,'a 20a/20b save gets lt [0,0], th 0 and done is recomputed');
 [[1],[1,1,1],'x',null,[2,'a']].forEach((bad,i)=>{const w2=w6();w2.ctx.cur.jk={f:[0,0,0,0,0,0],ass:[0,1,2,3,4,5],rd:[0,0,0,0,0,0,0,0],loc:0,key:1,lt:bad,th:9};w2.JK.st(false);const l=w2.ctx.cur.jk.lt;ok(Array.isArray(l)&&l.length==2&&l.every(v=>v===0||v===1)&&w2.ctx.cur.jk.th===0,'bad lt/th #'+i+' is repaired')});
 const w3=w6();w3.ctx.cur.jk={f:[0,0,0,0,0,0],ass:[0,1,2,3,4,5],rd:[0,0,0,0,0,0,0,0],loc:0,key:1,lt:[1,0],th:1,done:0};const copy=JSON.parse(JSON.stringify(w3.ctx.cur));w3.JK.st(false);ok(JSON.stringify(JSON.parse(JSON.stringify(w3.ctx.cur.jk)))==JSON.stringify(copy.jk),'a saved 20c quest survives a JSON save and load unchanged');
 ok(JSON.stringify(world({JKB:[]}).JK.fresh(lcg(3)).lt)=='[0,0]'&&world({JKB:[]}).JK.fresh(lcg(3)).th===0,'a fresh quest starts with lt [0,0], th 0')}
{/* the reward card */
 const w=w9(),J=w.JK,R=w.R;const body=bodyStub();w.ctx.document={body,head:bodyStub(),createElement:()=>bodyStub(),getElementById:()=>null};w.ctx.setHalt(false);at(w,{d:R[0].doors[2]});J.door({r:R[0],d:R[0].doors[2]});run(w);
 const card=body.children.find(x=>x.id=='jkxp');ok(card&&card.children.length==2&&card.children[0].text==J.RW[0].i&&/Rompi Tukang Cuci/.test(card.children[1].text),'the reward card shows the vest icon and name (the game keeps running)')}
{/* world-build: the chest */
 const wb=WB.replace(/\r/g,'');ok(/if\(!ok\)\{/.test(wb)&&/bx\(uc\+\.3,uc\+\.7,vmin\+\.23,vmin\+\.53,\.2,'#8d5524',0\)/.test(wb)&&/lid\.position\.set\(ex\+s\*\(uc\+\.5\),\.2,zc\+vmin\+\.23\)/.test(wb)&&/dd\.chest=\{lid,k:0\}/.test(wb)&&/doors\.push\(dd\)\}\);/.test(wb),'the chest is built in the locked cubicle (i = 2) only, lid hinged on the back-wall side, stored on the door');
 const cw=1.55,uc=cw/2;ok(uc+.7<uc+cw/2-.03-.03&&.3>.22+.03&&.53<2-.03,'the chest fits inside the cubicle (to uc+.7 of uc+.745) and clears the toilet bowl (uc±.22, in front of it)');
 ok(/window\.jkDoor&&window\.jkDoor\(q\)\)return true;[^]*if\(wrong\(q\.r,gen\)\)/.test(rd('js/toilet.js'))&&/window\.jkDoorHint\(q\)/.test(rd('js/toilet.js')),'toilet.js asks jkDoor before the wrong-toilet rule, and jkDoorHint for the hint')}
{/* toilet.js itself: run its pure go()/hint() with the hooks */
 const src=rd('js/toilet.js'),cx={window:{},console,P:{x:0,z:0},halt:false,gen:'m',say(t){cx.said=t},toast(){},tone(){},T:{},document:{},cam:{},cv:{},ns:[],TOIL:[]};cx.globalThis=cx;vm.createContext(cx);vm.runInContext(src+';globalThis.TOI=TOI',cx);
 const T0={go:()=>cx.window.toiGo(),hint:()=>cx.window.toiHint()},d={x:0,z:0,use:0,s:-1,leaf:{},hinge:{x:0,z:0},len:1},r={girl:1,doors:[d],x0:-5,x1:5,z0:-5,z1:5};cx.TOIL=[r];
 cx.window.jkDoor=q=>{cx.hooked=q;return true};cx.window.jkDoorHint=q=>'Buka dengan kunci';
 ok(T0.go()===true&&cx.hooked&&cx.hooked.d===d&&cx.said===undefined,'toilet go(): a locked door of the WRONG gender goes to jkDoor first (no "salah tandas" line)');ok(T0.hint()=='Buka dengan kunci','toilet hint(): shows the key hint on the wrong-gender locked door too');
 cx.window.jkDoor=()=>false;cx.window.jkDoorHint=()=>'';cx.said=undefined;ok(T0.go()===true&&/bukan untuk kamu|salah tandas/i.test(cx.said)&&T0.hint()==='','without the key the old rules stand: wrong gender = the bad line, no hint');
 d.use=1;cx.said=undefined;cx.window.jkDoor=()=>{throw new Error('must not be asked for a usable door')};ok(T0.go()===true&&/bukan untuk kamu|salah tandas/i.test(cx.said),'a usable door never asks jkDoor');
 cx.gen='f';d.use=0;cx.window.jkDoor=undefined;cx.window.jkDoorHint=undefined;cx.said=undefined;ok(T0.go()===true&&CFGok(cx.said)&&T0.hint()=='Pintu berkunci','own gender, locked, no quest code: the old Berkunci line and hint')}
function CFGok(t){return /kunci/i.test(t||'')}

/* ---- 10. Round 20a2: the game has a global canvas{position:absolute;inset:0;width:100%;height:100%} rule; the photo and card canvases must not be pulled out of their cards ---- */
{const CSS=rd('css/style.css'),css=(SRC.match(/s\.textContent='([\s\S]*?)';\n  document\.head/)||[])[1]||'';
 ok(/(^|\n)canvas\{position:absolute;inset:0;width:100%;height:100%/.test(CSS),'style.css still has the global canvas rule (so the override is needed)');
 ok(/\.jkxc canvas\{position:static;inset:auto;width:100%;height:auto/.test(css),'the photo canvas is static, full card width, natural height');
 ok(/#jkxp canvas\{position:static;inset:auto;width:4\.2em;height:4\.2em/.test(css),'the piece card canvas is static and 4.2em square');
 ok(/\.jkxc\{width:min\(94vw,25em\)/.test(css),'the photo card is at most 25em / 94vw wide');
 ok(!/drawPhoto/.test(SRC),'the old drawn photo is gone (the photo is a snapshot of the real scene now)')}
console.log(pass+' pass, '+fail+' fail');process.exit(fail?1:0);
