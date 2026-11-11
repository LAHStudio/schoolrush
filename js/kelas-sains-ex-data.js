/* Round 10k: Sains, station Stesen Eksperimen = Penyiasatan Saintifik (Sukar). Data + logic only, no screen code (that is js/kelas-sains-ex.js).
   3 experiments (3A cahaya dan pokok, 3B suhu dan ais, 3C litar elektrik; card ids are unique across all three so saeIcon(id) in the art file is never ambiguous), 10 marks each, 30 for the station. Each experiment has 4 steps:
   1) SUSUNAN: tap a card, then tap a numbered spot on the experiment diagram. 5 spots, 1 mark per spot with the right card (5)
   2-4) SOALAN: 3 fixed questions in the same order for every experiment (pemboleh ubah dimanipulasi, hipotesis, kesan), 3 choices each, 2 + 2 + 1 marks (5)
   Answers are checked by id only (card id per spot, choice id per question), never by screen position. The tray and the choices are shuffled, the question order is fixed.
   Saving: the screen calls recQuiz('sainsex','sukar',SAEL.scale(raw)); 30 marks are scaled to the 10-mark grade scale (QCFG / quizGrade in js/kelas-quiz-data.js).
   Names: SAEC / SAED / SAEL (SANC, SAMC and SPCFG belong to the other Sains stations and the English spelling game). */
const SAEC={key:'sainsex',level:'sukar',slots:5,qn:3,per:10,max:30};
const SAED=[
 {id:'cahaya',n:'3A',t:'Cahaya dan Pertumbuhan Pokok',aim:'Kaji kesan cahaya terhadap pertumbuhan pokok. Pasu A berada di tempat terang. Lengkapkan susunan eksperimen ini.',
  slots:[{id:'s1',cap:'Jenis tumbuhan',a:'sama',x:24,y:66},{id:'s2',cap:'Air setiap hari',a:'air50',x:48,y:86},{id:'s3',cap:'Tempat Pasu B',a:'gelap',x:76,y:46},{id:'s4',cap:'Alat mengukur',a:'pembaris',x:90,y:86},{id:'s5',cap:'Perkara yang diukur',a:'tinggi',x:12,y:56}],
  cards:[['sama','Anak pokok sama jenis dan sama saiz'],['air50','Air 50 ml untuk setiap pasu'],['gelap','Dalam almari gelap'],['pembaris','Pembaris'],['tinggi','Tinggi pokok'],['x1','Air 100 ml untuk Pasu A sahaja'],['x2','Termometer']],
  q:[{m:2,p:'Apakah pemboleh ubah yang dimanipulasi dalam eksperimen ini?',c:[['a','Jumlah air'],['b','Cahaya'],['c','Tinggi pokok']],a:'b',e:'Pemboleh ubah dimanipulasi ialah perkara yang sengaja diubah, iaitu cahaya. Tinggi pokok ialah pemboleh ubah bergerak balas dan jumlah air dimalarkan.'},
     {m:2,p:'Jika cahaya yang diterima pokok dinaikkan, apakah hipotesis yang sesuai?',c:[['a','Semakin banyak cahaya, semakin pendek pokok'],['b','Tinggi pokok tidak berubah'],['c','Semakin banyak cahaya, semakin tinggi pokok membesar']],a:'c',e:'Hipotesis menyatakan hubungan antara pemboleh ubah dimanipulasi dengan pemboleh ubah bergerak balas: semakin banyak cahaya, semakin tinggi pokok.'},
     {m:1,p:'Jika Pasu B dihalang daripada menerima cahaya, apakah kesannya?',c:[['a','Pokok menjadi lebih hijau dan subur'],['b','Pokok menjadi pucat dan kurus'],['c','Pokok tidak berubah']],a:'b',e:'Tanpa cahaya, tumbuhan tidak dapat membuat makanan sendiri. Pokok menjadi pucat, kurus dan lemah.'}]},
 {id:'ais',n:'3B',t:'Suhu dan Ais Cair',aim:'Kaji kesan suhu air terhadap masa ais cair. Suhu air dalam setiap bikar sudah ditunjukkan pada rajah. Betulkan dan lengkapkan susunan eksperimen ini.',
  slots:[{id:'s1',cap:'Air dalam setiap bikar',a:'air100',x:35,y:52},{id:'s2',cap:'Ais dalam setiap bikar',a:'aissama',x:50,y:24},{id:'s3',cap:'Alat mengukur masa',a:'jam',x:90,y:86},{id:'s4',cap:'Alat mengukur suhu',a:'termo',x:65,y:52},{id:'s5',cap:'Perkara yang direkod',a:'masa',x:10,y:86}],
  cards:[['air100','Air 100 ml'],['aissama','Satu ketul ais, saiz sama'],['jam','Jam randik'],['termo','Termometer'],['masa','Masa ais cair'],['aisbeza','Ais berlainan saiz dalam setiap bikar'],['airbeza','Air berlainan isi padu dalam setiap bikar']],
  q:[{m:2,p:'Apakah pemboleh ubah yang dimanipulasi dalam eksperimen ini?',c:[['a','Suhu air'],['b','Masa ais cair'],['c','Saiz ais']],a:'a',e:'Suhu air sengaja diubah. Masa ais cair ialah pemboleh ubah bergerak balas dan saiz ais dimalarkan.'},
     {m:2,p:'Jika suhu air dinaikkan, apakah hipotesis yang sesuai?',c:[['a','Semakin tinggi suhu air, semakin lambat ais cair'],['b','Suhu air tidak mempengaruhi masa ais cair'],['c','Semakin tinggi suhu air, semakin cepat ais cair']],a:'c',e:'Semakin tinggi suhu air, semakin banyak haba diterima oleh ais, jadi ais cair lebih cepat.'},
     {m:1,p:'Jika saiz ais ditukar berbeza dalam setiap bikar, apakah kesannya?',c:[['a','Ujian menjadi lebih adil'],['b','Ujian menjadi tidak adil kerana saiz ais turut mempengaruhi masa ais cair'],['c','Tiada kesan pada keputusan']],a:'b',e:'Saiz ais mesti dimalarkan. Jika tidak, kita tidak tahu sama ada suhu atau saiz ais yang menyebabkan perbezaan masa.'}]},
 {id:'litar',n:'3C',t:'Litar Elektrik Mudah',aim:'Kaji kesan bilangan bateri terhadap kecerahan mentol. Bina litar elektrik yang lengkap.',
  slots:[{id:'s1',cap:'Sumber tenaga',a:'bateri',x:13,y:37},{id:'s2',cap:'Penyambung litar',a:'wayar',x:50,y:18},{id:'s3',cap:'Membuka dan menutup litar',a:'suis',x:87,y:40},{id:'s4',cap:'Peranti yang menyala',a:'mentol',x:50,y:79},{id:'s5',cap:'Untuk menambah kecerahan',a:'bateri2',x:13,y:58}],
  cards:[['bateri','Satu bateri'],['wayar','Wayar kuprum'],['suis','Suis'],['mentol','Mentol'],['bateri2','Bateri tambahan'],['getah','Tali getah'],['plastik','Pembaris plastik']],
  q:[{m:2,p:'Apakah pemboleh ubah yang dimanipulasi dalam eksperimen ini?',c:[['a','Kecerahan mentol'],['b','Jenis mentol'],['c','Bilangan bateri']],a:'c',e:'Bilangan bateri sengaja diubah. Kecerahan mentol ialah pemboleh ubah bergerak balas dan jenis mentol dimalarkan.'},
     {m:2,p:'Jika bilangan bateri dinaikkan, apakah hipotesis yang sesuai?',c:[['a','Semakin banyak bateri, semakin malap mentol'],['b','Semakin banyak bateri, semakin cerah mentol menyala'],['c','Bilangan bateri tidak mempengaruhi kecerahan mentol']],a:'b',e:'Lebih banyak bateri memberi lebih banyak tenaga kepada litar, jadi mentol menyala lebih cerah.'},
     {m:1,p:'Jika wayar kuprum ditukar dengan tali getah, apakah kesannya?',c:[['a','Mentol menyala lebih cerah'],['b','Mentol menyala seperti biasa'],['c','Mentol tidak menyala kerana getah ialah penebat']],a:'c',e:'Getah ialah penebat, maka arus elektrik tidak mengalir. Wayar kuprum ialah konduktor.'}]}
];
const SAEL={
 /* Fisher-Yates; rnd is injectable for tests. The shuffled order never equals the given order. */
 shuffle(ids,rnd){rnd=rnd||Math.random;let a;for(let t=0;t<20;t++){a=ids.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const x=a[i];a[i]=a[j];a[j]=x}if(a.some((v,i)=>v!==ids[i]))return a}a=ids.slice();a.push(a.shift());return a},
 label:(x,id)=>(x.d.cards.find(c=>c[0]===id)||[])[1],
 /* ph: 0 = susunan, 1..3 = soalan 1..3; chk = this step has been checked (locked, waiting for next) */
 newEx(d,rnd){return{d,ph:0,chk:false,deck:SAEL.shuffle(d.cards.map(c=>c[0]),rnd),slots:d.slots.map(()=>null),sel:null,pend:null,pick:null,sm:0,qm:[0,0,0],qo:d.q.map(q=>SAEL.shuffle(q.c.map(c=>c[0]),rnd)),marks:0}},
 newSession(rnd){return{qs:SAED.map(d=>SAEL.newEx(d,rnd)),i:0,marks:0,done:false}},
 cur:S=>S.qs[S.i],
 add(S,x,n){x.marks+=n;S.marks=Math.min(SAEC.max,S.marks+n)},
 pool:x=>x.deck.filter(id=>x.slots.indexOf(id)<0),
 /* step 1: tap a card, then a spot (or a spot, then a card). Tap a filled spot to take its card back. */
 putAt(x,k,id){x.slots[k]=id;x.sel=null;x.pend=null},
 selCard(x,id){if(x.ph!=0||x.chk||SAEL.pool(x).indexOf(id)<0)return false;if(x.pend!=null&&x.slots[x.pend]===null){SAEL.putAt(x,x.pend,id);return'placed'}x.sel=x.sel===id?null:id;return'sel'},
 tapSpot(x,k){if(x.ph!=0||x.chk||k<0||k>=x.slots.length)return false;if(x.slots[k]!==null){x.slots[k]=null;x.sel=null;x.pend=null;return'back'}
  if(x.sel&&SAEL.pool(x).indexOf(x.sel)>=0){SAEL.putAt(x,k,x.sel);return'placed'}x.pend=x.pend===k?null:k;return'pend'},
 clear(x){if(x.ph!=0||x.chk||x.slots.every(s=>s===null))return false;x.slots=x.slots.map(()=>null);x.sel=null;x.pend=null;return true},
 checkSetup(S){const x=SAEL.cur(S);if(x.ph!=0)return{r:'locked'};if(x.chk)return{r:'locked',marks:x.sm};if(x.slots.some(s=>s===null))return{r:'incomplete',marks:0};
  x.sm=x.d.slots.filter((s,k)=>x.slots[k]===s.a).length;x.chk=true;SAEL.add(S,x,x.sm);return{r:'ok',marks:x.sm}},
 /* steps 2-4: one question each */
 q:x=>x.ph>=1?x.d.q[x.ph-1]:null,
 choose(x,id){if(x.ph<1||x.chk)return false;if(x.d.q[x.ph-1].c.every(c=>c[0]!==id))return false;x.pick=id;return true},
 checkQ(S){const x=SAEL.cur(S);if(x.ph<1)return{r:'locked'};const q=SAEL.q(x);if(x.chk)return{r:'locked',marks:x.qm[x.ph-1]};if(x.pick===null)return{r:'incomplete',marks:0};
  const ok=x.pick===q.a;x.qm[x.ph-1]=ok?q.m:0;x.chk=true;SAEL.add(S,x,x.qm[x.ph-1]);return{r:'ok',ok,marks:x.qm[x.ph-1]}},
 /* after a check: next step, next experiment, or the end. Returns 'step' | 'cycle' | 'end' | false */
 next(S){const x=SAEL.cur(S);if(!x.chk)return false;
  if(x.ph<SAEC.qn){x.ph++;x.chk=false;x.pick=null;return'step'}
  if(S.i>=S.qs.length-1){S.done=true;return'end'}S.i++;return'cycle'},
 scale:raw=>Math.floor(Math.max(0,Math.min(SAEC.max,raw))/3)
};
