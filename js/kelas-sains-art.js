/* Round 10i2: the 15 life-cycle pictures of the Sains Papan Putih quiz (Kitaran Kehidupan), drawn as inline SVG from code: no image files, no outside links, no text inside the pictures.
   sainsArt(cardId) returns an SVG string (viewBox 100x100, same ink colour and flat style as js/kelas-visuals.js, which must load first for sv() and QV_INK).
   Card ids match SAND in js/kelas-sains-data.js: katak1..5, bunga1..5, ayam1..5. alt text is in SANALT (used when a picture stands alone, e.g. the correct-order strip). */
const SANA=(()=>{
const K=QV_INK,S=(w)=>' stroke="'+K+'" stroke-width="'+(w||2.5)+'" stroke-linejoin="round" stroke-linecap="round"';
const el=(t,a,w)=>'<'+t+' '+a+S(w)+'/>';
const E=(cx,cy,rx,ry,f,w,rot)=>el('ellipse','cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'"'+(rot?' transform="rotate('+rot+' '+cx+' '+cy+')"':''),w);
const C=(cx,cy,r,f,w)=>el('circle','cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+f+'"',w);
const P=(d,f,w)=>el('path','d="'+d+'" fill="'+f+'"',w);
const L=(d,c,w)=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
const LI=(d,c,w)=>L(d,K,w+3)+L(d,c,w);                 /* a line with an ink outline */
const dot=(x,y,r)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+K+'"/>';
const eye=(x,y,r)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#fff" stroke="'+K+'" stroke-width="1.8"/>'+dot(x+r*.18,y,r*.5);
const water='<rect x="4" y="50" width="92" height="46" rx="12" fill="#bfe3ff"/>'+L('M12 60 q6 -4 12 0 t12 0','#8fc4f0',2)+L('M62 88 q6 -4 12 0 t12 0','#8fc4f0',2);
const pad=(cx,cy,rx,ry)=>E(cx,cy,rx,ry,'#6cc070',2.2)+L('M'+cx+' '+cy+' L'+(cx+rx*.8)+' '+(cy-ry*.35),K,1.6);
const soil=(y)=>'<rect x="4" y="'+y+'" width="92" height="'+(96-y)+'" rx="9" fill="#b07a4f"'+S(2.5)+'/>'+dot(18,y+12,1.6)+dot(40,y+20,1.6)+dot(66,y+10,1.6)+dot(84,y+19,1.6)+dot(28,y+26,1.6);
const leaf=(cx,cy,rx,ry,rot)=>E(cx,cy,rx,ry,'#6fcf62',2.2,rot);
const roots=(x,y)=>L('M'+x+' '+y+' Q'+(x-6)+' '+(y+12)+' '+(x-10)+' '+(y+24),'#f3e6c8',2.6)+L('M'+x+' '+y+' Q'+(x+7)+' '+(y+13)+' '+(x+11)+' '+(y+25),'#f3e6c8',2.6)+L('M'+x+' '+y+' L'+x+' '+(y+20),'#f3e6c8',2.6);
const nest='<ellipse cx="50" cy="84" rx="38" ry="11" fill="#d9a85b"'+S(2.5)+'/>'+L('M18 82 q8 -5 16 0 M40 86 q8 -5 16 0 M62 82 q8 -5 16 0','#a8782f',2);
const grass='<ellipse cx="50" cy="90" rx="44" ry="8" fill="#9bd16b"'+S(2.5)+'/>';
const A={
 katak1:()=>water+[[28,66],[43,62],[58,66],[36,77],[52,75],[67,76],[46,87]].map(p=>C(p[0],p[1],8.5,'#eefbe4',2)+dot(p[0],p[1],3.4)).join('')+pad(80,36,13,6)+L('M80 30 L80 14','#4aa05a',3),
 katak2:()=>water+P('M54 55 Q70 40 91 52 Q72 67 54 63 Z','#5d7d4a',2.4)+E(40,57,18,13,'#5d7d4a',2.4)+eye(30,52,4.8)+'<circle cx="18" cy="36" r="3.4" fill="none" stroke="#7fb2e5" stroke-width="2"/><circle cx="28" cy="24" r="2.4" fill="none" stroke="#7fb2e5" stroke-width="2"/>',
 katak3:()=>water+P('M56 54 Q68 47 80 55 Q68 63 56 60 Z','#5d7d4a',2.4)+LI('M50 66 L58 77 L70 79','#5d7d4a',3.6)+LI('M42 67 L48 80 L61 84','#5d7d4a',3.6)+E(40,56,18,13,'#5d7d4a',2.4)+eye(30,51,4.8),
 katak4:()=>pad(50,84,38,10)+P('M66 70 L78 76 L64 76 Z','#5fb85a',2)+LI('M60 74 L76 70 L82 80','#5fb85a',4)+E(50,68,21,14,'#6fcf62',2.4)+LI('M38 76 L34 84','#6fcf62',4)+LI('M58 76 L60 84','#6fcf62',4)+eye(40,52,6)+eye(60,52,6)+L('M43 66 q7 4 14 0','#16204a',1.8),
 katak5:()=>pad(50,88,42,9)+E(50,62,31,22,'#4fae4a',2.6)+E(50,70,19,12,'#d9f2c4',1.6)+LI('M22 74 Q14 84 30 86','#4fae4a',6)+LI('M78 74 Q86 84 70 86','#4fae4a',6)+E(37,86,8,4,'#4fae4a',2)+E(63,86,8,4,'#4fae4a',2)+eye(36,38,8.5)+eye(64,38,8.5)+L('M36 58 q14 9 28 0','#16204a',2.2)+dot(30,56,2)+dot(70,60,2)+dot(54,50,2),
 bunga1:()=>soil(66)+E(50,56,15,9.5,'#8a5a33',2.6,-18)+E(46,52,6,2.6,'#c28b5a',0,-18)+dot(60,60,1.8),
 bunga2:()=>soil(46)+L('M10 46 q4 -8 8 0 M80 46 q5 -9 10 0','#4aa05a',2.5)+E(50,68,12,8.5,'#8a5a33',2.6,-20)+LI('M50 75 Q44 86 54 94','#f3e6c8',3)+LI('M52 61 Q55 52 50 42','#9be07a',3)+leaf(44,40,6,3.2,-30)+leaf(57,39,6,3.2,30),
 bunga3:()=>soil(62)+LI('M50 62 L50 30','#6fcf62',3.6)+leaf(37,36,12,6,-28)+leaf(63,34,12,6,28)+roots(50,62),
 bunga4:()=>soil(66)+LI('M50 66 L50 14','#6fcf62',4.4)+leaf(36,56,13,6,-30)+leaf(64,48,13,6,30)+leaf(35,36,13,6,-30)+leaf(65,28,13,6,30)+leaf(40,18,9,4.5,-25)+leaf(60,14,9,4.5,25)+roots(50,66),
 bunga5:()=>soil(68)+LI('M50 68 L50 30','#6fcf62',4.2)+leaf(36,56,12,5.6,-30)+leaf(64,50,12,5.6,30)+[0,60,120,180,240,300].map(a=>E(50,16,6.5,10,'#ff8fb1',2,a).replace('rotate('+a+' 50 16)','rotate('+a+' 50 26)').replace('cy="16"','cy="14"')).join('')+C(50,26,7,'#ffd23f',2.2)+LI('M64 54 Q74 52 78 40','#6fcf62',3)+E(79,34,5.6,10.5,'#8ac36a',2.2,20)+C(78,31,2,'#8a5a33',1.2)+C(80,37,2,'#8a5a33',1.2)+E(76,78,3.8,2.6,'#8a5a33',1.8)+E(86,82,3.8,2.6,'#8a5a33',1.8,20)+E(66,84,3.8,2.6,'#8a5a33',1.8,-15),
 ayam1:()=>nest+E(50,54,19,25,'#fff4de',2.8)+L('M40 40 Q42 32 48 30','#ffffff',3),
 ayam2:()=>E(50,50,31,40,'#f4dcb0',2.8)+E(50,50,26,35,'#fffdf6',1.6)+C(50,58,17,'#ffc83d',2.4)+L('M52 50 L40 36 M52 50 L34 52 M56 46 L48 28','#e05a5a',1.6)+P('M50 56 Q40 66 52 70 Q62 68 60 58 Q58 50 52 52 Z','#ff9bb0',2.2)+C(56,48,7.5,'#ff9bb0',2.2)+dot(58.5,46,1.9),
 ayam3:()=>P('M22 64 L31 53 L40 64 L50 51 L60 64 L69 53 L78 64 Q78 94 50 94 Q22 94 22 64 Z','#fff4de',2.8)+C(50,46,16,'#ffd84d',2.6)+dot(44,43,2.4)+dot(57,43,2.4)+P('M47 50 L56 50 L51.5 57 Z','#ff9a3c',2)+L('M46 31 q4 -8 7 0','#ffd84d',3)+P('M70 26 L84 30 L78 42 L72 36 Z','#fff4de',2.4),
 ayam4:()=>grass+LI('M43 70 L43 88 M57 70 L57 88','#ff9a3c',2.6)+L('M43 88 l-5 2 M43 88 l5 2 M57 88 l-5 2 M57 88 l5 2','#ff9a3c',2.4)+P('M30 54 L14 40 L22 58 L12 54 L26 62 Z','#de9a45',2.2)+E(48,58,22,18,'#f1b15d',2.6)+E(44,60,11,8,'#de9a45',2.2,-12)+C(64,38,11.5,'#f1b15d',2.6)+P('M60 28 q2 -7 5 -1 q3 -6 5 1 q-5 3 -10 0Z','#e84a4a',2)+P('M74 36 L84 40 L74 44 Z','#ff9a3c',2)+dot(67,35.5,2.2),
 ayam5:()=>'<ellipse cx="72" cy="91" rx="23" ry="7" fill="#d9a85b"'+S(2.4)+'/>'+E(75,80,9,11,'#fff4de',2.4)+grass.replace('cx="50" cy="90" rx="44"','cx="34" cy="90" rx="30"')+LI('M32 70 L32 88 M46 70 L46 88','#ff9a3c',2.6)+P('M24 46 L5 24 L9 44 L2 46 L8 56 L22 56 Z','#c9583a',2.2)+E(36,56,26,20,'#fdf3e3',2.6)+E(32,58,13,9,'#ecd9bd',2.2,-12)+C(50,32,12.5,'#fdf3e3',2.6)+P('M44 22 q1 -10 5 -3 q3 -8 6 -1 q4 -6 5 3 q-8 4 -16 1Z','#e84a4a',2)+P('M61 31 L73 35 L61 39 Z','#ffc83d',2)+E(58,43,3.4,5,'#e84a4a',1.8)+dot(55,29.5,2.3)
};
return A;
})();
const SANALT={katak1:'telur katak dalam air',katak2:'berudu',katak3:'berudu berkaki',katak4:'katak muda',katak5:'katak dewasa',
 bunga1:'benih',bunga2:'benih bercambah',bunga3:'anak benih',bunga4:'tumbuhan matang',bunga5:'tumbuhan berbunga yang menghasilkan benih',
 ayam1:'telur ayam dalam sarang',ayam2:'embrio berkembang di dalam telur',ayam3:'anak ayam menetas',ayam4:'ayam muda',ayam5:'ayam dewasa dengan telur'};
const sainsArt=id=>SANA[id]?sv(100,100,SANA[id](),SANALT[id]||''):'';
