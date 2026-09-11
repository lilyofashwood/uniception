import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {decodeRegions,legacyEncode,legacyDecode,wrapRegion} from '../core.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
test('Uniception presentation uses the exact established house glyph map', () => {
  const title = [...'uniception'].map(c => String.fromCodePoint(('aeiou'.includes(c) ? 0x1d41a : 0x1d5ba) + c.charCodeAt(0) - 97)).join('');
  const html = read('../index.html'), readme = read('../README.md');
  assert.ok(html.includes('<title>Uniception · the corridor lamp</title>'));
  assert.ok(html.includes(title));
  assert.ok(readme.startsWith('# ' + title + '\n'));
  assert.equal(JSON.parse(read('../package.json')).name, 'uniception');
  assert.ok(read('../app.js').includes("a.download='uniception-passage.md'"));
  assert.ok(!html.includes('𝔰𝔱𝔢𝔤.𝔴𝔢𝔟'));
});
test('rename preserves existing Markdown markers, README channel and carrier diacritics', () => {
  assert.equal(decodeRegions(read('../README.md'))[0].secret, 'followthelamp');
  const carrier = 'e\u0301 leaf 🕷️ 🕸️\n a\u0323 word';
  const packet = legacyEncode(carrier, 'leaf');
  const framed = wrapRegion(packet.encoded);
  assert.ok(framed.startsWith('<!-- stegweb:legacy:two_plains:start -->'));
  assert.equal(legacyDecode(packet.encoded).carrier, carrier);
  assert.equal(decodeRegions(framed)[0].secret, 'leaf');
});
