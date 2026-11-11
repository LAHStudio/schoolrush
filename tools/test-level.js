/* Round 10h3: Node stub test (NOT a real browser) for the Tahap belajar logic: new slot saves the chosen level, old saves load as 'sederhana', Mod Kelas passes it as the quiz lock, Mod Jalan-jalan passes null, and the CSS makes selected and unselected differ. Run: node tools/test-level.js */
const fs=require('fs'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let f=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)f++};
const core=R('js/core.js'),NP=eval('('+core.match(/const NP=(\(\)=>\(\{.*?\}\));/)[1]+')'),fixP=eval('('+core.match(/function fixP\(p\)\{.*?return p\}/)[0].replace('function fixP','function')+')');
ok(NP().level=='sederhana','NP default level is sederhana');
['mudah','sederhana','sukar'].forEach(l=>{const p=Object.assign(NP(),{name:'A',level:l});ok(fixP(p).level==l,'new slot keeps chosen level '+l)});
const old={v:1,badges:{},rooms:{}};ok(fixP(old).level=='sederhana','old save with no level loads as sederhana');
ok(fixP({level:'sukar'}).level=='sukar','existing level is not overwritten on load');
const menu=R('js/menu.js');ok(/Object\.assign\(NP\(\),\{name:nm,level:selLv\}\)/.test(menu),'startGame saves selLv into the profile');
const lock=(STORY,cur)=>STORY?(cur.level||'sederhana'):null;
ok(lock(true,{level:'mudah'})=='mudah'&&lock(true,{})=='sederhana'&&lock(false,{level:'sukar'})===null,'quiz lock: Mod Kelas = saved level (fallback sederhana), Mod Jalan-jalan = null');
ok(R('js/kelas.js').includes("lock:STORY?(cur.level||'sederhana'):null"),'kelas.js still uses that exact lock');
const css=R('css/style.css');ok(/#lvb button:not\(\.on\)[^{]*\{opacity:\.5\}/.test(css)&&/#lvb button\.on[^{]*\{[^}]*outline:3px solid #fff!important/.test(css),'CSS: unselected dimmed, selected outlined (setup + Tetapan)');
ok(/CACHE='sr-r\d+/.test(R('sw.js')),'sw.js has a sr-r10... cache name (Round 10i: loosened, it was pinned to sr-r10h3)');
ok(/\#lvb\{font-size:1\.02em;margin-top:\.9em\}/.test(css),'CSS: Tahap row 120% bigger and lower');
console.log(f?f+' FAILED':'ALL PASS');process.exit(f?1:0);
