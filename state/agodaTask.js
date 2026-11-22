import {gameProgress} from './gameProgress.js?v=chapter2-ending-1';
// 只检查新支付订单；不扫描历史订单，不产生任何玩家可见的结果提示。
export function matchesChapter1AgodaOrder(order,currentChapter){
 if(currentChapter!==1||!order||order.status!=='已预订'||!order.signature)return false;
 return order.hotelName==='北京王府半岛酒店'&&order.roomName==='豪华套房'
  &&['2030-10-07','2030年10月7日'].includes(order.checkIn)
  &&['2030-10-10','2030年10月10日'].includes(order.checkOut)
  &&Array.isArray(order.guests)&&order.guests.some(guest=>guest.name==='Kim Dohoon');
}
// 下一阶段剧情的预留入口；当前只记录日志，不跳转或更改章节。
export function triggerChapter1NextStage(){console.log('第一章 Agoda 任务完成，准备进入下一阶段');}
export function createAgodaTask({progress=gameProgress,onNextStage=triggerChapter1NextStage,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let timer=null,triggered=false;
 function checkPaidOrder(order){
  if(progress.state.agodaTaskCompleted||triggered||timer!==null||!matchesChapter1AgodaOrder(order,progress.getCurrentChapter()))return false;
  progress.markAgodaTaskCompleted();
  timer=setTimer(()=>{timer=null;if(progress.getCurrentChapter()!==1)return;triggered=true;onNextStage();},2000);
  return true;
 }
 const unsubscribe=progress.subscribe(()=>{if(progress.getCurrentChapter()!==1&&timer!==null){clearTimer(timer);timer=null;}});
 return {checkPaidOrder,dispose(){if(timer!==null)clearTimer(timer);timer=null;unsubscribe();}};
}
export const agodaTask=createAgodaTask();
