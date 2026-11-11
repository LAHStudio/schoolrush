/* Round 10k: Stesen Eksperimen, experiment diagrams (inline SVG, viewBox 300x190, no links, no images; the only text is the three temperatures printed on the beakers of 3B). Each diagram shows the apparatus only; the empty dashed places
   are where the numbered spots sit. A picture must never mark the answer: no card is drawn in its place (no ruler, battery, bulb, switch, clock or ice-size hint). Names: SAEA, SAEALT, saeArt. */
const SA_O='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 190" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%"><rect x="1" y="1" width="298" height="188" rx="10" fill="#eef6ff" stroke="#9db6dc" stroke-width="2"/>',SA_C='</svg>';
const SA_D=(x,y,w,h)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="#fff" stroke="#7a8ea6" stroke-width="2" stroke-dasharray="5 4"/>';
const SA_P=x=>'<path d="M'+x+' 125h50l-6 25h-38z" fill="#c8643c"/><rect x="'+(x-2)+'" y="122" width="54" height="6" rx="2" fill="#a94f2c"/><path d="M'+(x+25)+' 122v-28" stroke="#2f8f4a" stroke-width="3" fill="none"/><ellipse cx="'+(x+16)+'" cy="100" rx="11" ry="6" transform="rotate(-25 '+(x+16)+' 100)" fill="#3fae5a"/><ellipse cx="'+(x+35)+'" cy="106" rx="11" ry="6" transform="rotate(25 '+(x+35)+' 106)" fill="#3fae5a"/>';
const SA_B=x=>'<rect x="'+(x-22)+'" y="90" width="44" height="60" rx="4" fill="#dff1ff" stroke="#5a7a99" stroke-width="3"/><rect x="'+(x-19)+'" y="108" width="38" height="39" fill="#8fc7f0"/><path d="M'+(x-22)+' 90h-4M'+(x+22)+' 90h4" stroke="#5a7a99" stroke-width="3"/>';
const SAEA={
 cahaya:()=>SA_O+'<rect x="2" y="150" width="296" height="8" fill="#b88a5a"/><rect x="2" y="158" width="296" height="30" fill="#e5d3b3"/>'
  +'<rect x="15" y="12" width="80" height="70" rx="3" fill="#cfe9ff" stroke="#5a7a99" stroke-width="3"/><path d="M55 12v70M15 47h80" stroke="#5a7a99" stroke-width="2"/>'
  +'<circle cx="34" cy="28" r="10" fill="#ffd23f"/><path d="M34 10v5M34 41v5M16 28h5M47 28h5M21 15l4 4M43 37l4 4M47 15l-4 4M25 37l-4 4" stroke="#f0a500" stroke-width="2.5" stroke-linecap="round"/>'
  +'<path d="M30 85L95 85L100 122L40 122z" fill="#ffe680" opacity=".35"/>'+SA_P(40)
  +'<rect x="205" y="62" width="72" height="92" rx="6" fill="none" stroke="#7a8ea6" stroke-width="2.5" stroke-dasharray="6 5"/>'+SA_P(215)
  +'<rect x="124" y="128" width="30" height="22" rx="3" fill="#6aa3d9"/><path d="M154 134l14-8" stroke="#6aa3d9" stroke-width="4" stroke-linecap="round"/><path d="M128 128c0-14 22-14 22 0" fill="none" stroke="#4d86bd" stroke-width="3"/>'
  +SA_D(238,166,50,16)+SA_C,
 ais:()=>SA_O+'<rect x="2" y="150" width="296" height="8" fill="#b88a5a"/><rect x="2" y="158" width="296" height="30" fill="#e5d3b3"/>'
  +SA_B(60)+SA_B(150)+SA_B(240)+SA_D(48,32,24,24)+SA_D(138,32,24,24)+SA_D(228,32,24,24)
  +[[60,'10'],[150,'30'],[240,'60']].map(t=>'<text x="'+t[0]+'" y="133" text-anchor="middle" font-family="Fredoka,sans-serif" font-size="12" font-weight="800" fill="#1c2f6b">'+t[1]+' \u00b0C</text>').join('')
  +SA_D(94,88,22,22)+SA_D(187,82,16,34)+'<circle cx="268" cy="166" r="12" fill="#fff" stroke="#7a8ea6" stroke-width="2" stroke-dasharray="5 4"/>'+SA_D(17,157,26,20)+SA_C,
 litar:()=>SA_O+'<g fill="none" stroke="#444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M40 60V35H125"/><path d="M175 35H260V64"/><path d="M260 88V150H170"/><path d="M130 150H40V120"/><path d="M40 100V80"/></g>'
  +SA_D(28,60,24,20)+SA_D(28,100,24,20)+SA_D(125,26,50,18)+SA_D(250,64,20,24)+SA_D(130,140,40,20)+SA_C
};
const SAEALT={cahaya:'Rajah eksperimen: Pasu A di bawah tingkap yang terang, Pasu B dalam petak putus-putus, sebuah penyiram air dan satu petak kosong untuk alat.',ais:'Rajah eksperimen: tiga bikar air di atas meja, dilabel 10 °C, 30 °C dan 60 °C, dengan beberapa petak kosong untuk bahan dan alat.',litar:'Rajah litar elektrik berbentuk segi empat dengan lima petak kosong pada wayar.'};
const saeArt=id=>SAEA[id]?SAEA[id]():'';
/* Round 10k2: a small picture on every answer card (tray and row), so a child can tell a battery from a switch. Icons are drawn for ALL cards, the right answers and the distractors alike, so no card stands out.
   viewBox 0 0 40 40, no text, no links. Names: SAEI, saeIcon. */
const SAEI=(()=>{const st=(f,c,w)=>' fill="'+f+'" stroke="'+(c||'#444')+'" stroke-width="'+(w||2)+'" stroke-linejoin="round" stroke-linecap="round"';
const cup=l=>'<path d="M11 7h18l-2 27H13z"'+st('#e9f5ff','#5a7a99',2.2)+'/><rect x="13.3" y="'+(34-25*l)+'" width="13.4" height="'+(25*l)+'" fill="#7fbde8"/><path d="M11 13h5M11 20h5M12 27h4" stroke="#5a7a99" stroke-width="1.6"/>';
const seed=x=>'<path d="M'+(x+6)+' 28V16" stroke="#2f8f4a" stroke-width="2.4" fill="none"/><ellipse cx="'+(x+2)+'" cy="17" rx="5" ry="2.8" transform="rotate(-25 '+(x+2)+' 17)" fill="#3fae5a"/><ellipse cx="'+(x+10)+'" cy="20" rx="5" ry="2.8" transform="rotate(25 '+(x+10)+' 20)" fill="#3fae5a"/><path d="M'+x+' 28h12l-2 8H'+(x+2)+'z" fill="#c8643c"/>';
const cube=(t)=>'<g transform="'+t+'"><path d="M8 14l12-6 12 6v14l-12 6-12-6z"'+st('#cfeeff','#6aa6cc')+'/><path d="M8 14l12 6 12-6M20 20v14" fill="none" stroke="#6aa6cc" stroke-width="1.6"/></g>';
const bat=t=>'<g transform="'+t+'"><rect x="6" y="12" width="24" height="16" rx="2"'+st('#3fae5a','#14501f')+'/><rect x="6" y="12" width="8" height="16" rx="2" fill="#2b2b2b"/><rect x="30" y="17" width="4" height="6"'+st('#bbb','#555',1.5)+'/></g>';
const ther='<rect x="17" y="4" width="6" height="24" rx="3"'+st('#fff','#5a7a99')+'/><rect x="19" y="14" width="2" height="16" fill="#d1473f"/><circle cx="20" cy="31" r="5.5"'+st('#d1473f','#5a7a99')+'/><path d="M25 10h4M25 16h4M25 22h4" stroke="#5a7a99" stroke-width="1.6"/>';
const rul=(f,c)=>'<rect x="3" y="15" width="34" height="10" rx="1.5"'+st(f,c)+'/><path d="M8 15v5M13 15v3M18 15v5M23 15v3M28 15v5M33 15v3" stroke="'+c+'" stroke-width="1.6"/>';
return{
 sama:()=>seed(5)+seed(23),air50:()=>cup(.4),air100:()=>cup(.8),
 gelap:()=>'<rect x="7" y="5" width="26" height="30" rx="2"'+st('#4a4f5c','#2b2f38')+'/><path d="M20 5v30" stroke="#2b2f38" stroke-width="2"/><circle cx="17" cy="21" r="1.6" fill="#ddd"/><circle cx="23" cy="21" r="1.6" fill="#ddd"/>',
 pembaris:()=>rul('#f2d16b','#a07c12'),
 tinggi:()=>'<path d="M13 35V13" stroke="#2f8f4a" stroke-width="2.6" fill="none"/><ellipse cx="9" cy="14" rx="5.5" ry="3" transform="rotate(-25 9 14)" fill="#3fae5a"/><ellipse cx="18" cy="17" rx="5.5" ry="3" transform="rotate(25 18 17)" fill="#3fae5a"/><path d="M30 7v28M26.5 11L30 7l3.5 4M26.5 31L30 35l3.5-4" fill="none" stroke="#2a49a8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
 x1:()=>'<g transform="translate(-4 2) scale(.85)">'+cup(.92)+'</g>'+'<g transform="translate(17 18) scale(.6)"><path d="M6 14h28l-4 20H10z" fill="#c8643c"/><path d="M20 14V0" stroke="#2f8f4a" stroke-width="3.5"/></g>',
 x2:()=>ther,termo:()=>ther,
 aissama:()=>cube('translate(0 0)'),
 aisbeza:()=>cube('translate(-6 -3) scale(.95)')+cube('translate(18 14) scale(.5)'),
 jam:()=>'<rect x="17" y="3" width="6" height="5" rx="1"'+st('#999','#444',1.6)+'/><circle cx="20" cy="23" r="13"'+st('#fff','#444',2.4)+'/><path d="M20 23V14M20 23l6 3" stroke="#d1473f" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M32 11l3 3" stroke="#444" stroke-width="3" stroke-linecap="round"/>',
 masa:()=>'<path d="M11 5h18v5l-7 10 7 10v5H11v-5l7-10-7-10z"'+st('#fff3c4','#8a6d1a')+'/><path d="M14 31h12l-3-6h-6z" fill="#e0b84a"/>',
 airbeza:()=>'<g transform="translate(-5 12) scale(.65)">'+cup(.3)+'</g><g transform="translate(17 12) scale(.65)">'+cup(.85)+'</g>',
 bateri:()=>bat('translate(0 0)'),bateri2:()=>bat('translate(0 -8) scale(1)')+bat('translate(0 4)'),
 wayar:()=>'<path d="M3 21c4-11 8-11 8 0s4 11 8 0 4-11 8 0 4 11 8 0" fill="none" stroke="#c8743c" stroke-width="3.6" stroke-linecap="round"/>',
 suis:()=>'<rect x="4" y="27" width="32" height="8" rx="2"'+st('#8a8f99','#444')+'/><circle cx="11" cy="27" r="3.2"'+st('#ddd','#444',1.6)+'/><circle cx="29" cy="27" r="3.2"'+st('#ddd','#444',1.6)+'/><path d="M11 27L28 12" stroke="#333" stroke-width="3.6" stroke-linecap="round"/>',
 mentol:()=>'<circle cx="20" cy="15" r="10.5"'+st('#fff6a8','#a08a12',2.2)+'/><path d="M16 18l2-5 2 5 2-5 2 5" fill="none" stroke="#c47f00" stroke-width="1.8"/><path d="M15 25h10v6H15z"'+st('#aaa','#666')+'/><path d="M16 31h8v2a4 3 0 0 1-8 0z"'+st('#888','#555',1.6)+'/>',
 getah:()=>'<path d="M3 24c6-14 11 14 17 0s11 14 17 0" fill="none" stroke="#4d4d55" stroke-width="4.2" stroke-linecap="round"/>',
 plastik:()=>rul('#e6f1f8','#8aa6ba')}})();
const saeIcon=id=>SAEI[id]?'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" style="display:block;width:100%;height:100%" aria-hidden="true">'+SAEI[id]()+'</svg>':'';
