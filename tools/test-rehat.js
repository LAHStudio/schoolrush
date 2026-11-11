/* Round 15d: Node stub test (no browser) of js/story.js: relaxed Waktu Rehat and walking out of the exit door after the balik bell.
   Runs the real story.js in a vm with stubs. Run: node tools/test-rehat.js */
const fs=require('fs'),vm=require('vm'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
function deep(){const st={};const f=function(){};return new Proxy(f,{get:(t,k)=>{if(k===Symbol.toPrimitive)return()=>0;if(k in st)return st[k];if(k==='length')return 0;if(typeof k==='symbol')return undefined;return st[k]=deep()},set:(t,k,v)=>{st[k]=v;return true},apply:()=>deep(),construct:()=>deep()})}
const els={};const E=id=>els[id]||(els[id]={id,hidden:false,textContent:'',className:'',style:{},children:[],innerHTML:'',appendChild(c){this.children.push(c)},append(){},insertBefore(){},querySelector:()=>E('qs'),getContext:()=>deep(),classList:{add(){},remove(){}}});
const mem={},ss={};const LS={get:(k,d)=>k=='sk_mode'?'story':(k in mem?mem[k]:d),set(k,v){mem[k]=v}},SS={get:(k,d)=>k in ss?ss[k]:d,set(k,v){ss[k]=v},del(k){delete ss[k]}};
const toasts=[],says=[],navs=[],tones=[],made=[];let wl=1000,halt=false;
const mkNpc=(x,z)=>({m:{visible:false,position:{set(){}},rotation:{},userData:{}},x,z,role:'pengawas',ch:0,mv:0,d:0,w:0});
const ns=[mkNpc(20,10),mkNpc(-20,10),Object.assign(mkNpc(5,5),{role:'murid'})];
const GW=40,GH=40,GC=1,GX=-20,GZ=-20,bk=new Uint8Array(GW*GH);
const P={x:0,z:0,y:0,vy:0,f:0,stun:0,slow:0},cp={x:0,z:0};
const DR=[0,1,2,3,4,5].map(i=>['a','b','c','d',0,1,'Bilik '+i,i,i]);
const ctx={LS,SS,$:E,T:deep(),sc:{add(){}},cam:{},cv:{clientWidth:400,clientHeight:300},P,cp,cy:0,hold:0,ns,GW,GH,GC,GX,GZ,bk,N8:[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]],
 DR,DD:[],BK:[],BKN:[],ND:{TS:[0,0],BS:[1,1]},X:v=>v,Z:v=>v,cell:(x,z)=>[Math.floor((x-GX)/GC),Math.floor((z-GZ)/GC)],la:(a,b,k)=>b,anim(){},npc:()=>mkNpc(0,0),R:a=>a[0],rnd:(a,b)=>a,
 toast:m=>toasts.push(m),say:m=>says.push(m),tone:(...a)=>tones.push(a),bellSound(){},SRA:{whistle(){}},flood(){},tgt:-1,dist:null,loading:f=>f(),nav:p=>navs.push(p),document:{createElement:()=>E('x'+Math.random()),body:{appendChild(c){made.push(c)},classList:{add(){},remove(){}}}},
 navigator:{vibrate(){}},drawMM(){},HUD:{set(){}},WALLET:{topUp:()=>0,CFG:{pocket:300},fmt:v=>v},cur:{save:null,level:1},save(){},dayOk:()=>false,gradeOf:()=>'A',gcls:()=>'',PF:{},curKey:()=>'k',hit:()=>false,place(){},
 setInterval(){},addEventListener(){},console,Math,JSON,Object,Array,Number,String,Date,Int16Array,Uint8Array};
Object.defineProperty(ctx,'halt',{get:()=>halt,set:v=>{halt=v}});
ctx.window=ctx;vm.createContext(ctx);
const S=R('js/story.js'),SRC=S.replace(/\}\)\(\);\s*$/,'window.__T={ev:s=>eval(s)};})();');ok(SRC!==S,'story.js ends with the IIFE');vm.runInContext(SRC,ctx);const V=s=>ctx.__T.ev(s);
/* A. static: whistle count unchanged, new names, old text kept */
ok((S.match(/SRA\.whistle\(\)/g)||[]).length==3,'still 3 whistles in story.js (test-audio)');
ok(!/goHome\(\);else pills\(\)/.test(S),'no more automatic goHome after the balik bell');
/* B. day flow: boot a fresh day, then go through the classes like the real page does (room page and back) */
const tick=(sec,dt=.05)=>{for(let t=0;t<sec;t+=dt)ctx.storyTick(dt,t)};
const cfgRead=n=>{const m=S.match(new RegExp(n+':([0-9.]+)'));return +m[1]};
ok(cfgRead('RREM')==590&&cfgRead('RAUTO')==595&&cfgRead('RPEN')==20&&cfgRead('RBON')==50,'defaults: 9:50 reminder, 9:55 auto, -20 points, +50 bonus');
let scoreNow=()=>V('score'),stNow=()=>V('st'),clkNow=()=>V('clk');
const jom=()=>{const r=E('room');const h=r.children.find(c=>c&&c.children&&0)};
ctx.storyBoot();
/* the start card has one button (Jom!): find it in the card DOM stub */
const btn=()=>{const room=E('room');const k=room.children[room.children.length-1];return k&&k.children&&k.children[0]};
ok(V('order').length==6&&V('order')[2]==5,'plan: Kantin is always slot 3');
V("closeCard();document.body.classList.remove('mn');halt=false;sched(true)");
function playClass(){ /* ring, walk into the right door, return from the room page (simulated) */
 for(let i=0;i<4000&&stNow()!='class'&&stNow()!='rehat';i++)ctx.storyTick(.05,i*.05);
 const cls=V('cls');return cls}
function through(){const cls=playClass();ctx.storyDoor(DR[cls]);const day=SS.get('sk_day');SS.set('sk_ret',{room:cls,grade:'A',score:80});ctx.storyBoot();return{cls,day}}
let r0=through(),r1=through();
ok(r0.cls!=5&&r1.cls!=5&&V('n')==2,'two classes done, now slot 3 (n=2)');
/* C. rehat state */
const sc0=scoreNow();for(let i=0;i<4000&&stNow()!='rehat';i++)ctx.storyTick(.05,i*.05);
ok(stNow()=='rehat'&&V('cls')==5,'9:30 bell: state is rehat (not class) for the Kantin');
ok(clkNow()>=570&&clkNow()<571,'rehat starts at 9:30 ('+clkNow().toFixed(1)+')');
const sc1=scoreNow();tick(30);ok(stNow()=='rehat'&&scoreNow()==sc1&&clkNow()>577,'no timer, no late, no penalty while walking around (clk '+clkNow().toFixed(1)+')');
ok(!toasts.some(t=>/Lewat|Pengawas datang/.test(t)),'no late toast in rehat');
ok(ns.filter(o=>o.role=='pengawas').every(o=>!o.ch),'prefects are not chasing before 9:50');
tick(40);ok(clkNow()<590&&!ns.some(o=>o.ch),'still calm just before 9:50 (clk '+clkNow().toFixed(1)+')');
for(let i=0;i<400&&clkNow()<590.1;i++)tick(.05);ok(clkNow()>=590&&toasts.some(t=>/Waktu rehat nak habis/.test(t)),'9:50: one reminder');
ok(ns.filter(o=>o.role=='pengawas').every(o=>o.ch==1)&&ns[2].ch==0,'only the two patrol prefects walk toward the player');
const bub=made.filter(m=>/^pfsay/.test(m.id));ok(bub.length==2&&bub.every(b=>b.textContent=='waktu rehat nak habis, cepat ke kantin!'),'two speech bubbles with the exact line');
ok(bub.every(b=>b.style.background==undefined||true)&&/color:#111;background:#fff/.test(S),'white bubble, black text');
tick(2);const pf=ns.filter(o=>o.role=='pengawas'),dd=o=>Math.hypot(o.x-P.x,o.z-P.z);
tick(8);ok(clkNow()<595&&pf.every(o=>dd(o)>=2.0)&&scoreNow()==sc1&&stNow()=='rehat','prefects stop about 2.5 m away, no catch, no dragging (min dist '+Math.min(...pf.map(dd)).toFixed(2)+')');
ok(pf.every(o=>dd(o)<4),'and they did walk up near the player (dist '+pf.map(dd).map(x=>x.toFixed(1))+')');
ok((S.match(/toast\('Waktu rehat nak habis/g)||[]).length==1,'the reminder toast exists once in code');
const before=toasts.filter(t=>/Waktu rehat nak habis/.test(t)).length;tick(6);ok(toasts.filter(t=>/Waktu rehat nak habis/.test(t)).length==before,'the reminder is not repeated');
/* D. 9:55 auto transport */
tick(12);ok(stNow()=='room'&&navs.slice(-1)[0]=='kantin'&&scoreNow()==sc1-20,'9:55: auto transport to the Kantin with -20 points (score '+sc1+' -> '+scoreNow()+')');
ok(toasts.some(t=>/hantar kamu ke Kantin/.test(t)),'auto transport toast');
const dayA=SS.get('sk_day');ok(dayA&&/Waktu rehat nak habis/.test(dayA.g)&&dayA.lt>=1,'result line says rehat penalty and counts as late');
ok(!ns.some(o=>o.ch),'prefects released and walk back to patrol');
SS.set('sk_ret',{room:5,grade:'B',score:70});ctx.storyBoot();
ok(V('gr')[5]&&V('gr')[5].g=='B','Gred Kantin still recorded after auto transport');
ok(V('n')==3&&stNow()=='idle','back from the Kantin: next slot, short break before the 10:00 bell (as before)');
/* E. entering the Kantin by himself: small bonus */
ctx.storyBoot&&0;
{const c2=vm.runInContext;let day=null;
 /* new vm state: run a second day up to rehat and enter at once */
 V("order=[0,1,5,2,4,3];n=2;score=100;ok=0;lt=0;gr={};sched(false)");
 for(let i=0;i<4000&&stNow()!='rehat';i++)ctx.storyTick(.05,i*.05);const s0=scoreNow();
 ctx.storyDoor(DR[0]);ok(stNow()=='rehat'&&says.slice(-1)[0]=='Waktu rehat! Pergi ke Kantin.','wrong door in rehat: told to go to the Kantin');
 ctx.storyDoor(DR[5]);ok(stNow()=='room'&&scoreNow()==s0+50,'entering the Kantin yourself: Sempat rehat +50 (score '+s0+' -> '+scoreNow()+')');
 day=SS.get('sk_day');ok(/Sempat rehat! \+50/.test(day.g)&&day.ok==1,'result line Sempat rehat +50');}
/* F. exit door during rehat */
{V("order=[0,1,5,2,4,3];n=2;score=100;ok=0;lt=0;gr={};st='off';halt=false;sched(false)");for(let i=0;i<4000&&stNow()!='rehat';i++)ctx.storyTick(.05,i*.05);
 P.x=336;P.z=538-.06;const nb=navs.length;ok(ctx.exitHint()==='','exit door hint hidden during rehat');ok(ctx.exitGo()===true&&navs.length==nb&&says.slice(-1)[0]=='Waktu rehat! Pergi ke Kantin.','exit door in rehat only says go to the Kantin');P.x=0;P.z=0;}
/* G. end of school: walk out of the exit door himself */
{V("order=[0,1,5,2,4,3];n=6;score=500;ok=4;lt=1;gr={};st='off';halt=false;endWalk()");
 let nb=navs.length;tick(8);ok(stNow()=='balik','balik bell rang after the short free walk');
 tick(30);ok(stNow()=='balik'&&navs.length==nb,'30 s after the balik bell: still inside, NOT transported');
 ok(/pintu keluar/.test(V("document.getElementById?'':''")||toasts.slice(-1)[0]||toasts.join('|')),'toast tells him to walk to the exit door');
 P.x=0;P.z=0;ok(ctx.exitHint()==='','far from the door: no hint');ok(ctx.exitGo()===false&&stNow()=='balik','far from the door: E does nothing');
 P.x=336;P.z=538-.06;ok(ctx.exitHint()=='Keluar sekolah','at the exit door: hint "Keluar sekolah"');
 ok(ctx.exitGo()===true&&navs.slice(-1)[0]=='luar'&&ss.sk_out=='home'&&stNow()=='done','exit door after the balik bell: outdoor scene (bus flow, sk_out=home), day kept');
 ok(ss.sk_day&&ss.sk_day.n==6&&ss.sk_day.score==500,'day (score, grades) handed over for the end card');}
console.log(fail?'FAILED '+fail:'OK',pass+' checks');process.exit(fail?1:0)
