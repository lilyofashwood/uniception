import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as codec from './core.js';
import {specimen} from './specimen.js';

test('new synthetic specimen is explicit, neutral and valid in both SN v1 traversals',()=>{
  assert.equal(specimen.id,'snowline-public-lantern-1');
  assert.equal(specimen.codec,'SN v1');
  assert.equal(specimen.payload,'a small light returns');
  assert.equal(specimen.carrier.split('\n').length,8);
  assert.equal(codec.capacity(specimen.carrier).letters,280);
  for(const [encode,decode] of [[codec.encode,codec.decode],[codec.encodeMirrorfall,codec.decodeMirrorfall]]) {
    const packet=encode(specimen.carrier,specimen.payload),result=decode(packet.encoded);
    assert.equal(result.payload,specimen.payload);assert.equal(result.plaintext,specimen.carrier);
  }
});
for(const mode of ['linear','mirrorfall'])test(mode+' preserves UTF-8 payloads and the existing malformed-input boundaries',()=>{
  const enc=mode==='linear'?codec.encode:codec.encodeMirrorfall,dec=mode==='linear'?codec.decode:codec.decodeMirrorfall;
  const payload='\uFEFFneutral 🐈‍⬛ e\u0301\n\t\u0000',packet=enc('lamp '.repeat(120),payload);
  assert.equal(dec(packet.encoded).payload,payload);
  assert.equal(dec(enc('lamp '.repeat(20),'').encoded).payload,'');
  assert.throws(()=>enc('lamp','message'));assert.throws(()=>enc('lamp '.repeat(20),'\ud800'));
  assert.throws(()=>dec(packet.encoded.normalize('NFKC')));assert.throws(()=>dec('nothing here'));
});
test('Mirrorfall remains a center-out traversal, not a renamed selected-letter mode',()=>{
  assert.deepEqual(codec.mirrorfallOrder(6),[2,3,1,4,0,5]);assert.throws(()=>codec.mirrorfallOrder(5));
  assert.throws(()=>codec.encodeMirrorfall('a'.repeat(99),'a'));
  assert.throws(()=>codec.decode(codec.encodeMirrorfall('lamp '.repeat(90),'test').encoded));
});
test('CRC detects data-state damage but does not authenticate filler or visible wording',()=>{
  const packet=codec.encode('a'.repeat(280),'fixture'),chars=Array.from(packet.encoded);
  const state=codec.STATES.findIndex(s=>chars[30].codePointAt(0)===s.lower);
  chars[30]=String.fromCodePoint(codec.STATES[(state+1)%4].lower);
  assert.throws(()=>codec.decode(chars.join('')));
  const filler=Array.from(packet.encoded);filler[filler.length-1]=String.fromCodePoint(codec.STATES[1].lower);
  assert.equal(codec.decode(filler.join('')).payload,'fixture');
  const wording=Array.from(packet.encoded);wording[0]=String.fromCodePoint(codec.STATES[0].lower+1);
  assert.equal(codec.decode(wording.join('')).payload,'fixture');
  assert.ok(codec.decode(wording.join('')).plaintext.startsWith('b'));
});
test('public demo has external self-only assets and leaves encoded data out of presentation styling',()=>{
  const html=readFileSync(new URL('demo.html',import.meta.url),'utf8');
  assert.ok(html.includes('src="demo.js"'));assert.ok(html.includes('href="demo.css"'));
  assert.ok(!/<script(?![^>]*src=)[^>]*>/i.test(html));assert.ok(!html.includes('<style>'));
  assert.ok(html.includes('id="artwork" data-literal'));assert.ok(html.includes('id="recovered" data-literal'));
  assert.ok(html.includes('A new lantern poem carries the recovered'));assert.ok(!html.includes('src="http'));
});
