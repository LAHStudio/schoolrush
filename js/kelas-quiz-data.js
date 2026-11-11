/* Round 10c: Matematik quiz data. FIXED questions: never random, never shuffled (questions and options keep this exact order every time).
   Round 10c2: E03 and E04 are lettersOnly: the shapes in the picture are labelled A to D (in the order of the names list) and the answer pills show only A to D; names are used only in the feedback line.
   Every question: id, level, intro (optional line shown above the picture), question, options (A to D), correctIndex (0=A .. 3=D), visualId (optional, drawn in js/kelas-visuals.js).
   The grade scale and the pass mark live ONLY in QCFG below; quizGrade() is the one function every level uses. */
const QCFG={max:10,pass:6,fail:'Gagal',scale:[[10,'A+'],[9,'A'],[8,'B+'],[7,'B'],[6,'C']]};
const QLV={mudah:'Mudah',sederhana:'Sederhana',sukar:'Sukar'};
function quizGrade(m){const hit=QCFG.scale.find(s=>m>=s[0]);return{marks:m,pct:Math.round(m/QCFG.max*100),g:hit?hit[1]:QCFG.fail,pass:m>=QCFG.pass}}
const QD={mat:{
mudah:[
{id:'E01',question:'Berapakah hasil bagi 43 + 12?',options:['45','55','65','56'],correctIndex:1},
{id:'E02',question:'Lengkapkan ayat matematik ini: 52 − □ = 14.',options:['28','36','38','42'],correctIndex:2},
{id:'E03',question:'Antara bentuk berikut, yang manakah segi tiga?',options:['A','B','C','D'],names:['Bulatan','Segi empat sama','Segi tiga','Segi lima'],lettersOnly:true,correctIndex:2,visualId:'E03_SHAPES_2D'},
{id:'E04',question:'Bentuk tiga dimensi yang manakah mempunyai permukaan melengkung sepenuhnya tanpa bucu?',options:['A','B','C','D'],names:['Kubus','Sfera','Kon','Silinder'],lettersOnly:true,correctIndex:1,visualId:'E04_SHAPES_3D'},
{id:'E05',question:'1 meter bersamaan dengan berapa sentimeter?',options:['10 cm','100 cm','1,000 cm','50 cm'],correctIndex:1},
{id:'E06',question:'2 liter bersamaan dengan berapa mililiter?',options:['200 mL','2,000 mL','20 mL','20,000 mL'],correctIndex:1},
{id:'E07',question:'Terdapat 4 kotak pensel. Setiap kotak mengandungi 5 batang pensel. Berapakah jumlah batang pensel semuanya?',options:['9','15','20','25'],correctIndex:2,visualId:'E07_PENCIL_BOXES'},
{id:'E08',question:'Ali mempunyai 30 biji guli. Dia memberikan 12 biji kepada kawannya. Berapakah baki guli Ali?',options:['16','18','20','22'],correctIndex:1},
{id:'E09',question:'Berdasarkan piktograf, buah manakah yang paling banyak?',options:['Epal','Pisang','Oren','Semua sama banyak'],correctIndex:0,visualId:'E09_FRUIT_PICTOGRAPH'},
{id:'E10',intro:'Carta menunjukkan bilangan buku yang dibaca oleh seorang murid:',question:'Pada hari manakah murid itu membaca 2 buah buku lebih banyak daripada hari Isnin?',options:['Isnin','Selasa','Rabu','Semua hari'],correctIndex:1,visualId:'E10_BOOKS_CHART'}],
sederhana:[
{id:'M01',question:'Berapakah hasil bagi 245 + 178?',options:['413','423','433','443'],correctIndex:1},
{id:'M02',question:'Berapakah hasil bagi 8 × 12?',options:['84','92','96','108'],correctIndex:2},
{id:'M03',question:'Berapakah bilangan permukaan rata pada sebuah kubus?',options:['4','6','8','12'],correctIndex:1,visualId:'M03_CUBE_FACES'},
{id:'M04',question:'Bentuk tiga dimensi yang manakah mempunyai dua permukaan rata berbentuk bulatan dan satu permukaan melengkung?',options:['Sfera','Kubus','Silinder','Kon'],correctIndex:2,visualId:'M04_CYLINDER'},
{id:'M05',question:'Tukarkan 3.5 meter kepada sentimeter.',options:['35 cm','350 cm','3,500 cm','305 cm'],correctIndex:1},
{id:'M06',question:'Berapakah jumlah jisim bagi 2 kg 350 g dan 650 g?',options:['2 kg 900 g','2 kg 950 g','3 kg','3 kg 100 g'],correctIndex:2},
{id:'M07',question:'Hitung 6 × 24 − 57.',options:['67','77','87','97'],correctIndex:2},
{id:'M08',question:'Berapakah tempoh masa dari pukul 8:15 pagi hingga 9:05 pagi?',options:['40 minit','45 minit','50 minit','60 minit'],correctIndex:2},
{id:'M09',intro:'Carta jualan menunjukkan:',question:'Berapakah jumlah jualan pada hari Isnin dan Rabu?',options:['25 unit','27 unit','30 unit','32 unit'],correctIndex:1,visualId:'M09_SALES_CHART'},
{id:'M10',intro:'Carta menunjukkan bilangan murid yang menyertai aktiviti sukan:',question:'Berapakah jumlah murid yang menyertai badminton dan olahraga?',options:['15 orang','16 orang','17 orang','18 orang'],correctIndex:2,visualId:'M10_SPORTS_CHART'}],
sukar:[
{id:'H01',question:'Berapakah hasil bagi 324 ÷ 12?',options:['24','26','27','28'],correctIndex:2},
{id:'H02',question:'Berapakah hasil bagi 45 × 26?',options:['1,070','1,170','1,270','1,370'],correctIndex:1},
{id:'H03',question:'Berapakah bilangan sisi lurus atau rusuk pada sebuah kubus?',options:['6','8','10','12'],correctIndex:3,visualId:'H03_CUBE_EDGES'},
{id:'H04',question:'Sebuah segi empat tepat mempunyai panjang 12 cm dan lebar 7 cm. Berapakah perimeternya?',options:['19 cm','24 cm','38 cm','84 cm'],correctIndex:2,visualId:'H04_RECTANGLE_PERIMETER'},
{id:'H05',question:'Tukarkan 2.75 kilometer kepada meter.',options:['275 m','2,500 m','2,750 m','27,500 m'],correctIndex:2},
{id:'H06',question:'Sebuah jag mengandungi 1.5 liter air. Sebanyak 750 mL air ditambahkan. Berapakah jumlah isi padu air sekarang?',options:['2 L','2.15 L','2.25 L','2.75 L'],correctIndex:2,visualId:'H06_WATER_JUG'},
{id:'H07',question:'Amir membeli 3 batang pensel pada harga RM4.50 setiap satu dan sebuah pemadam berharga RM2.80. Berapakah jumlah harga barang yang dibeli?',options:['RM13.50','RM14.30','RM16.30','RM17.80'],correctIndex:2},
{id:'H08',question:'Sebuah kotak mengandungi 240 biji manik. Sebanyak 3/8 daripada manik itu berwarna merah. Berapakah bilangan manik merah?',options:['80','85','90','100'],correctIndex:2},
{id:'H09',intro:'Carta menunjukkan bilangan buku yang dipinjam dari perpustakaan:',question:'Berapakah beza antara bilangan buku yang dipinjam pada hari Khamis dengan hari Isnin?',options:['15 buah','17 buah','19 buah','21 buah'],correctIndex:1,visualId:'H09_LIBRARY_CHART'},
{id:'H10',intro:'Carta menunjukkan bilangan buku yang dibaca oleh empat kumpulan:',question:'Berapakah jumlah buku yang dibaca oleh keempat-empat kumpulan?',options:['38 buah','39 buah','40 buah','41 buah'],correctIndex:2,visualId:'H10_GROUP_BOOKS_CHART'}]
}};
Object.keys(QD.mat).forEach(l=>QD.mat[l].forEach(q=>q.level=l));
