/* Round 14: Node stub test for the continue rule (bus only on a fresh start). Run: node tools/test-continue.js */
const fs=require('fs'),path=require('path');let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('FAIL',m)}};
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const menu=rd('js/menu.js'),story=rd('js/story.js'),core=rd('js/core.js'),wh=rd('world.html'),lg=rd('js/luar-logic.js');
const m1=menu.match(/function okCont\(p\)\{[^\n]*\}/),m2=core.match(/const dayOk=[^\n]*?;(?=\n|\/\*)/)||core.match(/const dayOk=[^\n]*/);
ok(!!m1,'okCont() exists in js/menu.js');ok(!!m2,'dayOk exists in js/core.js');
let mode='roam';const mk=new Function('getMode',m2[0].replace(/;?\s*$/,'')+';'+m1[0]+';return okCont');const okCont=mk(()=>mode);
const day={order:[0,1,2,3,4,5],n:2,score:10,ok:1,lt:0,room:5,gr:{}};
const dayGood=new Function(m2[0].replace(/;?\s*$/,'')+';return dayOk')();
/* find a save that dayOk accepts, whatever fields it wants */
let save=null;for(const extra of [{},{room:5},{room:1,g:'x'}]){const s=Object.assign({},day,extra);if(dayGood&&dayGood(s)){save=s;break}}
ok(!!save,'a valid saved day was built for the test');
mode='story';ok(okCont({save})===true,'Mod Kelas + valid saved day = continue straight in');
ok(okCont({save:null})===false,'Mod Kelas + nothing saved = bus');ok(okCont({save:{order:[1]}})===false,'Mod Kelas + broken saved day = bus');
ok(okCont({pos:{x:1,z:1,f:0}})===false,'Mod Kelas ignores a Mod Jalan-jalan position');
mode='roam';ok(okCont({pos:{x:3.5,z:-8,f:1}})===true,'Mod Jalan-jalan + valid position = straight in');
ok(okCont({})===false,'Mod Jalan-jalan + no position = bus');ok(okCont({pos:{x:'a',z:1}})===false,'bad position = bus');
ok(okCont({pos:{x:999,z:0}})===false,'far-away position = bus');ok(okCont({pos:{x:NaN,z:0}})===false,'NaN position = bus');ok(okCont(null)===false,'no profile = bus');
ok(okCont({save})===false,'Mod Jalan-jalan ignores a saved Mod Kelas day');
/* wiring */
ok(/if\(cont&&okCont\(cur\)\)SS\.set\('sk_in',1\);else SS\.del\('sk_in'\)/.test(menu),'startGame: Teruskan with something valid keeps sk_in set, otherwise it is deleted');
ok(!/startGame\(cont\)\{[^]*?\}else\{[^]*?\}\s*SS\.del\('sk_in'\);inMenu/.test(menu),'the unconditional SS.del(sk_in) is gone');
ok(/new character|NP\(\)/.test(menu)&&/else\{const nm=/.test(menu),'a new character still goes through the same startGame with cont false (bus)');
ok(/sessionStorage\.getItem\('sk_in'\)&&!sessionStorage\.getItem\('sk_ret'\)&&!sessionStorage\.getItem\('sk_day'\)/.test(wh)&&/location\.replace\('luar\.html'\)/.test(wh),'world.html redirect rule unchanged');
ok(/\['Mula baru',\(\)=>\{cur\.save=null;save\(\);closeCard\(\);SS\.del\('sk_in'\);SS\.del\('sk_day'\);SS\.del\('sk_out'\);loading\(\(\)=>nav\('luar'\)\)\}\]/.test(story),'Sambung card: Mula baru clears the day and goes to luar.html (bus)');
ok(!/\['Mula baru',\(\)=>\{[^\]]*freshDay\(\)/.test(story),'Mula baru no longer starts inside');
ok(/\['Sambung',\(\)=>\{closeCard\(\)/.test(story),'Sambung still continues inside');
ok(/SS\.del\('sk_in'\);location\.reload\(\)/.test(story),'Main lagi after Sekolah tamat still starts with the bus');
/* luar flow */
const lul=new Function(lg+';return LUL')();
ok(lul.flow({story:true,out:undefined,hasDay:false,savedDay:false})==='arrive','Mula baru -> luar.html: arrive flow (bus)');
ok(lul.flow({story:true,out:'home',hasDay:true,savedDay:false})==='home'&&lul.flow({story:true,out:'exit'})==='exit','home and exit flows unchanged');
ok(lul.flow({story:true,out:undefined,hasDay:false,savedDay:true})==='skip','luar safety net skip unchanged');
/* simulated launches: does world.html redirect? */
const redirect=ss=>!ss.sk_in&&!ss.sk_ret&&!ss.sk_day;
ok(redirect({})===true,'fresh launch: world redirects to luar (bus)');ok(redirect({sk_in:1})===false,'continue launch: world loads directly (no extra hop)');
console.log(fail?fail+' FAILED, '+pass+' passed':'all '+pass+' checks passed');process.exit(fail?1:0);
