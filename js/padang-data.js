/* Padang Balapan data (Round 9). Every text, target and score number for the 3 PJ mini games lives here,
   so it can be tuned without touching the game code (js/padang-games.js).
   One target for everyone (no gender split). The score is 0-100 behind the scenes; the player sees time or distance, stars and the grade.
   Difficulty levels (later round): add PD.lv={mudah:{g:[...]},sukar:{g:[...]}}; padang-games.js can read PD.lv[level] first. Nothing to change for now.
   If you change a target, update the "kh" hint text of that game too. */
window.PD={
 hi:['Ayuh berlari!','Semangat!','Jom bersukan!','Lari laju-laju!'],
 g:[
  {n:'Lari Pecut 100m',s:'100m',sub:'Lari Pecut',c:'#e8730c',len:100,
   t:'Lari 100 meter! Pilih ◀ dan ▶ bergilir-gilir secepat mungkin. Pilih sebelah yang sama dua kali, kamu tersadung!',
   kh:'Siap dalam 13 saat atau kurang untuk bintang penuh ⭐',
   tgt:15,up:15,dn:7.5,            /* target time (s) = score 70; every second faster +up, every second slower -dn */
   imp:1.75,drag:1.2,vmax:10,stun:.7}, /* speed added per tap, slowing per second, top speed, stumble pause (s) */
  {n:'Lari Berpagar 60m',s:'PAGAR',sub:'Lari Berpagar',c:'#2f9d86',len:60,hd:[12,20,28,36,44,52],
   t:'Lari 60 meter dengan 6 pagar! Pilih ◀ dan ▶ bergilir-gilir untuk berlari. Pilih LOMPAT tepat pada masanya di setiap pagar. Langgar pagar, kamu perlahan.',
   kh:'Tiada pagar jatuh dan siap dalam 14 saat untuk bintang penuh ⭐',
   tgt:14,                         /* time (s) with no penalty; score = stallScore(hurdles hit, time, tgt) like the Kantin */
   imp:1.75,drag:1.2,vmax:7,stun:.7,jv:8.25,g:26,hh:.45,slow:.4}, /* Round 15c: speed from alternating taps like Lari Pecut (speed per tap, slowing per second, top speed, stumble pause s); jump power, gravity, hurdle height, speed factor at once after a hit */
  {n:'Lompat Jauh',s:'LOMPAT JAUH',sub:'Lompat Jauh',c:'#8e5bd1',
   t:'Larian 10 meter: pilih ◀ dan ▶ bergilir-gilir untuk bina kelajuan. Kemudian kamu berlari sendiri. Pilih LOMPAT di zon hijau! Terlebih papan (merah) = Batal. 3 percubaan, yang terbaik dikira.',
   kh:'Lompat 3.3 m atau lebih untuk bintang penuh ⭐',
   tgt:2.8,up:50,dn:40,            /* target distance (m) = score 70; every metre further +up, shorter -dn (minimum score 15) */
   ru:10,board:18,gz:2,rz:1,air:.5,jh:1.1,tries:3, /* run-up length (m), board position (m), green zone and red zone length (m), air time (s), jump height, attempts */
   imp:1.75,drag:1.2,vmin:3.5,vmax:9,stun:.7}      /* same tap rules as Lari Pecut; vmin = slowest speed once it runs by itself */
 ]
};
