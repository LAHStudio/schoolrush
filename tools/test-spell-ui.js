/* Smoke test of js/kelas-spell.js on a tiny fake DOM (Node only, NOT a real browser): menu -> play -> submit/timeout -> results, Mod Kelas level lock, close stops the timer. Run: node tools/test-spell-ui.js */
const fs=require('fs'),vm=require('vm'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let intervals=0,timers=new Map(),tnow=1e6,tid=1;
class El{constructor(t){this.tagName=t.toUpperCase();this.children=[];this.className='';this._t='';this.style={setProperty(){}};this.dataset={};this.attrs={};this.listeners={};this.disabled=false;this.value='';this.clientWidth=360;this.clientHeight=640;this.classList={toggle:(c,f)=>{const a=this.className.split(' ').filter(Boolean);const i=a.indexOf(c);if(f&&i<0)a.push(c);if(!f&&i>=0)a.splice(i,1);this.className=a.join(' ')},remove:c=>this.classList.toggle(c,false)}}
 append(...n){n.forEach(x=>{if(x&&x.parent)x.parent.children=x.parent.children.filter(y=>y!==x);x.parent=this;this.children.push(x)})}appendChild(x){this.append(x)}remove(){if(this.parent)this.parent.children=this.parent.children.filter(y=>y!==this)}
 set innerHTML(v){this.children.forEach(c=>c.parent=null);this.children=[];this._t=''}get innerHTML(){return''}set textContent(v){this._t=String(v);this.children=[]}get textContent(){return this._t+this.children.map(c=>c.textContent).join('')}
 setAttribute(k,v){this.attrs[k]=v}addEventListener(e,f){this.listeners[e]=f}focus(){globalThis.__focus=this}blur(){}click(){if(this.onclick&&!this.disabled)this.onclick()}
 all(){return this.children.flatMap(c=>[c,...c.all()])}has(c){return this.className.split(' ').includes(c)}querySelector(s){const m=s.startsWith('.')?(e=>e.has(s.slice(1))):(e=>s=='button:not(:disabled)'?e.tagName=='BUTTON'&&!e.disabled:e.tagName==s.toUpperCase()||false);return this.all().find(m)||null}}
const body=new El('body'),docL={},winL={};
const ctx={document:{createElement:t=>new El(t),body,head:new El('head'),hidden:false,addEventListener:(e,f)=>{docL[e]=f},removeEventListener:e=>{delete docL[e]}},addEventListener:(e,f)=>{winL[e]=f},removeEventListener:e=>{delete winL[e]},window:{},
 setInterval:(f,ms)=>{const i=tid++;timers.set(i,f);return i},clearInterval:i=>timers.delete(i),Date:{now:()=>tnow},tone(){},cur:{quiz:{}},save(){},Math,console,Set,JSON,Object,Array,String,Number,parseInt,isNaN};
ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(R('js/kelas-quiz-data.js')+R('js/kelas-spell-data.js')+'function recQuiz(sub,level,marks){cur.quiz=cur.quiz||{};const q=cur.quiz[sub]=cur.quiz[sub]||{},r=q[level]=q[level]||{best:0,n:0};r.n++;if(marks>=r.best||!r.g){r.best=Math.max(r.best,marks);r.g=quizGrade(r.best).g}return r}'+R('js/kelas-spell.js')+';this.T={SP,SPL}',ctx);
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
let root;const btn=t=>root.all().find(e=>e.tagName=='BUTTON'&&e.textContent==t),key=(k,x)=>winL.keydown(Object.assign({key:k,preventDefault(){},stopPropagation(){},target:{tagName:'DIV'}},x||{})),tick=()=>[...timers.values()].forEach(f=>f()),sec=s=>{tnow+=s*1000;tick()};
let done=null,closed=0;const {SP,SPL}=ctx.T;
SP.open({sub:'eng',lock:'sederhana',onClose:()=>closed++,onDone:r=>done=r});root=body.children[0];
ok(SP.isOpen()&&root.textContent.includes('English Spelling Challenge'),'menu shows title');
const lvs=root.all().filter(e=>e.has('lv'));ok(lvs.length==3&&lvs.filter(e=>e.disabled).length==2&&!lvs[1].disabled,'Mod Kelas: only the level of the slot (Medium) is open');
key('1');ok(root.querySelector('.tb')===null,'locked level key does nothing');
lvs[1].click();ok(root.textContent.includes('Question 1 / 10')&&root.textContent.includes('Score: 0'),'level starts question 1/10');
let q=()=>root.all().filter(e=>e.has('bx')),first=q();ok(first.length>0&&first.every((b,i)=>true)&&timers.size==1,'boxes drawn, exactly one timer');
/* type via keyboard into the selected box and watch the DOM */
const boxes=q(),empties=boxes.filter(b=>b.has('em'));ok(empties.length>=2&&empties.length<=3,'medium hides 2-3 letters ('+empties.length+')');
key('q');ok(boxes.filter(b=>b.has('fl')).length==1&&boxes.filter(b=>b.has('fl'))[0].textContent=='Q','typed letter appears in a box, upper case');
key('Backspace');ok(boxes.filter(b=>b.has('fl')).length==0,'backspace clears it');
const kk=l=>root.all().find(e=>e.has('kk')&&e.textContent==l);ok(root.all().filter(e=>e.has('kk')).length==27&&kk('DEL'),'on-screen keys: 26 letters + DEL');
kk('Q').click();ok(boxes.filter(b=>b.has('fl')).length==1&&boxes.filter(b=>b.has('fl'))[0].textContent=='Q','tapping an on-screen key puts the letter in the selected box');
const sel=boxes.find(b=>b.has('sl'));ok(sel&&sel.has('em'),'selection moved on to the next empty box');kk('DEL').click();ok(boxes.filter(b=>b.has('fl')).length==0,'DEL key clears it');
ok(!root.all().some(e=>e.tagName=='INPUT'),'no text input = no phone keyboard');
ok(root.textContent.includes('Streak 0/2'),'streak badge shows Streak 0/2 on Medium');const hb=btn('Hint (1)');ok(hb&&!hb.disabled,'hint button shows 1 left');hb.click();ok(btn('Hint (0)').disabled&&root.textContent.includes('Hint used')&&boxes.filter(b=>b.has('em')).length==empties.length-1,'hint reveals one letter and uses up the hint');key('Backspace');
btn('Submit Answer').click();ok(root.textContent.includes('Please fill every empty box'),'submit with empty boxes asks to finish');
btn('Clear').click();ok(timers.size==1,'clear does not touch the timer');
sec(26);ok(root.textContent.includes("Time's up!")&&root.textContent.includes('The correct spelling is')&&btn('Next')&&timers.size==0,'timeout: message, correct spelling, Next button, timer stopped');
key('a');ok(boxes.every(b=>!b.has('fl')),'no typing after timeout');
ok(root.all().find(e=>e.has('kb')).has('off'),'keys switch off when the word is over');btn('Next').click();ok(root.textContent.includes('Question 2 / 10')&&timers.size==1,'Next -> question 2 with a fresh single timer');
/* Exit dialog pauses the timer */
btn('Exit').click();ok(root.textContent.includes('Leave the game?')&&timers.size==0,'exit dialog pauses timer');btn('Keep Playing').click();ok(timers.size==1&&!root.textContent.includes('Leave the game?'),'keep playing resumes it');
btn('Exit').click();btn('Leave').click();ok(root.textContent.includes('Choose a level')||root.textContent.includes('Your level'),'leave goes back to the menu');ok(timers.size==0&&done==null,'timer stopped, nothing saved');
/* full round: answer everything wrong by timeout except we also test a correct one via the real word shown after a wrong answer */
root.all().filter(e=>e.has('lv'))[1].click();
let correct=0;for(let n=0;n<10;n++){const bx=q();const w0=bx.map(b=>b.textContent);
 /* learn the word: submit wrong first on odd questions, timeout on even; on n%3==0 we cheat by reading the bank */
 if(n%3==0){ /* find word by matching locked letters in bank */ const pat=bx.map(b=>b.has('lk')?b.textContent:'.').join('');const rx=new RegExp('^'+pat+'$','i');const cand=ctx.T&&vm.runInContext('SPB.sederhana',ctx).filter(w=>rx.test(w));bx.forEach(b=>{});
  const idx=bx.map((b,i)=>b.has('lk')?-1:i).filter(i=>i>=0);idx.forEach(i=>{bx[i].click();key(cand[0][i])});btn('Submit Answer').click();const good=root.textContent.includes('+1 point');if(good)correct++;ok(good||cand.length>1,'correct word accepted (candidates '+cand.length+')')}
 else if(n%3==1){bx.filter(b=>b.has('em')).forEach((b,i)=>{b.click();key('z')});btn('Submit Answer').click();ok(root.textContent.includes('Not quite!'),'wrong spelling rejected')}
 else sec(26);
 btn(n==9?'See Results':'Next').click()}
ok(root.textContent.includes('English Spelling Challenge · Medium')&&root.textContent.includes('Correct: '+correct),'results screen: title, level, correct count ('+correct+')');
ok(done&&done.sub=='eng'&&done.level=='sederhana'&&done.marks==correct,'onDone result carries sub, level and marks');ok(ctx.cur.quiz.eng.sederhana.best==correct,'best saved under cur.quiz.eng');
ok(root.all().filter(e=>e.has('rr')).length==10,'review lists all 10 words');ok(btn('Play Again')&&btn('Back to Level Selection'),'result buttons');
btn('Play Again').click();ok(root.textContent.includes('Question 1 / 10')&&root.textContent.includes('Score: 0')&&timers.size==1,'play again starts a clean session');
SP.close();ok(timers.size==0&&closed==1&&!SP.isOpen(),'close stops the timer and calls onClose');
SP.open({sub:'eng',lock:'sederhana'});root.all().filter(e=>e.has('lv'))[1].click();
{const solve=()=>{const bx=q(),pat=bx.map(b=>b.has('lk')?b.textContent:'.').join(''),rx=new RegExp('^'+pat+'$','i'),cand=vm.runInContext('SPB.sederhana',ctx).filter(w=>rx.test(w));bx.forEach((b,i)=>{if(!b.has('lk')){b.click();key(cand[0][i])}});btn('Submit Answer').click()};
 solve();ok(!root.textContent.includes('Hint earned')&&root.textContent.includes('Streak 1/2'),'first clean word: streak 1/2, no bonus yet');btn('Next').click();
 solve();ok(root.textContent.includes('+1 Hint earned!'),'second clean word shows +1 Hint earned!');btn('Next').click();ok(root.textContent.includes('Hint (2)')&&root.textContent.includes('Streak 0/2'),'hint stack is 2 and the streak restarts')}
SP.close();
SP.open({sub:'eng',lock:null});ok(root.all().filter(e=>e.has('lv')&&!e.disabled).length==3,'Mod Jalan-jalan: all 3 levels open');SP.close();
console.log(fail?fail+' FAILED':'all '+pass+' UI checks passed');process.exit(fail?1:0);
