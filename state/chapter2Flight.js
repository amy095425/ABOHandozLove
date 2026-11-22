import {gameProgress} from './gameProgress.js?v=chapter2-ending-1';
import {chapter2Kkt} from './chapter2Kkt.js?v=chapter3-douban-1';
import {flightDynamics} from '../data/umetrip.js?v=umetrip-dynamics-1';
import {chapter2FlightReminder,checkinOptions} from '../data/chapter2FlightData.js?v=chapter2-flight-1';
export function triggerChapter2NextStage(){console.log('值机状态确认成功：带娃');}
export function createChapter2Flight({progress=gameProgress,chat=chapter2Kkt,items=flightDynamics,setTimer=setTimeout,clearTimer=clearTimeout,onNextStage=triggerChapter2NextStage}={}){
 const state={phase:'idle',notificationClicked:false,sheetOpen:false,checkinConfirmed:false};let timer=null,revision=progress.state.chapterDebugRevision||0;
 const listeners=new Set(),emit=()=>listeners.forEach(fn=>fn({...state})),allowed=()=>progress.getCurrentChapter()===2;
 progress.state.chapter2CheckinConfirmed=false;
 function onChatRendered(messageId){const last=chat.getVisibleMessages().at(-1);if(!allowed()||state.phase!=='idle'||chat.state.phase!=='complete'||!last||last.id!==messageId||last.text!=='保证完成任务！')return false;state.phase='waiting';timer=setTimer(()=>{timer=null;if(!allowed())return;state.phase='notification';emit();},2000);emit();return true;}
 function acknowledgeNotification(){if(!allowed()||state.phase!=='notification')return false;if(!items.some(item=>item.id===chapter2FlightReminder.id))items.unshift({...chapter2FlightReminder});state.notificationClicked=true;state.phase='opened';emit();return true;}
 function openSheet(){if(!allowed()||!state.notificationClicked)return false;state.sheetOpen=true;emit();return true;}
 function closeSheet(){state.sheetOpen=false;emit();}
 function selectCheckin(option){if(!allowed()||!state.sheetOpen||!checkinOptions.includes(option))return false;state.sheetOpen=false;if(option==='带娃'&&!state.checkinConfirmed){state.checkinConfirmed=true;progress.state.chapter2CheckinConfirmed=true;emit();onNextStage();return true;}emit();return false;}
 const unsubscribe=progress.subscribe(()=>{if(revision!==(progress.state.chapterDebugRevision||0)){revision=progress.state.chapterDebugRevision||0;if(timer!==null)clearTimer(timer);timer=null;state.phase='idle';state.notificationClicked=state.sheetOpen=state.checkinConfirmed=false;progress.state.chapter2CheckinConfirmed=false;for(let i=items.length-1;i>=0;i--)if(items[i].id===chapter2FlightReminder.id)items.splice(i,1);emit();}else if(!allowed()&&state.phase!=='idle'){if(timer!==null)clearTimer(timer);timer=null;state.phase='cancelled';state.sheetOpen=false;emit();}});
 return {state,onChatRendered,acknowledgeNotification,openSheet,closeSheet,selectCheckin,subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},dispose(){if(timer!==null)clearTimer(timer);unsubscribe();listeners.clear();}};
}
export const chapter2Flight=createChapter2Flight();
gameProgress.state.chapter2Flight=chapter2Flight.state;
