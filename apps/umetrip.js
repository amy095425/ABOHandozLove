import {flightHistory,flightSummary,flightDynamics,flightCopy as copy} from '../data/umetrip.js?v=umetrip-dynamics-1';
const paths={
 tower:'<path d="M12 3v18M8 21h8M8 17l4-7 4 7M7 6a7 7 0 0 0 0 9M17 6a7 7 0 0 1 0 9M4 3a11 11 0 0 0 0 15M20 3a11 11 0 0 1 0 15"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
 home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
 journey:'<rect x="4" y="6" width="16" height="15" rx="3"/><path d="M9 6V3h6v3M8 10v7M16 10v7M8 23v-2M16 23v-2"/>',
 experience:'<path d="M4 4h16v13H4zM8 21l4-4 4 4M8 8h8M8 12h5"/>',
 activity:'<path d="M21 11a9 8 0 0 1-9 8H7l-4 3 1-7a8 8 0 0 1-1-4 9 8 0 0 1 18 0Z"/><path d="M8 11h8"/>',
 me:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>'
};
const svg=key=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[key]}</svg>`;
function renderJourney(e){
 const list=[...flightHistory].sort((a,b)=>b.date.localeCompare(a.date));
 return `<header class="flight-header"><span>${e(copy.upcoming)}</span><strong aria-current="page">${e(copy.finished)}</strong><span>${e(copy.family)}</span><span aria-label="${e(copy.more)}">···</span></header>
 <nav class="flight-types" aria-label="行程类型">${copy.categories.map((name,i)=>`<span ${i===0?'aria-current="page"':''}>${e(name)}</span>`).join('')}</nav>
 <div class="flight-scroll"><section class="flight-stats" aria-label="航行统计"><div class="flight-stats-grid">${flightSummary.map(s=>`<div class="flight-stat ${s.color}">${svg(s.icon)}<strong>${e(s.value)}</strong><small>${e(s.label)}</small></div>`).join('')}</div><p>${e(copy.insights)}</p></section>
 <section class="flight-history" aria-label="历史行程"><div class="flight-section-title"><h1>${e(copy.history)}</h1><div><span>${e(copy.tags)}⌄</span><span>${e(copy.filter)}⌄</span></div></div>
 <ol class="flight-timeline">${list.map(f=>{const [departure,arrival]=f.time.split(' - ');return `<li class="flight-entry" data-flight-date="${f.date}"><div class="flight-date"><time datetime="${f.date}">${e(f.date.slice(5))}</time><small>${e(f.year)}</small><i aria-hidden="true"></i></div><article class="flight-card"><header><div class="flight-airline"><span class="flight-airline-logo ${f.color}" aria-hidden="true">${f.color==='blue'?'KE':'MU'}</span><span>${e(f.airline)} <small>${e(f.flightNo)}</small></span></div><span class="flight-review">${e(copy.review)}</span></header><div class="flight-route"><div><time>${e(departure)}</time><i aria-hidden="true"></i><strong>${e(f.from)}</strong></div><div><time>${e(arrival)}</time><i aria-hidden="true"></i><strong>${e(f.to)}</strong></div></div></article></li>`;}).join('')}</ol></section></div>
 `;
}
const plane = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-7 8 5 7-2 2-7-5-5 5-2-1 4-7-4-3 2-2 5 2 9-8Z" fill="currentColor"/></svg>';
export function renderFlightDynamics(e,items=flightDynamics){
 if(!items.length)return `<header class="flight-dynamics-header"><h1>动态</h1></header><div class="flight-dynamics-scroll flight-dynamics-empty" role="status"><div class="flight-empty-icon">${svg('activity')}</div><p>暂无最新动态</p></div>`;
 return `<header class="flight-dynamics-header"><h1>动态</h1></header><div class="flight-dynamics-scroll">${items.map(item=>{
  const link=String(item.link||'#'),validLink=link!=='#'&&/^(https?:\/\/|#|\.\.?\/|\/)/.test(link);
  return `<article class="flight-dynamic-card" data-flight-dynamic="${e(item.id)}"><header><span class="flight-dynamic-icon">${plane}</span><strong>行程</strong><time>${e(item.time)}</time></header><h2>${e(item.title)}</h2><p>${e(item.content)}</p><a class="flight-dynamic-footer" ${validLink?`href="${e(link)}"`:'aria-disabled="true"'}><strong>查看详情</strong><span aria-hidden="true">&gt;</span></a></article>`;
 }).join('')}</div>`;
}
function navigation(e,activeTab){return `<nav class="tabs flight-tabs" aria-label="航旅纵横导航">${[['home','首页'],['journey','行程'],['experience','经验'],['activity','动态'],['me','我']].map(([id,label])=>{const enabled=['journey','activity'].includes(id);return `<button type="button" ${enabled?`data-tab="${e(label)}"`:'disabled aria-disabled="true"'} ${activeTab===id?'aria-current="page"':''}>${svg(id)}<span>${e(label)}</span></button>`;}).join('')}</nav>`;}
export function renderUmetrip(e,activeTab='journey'){
 const selected=activeTab==='activity'?'activity':'journey';
 return '<div class="flight-home-nav"><button type="button" data-action="home" aria-label="返回主屏幕">‹ 主屏幕</button></div>'+(selected==='activity'?renderFlightDynamics(e):renderJourney(e))+navigation(e,selected);
}
