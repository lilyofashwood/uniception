// Source-backed literary specimen, supplied September 11, 2026.
// The source footer credits Lily of Ashwood / "woven by the nekomata" (2026).
// Preserves the original poem and the three selected-letter font channels.
import {legacyEncode, legacyDecode} from '../../core.js';

export const SOURCE_SHA256='5bc1b3ceca3d2f09be8b39f667e50df324c2ba56c49b8e5c886c93cc629ea0d0';
export const LINES=Object.freeze([
  'something flickers at the window',
  'a second shape curls beneath the glass',
  'time pulls the world sideways',
  'and she has lived here longer',
  'than the room remembers her name',
  'patience builds a web from silence',
  'thread by thread the pattern holds',
  'even when no one is reading',
]);
export const CARRIER=LINES.join('\n');
export const EXPECTED_PAYLOAD='iwasalwayshere';
const LINE_POSITIONS=[[6,26],[0,2,11,18],[15,26,27,28],[5,6,20,21],[],[],[],[]];
let offset=0;
export const POSITIONS=Object.freeze(LINES.flatMap((line,i)=>{
  const positions=LINE_POSITIONS[i].map(p=>offset+p);
  offset+=[...line].length+1;
  return positions;
}));

// Literal encoded lines from the supplied artifact, not newly decorated prose.
export const SOURCE_WIRES=Object.freeze({
  v1:[
    '𝐬𝐨𝐦𝐞𝐭𝐡𝗶𝐧𝐠 𝐟𝐥𝐢𝐜𝐤𝐞𝐫𝐬 𝐚𝐭 𝐭𝐡𝐞 𝘄𝐢𝐧𝐝𝐨𝐰',
    '𝗮 𝘀𝐞𝐜𝐨𝐧𝐝 𝐬𝐡𝗮𝐩𝐞 𝐜𝐮𝐫𝗹𝐬 𝐛𝐞𝐧𝐞𝐚𝐭𝐡 𝐭𝐡𝐞 𝐠𝐥𝐚𝐬𝐬',
    '𝐭𝐢𝐦𝐞 𝐩𝐮𝐥𝐥𝐬 𝐭𝐡𝐞 𝘄𝐨𝐫𝐥𝐝 𝐬𝐢𝐝𝐞𝐰𝗮𝘆𝘀',
    '𝐚𝐧𝐝 𝐬𝗵𝗲 𝐡𝐚𝐬 𝐥𝐢𝐯𝐞𝐝 𝐡𝐞𝗿𝗲 𝐥𝐨𝐧𝐠𝐞𝐫',
    '𝐭𝐡𝐚𝐧 𝐭𝐡𝐞 𝐫𝐨𝐨𝐦 𝐫𝐞𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐡𝐞𝐫 𝐧𝐚𝐦𝐞',
    '𝐩𝐚𝐭𝐢𝐞𝐧𝐜𝐞 𝐛𝐮𝐢𝐥𝐝𝐬 𝐚 𝐰𝐞𝐛 𝐟𝐫𝐨𝐦 𝐬𝐢𝐥𝐞𝐧𝐜𝐞',
    '𝐭𝐡𝐫𝐞𝐚𝐝 𝐛𝐲 𝐭𝐡𝐫𝐞𝐚𝐝 𝐭𝐡𝐞 𝐩𝐚𝐭𝐭𝐞𝐫𝐧 𝐡𝐨𝐥𝐝𝐬',
    '𝐞𝐯𝐞𝐧 𝐰𝐡𝐞𝐧 𝐧𝐨 𝐨𝐧𝐞 𝐢𝐬 𝐫𝐞𝐚𝐝𝐢𝐧𝐠',
  ].join('\n'),
  chaos_noodle:[
    's𝗼m𝗲th𝐢ng fl𝗶ck𝗲rs 𝗮t th𝗲 𝗐𝗶nd𝗼w',
    '𝐚 𝗌𝗲c𝗼nd sh𝐚p𝗲 c𝘂r𝗅s b𝗲n𝗲𝗮th th𝗲 gl𝗮ss',
    't𝗶m𝗲 p𝘂lls th𝗲 𝗐𝗼rld s𝗶d𝗲w𝐚𝗒𝗌',
    '𝗮nd s𝗁𝐞 h𝗮s l𝗶v𝗲d h𝗲𝗋𝐞 l𝗼ng𝗲r',
    'th𝗮n th𝗲 r𝗼𝗼m r𝗲m𝗲mb𝗲rs h𝗲r n𝗮m𝗲',
    'p𝗮t𝗶𝗲nc𝗲 b𝘂𝗶lds 𝗮 w𝗲b fr𝗼m s𝗶l𝗲nc𝗲',
    'thr𝗲𝗮d by thr𝗲𝗮d th𝗲 p𝗮tt𝗲rn h𝗼lds',
    '𝗲v𝗲n wh𝗲n n𝗼 𝗼n𝗲 𝗶s r𝗲𝗮d𝗶ng',
  ].join('\n'),
  aesthetic:[
    'someth𝗶ng flickers at the 𝘄indow',
    '𝗮 𝘀econd sh𝗮pe cur𝗹s beneath the glass',
    'time pulls the 𝘄orld sidew𝗮𝘆𝘀',
    'and s𝗵𝗲 has lived he𝗿𝗲 longer',
    'than the room remembers her name',
    'patience builds a web from silence',
    'thread by thread the pattern holds',
    'even when no one is reading',
  ].join('\n'),
});
export const MODES=Object.freeze(['v1','chaos_noodle','aesthetic']);

export function inspect(encoded,mode){
  if(!MODES.includes(mode))throw new Error('Choose a supplied specimen mode.');
  const receipt=legacyDecode(encoded,mode);
  return {...receipt,sourceExact:encoded===SOURCE_WIRES[mode],
    carrierExact:receipt.carrier===CARRIER,payloadExact:receipt.secret===EXPECTED_PAYLOAD};
}
export function weave(mode){
  if(!MODES.includes(mode))throw new Error('Choose a supplied specimen mode.');
  const encoded=legacyEncode(CARRIER,EXPECTED_PAYLOAD,mode,[...POSITIONS]).encoded;
  if(encoded!==SOURCE_WIRES[mode])throw new Error('Current encoder differs from supplied source glyphs.');
  return {encoded,...inspect(encoded,mode)};
}
