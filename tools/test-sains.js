/* Round 10i: Node stub test (NOT a real browser, no three.js) for the Sains Papan Putih quiz: data, logic, scoring, saving, wiring and the screen on a tiny fake DOM.
   Run: node tools/test-sains.js */
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
vm.runInContext(R('js/kelas-quiz-data.js')+R('js/kelas-visuals.js')+R('js/kelas-sains-data.js')+R('js/kelas-sains-art.js')+'function recQuiz(sub,level,marks){cur.quiz=cur.quiz||{};const q=cur.quiz[sub]=cur.quiz[sub]||{},r=q[level]=q[level]||{best:0,n:0};r.n++;if(marks>=r.best||!r.g){r.best=Math.max(r.best,marks);r.g=quizGrade(r.best).g}save();return r}\n'+R('js/kelas-sains.js')+';globalThis.T={SAP,SANL,SAND,SANC,QCFG,quizGrade,SANA,SANALT,sainsArt}',ctx);
const {SAP,SANL,SAND,SANC,QCFG,quizGrade,SANA,SANALT,sainsArt}=ctx.T;
/* ---- data ---- */
ok(SAND.length==3&&SAND.map(d=>d.id).join()=='katak,bunga,ayam','3 cycles: katak, bunga, ayam');
ok(SAND.every(d=>d.c.length==5&&new Set(d.c.map(c=>c[0])).size==5&&d.c.every(c=>c[1])&&d.t&&d.a&&d.e),'every cycle: 5 unique card ids with labels, title, instruction, explanation');
ok(new Set(SAND.flatMap(d=>d.c.map(c=>c[0]))).size==15,'15 card ids unique across cycles');
ok(SAND[0].c.map(c=>c[1]).join('|')=='Telur|Berudu|Berudu berkaki|Katak muda|Katak dewasa','katak order as in the spec');
ok(SAND[1].c.map(c=>c[1]).join('|')=='Benih|Benih bercambah|Anak benih|Tumbuhan matang|Tumbuhan berbunga yang menghasilkan benih','tumbuhan order as in the spec');
ok(SAND[2].c.map(c=>c[1]).join('|')=='Telur yang disenyawakan|Embrio berkembang di dalam telur|Anak ayam menetas|Anak ayam membesar menjadi ayam muda|Ayam dewasa menghasilkan telur','ayam order as in the spec');
ok(/Embrio berkembang di dalam telur sebelum anak ayam menetas/.test(SAND[2].e),'ayam explanation says the embryo develops inside the egg');
ok(SANC.per*5*3==SANC.max&&SANC.max==30,'2 marks x 5 cards x 3 cycles = 30');
ok(!/ketik/i.test(R('js/kelas-sains.js')+R('js/kelas-sains-data.js')),'game text never says "ketik"');
/* ---- shuffle ---- */
let allDiff=true,allPerm=true;for(let t=0;t<300;t++){const S=SANL.newSession();S.qs.forEach(q=>{const ids=q.d.c.map(c=>c[0]);if(q.order.join()==ids.join())allDiff=false;if(q.order.slice().sort().join()!=ids.slice().sort().join())allPerm=false})}
ok(allDiff&&allPerm,'300 sessions: shuffled order is never the answer order and always a permutation');
ok(SANL.shuffle(['a','b','c'],()=>0).join()!='a,b,c','a bad rng still gives a non-answer order');
/* ---- placing ---- */
let S=SANL.newSession(),q=SANL.cur(S);const ids=q.d.c.map(c=>c[0]);
ok(q.slots.every(s=>s===null)&&SANL.pool(q).length==5,'new cycle: 5 empty slots, 5 cards in the pool');
ok(SANL.place(q,ids[0])&&q.slots[0]==ids[0]&&SANL.pool(q).length==4,'place without a slot = first empty slot');
ok(SANL.place(q,ids[1],3)&&q.slots[3]==ids[1],'place into a chosen slot');
ok(SANL.place(q,ids[2],3)&&q.slots[3]==ids[2]&&SANL.pool(q).includes(ids[1]),'placing on a taken slot sends the old card back to the pool');
ok(SANL.place(q,ids[2],0)&&q.slots[0]==ids[2]&&q.slots[3]==ids[0],'dragging a placed card onto another slot swaps them');
ok(!SANL.place(q,ids[2],0)&&!SANL.place(q,ids[2]),'same slot / already placed (no slot given) = no change');
ok(!SANL.place(q,'nope',1)&&!SANL.place(q,ids[1],9)&&!SANL.place(q,ids[1],-1),'unknown card or bad slot rejected');
ok(SANL.unplace(q,ids[2])&&q.slots[0]===null&&!SANL.unplace(q,ids[2]),'unplace returns a card once');
ok(SANL.clear(q)&&q.slots.every(s=>s===null)&&!SANL.clear(q),'Cuba Semula clears all slots');
ok(SANL.check(S).r=='incomplete'&&q.status=='play'&&S.marks==0,'check with an empty slot: incomplete, nothing scored');
/* ---- scoring ---- */
const fill=(q,order)=>{SANL.clear(q);order.forEach((id,k)=>SANL.place(q,id,k))};
S=SANL.newSession();q=SANL.cur(S);fill(q,ids);let r=SANL.check(S);
ok(r.r=='ok'&&r.marks==10&&q.marks==10&&S.marks==10&&q.ok.every(Boolean),'all 5 right = 10 marks');
ok(SANL.check(S).r=='locked'&&S.marks==10,'checking again gives no second marks');
ok(!SANL.place(q,ids[0],1)&&!SANL.unplace(q,ids[0])&&!SANL.clear(q),'a checked cycle is locked');
ok(SANL.advance(S)&&S.i==1&&!S.done,'advance to cycle 2');
q=SANL.cur(S);const i2=q.d.c.map(c=>c[0]);fill(q,[i2[1],i2[0],i2[2],i2[3],i2[4]]);r=SANL.check(S);
ok(r.marks==6&&q.ok.join()=='false,false,true,true,true'&&S.marks==16,'2 swapped = 3 right = 6 marks, total 16');
ok(!SANL.advance(SANL.newSession()),'cannot advance before checking');
SANL.advance(S);q=SANL.cur(S);const i3=q.d.c.map(c=>c[0]);fill(q,i3.slice().reverse());r=SANL.check(S);
ok(r.marks==2&&S.marks==18,'reversed ayam: only the middle card fits = 2 marks (total 18)');
ok(SANL.advance(S)&&S.done,'after cycle 3 the session is done');
const perfect=SANL.newSession();perfect.qs.forEach((qq,k)=>{perfect.i=k;fill(qq,qq.d.c.map(c=>c[0]));SANL.check(perfect);});
ok(perfect.marks==30,'perfect session = 30, never above the cap');
ok(SANL.scale(30)==10&&SANL.scale(28)==9&&SANL.scale(26)==8&&SANL.scale(24)==8&&SANL.scale(18)==6&&SANL.scale(16)==5&&SANL.scale(0)==0&&SANL.scale(99)==10&&SANL.scale(-4)==0,'scale: floor(raw/3), clamped 0..30');
ok(quizGrade(SANL.scale(30)).g=='A+'&&quizGrade(SANL.scale(28)).g=='A'&&quizGrade(SANL.scale(18)).g=='C'&&quizGrade(SANL.scale(16)).g=='Gagal','grades: 30 A+, 28 A, 18 C (pass), 16 Gagal');
/* ---- Round 10i2: the 15 pictures ---- */
{const ids=SAND.flatMap(d=>d.c.map(c=>c[0]));
 ok(Object.keys(SANA).sort().join()==ids.slice().sort().join()&&Object.keys(SANALT).sort().join()==ids.slice().sort().join(),'a picture and an alt text for each of the 15 card ids, no extras');
 const bad=[];ids.forEach(id=>{const x=sainsArt(id);const body=x.replace(/^<svg [^>]*>/,'').replace(/<\/svg>$/,'');
  if(!/^<svg viewBox="0 0 100 100" xmlns="http:\/\/www\.w3\.org\/2000\/svg" role="img" aria-label="[^"]+"/.test(x)||!/<\/svg>$/.test(x))bad.push(id+': wrapper');
  if(/<text|<image|href=|<script|<foreignObject|url\(|https?:/.test(body))bad.push(id+': forbidden content');
  if((body.match(/<[a-z]+[^>]*>/g)||[]).some(t=>!/\/>$/.test(t)))bad.push(id+': a tag is not self-closed');
  if((body.match(/<(?:path|ellipse|circle|rect)\b/g)||[]).length<4)bad.push(id+': too few shapes');
  if(x.length>3600)bad.push(id+': over 3600 characters ('+x.length+')')});
 ok(bad.length==0,'every picture is a self-contained SVG (viewBox, alt, no text/images/links, tags closed, 4+ shapes, under 3600 chars): '+bad.join('; '));
 ok(sainsArt('nope')==='','unknown id gives an empty string, no error');
 ok(new Set(ids.map(id=>sainsArt(id))).size==15,'all 15 pictures are different');
 ok(ids.every(id=>SANALT[id]&&!/^\s*$/.test(SANALT[id])),'alt texts are not empty');
 ok(ids.reduce((n,id)=>n+sainsArt(id).length,0)<30000,'all pictures together stay small (under 30 KB)')}
/* ---- screen on the fake DOM ---- */
let closed=0,doneCalled=0;const rootEl=()=>body.children[0];
const btn=t=>rootEl().all().find(e=>e.tagName=='BUTTON'&&e.textContent==t),slots=()=>rootEl().all().filter(e=>e.has('xsk')),pool=()=>rootEl().all().find(e=>e.has('xpp')),pcards=()=>pool().children,scards=()=>slots().map(s=>s.children.find(c=>c.has('cd')));
const press=(b)=>{b.onpointerdown({button:0,clientX:5,clientY:5,pointerId:1});b.onpointerup({pointerId:1})};
const drag=(b,x,y)=>{b.onpointerdown({button:0,clientX:5,clientY:5,pointerId:1});b.onpointermove({pointerId:1,clientX:5,clientY:5+20,preventDefault(){}});b.onpointermove({pointerId:1,clientX:x,clientY:y,preventDefault(){}});b.onpointerup({pointerId:1})};
const setRects=()=>{slots().forEach((s,k)=>{s.rect={left:k*100,right:k*100+90,top:0,bottom:80,width:90,height:80}});pool().rect={left:0,right:500,top:200,bottom:300,width:500,height:100}};
SAP.open({sub:'sainspp',lock:null,onClose:()=>closed++,onDone:()=>doneCalled++});
ok(SAP.isOpen()&&rootEl().textContent.includes('Kitaran Kehidupan')&&rootEl().textContent.includes('Belum dimainkan'),'intro shows the title and "Belum dimainkan"');
btn('Mula').click();ok(rootEl().textContent.includes('Kitaran 1/3')&&rootEl().textContent.includes('Markah: 0/30')&&slots().length==5&&pcards().length==5,'cycle 1/3: 5 slots, 5 cards, Markah 0/30');
btn('Semak Jawapan').click();ok(rootEl().textContent.includes('Lengkapkan semua 5 petak')&&btn('Semak Jawapan'),'check with empty slots asks to finish');
press(pcards()[0]);ok(scards().filter(Boolean).length==1&&pcards().length==4,'short press puts a card in a slot');
press(scards().find(Boolean));ok(scards().filter(Boolean).length==0&&pcards().length==5,'short press on a placed card sends it back');
setRects();const c0=pcards()[0];drag(c0,2*100+40,40);ok(scards()[2]&&scards()[2].textContent==c0.textContent,'dragging a card onto slot 3 puts it exactly there');
const moved=scards()[2];setRects();drag(moved,4*100+40,40);ok(!scards()[2]&&scards()[4]&&scards()[4].textContent==moved.textContent,'dragging a placed card to slot 5 moves it');
setRects();drag(scards()[4],100,250);ok(scards().filter(Boolean).length==0&&pcards().length==5,'dragging a placed card onto the pool returns it');
press(pcards()[0]);btn('Cuba Semula').click();ok(scards().filter(Boolean).length==0,'Cuba Semula clears the slots');
/* solve cycle 1 correctly through the screen: place cards by their label in the right order */
const labelsOrder=idx=>SAND[idx].c.map(c=>c[1]);
const fillScreen=(idx,swap)=>{const ord=labelsOrder(idx).slice();if(swap){const t=ord[0];ord[0]=ord[1];ord[1]=t}
 while(scards().some(Boolean))press(scards().find(Boolean));
 setRects();ord.forEach((lab,k)=>{const b=pcards().find(c=>c.textContent==lab);drag(b,k*100+40,40);setRects()})};
fillScreen(0,false);btn('Semak Jawapan').click();
ok(rootEl().textContent.includes('Betul semua')&&rootEl().textContent.includes('Markah: 10/30')&&!btn('Semak Jawapan')&&btn('Kitaran Seterusnya'),'cycle 1 correct: full marks 10/10, header 10/30, next button, check button gone');
ok(slots().every(s=>s.has('ok'))&&rootEl().all().filter(e=>e.textContent=='✔').length==5,'right slots show a tick (not colour only)');
ok(rootEl().textContent.includes('Katak melalui perubahan bentuk'),'explanation shown');
ok(pool().style.display=='none'&&rootEl().textContent.includes('URUTAN BETUL')&&rootEl().textContent.includes('IKUT ARAH JAM'),'after the check the card box is hidden and the ring is titled URUTAN BETUL');
ok(scards().every((c,k)=>c&&c.dataset.id==SAND[0].c[k][0]),'after the check the ring shows the 5 correct pictures in order (slot 1 to 5, clockwise)');
ok(slots().every(s=>s.children.some(c=>c.has('cd')&&c.children[0].has('xim')&&c.children[0].attrs['aria-hidden']=='true'&&c.children[1].has('xtx'))),'each card: picture box (hidden from screen readers) above the label');
{const cd=slots()[0].children.find(c=>c.has('cd'));ok(cd.disabled&&!cd.onpointerdown&&slots().every(s=>s.has('ok')),'a checked card is disabled and has no drag handler');}
btn('Kitaran Seterusnya').click();ok(rootEl().textContent.includes('Kitaran 2/3'),'cycle 2/3');
fillScreen(1,true);btn('Semak Jawapan').click();
ok(rootEl().textContent.includes('Markah: 6/10')&&rootEl().textContent.includes('Urutan betul: 1. Benih')&&rootEl().textContent.includes('Markah: 16/30')&&rootEl().all().filter(e=>e.textContent=='✘').length==2,'cycle 2 with 2 swapped: 6/10, shows the right order, 2 crosses, total 16/30');
btn('Kitaran Seterusnya').click();
btn('Kembali').click();ok(rootEl().textContent.includes('Keluar dari kuiz ini?')&&rootEl().textContent.includes('tidak akan disimpan'),'Kembali asks to confirm');
winL.keydown({key:'Escape',preventDefault(){},stopPropagation(){}});ok(!rootEl().textContent.includes('Keluar dari kuiz ini?')&&rootEl().textContent.includes('Kitaran 3/3'),'Escape / Back with the dialog open = keep playing');
SAP.back();ok(rootEl().textContent.includes('Keluar dari kuiz ini?'),'Back during play asks to confirm');
btn('Keluar').click();ok(rootEl().textContent.includes('Tahap: Mudah')&&!ctx.cur.quiz.sainspp,'leaving goes to the intro, nothing saved');
btn('Mula').click();fillScreen(0,false);btn('Semak Jawapan').click();btn('Kitaran Seterusnya').click();fillScreen(1,false);btn('Semak Jawapan').click();btn('Kitaran Seterusnya').click();fillScreen(2,false);
ok(btn('Semak Jawapan'),'cycle 3 not yet checked');const sv0=saved.n;btn('Semak Jawapan').click();ok(btn('Lihat Keputusan'),'last cycle ends with Lihat Keputusan');
btn('Lihat Keputusan').click();
ok(rootEl().textContent.includes('Markah: 30/30')&&rootEl().textContent.includes('A+')&&rootEl().textContent.includes('LULUS')&&rootEl().textContent.includes('Rekod terbaik: 10/10 · A+'),'result: 30/30, A+, LULUS, best 10/10');
ok(ctx.cur.quiz.sainspp&&ctx.cur.quiz.sainspp.mudah.best==10&&ctx.cur.quiz.sainspp.mudah.g=='A+'&&ctx.cur.quiz.sainspp.mudah.n==1&&saved.n>sv0,'saved once under cur.quiz.sainspp.mudah (scaled 10, A+) and save() called');
ok(!ctx.cur.quiz.eng&&!ctx.cur.quiz.bm&&!ctx.cur.quiz.mat,'other quiz records untouched');
ok(doneCalled>=1,'Round 10k: onDone is called when the results screen shows (the Sains door rule and class grade use it)');
btn('Main Lagi').click();ok(rootEl().textContent.includes('Kitaran 1/3')&&rootEl().textContent.includes('Markah: 0/30'),'Main Lagi restarts at cycle 1 with 0 marks');
fillScreen(0,true);fillScreen(0,true);btn('Semak Jawapan').click();btn('Kitaran Seterusnya').click();for(const i of[1,2]){fillScreen(i,true);btn('Semak Jawapan').click();if(i==1)btn('Kitaran Seterusnya').click()}btn('Lihat Keputusan').click();
ok(ctx.cur.quiz.sainspp.mudah.n==2&&ctx.cur.quiz.sainspp.mudah.best==10,'worse second round (18/30 -> 6) is counted but the best stays 10/10');
btn('Tutup').click();ok(!SAP.isOpen()&&closed==1,'Tutup closes and calls onClose once');
SAP.open({onClose:()=>closed++});ok(SAP.isOpen()&&rootEl().textContent.includes('Terbaik: 10/10 · A+'),'reopen: intro shows the saved best');SAP.back();ok(!SAP.isOpen()&&closed==2,'Back on the intro closes');
SAP.open({onClose:()=>closed++});btn('Mula').click();SAP.close();ok(!SAP.isOpen()&&!winL.keydown,'close during play removes the key listener');
/* old save (no cur.quiz at all) */
ctx.cur={};SAP.open({onClose(){}});ok(rootEl().textContent.includes('Belum dimainkan'),'old save without cur.quiz: intro still works');btn('Mula').click();fillScreen(0,false);btn('Semak Jawapan').click();btn('Kitaran Seterusnya').click();fillScreen(1,false);btn('Semak Jawapan').click();btn('Kitaran Seterusnya').click();fillScreen(2,false);btn('Semak Jawapan').click();btn('Lihat Keputusan').click();ok(ctx.cur.quiz.sainspp.mudah.best==10,'old save: cur.quiz is created and the result saved');SAP.close();
/* ---- no name clashes between the scripts kelas.html loads together (Round 10i first version broke because SPCFG and SPL already existed in kelas-spell-data.js) ---- */
{const L=JSON.parse(html0().match(/const L=(\[[^\]]*\])/)[1]);
 ok(L.includes('js/kelas-sains-data.js')&&L.includes('js/kelas-sains.js')&&L.length>10,'loader list parsed ('+L.length+' scripts)');
 /* run every pure data script of the loader together in ONE context, in loader order: a name declared twice (const SPCFG / SPL) throws a SyntaxError exactly like in the browser */
 const dctx=vm.createContext({console,Math,JSON,Object,Array,Date,Set,String,Number});let err='';
 L.filter(f=>/-data\.js$/.test(f)).forEach(f=>{if(err)return;try{vm.runInContext(R(f),dctx,{filename:f})}catch(e){err=f+': '+e.message}});
 ok(err==='','all *-data.js scripts load together in loader order'+(err?' ('+err+')':''));
 const eng={},engDup=[];L.forEach(f=>{const m=R(f).match(/^const ([A-Za-z]+)=\(\(\)=>/m);if(m){if(eng[m[1]])engDup.push(m[1]);eng[m[1]]=f}});
 for(const n of['SANA','SANALT','sainsArt']){const c=L.filter(f=>new RegExp('^const '+n+'=','m').test(R(f)));ok(c.length==1&&c[0]=='js/kelas-sains-art.js',n+' declared once, in kelas-sains-art.js')}
 ok(L.indexOf('js/kelas-visuals.js')<L.indexOf('js/kelas-sains-art.js')&&L.indexOf('js/kelas-sains-art.js')<L.indexOf('js/kelas-sains.js'),'loader order: visuals, then art, then the Sains screen');
 ok(['QZ','SP','SUS','SAP'].every(n=>eng[n])&&engDup.length==0,'quiz screen globals QZ, SP, SUS, SAP all present and unique');
 const ids={};let idDup=[];['js/kelas-quiz.js','js/kelas-spell.js','js/kelas-susun.js','js/kelas-sains.js'].forEach(f=>{const m=R(f).match(/root\.id='([a-z]+)'/);if(m){if(ids[m[1]])idDup.push(m[1]);ids[m[1]]=f}});
 ok(Object.keys(ids).length==4&&idDup.length==0,'each quiz screen has its own root id: '+Object.keys(ids).join(','));
 const gcss=R('css/style.css'),mine=[...R('js/kelas-sains.js').matchAll(/#sains \.([a-z0-9]+)/g)].map(m=>m[1]);let hit=[];
 [...new Set(mine)].forEach(c=>{if(new RegExp('(^|[},{\\n])\\s*[a-z]*\\.'+c+'(?![a-z0-9_-])').test(gcss))hit.push(c)});
 ok(hit.length==0,'no class of the Sains screen is also a global class in css/style.css: '+hit.join(', '))}
function html0(){return R('kelas.html')}
/* ---- wiring (text checks on the real files) ---- */
const kj=R('js/kelas.js'),html=R('kelas.html'),sw=R('sw.js');
ok(/QLAB=LAB&&typeof SAP!='undefined'/.test(kj)&&/QE=QLAB\?\(typeof SAM!='undefined'\?\{[^]*?\}:SAP\):QBM\?SUS:QENG\?SP:QZ/.test(kj),'kelas.js: QE points to SAP in the lab (Round 10j: through a router that also knows SAM, falls back to SAP), other subjects unchanged');
ok(/const HASQ=QENG\|\|QBM\|\|\(typeof QD!='undefined'&&!!QD\[SUB\]\)/.test(kj),'kelas.js: HASQ unchanged (still false for sains: no door rule)');
ok(/function station\(i\)\{if\(i==0&&QLAB\)\{halt=true;document\.body\.classList\.add\('mn'\);QE\.open\(\{sub:'sainspp',lock:null,onClose:shut,onDone:r=>stationDone\(0,r\)\}\);return\}/.test(kj),'kelas.js: station(0) opens SAP with halt + mn and shut on close (Round 10k: plus onDone for the Sains door rule)');
ok(/QE\.open\(\{sub:'sainspp'[^)]*onDone:r=>stationDone\(0,r\)/.test(kj)&&/function stationDone\(i,r\)\{if\(!HASL/.test(kj),'kelas.js: Round 10k: the class grade is set only by stationDone, after all 3 stations');
ok(/function sit\(\)\{sitting=true;[^]*?QE\.open\(\{sub:SUB,lock:STORY\?\(cur\.level\|\|'sederhana'\):null,onClose:shut,onDone:quizDone\}\)/.test(kj),'kelas.js: other quizzes still use the Mod Kelas level lock exactly as before');
ok(html.indexOf('js/kelas-sains-data.js')>html.indexOf('js/kelas-lab.js')&&html.indexOf('js/kelas-sains.js')>html.indexOf('js/kelas-sains-data.js')&&html.indexOf('js/kelas-sains.js')<html.indexOf('"js/kelas.js"'),'kelas.html: data then screen, both before kelas.js');
ok(/CACHE='sr-r\d+[a-z]*\d*'/.test(sw)&&sw.includes("'js/kelas-sains-data.js'")&&sw.includes("'js/kelas-sains-art.js'")&&sw.includes("'js/kelas-sains.js'"),'sw.js: a sr-r10i... cache and the three Sains files pre-cached (Round 10i3: not pinned to one cache name)');
ok(/Round 10i\b/.test(R('README.md'))&&/Round 10i2/.test(R('README.md'))&&/_backup_round10i2/.test(R('README.md')),'README has the Round 10i and Round 10i2 entries');
/* ---- Round 13: ring layout ---- */
{const src=R('js/kelas-sains.js');
 ok(/class=\\?"xrg|'xrg'/.test(src)&&src.includes('ringArrows')&&src.includes('marker-end'),'Kitaran draws clockwise arrows between the 5 slots (xrg svg)');
 ok(/const RR=36/.test(src)&&/Math\.cos\(a\)/.test(src)&&/-90\+k\*360/.test(src),'slots sit on a circle, slot 1 at the top');
 ok(!/ketik/i.test(src),'Kitaran text never says ketik');}
console.log(fail?fail+' FAILED, '+pass+' passed':'all '+pass+' checks passed');process.exit(fail?1:0);
