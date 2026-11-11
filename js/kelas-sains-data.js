/* Round 10i: Sains, station Papan Putih = Kitaran Kehidupan (Mudah). Data + logic only, no screen code (that is js/kelas-sains.js).
   3 cycles (katak, tumbuhan berbunga, ayam), each with 5 cards for 5 slots, 2 marks per card in the right slot = 10 per cycle, 30 for the station.
   Each card has a stable id; answers are checked by id and slot only (never by position on screen). The card order shown is shuffled, the answer order never changes.
   The station has ONE difficulty (Mudah), so there is no level menu. Meja Makmal (Sederhana) and Stesen Eksperimen (Sukar) come in later rounds.
   Saving: the screen calls recQuiz('sainspp','mudah',SANL.scale(raw)); the 30 marks are scaled to the 10-mark grade scale (QCFG / quizGrade in js/kelas-quiz-data.js). */
const SANC={per:2,slots:5,max:30,key:'sainspp',level:'mudah'};
const SAND=[
 {id:'katak',t:'Kitaran Hidup Katak',a:'Susun peringkat hidup katak daripada telur hingga katak dewasa.',
  c:[['katak1','Telur'],['katak2','Berudu'],['katak3','Berudu berkaki'],['katak4','Katak muda'],['katak5','Katak dewasa']],
  e:'Katak melalui perubahan bentuk sepanjang perkembangannya. Telur menetas menjadi berudu yang hidup di dalam air, kemudian tumbuh kaki dan akhirnya menjadi katak dewasa.'},
 {id:'bunga',t:'Kitaran Hidup Tumbuhan Berbunga',a:'Susun peringkat hidup tumbuhan berbunga daripada benih hingga menghasilkan benih.',
  c:[['bunga1','Benih'],['bunga2','Benih bercambah'],['bunga3','Anak benih'],['bunga4','Tumbuhan matang'],['bunga5','Tumbuhan berbunga yang menghasilkan benih']],
  e:'Benih bercambah menjadi anak benih, lalu membesar menjadi tumbuhan matang. Tumbuhan berbunga menghasilkan benih baharu yang boleh tumbuh menjadi tumbuhan lain.'},
 {id:'ayam',t:'Kitaran Hidup Ayam',a:'Susun peringkat hidup ayam daripada telur yang disenyawakan hingga ayam dewasa.',
  c:[['ayam1','Telur yang disenyawakan'],['ayam2','Embrio berkembang di dalam telur'],['ayam3','Anak ayam menetas'],['ayam4','Anak ayam membesar menjadi ayam muda'],['ayam5','Ayam dewasa menghasilkan telur']],
  e:'Embrio berkembang di dalam telur sebelum anak ayam menetas. Selepas itu anak ayam membesar menjadi ayam muda, dan ayam dewasa menghasilkan telur.'}
];
const SANL={
 /* Fisher-Yates; rnd is injectable for tests. The shuffled order never equals the answer order. */
 shuffle(ids,rnd){rnd=rnd||Math.random;let a;for(let t=0;t<20;t++){a=ids.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const x=a[i];a[i]=a[j];a[j]=x}if(a.some((v,i)=>v!==ids[i]))return a}a=ids.slice();a.push(a.shift());return a},
 newCycle(d,rnd){return{d,order:SANL.shuffle(d.c.map(c=>c[0]),rnd),slots:d.c.map(()=>null),status:'play',marks:0,ok:[]}},
 newSession(rnd){return{qs:SAND.map(d=>SANL.newCycle(d,rnd)),i:0,marks:0,done:false}},
 cur:S=>S.qs[S.i],
 label:(q,id)=>(q.d.c.find(c=>c[0]===id)||[])[1],
 pool:q=>q.order.filter(id=>q.slots.indexOf(id)<0),
 /* put a card in a slot (i omitted = first empty slot). From the pool: a card already in that slot goes back to the pool. From another slot: the two swap. */
 place(q,id,i){if(q.status!='play'||!q.d.c.some(c=>c[0]===id))return false;const from=q.slots.indexOf(id);
  if(i==null){if(from>=0)return false;i=q.slots.indexOf(null);if(i<0)return false}
  if(i<0||i>=q.slots.length||from===i)return false;const old=q.slots[i];q.slots[i]=id;if(from>=0)q.slots[from]=old;return true},
 unplace(q,id){if(q.status!='play')return false;const k=q.slots.indexOf(id);if(k<0)return false;q.slots[k]=null;return true},
 clear(q){if(q.status!='play'||q.slots.every(s=>s===null))return false;q.slots=q.slots.map(()=>null);return true},
 /* check once: r 'incomplete' (an empty slot), 'locked' (already checked, no second marks), or 'ok' (checked, marks in q.marks, q.ok per slot) */
 check(S){const q=SANL.cur(S);if(q.status!='play')return{r:'locked',marks:q.marks};if(q.slots.some(s=>s===null))return{r:'incomplete',marks:0};
  q.ok=q.slots.map((id,k)=>id===q.d.c[k][0]);q.marks=q.ok.filter(Boolean).length*SANC.per;q.status='done';S.marks=Math.min(SANC.max,S.marks+q.marks);return{r:'ok',marks:q.marks}},
 advance(S){if(SANL.cur(S).status!='done')return false;if(S.i>=S.qs.length-1)S.done=true;else S.i++;return true},
 scale:raw=>Math.floor(Math.max(0,Math.min(SANC.max,raw))/3)
};
