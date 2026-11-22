import {chapter2Ending} from '../state/chapter2Ending.js?v=chapter3-douban-1';
import {chapter2YouTubeBookingText} from '../data/chapter2YouTubeData.js?v=chapter2-ending-1';
let installed=false,overlay,content,previousInert=false;
function hide(){if(!overlay)return;overlay.remove();overlay=null;if(content)content.inert=previousInert;content=null;}
function update(){
 if(chapter2Ending.state.phase!=='booking'){hide();return;}if(overlay)return;
 content=document.querySelector('#device-content');previousInert=content.inert;content.inert=true;
 overlay=document.createElement('section');overlay.className='youtube-reservation-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','预约TMS的节目');
 overlay.innerHTML='<div class="youtube-reservation-card"><div class="youtube-reservation-channel"><span class="youtube-reservation-avatar">TMS</span><strong>TMS Official</strong></div><p></p><button type="button">预约</button></div>';
 overlay.querySelector('p').textContent=chapter2YouTubeBookingText;
 const button=overlay.querySelector('button');button.addEventListener('click',()=>{if(chapter2Ending.reserve())window.dispatchEvent(new Event('open-story-calendar'));});document.querySelector('#phone').append(overlay);button.focus({preventScroll:true});
}
export function mountChapter2Reservation(){if(installed)return;installed=true;chapter2Ending.subscribe(update);window.addEventListener('keydown',event=>{if(!overlay)return;if(['Escape','Tab'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();overlay.querySelector('button').focus({preventScroll:true});}},true);update();}
