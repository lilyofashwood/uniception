import {letterInterface,showInterfaceMessage,interfaceChoice} from '../../lettering.js';
import {CARRIER,weave,inspect} from './specimen.js';

const $=id=>document.getElementById(id);
const descriptions={
  v1:'Two bold alphabets: mathematical bold carries the poem; sans-serif bold holds the selected letters.',
  chaos_noodle:'Four fonts follow the vowels. Plain consonants belong to the source carrier; the secret takes a different path.',
  aesthetic:'Plain source letters carry the poem. Sans-serif bold makes the selected thread easier to see.',
};
let mode=interfaceChoice(location.search,'mode',Object.keys(descriptions),'v1');
function status(message){showInterfaceMessage($('status'),message);}
function paint(encoded,positions=[]){
  const selected=new Set(positions),fragment=document.createDocumentFragment();
  [...encoded].forEach((glyph,index)=>{
    if(selected.has(index)){
      const span=document.createElement('span');span.className='selected';span.textContent=glyph;fragment.append(span);
    }else fragment.append(document.createTextNode(glyph));
  });
  $('poem').replaceChildren(fragment);
}
function veil(){
  paint($('wire').value);$('secret').textContent='';$('reveal').hidden=true;$('veil').disabled=true;
}
function selectMode(next){
  const result=weave(next);mode=next;
  $('wire').value=result.encoded;$('mode-description').textContent=descriptions[mode];
  $('receipt').textContent='';veil();
  document.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
  status('Source glyphs match the local encoder. The thread is ready.');
  letterInterface();
}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>selectMode(button.dataset.mode)));
$('decode').addEventListener('click',()=>{
  try{
    // Decode the text currently displayed, not the known expected payload.
    const result=inspect($('wire').value,mode);
    $('secret').textContent=result.secret;$('reveal').hidden=false;$('veil').disabled=false;
    paint($('wire').value,result.positions);
    $('receipt').textContent=JSON.stringify({mode,sourceExact:result.sourceExact,carrierExact:result.carrierExact,
      payloadExact:result.payloadExact,selectedPositions:result.positions,extracted:result.secret,
      meaning:'Actual legacy font-channel extraction; no checksum or authentication in this format.'},null,2);
    status(result.sourceExact&&result.carrierExact&&result.payloadExact
      ?'The source carrier and fourteen selected letters match exactly.'
      :'The current text differs from the supplied specimen. The receipt shows what was actually extracted.');
    letterInterface();
  }catch(error){veil();$('receipt').textContent='';status(`Cannot decode this text: ${error.message}`);}
});
$('veil').addEventListener('click',()=>{veil();$('receipt').textContent='';status('The thread is veiled again.');});
$('wire').addEventListener('input',()=>{
  // Also protects a future editable-wire view: an old receipt must never label new text.
  veil();$('receipt').textContent='';status('The text has changed. Decode again to read its current thread.');
});
$('copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('wire').value);status('Exact encoded poem copied.');}
  catch{
    document.querySelector('details').open=true;$('wire').focus();$('wire').select();
    status('Clipboard permission was unavailable. The exact text is selected for manual copying.');
  }
});
$('accessible-poem').textContent=CARRIER;
selectMode(mode);
