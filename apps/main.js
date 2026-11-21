import {renderClock} from './clock.js?v=chapter1-payment-fix-2';
import {chapter1Alarm} from '../state/chapter1Alarm.js?v=chapter1-payment-fix-2';
import {mountChapter1Alarm} from '../components/chapter1Alarm.js?v=chapter1-payment-fix-2';
import {mountChapter1Notice} from '../components/chapter1Notice.js?v=chapter1-kkt-details-3';
import {mountThreads} from './threads.js?v=chapter1-payment-fix-2';
import {mountCalendar} from './calendar.js?v=chapter1-payment-fix-2';
import {renderMemoList,renderMemoDetail} from './notes.js?v=memo-pregnancy-1';
import {renderPhoneRecents,renderPhoneTabs} from './phone.js?v=phone-tabs-locked-1';
import {renderUmetrip} from './umetrip.js?v=umetrip-home-1';
import {mountAgoda} from './agoda.js?v=chapter1-payment-fix-2';
import {imessageData,getMessagesUnread,markMessagesRead} from '../data/messageStore.js?v=taobao-payment-1';
import { mountTaobao } from './taobao.js?v=agoda-booking-1';
import { renderRedbook, mountRedbookMasonry } from './redbook.js?v=redbook-no-subtitle-3';
import { mountStatusBar } from '../components/StatusBar.js?v=unified-status-1';
import { renderYouTube } from './youtube.js?v=youtube-feed-1';
import { mountKktModals } from './kktModals.js?v=kkt-receipt-1';
import { renderKkt,mountKktStream,pauseKktStream } from './kkt.js?v=chapter1-kkt-details-3';
import { renderHealth, renderHealthTabs } from './health.js?v=health-range-15-1';
import { renderDoubanFeed, renderDoubanTabs } from './douban.js?v=douban-interactions-2';
import { apps } from '../data/apps.js?v=chapter1-opening-1';
const home=document.querySelector('#home'), screen=document.querySelector('#app'), phone=document.querySelector('#phone');
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeHTML;
export const placeholder=(label='图片1',kind='')=>`<div class="placeholder ${kind}" role="img" aria-label="${e(label)}">${e(label)}</div>`;
const button=(label,action,cls='')=>`<button class="${cls}" data-action="${action}">${e(label)}</button>`;
const empty=text=>`<div class="empty">${e(text)}</div>`;
const search=d=>`<input class="search" type="search" aria-label="${e(d.search)}" placeholder="${e(d.search)}">`;
let current=null,tab='',page='root',homeIndex=0,lastIcon=null,selectedMessageId=null,phoneRecentFilter='all',pendingUmetripDynamics=false,pendingKktChat=false;
function icon(d){return `<button class="app-icon" data-open="${d.id}" aria-label="打开${e(d.name)}"><span class="home-icon-wrap"><span style="--icon:${d.color}" class="icon ${d.id}">${d.id==='calendar'?`<span class="home-calendar-caption">${e(d.iconCaption)}</span><strong class="home-calendar-day">${e(d.iconDay)}</strong>`:d.iconImage?`<img src="${e(d.iconImage)}" alt="" draggable="false">`:d.id==='youtube'?'<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="10" width="40" height="28" rx="8" fill="white"/><path d="m20 17 13 7-13 7z" fill="#ed2828"/></svg>':e(d.glyph)}</span>${d.id==='messages'?`<b class="home-unread-badge" data-messages-badge ${getMessagesUnread()?'':'hidden'}>1</b>`:''}</span><span>${e(d.name)}</span></button>`;}
home.innerHTML=`<div id="home-pages" tabindex="0" aria-label="左右滑动切换主屏幕">${[apps.slice(0,8),apps.slice(8)].map((list,i)=>`<div class="home-page" aria-label="第${i+1}页"><div class="app-grid">${list.map(icon).join('')}</div></div>`).join('')}</div><div class="dots">${[0,1].map(i=>`<button data-page="${i}" aria-label="主屏幕第${i+1}页" aria-current="${i===0?'page':'false'}"><span></span></button>`).join('')}</div><div class="dock">${['messages','phone','notes','clock'].map(id=>icon(apps.find(a=>a.id===id))).join('')}</div>`;
const pager=document.querySelector('#home-pages');
function goPage(i){pager.scrollTo({left:i*pager.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
pager.addEventListener('scroll',()=>{homeIndex=Math.round(pager.scrollLeft/pager.clientWidth);document.querySelectorAll('[data-page]').forEach((b,i)=>b.setAttribute('aria-current',i===homeIndex?'page':'false'));},{passive:true});
pager.addEventListener('keydown',ev=>{if(ev.target===pager&&['ArrowLeft','ArrowRight'].includes(ev.key)){ev.preventDefault();goPage(Math.max(0,Math.min(1,homeIndex+(ev.key==='ArrowRight'?1:-1))));}});
new ResizeObserver(()=>{pager.scrollLeft=homeIndex*pager.clientWidth;}).observe(pager);
let swipeX=0,suppress=0;
pager.addEventListener('pointerdown',ev=>{swipeX=ev.clientX;});
pager.addEventListener('pointerup',ev=>{if(Math.abs(ev.clientX-swipeX)>24)suppress=Date.now()+350;});
home.addEventListener('click',ev=>{if(Date.now()<suppress)return;const b=ev.target.closest('[data-open],[data-page]');if(!b)return;if(b.dataset.page!==undefined)goPage(Number(b.dataset.page));else{lastIcon=b;location.hash=b.dataset.open;}});
function returnHome(){location.hash='';}
function route(){const id=location.hash.slice(1);if(id!=='kkt')pauseKktStream();if(id!=='umetrip')chapter1Alarm.onReminderHidden();current=apps.find(a=>a.id===id);home.hidden=!!current;screen.hidden=!current;phone.className=current?`in-app theme-${current.id}`:'';if(!current){if(id)history.replaceState(null,'',location.pathname+location.search);lastIcon?.focus();return;}tab=current.id==='umetrip'?(pendingUmetripDynamics?'动态':'行程'):current.id==='kkt'?'聊天':current.id==='clock'?'闹钟':current.id==='phone'?'最近通话':current.tabs[0]||'';page=current.id==='kkt'&&pendingKktChat?'chat':'root';if(current.id==='kkt')pendingKktChat=false;if(current.id==='umetrip')pendingUmetripDynamics=false;phoneRecentFilter='all';render();}
window.addEventListener('hashchange',route);
window.addEventListener('open-kkt-story-chat',()=>{if(current?.id==='kkt'){page='chat';render();}else{pendingKktChat=true;location.hash='kkt';}});
window.addEventListener('open-umetrip-dynamics',()=>{if(current?.id==='umetrip'){tab='动态';page='root';render();}else{pendingUmetripDynamics=true;location.hash='umetrip';}});
document.querySelector('#home-button').addEventListener('click',returnHome);
let startY;document.querySelector('#home-button').addEventListener('pointerdown',ev=>{startY=ev.clientY;ev.currentTarget.setPointerCapture(ev.pointerId);});document.querySelector('#home-button').addEventListener('pointerup',ev=>{if(startY-ev.clientY>20)returnHome();});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape')returnHome();});
function header(d,title){return `<header>${page!=='root'?button('‹ 返回','back'):button('‹ 主屏幕','home')}<span>${e(d.name)}</span><span class="header-spacer"></span></header><div class="title-row"><h1>${e(title)}</h1>${['kkt','wechat'].includes(d.id)&&page==='root'?button('＋','detail','round'):''}</div>`;}
function tabs(d){if(d.id==='phone')return renderPhoneTabs(tab,e);if(d.id==='health')return renderHealthTabs(tab,e);if(d.id==='douban')return renderDoubanTabs();return d.tabs.length&&page==='root'?`<nav class="tabs" aria-label="${e(d.name)}导航">${d.tabs.map((t,i)=>`<button data-tab="${e(t)}" aria-current="${t===tab?'page':'false'}"><span aria-hidden="true">${['⌂','▣','⊕','▤','○'][i]}</span>${e(t)}</button>`).join('')}</nav>`:'';}
function composer(d){return `<form class="composer"><span aria-hidden="true">＋</span><input aria-label="${e(d.input)}" placeholder="${e(d.input)}" autocomplete="off" disabled aria-disabled="true"><button type="submit" disabled aria-disabled="true">发送</button></form>`;}
function chat(d){return `<div class="messages">${d.messages.map(m=>`<div class="bubble ${m.mine?'mine':''}">${e(m.text)}</div>`).join('')}</div>${composer(d)}`;}
function cards(d){const list=d.items.length?d.items:Array.from({length:d.placeholderCount},(_,i)=>({imageLabel:`图片${i+1}`,title:''}));return `<div class="cards ${d.id==='agoda'?'hotel-list':''}">${list.map((item,i)=>`<button class="card" data-item="${i}">${item.image?`<img src="${e(item.image)}" alt="${e(item.imageLabel||'图片')}" loading="lazy">`:placeholder(item.imageLabel||`图片${i+1}`)}<div class="card-copy">${item.title?`<strong>${e(item.title)}</strong>`:'<span class="skeleton"></span><span class="skeleton short"></span>'}${item.text?`<p>${e(item.text)}</p>`:''}</div></button>`).join('')}</div>`;}
let selectedItem=0;
function body(d){
 if(page==='chat')return chat(d);
 if(page==='detail'){
  if(d.id==='douban')return `<div class="scroll"><div class="profile">${placeholder('头像','avatar')}<span class="skeleton"></span></div><p>${e(d.postText)}</p>${placeholder('图片1')}<h2>评论</h2>${d.comments.map(c=>`<p>${e(c.text)}</p>`).join('')}${empty('暂无评论')}</div><form class="composer"><input aria-label="评论" placeholder="${e(d.commentHint)}" disabled aria-disabled="true"><button disabled aria-disabled="true">发送</button></form>`;
  if(d.id==='notes'&&typeof d.items[selectedItem]?.content==='string')return renderMemoDetail(d.items[selectedItem],e);
  if(d.id==='notes')return `<textarea class="note-editor" aria-label="备忘录内容" placeholder="${e(d.input)}">${e(d.items[selectedItem]?.text ?? d.noteText)}</textarea>`;
  const item=d.items[selectedItem]||{};return `<div class="scroll">${item.image?`<img class="detail-image" src="${e(item.image)}" alt="图片">`:placeholder('图片1')}<h2>${e(item.title||'')}</h2><p>${e(item.text||'')}</p></div>`;
 }
 if(page==='moments')return `<div class="scroll moments">${placeholder('封面')}<div class="profile">${placeholder('头像','avatar')}</div>${d.moments.length?d.moments.map(m=>`<article class="panel"><p>${e(m.text)}</p>${placeholder('图片1')}</article>`).join(''):empty('暂无朋友圈')}</div>`;
 if(['kkt','wechat','messages'].includes(d.id)){
  if(d.id==='wechat'&&tab==='发现')return `<div class="scroll">${button('朋友圈','moments','row')}</div>`;
  if((d.id==='wechat'&&tab==='我')||(d.id==='kkt'&&tab==='更多'))return `<div class="scroll"><div class="profile">${placeholder('头像','avatar')}<span class="skeleton"></span></div></div>`;
  const records=(tab==='通讯录'||tab==='好友')?d.contacts:d.items;
  return `<div class="scroll">${search(d)}${records.map((r,i)=>`<button class="row chat-row" data-action="detail">${placeholder('头像','avatar')}<span>${e(r.title||'联系人')}</span></button>`).join('')}${!records.length?empty(d.empty):''}${button(d.action,'detail','row link')}</div>`;
 }
 if(d.id==='douban')return renderDoubanFeed(d.posts, e);
 if(d.id==='notes')return `<div class="scroll">${d.items.length?renderMemoList(d.items,e):empty('暂无备忘录')}</div>`;
 if(d.id==='health')return renderHealth(d,tab,e);
 if(d.id==='phone')return `<div class="scroll">${tab==='拨号键盘'?`<output class="dial-number" aria-live="polite"></output><div class="keypad">${'123456789*0#'.split('').map(n=>button(n,'digit','key')).join('')}</div>${button('删除','erase','row link')}`:empty(tab==='语音留言'?'暂无语音留言':tab==='最近通话'?'暂无通话记录':'暂无联系人')}${tab==='最近通话'?d.calls.map(c=>`<div class="row">${e(c.name)} <small>${e(c.time)}</small></div>`).join(''):tab==='语音留言'?d.voicemails.map(v=>`<div class="row">${e(v.name)}<p>${e(v.text)}</p></div>`).join(''):''}</div>`;
 if(['youtube','redbook','taobao','agoda'].includes(d.id)){
  if(tab&&tab!==d.tabs[0])return `<div class="scroll">${empty('暂无'+tab+'内容')}</div>`;
  return `<div class="scroll">${search(d)}${d.id==='agoda'?`<div class="booking"><label>${e(d.dateLabel)}<input type="date" aria-label="入住日期"><input type="date" aria-label="退房日期"></label><label>${e(d.guestsLabel)}<input type="number" aria-label="入住人数" min="1" value="1"></label></div>`:''}${d.categories?`<div class="categories">${d.categories.map(c=>button(c,'category')).join('')}</div>`:''}${d.sectionTitle?`<h2>${e(d.sectionTitle)}</h2>`:''}${cards(d)}</div>`;
 }
 return `<div class="scroll">${empty(d.empty)}</div>`;
}
function renderMessages(){
 const thread=imessageData.items.find(item=>item.id===selectedMessageId);
 if(page==='chat'&&thread)return `${header(current,thread.sender)}<div class="messages sms-conversation">${thread.messages.map(m=>`<div class="sms-message"><small>${e(m.date)}</small><div class="bubble">${e(m.text)}</div></div>`).join('')}</div>${composer(current)}`;
 return `${header(current,'短信')}<div class="scroll">${imessageData.items.length?imessageData.items.map(thread=>`<button class="row sms-thread" data-sms-thread="${e(thread.id)}"><span class="sms-unread ${thread.unread?'is-unread':''}" aria-label="${thread.unread?'未读':'已读'}"></span><span><strong>${e(thread.sender)}</strong><p>${e(thread.preview)}</p></span><span>›</span></button>`).join(''):empty(current.empty)}</div>`;
}
function syncMessagesBadge(){document.querySelectorAll('[data-messages-badge]').forEach(b=>{b.hidden=!getMessagesUnread();});}
window.addEventListener('messages-updated',()=>{syncMessagesBadge();if(current?.id==='messages')render();});
function render(){const d=current;if(d.id!=='kkt'||page!=='chat')pauseKktStream();if(d.id!=='umetrip'||tab!=='动态')chapter1Alarm.onReminderHidden();if(d.id==='clock'){screen.className='app-clock page-alarms';screen.innerHTML=renderClock(e,d.alarms);return;}if(d.id==='threads'){screen.className='app-threads page-root';mountThreads(screen,e);return;}if(d.id==='calendar'){screen.className='app-calendar page-root';mountCalendar(screen,e);return;}if(d.id==='phone'&&tab==='最近通话'){screen.className='app-phone page-recents';screen.innerHTML=renderPhoneRecents(e,phoneRecentFilter);return;}if(d.id==='umetrip'){screen.className=`app-umetrip page-${tab==='动态'?'activity':'journey'}`;screen.innerHTML=renderUmetrip(e,tab==='动态'?'activity':'journey');if(tab==='动态'&&screen.querySelector('[data-flight-dynamic="chapter1_ke247"]'))chapter1Alarm.onReminderShown();return;}if(d.id==='agoda'){screen.className='app-agoda page-root';mountAgoda(screen,e);return;}if(d.id==='messages'){screen.className=`app-messages page-${page}`;screen.innerHTML=renderMessages();return;}if(d.id==='taobao'){screen.className='app-taobao page-root';mountTaobao(screen,e);return;}if(d.id==='redbook'){screen.innerHTML=renderRedbook(d,e);screen.className='app-redbook page-root';mountRedbookMasonry(screen);screen.querySelector('header button')?.focus({preventScroll:true});return;}if(d.id==='youtube'){screen.innerHTML=renderYouTube(d,e);screen.className='app-youtube page-root';screen.querySelector('header button')?.focus({preventScroll:true});return;}if(d.id==='kkt'){screen.innerHTML=renderKkt(d,page,e);screen.className=`app-kkt page-${page}`;mountKktModals(e);mountKktStream(d,page,e,screen);screen.querySelector('header button')?.focus({preventScroll:true});return;}const title=page==='chat'?d.detailTitle:page==='moments'?'朋友圈':page==='detail'?d.detailTitle:tab||d.title;screen.innerHTML=header(d,title)+body(d)+tabs(d);screen.className=`app-${d.id} page-${page}`;screen.querySelector('header button')?.focus({preventScroll:true});}
screen.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b||b.disabled)return;if(current?.id==='phone'&&['all','missed'].includes(b.dataset.phoneFilter)){phoneRecentFilter=b.dataset.phoneFilter;render();return;}if(b.dataset.smsThread){selectedMessageId=b.dataset.smsThread;page='chat';markMessagesRead(selectedMessageId);render();return;}if(b.dataset.tab){tab=b.dataset.tab;page='root';render();return;}if(b.dataset.note!==undefined){selectedItem=Number(b.dataset.note);page='detail';render();return;}if(b.dataset.item!==undefined){selectedItem=Number(b.dataset.item);page='detail';render();return;}switch(b.dataset.action){case 'home':returnHome();break;case 'back':page='root';render();break;case 'detail':if(current.id==='notes')selectedItem=-1;page=['kkt','wechat','messages'].includes(current.id)?'chat':'detail';render();break;case 'moments':page='moments';render();break;case 'category':screen.querySelector('.search').value=b.textContent;break;case 'digit':screen.querySelector('output').textContent+=b.textContent;break;case 'erase':{const o=screen.querySelector('output');o.textContent=o.textContent.slice(0,-1);break;}}});
// 剧情网页不接受自由回复；即使手动提交表单，也不创建消息或评论。
screen.addEventListener('submit',ev=>{ev.preventDefault();});
screen.addEventListener('input',ev=>{if(ev.target.matches('.note-editor')){if(current.items[selectedItem])current.items[selectedItem].text=ev.target.value;else current.noteText=ev.target.value;}});
mountStatusBar(document.querySelector('#status-bar'));mountChapter1Notice();mountChapter1Alarm();route();
