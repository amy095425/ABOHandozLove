import {gameProgress} from '../state/gameProgress.js?v=chapter1-payment-fix-2';
import {calendarConfig,chapterDates} from '../data/calendar.js?v=calendar-chapters-1';
import {createCalendarModel,minCalendarMonth,maxCalendarMonth,dateString} from './calendarModel.js?v=calendar-chapters-1';
const model=createCalendarModel();let root,e,modal=null,unsubscribe,start=null,suppressClickUntil=0;
const titles=['','第一章','第二章','第三章'];
const button=(action,text,extra='',cls='')=>`<button type="button" class="${cls}" data-cal-action="${action}" ${extra}>${text}</button>`;
function dialog(){if(!modal)return '';const confirmation=modal.kind==='confirm';return `<div class="calendar-modal-backdrop"><section class="calendar-modal" role="dialog" aria-modal="true" aria-labelledby="calendar-modal-title"><span class="calendar-modal-symbol" aria-hidden="true">${confirmation?'✦':'○'}</span><h2 id="calendar-modal-title">${confirmation?'发现新章节：'+titles[modal.chapter]:modal.title||'提示'}</h2><p>${e(confirmation?'是否进入？':modal.text)}</p><footer>${confirmation?button('cancel','暂不进入'):' '}${button(confirmation?'confirm':'cancel',confirmation?'确认进入':'我知道了','','calendar-confirm')}</footer></section></div>`;}
function render(){
 const {year,month,offset,days}=model.monthGrid(),selected=model.state.selectedDate;
 root.innerHTML=`<div class="calendar-base" ${modal?'inert':''}><header class="calendar-toolbar"><button type="button" data-action="home">‹ 主屏幕</button><span>日历</span>${button('today','今天')}</header><div class="calendar-scroll"><section class="calendar-month"><div class="calendar-heading"><h1>${year}年${month}月</h1><div>${button('previous','‹',`aria-label="上个月" ${model.state.month===minCalendarMonth?'disabled':''}`)}${button('next','›',`aria-label="下个月" ${model.state.month===maxCalendarMonth?'disabled':''}`)}</div></div><div class="calendar-month-selectors"><label><span class="calendar-sr-only">选择年份</span><select data-cal-year aria-label="选择年份">${Array.from({length:11},(_,i)=>2030+i).map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}年</option>`).join('')}</select></label><label><span class="calendar-sr-only">选择月份</span><select data-cal-month aria-label="选择月份">${Array.from({length:12},(_,i)=>i+1).map(m=>`<option value="${m}" ${m===month?'selected':''}>${m}月</option>`).join('')}</select></label></div><div class="calendar-weekdays" aria-hidden="true">${calendarConfig.weekdays.map(day=>`<span>${day}</span>`).join('')}</div><div class="calendar-grid" role="group" aria-label="${year}年${month}月日期">${'<span class="calendar-blank" aria-hidden="true"></span>'.repeat(offset)}${Array.from({length:days},(_,i)=>{const day=i+1,date=dateString(year,month,day),chapter=chapterDates.find(c=>c.date===date);return button('date',`<span>${day}</span>${chapter?'<i aria-hidden="true"></i>':''}`,`data-date="${date}" aria-label="${year}年${month}月${day}日${chapter?'，'+chapter.title:''}" aria-pressed="${selected===date}" ${selected===date?'aria-current="date"':''}`,'calendar-day'+(chapter?' has-chapter':''));}).join('')}</div></section><section class="calendar-selection"><div><small>已选日期</small><strong>${selected.replace(/^(\d+)-(\d+)-(\d+)$/,(_,y,m,d)=>`${y}年${Number(m)}月${Number(d)}日`)}</strong></div><span>当前：${titles[gameProgress.getCurrentChapter()]}</span></section><p class="calendar-legend"><i></i> 章节事件</p></div></div>${dialog()}`;
 if(modal)root.querySelector('.calendar-confirm')?.focus({preventScroll:true});
}
function openChapter(chapter){const action=gameProgress.getChapterAction(chapter);if(action==='available')modal={kind:'confirm',chapter};else if(action==='current')modal={kind:'info',text:'您已在当前章节中。'};else if(action==='completed')modal={kind:'info',text:`${titles[chapter]}已完成。`};else modal={kind:'info',title:'暂不可用',text:'当前日期暂无可触发的事件（或前置任务未完成）'};render();}
const mounted=new WeakSet();
export function mountCalendar(element,escapeHTML){
 root=element;e=escapeHTML;modal=null;model.today();unsubscribe?.();unsubscribe=gameProgress.subscribe(()=>{if(root.classList.contains('app-calendar'))render();});render();if(mounted.has(root))return;mounted.add(root);
 root.addEventListener('click',event=>{if(!root.classList.contains('app-calendar'))return;const b=event.target.closest('[data-cal-action]');if(!b||b.disabled)return;
 switch(b.dataset.calAction){
 case 'previous':model.moveMonth(-1);render();break;
 case 'next':model.moveMonth(1);render();break;
 case 'today':model.today();render();break;
 case 'date':{if(Date.now()<suppressClickUntil)return;const date=b.dataset.date;if(!model.selectDate(date))return;const chapter=chapterDates.find(c=>c.date===date);if(chapter)openChapter(chapter.chapter);else render();break;}
 case 'cancel':modal=null;render();break;
 case 'confirm':{if(modal?.kind!=='confirm')return;const chapter=modal.chapter;if(gameProgress.enterChapter(chapter)){modal=null;render();}else openChapter(chapter);break;}
 }
 });
 root.addEventListener('change',event=>{if(!root.classList.contains('app-calendar')||modal)return;const el=event.target,{year,month}=model.monthGrid();if(el.hasAttribute('data-cal-year'))model.setMonth(Number(el.value)*12+month-1);else if(el.hasAttribute('data-cal-month'))model.setMonth(year*12+Number(el.value)-1);else return;render();});
 root.addEventListener('pointerdown',event=>{if(!root.classList.contains('app-calendar')||modal||!event.target.closest('.calendar-grid'))return;start={x:event.clientX,y:event.clientY,id:event.pointerId};});
 root.addEventListener('pointerup',event=>{if(!root.classList.contains('app-calendar')||!start||start.id!==event.pointerId)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.3){suppressClickUntil=Date.now()+400;model.moveMonth(dx<0?1:-1);render();}});
 root.addEventListener('pointercancel',()=>{start=null;});
}
globalThis.addEventListener?.('hashchange',()=>{if(location.hash!=='#calendar'){unsubscribe?.();unsubscribe=null;start=null;}});
document.addEventListener('keydown',event=>{if(!root?.classList.contains('app-calendar')||!modal)return;if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();modal=null;render();}else if(event.key==='Tab'){const buttons=[...root.querySelectorAll('.calendar-modal button')],first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}},true);
