/* Susun Ayat Bahasa Melayu (Round 10f): data + logic only, no screen code (that is js/kelas-susun.js).
   Bank: 15 checked sentences per level (E = Mudah, M = Sederhana, H = Sukar). Each entry = [id, pieces in the CORRECT order]; the sentence is the pieces joined with a space.
   Pieces (and their capital letter, comma and full stop) stay exactly as written: answers are compared with this fixed order only, no AI and no guessing.
   Round 10f: Mudah items that had two pieces (Kucing itu, Murid itu, Burung itu, Pelajar itu) are split into single words so every Mudah question has 3 pieces.
   Grade scale and pass mark live ONLY in QCFG / quizGrade() in js/kelas-quiz-data.js. Saving the best result: recQuiz() in js/kelas-quiz.js. */
const SUSCFG={n:10,tries:2,hints:1,streak:{mudah:3,sederhana:2,sukar:2}};
const SUSLV={mudah:'Mudah',sederhana:'Sederhana',sukar:'Sukar'};
const SUSB={
 mudah:[['E01',['Ali','membaca','buku.']],['E02',['Ibu','memasak','nasi.']],['E03',['Adik','minum','susu.']],['E04',['Kucing','itu','tidur.']],['E05',['Ayah','membasuh','kereta.']],
  ['E06',['Siti','menyapu','lantai.']],['E07',['Murid','itu','menulis.']],['E08',['Kakak','memakai','kasut.']],['E09',['Burung','itu','terbang.']],['E10',['Amin','menendang','bola.']],
  ['E11',['Nenek','menanam','bunga.']],['E12',['Adik','membuka','pintu.']],['E13',['Kami','makan','bersama.']],['E14',['Pelajar','itu','rajin.']],['E15',['Mereka','bermain','bola.']]],
 sederhana:[['M01',['Adik','membaca','buku cerita','di bilik.']],['M02',['Ibu','membeli','sayur segar','di pasar.']],['M03',['Murid-murid','membersihkan','kelas','pada waktu pagi.']],
  ['M04',['Ayah','membaiki','basikal adik','di halaman rumah.']],['M05',['Kucing putih itu','tidur','di bawah meja.']],['M06',['Kami','bermain badminton','selepas waktu sekolah.']],
  ['M07',['Pasukan sekolah kami','memenangi','pertandingan bola sepak.']],['M08',['Kakak','menyusun','buku-buku','di atas rak.']],['M09',['Datuk','menyiram','pokok bunga','setiap petang.']],
  ['M10',['Para pekerja','membina','jambatan','berhampiran sungai.']],['M11',['Siti','membawa','bekal makanan','ke sekolah.']],['M12',['Penduduk kampung','bergotong-royong','membersihkan balai raya.']],
  ['M13',['Adik','memakai','baju hujan','ketika hujan turun.']],['M14',['Burung-burung kecil','hinggap','pada dahan pokok.']],['M15',['Guru besar','menyampaikan','hadiah','kepada para pemenang.']]],
 sukar:[['H01',['Kami','berehat','di dalam kelas','kerana hujan turun dengan lebat.']],['H02',['Walaupun penat,','para peserta','meneruskan latihan','sehingga tamat.']],
  ['H03',['Ibu','menyediakan sarapan','sebelum kami bertolak','ke sekolah.']],['H04',['Murid-murid','mengutip sampah','supaya kawasan sekolah','sentiasa bersih.']],
  ['H05',['Setelah loceng berbunyi,','semua murid','beratur','di luar kelas.']],['H06',['Kami','menanam pokok','supaya udara di sekeliling','menjadi lebih segar.']],
  ['H07',['Kakak','menyimpan wang sakunya','agar dapat membeli','sebuah kamus baharu.']],['H08',['Walaupun cuaca panas,','para petani','tetap bekerja','di sawah.']],
  ['H09',['Ayah','menutup semua tingkap','sebelum meninggalkan rumah.']],['H10',['Jika kita menjaga kebersihan,','persekitaran','akan menjadi lebih sihat.']],
  ['H11',['Para sukarelawan','membantu mangsa banjir','ketika air mula surut.']],['H12',['Selepas pertandingan berakhir,','para peserta','menerima sijil penyertaan.']],
  ['H13',['Farah','membaca arahan dengan teliti','sebelum menjawab semua soalan.']],['H14',['Walaupun menghadapi kesukaran,','Amir','terus berusaha','menyiapkan tugasan.']],
  ['H15',['Kita hendaklah','menghormati orang yang lebih tua','supaya hubungan kekeluargaan','sentiasa harmoni.']]]
};
const SUSL=(()=>{
function shuffle(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
const tx=(q,id)=>{const p=q.pcs.find(x=>x.id==id);return p?p.t:''};
const seq=(q,ids)=>ids.map(i=>tx(q,i)).join('\u0001');
/* one question: unique id per piece (so identical texts never clash); the shown order is shuffled ONCE here and is never the correct order */
function makeQ(e,r){const id=e[0],pcs=e[1].map((t,i)=>({id:id+'-'+(i+1),t})),q={id,pcs,s:e[1].join(' '),slots:[],lock:0,tries:0,status:'play',hinted:false,given:'',alt:[]},ok=seq(q,pcs.map(p=>p.id));
 let ord=null;for(let k=0;k<40;k++){const o=shuffle(pcs.map(p=>p.id),r);if(seq(q,o)!==ok){ord=o;break}}
 if(!ord){ord=pcs.map(p=>p.id);ord.push(ord.shift())} /* fallback only when every attempt happened to match */
 q.order=ord;return q}
function newSession(level,r){r=r||Math.random;const bank=SUSB[level];if(!bank)return null;const qs=shuffle(bank,r).slice(0,SUSCFG.n).map(e=>makeQ(e,r));return{level,qs,i:0,marks:0,done:false,hints:SUSCFG.hints,streak:0}}
const cur=s=>s.qs[s.i];
const pool=q=>q.order.filter(id=>!q.slots.includes(id));
const text=q=>q.slots.map(id=>tx(q,id)).join(' ');
const has=(q,id)=>q.pcs.some(p=>p.id==id);
/* place: put a piece from the pool into the answer at index `at` (default: the end); never before a locked piece; a piece can be used only once */
function place(q,id,at){if(q.status!='play'||!has(q,id)||q.slots.includes(id))return false;at=at==null?q.slots.length:Math.max(q.lock,Math.min(at,q.slots.length));q.slots.splice(at,0,id);return true}
function unplace(q,id){const i=q.slots.indexOf(id);if(q.status!='play'||i<0||i<q.lock)return false;q.slots.splice(i,1);return true}
/* move inside the answer: `at` is the index in the list after the piece is taken out */
function move(q,id,at){const i=q.slots.indexOf(id);if(q.status!='play'||i<0||i<q.lock)return false;q.slots.splice(i,1);at=Math.max(q.lock,Math.min(at,q.slots.length));q.slots.splice(at,0,id);return true}
function clear(q){if(q.status!='play'||q.slots.length<=q.lock)return false;q.slots=q.slots.slice(0,q.lock);return true}
const same=(q,ids)=>seq(q,ids)===seq(q,q.pcs.map(p=>p.id))||q.alt.some(a=>a.join('\u0001')===ids.map(i=>tx(q,i)).join('\u0001'));
/* check: 'locked' (already answered) | 'incomplete' (pieces left, nothing counted) | 'ok' | 'retry' (wrong, tries left) | 'no' (wrong, out of tries: the answer is shown). A mark is given only here and only once per question.
   Streak (same idea as the English spelling quiz): a right answer on the first try without a hint adds 1; reaching the level's streak gives +1 hint and restarts the count. A wrong check, a retry or a hint resets it. */
function check(s){const q=cur(s);if(q.status!='play')return{r:'locked'};if(q.slots.length<q.pcs.length)return{r:'incomplete'};
 q.given=text(q);const ok=same(q,q.slots);let bonus=false;
 if(ok){q.status='ok';s.marks++;if(q.hinted||q.tries>0)s.streak=0;else{s.streak++;if(s.streak>=SUSCFG.streak[s.level]){s.hints++;s.streak=0;bonus=true}}return{r:'ok',bonus}}
 q.tries++;s.streak=0;if(q.tries>=SUSCFG.tries){q.status='no';return{r:'no'}}return{r:'retry',left:SUSCFG.tries-q.tries}}
/* hint: puts the NEXT correct piece in its place and locks it (and everything correct before it); wrong pieces after that go back to the pool. Costs a hint, never the mark. Returns the index or -1. */
function hint(s){const q=cur(s);if(q.status!='play'||s.hints<1)return -1;let k=0;while(k<q.slots.length&&k<q.pcs.length&&tx(q,q.slots[k])==q.pcs[k].t)k++;if(k>=q.pcs.length)return -1;
 const keep=q.slots.slice(0,k);let id=q.pcs[k].id;if(keep.includes(id)){const o=q.pcs.find(p=>p.t==q.pcs[k].t&&!keep.includes(p.id));if(o)id=o.id}
 q.slots=keep.concat([id]);q.lock=k+1;q.hinted=true;s.hints--;s.streak=0;return k}
function advance(s){if(cur(s).status=='play'||s.done)return false;if(s.i>=s.qs.length-1)s.done=true;else s.i++;return true}
return{newSession,makeQ,cur,pool,text,place,unplace,move,clear,check,hint,advance,tx}})();
