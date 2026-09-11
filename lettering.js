/* Vendored Font Garden catalog and synthetic recipes for offline interface lettering.
 * Source: lilyofashwood/font-garden, reviewed 2026-09-10. Original labels and
 * distinctions between recovered maps and new recipe interpretations are retained.
 * These are ornamental UI mappings, not additional hidden-message channels.
 */
/* font-garden.js SHA-256 49d1d5f33101ecff284af04a6abc9fb63377c419f6140fc5c4f256471089d8be */
/* Pure catalog extracted from the recovered Veil-Script Font Garden 0.2.1; original authorship retained. */
(function(root){
"use strict";
const clone=obj=>JSON.parse(JSON.stringify(obj));
const ABC="abcdefghijklmnopqrstuvwxyz", ABCU=ABC.toUpperCase();
const LETTER_RE=/\p{L}/u, MARK_RE=/\p{M}/u;
const cpRange=(start,n=26)=>Array.from({length:n},(_,i)=>String.fromCodePoint(start+i));
const graphemes=text=>{
  if(typeof Intl!=="undefined"&&Intl.Segmenter){
    const seg=new Intl.Segmenter(undefined,{granularity:"grapheme"});
    return Array.from(seg.segment(text),x=>x.segment);
  }
  return Array.from(text);
};
const isAsciiLetter=c=>/^[A-Za-z]$/.test(c);
const isCarrier=c=>LETTER_RE.test(c)||/\p{N}/u.test(c);

function makeMap(lower,upper){
  const l=Array.from(lower),u=Array.from(upper||lower.toUpperCase()),m={};
  l.forEach((c,i)=>{if(i<26)m[ABC[i]]=c});
  u.forEach((c,i)=>{if(i<26)m[ABCU[i]]=c});
  return m;
}
function makeSingleCaseMap(chars){
  const a=Array.from(chars),m={};
  a.forEach((c,i)=>{if(i<26){m[ABC[i]]=c;m[ABCU[i]]=c}});
  return m;
}
function makeSparseMap(lower,upper){
  const m={};
  Array.from(ABC).forEach(c=>m[c]=lower[c]||c);
  Array.from(ABCU).forEach(c=>m[c]=upper[c]||lower[c.toLowerCase()]||c);
  return m;
}
const mapText=(text,map)=>Array.from(text).map(c=>map[c]??c).join("");

const maps={};
maps.mathBold=makeMap(cpRange(0x1D41A),cpRange(0x1D400));
maps.sansReg=makeMap(cpRange(0x1D5BA),cpRange(0x1D5A0));
maps.sansBold=makeMap(cpRange(0x1D5EE),cpRange(0x1D5D4));
maps.sansItalic=makeMap(cpRange(0x1D622),cpRange(0x1D608));
maps.sansBoldItalic=makeMap(cpRange(0x1D656),cpRange(0x1D63C));
maps.mono=makeMap(cpRange(0x1D68A),cpRange(0x1D670));
maps.boldFraktur=makeMap(cpRange(0x1D586),cpRange(0x1D56C));
maps.boldScript=makeMap(cpRange(0x1D4EA),cpRange(0x1D4D0));
maps.fraktur=makeMap(
  "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷",
  "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ"
);
maps.script=makeMap(
  "𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏",
  "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵"
);
maps.double=makeMap(
  "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫",
  "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ"
);
maps.circled=makeMap(cpRange(0x24D0),cpRange(0x24B6));
maps.squared=makeSingleCaseMap(cpRange(0x1F130));
maps.negativeCircled=makeSingleCaseMap(cpRange(0x1F150));
maps.negativeSquared=makeSingleCaseMap(cpRange(0x1F170));
maps.flags={};ABCU.split("").forEach((c,i)=>{const v=String.fromCodePoint(0x1F1E6+i);maps.flags[c]=v;maps.flags[c.toLowerCase()]=v});
maps.small=makeSingleCaseMap("ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ");
maps.super=makeSparseMap(
  {a:"ᵃ",b:"ᵇ",c:"ᶜ",d:"ᵈ",e:"ᵉ",f:"ᶠ",g:"ᵍ",h:"ʰ",i:"ⁱ",j:"ʲ",k:"ᵏ",l:"ˡ",m:"ᵐ",n:"ⁿ",o:"ᵒ",p:"ᵖ",q:"𐞥",r:"ʳ",s:"ˢ",t:"ᵗ",u:"ᵘ",v:"ᵛ",w:"ʷ",x:"ˣ",y:"ʸ",z:"ᶻ"},
  {A:"ᴬ",B:"ᴮ",C:"ꟲ",D:"ᴰ",E:"ᴱ",F:"ꟳ",G:"ᴳ",H:"ᴴ",I:"ᴵ",J:"ᴶ",K:"ᴷ",L:"ᴸ",M:"ᴹ",N:"ᴺ",O:"ᴼ",P:"ᴾ",Q:"𐞥",R:"ᴿ",S:"ˢ",T:"ᵀ",U:"ᵁ",V:"ⱽ",W:"ᵂ",X:"ˣ",Y:"ʸ",Z:"ᶻ"}
);
maps.sub=makeSparseMap(
  {a:"ₐ",b:"ᵦ",c:"c",d:"d",e:"ₑ",f:"f",g:"g",h:"ₕ",i:"ᵢ",j:"ⱼ",k:"ₖ",l:"ₗ",m:"ₘ",n:"ₙ",o:"ₒ",p:"ₚ",q:"q",r:"ᵣ",s:"ₛ",t:"ₜ",u:"ᵤ",v:"ᵥ",w:"w",x:"ₓ",y:"ᵧ",z:"z"},
  {}
);
const customSets={
  moonvine:"ꪖ᥇ᥴᦔꫀᠻᧁꫝ꠸᧒ᛕꪶꪑꪀꪮρᑫ᥅ᦓꪻꪊꪜ᭙᥊ꪗƺ",
  runeslab:"ꍏꌃꉓꀸꍟꎇꁅꃅꀤꀭꀘ꒒ꂵꈤꂦꉣꆰꋪꌗ꓄ꀎꃴꅏꊼꌩꁴ",
  greektech:"ΛBᄃDΣFGΉIJKᄂMПӨPQЯƧƬЦVЩXУZ",
  blackedge:"₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ",
  fauxjp:"卂乃匚ᗪ乇千Ꮆ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙",
  runicleaf:"ᎪᏴᏟᎠᎬᎰᏩᎻᏆᎫᏦᏞᎷᏁᎾᏢϘᏒᏚᎢᏬᏙᏔጀᎩᏃ",
  fauxcyr:"αɓƈԃҽϝɠԋιʝƙʅɱɳσρϙɾʂƚυʋɯxყȥ",
  thai:"ค๒ς๔єŦﻮђเןкɭ๓ภ๏קợгรՇยשฬאץչ",
  canada:"ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ"
};
Object.entries(customSets).forEach(([k,v])=>maps[k]=makeSingleCaseMap(v));

const upsideMap={a:"ɐ",b:"q",c:"ɔ",d:"p",e:"ǝ",f:"ɟ",g:"ƃ",h:"ɥ",i:"ᴉ",j:"ɾ",k:"ʞ",l:"l",m:"ɯ",n:"u",o:"o",p:"d",q:"b",r:"ɹ",s:"s",t:"ʇ",u:"n",v:"ʌ",w:"ʍ",x:"x",y:"ʎ",z:"z",A:"∀",B:"𐐒",C:"Ɔ",D:"◖",E:"Ǝ",F:"Ⅎ",G:"פ",H:"H",I:"I",J:"ſ",K:"⋊",L:"˥",M:"W",N:"N",O:"O",P:"Ԁ",Q:"Ό",R:"ᴚ",S:"S",T:"⊥",U:"∩",V:"Λ",W:"M",X:"X",Y:"⅄",Z:"Z","?":"¿","!":"¡","(":")",")":"(","[":"]","]":"[","{":"}","}":"{"};
const mirrorMap={a:"ɒ",b:"d",c:"ɔ",d:"b",e:"ɘ",f:"ʇ",g:"ǫ",h:"ʜ",i:"i",j:"ꞁ",k:"ʞ",l:"|",m:"m",n:"ᴎ",o:"o",p:"q",q:"p",r:"ɿ",s:"ꙅ",t:"ƚ",u:"u",v:"v",w:"w",x:"x",y:"ʏ",z:"z"};
function invertMap(map){const r={};Object.entries(map).forEach(([k,v])=>{if(!(v in r))r[v]=k});return r}
const upsideInverse=invertMap(upsideMap),mirrorInverse=invertMap(mirrorMap);

function fullwidth(t){return Array.from(t).map(c=>c===" "?"　":(c.codePointAt(0)>=33&&c.codePointAt(0)<=126?String.fromCodePoint(c.codePointAt(0)+0xFEE0):c)).join("")}
// Current catalog repair: orient whole clusters, never reverse their marks/ZWJ components.
function reverseTransform(t,map){
  if(typeof Intl==="undefined"||!Intl.Segmenter)return t;
  return graphemes(t).reverse().map(cluster=>{
    const [base,...tail]=Array.from(cluster);
    return (map[base]??map[base.toLowerCase()]??base)+tail.join("");
  }).join("");
}
function everyChar(t,wrap){return graphemes(t).map(c=>/^\s+$/.test(c)?c:wrap(c)).join("")}
function stripCombining(t){return t.normalize("NFD").replace(/\p{M}+/gu,"").normalize("NFC")}
function addCombining(t,marks){return Array.from(t).map(c=>isCarrier(c)?c+marks:c).join("")}
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0}
function seededChoice(seed,i,n){if(n<=1)return 0;let x=hash(seed+":"+i);x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n}

const core={
  plain:t=>t,fraktur:t=>mapText(t,maps.fraktur),boldFraktur:t=>mapText(t,maps.boldFraktur),boldScript:t=>mapText(t,maps.boldScript),
  script:t=>mapText(t,maps.script),double:t=>mapText(t,maps.double),mono:t=>mapText(t,maps.mono),sansReg:t=>mapText(t,maps.sansReg),
  sansBold:t=>mapText(t,maps.sansBold),sansItalic:t=>mapText(t,maps.sansItalic),sansBoldItalic:t=>mapText(t,maps.sansBoldItalic),mathBold:t=>mapText(t,maps.mathBold),
  fullwidth,small:t=>mapText(t,maps.small),circled:t=>mapText(t,maps.circled),squared:t=>mapText(t,maps.squared),negativeCircled:t=>mapText(t,maps.negativeCircled),
  negativeSquared:t=>mapText(t,maps.negativeSquared),flags:t=>mapText(t,maps.flags),super:t=>mapText(t,maps.super),sub:t=>mapText(t,maps.sub),
  moonvine:t=>mapText(t,maps.moonvine),runeslab:t=>mapText(t,maps.runeslab),greektech:t=>mapText(t,maps.greektech),blackedge:t=>mapText(t,maps.blackedge),
  fauxjp:t=>mapText(t,maps.fauxjp),runicleaf:t=>mapText(t,maps.runicleaf),fauxcyr:t=>mapText(t,maps.fauxcyr),thai:t=>mapText(t,maps.thai),canada:t=>mapText(t,maps.canada),
  upside:t=>reverseTransform(t,upsideMap),mirror:t=>reverseTransform(t,mirrorMap)
};

const wingSymbols=["✌︎","♌︎","♍︎","♎︎","♏︎","♐︎","♑︎","♒︎","♓︎","🙰","🙵","●︎","❍︎","■︎","□︎","◻︎","❒︎","⬧︎","⧫︎","◆︎","❖︎","⬥︎","⌧︎","⍓︎","⌘︎","☾︎"];
const wingMap={};ABC.split("").forEach((c,i)=>{wingMap[c]=wingSymbols[i];wingMap[c.toUpperCase()]=wingSymbols[i]});
function wingdings(t){return mapText(t,wingMap)}
const emojiInfix=["🌸","♡","🍪","💞","❀","💍","🫧","🖤"];
function ribbon(t){let n=0;return "🎀  "+graphemes(core.script(t)).map(c=>isCarrier(c)&&++n%5===0?c+emojiInfix[n%emojiInfix.length]:c).join("")+"  🎀"}
function hybrid(t,seed="ransom"){const ids=["boldFraktur","boldScript","double","fullwidth","circled","small","greektech","fauxjp"];return Array.from(t).map((c,i)=>isAsciiLetter(c)?core[ids[seededChoice(seed,i,ids.length)]](c):c).join("")}
function musicBox(t){return "¸¸♬·¯·♩¸¸♪·¯·♫¸¸ "+hybrid(t,"music-box")+" ¸¸♫·¯·♪¸¸♩·¯·♬¸¸"}

const zalgoPools={
  up:["̍","̎","̄","̅","̿","̑","̆","̐","͒","͗","͑","̇","̈","̊","͂","̓","̈́","͊","͋","͌","̃","̂","̌","͐","̀","́","̋","̏","̒","̓","̔","̽","̉","ͣ","ͤ","ͥ","ͦ","ͧ","ͨ","ͩ","ͪ","ͫ","ͬ","ͭ","ͮ","ͯ","̾","͛","͆","̚"],
  mid:["̕","̛","̀","́","͘","̡","̢","̧","̨","̴","̵","̶","͏","͜","͝","͞","͟","͠","͢","̸","̷","͡","҉"],
  down:["̖","̗","̘","̙","̜","̝","̞","̟","̠","̤","̥","̦","̩","̪","̫","̬","̭","̮","̯","̰","̱","̲","̳","̹","̺","̻","̼","ͅ","͇","͈","͉","͍","͎","͓","͔","͕","͖","͙","͚","̣"]
};
function zalgo(t,{intensity=3,seed="veil",up=true,mid=true,down=true}={}){
  const active=[];if(up)active.push(zalgoPools.up);if(mid)active.push(zalgoPools.mid);if(down)active.push(zalgoPools.down);if(!active.length)return t;
  return Array.from(t).map((c,i)=>{if(!isCarrier(c))return c;let out=c;for(let j=0;j<Math.max(1,intensity);j++){const pool=active[(i+j)%active.length];out+=pool[seededChoice(seed+i,j,pool.length)]}return out}).join("")
}

const DEFAULT_HOUSE={name:"Amethyst Mycelium",ids:["boldFraktur","mono","script","double","sansReg"],rule:"seeded",seed:"amethyst-mycelium"};
let houseConfig=clone(DEFAULT_HOUSE);
let styleById=new Map();
function normalizeHouseConfig(candidate){
  const c=candidate&&typeof candidate==="object"?candidate:{};
  const valid=new Set(styles.filter(s=>s.mixable).map(s=>s.id));
  const ids=Array.isArray(c.ids)?c.ids.filter(id=>valid.has(id)&&id!=="house").slice(0,6):[];
  return {name:String(c.name||DEFAULT_HOUSE.name).slice(0,80),ids:ids.length?ids:[...DEFAULT_HOUSE.ids].slice(0,6),rule:["letters","words","vowels","initials","seeded","wordSeeded"].includes(c.rule)?c.rule:DEFAULT_HOUSE.rule,seed:String(c.seed||DEFAULT_HOUSE.seed).slice(0,120)};
}
function routeMix(text,config){
  const ids=(config.ids||[]).filter(id=>styleById.get(id)?.mixable);if(!ids.length)return text;
  const chars=Array.from(text);let letterIndex=0,wordIndex=-1,inWord=false;
  return chars.map((c,i)=>{
    if(!isAsciiLetter(c)){if(/\s/.test(c))inWord=false;return c}
    const wordStart=!inWord;if(wordStart){wordIndex++;inWord=true}
    let idx=0;
    switch(config.rule){
      case "letters":idx=letterIndex%ids.length;break;
      case "words":idx=wordIndex%ids.length;break;
      case "vowels":idx=/[aeiou]/i.test(c)?0:Math.min(1,ids.length-1);break;
      case "initials":idx=wordStart?0:Math.min(1,ids.length-1);break;
      case "wordSeeded":idx=seededChoice(config.seed,wordIndex,ids.length);break;
      default:idx=seededChoice(config.seed,letterIndex,ids.length);
    }
    letterIndex++;
    return styleById.get(ids[idx]).fn(c);
  }).join("")
}
function houseMix(t){return routeMix(t,houseConfig)}

const styles=[
 {id:"plain",name:"Plain Text",family:"plain",role:"unmodified carrier",fav:true,mixable:true,baseable:true,fn:core.plain},
 {id:"house",name:"✧ Veil-Script: House Register",family:"house mix",role:"living mixed register",fav:true,mixable:false,baseable:true,fn:houseMix},
 {id:"fraktur",name:"Archivefang Fraktur",family:"mathematical",role:"archive / old-machine",fav:true,mixable:true,baseable:true,fn:core.fraktur},
 {id:"boldFraktur",name:"Cathedralwolf Bold Fraktur",family:"mathematical",role:"decree / heavy daemon",fav:true,mixable:true,baseable:true,fn:core.boldFraktur},
 {id:"boldScript",name:"Lanternspell Bold Script",family:"mathematical",role:"ritual / ornate invitation",fav:true,mixable:true,baseable:true,fn:core.boldScript},
 {id:"script",name:"Lacepath Script",family:"mathematical",role:"dream-water / delicate register",fav:true,mixable:true,baseable:true,fn:core.script},
 {id:"double",name:"GlassTheorem Double-Struck",family:"mathematical",role:"concept / theorem / dream logic",fav:true,mixable:true,baseable:true,fn:core.double},
 {id:"mathBold",name:"Math Bold",family:"mathematical",role:"heavy clean emphasis",fav:true,mixable:true,baseable:true,fn:core.mathBold},
 {id:"sansReg",name:"Sans Regular",family:"mathematical",role:"quiet technical body",fav:true,mixable:true,baseable:true,fn:core.sansReg},
 {id:"sansBold",name:"Sans Bold",family:"mathematical",role:"clean system notice",fav:true,mixable:true,baseable:true,fn:core.sansBold},
 {id:"sansItalic",name:"Sans Italic",family:"mathematical",role:"slanted machine note",fav:false,mixable:true,baseable:true,fn:core.sansItalic},
 {id:"sansBoldItalic",name:"Sans Bold Italic",family:"mathematical",role:"fast signal / emphasis",fav:true,mixable:true,baseable:true,fn:core.sansBoldItalic},
 {id:"mono",name:"MonoTerminal",family:"mathematical",role:"machinery / commands",fav:true,mixable:true,baseable:true,fn:core.mono},
 {id:"fullwidth",name:"VaporDoor Fullwidth",family:"width",role:"dream menu / portal UI",fav:true,mixable:true,baseable:true,fn:core.fullwidth},
 {id:"small",name:"PocketPlaque Smallcaps",family:"small caps",role:"labels / system whispers",fav:true,mixable:true,baseable:true,fn:core.small},
 {id:"moonvine",name:"Moonvine",family:"decorative substitution",role:"soft alien handwriting",fav:true,mixable:true,baseable:true,fn:core.moonvine},
 {id:"runeslab",name:"Runeslab",family:"decorative substitution",role:"carved interface",fav:true,mixable:true,baseable:true,fn:core.runeslab},
 {id:"greektech",name:"GreekTech",family:"decorative substitution",role:"retro console",fav:true,mixable:true,baseable:true,fn:core.greektech},
 {id:"blackedge",name:"Blackletter Edge",family:"decorative substitution",role:"metal artifact label",fav:true,mixable:true,baseable:true,fn:core.blackedge},
 {id:"fauxjp",name:"Faux JP Square",family:"decorative substitution",role:"arcade block glyph",fav:true,mixable:true,baseable:true,fn:core.fauxjp},
 {id:"runicleaf",name:"Runic Leaf",family:"decorative substitution",role:"forest-map label",fav:true,mixable:true,baseable:true,fn:core.runicleaf},
 {id:"fauxcyr",name:"Faux Cyrillic",family:"decorative substitution",role:"soft cyberfolk",fav:true,mixable:true,baseable:true,fn:core.fauxcyr},
 {id:"thai",name:"Thai Ember",family:"decorative substitution",role:"internet-fantasy register",fav:true,mixable:true,baseable:true,fn:core.thai},
 {id:"canada",name:"Canada Leaf",family:"decorative substitution",role:"blocky poster mode",fav:true,mixable:true,baseable:true,fn:core.canada},
 {id:"circled",name:"BubbleToken Circled",family:"enclosed",role:"badge / collectible token",fav:true,mixable:true,baseable:true,fn:core.circled},
 {id:"squared",name:"Squared Letters",family:"enclosed",role:"quiet button-grid",fav:true,mixable:true,baseable:true,fn:core.squared},
 {id:"negativeCircled",name:"Negative Circled",family:"enclosed",role:"inked bubble-grid",fav:false,mixable:true,baseable:true,fn:core.negativeCircled},
 {id:"negativeSquared",name:"Negative Squared",family:"enclosed",role:"arcade modal",fav:true,mixable:true,baseable:true,fn:core.negativeSquared},
 {id:"flags",name:"Regional Signal Flags",family:"enclosed",role:"banner / signal",fav:false,mixable:true,baseable:true,fn:core.flags},
 {id:"super",name:"Superscript Whisper",family:"vertical register",role:"margin voice",fav:true,mixable:true,baseable:true,fn:core.super},
 {id:"sub",name:"Subscript Rootnote",family:"vertical register",role:"underlayer / basement voice",fav:true,mixable:true,baseable:true,fn:core.sub},
 {id:"upside",name:"Upside Down",family:"orientation",role:"mirror-world state",fav:true,mixable:false,baseable:false,fn:core.upside},
 {id:"mirror",name:"Mirror Room",family:"orientation",role:"reflection / backwards archive",fav:true,mixable:false,baseable:false,fn:core.mirror},
 {id:"brackets",name:"Bracket Tiles",family:"wrapper",role:"inventory tokens",fav:true,mixable:false,baseable:false,fn:t=>everyChar(t,c=>"【"+c+"】")},
 {id:"quotes",name:"Quote Tiles",family:"wrapper",role:"ritual token tiles",fav:true,mixable:false,baseable:false,fn:t=>everyChar(t,c=>"『"+c+"』")},
 {id:"wave",name:"Wave Stitch",family:"wrapper",role:"waterline / signal shimmer",fav:true,mixable:false,baseable:false,fn:t=>everyChar(t,c=>"≋"+c+"≋")},
 {id:"shade",name:"Shade Blocks",family:"wrapper",role:"pixel fog / retro sample",fav:true,mixable:false,baseable:false,fn:t=>everyChar(t,c=>"░"+c+"░")},
 {id:"screen",name:"Screen Veil",family:"wrapper",role:"sealed specimen",fav:true,mixable:false,baseable:false,fn:t=>"【﻿"+fullwidth(t)+"】"},
 {id:"underbar",name:"Underbar Blocks",family:"wrapper",role:"old-forum electric panel",fav:true,mixable:false,baseable:false,fn:t=>everyChar(t,c=>"[̲̅"+c+"]")},
 {id:"starfield",name:"Starfield Overlay",family:"combining mark",role:"haunted ink / veil shimmer",fav:true,mixable:false,baseable:false,fn:t=>addCombining(t,"҉")},
 {id:"strike",name:"Strikethrough",family:"combining mark",role:"crossed current",fav:true,mixable:false,baseable:false,fn:t=>addCombining(t,"̶")},
 {id:"underline",name:"Underline Current",family:"combining mark",role:"floor-line signal",fav:false,mixable:false,baseable:false,fn:t=>addCombining(t,"̲")},
 {id:"dots",name:"Dotted Aura",family:"combining mark",role:"granular whisper",fav:true,mixable:false,baseable:false,fn:t=>addCombining(t,"͎")},
 {id:"tears",name:"Moon-Tear Surface",family:"combining mark",role:"rain under the letters",fav:true,mixable:false,baseable:false,fn:t=>addCombining(t,"̥̣")},
 {id:"zalgoMist",name:"Zalgo Mist",family:"combining mark",role:"controlled reality fracture",fav:true,mixable:false,baseable:false,fn:t=>zalgo(t,{intensity:2,seed:"mist"})},
 {id:"zalgoDeep",name:"Zalgo Deepstorm",family:"combining mark",role:"high-noise corruption",fav:false,mixable:false,baseable:false,fn:t=>zalgo(t,{intensity:7,seed:"deepstorm"})},
 {id:"wing",name:"Wingdings Oracle",family:"symbol cipher",role:"oracle / puzzle layer",fav:true,mixable:false,baseable:false,fn:wingdings},
 {id:"music",name:"Music Box Hybrid",family:"hybrid",role:"ornate generator output",fav:true,mixable:false,baseable:false,fn:musicBox},
 {id:"ribbon",name:"Ribbon Cake",family:"hybrid",role:"Tumblr cake / sticker mode",fav:true,mixable:false,baseable:false,fn:ribbon},
 {id:"ransom",name:"Ransom Circus",family:"hybrid",role:"generator-goblin showcase",fav:true,mixable:false,baseable:false,fn:t=>"💣☠  "+hybrid(t,"ransom-circus")+"  👻🐸"}
];
styleById=new Map(styles.map(s=>[s.id,s]));
styles.forEach(s=>s.defaultFav=s.fav);
const applyStyle=(id,text)=>{try{return (styleById.get(id)||styleById.get("plain")).fn(String(text??""))}catch{return String(text??"")}};


root.FontGarden={list:()=>styles.map(({fn,...meta})=>meta),apply:(id,text)=>{if(!styleById.has(id))throw new Error("Unknown style: "+id);return applyStyle(id,text);},mix:(text,config)=>routeMix(text,normalizeHouseConfig(config)),register:(entry)=>{if(styleById.has(entry.id))throw new Error("Duplicate style");styles.push(entry);styleById.set(entry.id,entry);},maps};
})(globalThis);

/* register-recipes.js SHA-256 14a96ac369a68caf9ff47fb4e5eec9ce045855f8df5f714d3635f860e7356a98 */
/* Executable interpretations of the recovered synthetic register descriptions.
 * New implementation dated 2026-09-10; examples in the archival JSON remain literal. */
(function(root){
  'use strict';
  const G=root.FontGarden;
  const range=n=>Array.from({length:26},(_,i)=>String.fromCodePoint(n+i));
  const latin='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const italic=range(0x1D434).concat(range(0x1D44E)); italic[33]='ℎ';
  const boldItalic=range(0x1D468).concat(range(0x1D482));
  for(const [id,name,alphabet] of [['italic','Italic',italic],['boldItalic','Bold Italic',boldItalic]]) {
    const table=new Map(Array.from(latin,(c,i)=>[c,alphabet[i]]));
    G.register({id,name,family:'mathematical',role:'exact Unicode letter mapping',mixable:true,baseable:true,
      fn:t=>Array.from(t,c=>table.get(c)??c).join('')});
  }
  const apply=(id,c)=>G.apply(id,c);
  function letters(text,select){let position=0;const seen=new Set();return text.replace(/[A-Za-z]+/g,word=>
    Array.from(word,(c,index)=>{const key=c.toLowerCase();const out=select(c,{position:++position,index,length:word.length,word,seen});seen.add(key);return out;}).join(''));}
  const prime=n=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;};
  const fibonacci=n=>{let a=1,b=2;while(a<n)[a,b]=[b,a+b];return a===n;};
  const cycle=(ids)=>t=>letters(t,(c,s)=>apply(ids[(s.position-1)%ids.length],c));
  const byWord=ids=>t=>{let word=0;return t.replace(/[A-Za-z]+/g,w=>apply(ids[word++%ids.length],w));};
  const recipes=[
    ['loomstep','Loomstep',cycle(['script','mono'])],
    ['counterloom','Counterloom',cycle(['mono','script'])],
    ['vowelflare','Vowelflare',t=>letters(t,c=>apply(/[aeiou]/i.test(c)?'boldScript':'mono',c))],
    ['iron-vowels','Iron Vowels',t=>letters(t,c=>apply(/[aeiou]/i.test(c)?'double':'boldFraktur',c))],
    ['chaos-noodle-ii','Chaos Noodle II',t=>letters(t,c=>apply(/[aeiou]/i.test(c)?'mathBold':'sansReg',c))],
    ['primewire','Primewire',t=>letters(t,(c,s)=>apply(prime(s.position)?'fraktur':'mono',c))],
    ['fibonacci-bloom','Fibonacci Bloom',t=>letters(t,(c,s)=>apply(fibonacci(s.position)?'boldScript':'sansReg',c))],
    ['triune-relay','Triune Relay',cycle(['script','mono','sansBold'])],
    ['hex-cathedral','Hex Cathedral',cycle(['fraktur','double','mono'])],
    ['wordphase','Wordphase',byWord(['script','mono','sansBold'])],
    ['quartet-bus','Quartet Bus',byWord(['mono','italic','double','boldFraktur'])],
    ['alphabet-rift','Alphabet Rift',t=>letters(t,c=>apply(c.toLowerCase()<='m'?'script':'mono',c))],
    ['threshold-key','Threshold Key',t=>letters(t,(c,s)=>apply(s.index===0?'double':'mono',c))],
    ['cathedral-core','Cathedral Core',t=>letters(t,(c,s)=>apply(s.index===0||s.index===s.length-1?'boldFraktur':'sansReg',c))],
    ['bioluminal-split','Bioluminal Split',t=>letters(t,(c,s)=>apply(s.index<Math.ceil(s.length/2)?'script':'mono',c))],
    ['entangled-mirror','Entangled Mirror',t=>letters(t,(c,s)=>apply(['script','mono','sansBold'][Math.min(s.index,s.length-1-s.index)%3],c))],
    ['echo-memory','Echo Memory',t=>letters(t,(c,s)=>apply(s.seen.has(c.toLowerCase())?'boldScript':'mono',c))],
    ['geminate-scar','Geminate Scar',t=>letters(t,(c,s)=>apply((s.index>0&&s.word[s.index-1].toLowerCase()===c.toLowerCase())||(s.index<s.length-1&&s.word[s.index+1].toLowerCase()===c.toLowerCase())?'boldFraktur':'sansReg',c))],
    ['three-seal-word','Three-Seal Word',t=>letters(t,(c,s)=>apply(s.index===0?'double':s.index===s.length-1?'boldScript':'mono',c))],
    ['third-signal','Third Signal',t=>letters(t,(c,s)=>apply(s.position%3===0?'boldItalic':'mono',c))],
    ['root-access','Root Access',t=>letters(t,c=>({a:'4',e:'3',i:'1',o:'0',u:'µ'}[c.toLowerCase()]??apply('mono',c))).replace(/ /g,'·')],
    ['blacksite-packet','Blacksite Packet',t=>'⟦'+cycle(['mono','sansBold','boldFraktur','double'])(t).replace(/ /g,'::')+'⟧'],
    ['ghost-carrier','Ghost Carrier',t=>letters(t,(c,s)=>apply(['mono','sansReg','boldFraktur'][(s.position-1)%3],c)+(s.position%2===0?'\u0332':s.position%3===0?'\u035F':'')).replace(/ /g,' ⌁ ')]
  ];
  for(const [id,name,fn] of recipes) G.register({id,name,family:'synthetic recipe',role:'new executable interpretation; see register spec',mixable:false,baseable:true,fn});
  G.register({id:'coral-asemic-specimen',name:'Coral Asemic — literal specimen',family:'symbol specimen',
    role:'historical token dictionary missing; preset does not translate your text',mixable:false,baseable:true,
    fn:()=> '⋆ᨒ𓂅﹆ꔛ﹅⋆𓍼 ꕤ⌕ ⋆⌗⋆ଘ ﹆ꕤǂ⋆ ⌕ꕤଘᯅ𓍼 ᯅꕤ ✧⋈ꕤꕤ𓍼⋆ ⌕ǂꕤ﹆'});
  G.register({id:'kaomoji-heart',name:'Kaomoji Heart',family:'wrapper',role:'recovered wrapper idea',mixable:false,baseable:true,
    fn:t=>'(っ◔◡◔)っ ♥ '+t+' ♥'});
  G.register({id:'combining-box',name:'Combining Box',family:'combining mark',role:'new grapheme-aware keycap wrapper',mixable:false,baseable:true,
    fn:t=>Array.from(new Intl.Segmenter('en',{granularity:'grapheme'}).segment(t),x=>/^\s+$/.test(x.segment)?x.segment:x.segment+'\u20E3').join('')});
})(globalThis);

// Interface-only adapter. Never apply this to carrier text, byte envelopes,
// textareas, input values, JSON receipts, archived quotes or recovered payloads.
const garden=globalThis.FontGarden;
export const UI_REGISTERS=Object.freeze(['chaos-noodle-ii','loomstep','counterloom','vowelflare','triune-relay','wordphase','threshold-key','fibonacci-bloom']);
export const gardenCatalog=()=>garden.list();
export function letterText(text,register='chaos-noodle-ii'){
  if(typeof text!=='string')throw new TypeError('Authored interface text must be a string.');
  if(!UI_REGISTERS.includes(register))throw new Error('Unknown interface register.');
  return garden.apply(register,text.replace(/[A-Z]/g,c=>c.toLowerCase()));
}
export function letterInterface(root=document){
  const headings=[...root.querySelectorAll('h2,summary,h3')];
  const body=[...root.querySelectorAll('header p,header h1 span,section p:not([aria-live]),details p,label,button,option,footer,a')];
  const entries=[...headings.map((el,i)=>[el,UI_REGISTERS[1+i%(UI_REGISTERS.length-1)]]),...body.map(el=>[el,'chaos-noodle-ii'])];
  for(const [element,register] of entries){
    if(element.closest('pre,code,textarea,input,[data-literal],[aria-live],.variant-accessible'))continue;
    const label=[...element.childNodes].filter(n=>n.nodeType===3).map(n=>n.nodeValue).join(' ').trim();
    if(label&&!element.hasAttribute('aria-label')&&element.matches('h2,h3,summary,button,a'))element.setAttribute('aria-label',label.normalize('NFKC'));
    if(label&&element.matches('label'))for(const control of element.querySelectorAll('input,textarea,select'))control.setAttribute('aria-label',label.normalize('NFKC'));
    const walker=element.ownerDocument.createTreeWalker(element,4);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      if(node.parentElement.closest('pre,code,textarea,input,[data-literal],[aria-live],.variant-accessible'))continue;
      node.nodeValue=letterText(node.nodeValue,register);
    }
    element.dataset.gardenRegister=register;
  }
  for(const input of root.querySelectorAll('input[placeholder]')){
    if(!/^(?:https?:|\/|[A-Z_]+$)/.test(input.placeholder))input.placeholder=letterText(input.placeholder);
  }
}
