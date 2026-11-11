/* Round 19h: private keyboard codes (js/cheat.js). Node only; cheat.js runs for real with stubs.
   The codes are NOT in this repo. Give them through the environment so the real check can run:
   SR_CODE1=<money code> SR_CODE2=<reset code> node tools/test-cheat.js   (without them the code-specific checks are skipped and say so) */
const fs=require('fs'),path=require('path');let pass=0,fail=0,skip=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const root=path.join(__dirname,'..'),rd=f=>fs.readFileSync(path.join(root,f),'utf8');
const SRC=rd('js/cheat.js'),C1=process.env.SR_CODE1,C2=process.env.SR_CODE2,HAVE=!!(C1&&C2);
function load(o){o=o||{};const log={add:[],save:0,toast:[],clear:0,lis:[]},cur={off:2,w:{c:0}};
 const W={add:n=>log.add.push(n)},doc={addEventListener:(t,f)=>log.lis.push([t,f])},mm=q=>({matches:o.kb!==false});
 const win={lockClear:()=>{log.clear++},matchMedia:o.noMM?undefined:mm};
 const C=new Function('window','document','matchMedia','WALLET','cur','save','toast',SRC+';return CHT')(win,doc,o.noMM?undefined:mm,W,cur,()=>{log.save++},t=>log.toast.push(t));
 return{C,log,cur,win}}
const type=(C,str,t0)=>{let t=t0||1e6,r='';for(const ch of str){t+=120;r=C.feed(ch,t)||r}return r};
/* ---- structure (no codes needed) ---- */
{const x=load();ok(x.C.TB.length==2&&x.C.TB.every(q=>Number.isInteger(q[0])&&Number.isSafeInteger(q[1])&&q[1]>0),'two codes, each stored only as length + hash');
 ok(x.C.h('ABC')===x.C.h('ABC')&&x.C.h('ABC')!==x.C.h('ABD')&&x.C.h('')!==x.C.h('A'),'the hash is stable and tells inputs apart');
 ok(x.log.lis.length==1&&x.log.lis[0][0]=='keydown','keyboard device: one keydown listener');
 const t=load({kb:false});ok(t.log.lis.length==0,'finger-only device (phone, tablet): nothing is started');
 const n=load({noMM:true});ok(n.log.lis.length==0,'no matchMedia: nothing is started');
 const k=load(),f=k.log.lis[0][1],ev=(o)=>Object.assign({key:'a',ctrlKey:false,metaKey:false,altKey:false,target:{tagName:'DIV'},preventDefault(){this.pd=1},stopPropagation(){this.sp=1}},o);
 const e1=ev({});f(e1);ok(k.C.S.b=='A'&&!e1.pd&&!e1.sp,'a letter is read and the key is NOT swallowed (E and WASD still work)');
 k.C.S.b='';[ev({ctrlKey:true}),ev({metaKey:true}),ev({altKey:true}),ev({key:'Enter'}),ev({key:'5'}),ev({key:'ArrowUp'}),ev({target:{tagName:'INPUT'}}),ev({target:{tagName:'TEXTAREA'}})].forEach(f);ok(k.C.S.b=='','shortcuts, digits, arrows, Enter and text fields are ignored');
 const e2=ev({key:'q'});f(e2);ok(k.C.S.b=='Q','lower case is read as upper case');
 k.C.S.b='';let tt=1e6;k.C.feed('A',tt);k.C.feed('B',tt+3500);ok(k.C.S.b=='B','a pause over 3 s empties the typed letters');
 ok(!/preventDefault|stopPropagation/.test(SRC.replace(/\/\*[\s\S]*?\*\//g,'')),'cheat.js never calls preventDefault or stopPropagation')}
/* ---- real codes (from the environment) ---- */
if(HAVE){
 {const x=load();ok(type(x.C,C1)=='m'&&x.log.add.join()=='1000'&&x.log.toast.join()=='Kod diterima'&&x.log.save==0,'money code: WALLET.add(1000) = RM10, one generic toast');
  ok(type(x.C,C1,2e6)=='m'&&x.log.add.length==2,'it can be used again');
  ok(x.C.S.b=='','the typed letters are cleared after a code')}
 {const x=load();ok(type(x.C,'QWERTY'+C1)=='m'&&x.log.add.length==1,'letters typed before the code do not matter');
  const y=load();ok(type(y.C,C1.slice(0,-1)+'X')==''&&y.log.add.length==0,'a wrong last letter does nothing');
  const z=load(),f=z.log.lis[0][1],dn=Date.now;let T=3e6;Date.now=()=>(T+=100);[...C1.toLowerCase()].forEach(c=>f({key:c,ctrlKey:false,metaKey:false,altKey:false,target:{tagName:'BODY'}}));Date.now=dn;ok(z.log.add.join()=='1000','typing the code through the real key handler in lower case works')}
 {const x=load();ok(type(x.C,C2)=='r'&&x.cur.off===0&&x.log.save==1&&x.log.clear==1&&x.log.add.length==0,'reset code: demerit counter (cur.off) to 0, saved, serik window cleared, no money');
  const y=load();y.cur.off=1;y.C.feed('A',1e6);for(let i=0;i<C2.length;i++)y.C.feed(C2[i],1e6+3500*(i+1));ok(y.cur.off===1,'a code typed with long pauses does not count')}
 {const x=load();const keys=[...C1];let t=1e6;keys.forEach((ch,i)=>{t+=(i==5?4000:100);x.C.feed(ch,t)});ok(x.log.add.length==0,'a pause in the middle breaks the code')}
 {/* the codes are in no shipped file (js, css, html, README, sw, tools, icons) */
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(['node_modules','dist','.git'].includes(e.name)?[]:walk(path.join(d,e.name))):[path.join(d,e.name)]);
  const files=walk(root).filter(f=>/\.(js|html|css|md|json|py|txt)$/.test(f)),hit=files.filter(f=>{const s=fs.readFileSync(f,'utf8').toUpperCase();return s.includes(C1.toUpperCase())||s.includes(C2.toUpperCase())});
  ok(hit.length==0,'neither code is written in any file of the project (found in: '+hit.map(f=>path.relative(root,f)).join(', ')+')')}
}else{skip=1;console.log('NOTE: SR_CODE1 / SR_CODE2 not set: the real code checks were skipped')}
/* ---- wiring ---- */
const H=rd('world.html'),SW=rd('sw.js'),R=rd('README.md');
ok(/"js\/world\.js", "js\/cheat\.js"\]/.test(H)&&/'js\/cheat\.js'/.test(SW),'world.html loads cheat.js last (the Mod Jalan-jalan page only); sw.js caches it');
ok(!/index\.html|kantin\.html|padang\.html|kelas\.html|luar\.html/.test(SW.match(/PRE=\[[^\]]*\]/)[0].match(/cheat/)||'')&&!['index.html','kantin.html','padang.html','kelas.html','luar.html'].some(f=>rd(f).includes('cheat.js')),'no other page loads cheat.js');
ok(!/cheat/i.test(R.slice(R.indexOf('## Pusingan 19h')))&&!/\bAKU[A-Z]{3,}|kod rahsia|kod tipu|kod pemilik/.test(R.slice(R.indexOf('## Pusingan 19h'))),'the README entry for this round does not talk about codes');
const others=fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js')&&f!='cheat.js').map(f=>[f,rd('js/'+f)]);
for(const n of['CHT'])ok(!others.some(([f,s])=>new RegExp('\\b'+n+'\\b').test(s)),'name '+n+' is not used by other scripts');
console.log(fail?fail+' FAILED, '+pass+' passed':'all '+pass+' checks passed'+(skip?' (code checks skipped)':''));process.exit(fail?1:0);
