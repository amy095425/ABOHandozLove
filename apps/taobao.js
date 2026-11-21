import {taobaoAddresses} from '../data/taobaoPaymentData.js?v=taobao-payment-1';
import {renderPayment,mountSignature,disposeSignature} from './taobaoPayment.js?v=agoda-booking-1';
import {insertMessage} from '../data/messageStore.js?v=taobao-payment-1';
import {showNotification} from '../components/notifications.js?v=taobao-payment-1';
import {taobaoStore as store,products,productById,categoryIndex,money} from './taobaoStore.js?v=taobao-payment-1';
import {taobaoCategories as categories} from '../data/taobaoConfig.js?v=taobao-shop-1';
const state=store.state;
const shuffled=[...products];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
let root,e,notice='',noticeTimer;
const paths={home:'<path d="m3 11 9-8 9 8v10h-6v-7H9v7H3Z"/>',category:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',cart:'<path d="M2 3h3l3 13h11l3-10H6"/><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>',orders:'<path d="M6 5h14v17H4V5ZM8 5V2h8v3M8 11h8M8 16h6"/>'};
const svg=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
const action=(name,text,extra='',cls='')=>`<button type="button" class="${cls}" data-tb-action="${name}" ${extra}>${text}</button>`;
function stepper(id,n,sheet=false){return `<div class="tb-stepper">${action(sheet?'sheet-minus':'minus','−',`data-product="${id}" aria-label="减少数量" ${sheet&&n<=1?'disabled':''}`)}<output aria-label="数量">${n}</output>${action(sheet?'sheet-plus':'plus','+',`data-product="${id}" aria-label="增加数量" ${n>=999?'disabled':''}`)}</div>`;}
// 列表与购买面板始终从购物车读取数量，不在商品行内另存状态。
function cartControl(id,inSheet=false){const n=store.getCartQuantity(id);return n?stepper(id,n):action(inSheet?'add':'quick-add','加入购物车',`data-product="${id}" aria-label="加入购物车：${e(productById.get(id).title)}"`,inSheet?'tb-yellow':'tb-quick-add');}
function cartControlSlot(id,inSheet=false){return `<div class="tb-cart-control" data-tb-cart-control="${id}" ${inSheet?'data-tb-sheet-cart':''} aria-label="购物车数量">${cartControl(id,inSheet)}</div>`;}
function sheetQuantity(){return store.getCartQuantity(state.sheet.productId)?'':`<span>购买数量</span>${stepper(state.sheet.productId,state.sheet.quantity,true)}`;}
function syncCartProduct(id){
 // 原地替换数量控件，保留列表节点、搜索输入和滚动位置。
 root.querySelectorAll(`[data-tb-cart-control="${id}"]`).forEach(el=>{el.innerHTML=cartControl(id,el.hasAttribute('data-tb-sheet-cart'));});
 const count=store.count(),badge=root.querySelector('[data-tb-cart-badge]');
 if(badge){badge.textContent=String(count);badge.hidden=!count;}
 if(state.sheet?.productId===id){state.sheet.quantity=store.getCartQuantity(id)||1;root.querySelector('[data-tb-sheet-quantity]').innerHTML=sheetQuantity();}
}
function card(p){return `<article class="tb-product-row" data-product-id="${p.id}"><button class="tb-product-title" data-tb-action="product" data-product="${p.id}"><h3>${e(p.title)}</h3></button><p class="tb-product-shop">店铺: ${e(p.shop)}</p><div class="tb-product-meta"><span class="tb-price">¥<strong>${e(p.price)}</strong></span><span class="tb-product-sales">销量 ${e(p.sales)}</span>${cartControlSlot(p.id)}</div></article>`;}
function productGrid(list){return `<div class="tb-product-list">${list.map(card).join('')}</div>`;}
export function findTaobaoProducts(query){const term=String(query).trim().toLocaleLowerCase();return term?products.filter(p=>p.title.toLocaleLowerCase().includes(term)).slice(0,8):[];}
const recommended=shuffled.slice(0,4);
function suggestionMarkup(){const matches=findTaobaoProducts(state.searchQuery);if(!state.searchOpen||!state.searchQuery.trim())return '';return `${matches.length?'':'<p class="tb-search-empty">暂无结果</p><div class="tb-search-recommend-label">你可能感兴趣的商品：</div>'}${(matches.length?matches:recommended).map(p=>action('product',e(p.title),`data-product="${p.id}" role="option"`,'tb-suggestion')).join('')}`;}
function searchBar(){const open=state.searchOpen&&!!state.searchQuery.trim();return `<div class="tb-search-wrap"><div class="tb-search"><span aria-hidden="true">⌕</span><input type="search" data-tb-search role="combobox" aria-label="搜索商品" aria-autocomplete="list" aria-controls="tb-search-suggestions" aria-expanded="${open}" placeholder="搜索商品" value="${e(state.searchQuery)}" autocomplete="off"></div><div id="tb-search-suggestions" class="tb-search-suggestions" role="listbox" aria-label="搜索建议" ${open?'':'hidden'}>${suggestionMarkup()}</div></div>`;}
function updateSuggestions(){const panel=root.querySelector('#tb-search-suggestions');const input=root.querySelector('[data-tb-search]');if(!panel||!input)return;const open=state.searchOpen&&!!state.searchQuery.trim();panel.innerHTML=suggestionMarkup();panel.hidden=!open;input.setAttribute('aria-expanded',String(open));}
function hideSuggestions(){state.searchOpen=false;updateSuggestions();}
function tabs(){const count=store.count();return `<nav class="tabs tb-tabs" aria-label="淘宝导航">${[['home','首页'],['category','分类'],['cart','购物车'],['orders','我的订单']].map(([id,label])=>`<button data-tb-action="tab" data-tb-tab="${id}" aria-current="${state.activeTab===id?'page':'false'}"><span class="tb-tab-icon">${svg(id)}${id==='cart'?`<b class="tb-badge" data-tb-cart-badge ${count?'':'hidden'}>${count}</b>`:''}</span><span>${label}</span></button>`).join('')}</nav>`;}
function empty(text){return `<div class="tb-empty"><span aria-hidden="true">🛍️</span><p>${text}</p></div>`;}
function cart(){
 const selected=state.cart.filter(x=>x.selected),all=state.cart.length>0&&selected.length===state.cart.length;
 return `<div class="tb-scroll">${state.cart.length?state.cart.map(line=>{const p=productById.get(line.productId);return `<article class="tb-cart-line"><input type="checkbox" data-tb-select="${p.id}" aria-label="选择${e(p.title)}" ${line.selected?'checked':''}><div class="tb-line-copy"><h3>${e(p.title)}</h3><small>${e(p.shop)}</small><div class="tb-line-bottom"><b>¥${e(p.price)}</b>${stepper(p.id,line.quantity)}</div>${action('remove','移除',`data-product="${p.id}"`,'tb-remove')}</div></article>`;}).join(''):empty('购物车空空如也')}</div><div class="tb-settlement"><label><input type="checkbox" data-tb-all aria-label="全选购物车商品" ${all?'checked':''} ${!state.cart.length?'disabled':''}>全选</label><span>合计 <strong>¥${money(store.total(selected))}</strong></span>${action('checkout',`去付款${selected.length?' ('+selected.reduce((n,x)=>n+x.quantity,0)+')':''}`,'','tb-primary')}</div>`;
}
function orders(){return `<div class="tb-scroll">${state.orders.length?state.orders.map(o=>`<article class="tb-order"><header><div><b>${e(o.orderId)}</b><small>${e(o.date)}</small></div><span class="${o.status==='已签收'?'tb-order-delivered':''}">${e(o.status||'待发货')}</span></header><div class="tb-order-items">${o.items.map(i=>`<p>${e(i.title)} <small>× ${i.quantity}</small></p>`).join('')}</div><p>共${o.items.reduce((n,i)=>n+i.quantity,0)}件商品</p><div class="tb-order-total">实付款：<strong>¥${money(o.totalCents)}</strong></div></article>`).join(''):empty('暂无订单')}</div>`;}
function checkout(){const c=state.checkout,recipient=taobaoAddresses.find(a=>a.id===state.addressId);return `<section class="tb-checkout" ${state.payment?'inert':''}><header class="tb-header">${action('checkout-back','‹ 返回')}<h2>确认订单</h2><span></span></header><div class="tb-scroll"><button type="button" class="tb-recipient" data-tb-action="address-open" aria-label="切换收货地址"><b>${e(recipient.name)}　${e(recipient.phone)}</b><p>${e(recipient.address)}</p><small>点击切换收货地址 ›</small></button>${c.items.map(i=>`<div class="tb-checkout-line"><div><h3>${e(i.title)}</h3><p>¥${e(i.price)}　× ${i.quantity}</p></div></div>`).join('')}<div class="tb-payment-method"><b>付款方式</b><p>银行卡支付</p></div><p class="tb-simulation">本地模拟订单，不产生实际扣款</p></div><div class="tb-settlement"><span>总金额 <strong>¥${money(c.totalCents)}</strong></span>${action('pay','确认付款','','tb-primary')}</div></section>`;}
function sheet(){const p=productById.get(state.sheet.productId);return `<div class="tb-sheet-backdrop" data-tb-action="sheet-close"><section class="tb-sheet" role="dialog" aria-modal="true" aria-label="购买商品"><div class="tb-sheet-scroll">${action('sheet-close','×','aria-label="关闭商品面板"','tb-sheet-close')}<h2>${e(p.title)}</h2><p class="tb-price">¥<strong>${e(p.price)}</strong></p><small>${e(p.shop)}</small><div class="tb-sheet-quantity" data-tb-sheet-quantity>${sheetQuantity()}</div></div><footer>${cartControlSlot(p.id,true)}${action('buy','立即购买','','tb-primary')}</footer></section></div>`;}
function view(){
 disposeSignature();
 const title={home:'淘宝',category:'分类',cart:'购物车',orders:'我的订单'}[state.activeTab];
 const header=`<header class="tb-header"><button data-action="home" aria-label="返回主屏幕">‹ 主屏幕</button><h1>${title}</h1><span></span></header>`;
 let body='';
 if(state.activeTab==='home')body=`${searchBar()}<div class="tb-scroll">${productGrid(shuffled)}</div>`;
 if(state.activeTab==='category')body=`<div class="tb-category-layout"><nav class="tb-category-nav" aria-label="商品分类">${categories.map((c,i)=>action('category',e(c.name),`data-category="${i}" aria-current="${state.category===i?'page':'false'}"`)).join('')}</nav><div class="tb-scroll"><h2 class="tb-category-title">${e(categories[state.category].name)} <small>20件商品</small></h2>${productGrid(products.filter(p=>categoryIndex(p)===state.category))}</div></div>`;
 if(state.activeTab==='cart')body=cart();if(state.activeTab==='orders')body=orders();
 root.innerHTML=`<div class="tb-base" ${state.sheet||state.checkout||state.payment?'inert':''}>${header}${body}${tabs()}</div>${state.sheet?sheet():''}${state.checkout?checkout():''}${renderPayment(state,e)}${notice?`<div class="tb-toast" role="status">${e(notice)}</div>`:''}`;
 if(state.sheet)root.querySelector('.tb-sheet-close')?.focus({preventScroll:true});
 if(state.payment?.stage==='signature')mountSignature(root,store);
 if(state.payment?.stage==='password')root.querySelector('[data-tb-password]')?.focus({preventScroll:true});
}
function notify(text){notice=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{notice='';if(root?.classList.contains('app-taobao')){root.querySelector('.tb-toast')?.remove();}},1800);}
function refresh(preserve=true){const positions=preserve?[...root.querySelectorAll('.tb-scroll,.tb-category-nav')].map(el=>el.scrollTop):[];view();root.querySelectorAll('.tb-scroll,.tb-category-nav').forEach((el,i)=>{el.scrollTop=positions[i]||0;});}
function checkPassword(){
 const input=root.querySelector('[data-tb-password]');if(!input||state.payment?.stage!=='password')return;
 if(!/^\d{6}$/.test(input.value)){root.querySelector('.tb-password-error').textContent='请输入6位数字密码';return;}
 const passed=store.verifyPassword(input.value);input.value='';
 if(passed)refresh();else{root.querySelector('.tb-password-error').textContent=state.payment.error;input.focus({preventScroll:true});}
}
const mounted=new WeakSet();
export function mountTaobao(element,escapeHTML){root=element;e=escapeHTML;state.sheet=null;state.checkout=null;store.cancelPayment();notice='';state.searchOpen=false;view();if(mounted.has(root))return;mounted.add(root);
 root.addEventListener('click',event=>{
  if(!root.classList.contains('app-taobao'))return;
  const b=event.target.closest('[data-tb-action]');if(!b||b.disabled)return;
  // 点击面板内空白处不会穿透到遮罩。
  if(b.classList.contains('tb-sheet-backdrop')&&event.target.closest('.tb-sheet'))return;
  const id=Number(b.dataset.product),actionName=b.dataset.tbAction;
  switch(actionName){
   case 'tab':state.searchOpen=false;state.activeTab=b.dataset.tbTab;refresh(false);return;
   case 'category':state.category=Number(b.dataset.category);refresh(false);return;
   case 'quick-add':store.add(id,1);syncCartProduct(id);return;
   case 'product':state.searchOpen=false;state.sheet={productId:id,quantity:store.getCartQuantity(id)||1};refresh();return;
   case 'sheet-close':state.sheet=null;refresh();return;
   case 'sheet-minus':state.sheet.quantity=Math.max(1,state.sheet.quantity-1);root.querySelector('[data-tb-sheet-quantity]').innerHTML=sheetQuantity();return;
   case 'sheet-plus':state.sheet.quantity=Math.min(999,state.sheet.quantity+1);root.querySelector('[data-tb-sheet-quantity]').innerHTML=sheetQuantity();return;
   case 'add':store.add(state.sheet.productId,state.sheet.quantity);syncCartProduct(state.sheet.productId);return;
   case 'buy':store.startCheckout({productId:state.sheet.productId,quantity:state.sheet.quantity});refresh(false);return;
   case 'minus':
   case 'plus':store.quantity(id,actionName==='plus'?1:-1);if(state.activeTab==='cart'&&!state.sheet)refresh();else syncCartProduct(id);return;
   case 'remove':store.remove(id);refresh();return;
   case 'checkout':if(!store.startCheckout()){notify('请选择商品');refresh();return;}refresh(false);return;
   case 'checkout-back':store.cancelPayment();state.checkout=null;refresh(false);return;
   case 'address-open':state.payment={stage:'addresses'};refresh();return;
   case 'address-select':store.selectAddress(b.dataset.address);store.cancelPayment();refresh();return;
   case 'pay':if(store.beginPayment())refresh();return;
   case 'card-select':if(store.selectCard(b.dataset.bank))refresh();return;
   case 'payment-cancel':store.cancelPayment();refresh();return;
   case 'password-confirm':checkPassword();return;
   case 'signature-clear':root.querySelector('[data-tb-signature]')?.clearSignature();return;
   case 'signature-confirm':{
    if(state.payment?.stage!=='signature')return;
    const canvas=root.querySelector('[data-tb-signature]');
    if(!state.payment?.signed){root.querySelector('[data-tb-signature-hint]').textContent='请先在画板上签名';return;}
    const order=store.pay(canvas.toDataURL('image/png'));
    if(order){refresh(false);if(order.bankCard.id==='mastercard'){const text=`【招商银行】您尾号0105的招行信用卡消费${money(order.totalCents)}人民币。企微人工服务callmyname.cn/247 。`;insertMessage({sender:'+86 95555',text});showNotification({title:'招商银行',body:text});}}return;
   }
   case 'payment-done':store.cancelPayment();refresh(false);return;
  }
 });
 root.addEventListener('input',event=>{if(!root.classList.contains('app-taobao'))return;if(event.target.matches('[data-tb-password]')){event.target.value=event.target.value.replace(/\D/g,'').slice(0,6);if(event.target.value.length===6)checkPassword();return;}if(!event.target.matches('[data-tb-search]'))return;state.searchQuery=event.target.value;state.searchOpen=!!state.searchQuery.trim();updateSuggestions();});
 root.addEventListener('focusin',event=>{if(root.classList.contains('app-taobao')&&event.target.matches('[data-tb-search]')&&state.searchQuery.trim()){state.searchOpen=true;updateSuggestions();}});
 root.addEventListener('change',event=>{if(!root.classList.contains('app-taobao'))return;const el=event.target;if(el.dataset.tbSelect){const line=state.cart.find(x=>x.productId===Number(el.dataset.tbSelect));if(line)line.selected=el.checked;refresh();}else if(el.hasAttribute('data-tb-all')){state.cart.forEach(x=>x.selected=el.checked);refresh();}else if(el.dataset.tbMethod)state.paymentMethod=el.dataset.tbMethod;});
}
document.addEventListener('keydown',event=>{if(event.key!=='Escape'||!root?.classList.contains('app-taobao'))return;if(state.searchOpen){event.preventDefault();event.stopImmediatePropagation();hideSuggestions();return;}if(state.payment){event.preventDefault();event.stopImmediatePropagation();store.cancelPayment();refresh();return;}if(state.sheet||state.checkout){event.preventDefault();event.stopImmediatePropagation();state.sheet=null;state.checkout=null;refresh();}},true);

document.addEventListener('pointerdown',event=>{if(root?.classList.contains('app-taobao')&&state.searchOpen&&!event.target.closest('.tb-search-wrap'))hideSuggestions();});

// 离开淘宝时解除画板监听，避免跨 App 保留失效的画布观察器。
globalThis.addEventListener?.('hashchange',()=>{if(location.hash!=='#taobao')disposeSignature();});
