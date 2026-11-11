/* Round 10j: Node stub test (NOT a real browser, no three.js) for the Sains Meja Makmal quiz (Rantai Makanan): data, logic, scoring, saving, wiring and the screen on a tiny fake DOM.
   Run: node tools/test-sains-mm.js */
const fs=require('fs'),vm=require('vm'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
/* ---- tiny fake DOM ---- */
class El{constructor(t){this.tagName=t.toUpperCase();this.children=[];this.className='';this._t='';this.style={};this.dataset={};this.attrs={};this.disabled=false;this.rect={left:0,right:0,top:0,bottom:0,width:0,height:0};const s=this;this.classList={add:c=>{if(!s.has(c))s.className=(s.className+' '+c).trim()},remove:c=>{s.className=s.className.split(' ').filter(x=>x&&x!==c).join(' ')},toggle:(c,f)=>{f?s.classList.add(c):s.classList.remove(c)}}}
 append(...n){n.forEach(x=>{if(x&&x.parent)x.parent.children=x.parent.children.filter(y=>y!==x);x.parent=this;this.children.push(x)})}appendChild(x){this.append(x)}remove(){if(this.parent)this.parent.children=this.parent.children.filter(y=>y!==this)}
 set innerHTML(v){this.children.forEach(c=>c.parent=null);this.children=[];this._t=''}get innerHTML(){return''}set textContent(v){this._t=String(v);this.children.forEach(c=>c.parent=null);this.children=[]}get textContent(){return this._t+this.children.map(c=>c.textContent).join('')}
 setAttribute(k,v){this.attrs[k]=v}focus(){}click(){if(this.onclick&&!this.disabled)this.onclick({detail:0})}getBoundingClientRect(){return this.rect}setPointerCapture(){}releasePointerCapture(){}
 cloneNode(){const e=new El(this.tagName);e.className=this.className;e._t=this.textContent;e.rect=this.rect;return e}
 all(){return this.children.flatMap(c=>[c,...c.all()])}has(c){return this.className.split(' ').includes(c)}
 querySelector(s){const p=s.split(' ');const m=x=>x.startsWith('.')?(e=>e.has(x.slice(1))):(e=>e.tagName==x.toUpperCase());let sc=[this];for(const part of p){const f=m(part);const nx=[];for(const r of sc)for(const e of r.all())if(f(e)){nx.push(e);break}if(!nx.length)return null;sc=nx}return sc[0]}}
const body=new El('body'),winL={};
const saved={n:0},ctx={document:{createElement:t=>new El(t),body,head:new El('head')},addEventListener:(e,f)=>{winL[e]=f},removeEventListener:e=>{delete winL[e]},window:{},tone(){},cur:{quiz:{}},save(){saved.n++},Math,console,JSON,Object,Array,Date,Set,String,Number,setTimeout:()=>0,devicePixelRatio:1};
ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(R('js/kelas-quiz-data.js')+R('js/kelas-visuals.js')+R('js/kelas-sains-mm-data.js')+R('js/kelas-sains-mm-art.js')+'function recQuiz(sub,level,marks){cur.quiz=cur.quiz||{};const q=cur.quiz[sub]=cur.quiz[sub]||{},r=q[level]=q[level]||{best:0,n:0};r.n++;if(marks>=r.best||!r.g){r.best=Math.max(r.best,marks);r.g=quizGrade(r.best).g}save();return r}\n'+R('js/kelas-sains-mm.js')+';globalThis.T={SAM,SAML,SAMD,SAMC,SAMA,SAMALT,samArt,QCFG,quizGrade}',ctx);
const {SAM,SAML,SAMD,SAMC,SAMA,SAMALT,samArt,QCFG,quizGrade}=ctx.T;
/* ---- data ---- */
ok(SAMD.length==3&&SAMD.map(d=>d.id).join()=='hutan,gurun,lautan','3 challenges: hutan, gurun, lautan');
ok(SAMD.every(d=>d.c.length==4&&d.x.length==2&&new Set(d.c.concat(d.x).map(c=>c[0])).size==6&&d.t&&d.e),'each challenge: 4 chain cards + 2 distractors, 6 unique ids, title, explanation');
ok(SAMD[0].c.map(c=>c[1]).join('|')=='Pokok|Ulat|Burung kecil|Helang'&&SAMD[1].c.map(c=>c[1]).join('|')=='Kaktus|Tikus gurun|Ular|Helang'&&SAMD[2].c.map(c=>c[1]).join('|')=='Alga|Udang|Ikan kecil|Jerung','chains: hutan, gurun, lautan');
ok(SAMD.every(d=>d.x.every(x=>!d.c.some(c=>c[0]==x[0]))),'a distractor is never also in its own chain');
ok(SAMC.n+SAMC.pairs+SAMC.arrows==SAMC.per&&SAMC.per*SAMD.length==SAMC.max&&SAMC.max==30,'4 + 3 + 3 = 10 marks per challenge, 30 for the station');
ok(SAMD.every(d=>d.c.concat(d.x).every(c=>SAMA[c[0]]&&SAMALT[c[0]]))&&Object.keys(SAMA).length==11,'every card has a picture and an alt text; 11 pictures');
ok(Object.keys(SAMA).every(id=>{const s=samArt(id);return s.startsWith('<svg')&&!/<text|href=|http|<image/.test(s.replace('xmlns="http://www.w3.org/2000/svg"',''))}),'pictures: inline SVG only, no text, no links, no images');
ok(!/ketik/i.test(R('js/kelas-sains-mm.js')+R('js/kelas-sains-mm-data.js')),'game text never says "ketik"');
/* ---- shuffle ---- */
let allDiff=true;for(let t=0;t<300;t++){const S=SAML.newSession();S.qs.forEach(q=>{const ids=q.d.c.concat(q.d.x).map(c=>c[0]);if(q.deck.join()==ids.join()||q.deck.slice().sort().join()!=ids.slice().sort().join())allDiff=false})}
ok(allDiff,'300 sessions: deck is a permutation of the 6 cards and never the data order');
ok(SAML.shuffle(['a','b','c'],()=>0).join()!='a,b,c','a bad rng still gives a non-answer order');
/* ---- step 1: pick ---- */
const ids=q=>q.d.c.map(c=>c[0]);
let S=SAML.newSession(),q=SAML.cur(S);
ok(q.ph=='pick'&&!q.chk&&q.sel.length==0&&SAML.checkPick(S).r=='incomplete','new challenge starts at step 1, nothing chosen: Semak says incomplete');
ok(SAML.toggle(q,q.deck[0])&&q.sel.length==1&&SAML.toggle(q,q.deck[0])&&q.sel.length==0,'tap a card to choose, tap again to take it back');
ok(!SAML.toggle(q,'nope')&&q.sel.length==0,'unknown card rejected');
for(let k=0;k<4;k++)SAML.toggle(q,q.deck[k]);ok(q.sel.length==4&&!SAML.toggle(q,q.deck[4])&&q.sel.length==4,'cannot choose a 5th card');
q.sel=[];ids(q).forEach(id=>SAML.toggle(q,id));let r=SAML.checkPick(S);
ok(r.r=='ok'&&r.marks==4&&q.pm==4&&S.marks==4&&q.chk,'all 4 right = 4 marks');
ok(SAML.checkPick(S).r=='locked'&&S.marks==4&&!SAML.toggle(q,q.deck[0]),'checking again or tapping after the check changes nothing');
ok(SAML.next(S)=='step'&&q.ph=='order'&&!q.chk&&q.order.slice().sort().join()==ids(q).slice().sort().join()&&q.order.join()!=ids(q).join(),'next: step 2 with the 4 right cards in a non-answer order');
/* wrong picks: marks = right cards only, and the order step still has the 4 right cards */
let S2=SAML.newSession(),q2=SAML.cur(S2);const wrong=q2.d.x.map(c=>c[0]);q2.sel=[];SAML.toggle(q2,ids(q2)[0]);SAML.toggle(q2,ids(q2)[1]);SAML.toggle(q2,wrong[0]);SAML.toggle(q2,wrong[1]);
r=SAML.checkPick(S2);ok(r.marks==2&&S2.marks==2,'2 right + 2 wrong picks = 2 marks');SAML.next(S2);ok(q2.order.slice().sort().join()==ids(q2).slice().sort().join(),'wrong picks are replaced: step 2 always uses the 4 right cards');
/* ---- step 2: order ---- */
ok(SAML.pool(q).length==4&&q.slots.every(s=>s===null)&&SAML.checkOrder(S).r=='incomplete','step 2: 4 cards in the pool, 4 empty slots, Semak incomplete');
ok(SAML.place(q,q.order[0])&&q.slots[0]==q.order[0]&&SAML.pool(q).length==3,'tap a card = first empty slot');
ok(!SAML.place(q,q.order[0])&&!SAML.place(q,'nope'),'already placed / unknown card rejected');
ok(SAML.unplace(q,q.order[0])&&q.slots[0]===null&&!SAML.unplace(q,q.order[0]),'tap a placed card = back to the pool');
q.order.forEach(id=>SAML.place(q,id));ok(!SAML.place(q,q.order[0])&&SAML.clear(q)&&q.slots.every(s=>s===null),'Kosongkan returns every card');
ids(q).forEach(id=>SAML.place(q,id));r=SAML.checkOrder(S);ok(r.r=='ok'&&r.marks==3&&q.om==3&&S.marks==7,'right order = 3 marks (3 pairs)');
ok(SAML.checkOrder(S).r=='locked'&&!SAML.unplace(q,ids(q)[0])&&!SAML.clear(q),'locked after the check');
/* pair scoring: swap the last two = only the first pair is right */
const c2=ids(q2);SAML.next(S2);SAML.place(q2,c2[0]);SAML.place(q2,c2[1]);SAML.place(q2,c2[3]);SAML.place(q2,c2[2]);ok(SAML.checkOrder(S2).marks==1,'swap the last two: only the first neighbouring pair is right = 1 mark');
let S3=SAML.newSession(),q3=SAML.cur(S3);q3.sel=ids(q3).slice();q3.chk=false;SAML.checkPick(S3);SAML.next(S3);[3,2,1,0].forEach(k=>SAML.place(q3,ids(q3)[k]));ok(SAML.checkOrder(S3).marks==0,'reversed chain = 0 order marks');
/* ---- step 3: arrows ---- */
ok(SAML.next(S)=='step'&&q.ph=='arrow'&&q.arr.every(a=>a===null)&&SAML.checkArrow(S).r=='incomplete','step 3: 3 arrows with no direction: Semak incomplete');
ok(SAML.flip(q,0)&&q.arr[0]=='r'&&SAML.flip(q,0)&&q.arr[0]=='l'&&SAML.flip(q,0)&&q.arr[0]=='r','tap an arrow: none -> right -> left -> right');
ok(!SAML.flip(q,3)&&!SAML.flip(q,-1),'bad arrow number rejected');
SAML.flip(q,1);SAML.flip(q,2);r=SAML.checkArrow(S);ok(r.r=='ok'&&r.marks==3&&q.am==3&&q.marks==10&&S.marks==10,'3 right arrows = 3 marks, challenge total 10');
ok(!SAML.flip(q,0)&&SAML.checkArrow(S).r=='locked','locked after the check');
ok(SAML.next(S)=='cycle'&&S.i==1&&SAML.cur(S).ph=='pick'&&!S.done,'next: second challenge starts at step 1');
let Sx=SAML.newSession(),qx=SAML.cur(Sx);qx.sel=ids(qx).slice();SAML.checkPick(Sx);SAML.next(Sx);ids(qx).forEach(id=>SAML.place(qx,id));SAML.checkOrder(Sx);SAML.next(Sx);SAML.flip(qx,0);SAML.flip(qx,1);SAML.flip(qx,1);SAML.flip(qx,2);ok(SAML.checkArrow(Sx).marks==2,'one arrow the wrong way = 2 arrow marks');
/* ---- full perfect + all wrong ---- */
function play(S,good){let guard=0;while(!S.done&&guard++<20){const q=SAML.cur(S);q.sel=[];
 if(good)ids(q).forEach(id=>SAML.toggle(q,id));else{q.d.x.forEach(x=>SAML.toggle(q,x[0]));SAML.toggle(q,q.d.c[0][0]);SAML.toggle(q,q.d.c[1][0])}
 SAML.checkPick(S);SAML.next(S);(good?ids(q):ids(q).slice().reverse()).forEach(id=>SAML.place(q,id));SAML.checkOrder(S);SAML.next(S);for(let k=0;k<3;k++){SAML.flip(q,k);if(!good)SAML.flip(q,k)}SAML.checkArrow(S);if(SAML.next(S)=='end')break}return S}
const P=play(SAML.newSession(),true);ok(P.done&&P.marks==30&&SAML.scale(P.marks)==10&&quizGrade(SAML.scale(P.marks)).g=='A+','perfect run = 30/30 -> 10/10 -> A+');
const W=play(SAML.newSession(),false);ok(W.done&&W.marks==6&&SAML.scale(W.marks)==2,'poor run: 2 right picks per challenge, reversed chain, wrong arrows = 6/30 -> 2/10');
ok(SAML.scale(30)==10&&SAML.scale(29)==9&&SAML.scale(0)==0&&SAML.scale(99)==10&&SAML.scale(-4)==0,'scale 30 -> 10 (clamped)');
/* ---- screen (fake DOM) ---- */
let closed=0,doneCalled=0;const rootEl=()=>body.children[0];
const btn=t=>rootEl().all().find(e=>e.tagName=='BUTTON'&&e.textContent==t);const txt=()=>rootEl().textContent;
SAM.open({sub:'sainsmm',lock:null,onClose:()=>closed++,onDone:()=>doneCalled++});
ok(SAM.isOpen()&&rootEl().id=='sainsmm'&&txt().includes('Rantai Makanan')&&txt().includes('Belum dimainkan')&&winL.keydown,'opens on the intro, root #sainsmm, key listener on');
ok(txt().includes('Setiap cabaran 10 markah, jumlah 30 markah')&&txt().includes('pilih 4 organisma'),'intro text in Malay says "pilih"');
btn('Mula').click();ok(txt().includes('LANGKAH 1/3')&&txt().includes('Cabaran 1/3')&&txt().includes('Dipilih: 0/4'),'Mula: challenge 1, step 1');
btn('Semak Jawapan').click();ok(txt().includes('Pilih tepat 4 organisma dahulu'),'Semak with nothing chosen = polite message');
const cards=()=>rootEl().all().filter(e=>e.has('xmk'));
ok(cards().length==6&&cards().every(c=>c.all().some(e=>e.has('xmi'))),'6 cards with pictures');
const SS=SAML; /* the screen uses its own session; drive it by card labels */
const labelsOf=d=>d.c.map(c=>c[1]);const clickLabel=l=>{const c=cards().find(c=>c.all().some(e=>e.has('xmn')&&e.textContent==l));c.click()};
labelsOf(SAMD[0]).forEach(clickLabel);ok(txt().includes('Dipilih: 4/4'),'chose the 4 right cards (hutan)');
btn('Semak Jawapan').click();ok(txt().includes('Langkah 1: 4/4')&&btn('Langkah Seterusnya')&&cards().filter(c=>c.has('ok')).length==4,'step 1 checked: 4/4, ticks shown');
btn('Langkah Seterusnya').click();ok(txt().includes('LANGKAH 2/3')&&rootEl().all().filter(e=>e.has('xmsk')).length==4&&btn('Kosongkan'),'step 2: 4 slots, Kosongkan shown');
btn('Semak Jawapan').click();ok(txt().includes('Letakkan kesemua 4 kad'),'step 2 incomplete message');
labelsOf(SAMD[0]).forEach(clickLabel);btn('Semak Jawapan').click();ok(txt().includes('Langkah 2: 3/3')&&txt().includes('Urutan betul!'),'step 2 checked: 3/3');
btn('Langkah Seterusnya').click();ok(txt().includes('LANGKAH 3/3')&&rootEl().all().filter(e=>e.has('xma')).length==3,'step 3: 3 arrow buttons');
btn('Semak Jawapan').click();ok(txt().includes('Pilih arah ketiga-tiga anak panah dahulu'),'step 3 incomplete message');
const arrows=()=>rootEl().all().filter(e=>e.has('xma'));arrows().forEach(a=>a.click());btn('Semak Jawapan').click();
ok(txt().includes('Langkah 3: 3/3')&&txt().includes('Cabaran ini: 10/10')&&txt().includes('Pokok membuat makanannya sendiri')&&btn('Cabaran Seterusnya'),'step 3 checked: 3/3, challenge 10/10, explanation shown');
/* Back / Escape */
SAM.back();ok(txt().includes('Keluar dari kuiz ini?'),'Back during play asks first');
SAM.back();ok(!txt().includes('Keluar dari kuiz ini?')&&SAM.isOpen(),'Back with the dialog open = keep playing');
winL.keydown({key:'Escape',preventDefault(){},stopPropagation(){}});ok(txt().includes('Keluar dari kuiz ini?'),'Escape = same as Back');
btn('Keluar').click();ok(txt().includes('Rantai Makanan')&&txt().includes('Tahap: Sederhana')&&saved.n==0,'Keluar returns to the intro, nothing saved');
/* full run on the screen: 3 challenges perfect */
btn('Mula').click();
for(let d=0;d<3;d++){labelsOf(SAMD[d]).forEach(clickLabel);btn('Semak Jawapan').click();btn('Langkah Seterusnya').click();labelsOf(SAMD[d]).forEach(clickLabel);btn('Semak Jawapan').click();btn('Langkah Seterusnya').click();arrows().forEach(a=>a.click());btn('Semak Jawapan').click();if(d<2){ok(txt().includes('Markah '+(10*(d+1))+'/30'),'header marks after challenge '+(d+1));btn('Cabaran Seterusnya').click()}else btn('Lihat Keputusan').click()}
ok(txt().includes('Markah: 30/30')&&txt().includes('A+')&&txt().includes('LULUS')&&txt().includes('Rekod terbaik: 10/10 · A+'),'result: 30/30, A+, LULUS, best 10/10');
ok(saved.n==1&&ctx.cur.quiz.sainsmm&&ctx.cur.quiz.sainsmm.sederhana.best==10&&ctx.cur.quiz.sainsmm.sederhana.g=='A+','saved under cur.quiz.sainsmm.sederhana (10/10 A+)');
ok(!ctx.cur.quiz.sainspp,'Papan Putih save key untouched');
ok(doneCalled>=1,'Round 10k: onDone is called when the results screen shows (the Sains door rule and class grade use it)');
btn('Tutup').click();ok(!SAM.isOpen()&&closed==1&&!winL.keydown,'Tutup closes, calls onClose, removes the key listener');
SAM.open({onClose:()=>closed++});ok(txt().includes('Terbaik: 10/10 · A+'),'reopen: intro shows the saved best');SAM.back();ok(!SAM.isOpen()&&closed==2,'Back on the intro closes');
ctx.cur={};SAM.open({onClose(){}});ok(txt().includes('Belum dimainkan'),'old save without cur.quiz: intro still works');btn('Mula').click();SAM.close();ok(!SAM.isOpen()&&!winL.keydown,'close during play removes the key listener');
/* a worse run does not lower the best */
ctx.cur={quiz:{sainsmm:{sederhana:{best:10,n:1,g:'A+'}}}};SAM.open({onClose(){}});btn('Mula').click();
for(let d=0;d<3;d++){const lab=labelsOf(SAMD[d]);SAMD[d].x.forEach(x=>clickLabel(x[1]));lab.slice(0,2).forEach(clickLabel);btn('Semak Jawapan').click();btn('Langkah Seterusnya').click();lab.slice().reverse().forEach(clickLabel);btn('Semak Jawapan').click();btn('Langkah Seterusnya').click();arrows().forEach(a=>{a.click();a.click()});btn('Semak Jawapan').click();btn(d<2?'Cabaran Seterusnya':'Lihat Keputusan').click()}
ok(txt().includes('GAGAL')&&ctx.cur.quiz.sainsmm.sederhana.best==10,'a poor run says GAGAL but the best stays 10/10');
SAM.close();
/* ---- wiring ---- */
const kj=R('js/kelas.js'),html=R('kelas.html'),sw=R('sw.js'),css=R('css/style.css');
ok(/QE=QLAB\?\(typeof SAM!='undefined'\?\{open:o=>\(o&&o\.sub=='sainsex'&&typeof SAE!='undefined'\?SAE:o&&o\.sub=='sainsmm'\?SAM:SAP\)\.open\(o\)/.test(kj)&&/isOpen:\(\)=>SAP\.isOpen\(\)\|\|SAM\.isOpen\(\)/.test(kj),'kelas.js: QE router sends sub sainsmm to SAM, Back/isOpen cover both');
ok(/if\(i==1&&QLAB&&typeof SAM!='undefined'\)\{halt=true;document\.body\.classList\.add\('mn'\);QE\.open\(\{sub:'sainsmm',lock:null,onClose:shut,onDone:r=>stationDone\(1,r\)\}\);return\}/.test(kj),'kelas.js: station(1) opens SAM like station(0) opens SAP (Round 10k: with onDone for the Sains door rule)');
ok(/function station\(i\)\{if\(i==0&&QLAB\)\{halt=true;document\.body\.classList\.add\('mn'\);QE\.open\(\{sub:'sainspp',lock:null,onClose:shut,onDone:r=>stationDone\(0,r\)\}\);return\}/.test(kj),'kelas.js: station(0) (Papan Putih) opens SAP (Round 10k: with onDone)');
ok(/sub:'sainsmm'[^)]*onDone:r=>stationDone\(1,r\)/.test(kj),'kelas.js: Round 10k: Meja Makmal reports to stationDone (the door rule and class grade need all 3 stations)');
ok(/const HASQ=QENG\|\|QBM\|\|\(typeof QD!='undefined'&&!!QD\[SUB\]\)/.test(kj),'kelas.js: HASQ unchanged (still false for sains: no door rule)');
const ix=n=>html.indexOf('"js/'+n+'"');ok(ix('kelas-sains-mm-data.js')>ix('kelas-sains.js')&&ix('kelas-sains-mm-art.js')>ix('kelas-sains-mm-data.js')&&ix('kelas-sains-mm.js')>ix('kelas-sains-mm-art.js')&&ix('kelas-sains-mm.js')<html.indexOf('"js/kelas.js"'),'kelas.html: the three files load after Papan Putih and before js/kelas.js');
ok(/CACHE='sr-r\d+[a-z]*\d*'/.test(sw)&&['kelas-sains-mm-data.js','kelas-sains-mm-art.js','kelas-sains-mm.js'].every(f=>sw.includes("'js/"+f+"'")),'sw.js: cache sr-r10j3 and the three new files pre-cached');
const own=['kelas-sains-mm-data.js','kelas-sains-mm-art.js','kelas-sains-mm.js'];const others=fs.readdirSync(path.join(__dirname,'..','js')).filter(f=>!own.includes(f)).map(f=>R('js/'+f)).join('\n');
ok(['SAMC','SAMD','SAML','SAMA','SAMALT','samArt','SAM'].every(n=>!new RegExp('(const|let|var|function|class)\\s+'+n+'\\b').test(others)),'new global names (SAM, SAMC, SAMD, SAML, SAMA, SAMALT, samArt) are not declared anywhere else');
ok(!/id=["']sainsmm["']|#sainsmm|\.xm[a-z]*\b/.test(css+html),'root id sainsmm and the xm- classes are not used in css/style.css or kelas.html');
ok(/^[^]*Round 10j/.test(R('README.md'))&&/_backup_round10j/.test(R('README.md'))&&/Round 10i3/.test(R('README.md')),'README has the Round 10j entry and keeps the old text');
console.log(fail?fail+' FAILED, '+pass+' passed':'all '+pass+' checks passed');process.exit(fail?1:0);
