import {agodaTask} from '../state/agodaTask.js?v=chapter2-ending-1';
import {agodaStore as store,formatAgodaDate,agodaRegions} from './agodaStore.js?v=chapter2-ending-1';
import {agodaGuests,agodaPaymentMethods} from '../data/agodaBookingData.js?v=agoda-booking-1';
import {renderPayment,mountSignature,disposeSignature} from './taobaoPayment.js?v=modal-headers-1';
import {insertMessage} from '../data/messageStore.js?v=chapter2-ending-1';
import {showNotification} from '../components/notifications.js?v=taobao-payment-1';
const state=store.state,amount=c=>(c/100).toFixed(2);
let root,e,timer,noticeTimer,success='',draft,occupancy;
const button=(name,label,extra='',cls='')=>`<button type="button" data-ag-action="${name}" class="${cls}" ${extra}>${label}</button>`;
const dates=(start=state.checkIn,end=state.checkOut)=>`${formatAgodaDate(start)} - ${formatAgodaDate(end)}`;
function top(){return `<header class="ag-header"><button data-action="home">‹ 主屏幕</button><h1>agoda<span>●●●●●</span></h1><span></span></header>`;}
function tabs(){return `<nav class="tabs ag-tabs" aria-label="Agoda导航">${[['explore','探索','⌕'],['regions','地区','▦'],['orders','订单','▤'],['account','账户','○']].map(([id,label,glyph])=>button('tab',`<span aria-hidden="true">${glyph}</span>${label}`,`data-tab-id="${id}" aria-current="${state.activeTab===id?'page':'false'}" ${id==='account'?'disabled':''}`)).join('')}</nav>`;}
function bookingBar(){return `<div class="ag-booking-bar">${button('dates',`<small>入住和退房日期</small><strong>${dates()}</strong><span>更改 ›</span>`,'','ag-date-bar')}${button('occupancy',`预计入住人数：${state.adults}大人，${state.children}小孩 <span>更改 ›</span>`,'','ag-occupancy-bar')}</div>`;}
function hotelCards(list){return `<div class="ag-hotels">${list.map(h=>button('hotel',`<div class="ag-hotel-placeholder" style="background-color:${h.color}" aria-hidden="true"></div><span class="ag-hotel-copy"><small>${e(h.region)}</small><strong>${e(h.name)}</strong><span class="ag-stars" aria-label="${h.stars}星">${'★'.repeat(h.stars)}</span><span class="ag-rating">${h.rating.toFixed(1)} <small>评分</small></span><small class="ag-base-price">基础价 ¥ ${Math.min(...h.rooms.map(r=>r.price))} 起</small><span class="ag-price">¥ ${amount(Math.min(...h.rooms.map(r=>r.priceCents)))} <small>起 / 晚</small></span></span>`,`data-hotel="${h.id}"`,'ag-hotel')).join('')}</div>`;}
function results(){
 if(state.activeTab==='regions'&&!state.region&&!state.searchQuery.trim())return `<h2>按地区探索</h2><div class="ag-region-grid">${agodaRegions.map(region=>button('region',`<strong>${e(region)}</strong><small>${state.hotels.filter(h=>h.region===region).length} 家酒店</small>`,`data-region="${e(region)}"`)).join('')}</div>`;
 const list=store.filteredHotels();return `${state.activeTab==='regions'&&state.region?button('regions-back','‹ 全部地区','','ag-regions-back'):''}<h2>${e(state.searchQuery.trim()?'搜索结果':state.region||'热门酒店')} <small>${list.length} 家酒店</small></h2>${list.length?hotelCards(list):'<p class="ag-empty">暂无符合条件的酒店</p>'}`;
}
function hotels(){return `${bookingBar()}<div class="ag-search-wrap"><input type="search" data-ag-search aria-label="搜索酒店或地区" placeholder="搜索酒店或地区，如上海" value="${e(state.searchQuery)}" autocomplete="off"></div><div class="ag-scroll" data-ag-results>${results()}</div>`;}
function orders(){return `<div class="ag-scroll"><h2>我的订单</h2>${state.orders.length?state.orders.map(o=>`<article class="ag-order"><header><b>${e(o.hotelName)}</b><span class="${o.status==='已结束'?'ag-order-ended':''}">${e(o.status)}</span></header><p>${e(o.roomName)}</p><p>${dates(o.checkIn,o.checkOut)} · ${o.nights}晚</p>${o.adults!==undefined?`<p>预计入住人数：${o.adults}大人，${o.children}小孩</p>`:''}${o.guests?.length?`<p>入住人：${o.guests.map(g=>e(g.name)).join('、')}</p>`:''}<small>${e(o.orderId)}${o.date?' · '+e(o.date):''}</small>${o.bankCard?`<p>${e(o.paymentMethod)} · ${e(o.bankCard.name)}（${e(o.bankCard.number.slice(-4))}）</p>`:''}<strong>实付款 ¥ ${amount(o.totalCents)}</strong></article>`).join(''):'<p class="ag-empty">暂无预订订单</p>'}</div>`;}
function dateFields(key,label){const [y,m,d]=draft[key].split('-').map(Number),days=new Date(Date.UTC(y,m,0)).getUTCDate();const select=(part,values,value,suffix)=>`<select data-ag-date="${key}" data-part="${part}" aria-label="${label}${suffix}">${values.map(n=>`<option value="${n}" ${n===value?'selected':''}>${n}${suffix}</option>`).join('')}</select>`;return `<fieldset class="ag-date-fields"><legend>${label}</legend>${select('year',Array.from({length:15},(_,i)=>2026+i),y,'年')}${select('month',Array.from({length:12},(_,i)=>i+1),m,'月')}${select('day',Array.from({length:days},(_,i)=>i+1),d,'日')}</fieldset>`;}
function modal(){
 let title='',body='';
 if(state.modal==='occupancy'){title='预计入住人数';body=`${[['adults','大人',1],['children','小孩',0]].map(([key,label,min])=>`<div class="ag-occupancy-row"><strong>${label}</strong><div class="ag-occupancy-stepper">${button('occupancy-minus','−',`data-count="${key}" aria-label="减少${label}" ${occupancy[key]<=min?'disabled':''}`)}<output aria-label="${label}人数">${occupancy[key]}</output>${button('occupancy-plus','+',`data-count="${key}" aria-label="增加${label}" ${occupancy[key]>=10?'disabled':''}`)}</div></div>`).join('')}${button('occupancy-apply','确认人数','','ag-primary')}`;}

 if(state.modal==='dates'){title='选择日期';body=`${dateFields('start','入住')}${dateFields('end','退房')}<p class="ag-error" role="alert">${e(state.error)}</p>${button('dates-apply','确认日期','','ag-primary')}`;}
 if(state.modal==='hotel'){const h=state.hotels.find(h=>h.id===state.hotelId);title=h.name;body=`<p class="ag-modal-caption">${e(h.region)} · ${'★'.repeat(h.stars)} · ${h.rating.toFixed(1)}分</p><h3>精选房型</h3>${[...h.rooms].sort((a,b)=>b.priceCents-a.priceCents).slice(0,3).map(r=>`<div class="ag-room"><div><strong>${e(r.name)}</strong><p>¥ ${amount(r.priceCents)} <small>/ 晚</small></p></div>${button('room','选择',`data-room="${r.index}"`,'ag-primary')}</div>`).join('')}`;}
 if(state.modal==='confirm'){const b=state.booking;title='确认预订';body=`<h3>${e(b.hotelName)}</h3><p>${e(b.roomName)}</p><p>预计入住人数：${b.adults}大人，${b.children}小孩</p><div class="ag-booking-summary"><p>${dates(b.checkIn,b.checkOut)}</p><p>¥ ${amount(b.priceCents)} / 晚 × ${b.nights}晚</p><strong>总金额 ¥ ${amount(b.totalCents)}</strong></div><fieldset class="ag-guests"><legend>选择入住人（可多选）</legend>${agodaGuests.map(g=>`<label><input type="checkbox" data-ag-guest="${g.id}" ${b.guestIds.includes(g.id)?'checked':''}><span><b>${e(g.name)} · ${g.gender}</b><small>${g.documentLabel}：${e(g.document)}</small><small>手机号：${e(g.phone)}</small></span></label>`).join('')}</fieldset><label class="ag-method">支付方式<select data-ag-method aria-label="支付方式">${agodaPaymentMethods.map(m=>`<option ${b.paymentMethod===m?'selected':''}>${m}</option>`).join('')}</select></label><p class="ag-error" role="alert">${e(state.error)}</p><p class="ag-countdown" data-ag-countdown aria-live="polite"></p><p class="ag-urgency" data-ag-urgency hidden>当前房型热门，请尽快下单，以免床位缺失！</p>${button('pay','立刻支付','','ag-primary')}`;}
 return `<div class="ag-backdrop" ${state.payment?'inert':''}><section class="ag-modal" role="dialog" aria-modal="true" aria-label="${e(title)}"><header class="modal-header"><h2>${e(title)}</h2>${button('close','关闭','','modal-close')}</header><div class="ag-modal-scroll">${body}</div></section></div>`;
}
function tick(){const count=root?.querySelector('[data-ag-countdown]'),warning=root?.querySelector('[data-ag-urgency]');if(!count||!warning)return;const seconds=store.remaining();count.textContent=seconds?`请在 ${seconds} 秒内完成下单`:'';warning.hidden=seconds>0;}
function render(){
 clearInterval(timer);disposeSignature();
 root.innerHTML=`<div class="ag-base" ${state.modal||state.payment?'inert':''}>${top()}${state.activeTab==='orders'?orders():hotels()}${tabs()}</div>${state.modal?modal():''}${renderPayment(state,e)}${success?`<div class="ag-success" role="status"><b>✓</b>${e(success)}</div>`:''}`;
 if(state.modal==='confirm'&&!state.payment){tick();timer=setInterval(tick,1000);}
 if(state.payment?.stage==='password')root.querySelector('[data-tb-password]')?.focus({preventScroll:true});
 if(state.payment?.stage==='signature')mountSignature(root,store);
}
function refresh(){const positions=[...root.querySelectorAll('.ag-scroll,.ag-modal-scroll')].map(el=>el.scrollTop);render();root.querySelectorAll('.ag-scroll,.ag-modal-scroll').forEach((el,i)=>el.scrollTop=positions[i]||0);}
function verify(){const input=root.querySelector('[data-tb-password]');if(!input||state.payment?.stage!=='password')return;if(!/^\d{6}$/.test(input.value)){root.querySelector('.tb-password-error').textContent='请输入6位数字密码';return;}const passed=store.verifyPassword(input.value);input.value='';if(passed)refresh();else{root.querySelector('.tb-password-error').textContent=state.payment.error;input.focus({preventScroll:true});}}
function paymentAction(name,b){
 if(name==='payment-cancel'){store.cancelPayment();refresh();return;}
 if(name==='card-select'){if(store.selectCard(b.dataset.bank))refresh();return;}
 if(name==='password-confirm'){verify();return;}
 if(name==='signature-clear'){root.querySelector('[data-tb-signature]')?.clearSignature();return;}
 if(name==='signature-confirm'&&state.payment?.stage==='signature'){
  if(!state.payment.signed){root.querySelector('[data-tb-signature-hint]').textContent='请先在画板上签名';return;}
  const order=store.pay(root.querySelector('[data-tb-signature]').toDataURL('image/png'));if(!order)return;
  success='支付成功';refresh();clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{success='';if(root.classList.contains('app-agoda'))root.querySelector('.ag-success')?.remove();},4500);
  const text=`【招商银行】您尾号0105的招行信用卡消费${amount(order.totalCents)}人民币。企微人工服务callmyname.cn/247 。`;
  insertMessage({sender:'+86 95555',text});showNotification({title:'招商银行',body:text});
  agodaTask.checkPaidOrder(order);
 }
}
const mounted=new WeakSet();
export function mountAgoda(element,escapeHTML){root=element;e=escapeHTML;success='';clearTimeout(noticeTimer);store.close();store.enterExplore();render();if(mounted.has(root))return;mounted.add(root);
 root.addEventListener('click',ev=>{if(!root.classList.contains('app-agoda'))return;const b=ev.target.closest('[data-ag-action],[data-tb-action]');if(!b||b.disabled)return;if(b.dataset.tbAction){paymentAction(b.dataset.tbAction,b);return;}switch(b.dataset.agAction){
 case 'tab':if(b.dataset.tabId==='regions'){store.close();state.activeTab='regions';state.region=null;state.searchQuery='';}else if(b.dataset.tabId==='orders'){store.close();state.activeTab='orders';}else if(b.dataset.tabId==='explore'&&state.activeTab!=='explore'){store.close();store.enterExplore();}refresh();return;
 case 'region':store.selectRegion(b.dataset.region);refresh();return;
 case 'regions-back':state.region=null;state.searchQuery='';refresh();return;
 case 'occupancy':occupancy={adults:state.adults,children:state.children};state.modal='occupancy';refresh();return;
 case 'occupancy-minus':case 'occupancy-plus':{const key=b.dataset.count;if(!['adults','children'].includes(key))return;occupancy[key]=Math.max(key==='adults'?1:0,Math.min(10,occupancy[key]+(b.dataset.agAction==='occupancy-plus'?1:-1)));refresh();return;}
 case 'occupancy-apply':store.setOccupancy(occupancy.adults,occupancy.children);state.modal=null;refresh();return;
 case 'dates':draft={start:state.checkIn,end:state.checkOut};state.modal='dates';state.error='';refresh();return;
 case 'dates-apply':if(store.setDates(draft.start,draft.end))state.modal=null;refresh();return;
 case 'hotel':store.openHotel(Number(b.dataset.hotel));refresh();return;
 case 'room':store.selectRoom(Number(b.dataset.room));refresh();return;
 case 'pay':store.beginPayment();refresh();return;
 case 'close':store.close();refresh();return;
 }});
 root.addEventListener('change',ev=>{if(!root.classList.contains('app-agoda'))return;const el=ev.target;if(el.dataset.agDate){const key=el.dataset.agDate,parts=draft[key].split('-').map(Number),index={year:0,month:1,day:2}[el.dataset.part];parts[index]=Number(el.value);parts[2]=Math.min(parts[2],new Date(Date.UTC(parts[0],parts[1],0)).getUTCDate());draft[key]=`${parts[0]}-${String(parts[1]).padStart(2,'0')}-${String(parts[2]).padStart(2,'0')}`;refresh();}else if(el.dataset.agGuest){store.toggleGuest(el.dataset.agGuest,el.checked);const error=root.querySelector('.ag-error');if(error)error.textContent='';}else if(el.hasAttribute('data-ag-method'))store.setMethod(el.value);});
 root.addEventListener('input',ev=>{if(!root.classList.contains('app-agoda'))return;if(ev.target.matches('[data-ag-search]')){state.searchQuery=ev.target.value;const content=root.querySelector('[data-ag-results]');content.innerHTML=results();content.scrollTop=0;return;}if(!ev.target.matches('[data-tb-password]'))return;ev.target.value=ev.target.value.replace(/\D/g,'').slice(0,6);if(ev.target.value.length===6)verify();});
}
globalThis.addEventListener?.('hashchange',()=>{if(location.hash!=='#agoda'){clearInterval(timer);disposeSignature();}});
document.addEventListener('keydown',ev=>{if(ev.key!=='Escape'||!root?.classList.contains('app-agoda')||(!state.modal&&!state.payment))return;ev.preventDefault();ev.stopImmediatePropagation();if(state.payment)store.cancelPayment();else store.close();refresh();},true);
