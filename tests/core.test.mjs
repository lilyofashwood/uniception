import test from 'node:test';import assert from 'node:assert/strict';
import {MODES,legacyEncode,legacyDecode,bytesEncode,bytesDecode,decodeRegions,wrapRegion,requiredLetters} from '../core.js';
const carrier='At the end of the corridor, Mara found a lamp burning in an empty office. The building had been closed for years, yet the bulb gave off a patient amber light. On the desk lay a maintenance ledger with one fresh line: Please return what the walls remembered. She read it twice before the radiator clicked behind her.';
test('preserved Corridor Lamp known vector',()=>{
  const actual=legacyEncode(carrier,'thedoorremembers');
  assert.equal(actual.encoded,'A𝗍 t𝗁𝖾 en𝖽 𝗈f the c𝗈𝗋𝗋idor, Mara found a lamp burning in an 𝖾𝗆pty offic𝖾. The building had been closed for years, yet the bulb gave off a patient a𝗆𝖻𝖾𝗋 light. On the de𝗌k lay a maintenance ledger with one fresh line: Please return what the walls remembered. She read it twice before the radiator clicked behind her.');
  assert.equal(actual.secret,'thedoorremembers');assert.equal(actual.carrier,carrier);
});
for(const mode of Object.keys(MODES))test(mode+' legacy alphabet and UTF-8 byte round trips',()=>{
  const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const record=legacyEncode(letters,letters,mode);assert.equal(legacyDecode(record.encoded,mode).secret,letters);
  const unicode='\uFEFF𝓛𝓲𝓵𝔂 🐈‍⬛ 🇯🇵 e\u0301\t\r\n\u0000  終';
  const prose=carrier.repeat(10)+'\n🕯️ e\u0301 🐈‍⬛';const encoded=bytesEncode(prose,unicode,mode);
  assert.equal(bytesDecode(encoded.encoded,mode).payload,unicode);assert.equal(encoded.carrier,prose);
  assert.equal(bytesDecode(bytesEncode(prose,'',mode).encoded,mode).payload,'');
});
test('position verifier rejects negative, duplicate, descending, noninteger and mismatched positions',()=>{
  for(const positions of [[-1],[0,0],[1,0],[0.5],[99],[false]])assert.throws(()=>legacyEncode('aa','a'.repeat(positions.length),'two_plains',positions));
  assert.throws(()=>legacyEncode('ba','a','two_plains',[0]));
  assert.deepEqual(legacyEncode('🕯️ e\u0301 a','ea').positions,[3,6]);
});
test('legacy losses are disclosed, unsupported payloads rejected',()=>{
  const r=legacyEncode('Apple Berry','a b');assert.equal(r.secret,'AB');assert.match(r.normalization,/whitespace removed/);
  for(const payload of ['é','e\u0301','!','🐈','\ud800'])assert.throws(()=>legacyEncode(carrier,payload));
  assert.throws(()=>bytesEncode(carrier,'\ud800'));assert.throws(()=>legacyEncode('𝖺 plain carrier','a'));
});
test('framed regions exclude surrounding styled README text',()=>{
  const a=legacyEncode('the lamp','lamp'),b=legacyEncode('the door','door','v1');
  const markdown='𝖬𝖺𝗍𝗁 heading [link](https://example.com) `code`\n'+wrapRegion(a.encoded)+'\nother 𝗌𝗍𝗒𝗅𝖾\n'+wrapRegion(b.encoded,'legacy','v1');
  assert.deepEqual(decodeRegions(markdown).map(x=>x.secret),['lamp','door']);
  assert.throws(()=>decodeRegions('<!-- stegweb:legacy:two_plains:start -->\na'));
  assert.throws(()=>wrapRegion('<!-- stegweb:nested -->'));
});
test('byte frame rejects wrong modes, truncation, corruption and extra channel data',()=>{
  const x=bytesEncode(carrier.repeat(4),'message');
  assert.throws(()=>bytesDecode(x.encoded,'v1'));
  assert.throws(()=>bytesDecode([...x.encoded].slice(0,80).join('')));
  const chars=[...x.encoded];let letter=0;
  for(let i=0;i<chars.length;i++)if(/[A-Za-z]/.test(chars[i])||/[\u{1d5a0}-\u{1d5d3}]/u.test(chars[i])){
    if(letter++===70){chars[i]=chars[i]==='a'?'𝖺':chars[i]==='𝖺'?'a':chars[i].codePointAt(0)>127?'a':'𝖺';break;}}
  assert.throws(()=>bytesDecode(chars.join('')));
  assert.throws(()=>bytesDecode(x.encoded+'𝖺'));
  assert.throws(()=>bytesEncode('small','message'));assert.equal(requiredLetters(''),96);
});
