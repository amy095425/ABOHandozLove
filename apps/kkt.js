import {chapter2Flight} from '../state/chapter2Flight.js?v=chapter3-douban-1';
import {chapter2Kkt} from '../state/chapter2Kkt.js?v=chapter3-douban-1';
import {gameProgress} from '../state/gameProgress.js?v=chapter2-ending-1';
import {chapter1Kkt} from '../state/chapter1Kkt.js?v=chapter2-ending-1';
const paths = {
  friends: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M18 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 4v3"/>',
  chats: '<path d="M21 11c0 5-4 8-9 8H8l-5 3 1-6a8 8 0 0 1-2-5c0-5 4-8 10-8s9 3 9 8Z"/>',
  discover: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};
const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
const avatar=(person,e,cls='')=>`<img class="kkt-avatar ${cls}" src="${e(person.avatar)}" alt="${e(person.name)}的头像" width="40" height="40">`;
export function renderKktMessage(d,message,e) {
  const mine=message.mine??message.isMe??false;
  const person=mine?d.owner:d.friend;
  let content=e(message.text||'');
  if(message.type==='image') content=`<button type="button" class="kkt-image-open" data-kkt-modal="image" data-src="${e(message.src)}" aria-label="放大聊天图片"><img class="kkt-chat-image" src="${e(message.src)}" alt="聊天图片" loading="lazy"><span class="kkt-image-placeholder" hidden>图片暂未提供</span></button>`;
  if(message.type==='link') content=`<button type="button" class="kkt-link-card" data-kkt-modal="receipt"><strong>${e(message.text)}</strong><small>查看付款凭证 ›</small></button>`;
  return `<div class="kkt-message ${mine?'is-mine':'is-friend'}${message.type==='image'?' is-image':''}" aria-label="${e(person.name)}的消息" ${message.id?`data-kkt-message="${e(message.id)}"`:''}>${avatar(person,e)}<div class="kkt-message-content"><span class="kkt-sender">${e(person.name)}</span><div class="kkt-bubble-line"><div class="kkt-bubble">${content}</div>${message.time?`<time class="kkt-message-time">${e(message.time)}</time>`:''}</div></div></div>`;
}
export function renderKkt(d,page,e) {
  const agentChat=page==='agent-chat',inChat=page==='chat'||agentChat;
  const person=agentChat?(d.agent||d.friend):d.friend;
  const header=`<header class="kkt-header"><button data-action="${inChat?'back':'home'}">${inChat?'‹ 返回':'‹ 主屏幕'}</button><span>kakaotalk</span><span class="header-spacer"></span></header><div class="title-row"><h1>${e(inChat?person.name:'聊天')}</h1></div>`;
  if(inChat)return header+`<div class="messages kkt-messages" aria-label="与${e(person.name)}的聊天">${agentChat?renderAgentHistory({...d,friend:d.agent},e):renderKktHistory(d,e)}${agentChat?renderAgentTyping({...d,friend:d.agent},e):renderKktTyping(d,e)}</div><form class="composer kkt-composer"><span aria-hidden="true">＋</span><input aria-label="${e(d.input)}" placeholder="${e(d.input)}" autocomplete="off" disabled aria-disabled="true"><button type="submit" disabled aria-disabled="true">发送</button></form>`;
  const preview=(contact,latest,action)=>`<button class="kkt-chat-preview" data-action="${action}">${avatar(contact,e)}<span class="kkt-preview-copy"><strong>${e(contact.name)}</strong><small>${e(latest?.type==='image'?'[图片]':latest?.text||d.empty)}</small></span><time>${e(latest?.time||'')}</time></button>`;
  const brother=chapter2Kkt.getVisibleMessages().at(-1)||chapter1Kkt.getVisibleMessages().at(-1)||d.messages.at(-1);
  const agent=chapter1Kkt.state.agentPhase!=='idle';
  return header+`<div class="scroll kkt-chat-list"><input class="search" type="search" aria-label="${e(d.search)}" placeholder="${e(d.search)}">${agent?preview(d.agent,chapter1Kkt.getAgentMessages().at(-1)||{text:'Hanjin本人在吗？'},'agent-detail'):''}${preview(d.friend,brother,'detail')}</div><nav class="tabs kkt-tabs" aria-label="KakaoTalk导航">${d.tabs.map((label,i)=>`<button type="button" ${i===1?'data-tab="聊天" aria-current="page"':'disabled aria-disabled="true"'}>${svg(['friends','chats','discover','more'][i])}<span>${e(label)}</span></button>`).join('')}</nav>`;
}

export function renderKktHistory(d,e){
  let date='';
  return [...d.messages,...chapter1Kkt.getVisibleMessages(),...chapter2Kkt.getVisibleMessages()].map(message=>{
    const divider=message.date&&message.date!==date?`<div class="kkt-date-divider">${e(message.date)}</div>`:'';
    if(message.date)date=message.date;
    return divider+renderKktMessage(d,message,e);
  }).join('');
}

export function renderAgentHistory(d,e){return chapter1Kkt.getAgentMessages().map(m=>renderKktMessage(d,m,e)).join('');}
export function renderAgentTyping(d,e){const message=chapter1Kkt.getAgentTyping();if(!message)return '';return `<div class="kkt-typing" role="status" aria-label="${message.isMe?'ZHEN🐈‍⬛':'经纪人'}正在输入">${renderKktMessage(d,{isMe:message.isMe,text:'...'},e)}</div>`;}
export function renderKktTyping(d,e){const message=(gameProgress.getCurrentChapter()===2?chapter2Kkt:chapter1Kkt).getTyping();if(!message)return '';return `<div class="kkt-typing" role="status" aria-label="${message.isMe?'ZHEN🐈‍⬛':'哥哥🐕'}正在输入">${renderKktMessage(d,{mine:message.isMe,text:'...'},e)}</div>`;}
let unsubscribeStream;
export function pauseKktStream(){unsubscribeStream?.();unsubscribeStream=null;chapter1Kkt.leaveChat();chapter2Kkt.leaveChat();}
export function mountKktStream(d,page,e,root){
 unsubscribeStream?.();unsubscribeStream=null;chapter1Kkt.leaveChat();chapter2Kkt.leaveChat();const agent=page==='agent-chat',story=!agent&&gameProgress.getCurrentChapter()===2?chapter2Kkt:chapter1Kkt;if(page!=='chat'&&!agent){chapter1Kkt.leaveChat();return;}
 d=agent?{...d,friend:d.agent}:d;
 let rendered=agent?story.state.agentVisibleCount:story.state.visibleCount;
 unsubscribeStream=story.subscribe(()=>{if(!root.classList.contains('app-kkt')||!root.classList.contains('page-'+page))return;const box=root.querySelector('.kkt-messages');if(!box)return;box.querySelector('.kkt-typing')?.remove();const messages=agent?chapter1Kkt.getAgentMessages():story.getVisibleMessages();if(messages.length>rendered){if(rendered===0)box.insertAdjacentHTML('beforeend',`<div class="kkt-date-divider">${e(messages[0].date)}</div>`);box.insertAdjacentHTML('beforeend',messages.slice(rendered).map(m=>renderKktMessage(d,m,e)).join(''));rendered=messages.length;}if(!agent&&story===chapter2Kkt&&story.state.phase==='complete')chapter2Flight.onChatRendered(messages.at(-1)?.id);box.insertAdjacentHTML('beforeend',(agent?renderAgentTyping(d,e):renderKktTyping(d,e)));requestAnimationFrame(()=>{if(root.classList.contains('app-kkt')&&root.classList.contains('page-'+page))box.scrollTo({top:box.scrollHeight,behavior:'smooth'});});});
 if(!agent&&story===chapter2Kkt&&story.state.phase==='complete')chapter2Flight.onChatRendered(story.getVisibleMessages().at(-1)?.id);
 (agent?chapter1Kkt.enterAgentChat():story.enterChat());requestAnimationFrame(()=>{if(root.classList.contains('app-kkt')&&root.classList.contains('page-'+page)){const box=root.querySelector('.kkt-messages');box.scrollTop=box.scrollHeight;}});
}
