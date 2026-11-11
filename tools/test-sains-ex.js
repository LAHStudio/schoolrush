/* Round 10k: Node stub test (NOT a real browser, no three.js) for the Sains Stesen Eksperimen (Penyiasatan Saintifik, Sukar): data, logic, scoring, saving, screen on a tiny fake DOM, and the Sains door rule + class grade (stationDone in js/kelas.js).
   Run: node tools/test-sains-ex.js */
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
vm.runInContext(R('js/kelas-quiz-data.js')+R('js/kelas-visuals.js')+R('js/kelas-sains-ex-data.js')+R('js/kelas-sains-ex-art.js')+'function recQuiz(sub,level,marks){cur.quiz=cur.quiz||{};const q=cur.quiz[sub]=cur.quiz[sub]||{},r=q[level]=q[level]||{best:0,n:0};r.n++;if(marks>=r.best||!r.g){r.best=Math.max(r.best,marks);r.g=quizGrade(r.best).g}save();return r}\n'+R('js/kelas-sains-ex.js')+';globalThis.T={SAE,SAEL,SAED,SAEC,SAEA,SAEALT,saeArt,SAEI,saeIcon,QCFG,quizGrade}',ctx);
const {SAE,SAEL,SAED,SAEC,SAEA,SAEALT,saeArt,SAEI,saeIcon,QCFG,quizGrade}=ctx.T;
const seed=n=>()=>(n=(n*1664525+1013904223)>>>0)/4294967296;
/* ---- data ---- */
ok(SAED.length==3&&SAED.map(d=>d.n).join()=='3A,3B,3C'&&SAED.map(d=>d.id).join()=='cahaya,ais,litar','3 experiments: 3A cahaya, 3B ais, 3C litar');
ok(SAEC.key=='sainsex'&&SAEC.level=='sukar'&&SAEC.slots+SAEC.qn*0+5==10&&SAEC.per*SAED.length==SAEC.max&&SAEC.max==30,'5 + 5 = 10 marks per experiment, 30 for the station, key sainsex / sukar');
ok(SAED.every(d=>d.slots.length==5&&d.cards.length==7&&new Set(d.cards.map(c=>c[0])).size==7&&d.slots.every(s=>d.cards.some(c=>c[0]==s.a))&&new Set(d.slots.map(s=>s.a)).size==5&&new Set(d.slots.map(s=>s.id)).size==5),'each experiment: 5 spots, 7 cards (5 right + 2 distractors), unique ids, every answer is a card');
ok(SAED.every(d=>d.slots.every(s=>s.x>0&&s.x<100&&s.y>0&&s.y<100&&s.cap)),'every spot has a caption and a position inside the diagram');
ok(SAED.every(d=>d.q.length==3&&d.q.map(q=>q.m).join()=='2,2,1'&&d.q.every(q=>q.c.length==3&&q.c.map(c=>c[0]).join()=='a,b,c'&&q.c.some(c=>c[0]==q.a)&&q.p&&q.e)),'each experiment: 3 questions, 3 choices (ids a, b, c), answer among them, marks 2 + 2 + 1');
ok(SAED.every(d=>/pemboleh ubah yang dimanipulasi/.test(d.q[0].p)&&/hipotesis/.test(d.q[1].p)&&/kesannya/.test(d.q[2].p)),'question pattern is fixed: pemboleh ubah dimanipulasi, hipotesis, kesan');
ok(SAED.every(d=>d.q.every(q=>q.c.filter(c=>c[0]==q.a).length==1&&new Set(q.c.map(c=>c[1])).size==3)),'one right choice per question, 3 different texts');
ok(SAED[0].slots.map(s=>SAEL.label({d:SAED[0]},s.a)).join('|')=='Anak pokok sama jenis dan sama saiz|Air 50 ml untuk setiap pasu|Dalam almari gelap|Pembaris|Tinggi pokok'&&SAED[2].slots.length==5,'3A answers as agreed');
ok(!/ketik/i.test(R('js/kelas-sains-ex.js')+R('js/kelas-sains-ex-data.js')),'game text never says "ketik"');
ok(/pilih/i.test(R('js/kelas-sains-ex.js')),'game text uses "pilih"');
/* ---- diagrams: never mark the answer ---- */
ok(['cahaya','ais','litar'].every(id=>/^<svg[^>]*viewBox="0 0 300 190"/.test(saeArt(id))&&/<\/svg>$/.test(saeArt(id))),'3 diagrams, valid SVG strings with the same viewBox');
ok(['cahaya','ais','litar'].every(id=>!/<image|href=|<script|onload|onclick/i.test(saeArt(id))),'diagrams have no image, no links, no scripts');
ok(['cahaya','litar'].every(id=>!/<text/i.test(saeArt(id)))&&(saeArt('ais').match(/<text[^>]*>[^<]*/g)||[]).map(t=>t.replace(/<[^>]*>/,'')).join('|')=='10 \u00b0C|30 \u00b0C|60 \u00b0C','3A and 3C diagrams have no text; 3B shows only the 3 beaker temperatures (10, 30, 60 \u00b0C), no other label');
ok(!/Air (10|30|60) \u00b0C|'t10'|'t30'|'t60'/.test(R('js/kelas-sains-ex-data.js')),'3B has no temperature cards any more (the temperatures are printed on the beakers)');
const allIds=SAED.flatMap(d=>d.cards.map(c=>c[0]));
ok(new Set(allIds).size==allIds.length&&allIds.length==21,'card ids are unique across all 3 experiments (21 cards)');
ok(allIds.every(id=>/^<svg[^>]*viewBox="0 0 40 40"/.test(saeIcon(id))&&/<\/svg>$/.test(saeIcon(id))&&!/<text|<image|href=|<script|onload|onclick/i.test(saeIcon(id))),'every card (answers and distractors alike) has an icon: valid SVG, no text, no image, no links');
ok(saeIcon('nope')==''&&new Set(allIds.map(i=>saeIcon(i))).size==allIds.length-1,'unknown id gives empty string; icons differ card by card (the thermometer is shared by 3A distractor and 3B answer)');
ok(SAED[1].slots.map(s=>SAEL.label({d:SAED[1]},s.a)).join('|')=='Air 100 ml|Satu ketul ais, saiz sama|Jam randik|Termometer|Masa ais cair'&&SAED[1].cards.length==7,'3B answers as agreed in Round 10k2');
ok(saeArt('nope')==''&&SAEALT.cahaya&&SAEALT.ais&&SAEALT.litar,'unknown id gives empty string, alt text for all 3');
/* ---- logic ---- */
const rs=seed(7);
ok(SAEL.shuffle(['a','b','c'],rs).join()!='a,b,c'&&SAEL.shuffle(['a','b'],()=>0).join()=='b,a','shuffle never returns the given order');
let allDiff=true,posSeen=[new Set(),new Set(),new Set()];for(let t=0;t<200;t++){const S=SAEL.newSession(seed(t+1));S.qs.forEach(x=>{if(x.deck.join()==x.d.cards.map(c=>c[0]).join())allDiff=false;x.qo.forEach((o,qi)=>posSeen[qi].add(o.indexOf(x.d.q[qi].a)))})}
ok(allDiff,'the tray order is never the data order');ok(posSeen.every(s=>s.size==3),'the right choice shows up in every position over 200 sessions');
const mk=()=>SAEL.newSession(seed(3));
function perfect(S){const out=[];while(!S.done){const x=SAEL.cur(S);x.d.slots.forEach((s,k)=>{SAEL.selCard(x,s.a);SAEL.tapSpot(x,k)});out.push(SAEL.checkSetup(S));SAEL.next(S);for(let q=0;q<3;q++){SAEL.choose(x,x.d.q[q].a);out.push(SAEL.checkQ(S));SAEL.next(S)}}return out}
let S=mk();perfect(S);ok(S.done&&S.marks==30&&S.qs.every(x=>x.marks==10),'a perfect run = 30 marks, 10 per experiment');
ok(SAEL.scale(30)==10&&SAEL.scale(29)==9&&SAEL.scale(0)==0&&SAEL.scale(99)==10&&SAEL.scale(-4)==0,'scale 30 -> 10 (clamped)');
S=mk();let x=SAEL.cur(S);
ok(SAEL.checkSetup(S).r=='incomplete'&&!x.chk,'Semak with empty spots = incomplete, nothing locked');
ok(SAEL.selCard(x,x.deck[0])=='sel'&&x.sel==x.deck[0]&&SAEL.selCard(x,x.deck[0])=='sel'&&x.sel===null,'tap a card selects it, tap again un-selects');
ok(SAEL.tapSpot(x,0)=='pend'&&x.pend==0&&SAEL.tapSpot(x,0)=='pend'&&x.pend===null,'tap an empty spot with no card = pending spot, tap again clears it');
SAEL.tapSpot(x,2);const c0=x.deck[0];ok(SAEL.selCard(x,c0)=='placed'&&x.slots[2]==c0&&x.pend===null&&x.sel===null&&SAEL.pool(x).indexOf(c0)<0,'spot first then card places the card');
ok(SAEL.selCard(x,x.deck[1])=='sel'&&SAEL.tapSpot(x,4)=='placed'&&x.slots[4]==x.deck[1],'card first then spot places the card');
ok(SAEL.tapSpot(x,2)=='back'&&x.slots[2]===null&&SAEL.pool(x).indexOf(c0)>=0,'tap a filled spot returns its card');
ok(SAEL.selCard(x,x.slots[4])===false&&SAEL.tapSpot(x,9)===false&&SAEL.selCard(x,'zzz')===false,'a placed or unknown card cannot be selected, a bad spot is ignored');
SAEL.clear(x);ok(x.slots.every(s=>s===null)&&SAEL.clear(x)===false,'Kosongkan returns all cards');
/* 3 right, 2 swapped = 3 marks */
S=mk();x=SAEL.cur(S);const A=x.d.slots.map(s=>s.a);[0,1,2,3,4].forEach(k=>{x.slots[k]=A[k]});x.slots[3]=A[4];x.slots[4]=A[3];
ok(SAEL.checkSetup(S).marks==3&&S.marks==3&&x.chk,'3 right + 2 swapped = 3 marks (a right card in the wrong spot scores 0)');
ok(SAEL.checkSetup(S).r=='locked'&&SAEL.tapSpot(x,0)===false&&SAEL.selCard(x,'x')===false&&SAEL.clear(x)===false&&S.marks==3,'after the check the setup is locked, no double marking');
ok(SAEL.choose(x,'a')===false&&SAEL.checkQ(S).r=='locked','questions stay locked until Seterusnya');
ok(SAEL.next(S)=='step'&&x.ph==1&&!x.chk,'next moves to question 1');
ok(SAEL.checkQ(S).r=='incomplete'&&SAEL.choose(x,'zzz')===false&&SAEL.choose(x,'c')&&SAEL.choose(x,'b')&&x.pick=='b','a question needs a choice, a bad id is ignored, the choice can change');
let r=SAEL.checkQ(S);ok(r.ok&&r.marks==2&&S.marks==5&&SAEL.checkQ(S).r=='locked'&&SAEL.next(S)=='step'&&x.ph==2&&x.pick===null,'right answer on question 1 = 2 marks, locked, next clears the choice');
SAEL.choose(x,'a');r=SAEL.checkQ(S);ok(!r.ok&&r.marks==0&&S.marks==5,'a wrong answer = 0 marks');SAEL.next(S);
SAEL.choose(x,x.d.q[2].a);r=SAEL.checkQ(S);ok(r.marks==1&&x.marks==3+2+0+1&&SAEL.next(S)=='cycle'&&S.i==1,'question 3 = 1 mark; experiment total 6; next goes to experiment 2');
/* answers are checked by id, not by position */
const run=sd=>{const T=SAEL.newSession(seed(sd));return perfect(T),T.marks};ok(run(1)==30&&run(99)==30&&run(12345)==30,'any shuffle gives the same score (checked by id, not by position)');
ok(SAEL.shuffle(SAED[0].cards.map(c=>c[0]),seed(1)).join()!=SAEL.shuffle(SAED[0].cards.map(c=>c[0]),seed(2)).join(),'different seeds shuffle differently');
/* ---- screen (fake DOM) ---- */
let closed=0,done=[];const rootEl=()=>body.children[0];
const btn=t=>rootEl().all().find(e=>e.tagName=='BUTTON'&&e.textContent==t);const txt=()=>rootEl().textContent;
SAE.open({sub:'sainsex',lock:null,onClose:()=>closed++,onDone:r=>done.push(r)});
ok(SAE.isOpen()&&rootEl().id=='sainsex'&&txt().includes('Penyiasatan Saintifik')&&txt().includes('Tahap: Sukar')&&txt().includes('Belum dimainkan')&&winL.keydown,'opens on the intro, root #sainsex, key listener on');
ok(txt().includes('Pilih satu nombor')&&txt().includes('seret kad')&&txt().includes('jumlah 30 markah'),'intro text in Malay says "pilih"');
btn('Mula').click();ok(txt().includes('Eksperimen 3A')&&txt().includes('BAHAGIAN 1/2')&&txt().includes('Markah 0/30'),'Mula: experiment 3A, part 1');
ok(rootEl().all().filter(e=>e.has('xer')).length==0&&rootEl().all().filter(e=>e.has('xem')).length==5&&rootEl().all().filter(e=>e.has('xek')).length==7,'no rows before the check, 5 numbered tags on the diagram, 7 cards in the tray');
btn('Semak Jawapan').click();ok(txt().includes('Letakkan kad pada kesemua 5 petak dahulu'),'Semak with empty spots = polite message');
const card=l=>rootEl().all().find(e=>e.has('xek')&&e.textContent==l),row=k=>rootEl().all().filter(e=>e.has('xer'))[k],mark=k=>rootEl().all().filter(e=>e.has('xem'))[k];
const hint=()=>rootEl().all().find(e=>e.has('xebl')).textContent;
ok(mark(0).has('pu')&&hint().includes('Pilih nombor 1 dahulu'),'first play: number 1 pulses and the hint says to start with number 1');
mark(3).click();ok(hint().includes('Nombor 4: Alat mengukur')&&!mark(0).has('pu'),'tap a number: the hint bubble shows its caption and the pulse stops');
card('Pembaris').click();ok(!card('Pembaris')&&mark(3).has('fl')&&hint().includes('Jawapan: Pembaris'),'number first, then card: card placed, the hint shows the answer');
ok(mark(3).children.some(c=>c.has('xei'))&&mark(3).children.some(c=>c.has('xenb')),'a filled tag shows the card icon and a small number badge');
mark(3).click();ok(card('Pembaris')&&!mark(3).has('fl'),'tapping a filled tag takes the card back');
card('Pembaris').click();ok(card('Pembaris').has('on'),'tapping a card highlights it');mark(3).click();ok(!card('Pembaris')&&mark(3).has('fl'),'card first, then number: placed');
mark(3).click();
{const ev=(x,y)=>({button:0,pointerId:7,clientX:x,clientY:y,preventDefault(){}}),ghost=()=>rootEl().all().some(e=>e.has('xegh')),R2={left:100,right:132,top:100,bottom:132,width:32,height:32};
 mark(1).rect=R2;let c1=card('Tinggi pokok');c1.onpointerdown(ev(10,10));c1.onpointermove(ev(14,12));ok(!ghost(),'a tiny move is not a drag yet');
 c1.onpointermove(ev(60,60));ok(ghost()&&c1.has('dg'),'moving far starts a drag ghost');c1.onpointermove(ev(116,116));ok(mark(1).has('dt'),'the tag under the finger is highlighted');
 c1.onpointerup(ev(116,116));ok(!card('Tinggi pokok')&&mark(1).has('fl')&&!ghost(),'drop on a tag places the card and removes the ghost');c1.onclick({});
 mark(1).rect=R2;let c2=card('Dalam almari gelap');c2.onpointerdown(ev(10,10));c2.onpointermove(ev(60,60));c2.onpointerup(ev(116,116));c2.onclick({});
 ok(mark(1).has('fl')&&!card('Dalam almari gelap')&&card('Tinggi pokok'),'drop on a filled tag swaps: the old card goes back to the tray');
 let c3=card('Pembaris');c3.onpointerdown(ev(10,10));c3.onpointermove(ev(60,60));c3.onpointerup(ev(300,300));c3.onclick({});ok(card('Pembaris')&&!ghost(),'drop away from every tag changes nothing');
 c3=card('Pembaris');c3.onpointerdown(ev(10,10));c3.onpointerup(ev(10,10));c3.onclick({});ok(card('Pembaris').has('on'),'press and release without moving still counts as a tap (card selected)');}
btn('Kosongkan').click();
ok(rootEl().all().filter(e=>e.has('xek')).every(e=>e.children.some(c=>c.has('xei'))),'every tray card has an icon slot');
const fullRun=(wrong)=>{for(let e=0;e<3;e++){const d=SAED[e];d.slots.forEach((s,k)=>{const lab=d.cards.find(c=>c[0]==s.a)[1];card(lab).click();mark(k).click()});btn('Semak Jawapan').click();ok(txt().includes('Susunan: 5/5')&&row(0).has('ok'),'3'+'ABC'[e]+': setup all right, rows turn green');btn('Seterusnya').click();
 d.q.forEach((q,qi)=>{const choiceBtns=rootEl().all().filter(b=>b.tagName=='BUTTON'&&b.parent&&b.parent.has('xeo'));ok(choiceBtns.length==3&&txt().includes(q.p),'3'+'ABC'[e]+' question '+(qi+1)+': prompt and 3 choices');const right=q.c.find(c=>c[0]==q.a)[1];choiceBtns.find(b=>b.textContent.endsWith(right)).click();btn('Semak Jawapan').click();ok(txt().includes('Soalan '+(qi+1)+': '+q.m+'/'+q.m),'question '+(qi+1)+' right = '+q.m+' marks');btn(qi==2?(e==2?'Lihat Keputusan':'Eksperimen Seterusnya'):'Seterusnya').click()})}};
fullRun();
ok(txt().includes('Markah: 30/30')&&txt().includes('A+')&&txt().includes('LULUS'),'perfect run: results 30/30, A+, LULUS');
ok(ctx.cur.quiz.sainsex&&ctx.cur.quiz.sainsex.sukar&&ctx.cur.quiz.sainsex.sukar.best==10&&ctx.cur.quiz.sainsex.sukar.g=='A+','saved as cur.quiz.sainsex.sukar, scaled to 10, grade A+');
ok(done.length==1&&done[0].sc==10&&done[0].raw==30&&done[0].g=='A+','onDone({sc,raw,g}) called once when the results screen shows');
ok(txt().includes('Eksperimen 3A: 10/10')&&txt().includes('Eksperimen 3C: 10/10'),'results list the 3 experiments');
btn('Main Lagi').click();ok(txt().includes('Eksperimen 3A')&&txt().includes('Markah 0/30'),'Main Lagi starts a fresh session');
btn('Kembali').click();ok(txt().includes('Keluar dari kuiz ini?'),'Kembali asks first');SAE.back();ok(!txt().includes('Keluar dari kuiz ini?')&&txt().includes('Eksperimen 3A'),'Back with the dialog open = keep playing');
SAE.back();btn('Keluar').click();ok(txt().includes('Penyiasatan Saintifik')&&txt().includes('Terbaik: 10/10'),'Keluar goes to the intro, which shows the best record');
ok(done.length==1,'quitting mid-run does not call onDone and does not save');
SAE.back();ok(!SAE.isOpen()&&closed==1,'Back on the intro closes the screen and calls onClose');
/* a worse second run never lowers the record */
{const r2=ctx.recQuiz('sainsex','sukar',3);ok(r2.best==10&&r2.g=='A+'&&ctx.cur.quiz.sainsex.sukar.best==10,'a worse later score never lowers the best record')}
/* ---- Sains door rule + class grade (stationDone in js/kelas.js), run on stubs ---- */
const kj=R('js/kelas.js'),html=R('kelas.html'),sw=R('sw.js'),css=R('css/style.css');
const fm=kj.match(/function stationDone\(i,r\)\{[^\n]*\}\n/);ok(!!fm,'stationDone found in js/kelas.js');
function door(HASL){const log=[];const c2={HASL,SXB:[null,null,null],quizDone:r=>log.push(r),quizGrade,Math};vm.createContext(c2);vm.runInContext(fm[0]+';globalThis.sd=stationDone',c2);return{sd:c2.sd,log,SXB:c2.SXB}}
let dr=door(true);dr.sd(0,{sc:10});dr.sd(1,{sc:6});ok(dr.log.length==0,'2 of 3 stations done: no class grade, door stays shut');
dr.sd(2,{sc:5});ok(dr.log.length==1&&dr.log[0].pct==70&&dr.log[0].g==quizGrade(7).g,'3 of 3 done: class grade = average of 10, 6, 5 = 7 -> pct 70, door opens (quizDone called once)');
dr.sd(1,{sc:2});ok(dr.log.length==2&&dr.log[1].pct==70&&dr.SXB[1]==6,'a worse retry never lowers the station mark (best attempt in the visit)');
dr.sd(1,{sc:9});ok(dr.log[2].pct==80&&dr.SXB.join()=='10,9,5','a better retry raises the class grade (10, 9, 5 -> 8)');
dr=door(true);dr.sd(2,{sc:0});dr.sd(1,{sc:0});dr.sd(0,{sc:0});ok(dr.log.length==1&&dr.log[0].pct==0,'any score counts for the door (even 0 on all three), the grade is just low');
dr=door(true);dr.sd(0,{sc:10});dr.sd(1,{sc:10});dr.sd(2,{sc:10});ok(dr.log[0].pct==100&&dr.log[0].g=='A+','10, 10, 10 = A+ / 100');
dr=door(true);dr.sd(0,{sc:7});dr.sd(1,{sc:7});dr.sd(2,{sc:8});ok(dr.log[0].pct==73&&dr.log[0].g==quizGrade(7).g,'rounding: 7, 7, 8 -> average 7.33 -> pct 73, grade from round(7.33) = 7');
dr=door(false);dr.sd(0,{sc:10});dr.sd(1,{sc:10});dr.sd(2,{sc:10});ok(dr.log.length==0,'HASL false (Mod Jalan-jalan of other rooms / missing station): nothing happens');
/* ---- wiring ---- */
ok(/function leave\(\)\{if\(STORY&&!QDONE\)/.test(kj)&&/HASL\?'Selesaikan ketiga-tiga stesen eksperimen dahulu\.'/.test(kj),'kelas.js: the door rule is the existing STORY && !QDONE check, with a Sains message');
ok(/const HASL=QLAB&&typeof SAM!='undefined'&&typeof SAE!='undefined';let QDONE=!HASQ&&!HASL/.test(kj),'kelas.js: QDONE starts false only when the Sains lab has all 3 stations; other rooms unchanged');
ok(/const HASQ=QENG\|\|QBM\|\|\(typeof QD!='undefined'&&!!QD\[SUB\]\)/.test(kj),'kelas.js: HASQ unchanged');
ok(/if\(i==2&&QLAB&&HASL\)\{halt=true;document\.body\.classList\.add\('mn'\);QE\.open\(\{sub:'sainsex',lock:null,onClose:shut,onDone:r=>stationDone\(2,r\)\}\);return\}/.test(kj),'kelas.js: station(2) opens SAE');
ok(/QE=QLAB\?\(typeof SAM!='undefined'\?\{open:o=>\(o&&o\.sub=='sainsex'&&typeof SAE!='undefined'\?SAE:o&&o\.sub=='sainsmm'\?SAM:SAP\)\.open\(o\)/.test(kj)&&/SAE\.isOpen\(\)\?SAE\.back\(\)/.test(kj)&&/\|\|\(typeof SAE!='undefined'&&SAE\.isOpen\(\)\)/.test(kj),'kelas.js: QE router knows SAE; Back and isOpen cover all three screens');
ok(/function sit\(\)\{sitting=true;[^]*?onDone:quizDone\}\)/.test(kj)&&/function quizDone\(r\)\{QDONE=true;QRES=r;if\(STORY\)\{const x=recRoom\(SUB,r\.pct\)/.test(kj),'kelas.js: sit() and quizDone() unchanged');
ok(/Selesaikan 3 stesen untuk membuka pintu/.test(kj),'kelas.js: hello toast tells the Sains class about the 3 stations');
const ix=n=>html.indexOf('"js/'+n+'"');ok(ix('kelas-sains-ex-data.js')>ix('kelas-sains-mm.js')&&ix('kelas-sains-ex-art.js')>ix('kelas-sains-ex-data.js')&&ix('kelas-sains-ex.js')>ix('kelas-sains-ex-art.js')&&ix('kelas-sains-ex.js')<html.indexOf('"js/kelas.js"'),'kelas.html: the three files load after Meja Makmal and before js/kelas.js');
ok(/CACHE='sr-r\d+[a-z]*\d*'/.test(sw)&&['kelas-sains-ex-data.js','kelas-sains-ex-art.js','kelas-sains-ex.js'].every(f=>sw.includes("'js/"+f+"'")),'sw.js: cache sr-r10k and the three new files pre-cached');
const own=['kelas-sains-ex-data.js','kelas-sains-ex-art.js','kelas-sains-ex.js'];const others=fs.readdirSync(path.join(__dirname,'..','js')).filter(f=>!own.includes(f)).map(f=>R('js/'+f)).join('\n');
ok(['SAEC','SAED','SAEL','SAEA','SAEALT','saeArt','SAEI','saeIcon','SAE','SA_O','SA_C','SA_D','SA_P','SA_B','SXB','HASL'].every(n=>n=='SXB'||n=='HASL'?true:!new RegExp('(const|let|var|function|class)\\s+'+n+'\\b').test(others)),'new global names are not declared anywhere else');
ok((kj.match(/\bSXB\b/g)||[]).length>=2&&(kj.match(/\bHASL\b/g)||[]).length>=4&&!/\b(SXB|HASL)\b/.test(fs.readdirSync(path.join(__dirname,'..','js')).filter(f=>f!='kelas.js').map(f=>R('js/'+f)).join('\n')),'SXB and HASL only exist in kelas.js');
ok(!/id=["']sainsex["']|#sainsex|\.xe[a-z0-9]*\b/.test(css+html),'root id sainsex and the xe classes are not used in css/style.css or kelas.html');
const rid=[...['kelas-quiz.js','kelas-spell.js','kelas-susun.js','kelas-sains.js','kelas-sains-mm.js','kelas-sains-ex.js'].map(f=>(R('js/'+f).match(/root\.id='([a-z]+)'/)||[])[1])];ok(new Set(rid).size==rid.length&&rid.every(Boolean),'root ids are all different: '+rid.join(', '));
ok(/Round 10k/.test(R('README.md'))&&/_backup_round10k/.test(R('README.md'))&&/Round 10j3/.test(R('README.md'))&&/Round 10i3/.test(R('README.md')),'README has the Round 10k entry and keeps the old text');
console.log(fail?fail+' FAILED, '+pass+' passed':'all '+pass+' checks passed');process.exit(fail?1:0);
