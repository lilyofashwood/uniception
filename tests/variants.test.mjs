import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('../variants/snowline-mirrorfall/',import.meta.url);
test('public Snowline extraction and synthetic specimen match the scoped manifest',()=>{
  const manifest=JSON.parse(readFileSync(new URL('public-source.json',root),'utf8'));
  assert.equal(manifest.codec,'SN v1');
  assert.equal(manifest.specimen,'snowline-public-lantern-1');
  assert.equal(Object.keys(manifest.sha256).length,5);
  for(const [path,hash] of Object.entries(manifest.sha256)){
    assert.equal(createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex'),hash,path);
  }
});
test('Uniception links the public variant without merging its codec into selected-letter modes',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(html.includes('href="variants/snowline-mirrorfall/demo.html"'));
  assert.ok(!html.includes('href="variants/snowline-mirrorfall/index.html"'));
  assert.ok(html.includes('aria-label="Snowline / Mirrorfall variant"'));
  const core=readFileSync(new URL('../core.js',import.meta.url),'utf8');
  assert.ok(!core.includes('decodeMirrorfall'));
});
