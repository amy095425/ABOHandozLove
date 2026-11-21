export {mountSignature,disposeSignature} from '../components/SignaturePad.js?v=agoda-booking-1';
import {taobaoAddresses,taobaoBankCards} from '../data/taobaoPaymentData.js?v=taobao-payment-1';
const button=(action,text)=>`<button type="button" data-tb-action="${action}">${text}</button>`;
export function renderPayment(state,e){
 const p=state.payment;if(!p)return '';
 const card=taobaoBankCards.find(c=>c.id===p.cardId);
 if(p.stage==='success')return `<section class="tb-payment-full tb-payment-success" role="dialog" aria-modal="true" aria-label="支付成功"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#26b66c"/><path d="m21 40 13 13 25-27" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg><h2>支付成功</h2><strong>¥${(p.totalCents/100).toFixed(2)}</strong><p>订单已提交，等待发货</p>${button('payment-done','查看订单')}</section>`;
 if(p.stage==='signature')return `<section class="tb-payment-full tb-signature" role="dialog" aria-modal="true" aria-label="手写签名"><header class="tb-header">${button('payment-cancel','‹ 返回')}<h2>请在下方签名</h2><span></span></header><p>请使用手指或鼠标书写</p><div class="tb-signature-pad"><canvas data-tb-signature aria-label="手写签名画板"></canvas></div><p data-tb-signature-hint aria-live="polite">签名后确认支付</p><footer>${button('signature-clear','清除')}${button('signature-confirm','确认')}</footer></section>`;
 let title='',content='';
 if(p.stage==='addresses'){title='选择收货地址';content=taobaoAddresses.map(a=>`<button class="tb-address-option" data-tb-action="address-select" data-address="${a.id}" aria-pressed="${a.id===state.addressId}"><b>${e(a.name)}　${e(a.phone)}</b><span>${e(a.address)}</span><small>${a.id===state.addressId?'✓ 当前地址':'使用此地址'}</small></button>`).join('');}
 if(p.stage==='cards'){title='选择银行卡';content=taobaoBankCards.map(c=>`<button class="tb-bank-option" data-tb-action="card-select" data-bank="${c.id}"><b>${e(c.name)}</b><span>${e(c.number)}</span><small>持卡人：${e(c.holder)} · 币种：${e(c.currency)}</small></button>`).join('');}
 if(p.stage==='password'){title='输入支付密码';content=`<p class="tb-bank-summary">${e(card.name)} · 尾号${e(card.number.slice(-4))}</p><input data-tb-password type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" aria-label="6位支付密码" placeholder="请输入6位数字密码"><p class="tb-password-error" role="alert">${e(p.error)}</p><p class="tb-password-help">输入6位后自动验证</p>${button('password-confirm','验证密码')}`;}
 return `<div class="tb-payment-backdrop"><section class="tb-payment-panel" role="dialog" aria-modal="true" aria-label="${title}"><header><h2>${title}</h2>${button('payment-cancel','关闭')}</header><div class="tb-payment-panel-scroll">${content}</div></section></div>`;
}
