/* Round 10d: English Spelling Challenge, data + pure logic (no DOM, so it can be tested in Node). Screen: js/kelas-spell.js.
   Word banks: one word lives in ONE level only, British spelling, all stored in lower case (shown in capitals).
   Levels use the game's keys (mudah / sederhana / sukar) = Easy / Medium / Hard. Grade scale and pass mark come from QCFG in js/kelas-quiz-data.js.
   Randomness happens ONCE in newSession(): 10 unique words and their hidden letters are fixed for the whole session.
   Round 10d2: timers 30/25/25 s; hidden letters Easy 1-2, Medium 2-3, Hard 3-4 (by word length); 1 free hint per round (reveals one letter, the point still counts). Round 10d4: hint bonus for streaks: Easy every 3 correct words in a row, Medium and Hard every 2, no cap; a wrong answer, a time-out or a hint used on a word resets the streak; the first letter is always shown; at least 30% of the letters stay visible. */
const SPCFG={n:10,time:{mudah:30,sederhana:25,sukar:25},hide:{mudah:[1,2],sederhana:[2,3],sukar:[3,4]},hints:1,streak:{mudah:3,sederhana:2,sukar:2},minShow:.3};
const SPLV={mudah:'Easy',sederhana:'Medium',sukar:'Hard'};
const SPB={
mudah:'apple school teacher friend family garden yellow rabbit window pencil morning chicken orange happy water little flower sunday mother picture animal basket pocket dinner birthday market number monkey purple sister brother kitchen bedroom holiday kitten blanket bottle summer winter rainbow'.split(' '),
sederhana:'beautiful because different favourite library vegetable together important remember calendar adventure wonderful tomorrow exercise chocolate mountain hospital question sentence journey surprise dangerous delicious straight complete february popular excellent beginning separate knowledge necessary describe although whisper curious discover celebrate comfortable temperature environment'.split(' '),
sukar:'accommodation achievement pronunciation independent opportunity perseverance responsibility extraordinary imagination communication determination appreciation competition curiosity recommendation mischievous privilege exaggerate convenience immediately questionnaire embarrassing sufficient guarantee maintenance conscious rhythm colleague fluorescent entrepreneur magnificent miscellaneous enthusiasm interference existence intelligence exaggeration unfamiliar successfully particularly unnecessary acknowledge apparent occasionally restaurant discipline dictionary'.split(' ')};
const SPL=(()=>{
const ri=(a,b,r)=>a+Math.floor(r()*(b-a+1));
function shuffle(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
/* how many letters to hide: by length, inside the level's band, never more than leaves minShow visible */
function hideCount(L,level,r){const b=SPCFG.hide[level];let n;
 if(level=='mudah')n=L<=5?1:ri(1,2,r);
 else if(level=='sederhana')n=L<=6?2:L<=8?ri(2,3,r):3;
 else n=L<=8?3:L<=11?ri(3,4,r):4;
 n=Math.max(b[0]>L-2?1:b[0],Math.min(n,b[1]));const cap=Math.max(1,Math.min(L-Math.ceil(L*SPCFG.minShow),L-1));return Math.max(1,Math.min(n,cap))}
function makeQ(word,level,r){const w=word.toUpperCase(),L=w.length,h=hideCount(L,level,r),idx=shuffle([...Array(L-1).keys()].map(i=>i+1),r).slice(0,h),hid=new Set(idx);
 return{word:w,cells:w.split('').map((c,i)=>hid.has(i)?{ch:'',lock:false}:{ch:c,lock:true}),sel:0,status:'play',ans:''}}
function firstEmpty(q){return q.cells.findIndex(c=>!c.lock&&!c.ch)}
function nextEmpty(q,from){for(let i=from+1;i<q.cells.length;i++)if(!q.cells[i].lock&&!q.cells[i].ch)return i;return firstEmpty(q)}
function newSession(level,r){r=r||Math.random;const bank=SPB[level];if(!bank)return null;const qs=shuffle(bank,r).slice(0,SPCFG.n).map(w=>makeQ(w,level,r));qs.forEach(q=>{q.sel=firstEmpty(q)});return{level,qs,i:0,marks:0,done:false,sec:SPCFG.time[level],hints:SPCFG.hints,streak:0}}
const cur=s=>s.qs[s.i];
function select(q,i){if(q.status!='play'||i<0||i>=q.cells.length||q.cells[i].lock)return false;q.sel=i;return true}
function type(q,ch){if(q.status!='play'||typeof ch!='string'||!/^[a-zA-Z]$/.test(ch))return false;const c=q.cells[q.sel];if(!c||c.lock)return false;c.ch=ch.toUpperCase();const n=nextEmpty(q,q.sel);if(n>=0)q.sel=n;return true}
function backspace(q){if(q.status!='play')return false;const c=q.cells[q.sel];if(c&&!c.lock&&c.ch){c.ch='';return true}
 for(let i=q.sel-1;i>=0;i--)if(!q.cells[i].lock){q.sel=i;q.cells[i].ch='';return true}return false}
function move(q,d){if(q.status!='play')return false;for(let i=q.sel+d;i>=0&&i<q.cells.length;i+=d)if(!q.cells[i].lock){q.sel=i;return true}return false}
function clear(q){if(q.status!='play')return false;q.cells.forEach(c=>{if(!c.lock)c.ch=''});q.sel=firstEmpty(q);return true}
const text=q=>q.cells.map(c=>c.ch||'_').join('');
/* submit: 'locked' (already answered) | 'incomplete' (a box is empty, nothing is locked) | 'ok' | 'no'. Marks come only from here. */
function submit(s){const q=cur(s);if(q.status!='play')return{r:'locked'};if(q.cells.some(c=>!c.lock&&!c.ch))return{r:'incomplete'};
 q.ans=q.cells.map(c=>c.ch).join('');const ok=q.ans.toUpperCase()===q.word;q.status=ok?'ok':'no';let bonus=false;
 if(ok){s.marks++;if(q.hinted)s.streak=0;else{s.streak++;if(s.streak>=SPCFG.streak[s.level]){s.hints++;s.streak=0;bonus=true}}}else s.streak=0;return{r:q.status,bonus}}
/* timeout: no mark even if the word is complete; the answer stays as typed ('_' = empty) */
function timeout(s){const q=cur(s);if(q.status!='play')return false;q.ans=text(q);q.status='time';s.streak=0;return true}
/* hint: reveals ONE letter (the selected box if it is empty or wrong, else the first empty, else the first wrong one) and locks it. Costs the round's free hint, never the point. Returns the box index or -1. */
function hint(s){const q=cur(s);if(q.status!='play'||s.hints<1)return -1;const bad=i=>{const c=q.cells[i];return!c.lock&&c.ch!==q.word[i]};let t=bad(q.sel)&&q.cells[q.sel]&&!q.cells[q.sel].lock?q.sel:q.cells.findIndex((c,i)=>!c.lock&&!c.ch);if(t<0)t=q.cells.findIndex((c,i)=>bad(i));if(t<0)return -1;
 q.cells[t]={ch:q.word[t],lock:true};q.hinted=true;s.hints--;s.streak=0;const e=firstEmpty(q);if(e>=0)q.sel=e;else{let k=q.cells.findIndex(c=>!c.lock);if(k>=0)q.sel=k}return t}
function advance(s){if(cur(s).status=='play'||s.done)return false;if(s.i>=s.qs.length-1)s.done=true;else s.i++;return true}
return{newSession,select,type,backspace,move,clear,submit,timeout,hint,advance,cur,text,hideCount,makeQ,firstEmpty}})();
