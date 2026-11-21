import {gameProgress} from './gameProgress.js?v=chapter1-payment-fix-2';
import {chapter1KktChat} from '../data/chapter1KktChat.js?v=chapter1-kkt-details-3';
export const kktReadingDelay=message=>message.type==='image'?2500:1500+Array.from(message.text||'').length*40;
export function createChapter1Kkt({progress=gameProgress,messages=chapter1KktChat,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now}={}){
 const state={phase:'idle',notificationClicked:false,visibleCount:0,typingIndex:null};let noticeTimer=null,timer=null,deadline=0,remaining=800,resumePhase='typing',active=false;
 const listeners=new Set(),emit=()=>listeners.forEach(fn=>fn({...state})),allowed=()=>progress.getCurrentChapter()===1;
 function schedule(phase,delay){state.phase=phase;resumePhase=phase;remaining=delay;deadline=now()+delay;timer=setTimer(()=>{timer=null;if(!active||!allowed())return;if(phase==='typing'){const message=messages[state.visibleCount];state.visibleCount++;state.typingIndex=null;if(state.visibleCount===messages.length){state.phase='complete';emit();return;}schedule('reading',kktReadingDelay(message));emit();}else{state.typingIndex=state.visibleCount;schedule('typing',800);emit();}},delay);}
 function checkTask(){if(!progress.state.agodaTaskCompleted||!allowed()||state.phase!=='idle')return;state.phase='waiting';noticeTimer=setTimer(()=>{noticeTimer=null;if(!allowed())return;state.phase='notification';emit();},5000);emit();}
 function acknowledgeNotification(){if(state.phase!=='notification'||!allowed())return false;state.notificationClicked=true;state.phase='ready';emit();return true;}
 function enterChat(){active=true;if(!allowed()||!state.notificationClicked||!['ready','paused'].includes(state.phase))return false;if(state.phase==='ready'){state.typingIndex=state.visibleCount;schedule('typing',800);}else schedule(resumePhase,remaining);emit();return true;}
 function leaveChat(){active=false;if(timer!==null){remaining=Math.max(0,deadline-now());clearTimer(timer);timer=null;state.phase='paused';emit();}}
 const unsubscribe=progress.subscribe(()=>{if(!allowed()){if(noticeTimer!==null)clearTimer(noticeTimer);if(timer!==null)clearTimer(timer);noticeTimer=timer=null;state.typingIndex=null;state.phase='cancelled';emit();}else checkTask();});checkTask();
 return {state,acknowledgeNotification,enterChat,leaveChat,subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},getVisibleMessages:()=>messages.slice(0,state.visibleCount).map(m=>({...m,mine:m.isMe,date:'2030年10月7日',time:'刚刚'})),getTyping:()=>state.typingIndex===null?null:messages[state.typingIndex],dispose(){if(noticeTimer!==null)clearTimer(noticeTimer);if(timer!==null)clearTimer(timer);unsubscribe();listeners.clear();}};
}
export const chapter1Kkt=createChapter1Kkt();
gameProgress.state.chapter1Kkt=chapter1Kkt.state;
