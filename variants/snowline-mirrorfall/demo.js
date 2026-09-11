import {capacity,encode,decode,encodeMirrorfall,decodeMirrorfall} from './core.js';
import {specimen} from './specimen.js';
import {letterInterface,letterText,interfaceChoice} from '../../lettering.js';

const $=id=>document.getElementById(id);
$('traversal').value=interfaceChoice(location.search,'traversal',['mirrorfall','linear'],'mirrorfall');
const mode=()=> $('traversal').value==='mirrorfall' ? {encode:encodeMirrorfall,decode:decodeMirrorfall} : {encode,decode};
function status(message){$('status').textContent=letterText(message);$('status').setAttribute('aria-label',message);}
function measure(){
  const size=capacity($('carrier').value),message=`${size.letters} Latin letters · up to ${size.payloadBytes} payload bytes · ${new TextEncoder().encode($('payload').value).length} bytes entered`;
  $('capacity').textContent=letterText(message);$('capacity').setAttribute('aria-label',message);
}
function recover(){
  const result=mode().decode($('encoded').value);
  $('recovered').textContent=result.payload;
  $('receipt').textContent=JSON.stringify({codec:'SN v1',traversal:$('traversal').value,...result},null,2);
  status('Frame recovered · payload CRC16 valid.');
  return result;
}
function weave(){
  const packet=mode().encode($('carrier').value,$('payload').value);
  $('encoded').value=packet.encoded;$('artwork').textContent=packet.encoded;
  const result=recover();if(result.payload!==$('payload').value)throw new Error('Local payload round trip failed.');
  measure();
}
function guarded(action){try{action();}catch(error){$('recovered').textContent='';$('receipt').textContent='';status('Rejected: '+error.message);}}
function reset(){$('carrier').value=specimen.carrier;$('payload').value=specimen.payload;guarded(weave);}
$('weave').onclick=()=>guarded(weave);$('decode').onclick=()=>guarded(recover);$('reset').onclick=reset;
$('carrier').oninput=()=>guarded(measure);$('payload').oninput=()=>guarded(measure);$('traversal').onchange=()=>guarded(weave);
$('encoded').oninput=()=>{$('artwork').textContent=$('encoded').value;$('recovered').textContent='';$('receipt').textContent='';status('Edited carrier · decode to verify its frame.');};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('encoded').value);status('Copied exact carrier without compatibility folding.');}catch{status('Clipboard unavailable. Select the exact encoded text and copy manually.');}};
letterInterface(document);document.title=letterText(document.title);reset();
