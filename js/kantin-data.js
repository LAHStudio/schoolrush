/* Kantin data (Round 7). Every text, food and question used by the 5 stall mini games lives here,
   so it can be edited without touching the game code (js/kantin-games.js).
   Difficulty levels (later round): add KD.lv = {mudah:{...}, sukar:{...}} with the same keys as below;
   kantin-games.js will read KD.lv[level] first and fall back to the base values. Nothing to change for now.
   lim = seconds for full speed marks (slower than this lowers the stars). */
window.KD={
 /* wall posters: c = colour, s = drawn shape ('pyr' pyramid, 'plate' healthy plate) or e = emoji, t = text lines */
 posters:[{c:'#2f6fd0',s:'pyr',t:['Piramid','Makanan']},{c:'#2e9d4a',s:'plate',t:['Suku Suku','Separuh']},{c:'#8e5bd1',e:'🧼',t:['Cuci tangan','sebelum makan']},{c:'#e8923a',e:'🥤',t:['Kurangkan','minuman manis']},{c:'#2fa8c9',e:'💧',t:['Minum air','kosong']},{c:'#d84a6b',e:'♻️',t:['Buang sampah','dalam tong']}],
 hi:['Hai!','Selamat datang!','Adik nak makan apa?','Lapar?','Pilih makanan seimbang!'],
 stalls:[
  {n:'Piramid Makanan',v:'Mak Cik Siti',c:'#e74c3c',lim:60,t:'Bina Piramid Makanan Malaysia! Letakkan setiap makanan di tempat yang betul pada piramid.'},
  {n:'Sarapan Seimbang',v:'Pak Cik Ramli',c:'#27ae60',lim:60,t:'Buat sarapan seimbang! Letakkan makanan sihat pada setiap bahagian pinggan, kemudian makan!'},
  {n:'Snek Sihat',v:'Kak Lina',c:'#3498db',lim:45,t:'Tangkap snek sihat dengan troli! Elak snek yang terlalu manis, masin atau berminyak.'},
  {n:'Minuman Sihat',v:'Abang Din',c:'#f39c12',lim:50,t:'Kira ketul gula dalam minuman, kemudian pilih minuman yang paling sihat!'},
  {n:'Kebersihan Makanan',v:'Mak Cik Nora',c:'#9b59b6',lim:90,t:'Susun langkah cuci tangan, kemudian cari semua kesilapan kebersihan makanan!'}],
 /* stall 1: Piramid Makanan. PP = foods per zone (2 random foods per zone are used) */
 ZN:['Lemak, minyak, gula, garam (sedikit)','Ikan, ayam, daging, telur, kekacang','Susu dan tenusu','Sayur-sayuran','Buah-buahan','Nasi, mi, roti, bijirin, ubi (banyak)'],
 ZC:['#b266ff','#ff9a3c','#4aa3ff','#5ccf4a','#ee4b4b','#f4c542'],
 ZF:['perlu dimakan sedikit sahaja','ialah sumber protein','memberi kalsium untuk tulang dan gigi','kaya vitamin dan serat','kaya vitamin dan serat','ialah sumber tenaga, makan banyak'],
 PP:[[['Gula','🍬'],['Minyak','🛢️'],['Garam','🧂'],['Mentega','🧈'],['Gula-gula','🍭']],[['Ikan','🐟'],['Ayam','🍗'],['Telur','🥚'],['Daging','🥩'],['Kacang','🥜'],['Udang','🦐']],[['Susu','🥛'],['Keju','🧀']],[['Kangkung','🥬'],['Lobak','🥕'],['Brokoli','🥦'],['Timun','🥒'],['Terung','🍆']],[['Epal','🍎'],['Pisang','🍌'],['Tembikai','🍉'],['Oren','🍊'],['Mangga','🥭']],[['Nasi','🍚'],['Roti','🍞'],['Mi','🍜'],['Kentang','🥔'],['Bijirin','🥣']]],
 /* stall 2: Sarapan Seimbang. PG = healthy foods per plate part, PB = unhealthy decoys [name, emoji, reason] */
 PG:[[['Roti bijirin','🍞'],['Nasi','🍚'],['Oat','🥣']],[['Telur','🥚'],['Ikan','🐟'],['Ayam panggang','🍗']],[['Brokoli','🥦'],['Timun','🥒'],['Lobak','🥕']],[['Pisang','🍌'],['Epal','🍎'],['Tembikai','🍉']]],
 PB:[[['Donat','🍩','terlalu manis dan berminyak'],['Biskut manis','🍪','terlalu manis']],[['Sosej goreng','🌭','berminyak dan masin'],['Burger','🍔','berlemak dan masin']],[['Kerepek','🍟','terlalu masin dan berminyak'],['Tempura','🍤','terlalu berminyak']],[['Kek krim','🍰','terlalu manis'],['Gula-gula','🍭','terlalu manis']]],
 PN:['Bijirin','Protein','Sayur','Buah'],
 PC:['#f4c542','#ff8c6b','#7ed957','#ff6b81'],
 /* stall 3: Snek Sihat. SH = healthy snacks to catch, SU = unhealthy [name, emoji, reason] */
 SH:[['Epal','🍎'],['Pisang','🍌'],['Jagung','🌽'],['Tembikai','🍉'],['Kacang','🥜'],['Lobak','🥕']],
 SU:[['Coklat','🍫','terlalu manis'],['Gula-gula','🍭','terlalu manis'],['Kerepek','🍟','terlalu masin dan berminyak'],['Air bergas','🥤','terlalu banyak gula'],['Donat','🍩','manis dan berminyak']],
 /* stall 4: Minuman Sihat. DR = [name, emoji, sugar cubes] for 3 counting questions, DK = last question (healthiest) */
 DR:[['Air bergas','🥤',9],['Air sirap','🍹',6],['Teh ais manis','🧋',5]],
 DK:[['Air kosong','💧',0],['Air bergas','🥤',9],['Air sirap','🍹',6]],
 /* stall 5: Kebersihan Makanan. HW = hand washing steps in the right order, TL = [emoji, text, 1 if it is a hygiene mistake] */
 HW:[['Basahkan tangan','💦'],['Sapu sabun','🧼'],['Gosok tapak tangan','👏'],['Gosok celah jari dan belakang tangan','🤲'],['Bilas dengan air','🚿'],['Keringkan tangan','🧻']],
 TL:[['🍛🪰','Makanan tidak bertutup',1],['🧼','Cuci tangan sebelum makan',0],['🍎⬇️','Makanan jatuh dimakan semula',1],['🍽️','Makanan ditutup',0],['🧒🤲','Makan dengan tangan kotor',1],['🗑️✅','Buang sampah dalam tong',0],['🗑️💨','Sampah merata-rata',1],['💧','Minum air bersih',0],['🧻','Lap meja hingga bersih',0]]
};
