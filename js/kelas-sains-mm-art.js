/* Round 10j: the 11 organism pictures of the Sains Meja Makmal quiz (Rantai Makanan), drawn as inline SVG from code: no image files, no outside links, no text inside the pictures.
   samArt(organismId) returns an SVG string (viewBox 100x100, same ink colour and flat style as js/kelas-visuals.js, which must load first for sv() and QV_INK).
   Ids match the cards in SAMD (js/kelas-sains-mm-data.js): pokok, ulat, burung, helang, kaktus, tikus, ular, alga, udang, ikan, jerung. A picture never shows which place or step it belongs to. */
const SAMA=(()=>{
const K=QV_INK,S=w=>' stroke="'+K+'" stroke-width="'+(w||2.5)+'" stroke-linejoin="round" stroke-linecap="round"';
const el=(t,a,w)=>'<'+t+' '+a+S(w)+'/>';
const E=(cx,cy,rx,ry,f,w,rot)=>el('ellipse','cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'"'+(rot?' transform="rotate('+rot+' '+cx+' '+cy+')"':''),w);
const C=(cx,cy,r,f,w)=>el('circle','cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+f+'"',w);
const P=(d,f,w)=>el('path','d="'+d+'" fill="'+f+'"',w);
const R=(x,y,w,h,r,f,sw)=>el('rect','x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+f+'"',sw);
const L=(d,c,w)=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
const LI=(d,c,w)=>L(d,K,w+3)+L(d,c,w);
const dot=(x,y,r)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+K+'"/>';
const eye=(x,y,r)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#fff" stroke="'+K+'" stroke-width="1.8"/>'+dot(x+r*.18,y,r*.5);
const water='<rect x="4" y="6" width="92" height="90" rx="12" fill="#bfe3ff"/>'+L('M12 16 q6 -4 12 0 t12 0','#8fc4f0',2)+L('M60 90 q6 -4 12 0 t12 0','#8fc4f0',2);
const grass=E(50,90,44,8,'#9bd16b',2.4),sand=E(50,90,44,8,'#ecd08e',2.4);
const A={
 pokok:()=>grass+P('M42 90 L45 56 L55 56 L58 90 Z','#a9743f',2.4)+C(34,50,15,'#6fcf62',2.2)+C(66,50,15,'#6fcf62',2.2)+C(50,36,22,'#5fbf5a',2.4)+L('M50 90 L50 62','#7d5230',1.8),
 ulat:()=>E(50,82,42,9,'#6cc070',2.4)+[24,38,52,66].map(x=>C(x,64,11,'#9be15d',2.4)).join('')+C(80,58,13,'#7ccf45',2.4)+eye(84,54,4.6)+L('M78 66 q5 4 10 0','#16204a',1.8)+LI('M76 47 Q72 36 66 33','#7ccf45',2)+LI('M84 46 Q88 36 94 34','#7ccf45',2),
 burung:()=>P('M26 54 L6 44 L10 62 Z','#4a82cf',2.4)+E(48,56,26,22,'#6fa8e8',2.4)+C(66,40,13,'#6fa8e8',2.4)+P('M76 36 L92 42 L76 47 Z','#ffd23f',2.2)+eye(68,36,4.6)+E(42,60,14,9,'#4a82cf',2,-20)+LI('M44 78 L44 90','#e89a3c',3)+LI('M54 78 L56 90','#e89a3c',3),
 helang:()=>P('M30 50 Q6 34 3 14 Q32 18 48 44 Z','#6b4423',2.4)+P('M30 72 L10 92 L42 82 Z','#6b4423',2.4)+E(50,60,24,20,'#8a5a33',2.4)+C(66,36,13,'#fff',2.4)+P('M76 33 L92 40 L76 45 Z','#ffd23f',2.2)+eye(68,33,4)+LI('M44 78 L42 90','#ffd23f',3)+LI('M56 78 L58 90','#ffd23f',3),
 kaktus:()=>sand+LI('M38 68 L24 68 L24 46','#5fb85a',9)+LI('M62 58 L76 58 L76 38','#5fb85a',9)+R(37,20,26,70,13,'#5fb85a',2.5)+C(50,19,5,'#ff7aa8',2)+dot(44,40,1.5)+dot(56,52,1.5)+dot(46,66,1.5)+dot(55,78,1.5),
 tikus:()=>sand+L('M20 70 Q4 68 8 50','#e6a8a0',3.4)+E(46,66,28,17,'#c9a37a',2.4)+E(74,60,14,11,'#c9a37a',2.4)+C(66,47,8,'#f2b8b8',2.2)+eye(78,57,3.6)+dot(87,62,2.4)+LI('M40 80 L38 90','#c9a37a',4)+LI('M58 80 L60 90','#c9a37a',4),
 ular:()=>sand+LI('M10 80 Q26 54 44 74 T76 70','#4fbf6a',11)+C(82,62,10,'#4fbf6a',2.4)+eye(85,59,3.6)+L('M91 64 L98 62 M91 64 L98 67','#d1473f',1.8)+L('M24 66 L28 76 M54 74 L58 66','#2f8a49',2.4),
 alga:()=>water+LI('M30 92 Q18 72 32 54 Q44 38 30 18','#2f9e5b',7)+LI('M52 92 Q40 74 54 56 Q66 40 52 22','#3fb36a',7)+LI('M74 92 Q64 76 76 60 Q84 50 76 38','#2f9e5b',7),
 udang:()=>water+E(36,87,7.5,5,'#ff8c1a',2.2,-55)+E(46,95,7.5,5,'#ff8c1a',2.2,-5)+L('M36 34 Q76 18 74 52 Q74 72 52 76',K,31)+L('M36 34 Q76 18 74 52 Q74 72 52 76','#ffab40',26)+L('M61 40 Q74 36 73 23','#c9661a',2.4)+L('M64 46 Q75 54 84 45','#c9661a',2.4)+L('M61 61 Q63 74 76 75','#c9661a',2.4)+L('M59 62 Q51 62 49 68','#16204a',2.6)+L('M56 69 Q48 70 46 76','#16204a',2.6)+L('M30 24 Q18 22 14 38 M33 20 Q20 10 10 22 M37 17 Q28 4 14 8','#16204a',2)+eye(34,32,7.6)+L('M36 43 q5 5 10 0','#16204a',2.2),
 ikan:()=>water+P('M70 52 L92 34 L92 70 Z','#ff8f1f',2.4)+E(48,52,28,17,'#ffb347',2.4)+P('M44 36 Q50 26 58 38 Z','#ff8f1f',2)+eye(30,48,4.6)+L('M54 38 Q58 52 54 66','#ff8f1f',2.4)+L('M24 56 q4 3 8 0','#16204a',1.8),
 jerung:()=>water+P('M18 54 L3 32 L10 54 L3 76 Z','#6a819c',2.4)+P('M14 54 Q36 36 66 40 Q86 44 98 56 Q80 70 56 68 Q30 66 14 54 Z','#7d93ad',2.4)+P('M26 59 Q56 71 96 57 Q80 70 56 68 Q36 66 26 59 Z','#eef3f8',1.4)+P('M46 41 L58 14 L67 41 Z','#6a819c',2.4)+P('M54 62 L44 84 L70 66 Z','#6a819c',2.4)+L('M64 48 Q62 54 64 60 M58 48 Q56 54 58 60 M52 48 Q50 54 52 60','#16204a',1.5)+eye(82,50,3.4)+L('M98 56 Q88 61 77 58','#16204a',1.8)+P('M92 59 L90 63 L87 60 L84 64 L82 60 Z','#fff',1.1),
};
return A})();
const SAMALT={pokok:'pokok',ulat:'ulat',burung:'burung kecil',helang:'helang',kaktus:'kaktus',tikus:'tikus gurun',ular:'ular',alga:'alga',udang:'udang',ikan:'ikan kecil',jerung:'jerung'};
const samArt=id=>SAMA[id]?sv(100,100,SAMA[id](),SAMALT[id]||''):'';
