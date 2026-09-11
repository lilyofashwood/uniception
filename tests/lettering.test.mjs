import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {UI_REGISTERS,gardenCatalog,letterText} from '../lettering.js';

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
  assert.ok(lettering.includes('pre,code,textarea,input,[data-literal],[aria-live],.variant-accessible'));
});
