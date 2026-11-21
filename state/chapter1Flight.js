import {chapter1Opening} from './chapter1Opening.js?v=chapter1-payment-fix-2';
import {gameProgress} from './gameProgress.js?v=chapter1-payment-fix-2';
import {flightDynamics} from '../data/umetrip.js?v=umetrip-dynamics-1';
import {chapter1FlightReminder} from '../data/flightOpeningData.js?v=chapter1-flight-1';
export function createChapter1Flight({opening=chapter1Opening,progress=gameProgress,items=flightDynamics,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 const state={phase:'idle',notificationClicked:false};const listeners=new Set();let timer=null;
 const emit=()=>listeners.forEach(fn=>fn({...state}));
 function onFeedComplete(){if(opening.state.phase!=='complete'||progress.getCurrentChapter()!==1||state.phase!=='idle')return;state.phase='waiting';timer=setTimer(()=>{timer=null;if(progress.getCurrentChapter()!==1)return;state.phase='notification';emit();},2000);emit();}
 function acknowledgeNotification(){if(state.phase!=='notification'||progress.getCurrentChapter()!==1)return false;if(!items.some(item=>item.id===chapter1FlightReminder.id))items.push({...chapter1FlightReminder});state.notificationClicked=true;state.phase='opened';emit();return true;}
 const unsubscribeOpening=opening.subscribe(onFeedComplete);
 const unsubscribeProgress=progress.subscribe(()=>{if(progress.getCurrentChapter()===1)return;if(timer!==null)clearTimer(timer);timer=null;state.phase='cancelled';emit();});
 onFeedComplete();
 return {state,acknowledgeNotification,subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},dispose(){if(timer!==null)clearTimer(timer);unsubscribeOpening();unsubscribeProgress();listeners.clear();}};
}
export const chapter1Flight=createChapter1Flight();
gameProgress.state.chapter1Flight=chapter1Flight.state;
