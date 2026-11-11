/* Node test for the pure spelling logic (js/kelas-spell-data.js + QCFG). Run: node tools/test-spell.js  (no browser, no DOM) */
const fs=require('fs'),vm=require('vm'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(R('js/kelas-quiz-data.js')+R('js/kelas-spell-data.js')+';this.E={SPB,SPL,SPCFG,QCFG,quizGrade}',ctx);
const {SPB,SPL,SPCFG,quizGrade}=ctx.E;let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const all=[].concat(...Object.values(SPB));
ok(new Set(all).size===all.length,'no duplicate word inside or across levels');
ok(Object.values(SPB).every(b=>b.length>=40),'every bank has 40+ words');
ok(all.every(w=>/^[a-z]+$/.test(w)),'words are lower-case letters only');
console.log('bank sizes',Object.entries(SPB).map(([k,v])=>k+'='+v.length).join(' '));
for(const l of Object.keys(SPB)){let bad=0;const seen=new Set();
 for(let t=0;t<500;t++){const s=SPL.newSession(l);if(s.qs.length!==10||new Set(s.qs.map(q=>q.word)).size!==10)bad++;
  s.qs.forEach(q=>{seen.add(q.word);const L=q.word.length,h=q.cells.filter(c=>!c.lock).length,[a,b]=SPCFG.hide[l];
   if(!SPB[l].includes(q.word.toLowerCase()))bad++;if(!q.cells[0].lock)bad++;if(h<1||h>b)bad++;if(L-h<Math.ceil(L*.3))bad++;if(h<a&&L-Math.ceil(L*.3)>=a)bad++;
   if(q.cells.some(c=>c.lock&&c.ch!==q.word[q.cells.indexOf(c)]))bad++;if(q.sel!==SPL.firstEmpty(q))bad++})}
 ok(bad===0,l+': 10 unique words, own bank, hidden-letter rules ('+bad+' violations)');ok(seen.size>25,l+': sessions vary ('+seen.size+' different words seen)')}
/* two sessions differ; one session is stable */
const a=SPL.newSession('sukar'),b=SPL.newSession('sukar');ok(a.qs.map(q=>q.word).join()!==b.qs.map(q=>q.word).join(),'new session picks a new set');
const snap=JSON.stringify(a.qs.map(q=>q.cells.map(c=>c.lock)));SPL.type(SPL.cur(a),'x');SPL.clear(SPL.cur(a));ok(snap===JSON.stringify(a.qs.map(q=>q.cells.map(c=>c.lock))),'typing/clearing never changes which boxes are hidden');
/* letter box behaviour on a fixed word: BEAUTIFUL with E (1) and U (3) hidden */
const mk=()=>{const q=SPL.makeQ('beautiful','mudah',()=>0);q.cells.forEach((c,i)=>{c.lock=!(i==1||i==3);c.ch=c.lock?q.word[i]:''});q.sel=1;return q};
let q=mk(),s={qs:[q],i:0,marks:0,done:false};
ok(!SPL.type(q,'1')&&!SPL.type(q,' ')&&!SPL.type(q,'ab')&&!SPL.type(q,''),'only one letter A-Z accepted');
ok(SPL.type(q,'e')&&q.cells[1].ch==='E'&&q.sel===3,'lower case shows upper case and selection jumps to next empty box');
ok(!SPL.select(q,0)&&q.sel===3,'locked box cannot be selected');ok(SPL.select(q,1),'filled box can be selected again');
SPL.type(q,'o');ok(q.cells[1].ch==='O'&&q.sel===3,'replacing a letter works and selection goes to the next empty box');
ok(SPL.submit(s).r==='incomplete'&&q.status==='play'&&s.marks===0,'submit with an empty box is refused, nothing locked');
SPL.type(q,'u');ok(q.cells[3].ch==='U'&&q.sel===3,'after the last empty box the selection stays put');
ok(SPL.backspace(q)&&q.cells[3].ch==='','backspace clears the selected letter');ok(SPL.backspace(q)&&q.sel===1&&q.cells[1].ch==='','backspace on an empty box goes back to the previous editable box and clears it');
ok(q.cells.filter(c=>c.lock).length===7&&q.word==='BEAUTIFUL','locked letters and the target word untouched');
SPL.type(q,'e');SPL.type(q,'u');SPL.clear(q);ok(q.cells.every(c=>c.lock||!c.ch)&&q.sel===1&&q.cells[0].ch==='B','CLEAR removes only player letters and selects the first empty box');
SPL.type(q,'e');SPL.type(q,'u');const r1=SPL.submit(s);ok(r1.r==='ok'&&s.marks===1&&q.status==='ok','correct spelling accepted (+1)');
ok(SPL.submit(s).r==='locked'&&s.marks===1,'cannot score twice');ok(!SPL.type(q,'a')&&!SPL.backspace(q)&&!SPL.clear(q)&&!SPL.select(q,1)&&!SPL.timeout(s),'answer locked after submit');
q=mk();s={qs:[q,mk()],i:0,marks:0,done:false};SPL.type(q,'e');SPL.type(q,'a');ok(SPL.submit(s).r==='no'&&q.ans!==q.word,'wrong spelling rejected');ok(q.status==='no'&&s.marks===0,'wrong spelling gives 0');
ok(SPL.advance(s)&&s.i===1,'advance after answer');ok(!SPL.advance(s),'cannot advance an unanswered question');
/* timeout: complete word typed but time over = no mark, locked */
q=mk();s={qs:[q],i:0,marks:0,done:false};SPL.type(q,'e');SPL.type(q,'u');ok(SPL.timeout(s)&&q.status==='time'&&s.marks===0,'timeout gives no mark even with a complete word');ok(SPL.submit(s).r==='locked'&&s.marks===0&&!SPL.type(q,'a'),'no input or submit after timeout');ok(SPL.advance(s)&&s.done,'next after timeout (last question ends the session)');
q=mk();s={qs:[q],i:0,marks:0,done:false};SPL.timeout(s);ok(q.ans==='B_A_TIFUL','timed-out answer shown with _ for empty boxes');
/* hint: one per round, reveals one correct letter, locks it, keeps the point available */
q=mk();s={qs:[q,mk()],i:0,marks:0,done:false,hints:1};SPL.select(q,3);SPL.type(q,'x');SPL.select(q,3);ok(SPL.hint(s)===3&&q.cells[3].lock&&q.cells[3].ch==='U'&&s.hints===0&&q.hinted,'hint reveals the selected (wrong) letter and locks it');
ok(SPL.hint(s)===-1&&s.hints===0,'only one hint per round');SPL.type(q,'e');ok(SPL.submit(s).r==='ok'&&s.marks===1,'a hinted word still scores the point');
q=mk();s={qs:[q],i:0,marks:0,done:false,hints:1};SPL.type(q,'e');SPL.type(q,'u');ok(SPL.hint(s)===-1&&s.hints===1,'no hint wasted on a correct word');
q=mk();s={qs:[q],i:0,marks:0,done:false,hints:1};SPL.timeout(s);ok(SPL.hint(s)===-1,'no hint after the word is over');
ok(SPL.newSession('mudah').hints===1&&SPCFG.time.mudah===30&&SPCFG.time.sederhana===25&&SPCFG.time.sukar===25,'new session has 1 hint; timers 30/25/25');
/* streak bonus: Easy every 3, Medium/Hard every 2, no cap; wrong, timeout or hint on the word resets it */
const fill=(s,good)=>{const qq=SPL.cur(s);qq.cells.forEach((c,i)=>{if(!c.lock)c.ch=good?qq.word[i]:(qq.word[i]=='Z'?'Y':'Z')});return SPL.submit(s)};
{const s=SPL.newSession('mudah');const b=[];for(let k=0;k<9;k++){b.push(fill(s,true).bonus);SPL.advance(s)}ok(b.join()==='false,false,true,false,false,true,false,false,true'&&s.hints===4&&s.marks===9,'Easy: +1 hint after every 3 correct in a row (3 bonuses over 9 words, no cap: 1+3=4 hints)')}
{const s=SPL.newSession('sederhana');const b=[];for(let k=0;k<6;k++){b.push(fill(s,true).bonus);SPL.advance(s)}ok(b.join()==='false,true,false,true,false,true'&&s.hints===4,'Medium: +1 hint after every 2 correct in a row')}
{const s=SPL.newSession('sukar');fill(s,true);SPL.advance(s);ok(s.streak===1,'Hard: streak counts');fill(s,false);ok(s.streak===0&&s.hints===1,'wrong answer resets the streak');SPL.advance(s);fill(s,true);SPL.advance(s);SPL.timeout(s);ok(s.streak===0,'time-out resets the streak');SPL.advance(s);
 fill(s,true);SPL.advance(s);ok(s.streak===1,'streak restarts after a reset');const q2=SPL.cur(s);SPL.hint(s);ok(s.streak===0&&s.hints===0,'using a hint resets the streak');const r=fill(s,true);ok(r.r==='ok'&&!r.bonus&&s.streak===0,'a hinted word scores the point but does not build the streak');SPL.advance(s);
 fill(s,true);SPL.advance(s);const r2=fill(s,true);ok(r2.bonus&&s.hints===1&&s.streak===0,'a clean streak of 2 after that earns the hint again')}
/* arrows */
q=mk();ok(SPL.move(q,1)&&q.sel===3&&!SPL.move(q,1)&&SPL.move(q,-1)&&q.sel===1&&!SPL.move(q,-1),'arrow keys hop between editable boxes only');
/* a full session score = number of correct answers, and grades follow the Matematik scale */
for(const [m,g,p] of [[10,'A+',1],[9,'A',1],[8,'B+',1],[7,'B',1],[6,'C',1],[5,'Gagal',0],[0,'Gagal',0]]){const x=quizGrade(m);ok(x.g===g&&x.pass===!!p&&x.pct===m*10,'grade '+m+'/10 = '+g)}
const ss=SPL.newSession('sederhana');let want=0;ss.qs.forEach((qq,k)=>{if(k%2==0){qq.cells.forEach((c,i)=>{if(!c.lock)c.ch=qq.word[i]});want++}else qq.cells.forEach(c=>{if(!c.lock)c.ch='Z'});SPL.submit(ss);SPL.advance(ss)});
ok(ss.done&&ss.marks===want,'full session: score '+ss.marks+'/10 equals the correct answers ('+want+')');
console.log(fail?fail+' FAILED':'all '+pass+' checks passed');process.exit(fail?1:0);
