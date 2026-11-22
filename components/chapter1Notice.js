import {chapter3Threads} from '../state/chapter3Threads.js?v=chapter3-threads-1';
import {chapter3Redbook} from '../state/chapter3Redbook.js?v=chapter3-redbook-1';
import {chapter3RedbookPost} from '../data/chapter3RedbookPost.js?v=chapter3-redbook-1';
import {chapter3Douban} from '../state/chapter3Douban.js?v=chapter3-douban-1';
import {chapter3DoubanPost} from '../data/chapter3DoubanPost.js?v=chapter3-douban-1';
import {chapter2Ending} from '../state/chapter2Ending.js?v=chapter3-douban-1';
import {chapter2YouTubePreview} from '../data/chapter2YouTubeData.js?v=chapter2-ending-1';
import {chapter2Threads} from '../state/chapter2Threads.js?v=chapter3-douban-1';
import {chapter2ThreadsPreview} from '../data/chapter2ThreadsPosts.js?v=chapter2-threads-1';
import {chapter2Flight} from '../state/chapter2Flight.js?v=chapter3-douban-1';
import {chapter2FlightPreview} from '../data/chapter2FlightData.js?v=chapter2-flight-1';
import {chapter2Kkt} from '../state/chapter2Kkt.js?v=chapter3-douban-1';
import {chapter2Douban} from '../state/chapter2Douban.js?v=chapter3-douban-1';
import {chapter2DoubanPost} from '../data/chapter2DoubanPost.js?v=chapter2-douban-1';
import {chapter1Kkt} from '../state/chapter1Kkt.js?v=chapter2-ending-1';
import {chapter1KktPreview} from '../data/chapter1KktChat.js?v=chapter1-kkt-details-3';
import {chapter1Flight} from '../state/chapter1Flight.js?v=chapter2-ending-1';
import {chapter1FlightPreview} from '../data/flightOpeningData.js?v=chapter1-flight-1';
import {chapter1Opening} from '../state/chapter1Opening.js?v=chapter2-ending-1';
import {chapter1OpeningCopy as copy} from '../data/threadsPostsData.js?v=chapter1-opening-1';
let installed=false,overlay,content,previousInert=false,overlayType=null;
function hide(){if(!overlay)return;overlay.remove();overlay=null;overlayType=null;if(content)content.inert=previousInert;content=null;}
function update(){
 const threads3=chapter3Threads.state.phase==='notification';
 const redbook3=chapter3Redbook.state.phase==='notification';
 const douban3=chapter3Douban.state.phase==='notification';
 const youtube=chapter2Ending.state.phase==='notification';
 const threads2=chapter2Threads.state.phase==='notification';
 const flight2=chapter2Flight.state.phase==='notification';
 const kkt2=chapter2Kkt.state.phase==='notification';
 const douban=chapter2Douban.state.phase==='notification';
 const agent=chapter1Kkt.state.agentPhase==='notification',calendar=chapter1Kkt.state.calendarPrompt;
 const kkt=chapter1Kkt.state.phase==='notification';
 const flight=chapter1Flight.state.phase==='notification';
 if(!threads3&&!redbook3&&!douban3&&!youtube&&!threads2&&!flight2&&!kkt2&&!douban&&!agent&&!calendar&&!kkt&&!flight&&chapter1Opening.state.phase!=='notification'){hide();return;}
 const type=threads3?'threads3':redbook3?'redbook3':douban3?'douban3':youtube?'youtube':threads2?'threads2':flight2?'flight2':kkt2?'kkt2':douban?'douban':calendar?'calendar':agent?'agent':kkt?'kkt':flight?'flight':'threads';if(overlay&&overlayType===type)return;if(overlay)hide();overlayType=type;
 const titleText=threads3?'Threads':redbook3?'小红书':douban3?chapter3DoubanPost.group:youtube?'YouTube':threads2?'Threads':flight2?'航旅纵横':kkt2?'哥哥🐕':douban?chapter2DoubanPost.group:calendar?'添加到日历':agent?'经纪人':kkt?'哥哥🐕':flight?'航旅纵横':copy.title,previewText=threads3?'2031年12月24日我确定我要把金道牛放飞了':redbook3?chapter3RedbookPost.title:douban3?chapter3DoubanPost.title:youtube?chapter2YouTubePreview:threads2?chapter2ThreadsPreview:flight2?chapter2FlightPreview:kkt2?'今天几点的飞机？':douban?chapter2DoubanPost.title:calendar?'是否将‘2031年11月20日’添加至‘我的行程’？':agent?'Hanjin本人在吗？':kkt?chapter1KktPreview:flight?chapter1FlightPreview:copy.preview;
 content=document.querySelector('#device-content');previousInert=content.inert;content.inert=true;
 overlay=document.createElement('section');overlay.className='chapter1-notice-overlay'+(redbook3?' chapter3-redbook-notice':youtube?' chapter2-youtube-notice':douban3||douban?' chapter2-douban-notice':calendar?' chapter1-calendar-prompt':kkt2||agent||kkt?' chapter1-kkt-notice':flight2||flight?' chapter1-flight-notice':'');overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',titleText+' 剧情通知');
 const banner=document.createElement('button');banner.type='button';banner.className='chapter1-notice-banner';banner.setAttribute('aria-label',`${titleText}：${previewText}`);
 const icon=document.createElement('img');icon.src=agent?'./kkt/agent-avatar.svg':kkt2||kkt?'./kkt/金道勋头像.png':flight2||flight?'./agoda/航旅纵横图标.png':'./agoda/Threads图标.png';icon.alt='';
 const text=document.createElement('span'),title=document.createElement('strong'),preview=document.createElement('span');text.className='notice-copy';title.className='notice-title';preview.className='notice-preview';title.textContent=titleText;preview.textContent=previewText;text.append(title,preview);if(redbook3){const logo=document.createElement('span');logo.className='rb-notice-logo';logo.textContent='小红书';banner.append(logo,text);}else if(youtube){const logo=document.createElement('span');logo.className='youtube-notice-logo';logo.innerHTML='<svg viewBox="0 0 32 24" aria-hidden="true"><rect y="1" width="32" height="22" rx="6" fill="#ff0033"/><path d="m13 6 10 6-10 6Z" fill="white"/></svg>';banner.append(logo,text);}else if(douban3||douban){const logo=document.createElement('span');logo.className='douban-notice-logo';logo.textContent='豆';banner.append(logo,text);}else banner.append(icon,text);
 banner.addEventListener('click',()=>{if(threads3){if(chapter3Threads.acknowledgeNotification())window.dispatchEvent(new Event('open-chapter3-threads'));return;}if(redbook3){if(chapter3Redbook.acknowledgeNotification())window.dispatchEvent(new Event('open-chapter3-redbook'));return;}if(douban3){if(chapter3Douban.acknowledgeNotification())window.dispatchEvent(new Event('open-chapter3-douban'));return;}if(youtube){if(chapter2Ending.acknowledgeNotification())window.dispatchEvent(new Event('open-chapter2-youtube'));return;}if(threads2){if(chapter2Threads.acknowledgeNotification())window.dispatchEvent(new Event('open-chapter2-threads'));return;}if(flight2){if(chapter2Flight.acknowledgeNotification())window.dispatchEvent(new Event('open-umetrip-dynamics'));return;}if(kkt2){if(chapter2Kkt.acknowledgeNotification())window.dispatchEvent(new Event('open-kkt-story-chat'));return;}if(douban){if(chapter2Douban.acknowledgeNotification())window.dispatchEvent(new Event('open-chapter2-douban'));return;}if(calendar){if(chapter1Kkt.acknowledgeCalendarPrompt(true))window.dispatchEvent(new Event('open-story-calendar'));return;}if(agent){if(chapter1Kkt.acknowledgeAgent())window.dispatchEvent(new Event('open-kkt-agent-chat'));return;}if(kkt){if(chapter1Kkt.acknowledgeNotification())window.dispatchEvent(new Event('open-kkt-story-chat'));return;}if(flight){if(chapter1Flight.acknowledgeNotification())window.dispatchEvent(new Event('open-umetrip-dynamics'));return;}if(!chapter1Opening.acknowledgeNotification())return;if(location.hash==='#threads')chapter1Opening.enterThreads();else location.hash='threads';});
 if(calendar){banner.className='chapter1-calendar-confirm';banner.textContent='确认添加';const heading=document.createElement('h2'),body=document.createElement('p'),cancel=document.createElement('button'),card=document.createElement('div'),footer=document.createElement('footer');heading.textContent=titleText;body.textContent=previewText;cancel.textContent='取消';cancel.addEventListener('click',()=>chapter1Kkt.acknowledgeCalendarPrompt(false));footer.append(cancel,banner);card.className='chapter1-calendar-alert';card.append(heading,body,footer);overlay.append(card);}else overlay.append(banner);document.querySelector('#phone').append(overlay);banner.focus({preventScroll:true});
}
export function mountChapter1Notice(){
 if(installed)return;installed=true;chapter1Opening.subscribe(update);chapter1Flight.subscribe(update);chapter1Kkt.subscribe(update);chapter2Douban.subscribe(update);chapter2Kkt.subscribe(update);chapter2Flight.subscribe(update);chapter2Threads.subscribe(update);chapter2Ending.subscribe(update);chapter3Douban.subscribe(update);chapter3Redbook.subscribe(update);chapter3Threads.subscribe(update);
 window.addEventListener('phone-unlocked',()=>chapter1Opening.onUnlocked());
 // 支持脚本晚于开机挂载；内部状态保证5秒定时器只创建一次。
 if(document.querySelector('#phone').dataset.boot==='unlocked')chapter1Opening.onUnlocked();
 window.addEventListener('keydown',event=>{if(!overlay)return;if(event.key==='Escape'||event.key==='Tab'){event.preventDefault();event.stopImmediatePropagation();overlay.querySelector('button').focus({preventScroll:true});}},true);
 update();
}
