import {chapter1AlarmText} from '../data/chapter1AlarmData.js?v=chapter1-alarm-1';
import {chapter1Flight} from './chapter1Flight.js?v=chapter2-ending-1';
import {gameProgress} from './gameProgress.js?v=chapter2-ending-1';
export function createChapter1Alarm({flight=chapter1Flight,progress=gameProgress,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now}={}){
 const state={phase:'idle',alarmRecord:null};let timer=null;const listeners=new Set(),emit=()=>listeners.forEach(fn=>fn({...state}));
 function onReminderShown(){if(state.phase!=='idle'||progress.getCurrentChapter()!==1||flight.state.phase!=='opened'||!flight.state.notificationClicked)return false;state.phase='waiting';timer=setTimer(()=>{timer=null;if(progress.getCurrentChapter()!==1)return;state.phase='ringing';state.alarmRecord={id:'chapter1_hotel_reminder',time:progress.getGlobalSystemDate().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}),label:chapter1AlarmText,enabled:true};emit();},3000);emit();return true;}
 function onReminderHidden(){if(state.phase!=='waiting')return;if(timer!==null)clearTimer(timer);timer=null;state.phase='idle';emit();}
 function stop(){if(state.phase!=='ringing')return false;state.phase='dismissed';if(state.alarmRecord)state.alarmRecord.enabled=false;emit();return true;}
 const unsubscribe=progress.subscribe(()=>{if(progress.getCurrentChapter()===1)return;if(timer!==null)clearTimer(timer);timer=null;state.phase='cancelled';if(state.alarmRecord)state.alarmRecord.enabled=false;emit();});
 return {state,onReminderShown,onReminderHidden,stop,subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},dispose(){if(timer!==null)clearTimer(timer);unsubscribe();listeners.clear();}};
}
export const chapter1Alarm=createChapter1Alarm();
gameProgress.state.chapter1Alarm=chapter1Alarm.state;
