const symbols={
steps:'<path d="m14 4-3 5 4 3-2 8M11 9l-4 3-3-1M15 12l4 3 2-1M9 14l-4 6"/><circle cx="16" cy="3" r="2"/>',
heart:'<path d="M12 21 3.4 12.5a5.4 5.4 0 0 1 8.6-6.4 5.4 5.4 0 0 1 8.6 6.4Z"/>',
sleep:'<path d="M3 5v16M3 16h18v5M3 10h5v6M8 12h10a3 3 0 0 1 3 3v1H8Z"/>',
summary:'<path d="M4 18h3V9H4ZM10 18h3V4h-3ZM16 18h3v-6h-3Z"/>',
sharing:'<circle cx="8" cy="7" r="3"/><path d="M2 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m0 3a5 5 0 0 1 5 5v2"/>',
browse:'<path d="M9 5h12M9 12h12M9 19h12"/><circle cx="3" cy="5" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="19" r="1"/>',
cycle:'<path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/>'
};
const svg=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${symbols[name]}</svg>`;
export function renderHealthTabs(tab,e){return `<nav class="tabs health-tabs" aria-label="健康导航">${['摘要','共享','浏览'].map((label,i)=>`<button ${i===2?'disabled aria-disabled="true"':`data-tab="${e(label)}"`} aria-current="${tab===label?'page':'false'}">${svg(['summary','sharing','browse'][i])}<span>${label}</span></button>`).join('')}</nav>`;}
export function renderHealth(d,tab,e){
cycleConfig=d; cycleEscape=e;
if(tab==='共享')return `<div class="scroll health-scroll"><h2 class="health-section-label">健康共享</h2><div class="health-accounts">${d.accounts.map(a=>`<div class="health-account"><span class="health-account-avatar" aria-hidden="true">${e(a.initial)}</span><div><strong>${e(a.name)}</strong><p>${e(a.subtitle)}</p></div></div>`).join('')}</div></div>`;
return `<div class="scroll health-scroll"><div class="health-section-heading"><h2>个人收藏</h2><span>摘要</span></div><div class="health-metrics">${d.metrics.map(m=>`<article class="health-metric metric-${m.icon}" aria-label="${e(m.label)}"><div class="health-metric-label">${svg(m.icon)}<strong>${e(m.label)}</strong></div><p><b>${e(m.value)}</b><span>${e(m.unit)}</span>${m.extraValue?`<b>${e(m.extraValue)}</b><span>${e(m.extraUnit)}</span>`:''}</p></article>`).join('')}</div><section class="health-cycle">${renderCycle(d,e)}</section></div>`;
}
function monthCalendar(key,values,weekdays,e){
const [year,month]=key.split('-').map(Number),offset=new Date(year,month-1,1).getDay(),days=new Date(year,month,0).getDate();
return `<article class="health-month" data-month="${key}" aria-label="${year}年${month}月"><h3>${year}年${month}月</h3><div class="health-weekdays" aria-hidden="true">${weekdays.map(w=>`<span>${e(w)}</span>`).join('')}</div><div class="health-calendar-grid">${Array.from({length:offset},()=>'<span class="health-day-blank" aria-hidden="true"></span>').join('')}${Array.from({length:days},(_,i)=>{const day=i+1,o=values.omega.includes(day),a=values.alpha.includes(day),type=o&&a?'overlap':o?'omega':a?'alpha':'';return `<span class="health-day ${type}" data-day="${day}" aria-label="${year}年${month}月${day}日${o?'，Omega 发情期':''}${a?'，Alpha 易感期':''}">${day}</span>`;}).join('')}</div></article>`;
}

// 单月状态仅属于健康 App；切换不会重建整个摘要视图。
let selectedMonth = '2030-10';
let cycleConfig, cycleEscape;
function renderCycle(d,e) {
  const months = Object.keys(d.cycleData).sort();
  if (!months.includes(selectedMonth)) selectedMonth = months[0];
  const index = months.indexOf(selectedMonth);
  const [year, month] = selectedMonth.split('-').map(Number);
  return `<div class="health-section-heading health-cycle-heading"><h2>${svg('cycle')}${e(d.cycleTitle)}</h2><div class="health-month-switcher" role="group" aria-label="切换周期月份"><button type="button" data-health-month-step="-1" aria-label="上个月" ${index===0?'disabled':''}>&lt;</button><span aria-live="polite" aria-atomic="true">${year}年${month}月</span><button type="button" data-health-month-step="1" aria-label="下个月" ${index===months.length-1?'disabled':''}>&gt;</button></div></div><div class="health-legend">${d.legend.map(l=>`<div><i class="${l.type}"></i><span>${e(l.label)}<small>${e(l.name)}</small></span></div>`).join('')}</div><div class="health-months">${monthCalendar(selectedMonth,d.cycleData[selectedMonth],d.weekdays,e)}</div>`;
}
document.addEventListener('click',event=>{
  const button=event.target.closest('#app.app-health [data-health-month-step]');
  if(!button || button.disabled || !cycleConfig)return;
  const months=Object.keys(cycleConfig.cycleData).sort();
  const next=months.indexOf(selectedMonth)+Number(button.dataset.healthMonthStep);
  if(next<0 || next>=months.length)return;
  selectedMonth=months[next];
  const container=button.closest('.health-cycle');
  const direction=button.dataset.healthMonthStep;
  container.innerHTML=renderCycle(cycleConfig,cycleEscape);
  const focusTarget=container.querySelector(`[data-health-month-step="${direction}"]:not(:disabled)`)
    ||container.querySelector('[data-health-month-step]:not(:disabled)');
  focusTarget?.focus({preventScroll:true});
});
