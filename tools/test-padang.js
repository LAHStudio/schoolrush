/* Round 15c: PJ arrows + Lari Berpagar driven by taps (Node only, deep stub of THREE/DOM, NOT a real browser). Run: node tools/test-padang.js */
const fs=require('fs'),vm=require('vm'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
function deep(){const st={};const f=function(){};const p=new Proxy(f,{get:(t,k)=>{if(k===Symbol.toPrimitive)return()=>0;if(k in st)return st[k];if(k==='length')return 0;if(typeof k==='symbol')return undefined;return st[k]=deep()},set:(t,k,v)=>{st[k]=v;return true},apply:()=>deep(),construct:()=>deep()});return p}
const els={};const E=id=>els[id]||(els[id]={id,firstChild:{textContent:''},hidden:true,textContent:'',style:{},classList:{_s:new Set(),toggle(c,f){f?this._s.add(c):this._s.delete(c)},add(c){this._s.add(c)},remove(c){this._s.delete(c)},contains(c){return this._s.has(c)}}});
const toasts=[],tones=[];let keyH=null;
const pmU={legs:[{rotation:{}},{rotation:{}}],arms:[{rotation:{}},{rotation:{}}],B:{rotation:{},position:{}}};
const ctx={npc:()=>({position:{set(){}},rotation:{},userData:pmU}),rnd:(a,b)=>a,mkTree:()=>deep(),$:E,T:deep(),sc:deep(),bx:()=>deep(),pm:{position:{set(){}},rotation:{},userData:pmU},tone:(...a)=>tones.push(a),toast:m=>toasts.push(m),
 starsOf:s=>s>=90?3:s>=70?2:1,stallScore:null,document:{body:E('body'),getElementById:E},addEventListener:(e,f)=>{if(e=='keydown')keyH=f},Math,JSON,Object,Array,String,Number,console};
ctx.window=ctx;ctx.stallScore=(wr,sec,lim)=>Math.max(15,Math.round(100-Math.min(60,wr*12)-(sec<=lim?0:Math.min(25,(sec-lim)/lim*40))));
vm.createContext(ctx);vm.runInContext(R('js/padang-data.js'),ctx);
const hurdleMk=()=>{const o=deep();return o};
vm.runInContext('var __T=T;'+R('js/padang-games.js'),ctx);
const PG=ctx.PG,PD=ctx.PD,g=PD.g[1];
const html=R('padang.html'),css=R('css/style.css'),data=R('js/padang-data.js'),gm=R('js/padang-games.js');
/* A. data + markup */
ok(g.len==60&&JSON.stringify(g.hd)=='[12,20,28,36,44,52]','Berpagar still 60 m, 6 fences');ok(g.tgt==14&&/14 saat/.test(g.kh),'target 14 s and hint text');
ok(['imp','drag','vmax','stun','jv','g','hh','slow'].every(k=>typeof g[k]=='number')&&g.spd===undefined&&g.slowT===undefined,'Berpagar has tap physics numbers, no auto speed');
ok(!/L dan R/.test(data+gm),'no "L dan R" left in text');ok(!/ketik/i.test(data),'no "ketik"');
ok(/id="sL"[^>]*aria-label="Kiri"[^>]*><svg/.test(html)&&/id="sR"[^>]*aria-label="Kanan"[^>]*><svg/.test(html)&&!/>L<\/button>|>R<\/button>/.test(html),'L/R replaced by arrow icons');
ok((html.match(/id="sHt"/g)||[]).length==1&&/#sHt\{/.test(css),'one hint element + css');
ok(/<div id="sh">.*<div id="sHt" hidden><span class="hp"><\/span><\/div><\/div>/.test(html),'hint is inside the top bar #sh, under the title');ok(!/#sHt\{position:absolute/.test(css)&&/#sh #sHt\{order:3\}/.test(css),'old floating hint gone; narrow screens put it right after title/Keluar');
ok(!/ndLevel|PD\.lv/.test(gm.slice(gm.indexOf('Lari Berpagar (15c)'),gm.indexOf('Lompat Jauh */'))),'no level scaling in Berpagar');
/* B. play */
const sL=E('sL'),sR=E('sR'),sJ=E('sJ'),sHt=E('sHt');['sn','stm2','sd','cd','sx'].forEach(E);
PG.show();let got=null;PG.begin(1,r=>got=r);let S=PG.st();
ok(S.ph=='count'&&!sL.hidden&&!sR.hidden&&!sJ.hidden&&!sHt.hidden,'arrows+Lompat+hint visible in Berpagar count');
ok(sJ.classList.contains('nr')&&/LOMPAT di pagar/.test(sHt.firstChild.textContent)&&/◀ ▶ bergilir-gilir/.test(sHt.firstChild.textContent),'narrow Lompat + Malay hint');
PG.tap('L');ok(S.v==0,'tap before LARI ignored');
for(let i=0;i<200&&S.ph=='count';i++)PG.update(.016,i*.016);ok(S.ph=='run','run phase starts');
PG.tap('L');ok(Math.abs(S.v-g.imp)<1e-9,'one tap = +imp');PG.tap('R');ok(Math.abs(S.v-2*g.imp)<1e-9,'alternating taps add speed');
for(let i=0;i<20;i++){PG.tap(i%2?'R':'L');}ok(S.v<=g.vmax+1e-9&&S.v>=g.vmax-1e-9,'speed capped at vmax '+S.v);
PG.tap(S.last);ok(S.stun>0&&S.v==0&&S.mis==1&&/◀ ▶/.test(toasts[toasts.length-1]),'same side twice = stumble');
let t=0;const step=n=>{for(let i=0;i<n;i++){PG.update(.016,t+=.016)}};step(60);ok(S.stun<=0,'stumble ends');
PG.tap('L');PG.tap('R');const v1=S.v;step(120);ok(S.v<v1*.3,'speed fades when tapping stops');
const d0=S.d;step(400);ok(S.d-d0<2,'runner nearly stops without taps');
/* jump + taps in air */
PG.jump();ok(S.air==1&&S.vy>0,'Lompat jumps');PG.tap('L');PG.tap('R');ok(S.v>0,'taps work in the air');
/* full run with taps and jumps at each fence: no fence falls, finishes */
function run(jumpOk){PG.end();PG.show();got=null;PG.begin(1,r=>got=r);S=PG.st();t=0;let side=0,acc=0;
 for(let i=0;i<4000&&!got;i++){const dt=.016;if(S.ph=='run'){acc+=dt;if(acc>=.22){acc=0;PG.tap(side++%2?'L':'R')}
  if(jumpOk){const nx=g.hd.find(h=>h>S.d-.1);if(nx!==undefined&&nx-S.d<S.v*.3+.05&&!S.air&&S.y<=0)PG.jump()}}PG.update(dt,t+=dt)}return S}
S=run(true);ok(got&&got.i==1,'run finishes and reports');ok(S.hits==0,'tap+jump run: no fence falls ('+S.hits+')');ok(got&&got.score>=70&&got.stars>=2,'score from stallScore '+(got&&got.score));
const tTap=S.t;S=run(false);ok(S.hits==6,'never jumping: all 6 fences fall ('+S.hits+')');ok(got&&got.score<70&&got.txt.includes('6/6'),'result text counts fences');
/* hit drops speed at once */
PG.end();PG.show();PG.begin(1,()=>{});S=PG.st();for(let i=0;i<200&&S.ph=='count';i++)PG.update(.016,i);S.d=g.hd[0]-.01;S.v=6;PG.update(.016,1);ok(S.hits==1&&S.v<6*g.slow+.5,'fence hit: speed *'+g.slow+' (v='+S.v.toFixed(2)+')');
/* other games unchanged */
PG.end();PG.show();PG.begin(0,()=>{});S=PG.st();ok(!sL.hidden&&sJ.hidden&&!sHt.hidden&&!sJ.classList.contains('nr')&&sHt.firstChild.textContent=='◀ ▶ bergilir-gilir','Lari Pecut: arrows + hint, no Lompat');
PG.end();ok(sL.hidden&&sR.hidden&&sJ.hidden&&sHt.hidden,'end() hides all');
PG.show();PG.begin(2,()=>{});S=PG.st();for(let i=0;i<400&&S.ph!='runup';i++)PG.update(.016,i);ok(S.ph=='runup'&&!sL.hidden&&sJ.hidden&&!sHt.hidden,'Lompat Jauh run-up: arrows+hint '+S.ph+sL.hidden+sJ.hidden+sHt.hidden);
/* keys */
PG.end();PG.show();PG.begin(1,()=>{});S=PG.st();for(let i=0;i<200&&S.ph=='count';i++)PG.update(.016,i);
const pd=()=>{};keyH({code:'KeyD',repeat:false,preventDefault:pd});ok(S.v>0,'key D still taps');keyH({code:'ArrowLeft',repeat:false,preventDefault:pd});ok(S.v>g.imp,'ArrowLeft still taps');keyH({code:'Space',repeat:false,preventDefault:pd});ok(S.air==1,'Space still jumps');
console.log(fail?'FAILED '+fail:'OK',pass+' checks');process.exit(fail?1:0)
