import {callHistoryData} from '../data/callHistoryData.js?v=phone-recents-1';
const paths={
 favorites:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
 recents:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 contacts:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
 keypad:'<circle cx="5" cy="4" r="1.2"/><circle cx="12" cy="4" r="1.2"/><circle cx="19" cy="4" r="1.2"/><circle cx="5" cy="11" r="1.2"/><circle cx="12" cy="11" r="1.2"/><circle cx="19" cy="11" r="1.2"/><circle cx="5" cy="18" r="1.2"/><circle cx="12" cy="18" r="1.2"/><circle cx="19" cy="18" r="1.2"/>',
 voicemail:'<circle cx="5.5" cy="12" r="4.5"/><circle cx="18.5" cy="12" r="4.5"/><path d="M5.5 16.5h13"/>',
 video:'<rect x="2" y="5" width="13" height="14" rx="3"/><path d="m15 9 7-4v14l-7-4Z"/>',
 handset:'<path d="m4 3 4 1 2 5-3 2a16 16 0 0 0 6 6l2-3 5 2 1 4c-1 3-8 1-12-3S1 4 4 3Z"/>',
 outgoing:'<path d="M5 19 19 5M10 5h9v9"/>'
};
const svg=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
const dateKey=c=>{const [month,day]=c.date.match(/\d+/g).map(Number);return month*1000000+day*10000+Number(c.time.replace(':',''));};
export function renderPhoneTabs(tab,e){return `<nav class="tabs phone-tabs" aria-label="电话导航">${[['favorites','个人收藏'],['recents','最近通话'],['contacts','通讯录'],['keypad','拨号键盘'],['voicemail','语音留言']].map(([id,label])=>`<button type="button" ${id==='recents'?`data-tab="${e(label)}"`:'disabled aria-disabled="true"'} aria-current="${tab===label?'page':'false'}">${svg(id)}<span>${e(label)}</span></button>`).join('')}</nav>`;}
export function renderPhoneRecents(e,filter='all'){
 const records=[...callHistoryData].sort((a,b)=>dateKey(b)-dateKey(a)).filter(c=>filter!=='missed'||c.type==='missed');
 return `<header class="phone-topbar"><button type="button" data-action="home">‹ 主屏幕</button><span>电话</span><span></span></header><div class="phone-recents-heading"><h1>最近通话</h1><div class="phone-recents-filter" role="group" aria-label="通话筛选">${[['all','所有通话'],['missed','未接来电']].map(([id,label])=>`<button type="button" data-phone-filter="${id}" aria-pressed="${filter===id}">${e(label)}</button>`).join('')}</div></div><div class="phone-recents-scroll"><ol class="phone-recents-list" aria-label="最近通话记录">${records.map(c=>`<li class="phone-call ${c.type==='missed'?'is-missed':''}" data-call-id="${c.id}"><span class="phone-call-avatar" aria-hidden="true">${e(Array.from(c.name)[0])}</span><div class="phone-call-copy"><strong class="phone-call-name">${e(c.name)}${c.type==='outgoing'?`<span class="phone-call-outgoing" aria-label="呼出">${svg('outgoing')}</span>`:''}</strong><span class="phone-call-label">${svg(c.isFaceTime?'video':'handset')}${c.isFaceTime?'FaceTime 视频':'手机'}</span></div><div class="phone-call-when"><span class="phone-call-date">${e(c.date)}</span><time class="phone-call-time">${e(c.time)}</time></div><span class="phone-call-info" role="img" aria-label="通话信息">i</span></li>`).join('')}</ol></div>${renderPhoneTabs('最近通话',e)}`;
}
