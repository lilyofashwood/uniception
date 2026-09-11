import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {MODES,CARRIER,LINES,POSITIONS,SOURCE_WIRES,EXPECTED_PAYLOAD,weave,inspect} from '../specimen.js';
import {legacyEncode} from '../../../core.js';

test('eight literal source lines and fourteen strictly increasing positions',()=>{
  assert.equal(LINES.length,8);assert.equal(POSITIONS.length,14);
  assert.equal(POSITIONS.map(p=>[...CARRIER][p]).join(''),EXPECTED_PAYLOAD);
  assert.ok(POSITIONS.every((p,i)=>Number.isInteger(p)&&p>=0&&p<[...CARRIER].length&&(!i||p>POSITIONS[i-1])));
});
for(const mode of MODES)test(`${mode}: actual core matches exact supplied font glyphs and decodes both channels`,()=>{
  const result=weave(mode);assert.equal(result.encoded,SOURCE_WIRES[mode]);
  assert.equal(result.carrier,CARRIER);assert.equal(result.secret,'iwasalwayshere');
  assert.deepEqual(result.positions,POSITIONS);assert.equal(result.sourceExact,true);
});
test('decoder reads altered valid wire rather than returning the known answer',()=>{
  const altered=legacyEncode(CARRIER,'iw','v1',[...POSITIONS].slice(0,2)).encoded;
  const result=inspect(altered,'v1');assert.equal(result.secret,'iw');
  assert.equal(result.sourceExact,false);assert.equal(result.payloadExact,false);assert.equal(result.carrierExact,true);
});
test('wrong modes and foreign font data fail explicitly',()=>{
  assert.throws(()=>weave('plain'),/supplied/);
  assert.throws(()=>inspect(SOURCE_WIRES.v1,'two_plains'),/supplied/);
  assert.throws(()=>inspect(SOURCE_WIRES.aesthetic,'v1'),/Unexpected/);
});
test('page uses external self assets and isolates literal wire/payload from lettering',()=>{
  const html=readFileSync(fileURLToPath(new URL('../index.html',import.meta.url)),'utf8');
  assert.match(html,/<script type="module" src="app\.js"><\/script>/);
  assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)[^>]*>/);
  assert.doesNotMatch(html,/https?:\/\//);
  for(const id of ['poem','wire','secret','receipt','accessible-poem']){
    assert.match(html,new RegExp('<[^>]+id="'+id+'"[^>]*data-literal'));
  }
});
