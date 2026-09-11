import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {UI_REGISTERS,gardenCatalog,letterText,showInterfaceMessage,showLiteralResult,interfaceChoice} from '../lettering.js';

test('offline interface includes the complete 78-entry Font Garden catalog and eight usable registers',()=>{
  assert.equal(gardenCatalog().length,78);
  for(const id of UI_REGISTERS)assert.ok(gardenCatalog().some(style=>style.id===id));
  assert.equal(new Set(UI_REGISTERS).size,8);
  assert.ok(gardenCatalog().some(style=>style.id==='coral-asemic-specimen'));
});

test('house body and varied registers preserve non-ASCII literals and combining marks',()=>{
  assert.equal(letterText('LILY'),'𝗅𝐢𝗅𝗒');
  for(const id of UI_REGISTERS){
    const output=letterText('Garden',id);
    assert.doesNotMatch(output,/[A-Za-z]/u);
    assert.equal(output.normalize('NFKC'),'garden');
    const mixed=letterText('A · 歌 🐈‍⬛ e\u0301',id);
    assert.ok(mixed.includes(' · 歌 🐈‍⬛ '));
    assert.ok(mixed.endsWith('\u0301'));
    assert.equal(mixed.normalize('NFKD'),'a · 歌 🐈‍⬛ e\u0301'.normalize('NFKD'));
  }
  assert.throws(()=>letterText('text','unknown'));
});

test('static source disables provider controls; lettering excludes data and existing accessible descriptions',()=>{
  const root=new URL('../',import.meta.url);
  const html=readFileSync(new URL('index.html',root),'utf8');
  assert.doesNotMatch(html,/name="uniception-local-adapter"/);
  for(const id of ['provider','model','endpoint','key','tokens','compose','interpret'])assert.ok(html.includes(`id="${id}" disabled`));
  assert.ok(html.includes('id="variant-link" href="variants/snowline-mirrorfall/demo.html"'));
  const app=readFileSync(new URL('app.js',root),'utf8');
  assert.match(app,/disabled=!localAdapter/u);
  assert.match(app,/if\(!localAdapter\)throw new Error/u);
  const lettering=readFileSync(new URL('lettering.js',root),'utf8');
  assert.ok(lettering.includes('pre,code,textarea,input,[data-literal],.variant-accessible'));
  assert.ok(!lettering.includes('[aria-live]'));
});

test('status prose is lettered while exact results clear stale accessible labels and remain literal',()=>{
  const attributes=new Map();
  const element={dataset:{},textContent:'',setAttribute:(key,value)=>attributes.set(key,value),
    removeAttribute(key){attributes.delete(key);if(key==='data-interface')delete this.dataset.interface;}};
  const notice='Rejected: no envelope recovered yet.';
  showInterfaceMessage(element,notice);
  assert.equal(element.textContent,letterText(notice));
  assert.doesNotMatch(element.textContent,/[A-Za-z]/);
  assert.equal(attributes.get('aria-label'),notice);
  assert.equal(element.dataset.interface,'message');
  const exact={payload:'\uFEFFASCII 🐈‍⬛ e\u0301\t\r\n',format:'literal.v1'};
  showLiteralResult(element,exact);
  assert.equal(element.textContent,JSON.stringify(exact,null,2));
  assert.deepEqual(JSON.parse(element.textContent),exact);
  assert.equal(attributes.has('aria-label'),false);
  assert.equal(attributes.has('data-literal'),true);
  assert.equal(element.dataset.interface,undefined);
  showLiteralResult(element,exact.payload);
  assert.equal(element.textContent,exact.payload);
  showInterfaceMessage(element,'Key cleared.');
  assert.equal(attributes.has('data-literal'),false);
  assert.equal(attributes.get('aria-label'),'Key cleared.');
});

test('landing presets accept only exact known choices, never data or keys',()=>{
  const choices=['first','second'];
  assert.equal(interfaceChoice('?mode=second','mode',choices,'first'),'second');
  for(const search of ['', '?mode=SECOND', '?mode=unknown', '?mode=__proto__', '?mode=%F0%9F%90%88', '?payload=second&key=second']){
    assert.equal(interfaceChoice(search,'mode',choices,'first'),'first');
  }
  assert.equal(interfaceChoice('?mode=first&mode=second','mode',choices,'first'),'first');
  assert.deepEqual(choices,['first','second']);
});
