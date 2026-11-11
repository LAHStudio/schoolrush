/* Round 10f: checks for Susun Ayat Bahasa Melayu (Node only, fake DOM, NOT a real browser): bank vs the official sentence list, sessions, mechanics, streak/hints, grades, and the screen (tap, drag, check, results, Mod Kelas lock). Run: node tools/test-susun.js */
const fs=require('fs'),vm=require('vm'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const EXP={mudah:['Ali membaca buku.','Ibu memasak nasi.','Adik minum susu.','Kucing itu tidur.','Ayah membasuh kereta.','Siti menyapu lantai.','Murid itu menulis.','Kakak memakai kasut.','Burung itu terbang.','Amin menendang bola.','Nenek menanam bunga.','Adik membuka pintu.','Kami makan bersama.','Pelajar itu rajin.','Mereka bermain bola.'],
sederhana:['Adik membaca buku cerita di bilik.','Ibu membeli sayur segar di pasar.','Murid-murid membersihkan kelas pada waktu pagi.','Ayah membaiki basikal adik di halaman rumah.','Kucing putih itu tidur di bawah meja.','Kami bermain badminton selepas waktu sekolah.','Pasukan sekolah kami memenangi pertandingan bola sepak.','Kakak menyusun buku-buku di atas rak.','Datuk menyiram pokok bunga setiap petang.','Para pekerja membina jambatan berhampiran sungai.','Siti membawa bekal makanan ke sekolah.','Penduduk kampung bergotong-royong membersihkan balai raya.','Adik memakai baju hujan ketika hujan turun.','Burung-burung kecil hinggap pada dahan pokok.','Guru besar menyampaikan hadiah kepada para pemenang.'],
sukar:['Kami berehat di dalam kelas kerana hujan turun dengan lebat.','Walaupun penat, para peserta meneruskan latihan sehingga tamat.','Ibu menyediakan sarapan sebelum kami bertolak ke sekolah.','Murid-murid mengutip sampah supaya kawasan sekolah sentiasa bersih.','Setelah loceng berbunyi, semua murid beratur di luar kelas.','Kami menanam pokok supaya udara di sekeliling menjadi lebih segar.','Kakak menyimpan wang sakunya agar dapat membeli sebuah kamus baharu.','Walaupun cuaca panas, para petani tetap bekerja di sawah.','Ayah menutup semua tingkap sebelum meninggalkan rumah.','Jika kita menjaga kebersihan, persekitaran akan menjadi lebih sihat.','Para sukarelawan membantu mangsa banjir ketika air mula surut.','Selepas pertandingan berakhir, para peserta menerima sijil penyertaan.','Farah membaca arahan dengan teliti sebelum menjawab semua soalan.','Walaupun menghadapi kesukaran, Amir terus berusaha menyiapkan tugasan.','Kita hendaklah menghormati orang yang lebih tua supaya hubungan kekeluargaan sentiasa harmoni.']};
let timers=0;
class El{constructor(t){this.tagName=t.toUpperCase();this.children=[];this.className='';this._t='';this.style={setProperty(){}};this.dataset={};this.attrs={};this.disabled=false;this._r=null;this.classList={toggle:(c,f)=>{const a=this.className.split(' ').filter(Boolean),i=a.indexOf(c);if(f===undefined)f=i<0;if(f&&i<0)a.push(c);if(!f&&i>=0)a.splice(i,1);this.className=a.join(' ')},add:(...cs)=>cs.forEach(c=>this.classList.toggle(c,true)),remove:(...cs)=>cs.forEach(c=>this.classList.toggle(c,false))}}
 append(...n){n.forEach(x=>{if(x&&x.parent)x.parent.children=x.parent.children.filter(y=>y!==x);x.parent=this;this.children.push(x)})}appendChild(x){this.append(x)}remove(){if(this.parent)this.parent.children=this.parent.children.filter(y=>y!==this)}
 set innerHTML(v){this.children.forEach(c=>c.parent=null);this.children=[];this._t=''}get innerHTML(){return''}set textContent(v){this._t=String(v);this.children=[]}get textContent(){return this._t+this.children.map(c=>c.textContent).join('')}
 setAttribute(k,v){this.attrs[k]=v}removeAttribute(k){delete this.attrs[k]}addEventListener(){}focus(){}blur(){}click(){if(this.onclick&&!this.disabled)this.onclick({detail:1})}setPointerCapture(){}releasePointerCapture(){}
 cloneNode(){const e=new El(this.tagName);e.className=this.className;e._t=this.textContent;return e}getBoundingClientRect(){return this._r||{left:0,top:0,right:0,bottom:0,width:0,height:0}}
 all(){return this.children.flatMap(c=>[c,...c.all()])}has(c){return this.className.split(' ').includes(c)}
 querySelector(s){return this.querySelectorAll(s)[0]||null}
 querySelectorAll(s){const m=s=='.pc:not(.dg)'?(e=>e.has('pc')&&!e.has('dg')):s.startsWith('.')?(e=>e.has(s.slice(1))):(e=>s=='button:not(:disabled)'?e.tagName=='BUTTON'&&!e.disabled:false);return this.all().filter(m)}}
const body=new El('body'),winL={};
const ctx={document:{createElement:t=>new El(t),body,head:new El('head'),addEventListener(){},removeEventListener(){}},addEventListener:(e,f)=>{winL[e]=f},removeEventListener:e=>{delete winL[e]},setTimeout:()=>0,tone(){},cur:{quiz:{}},save(){},Math,console,Set,JSON,Object,Array,String,Number,parseInt,isNaN};
ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(R('js/kelas-quiz-data.js')+R('js/kelas-susun-data.js')+'function recQuiz(sub,level,marks){cur.quiz=cur.quiz||{};const q=cur.quiz[sub]=cur.quiz[sub]||{},r=q[level]=q[level]||{best:0,n:0};r.n++;if(marks>=r.best||!r.g){r.best=Math.max(r.best,marks);r.g=quizGrade(r.best).g}return r}'+R('js/kelas-susun.js')+';this.T={SUS,SUSL,SUSB,SUSCFG,SUSLV,QCFG,quizGrade}',ctx);
const {SUS,SUSL,SUSB,SUSCFG,SUSLV,quizGrade}=ctx.T;let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
function seeded(n){let a=n>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
/* ---- A. bank ---- */
const ids=new Set();ok(JSON.stringify(Object.keys(SUSB))==JSON.stringify(['mudah','sederhana','sukar'])&&Object.keys(SUSLV).length==3,'exactly three levels');
Object.keys(SUSB).forEach(l=>{const b=SUSB[l];ok(b.length==15,l+': 15 sentences');b.forEach((e,i)=>{const s=e[1].join(' ');ok(s===EXP[l][i],l+' '+e[0]+' matches the official sentence: '+s);ok(!ids.has(e[0]),'unique id '+e[0]);ids.add(e[0]);
 ok(e[1].every(t=>t.length>0&&t==t.trim()),e[0]+' pieces clean');ok(/\.$/.test(e[1][e[1].length-1]),e[0]+' ends with a full stop');ok(/^[A-Z]/.test(e[1][0]),e[0]+' starts with a capital');ok(e[0][0]==({mudah:'E',sederhana:'M',sukar:'H'})[l],e[0]+' id prefix');
 ok(e[1].length>=(l=='mudah'?3:3)&&e[1].length<=9,e[0]+' piece count '+e[1].length)})});
ok(SUSB.mudah.every(e=>e[1].length==3),'Mudah: every question has 3 single-word pieces');ok(SUSB.mudah.every(e=>e[1].every(t=>!t.includes(' '))),'Mudah: no piece holds two words');
/* ---- B. sessions ---- */
Object.keys(SUSB).forEach(l=>{for(let n=1;n<=150;n++){const s=SUSL.newSession(l,seeded(n));const qid=s.qs.map(q=>q.id);
 if(qid.length!=10||new Set(qid).size!=10||!qid.every(i=>SUSB[l].some(e=>e[0]==i))){ok(false,l+' session '+n+' wrong');break}
 const bad=s.qs.find(q=>{const ord=q.order.map(i=>SUSL.tx(q,i)).join('|'),right=q.pcs.map(p=>p.t).join('|');return ord===right||new Set(q.order).size!=q.pcs.length||new Set(q.pcs.map(p=>p.id)).size!=q.pcs.length||q.order.some(i=>!q.pcs.some(p=>p.id==i))});
 if(bad){ok(false,l+' session '+n+' shuffle/ids '+bad.id);break}if(n==150)ok(true,l+': 150 seeded sessions = 10 unique questions, own bank, never shown in the right order')}});
const sets=new Set();for(let n=1;n<=40;n++)sets.add(SUSL.newSession('mudah',seeded(n)).qs.map(q=>q.id).join());ok(sets.size>25,'random sessions differ (restart gives a new set)');
ok(SUSL.newSession('x')===null,'unknown level gives null');
/* ---- C. mechanics ---- */
function sess(l,seed){return SUSL.newSession(l,seeded(seed||7))}
const right=(s)=>{const q=SUSL.cur(s);q.slots=[];q.pcs.forEach(p=>SUSL.place(q,p.id))},wrong=(s)=>{const q=SUSL.cur(s);q.slots=[];q.pcs.slice().reverse().forEach(p=>SUSL.place(q,p.id))};
let s=sess('sederhana');s.qs[0]=SUSL.makeQ(SUSB.sederhana[0],seeded(2)); /* M01 has 4 pieces */
let q=SUSL.cur(s);const p0=q.pcs[0].id;
ok(SUSL.place(q,p0)&&!SUSL.place(q,p0)&&q.slots.length==1,'a piece can be placed only once');ok(!SUSL.pool(q).includes(p0)&&SUSL.pool(q).length==q.pcs.length-1,'placed piece leaves the pool');
ok(SUSL.unplace(q,p0)&&q.slots.length==0&&SUSL.pool(q).includes(p0),'piece returns to the pool');ok(!SUSL.place(q,'zzz'),'unknown piece refused');
SUSL.place(q,q.pcs[0].id);SUSL.place(q,q.pcs[1].id);SUSL.place(q,q.pcs[2].id,0);ok(q.slots[0]==q.pcs[2].id,'place at an index');ok(SUSL.move(q,q.pcs[2].id,2)&&q.slots[2]==q.pcs[2].id,'move inside the answer');
ok(SUSL.check(s).r=='incomplete'&&s.marks==0&&q.status=='play'&&q.tries==0,'incomplete answer is not checked, no try used');SUSL.clear(q);ok(q.slots.length==0,'clear empties');
right(s);let r=SUSL.check(s);ok(r.r=='ok'&&s.marks==1&&q.status=='ok','right order = 1 mark');ok(SUSL.check(s).r=='locked'&&SUSL.check(s).r=='locked'&&s.marks==1,'no double marks when Check is pressed again');ok(!SUSL.place(q,q.pcs[0].id)&&!SUSL.unplace(q,q.pcs[0].id),'locked after answering');
s=sess('sukar',3);q=SUSL.cur(s);wrong(s);r=SUSL.check(s);ok(r.r=='retry'&&r.left==1&&q.status=='play'&&s.marks==0&&q.tries==1,'first wrong check: retry, 1 try left, still playable');right(s);r=SUSL.check(s);ok(r.r=='ok'&&s.marks==1&&s.streak==0,'right on the second try = 1 mark, streak not added');
s=sess('sukar',4);q=SUSL.cur(s);wrong(s);SUSL.check(s);wrong(s);r=SUSL.check(s);ok(r.r=='no'&&q.status=='no'&&s.marks==0&&q.given.length>0,'wrong twice = 0 marks, answer shown, player answer kept');ok(SUSL.advance(s)&&s.i==1,'advance after answering');ok(!SUSL.advance(s),'cannot advance an unanswered question');
/* same words in the wrong order must NOT count */
s=sess('mudah',5);q=SUSL.cur(s);q.slots=[q.pcs[1].id,q.pcs[0].id,q.pcs[2].id];ok(SUSL.check(s).r=='retry','same words, other order is not accepted');
/* duplicate texts get their own ids and still compare by order */
const dq=SUSL.makeQ(['X1',['a','a','b.']],seeded(1));ok(new Set(dq.pcs.map(p=>p.id)).size==3,'identical piece texts get unique ids');
/* streak and hint bonus */
[['mudah',3],['sederhana',2],['sukar',2]].forEach(a=>{const l=a[0],n=a[1];s=sess(l,9);let h0=s.hints;for(let k=0;k<n;k++){right(s);const rr=SUSL.check(s);if(k<n-1)ok(!rr.bonus&&s.streak==k+1,l+' streak '+(k+1));else ok(rr.bonus&&s.hints==h0+1&&s.streak==0,l+': '+n+' right in a row = +1 hint');SUSL.advance(s)}});
s=sess('mudah',10);right(s);SUSL.check(s);SUSL.advance(s);right(s);SUSL.check(s);SUSL.advance(s);ok(s.streak==2,'streak 2 before the break');wrong(s);SUSL.check(s);ok(s.streak==0,'a wrong check resets the streak');
/* hint */
s=sess('sukar',11);q=SUSL.cur(s);ok(s.hints==1,'1 free hint per round');SUSL.place(q,q.pcs[1].id);let hk=SUSL.hint(s);ok(hk==0&&q.slots.length==1&&q.slots[0]==q.pcs[0].id&&q.lock==1&&s.hints==0&&q.hinted,'hint puts the first correct piece in place, locks it, wrong piece goes back');
ok(!SUSL.unplace(q,q.pcs[0].id)&&SUSL.pool(q).includes(q.pcs[1].id),'locked piece cannot be removed');SUSL.place(q,q.pcs[1].id,0);ok(q.slots[1]==q.pcs[1].id,'pieces cannot be inserted before a locked piece');SUSL.clear(q);ok(q.slots.length==1,'clear keeps locked pieces');
ok(SUSL.hint(s)==-1,'no hint left = -1');right(s);r=SUSL.check(s);ok(r.r=='ok'&&s.marks==1&&s.streak==0,'hinted question still gets the mark, but no streak');
s=sess('mudah',12);q=SUSL.cur(s);s.hints=3;SUSL.hint(s);SUSL.hint(s);ok(q.lock==2&&q.slots.length==2&&s.hints==1,'second hint extends the locked start');
/* ---- D. grades ---- */
[[10,'A+',1],[9,'A',1],[8,'B+',1],[7,'B',1],[6,'C',1],[5,'Gagal',0],[3,'Gagal',0],[0,'Gagal',0]].forEach(a=>{const g=quizGrade(a[0]);ok(g.g==a[1]&&!!g.pass==!!a[2]&&g.pct==a[0]*10,'grade '+a[0]+' = '+a[1])});
/* ---- E. screen ---- */
let done=null,closed=0;SUS.open({sub:'bm',lock:'sukar',onClose:()=>closed++,onDone:x=>done=x});let root=body.children[0];
ok(SUS.isOpen()&&root.textContent.includes('Susun Ayat Bahasa Melayu')&&root.textContent.includes('Tahap anda: Sukar'),'menu shows title and the locked level');
const lvs=root.all().filter(e=>e.has('lv'));ok(lvs.length==3&&lvs.filter(e=>e.disabled).length==2&&!lvs[2].disabled,'Mod Kelas: only the level of the slot is open');
ok(!/ketik/i.test(root.textContent),'menu text uses "pilih", not "ketik"');
winL.keydown({key:'1',preventDefault(){},stopPropagation(){}});ok(root.textContent.includes('Tahap anda'),'locked level key does nothing');
lvs[2].click();ok(root.textContent.includes('Soalan 1/10')&&root.textContent.includes('Markah: 0')&&root.textContent.includes('Sukar')&&root.textContent.includes('Streak 0/2')&&root.textContent.includes('Petunjuk (1)'),'question 1/10, score, level, streak, hint count');
const btn=t=>root.all().find(e=>e.tagName=='BUTTON'&&e.textContent==t),az=()=>root.all().find(e=>e.has('az')),pp=()=>root.all().find(e=>e.has('pp')),pcs=w=>w.all().filter(e=>e.has('pc')),txt=w=>pcs(w).map(e=>e.textContent);
const orderOf=()=>{const t=txt(pp()),e=Object.values(SUSB).flat().find(x=>x[1].length==t.length&&x[1].every(y=>t.includes(y)));return e[1]};
ok(btn('Kosongkan')&&btn('Semak Jawapan')&&btn('Petunjuk (1)')&&btn('Kembali'),'buttons: Semak Jawapan, Kosongkan, Petunjuk, Kembali');
btn('Semak Jawapan').click();ok(root.textContent.includes('Lengkapkan ayat'),'check with no pieces asks to finish the sentence');
let ord=orderOf(),n0=txt(pp()).length;ok(txt(az()).length==0&&n0>=3,'all pieces start in the pool');
const tapT=(w,t)=>{const c=pcs(w).find(e=>e.textContent==t);c.onpointerdown({clientX:5,clientY:5,pointerId:1,button:0});c.onpointerup({pointerId:1,clientX:5,clientY:5})};
tapT(pp(),ord[0]);ok(txt(az())[0]==ord[0]&&txt(pp()).length==n0-1,'tap moves a piece into the answer');tapT(az(),ord[0]);ok(txt(az()).length==0&&txt(pp()).length==n0,'tap in the answer returns it to the pool');
/* drag: pool -> answer at index 0, then reorder, then back to the pool */
tapT(pp(),ord[0]);tapT(pp(),ord[1]);const A=az();pcs(A).forEach((c,i)=>{c._r={left:10+i*100,top:100,right:100+i*100,bottom:150,width:90,height:50}});A._r={left:0,top:90,right:360,bottom:200,width:360,height:110};pp()._r={left:0,top:260,right:360,bottom:400,width:360,height:140};
const third=pcs(pp()).find(e=>e.textContent==ord[2]);third._r={left:20,top:300,right:110,bottom:350,width:90,height:50};
third.onpointerdown({clientX:30,clientY:320,pointerId:2,button:0});third.onpointermove({clientX:60,clientY:240,pointerId:2,preventDefault(){}});third.onpointermove({clientX:12,clientY:120,pointerId:2,preventDefault(){}});ok(root.all().some(e=>e.has('gh')),'a floating copy follows the finger while dragging');
third.onpointerup({pointerId:2,clientX:12,clientY:120});ok(txt(az()).join('|')==[ord[2],ord[0],ord[1]].join('|')&&!root.all().some(e=>e.has('gh')),'dropping on the left of the first piece inserts it first');
const A2=az();pcs(A2).forEach((c,i)=>{c._r={left:10+i*100,top:100,right:100+i*100,bottom:150,width:90,height:50}});A2._r={left:0,top:90,right:360,bottom:200,width:360,height:110};const pl=pcs(A2)[0];
pl.onpointerdown({clientX:30,clientY:120,pointerId:3,button:0});pl.onpointermove({clientX:60,clientY:125,pointerId:3,preventDefault(){}});pl.onpointermove({clientX:340,clientY:120,pointerId:3,preventDefault(){}});pl.onpointerup({pointerId:3,clientX:340,clientY:120});
ok(txt(az()).join('|')==[ord[0],ord[1],ord[2]].join('|'),'dragging inside the answer reorders it');
const A3=az();A3._r={left:0,top:90,right:360,bottom:200,width:360,height:110};pp()._r={left:0,top:260,right:360,bottom:400,width:360,height:140};const dq2=pcs(A3)[2];dq2.onpointerdown({clientX:30,clientY:120,pointerId:4,button:0});dq2.onpointermove({clientX:60,clientY:200,pointerId:4,preventDefault(){}});dq2.onpointermove({clientX:100,clientY:300,pointerId:4,preventDefault(){}});dq2.onpointerup({pointerId:4,clientX:100,clientY:300});
ok(txt(az()).length==2&&txt(pp()).includes(ord[2]),'dragging a piece out of the answer onto the pool returns it');
btn('Kosongkan').click();ok(txt(az()).length==0&&txt(pp()).length==n0,'Kosongkan returns every piece');
/* play all 10: right, right on 2nd try, wrong twice, hint... */
let played=0;const place=o=>{btn('Kosongkan')&&btn('Kosongkan').click();o.forEach(t=>tapT(pp(),t))};
for(let k=0;k<10;k++){ord=orderOf();const mode=k%5;
 if(mode==3){place(ord.slice().reverse());btn('Semak Jawapan').click();ok(root.textContent.includes('Baki percubaan: 1'),'wrong: one try left message');place(ord.slice().reverse());btn('Semak Jawapan').click();ok(root.textContent.includes('Ayat yang betul ialah')&&root.textContent.includes(ord.join(' ')),'out of tries: the correct sentence is shown')}
 else if(mode==2){place(ord.slice().reverse());btn('Semak Jawapan').click();place(ord);btn('Semak Jawapan').click();ok(root.textContent.includes('BAGUS!'),'right on the 2nd try is accepted (stamp)')}
 else{place(ord);btn('Semak Jawapan').click();ok(root.textContent.includes('BAGUS!')&&root.textContent.includes('+1 markah'),'right answer shows the BAGUS! stamp')}
 const nx=btn('Soalan Seterusnya')||btn('Lihat Keputusan');ok(!!nx&&(k<9?nx.textContent=='Soalan Seterusnya':nx.textContent=='Lihat Keputusan'),'next button '+k);played++;nx.click()}
ok(played==10&&done&&done.sub=='bm'&&done.level=='sukar'&&done.marks==8&&done.pct==80&&done.g=='B+'&&done.pass===true,'finished: 8/10 = B+, onDone payload '+JSON.stringify(done));
ok(root.textContent.includes('8/10')&&root.textContent.includes('80%')&&root.textContent.includes('B+')&&root.textContent.includes('LULUS')&&root.textContent.includes('Betul: 8')&&root.textContent.includes('Salah: 2')&&root.textContent.includes('Bagus! Anda semakin mahir.'),'results: marks, percent, grade, pass, counts, message');
const rows=root.all().filter(e=>e.has('rr'));ok(rows.length==10&&rows.filter(r=>r.textContent.includes('Jawapan anda:')&&r.textContent.includes('Jawapan betul:')).length==2,'results list all 10 sentences, wrong ones show the player answer and the correct one');
ok(ctx.cur.quiz.bm&&ctx.cur.quiz.bm.sukar&&ctx.cur.quiz.bm.sukar.best==8&&ctx.cur.quiz.bm.sukar.g=='B+','best result saved under quiz.bm');
ok(btn('Main Lagi')&&btn('Kembali ke Pilihan Tahap'),'Main Lagi and Kembali ke Pilihan Tahap exist');
btn('Main Lagi').click();ok(root.textContent.includes('Soalan 1/10')&&root.textContent.includes('Markah: 0'),'Main Lagi starts a fresh session');
btn('Kembali').click();ok(root.textContent.includes('Markah pusingan ini tidak akan disimpan'),'Kembali asks first');root.all().filter(e=>e.tagName=='BUTTON'&&e.textContent=='Kembali').pop().click();ok(root.textContent.includes('Tahap anda: Sukar'),'leave goes back to the level menu');
SUS.back();ok(closed==1&&!SUS.isOpen(),'back from the menu closes the quiz and calls onClose');
/* free level choice (Mod Jalan-jalan) */
SUS.open({sub:'bm',lock:null,onClose:()=>{}});root=body.children[0];ok(root.all().filter(e=>e.has('lv')&&!e.disabled).length==3,'Mod Jalan-jalan: all three levels open');SUS.close();
console.log(pass+' ok, '+fail+' failed');process.exit(fail?1:0);
