"""Build helper: python3 tools/build.py
Reads index.html, world.html, css/style.css and js/*.js and writes:
  dist/preview.html   (one self-contained page for the chat preview)
  dist/sekolah-run.zip (the project folder, ready for GitHub Pages)
"""
import re,json,os,zipfile
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd=lambda p:open(os.path.join(root,p),encoding='utf-8').read()
import base64
def inline_assets(t):
    def f(m):
        n=m.group(0); ext=n.rsplit('.',1)[1]; mime={'webp':'image/webp','jpg':'image/jpeg','png':'image/png'}[ext]
        return 'data:'+mime+';base64,'+base64.b64encode(open(os.path.join(root,n),'rb').read()).decode()
    return re.sub(r'assets/brand/[\w.-]+\.(?:webp|jpg|png)',f,t)
def bundle(page):
    h=rd(page)
    css=''.join(rd(x) for x in re.findall(r'<link rel="stylesheet" href="(css/[^"]+)"',h))
    files=json.loads(re.search(r'const L=(\[.*?\]);',h).group(1))
    body=h[re.search(r'<body[^>]*>',h).end():h.index('<script src="https://cdnjs')]
    body=re.sub(r'<script src="(js/[^"]+)"></script>',lambda m:'<script>'+rd(m.group(1))+'</script>',body)
    js='\n'.join(rd(f) for f in files)
    head='<!DOCTYPE html><html lang="ms"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>SCHOOL RUSH</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap" rel="stylesheet"><style>'+css+'</style></head><body'+(' class="idx"' if 'class="idx"' in h else '')+'>'
    return inline_assets(head+body+'<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script><script>document.fonts.load(\'700 32px Fredoka\').catch(()=>{}).then(()=>{\n'+js+'\n});</script></body></html>')
os.makedirs(os.path.join(root,'dist'),exist_ok=True)
B={k:bundle(k+'.html') for k in ['index','world','kantin']}
for k,v in B.items(): open(os.path.join(root,'dist',k+'.bundle.html'),'w',encoding='utf-8').write(v)
esc=lambda t:t.replace('</script','<\\/script')
prev=('<!DOCTYPE html><html lang="ms"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>SCHOOL RUSH</title>'
'<style>html,body{margin:0;height:100%;background:#16204a}iframe{position:fixed;inset:0;width:100%;height:100%;border:0}</style></head><body><iframe id="f" allowfullscreen allow="fullscreen"></iframe>'
'<script type="text/plain" id="b_index">'+esc(B['index'])+'</script><script type="text/plain" id="b_world">'+esc(B['world'])+'</script><script type="text/plain" id="b_kantin">'+esc(B['kantin'])+'</script>'
'<script>const B={};["index","world"].forEach(k=>B[k]=document.getElementById("b_"+k).textContent.replace(/<\\\\\\/script/g,"</script"));window.__sr=function(to){document.getElementById("f").srcdoc=B[to]};__sr("index")</script></body></html>')
open(os.path.join(root,'dist','preview.html'),'w',encoding='utf-8').write(prev)
zp=os.path.join(root,'dist','sekolah-run.zip')
with zipfile.ZipFile(zp,'w',zipfile.ZIP_DEFLATED) as z:
    for dp,dn,fn in os.walk(root):
        if '/dist' in dp or '/tools' in dp or '__pycache__' in dp: continue
        for f in fn: z.write(os.path.join(dp,f),'sekolah-run/'+os.path.relpath(os.path.join(dp,f),root))
    z.write(os.path.join(root,'tools','build.py'),'sekolah-run/tools/build.py')
print('built',{k:len(v) for k,v in B.items()},len(prev))
