import {chapter1Kkt} from '../state/chapter1Kkt.js?v=chapter1-kkt-details-3';
import {chapter1KktPreview} from '../data/chapter1KktChat.js?v=chapter1-kkt-details-3';
import {chapter1Flight} from '../state/chapter1Flight.js?v=chapter1-payment-fix-2';
import {chapter1FlightPreview} from '../data/flightOpeningData.js?v=chapter1-flight-1';
import {chapter1Opening} from '../state/chapter1Opening.js?v=chapter1-payment-fix-2';
import {chapter1OpeningCopy as copy} from '../data/threadsPostsData.js?v=chapter1-opening-1';
let installed=false,overlay,content,previousInert=false,overlayType=null;
function hide(){if(!overlay)return;overlay.remove();overlay=null;overlayType=null;if(content)content.inert=previousInert;content=null;}
function update(){
 const kkt=chapter1Kkt.state.phase==='notification';
 const flight=chapter1Flight.state.phase==='notification';
 if(!kkt&&!flight&&chapter1Opening.state.phase!=='notification'){hide();return;}
 const type=kkt?'kkt':flight?'flight':'threads';if(overlay&&overlayType===type)return;if(overlay)hide();overlayType=type;
 const titleText=kkt?'哥哥🐕':flight?'航旅纵横':copy.title,previewText=kkt?chapter1KktPreview:flight?chapter1FlightPreview:copy.preview;
 content=document.querySelector('#device-content');previousInert=content.inert;content.inert=true;
 overlay=document.createElement('section');overlay.className='chapter1-notice-overlay'+(kkt?' chapter1-kkt-notice':flight?' chapter1-flight-notice':'');overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',titleText+' 剧情通知');
 const banner=document.createElement('button');banner.type='button';banner.className='chapter1-notice-banner';banner.setAttribute('aria-label',`${titleText}：${previewText}`);
 const icon=document.createElement('img');icon.src=kkt?'./kkt/金道勋头像.png':flight?'./agoda/航旅纵横图标.png':'./agoda/Threads图标.png';icon.alt='';
 const text=document.createElement('span'),title=document.createElement('strong'),preview=document.createElement('span');title.textContent=titleText;preview.textContent=previewText;text.append(title,preview);banner.append(icon,text);
 banner.addEventListener('click',()=>{if(kkt){if(chapter1Kkt.acknowledgeNotification())window.dispatchEvent(new Event('open-kkt-story-chat'));return;}if(flight){if(chapter1Flight.acknowledgeNotification())window.dispatchEvent(new Event('open-umetrip-dynamics'));return;}if(!chapter1Opening.acknowledgeNotification())return;if(location.hash==='#threads')chapter1Opening.enterThreads();else location.hash='threads';});
 overlay.append(banner);document.querySelector('#phone').append(overlay);banner.focus({preventScroll:true});
}
export function mountChapter1Notice(){
 if(installed)return;installed=true;chapter1Opening.subscribe(update);chapter1Flight.subscribe(update);chapter1Kkt.subscribe(update);
 window.addEventListener('phone-unlocked',()=>chapter1Opening.onUnlocked());
 // 支持脚本晚于开机挂载；内部状态保证5秒定时器只创建一次。
 if(document.querySelector('#phone').dataset.boot==='unlocked')chapter1Opening.onUnlocked();
 window.addEventListener('keydown',event=>{if(!overlay)return;if(event.key==='Escape'||event.key==='Tab'){event.preventDefault();event.stopImmediatePropagation();overlay.querySelector('button').focus({preventScroll:true});}},true);
 update();
}
