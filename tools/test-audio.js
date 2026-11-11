/* Round 11: Node stub test (NOT a real browser, nothing is heard) for js/audio.js: track table, scene choice, loop-exact melody,
   scheduler on/off rules (Bunyi, Muzik, volume, hidden tab, Pause, ducking), footsteps, jump/landing, door/click/bell hooks, wiring in the files.
   Run: node tools/test-audio.js */
const fs=require('fs'),path=require('path'),vm=require('vm'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let f=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)f++};
const src=R('js/audio.js');
function mk(pathname,sk){
 const C={osc:0,buf:0,filt:0,target:null,gains:0};
 const prm=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(v){C.target=v}});
 const node=()=>({connect(){},start(){},stop(){},type:'',frequency:prm(),Q:prm(),gain:prm()});
 const au={state:'running',currentTime:0,sampleRate:8000,destination:{},
  createGain(){C.gains++;return node()},createOscillator(){C.osc++;return node()},createBiquadFilter(){C.filt++;return node()},
  createBufferSource(){C.buf++;return Object.assign(node(),{buffer:null})},createBuffer(c,n){return{sampleRate:8000,getChannelData(){return new Float32Array(n)}}}};
 const cls=new Set(),menu={classList:{contains:k=>k=='pz'&&menu.pz},style:{display:'none'},pz:false};
 const doc={hidden:false,readyState:'complete',body:{classList:{contains:k=>cls.has(k)}},getElementById:id=>id=='menu'?menu:null,addEventListener(e,h){doc['_'+e]=h}};
 let called=[];
 const sb={document:doc,location:{pathname:pathname||'/world.html'},SET:{snd:1,vol:.8,ts:1,mus:1,mvol:.6},au,
  SS:{get:k=>k=='sk_kelas'?(sk||null):null},P:{x:0,z:0,y:0,vy:0},halt:false,mode:'walk',setInterval(){return 0},setTimeout(fn){fn();return 0},
  tone(){called.push('tone')},bellSound(){called.push('bell')},loading(fn){called.push('loading');return fn},actx(){return au},Date,Math};
 sb.window=sb;vm.createContext(sb);vm.runInContext(src,sb);
 return{sb,C,au,cls,menu,doc,called,SRA:vm.runInContext('SRA',sb)};
}
const T0=Date.now();
/* 1. tracks */
{const{SRA}=mk();const TR=SRA._t.TR,names=['menu','hall','mat','eng','bm','sains','kantin','padang','luar'];
 ok(names.every(n=>TR[n])&&Object.keys(TR).length==9,'9 tracks: menu, hall, mat, eng, bm, sains, kantin, padang, luar (Round 12)');
 ok(names.every(n=>{const t=TR[n];return t.bs.length==8&&(t.ki===''||t.ki.length==8)&&SRA._t.SCL[t.sc]&&t.root>100&&t.bpm>=60&&t.bpm<=140&&t.ch.length==4&&t.dens>0&&t.dens<1}),'every track has valid bpm, root, scale, 4 chords, 8-step patterns');
 ok(new Set(names.map(n=>TR[n].seed)).size==9,'every track has its own seed (rooms sound different)');
 ok(names.every(n=>{const a=[];const s=new Set();for(let b=0;b<8;b++){a.push(SRA._t.mkBar(TR[n],b))}return JSON.stringify(a.slice(0,4))==JSON.stringify(a.slice(4,8))}),'melody repeats exactly every 4 bars (clean loop)');
 ok(names.every(n=>{const t=TR[n],S=SRA._t.SCL[t.sc],len=S.length;for(let b=0;b<4;b++)for(const i of SRA._t.mkBar(t,b)){if(i<-1||i>=len*2)return false;if(i>=0&&!S.includes(SRA._t.semi(t,i)%12))return false}return true}),'every melody note is inside the track scale and range');
 ok(names.every(n=>{let c=0;for(let b=0;b<4;b++)c+=SRA._t.mkBar(TR[n],b).filter(x=>x>=0).length;return c>=4}),'melodies are not empty');}
/* 2. scene choice */
{const s=(p,k,idx)=>{const m=mk(p,k);if(idx)m.cls.add('idx');return m.SRA._t.sceneName()};
 ok(s('/index.html')=='menu'&&s('/')=='menu'&&s('/x/',null,true)=='menu','index and root = menu music');
 ok(s('/world.html')=='hall'&&s('/kantin.html')=='kantin'&&s('/padang.html')=='padang'&&s('/luar.html')=='luar','world = hall, kantin, padang, luar');
 ok(s('/kelas.html','mat')=='mat'&&s('/kelas.html','eng')=='eng'&&s('/kelas.html','bm')=='bm'&&s('/kelas.html','sains')=='sains','kelas page picks mat / eng / bm / sains from sk_kelas');
 ok(s('/kelas.html',null)=='mat'&&s('/kelas.html','zzz')=='mat','kelas page with no or unknown subject falls back to mat');}
/* 3. scheduler rules */
function run(m,secs,from){const{au,SRA}=m;for(let i=0;i<secs*20;i++){au.currentTime=(from||0)+i*.05;SRA._t.step(T0+((from||0)+i*.05)*1000)}}
{const m=mk('/world.html');m.SRA.play('hall');run(m,4);
 ok(m.C.osc>10,'hall music schedules notes (oscillators='+m.C.osc+') in 4 s');
 ok(Math.abs(m.C.target-.6*.4)<1e-6,'music bus target = snd*mus*mvol*0.4 (0.24 at defaults), got '+m.C.target);
 const n=m.C.osc;m.sb.SET.mvol=1;run(m,.2,4);ok(Math.abs(m.C.target-.4)<1e-6,'Muzik slider is live (mvol 1 -> 0.4)');}
for(const[k,fn] of [['mus off',s=>s.mus=0],['snd off',s=>s.snd=0],['mvol 0',s=>s.mvol=0]]){const m=mk('/world.html');fn(m.sb.SET);m.SRA.play('hall');run(m,2);ok(m.C.osc==0&&m.C.target===0,'no music when '+k)}
{const m=mk('/world.html');m.SRA.play('hall');run(m,1);m.sb.document.hidden=true;run(m,.5,1);ok(m.C.target===0,'music level 0 when the tab is hidden');m.sb.document.hidden=false;
 m.menu.pz=true;m.menu.style.display='flex';run(m,.5,1.5);ok(m.C.target===0,'music level 0 while the Pause menu is open');
 const o=m.C.osc;m.menu.style.display='none';run(m,.1,2);ok(m.C.target>0&&m.C.osc-o<40,'music resumes after Pause without a burst of notes ('+(m.C.osc-o)+' new)');
 m.cls.add('mn');run(m,.1,2.1);ok(Math.abs(m.C.target-.24*.45)<1e-6,'quiz / mini game open (body.mn): music ducked to 45%');
 m.cls.clear();m.sb.bellSound(2);run(m,.1,2.2);ok(Math.abs(m.C.target-.24*.3)<1e-6,'school bell ducks the music to 30%');}
{const m=mk('/index.html');m.cls.add('idx');m.SRA.play('menu');m.cls.add('mn');run(m,.2);ok(Math.abs(m.C.target-.24)<1e-6,'start screen music is not ducked by body.mn');}
{const m=mk('/kantin.html');m.SRA.play('kantin');m.sb.SET.mus=0;m.sb.SET.mvol=0;for(let i=0;i<400;i++){m.au.currentTime=i*.05;m.SRA._t.step(T0+i*50)}ok(m.C.buf==0&&m.C.osc==0&&!m.SRA._t.TR.kantin.amb,'kantin has no crowd chatter or any ambience (music and your footsteps only)')}
{const m=mk('/padang.html');m.SRA.play('padang');m.sb.SET.mus=0;m.sb.SET.mvol=0;for(let i=0;i<1200;i++){m.au.currentTime=i*.05;m.SRA._t.step(T0+i*50)}ok(m.C.buf>=2&&m.C.buf<=12,'padang crowd cheer is occasional ('+m.C.buf+' in 60 s)')}
/* 4. footsteps, jump, landing */
function walk(m,speed,secs,extra){m.SRA._t.reset();m.sb.SET.mus=0;const P=m.sb.P;P.x=0;P.y=0;P.vy=0;let t=T0/1000;m.au.currentTime=0;m.SRA._t.step(T0);const b0=m.C.buf;
 for(let i=1;i<=secs*20;i++){P.x+=speed*.05;if(extra)extra(i,P);m.au.currentTime=i*.05;m.SRA._t.step(T0+i*50)}return m.C.buf-b0}
{let m=mk('/world.html');let n=walk(m,5,2);ok(n>=4&&n<=7,'walking at 5 u/s: about 5 footsteps in 2 s ('+n+')');
 m=mk('/world.html');n=walk(m,9,2);ok(n>=8&&n<=12,'running fast (boost 9 u/s): quicker steps ('+n+')');
 m=mk('/world.html');n=walk(m,2.4,2);ok(n>=2&&n<=5,'slowed (2.4 u/s): slower steps ('+n+')');
 m=mk('/world.html');n=walk(m,0,2);ok(n==0,'standing still: no footsteps');
 m=mk('/world.html');m.sb.halt=true;n=walk(m,5,2);ok(n==0,'halt (menu, quiz, loading): no footsteps');
 m=mk('/padang.html');m.sb.mode='game';n=walk(m,5,2);ok(n==0,'padang mini game (mode != walk): no footsteps');
 m=mk('/world.html');n=walk(m,5,2,(i,P)=>{P.y=.5});ok(n==0,'in the air: no footsteps');
 m=mk('/world.html');n=walk(m,5,2,(i,P)=>{if(i==10)P.x+=40});ok(n<=7&&n>=3,'a teleport (door, respawn) is not counted as running ('+n+')');
 m=mk('/world.html');m.sb.SET.snd=0;n=walk(m,5,2);ok(n==0,'Bunyi off: no footsteps');
 m=mk('/world.html');m.sb.P=undefined;m.SRA._t.reset();let thrown=false;try{for(let i=0;i<20;i++){m.au.currentTime=i*.05;m.SRA._t.step(T0+i*50)}}catch(e){thrown=true}ok(!thrown,'no player yet (menu page): polling does not throw');
 m=mk('/padang.html');const w=walk(m,5,2);const m2=mk('/world.html');ok(w>=4&&walk(m2,5,2)>=4,'both surfaces (tile and padang grass) make steps');}
{const m=mk('/world.html');m.SRA._t.reset();m.sb.SET.mus=0;const P=m.sb.P;m.au.currentTime=0;m.SRA._t.step(T0);const o0=m.C.osc;
 P.y=.3;P.vy=6;m.au.currentTime=.05;m.SRA._t.step(T0+50);ok(m.C.osc==o0+1,'jump makes one sound');
 P.vy=2;m.au.currentTime=.1;m.SRA._t.step(T0+100);ok(m.C.osc==o0+1,'jump sound plays once per jump');
 for(let i=3;i<=8;i++){m.au.currentTime=i*.05;m.SRA._t.step(T0+i*50)}const b0=m.C.buf;P.y=0;P.vy=0;m.au.currentTime=.5;m.SRA._t.step(T0+500);ok(m.C.buf==b0+1,'landing after a real jump makes a thud');
 const m3=mk('/world.html');m3.SRA._t.reset();m3.sb.SET.mus=0;m3.au.currentTime=0;m3.SRA._t.step(T0);m3.sb.P.y=.2;m3.sb.P.vy=-1;m3.au.currentTime=.05;m3.SRA._t.step(T0+50);const b1=m3.C.buf;m3.sb.P.y=0;m3.au.currentTime=.1;m3.SRA._t.step(T0+100);ok(m3.C.buf==b1,'stepping down a small drop (no jump) is silent');}
/* 5. hooks: door, bell, tone, click */
{const m=mk('/world.html');const d=()=>m.C.osc+m.C.buf;
 let a=d();m.sb.loading(()=>nav('world'));ok(d()>a&&m.called.includes('loading'),'loading(nav) plays the door sound and still calls the original');
 a=d();m.sb.loading(()=>{halt=false});ok(d()==a,'loading() without nav (e.g. "belum siap") has no door sound');
 m.called.length=0;m.sb.bellSound(1);ok(m.called.includes('bell'),'bellSound wrapper still calls the original');
 const st=[];m.sb.tone(440);ok(m.called.includes('tone'),'tone wrapper still calls the original');
 const btn={disabled:false},ev={target:{closest:()=>btn}};const h=m.doc._click;ok(typeof h=='function','document click listener installed');
 a=d();m.sb.tone(700);h(ev);ok(d()==a,'button that already plays its own tone gets no extra click');
 a=d();const late=Date.now;m.sb.Date={now:()=>late()+500};h(ev);ok(d()>a,'plain button gets a soft click');
 a=d();btn.disabled=true;h(ev);ok(d()==a,'disabled button: no click');
 m.au.state='running';const o=mk('/world.html');o.sb.SET.snd=0;let b=o.C.osc+o.C.buf;o.SRA.door();o.SRA.sip();o.SRA.bin();o.SRA.whistle();o.SRA.click();o.SRA.pop();ok(o.C.osc+o.C.buf==b,'Bunyi off: no sound effect at all');
 const n=mk('/world.html');n.sb.au=null;n.sb.actx=()=>{throw new Error('no audio')};let th=false;try{n.SRA.door();n.SRA.sip();n.SRA.bin();n.SRA.whistle();n.SRA.jump();n.SRA.land();n.SRA.foot()}catch(e){th=true}ok(!th,'no audio support: effects never throw');
 const e=mk('/world.html');b=e.C.osc+e.C.buf;e.SRA.sip();ok(e.C.osc>=3,'sip = 3 gulps');
 const w=mk('/world.html');b=w.C.osc;w.SRA.whistle();ok(w.C.osc-b>=4,'prefect whistle = two blasts');
 const p=mk('/world.html');b=p.C.osc;p.SRA.pop();p.SRA.pop();ok(p.C.osc-b==1,'speech-bubble pop is debounced');}
/* 6. wiring in the files */
{const L=s=>R(s);const pages=['index','world','kantin','padang','kelas','luar'];
 ok(pages.every(p=>{const t=L(p+'.html'),m=t.match(/const L=(\[.*?\]);/);if(!m)return false;const a=JSON.parse(m[1]);return a.indexOf('js/audio.js')==a.indexOf('js/ui.js')+1&&a.indexOf('js/core.js')<a.indexOf('js/audio.js')}),'all 6 pages (Round 12 adds luar) load js/audio.js right after js/ui.js (after core.js, before the scene scripts)');
 const sw=L('sw.js');ok(/CACHE='sr-r20d'/.test(sw)&&sw.includes("'js/audio.js'"),'sw.js: cache sr-r14 and audio.js pre-cached');
 ok(L('js/world.js').includes('SRA.sip()')&&!/tone\(420-i\*60/.test(L('js/world.js')),'world.js sip() uses SRA.sip()');
 ok(L('js/world-build.js').includes('SRA.bin();const c=carry')&&L('js/kantin.js').includes('SRA.bin();const c=carry'),'hallway and kantin bins call SRA.bin() on a correct throw');
 const st=L('js/story.js');ok((st.match(/SRA\.whistle\(\)/g)||[]).length==3,'story.js: whistle when late, when caught and when the patrol prefects join (Round 14c)');
 const all=fs.readdirSync(path.join(__dirname,'..','js')).filter(x=>x.endsWith('.js'));
 ok(all.filter(x=>/\b(const|let|var|function|class)\s+SRA\b/.test(L('js/'+x))).join()=='audio.js','SRA is declared only in audio.js');
 let dp=0,first=-1,seen=0;for(let i=0;i<src.length;i++){const c=src[i];if(c=='{'){dp++;seen=1}else if(c=='}'){dp--;if(seen&&dp==0&&first<0)first=i}}
 ok(/^const SRA=\(function\(\)\{/m.test(src)&&first>src.length-12&&src.trim().endsWith('})();'),'audio.js is one IIFE assigned to SRA (the only top-level name), so it cannot clash with the scene scripts');
 ok(!/localStorage|sessionStorage|new Audio|\.mp3|\.ogg|\.wav|fetch\(/.test(src),'no audio files, no storage, no network in audio.js');
 ok(/Round 11/.test(L('README.md')),'README has a Round 11 entry');
 const sha=f=>require('crypto').createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',f))).digest('hex'); /* Round 12d: hashes of the Round 11 originals (the _backup_round11 folder is no longer kept) */
 ok(sha('js/core.js')=='d25c34b19f3d807de2c788764e4d0eb5d6e6766c86e8a3a0d00ecafbeca497de'&&sha('js/ui.js')=='483e48f5d5cede4f5ccbd06f53944c95f455f41dec33bf6c1bf3aa6516b70c7f','core.js and ui.js are unchanged (saves, settings UI untouched)');}
console.log(f?('\n'+f+' FAILED'):'\nALL PASS');process.exit(f?1:0);
