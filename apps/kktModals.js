import { receipt } from '../data/kktReceiptData.js?v=kkt-receipt-1';
let escapeHTML,overlay,returnFocus;
export function mountKktModals(e){escapeHTML=e;if(overlay&&!overlay.isConnected)overlay=null;}
function close(){
  overlay?.remove();overlay=null;
  document.querySelectorAll('#app [data-kkt-was-inert]').forEach(el=>{el.inert=el.dataset.kktWasInert==='true';delete el.dataset.kktWasInert;});
  if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
}
function open(type,src){
 if(overlay?.isConnected)return;
 const e=escapeHTML,app=document.querySelector('#app');returnFocus=document.activeElement;
 [...app.children].forEach(el=>{el.dataset.kktWasInert=String(el.inert);el.inert=true;});
 overlay=document.createElement('section');overlay.className=`kkt-modal kkt-modal-${type}`;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',type==='image'?'聊天图片预览':'付款成功账单');
 overlay.innerHTML=type==='image'?`<header class="modal-header modal-image-header"><h2>图片预览</h2><button type="button" class="modal-close" data-kkt-modal="close">关闭</button></header><div class="kkt-image-preview"><img src="${e(src)}" alt="放大的聊天图片"><span class="kkt-image-placeholder" hidden>图片暂未提供</span></div>`:`<div class="kkt-receipt-sheet"><header class="modal-header"><h2>付款凭证</h2><button type="button" class="modal-close" data-kkt-modal="close">关闭</button></header><div class="kkt-receipt-scroll"><div class="kkt-receipt-top"><span class="kkt-receipt-check" aria-hidden="true">✓</span><h2>${e(receipt.title)}</h2><span class="kkt-receipt-caption">PAYMENT RECEIPT</span></div><dl class="kkt-receipt-fields">${receipt.fields.map(([k,v])=>`<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl></div><footer><button type="button" data-kkt-modal="close">关闭</button></footer></div>`;
 app.append(overlay);overlay.querySelector('button')?.focus({preventScroll:true});
}
document.addEventListener('click',ev=>{const b=ev.target.closest('#app.app-kkt [data-kkt-modal]');if(!b)return;const action=b.dataset.kktModal;if(action==='close')close();else open(action,b.dataset.src);});
document.addEventListener('error',ev=>{
 const img=ev.target;if(!img.matches?.('#app.app-kkt .kkt-image-open img,#app.app-kkt .kkt-image-preview img'))return;
 img.hidden=true;const placeholder=img.parentElement.querySelector('.kkt-image-placeholder');if(placeholder)placeholder.hidden=false;
},true);
document.addEventListener('keydown',ev=>{
 if(!overlay?.isConnected)return;
 if(ev.key==='Escape'){ev.preventDefault();ev.stopImmediatePropagation();close();}
 if(ev.key==='Tab'){const buttons=[...overlay.querySelectorAll('button:not(:disabled)')];if(buttons.length===1){ev.preventDefault();buttons[0].focus();}}
},true);
