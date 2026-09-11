// Self-contained, exact-allowlist browser QA; never starts the BYOK server.
// NODE_PATH=/path/to/playwright/node_modules CHROME_BIN=/path/to/chrome node tests/browser.cjs
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

(async()=>{
  const root=path.resolve(__dirname,'../../..');
  const prefix='/variants/nekomata-thread/';
  const allowed=new Set(['core.js','lettering.js',...['index.html','app.js','specimen.js','style.css'].map(p=>'variants/nekomata-thread/'+p)]);
  const server=http.createServer((request,response)=>{
    const name=new URL(request.url,'http://localhost').pathname.slice(1);
    if(!allowed.has(name)){response.writeHead(404);response.end();return;}
    response.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    response.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');
    response.end(fs.readFileSync(path.join(root,name)));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  let browser;
  try{
    const {MODES,SOURCE_WIRES,CARRIER}=await import(pathToFileURL(path.join(root,'variants/nekomata-thread/specimen.js')));
    const {legacyEncode}=await import(pathToFileURL(path.join(root,'core.js')));
    browser=await chromium.launch({headless:true,...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{})});
    const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
    const requests=[],errors=[];
    context.on('request',request=>requests.push(request.url()));
    await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    for(const viewport of [{width:1365,height:950},{width:390,height:844}]){
      await page.setViewportSize(viewport);await page.goto(base+prefix+'index.html');
      await page.waitForFunction(()=>document.querySelector('#wire').value.length>0);
      assert.doesNotMatch(await page.title(),/[A-Za-z]/);
      assert.doesNotMatch(await page.locator('#status').textContent(),/[A-Za-z]/);
      assert.match(await page.locator('#status').getAttribute('aria-label'),/Source glyphs/);
      await page.getByRole('heading',{name:'Nekomata thread',exact:true}).waitFor();
      for(const mode of MODES){
        await page.locator('[data-mode="'+mode+'"]').click();
        assert.equal(await page.locator('#wire').inputValue(),SOURCE_WIRES[mode]);
        assert.equal(await page.locator('#poem').textContent(),SOURCE_WIRES[mode]);
        await page.getByRole('button',{name:'Decode the actual text',exact:true}).click();
        assert.equal(await page.locator('#secret').textContent(),'iwasalwayshere');
        assert.equal(await page.locator('#poem .selected').count(),14);
        assert.equal(await page.locator('#poem').textContent(),SOURCE_WIRES[mode]);
        const receipt=JSON.parse(await page.locator('#receipt').textContent());
        assert.equal(receipt.sourceExact,true);assert.equal(receipt.payloadExact,true);
        await page.getByRole('button',{name:'Veil the reveal',exact:true}).click();
        assert.equal(await page.locator('#reveal').isVisible(),false);
      }
      await page.getByRole('button',{name:'Copy exact poem',exact:true}).click();
      assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),SOURCE_WIRES.aesthetic);
      await page.locator('details').evaluate(element=>element.open=true);
      const ascii=await page.evaluate(()=>{
        const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),found=[];
        while(walker.nextNode()){
          const n=walker.currentNode,p=n.parentElement;
          if(!p||p.closest('script,style,textarea,pre,code,[data-literal],[hidden]'))continue;
          if(/[A-Za-z]/.test(n.nodeValue))found.push(n.nodeValue.trim());
        }
        return found;
      });
      assert.deepEqual(ascii,[]);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      if(process.env.QA_SCREENSHOT_DIR){
        const dir=path.resolve(process.env.QA_SCREENSHOT_DIR);fs.mkdirSync(dir,{recursive:true});
        await page.locator('details').evaluate(element=>element.open=false);
        await page.getByRole('button',{name:'Decode the actual text',exact:true}).click();
        await page.screenshot({path:path.join(dir,viewport.width>500?'nekomata-desktop.png':'nekomata-mobile.png'),fullPage:true});
      }
    }
    await page.locator('[data-mode="v1"]').click();
    await page.getByRole('button',{name:'Decode the actual text',exact:true}).click();
    assert.equal(await page.locator('#reveal').isVisible(),true);
    const altered=legacyEncode(CARRIER,'iw','v1',[6,26]).encoded;
    await page.locator('#wire').evaluate((element,value)=>element.value=value,altered);
    await page.locator('#wire').dispatchEvent('input');
    assert.equal(await page.locator('#reveal').isVisible(),false);
    assert.equal(await page.locator('#secret').textContent(),'');
    assert.equal(await page.locator('#receipt').textContent(),'');
    assert.equal(await page.locator('#poem .selected').count(),0);
    assert.equal(await page.locator('#poem').textContent(),altered);
    assert.match((await page.locator('#status').textContent()).normalize('NFKC'),/text has changed/);
    await page.getByRole('button',{name:'Decode the actual text',exact:true}).click();
    assert.equal(await page.locator('#secret').textContent(),'iw');
    assert.equal(JSON.parse(await page.locator('#receipt').textContent()).sourceExact,false);
    await page.locator('#wire').evaluate(element=>element.value='wrong font');
    await page.getByRole('button',{name:'Decode the actual text',exact:true}).click();
    assert.equal(await page.locator('#reveal').isVisible(),false);
    assert.match((await page.locator('#status').textContent()).normalize('NFKC'),/cannot decode/);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('[data-mode="chaos_noodle"]').click();
    await page.getByRole('button',{name:'Decode the actual text',exact:true}).click();
    assert.equal(await page.locator('#secret').textContent(),'iwasalwayshere');
    for(const requested of [...MODES,'unknown','__proto__']){
      await page.goto(base+prefix+'index.html?mode='+requested);
      await page.waitForFunction(()=>document.querySelector('#wire').value.length>0);
      const expected=MODES.includes(requested)?requested:'v1';
      assert.equal(await page.locator('#wire').inputValue(),SOURCE_WIRES[expected]);
      assert.equal(await page.locator('[aria-pressed="true"]').getAttribute('data-mode'),expected);
      assert.equal(await page.locator('#reveal').isVisible(),false);
    }
    assert.deepEqual(errors,[]);assert.ok(requests.every(url=>new URL(url).origin===base));
    assert.ok(requests.every(url=>!url.includes('/api/')));
    console.log('PASS: desktop/mobile, three exact source modes, stale receipt invalidation, true altered-wire decoding, rejection, reduced motion, exact clipboard, no editable ASCII prose/overflow/page errors/external calls.');
  }finally{
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
