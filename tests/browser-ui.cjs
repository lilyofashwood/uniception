// Offline UI smoke: start the reviewed server separately, never a broad directory server.
// NODE_PATH=/path/to/playwright/modules node tests/browser-ui.cjs http://127.0.0.1:18768
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {readFileSync,mkdirSync}=require('node:fs');
const path=require('node:path');

(async()=>{
  const root=path.resolve(__dirname,'..');
  const base=process.argv[2]||'http://127.0.0.1:18768';
  assert.match(base,/^http:\/\/127\.0\.0\.1:\d+$/);
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  const page=await context.newPage();
  const errors=[],requests=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>requests.push(request.url()));
  await page.route('**/api/compose',route=>route.abort()); // This smoke must never call a provider.
  const original=readFileSync(path.join(root,'index.html'),'utf8');
  const initialCarrier=original.match(/<textarea id="carrier"[^>]*>(.*?)<\/textarea>/s)[1];
  const initialPayload=original.match(/<textarea id="payload"[^>]*>(.*?)<\/textarea>/s)[1];
  const screenshotDirectory=path.join(root,'output');mkdirSync(screenshotDirectory,{recursive:true});
  try{
    await page.goto(base);await page.waitForFunction(()=>document.querySelector('summary').dataset.gardenRegister);
    assert.equal(await page.locator('#payload').inputValue(),initialPayload);
    assert.equal(await page.locator('#carrier').inputValue(),initialCarrier);
    assert.deepEqual(await page.locator('#mode option').evaluateAll(options=>options.map(option=>option.value)),['two_plains','v1','chaos_noodle','debug_italic','debug_plain','aesthetic']);
    assert.equal(await page.locator('#compose').isDisabled(),false);
    assert.equal(await page.locator('#key').isDisabled(),false);
    assert.equal(await page.locator('#variant-link').isVisible(),true);
    assert.equal(await page.locator('#variant-link').getAttribute('href'),'variants/snowline-mirrorfall/demo.html');
    await page.getByRole('button',{name:'Weave and verify locally',exact:true}).click();
    const legacy=JSON.parse(await page.locator('#receipt').textContent());
    assert.equal(legacy.secret,'thedoorremembers');assert.equal(legacy.carrier,initialCarrier);
    await page.getByRole('button',{name:'Load byte-format example',exact:true}).click();
    const payload='The door remembers.\n𝓵𝓲𝓵𝔂 🕯️ e\u0301';
    assert.equal(await page.locator('#payload').inputValue(),payload);
    const encoded=await page.locator('#encoded').inputValue();
    assert.ok(encoded.startsWith('<!-- stegweb:bytes-v2:two_plains:start -->'));
    await page.getByRole('button',{name:'Decode selected format',exact:true}).click();
    assert.equal(JSON.parse(await page.locator('#receipt').textContent())[0].payload,payload);
    const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Download passage',exact:true}).click();
    const download=await downloadEvent;assert.equal(download.suggestedFilename(),'uniception-passage.md');
    assert.equal(readFileSync(await download.path(),'utf8'),encoded);
    await page.locator('#payload').fill('new 🐈‍⬛ e\u0301');
    assert.doesNotMatch(await page.locator('#capacity').textContent(),/[A-Za-z]/);
    await page.locator('details').evaluate(element=>element.open=true);
    const ascii=await page.evaluate(()=>{
      const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT),found=[];
      while(walker.nextNode()){
        const node=walker.currentNode,parent=node.parentElement;
        if(!parent||parent.closest('pre,code,input,textarea,[aria-live],.variant-accessible,[hidden]'))continue;
        if(/[A-Za-z]/.test(node.nodeValue))found.push(node.nodeValue.trim());
      }
      return found;
    });
    assert.deepEqual(ascii,[]);
    assert.ok(await page.locator('[data-garden-register]').evaluateAll(elements=>new Set(elements.map(element=>element.dataset.gardenRegister)).size>=4));
    await page.screenshot({path:path.join(screenshotDirectory,'uniception-desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:path.join(screenshotDirectory,'uniception-mobile.png'),fullPage:true});

    // Same loopback origin, deliberately raw static HTML: localhost alone is not capability.
    await page.route(base+'/?static=1',route=>route.fulfill({status:200,contentType:'text/html',body:original}));
    await page.goto(base+'/?static=1');await page.waitForFunction(()=>document.querySelector('summary').dataset.gardenRegister);
    for(const id of ['provider','model','endpoint','key','tokens','compose','interpret'])assert.equal(await page.locator('#'+id).isDisabled(),true,id);
    assert.equal(await page.locator('#variant-link').isVisible(),true);
    assert.equal(await page.locator('#variant-link').getAttribute('href'),'variants/snowline-mirrorfall/demo.html');
    assert.match((await page.locator('#variant-status').textContent()).normalize('NFKC'),/new synthetic lantern specimen/);
    assert.match((await page.locator('#adapter-status').textContent()).normalize('NFKC'),/static preview/);
    await page.getByRole('button',{name:'Load byte-format example',exact:true}).click();
    await page.getByRole('button',{name:'Decode selected format',exact:true}).click();
    assert.equal(JSON.parse(await page.locator('#receipt').textContent())[0].payload,payload);
    // Programmatic calls also remain guarded, even if someone toggles disabled in devtools.
    await page.locator('#compose').evaluate(element=>element.onclick());
    assert.match(await page.locator('#model-result').textContent(),/Static preview/);
    assert.equal(await page.locator('#compose').isDisabled(),true);
    assert.deepEqual(errors,[]);
    assert.equal(requests.filter(url=>url.includes('/api/')).length,0);
    assert.equal(requests.filter(url=>url.includes('/variants/')).length,0);
    assert.ok(requests.every(url=>url.startsWith(base+'/')));
    console.log('PASS: desktop/mobile lettering, exact legacy/Unicode/download data, static BYOK guard and safe synthetic-variant link; no API or automatic variant requests.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
