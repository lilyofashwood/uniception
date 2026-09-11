// Lily of Ashwood's StegWeb modes; strict validation and byte framing added 2026-09-10.
export const MODES = Object.freeze({
  v1: ['math_bold', 'ss_bold'], chaos_noodle: null,
  two_plains: ['ascii', 'ss_reg'], debug_italic: ['ss_italic', 'ss_bitalic'],
  debug_plain: ['ss_reg', 'ss_bold'], aesthetic: ['ascii', 'ss_bold'],
});
export const FONTS = Object.freeze({ascii: [65,97], math_bold: [0x1d400,0x1d41a],
  ss_reg:[0x1d5a0,0x1d5ba], ss_bold:[0x1d5d4,0x1d5ee],
  ss_italic:[0x1d608,0x1d622], ss_bitalic:[0x1d63c,0x1d656]});
const ascii = c => /^[A-Za-z]$/.test(c);
const vowel = c => /^[aeiou]$/i.test(c);
function checkedText(s) {
  if (typeof s !== 'string') throw new Error('Text must be a string.');
  for (const c of s) if (c.length === 1 && c.charCodeAt(0) >= 0xd800 && c.charCodeAt(0) <= 0xdfff)
    throw new Error('Unpaired UTF-16 surrogate rejected.');
  return s;
}
function modeCheck(mode) { if (!Object.hasOwn(MODES, mode)) throw new Error('Unknown StegWeb mode.'); }
function fromFont(c, font) {
  const cp = c.codePointAt(0), [u,l] = FONTS[font];
  if (cp >= u && cp < u+26) return String.fromCharCode(65+cp-u);
  if (cp >= l && cp < l+26) return String.fromCharCode(97+cp-l);
  return null;
}
function toFont(c, font) {
  if (!ascii(c)) return c;
  const upper = c <= 'Z';
  return String.fromCodePoint(FONTS[font][upper ? 0 : 1]+c.charCodeAt(0)-(upper ? 65 : 97));
}
function fontFor(c, bit, mode) {
  if (mode === 'chaos_noodle') return bit ? (vowel(c) ? 'math_bold' : 'ss_reg') : (vowel(c) ? 'ss_bold' : 'ascii');
  return MODES[mode][bit];
}
export function validateCarrier(carrier) {
  checkedText(carrier);
  for (const c of carrier) for (const f of Object.keys(FONTS).filter(f=>f!=='ascii'))
    if (fromFont(c,f) !== null) throw new Error('Carrier already contains a StegWeb font. Choose a separate plain prose region to avoid channel collisions.');
  return [...carrier];
}
export function normalizeLegacy(payload) {
  checkedText(payload);
  const s = payload.replace(/\s/gu,'');
  if (!/^[A-Za-z]*$/.test(s)) throw new Error('Legacy payload accepts ASCII letters and whitespace only. Use bytes-v2 for exact Unicode.');
  return s;
}
export function findPositions(carrier, payload) {
  const chars=validateCarrier(carrier), wanted=normalizeLegacy(payload), positions=[];
  let next=0;
  for (const target of wanted) {
    const index=chars.findIndex((c,i)=>i>=next && c.toLowerCase()===target.toLowerCase());
    if (index<0) throw new Error(`Carrier cannot host the next payload letter ${JSON.stringify(target)} after code-point index ${next-1}.`);
    positions.push(index); next=index+1;
  }
  return positions;
}
export function legacyEncode(carrier, payload, mode='two_plains', suppliedPositions=null) {
  modeCheck(mode); const chars=validateCarrier(carrier), wanted=normalizeLegacy(payload);
  const positions=suppliedPositions ?? findPositions(carrier,payload);
  if (!Array.isArray(positions) || positions.length!==wanted.length) throw new Error('Position count must equal normalized payload length.');
  positions.forEach((p,i)=>{
    if (!Number.isSafeInteger(p) || p<0 || p>=chars.length || (i && p<=positions[i-1])) throw new Error('Positions must be unique, increasing, in-range code-point indexes.');
    if (!ascii(chars[p]) || chars[p].toLowerCase()!==wanted[i].toLowerCase()) throw new Error('Selected carrier letter does not match payload.');
  });
  const selected=new Set(positions), encoded=chars.map((c,i)=>toFont(c,fontFor(c,selected.has(i)?1:0,mode))).join('');
  const receipt=legacyDecode(encoded,mode);
  if (receipt.carrier!==carrier || receipt.secret.toLowerCase()!==wanted.toLowerCase()) throw new Error('Round-trip verification failed.');
  return {format:'legacy',mode,encoded,positions,...receipt,requestedPayload:payload,normalization:'Payload whitespace removed; carrier letter case retained.'};
}
function readSymbols(encoded,mode) {
  checkedText(encoded); modeCheck(mode); const carrier=[], bits=[], selected=[], positions=[];
  for (const c of encoded) {
    let match=null;
    for (const f of Object.keys(FONTS)) {
      const letter=fromFont(c,f); if(letter===null)continue;
      for(let bit=0;bit<2;bit++) if(fontFor(letter,bit,mode)===f) match={letter,bit};
    }
    if(match) {
      if(match.bit) {selected.push(match.letter);positions.push(carrier.length);}
      carrier.push(match.letter);bits.push(match.bit);
    } else {
      if(Object.keys(FONTS).some(f=>f!=='ascii'&&fromFont(c,f)!==null) || (ascii(c)&&mode!=='two_plains'&&mode!=='aesthetic'&&mode!=='chaos_noodle'))
        throw new Error('Unexpected font or letter routing for selected mode.');
      // In Chaos Noodle, an ASCII vowel is never a valid lane symbol.
      if(mode==='chaos_noodle'&&vowel(c)) throw new Error('Invalid Chaos Noodle vowel routing.');
      carrier.push(c);
    }
  }
  return {carrier:carrier.join(''),secret:selected.join(''),positions,bits};
}
export function legacyDecode(encoded,mode='two_plains') {
  const {bits,...r}=readSymbols(encoded,mode); return {...r,status:'extracted',meaning:'Literal selected letters; no checksum in the legacy format.'};
}
export function crc32(bytes) {
  let crc=0xffffffff;
  for(const b of bytes){crc^=b;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  return (crc^0xffffffff)>>>0;
}
function makeFrame(payload) {
  const bytes=new TextEncoder().encode(checkedText(payload));
  if(bytes.length>1048576)throw new Error('Payload exceeds the 1 MiB limit.');
  const frame=new Uint8Array(12+bytes.length), view=new DataView(frame.buffer);
  frame.set([83,87,66,50]);view.setUint32(4,bytes.length);frame.set(bytes,8);
  view.setUint32(8+bytes.length,crc32(frame.subarray(0,8+bytes.length)));return frame;
}
export function requiredLetters(payload) {return makeFrame(payload).length*8;}
export function bytesEncode(carrier,payload,mode='two_plains') {
  modeCheck(mode);const chars=validateCarrier(carrier),frame=makeFrame(payload),bits=[];
  for(const b of frame)for(let i=7;i>=0;i--)bits.push((b>>>i)&1);
  const capacity=chars.filter(ascii).length;
  if(capacity<bits.length)throw new Error(`Need ${bits.length} ASCII carrier letters; found ${capacity}.`);
  let index=0;const encoded=chars.map(c=>ascii(c)?toFont(c,fontFor(c,bits[index++]??0,mode)):c).join('');
  const decoded=bytesDecode(encoded,mode);
  if(decoded.payload!==payload||decoded.carrier!==carrier)throw new Error('Byte-frame round trip failed.');
  return {format:'bytes-v2',mode,encoded,...decoded,capacity,usedLetters:bits.length};
}
export function bytesDecode(encoded,mode='two_plains') {
  const {bits,carrier}=readSymbols(encoded,mode);
  if(bits.length<96)throw new Error('Truncated SWB2 frame.');
  const bytes=new Uint8Array(Math.floor(bits.length/8));
  bits.forEach((b,i)=>{if(i<bytes.length*8)bytes[i>>>3]|=b<<(7-(i%8));});
  if(bytes[0]!==83||bytes[1]!==87||bytes[2]!==66||bytes[3]!==50)throw new Error('SWB2 signature absent; choose the correct mode and format.');
  const view=new DataView(bytes.buffer),length=view.getUint32(4),end=8+length;
  if(length>1048576||end+4>bytes.length)throw new Error('Invalid or truncated SWB2 length.');
  if(crc32(bytes.subarray(0,end))!==view.getUint32(end))throw new Error('SWB2 checksum mismatch.');
  if(bits.slice((end+4)*8).some(Boolean))throw new Error('Nonzero trailing channel data.');
  const payload=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes.subarray(8,end));
  return {carrier,payload,status:'verified',meaning:'Exact UTF-8 payload verified by length and CRC32; checksum is not authentication.'};
}
export function wrapRegion(encoded,format='legacy',mode='two_plains') {
  modeCheck(mode);if(!['legacy','bytes-v2'].includes(format))throw new Error('Unknown format.');
  if(encoded.includes('<!-- stegweb:'))throw new Error('Nested StegWeb region rejected.');
  return `<!-- stegweb:${format}:${mode}:start -->\n${encoded}\n<!-- stegweb:end -->`;
}
export function decodeRegions(markdown) {
  checkedText(markdown); const start=/<!-- stegweb:(legacy|bytes-v2):([a-z0-9_]+):start -->\n/g;
  const regions=[];let match,consumed=0,residue='';
  while((match=start.exec(markdown))) {
    residue+=markdown.slice(consumed,match.index);
    const end=markdown.indexOf('\n<!-- stegweb:end -->',start.lastIndex);
    if(end<0)throw new Error('Unclosed StegWeb region.');
    const body=markdown.slice(start.lastIndex,end);
    if(body.includes('<!-- stegweb:'))throw new Error('Nested region rejected.');
    regions.push({format:match[1],mode:match[2],...(match[1]==='legacy'?legacyDecode(body,match[2]):bytesDecode(body,match[2]))});
    start.lastIndex=end+'\n<!-- stegweb:end -->'.length;
    consumed=start.lastIndex;
  }
  residue+=markdown.slice(consumed);
  if(residue.includes('<!-- stegweb:'))throw new Error('Malformed or unmatched StegWeb region marker.');
  if(!regions.length)throw new Error('No explicitly framed StegWeb region found.');
  return regions;
}
