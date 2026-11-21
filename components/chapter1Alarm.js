import {chapter1Alarm} from '../state/chapter1Alarm.js?v=chapter1-payment-fix-2';
import {chapter1AlarmText} from '../data/chapter1AlarmData.js?v=chapter1-alarm-1';
import {formatStatusTime} from './StatusBar.js?v=unified-status-1';
let installed=false,overlay,content,previousInert=false,timeTimer;
function vibrate(pattern){try{globalThis.navigator?.vibrate?.(pattern);}catch{ /* 不支持震动或浏览器拦截时继续显示闹钟。 */ }}
function hide(){clearInterval(timeTimer);timeTimer=null;if(!overlay)return;overlay.remove();overlay=null;vibrate(0);if(content)content.inert=previousInert;content=null;}
function update(){
 if(chapter1Alarm.state.phase!=='ringing'){hide();return;}
 if(overlay)return;content=document.querySelector('#device-content');previousInert=content.inert;content.inert=true;
 overlay=document.createElement('section');overlay.className='chapter1-alarm';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','闹钟提醒');
 overlay.innerHTML='<time class="chapter1-alarm-time"></time><div class="chapter1-alarm-copy"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="34" r="21"/><path d="M32 21v14l9 5M11 12l-5 7M53 12l5 7M18 52l-4 7M46 52l4 7M22 6l-9 1-7 9M42 6l9 1 7 9"/></svg><p></p></div><button type="button" class="chapter1-alarm-stop">关闭</button>';
 overlay.querySelector('p').textContent=chapter1AlarmText;
 const updateTime=()=>{overlay.querySelector('time').textContent=formatStatusTime();};updateTime();timeTimer=setInterval(updateTime,1000);
 const stop=overlay.querySelector('button');stop.addEventListener('click',()=>{chapter1Alarm.stop();});document.querySelector('#phone').append(overlay);stop.focus({preventScroll:true});vibrate([2000]);
}
export function mountChapter1Alarm(){if(installed)return;installed=true;chapter1Alarm.subscribe(()=>update());window.addEventListener('keydown',event=>{if(!overlay)return;if(event.key==='Escape'||event.key==='Tab'){event.preventDefault();event.stopImmediatePropagation();overlay.querySelector('button').focus({preventScroll:true});}},true);update();}
