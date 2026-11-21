import {taobaoAddresses,taobaoBankCards} from '../data/taobaoPaymentData.js?v=taobao-payment-1';
import { initialCart, initialOrders } from '../data/taobaoInitialData.js?v=taobao-defaults-1';
import { taobaoProducts } from '../data/taobaoProducts.js?v=taobao-shop-1';
export const products=taobaoProducts;
export const productById=new Map(products.map(p=>[p.id,p]));
export const priceCents = price => {const [whole,fraction='']=String(price).split('.');return Number(whole)*100+Number(fraction.padEnd(2,'0').slice(0,2));};
export const money=cents=>(cents/100).toFixed(2);
export const categoryIndex=p=>Math.floor((p.id-1)/20);
export function createTaobaoStore(){
 const state={cart:initialCart.map(line=>({...line})),orders:initialOrders.map(order=>({...order,totalCents:priceCents(order.totalPrice),items:order.items.map(item=>({...item,title:item.name}))})),activeTab:'home',searchQuery:'',searchOpen:false,category:0,sheet:null,checkout:null,paymentMethod:'银行卡支付',addressId:taobaoAddresses[0].id,payment:null};
 function add(productId,quantity=1){if(!productById.has(productId))return;const n=Math.max(1,Math.min(999,Math.floor(quantity)));const line=state.cart.find(x=>x.productId===productId);if(line){line.quantity=Math.min(999,line.quantity+n);line.selected=true;}else state.cart.push({productId,quantity:n,selected:true});}
 function getCartQuantity(productId){return state.cart.find(x=>x.productId===productId)?.quantity||0;}
 function quantity(productId,delta){const line=state.cart.find(x=>x.productId===productId);if(!line)return;const next=Math.max(0,Math.min(999,line.quantity+delta));if(next===0)remove(productId);else line.quantity=next;}
 function remove(productId){state.cart=state.cart.filter(x=>x.productId!==productId);}
 function snapshot(lines){return lines.map(line=>{const p=productById.get(line.productId);return {productId:p.id,title:p.title,shop:p.shop,price:p.price,quantity:line.quantity,category:categoryIndex(p)};});}
 function total(lines){return lines.reduce((sum,line)=>sum+priceCents(productById.get(line.productId).price)*line.quantity,0);}
 function startCheckout(direct){const lines=direct?[direct]:state.cart.filter(x=>x.selected);if(!lines.length)return false;state.checkout={items:snapshot(lines),totalCents:total(lines),fromCart:!direct};state.sheet=null;state.payment=null;return true;}
 function selectAddress(id){if(taobaoAddresses.some(a=>a.id===id))state.addressId=id;}
 function beginPayment(){if(!state.checkout)return false;state.payment={stage:'cards',cardId:null,signed:false,error:''};return true;}
 function selectCard(id){if(!state.checkout||state.payment?.stage!=='cards'||!taobaoBankCards.some(c=>c.id===id))return false;state.payment={stage:'password',cardId:id,signed:false,error:''};return true;}
 function verifyPassword(value){const payment=state.payment;if(!state.checkout||payment?.stage!=='password')return false;const card=taobaoBankCards.find(c=>c.id===payment.cardId);if(value!==card?.password){payment.error='密码错误，支付失败';return false;}payment.error='';payment.stage='signature';return true;}
 function markSigned(signed){if(state.payment?.stage==='signature')state.payment.signed=!!signed;}
 function cancelPayment(){state.payment=null;}
 function pay(signature){const checkout=state.checkout,payment=state.payment;if(!checkout||payment?.stage!=='signature'||!payment.signed||!signature)return null;const bank=taobaoBankCards.find(c=>c.id===payment.cardId);if(!bank)return null;const order={orderId:`TB${Date.now()}${String(state.orders.length+1).padStart(3,'0')}`,items:checkout.items.map(x=>({...x})),totalPrice:checkout.totalCents/100,totalCents:checkout.totalCents,date:new Date().toLocaleString('zh-CN',{hour12:false}),paymentMethod:state.paymentMethod,bankCard:{id:bank.id,name:bank.name,number:bank.number,holder:bank.holder,currency:bank.currency},address:{...taobaoAddresses.find(a=>a.id===state.addressId)},signature,status:'待发货'};state.orders.unshift(order);if(checkout.fromCart){const ids=new Set(checkout.items.map(x=>x.productId));state.cart=state.cart.filter(x=>!ids.has(x.productId));}state.checkout=null;state.payment={stage:'success',orderId:order.orderId,totalCents:order.totalCents,cardId:bank.id};state.activeTab='orders';return order;}
 return {state,add,getCartQuantity,quantity,remove,total,startCheckout,selectAddress,beginPayment,selectCard,verifyPassword,markSigned,cancelPayment,pay,count:()=>state.cart.reduce((sum,x)=>sum+x.quantity,0)};
}
// 会话内淘宝独享；退出 App 不清空，刷新页面恢复默认数据。
export const taobaoStore=createTaobaoStore();
