/* Round 10j: Sains, station Meja Makmal = Rantai Makanan (Sederhana). Data + logic only, no screen code (that is js/kelas-sains-mm.js).
   3 challenges (hutan, gurun, lautan), 10 marks each, 30 for the station. Each challenge has 3 steps:
   1) PILIH: choose the 4 organisms of the chain from 6 cards (4 right + 2 distractors from other places), 1 mark per right card chosen (4)
   2) SUSUN: put the 4 right cards in food-chain order (plant first, top predator last), 1 mark per correct neighbouring pair (3)
   3) ANAK PANAH: choose the direction of the 3 arrows between the organisms, 1 mark per arrow that points to the one that eats (3)
   Answers are checked by card id only (never by screen position). Card order shown is shuffled, the answer order never changes.
   Saving: the screen calls recQuiz('sainsmm','sederhana',SAML.scale(raw)); 30 marks are scaled to the 10-mark grade scale (QCFG / quizGrade in js/kelas-quiz-data.js).
   Names: SAMC / SAMD / SAML (SANC / SAND / SANL belong to Papan Putih, SPCFG / SPL to the English spelling game). */
const SAMC={key:'sainsmm',level:'sederhana',n:4,pairs:3,arrows:3,per:10,max:30};
const SAMD=[
 {id:'hutan',t:'Rantai Makanan di Hutan',
  c:[['pokok','Pokok'],['ulat','Ulat'],['burung','Burung kecil'],['helang','Helang']],x:[['udang','Udang'],['kaktus','Kaktus']],
  e:'Pokok membuat makanannya sendiri. Ulat makan daun pokok, burung kecil makan ulat, dan helang makan burung kecil. Anak panah menunjuk kepada organisma yang memakan.'},
 {id:'gurun',t:'Rantai Makanan di Gurun',
  c:[['kaktus','Kaktus'],['tikus','Tikus gurun'],['ular','Ular'],['helang','Helang']],x:[['alga','Alga'],['ikan','Ikan kecil']],
  e:'Kaktus membuat makanannya sendiri dan menyimpan air. Tikus gurun makan kaktus, ular makan tikus gurun, dan helang makan ular. Anak panah menunjuk kepada organisma yang memakan.'},
 {id:'lautan',t:'Rantai Makanan di Lautan',
  c:[['alga','Alga'],['udang','Udang'],['ikan','Ikan kecil'],['jerung','Jerung']],x:[['kaktus','Kaktus'],['ulat','Ulat']],
  e:'Alga membuat makanannya sendiri menggunakan cahaya matahari. Udang makan alga, ikan kecil makan udang, dan jerung makan ikan kecil. Anak panah menunjuk kepada organisma yang memakan.'}
];
const SAML={
 /* Fisher-Yates; rnd is injectable for tests. The shuffled order never equals the given order. */
 shuffle(ids,rnd){rnd=rnd||Math.random;let a;for(let t=0;t<20;t++){a=ids.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const x=a[i];a[i]=a[j];a[j]=x}if(a.some((v,i)=>v!==ids[i]))return a}a=ids.slice();a.push(a.shift());return a},
 chain:q=>q.d.c.map(c=>c[0]),
 label:(q,id)=>(q.d.c.concat(q.d.x).find(c=>c[0]===id)||[])[1],
 /* ph: 'pick' -> 'order' -> 'arrow'; chk = this step has been checked (locked, waiting for next) */
 newCycle(d,rnd){return{d,ph:'pick',chk:false,deck:SAML.shuffle(d.c.concat(d.x).map(c=>c[0]),rnd),sel:[],order:[],slots:d.c.map(()=>null),arr:[null,null,null],pm:0,om:0,am:0,marks:0}},
 newSession(rnd){return{qs:SAMD.map(d=>SAML.newCycle(d,rnd)),i:0,marks:0,done:false}},
 cur:S=>S.qs[S.i],
 add(S,q,n){q.marks+=n;S.marks=Math.min(SAMC.max,S.marks+n)},
 /* step 1: choose up to 4 cards (tap again to take one back) */
 toggle(q,id){if(q.ph!='pick'||q.chk||q.deck.indexOf(id)<0)return false;const k=q.sel.indexOf(id);if(k>=0){q.sel.splice(k,1);return true}if(q.sel.length>=SAMC.n)return false;q.sel.push(id);return true},
 checkPick(S){const q=SAML.cur(S);if(q.ph!='pick')return{r:'locked'};if(q.chk)return{r:'locked',marks:q.pm};if(q.sel.length<SAMC.n)return{r:'incomplete',marks:0};
  const ch=SAML.chain(q);q.pm=q.sel.filter(id=>ch.indexOf(id)>=0).length;q.chk=true;SAML.add(S,q,q.pm);return{r:'ok',marks:q.pm}},
 /* step 2: put the 4 right cards in order (a wrong pick in step 1 is replaced by the right card, so everybody can continue) */
 pool:q=>q.order.filter(id=>q.slots.indexOf(id)<0),
 place(q,id){if(q.ph!='order'||q.chk||q.order.indexOf(id)<0||q.slots.indexOf(id)>=0)return false;const i=q.slots.indexOf(null);if(i<0)return false;q.slots[i]=id;return true},
 unplace(q,id){if(q.ph!='order'||q.chk)return false;const k=q.slots.indexOf(id);if(k<0)return false;q.slots[k]=null;return true},
 clear(q){if(q.ph!='order'||q.chk||q.slots.every(s=>s===null))return false;q.slots=q.slots.map(()=>null);return true},
 checkOrder(S){const q=SAML.cur(S);if(q.ph!='order')return{r:'locked'};if(q.chk)return{r:'locked',marks:q.om};if(q.slots.some(s=>s===null))return{r:'incomplete',marks:0};
  const ch=SAML.chain(q);q.om=0;for(let k=0;k<SAMC.pairs;k++)if(q.slots[k]===ch[k]&&q.slots[k+1]===ch[k+1])q.om++;q.chk=true;SAML.add(S,q,q.om);return{r:'ok',marks:q.om}},
 /* step 3: the arrows. The chain is shown in the right order; 'r' = arrow points to the next one (the one that eats) = right, 'l' = wrong way */
 flip(q,k){if(q.ph!='arrow'||q.chk||k<0||k>=SAMC.arrows)return false;q.arr[k]=q.arr[k]=='r'?'l':'r';return true},
 checkArrow(S){const q=SAML.cur(S);if(q.ph!='arrow')return{r:'locked'};if(q.chk)return{r:'locked',marks:q.am};if(q.arr.some(a=>a===null))return{r:'incomplete',marks:0};
  q.am=q.arr.filter(a=>a=='r').length;q.chk=true;SAML.add(S,q,q.am);return{r:'ok',marks:q.am}},
 /* after a check: next step, next challenge, or the end. Returns 'step' | 'cycle' | 'end' | false */
 next(S){const q=SAML.cur(S);if(!q.chk)return false;
  if(q.ph=='pick'){q.ph='order';q.chk=false;q.order=SAML.shuffle(SAML.chain(q));return'step'}
  if(q.ph=='order'){q.ph='arrow';q.chk=false;return'step'}
  if(S.i>=S.qs.length-1){S.done=true;return'end'}S.i++;return'cycle'},
 scale:raw=>Math.floor(Math.max(0,Math.min(SAMC.max,raw))/3)
};
