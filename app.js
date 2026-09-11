import {legacyEncode,legacyDecode,bytesEncode,bytesDecode,requiredLetters,wrapRegion,decodeRegions} from './core.js';
import {letterInterface,letterText,showInterfaceMessage,showLiteralResult,interfaceChoice} from './lettering.js';
const $=id=>document.getElementById(id);
for(const id of ['format','mode'])$(id).value=interfaceChoice(location.search,id,[...$(id).options].map(option=>option.value),$(id).value);
// This marker is injected only into the adapter's root page. No probe or provider call.
const localAdapter=/^http:\/\/127\.0\.0\.1(?::\d+)?$/.test(location.origin)&&document.querySelector('meta[name="uniception-local-adapter"]')?.content==='v1';
const providerControls=['provider','model','endpoint','key','tokens','compose','interpret'];
for(const id of providerControls)$(id).disabled=!localAdapter;
$('adapter-status').textContent=localAdapter?'Local adapter connected. Model calls happen only when you choose a model action.':'Static preview: model actions and key entry are disabled. Start the local service for provider access; weaving and decoding work here.';
// Public variant links contain only cleared synthetic specimens. No probe or model call.
function config(){return {provider:$('provider').value,model:$('model').value,endpoint:$('endpoint').value,key:$('key').value,maxTokens:Number($('tokens').value)};}
function show(value,target='receipt'){
  if(typeof value==='string')showInterfaceMessage($(target),value);
  else showLiteralResult($(target),value);
}
show($('receipt').textContent);show($('model-result').textContent,'model-result');
function run(fn){try{fn();}catch(e){show('Rejected: '+e.message);}}
function capacity(){try{$('capacity').textContent=letterText($('format').value==='legacy'?'Historical mode removes payload whitespace and preserves the carrier’s letter case.':`Exact case, whitespace and Unicode. Requires ${requiredLetters($('payload').value)} ASCII carrier letters.`);}catch(e){$('capacity').textContent=letterText(e.message);}}
function encode(){const fn=$('format').value==='legacy'?legacyEncode:bytesEncode;const result=fn($('carrier').value,$('payload').value,$('mode').value);$('encoded').value=wrapRegion(result.encoded,$('format').value,$('mode').value);const {encoded,...receipt}=result;show(receipt);return receipt;}
function decode(){const text=$('encoded').value;return text.includes('<!-- stegweb:')?decodeRegions(text):[($('format').value==='legacy'?legacyDecode:bytesDecode)(text,$('mode').value)];}
$('encode').onclick=()=>run(encode);$('decode').onclick=()=>run(()=>show(decode()));$('regions').onclick=()=>run(()=>show(decodeRegions($('encoded').value)));
$('payload').oninput=capacity;$('format').onchange=capacity;capacity();
$('example').onclick=()=>run(()=>{$('format').value='bytes-v2';$('payload').value='The door remembers.\n𝓵𝓲𝓵𝔂 🕯️ e\u0301';$('carrier').value=Array.from({length:8},()=> 'The lamp kept its small circle of light. Beneath it lay a ledger whose last page was warm. No one had entered the room, but the chair had turned toward the window.').join('\n\n');capacity();encode();});
$('download').onclick=()=>{const blob=new Blob([$ ('encoded').value],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='uniception-passage.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('forget').onclick=()=>{$('key').value='';show('Key cleared from the page.','model-result');};
async function ask(prompt){
  if(!localAdapter)throw new Error('Model access needs the local adapter. Run python3 server.py --port 8768 and open its printed URL.');
  const c=config();if(!c.model)throw new Error('Enter a model ID.');
  const response=await fetch('/api/compose',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({config:c,prompt}),signal:AbortSignal.timeout(100000)});
  const result=await response.json();if(!response.ok)throw new Error(result.error||'Provider request failed.');return result.candidate;
}
async function modelAction(fn){if(!localAdapter){show('Static preview: start the local adapter for model access.','model-result');return;}for(const id of ['compose','interpret'])$(id).disabled=true;show('Waiting for one provider call…','model-result');try{await fn();}catch(e){show('Request stopped: '+e.message,'model-result');}finally{for(const id of ['compose','interpret'])$(id).disabled=!localAdapter;}}
$('compose').onclick=()=>modelAction(async()=>{
  const bytes=$('format').value==='bytes-v2';
  const payload=$('payload').value,mode=$('mode').value;
  const constraints=bytes?`At least ${requiredLetters(payload)} ASCII letters of natural prose.`:'The ASCII letters of the payload, after removing whitespace, must appear as an ordered subsequence, case-insensitively.';
  const result=await ask('Compose an independently worthwhile carrier passage. Return JSON {"carrier":"..."}. No styled Unicode Latin letters. '+constraints+'\nDATA '+JSON.stringify({payload,style:$('style').value}));
  if(typeof result.carrier!=='string')throw new Error('Model did not return a carrier string.');
  const verified=(bytes?bytesEncode:legacyEncode)(result.carrier,payload,mode);
  $('carrier').value=result.carrier;$('encoded').value=wrapRegion(verified.encoded,bytes?'bytes-v2':'legacy',mode);
  show({status:'locally verified',provider:config().provider,model:config().model},'model-result');const {encoded,...receipt}=verified;show(receipt);
});
$('interpret').onclick=()=>modelAction(async()=>{
  const exact=decode();show(exact);
  const interpretation=await ask('Interpret these locally recovered Uniception readings (historical StegWeb formats) as literature. Do not change the exact recovered data. Return JSON {"interpretation":"...","uncertainties":["..."]}.\nDATA '+JSON.stringify(exact));
  show({status:'literary interpretation beside exact local recovery',interpretation},'model-result');
});
letterInterface(document);
