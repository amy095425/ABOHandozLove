import {initialAgodaOrders} from '../data/agodaInitialOrders.js?v=agoda-shuffle-1';
import {agodaHotels} from '../data/agodaData.js?v=agoda-shuffle-1';
import {agodaGuests,agodaPaymentMethods} from '../data/agodaBookingData.js?v=agoda-booking-1';
import {taobaoBankCards} from '../data/taobaoPaymentData.js?v=taobao-payment-1';
export const agodaRegions=[...new Set(agodaHotels.map(h=>h.region))];
const pastelColors=['#f4e2e7','#e1ebf8','#fcf0d7','#e2f1e9','#eee4f5','#f8e7dc'];
export const formatAgodaDate=value=>{if(/^\d{4}年\d{1,2}月\d{1,2}日$/.test(value))return value;const [y,m,d]=value.split('-').map(Number);return `${y}年${m}月${d}日`;};
export function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [y,m,d]=value.split('-').map(Number);return y>=2026&&y<=2040&&new Date(Date.UTC(y,m-1,d)).toISOString().slice(0,10)===value;}
export function countNights(start,end){if(!validDate(start)||!validDate(end))return 0;return Math.max(0,(Date.parse(`${end}T00:00:00Z`)-Date.parse(`${start}T00:00:00Z`))/86400000);}
export function createAgodaStore({random=Math.random,now=Date.now}={}){
 const state={activeTab:'explore',checkIn:'2030-10-01',checkOut:'2030-10-03',factor:null,hotels:[],region:null,searchQuery:'',adults:2,children:0,modal:null,hotelId:null,booking:null,payment:null,orders:initialAgodaOrders.map(o=>({...o,totalCents:Math.round(o.totalPrice*100)})),error:''};
 function enterExplore(){state.activeTab='explore';state.region=null;state.factor=.9+Math.max(0,Math.min(1,random()))*.3;state.hotels=agodaHotels.map(h=>({...h,color:pastelColors[(h.id+Math.floor(state.factor*1000))%pastelColors.length],rooms:h.rooms.map((room,index)=>({...room,index,priceCents:Math.round(room.price*state.factor*100)}))}));
  // 仅在进入探索页时洗牌，后续筛选、选房与付款沿用本次快照。
  for(let i=state.hotels.length-1;i>0;i--){const j=Math.min(i,Math.floor(Math.max(0,random())*(i+1)));[state.hotels[i],state.hotels[j]]=[state.hotels[j],state.hotels[i]];}
 }
 function setOccupancy(adults,children){if(!Number.isInteger(adults)||adults<1||adults>10||!Number.isInteger(children)||children<0||children>10)return false;state.adults=adults;state.children=children;return true;}
 function selectRegion(region){if(!agodaRegions.includes(region))return false;state.activeTab='regions';state.region=region;state.searchQuery='';return true;}
 function filteredHotels(){const query=state.searchQuery.trim().toLocaleLowerCase();return state.hotels.filter(h=>(state.activeTab!=='regions'||!state.region||h.region===state.region)&&(!query||`${h.name} ${h.region}`.toLocaleLowerCase().includes(query)));}
 function setDates(start,end){if(!countNights(start,end)){state.error='请选择2026–2040年内的有效日期，退房日期须晚于入住日期';return false;}state.checkIn=start;state.checkOut=end;state.error='';return true;}
 function openHotel(id){if(!state.hotels.some(h=>h.id===id))return false;state.hotelId=id;state.modal='hotel';state.booking=null;state.payment=null;state.error='';return true;}
 function selectRoom(index){const hotel=state.hotels.find(h=>h.id===state.hotelId),room=hotel?.rooms.find(r=>r.index===index);if(!room)return false;const nights=countNights(state.checkIn,state.checkOut);if(!nights)return false;state.booking={hotelId:hotel.id,hotelName:hotel.name,region:hotel.region,roomName:room.name,roomIndex:index,priceCents:room.priceCents,factor:state.factor,adults:state.adults,children:state.children,checkIn:state.checkIn,checkOut:state.checkOut,nights,totalCents:room.priceCents*nights,guestIds:['han'],paymentMethod:'银行卡支付',deadline:now()+30000};state.modal='confirm';state.error='';return true;}
 function toggleGuest(id,selected){const b=state.booking;if(!b||state.payment||!agodaGuests.some(g=>g.id===id))return;b.guestIds=b.guestIds.filter(x=>x!==id);if(selected)b.guestIds.push(id);}
 function setMethod(method){if(state.booking&&!state.payment&&agodaPaymentMethods.includes(method))state.booking.paymentMethod=method;}
 function beginPayment(){if(!state.booking||!state.booking.guestIds.length){state.error='请至少选择一位入住人';return false;}state.error='';state.payment={stage:'cards',cardId:null,signed:false,error:''};return true;}
 function selectCard(id){if(state.payment?.stage!=='cards'||!taobaoBankCards.some(c=>c.id===id))return false;state.payment={stage:'password',cardId:id,signed:false,error:''};return true;}
 function verifyPassword(value){const p=state.payment;if(p?.stage!=='password')return false;const card=taobaoBankCards.find(c=>c.id===p.cardId);if(value!==card?.password){p.error='密码错误，支付失败';return false;}p.stage='signature';p.error='';return true;}
 function markSigned(signed){if(state.payment?.stage==='signature')state.payment.signed=!!signed;}
 function cancelPayment(){state.payment=null;}
 function close(){state.modal=null;state.booking=null;state.payment=null;state.error='';}
 function pay(signature){const b=state.booking,p=state.payment;if(!b||!b.guestIds.length||p?.stage!=='signature'||!p.signed||!signature)return null;const card=taobaoBankCards.find(c=>c.id===p.cardId);if(!card)return null;const order={...b,guestIds:[...b.guestIds],guests:agodaGuests.filter(g=>b.guestIds.includes(g.id)).map(g=>({...g})),bankCard:{id:card.id,name:card.name,number:card.number,holder:card.holder},signature,orderId:`AG${now()}${state.orders.length+1}`,date:new Date(now()).toLocaleString('zh-CN',{hour12:false}),status:'已预订'};state.orders.unshift(order);close();return order;}
 function remaining(){return state.booking?Math.max(0,Math.ceil((state.booking.deadline-now())/1000)):0;}
 return {state,enterExplore,setOccupancy,selectRegion,filteredHotels,setDates,openHotel,selectRoom,toggleGuest,setMethod,beginPayment,selectCard,verifyPassword,markSigned,cancelPayment,close,pay,remaining};
}
export const agodaStore=createAgodaStore();
