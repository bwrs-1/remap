import sys,re,subprocess,json
for f in sys.argv[1:]:
    s=open('canvas2/project/'+f).read()
    js=re.search(r'data-dc-script[^>]*>(.*?)</script>',s,re.S).group(1)
    open('chk.js','w').write('globalThis.window={matchMedia:()=>({matches:false})};class DCLogic{setState(){}}\n'+js+'\nconst c=new Component();c.props={};c.state={};console.log(JSON.stringify(Object.keys(c.renderVals())));')
    try:
        keys=set(json.loads(subprocess.check_output(['node','chk.js'],stderr=subprocess.STDOUT)))
    except subprocess.CalledProcessError as e:
        print(f,'JS ERROR',e.output.decode()[-600:]); continue
    body=s.split('<x-dc>')[1].split('</x-dc>')[0]
    loops=set(re.findall(r'as="(\w+)"',body))
    holes=set(h.split('.')[0] for h in re.findall(r'\{\{\s*([\w.\$]+)\s*\}\}',body))
    # opening/closing tag balance for sc-if/sc-for/div/button/section
    bal={t:(body.count('<'+t+' ')+body.count('<'+t+'>'))-body.count('</'+t+'>') for t in ['div','button','section','sc-if','sc-for','span','label','a','select','main','nav','header','footer']}
    print(f,'missing:',sorted(holes-keys-loops-{'true','false'}),'unbalanced:',{k:v for k,v in bal.items() if v})
