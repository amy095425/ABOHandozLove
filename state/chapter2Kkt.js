import {gameProgress} from './gameProgress.js?v=chapter2-ending-1';
import {chapter2Douban} from './chapter2Douban.js?v=chapter3-douban-1';
import {chapter2KktMessages} from '../data/chapter2KktChat.js?v=chapter2-kkt-1';
import {kktReadingDelay} from './chapter1Kkt.js?v=chapter2-ending-1';
export function createChapter2Kkt({progress=gameProgress,douban=chapter2Douban,messages=chapter2KktMessages,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now}={}){
 const state={phase:'idle',notificationClicked:false,visibleCount:0,typingIndex:null};
 const listeners=new Set(),stamps=[];let noticeTimer=null,timer=null,active=false,remaining=800,deadline=0,resumePhase='typing',revision=progress.state.chapterDebugRevision||0;
 const emit=()=>listeners.forEach(fn=>fn({...state})),allowed=()=>progress.getCurrentChapter()===2;
 // Called by the detail view only after the final comment has been inserted into the DOM.
 function onCommentsRendered(floor){if(floor!==95||!allowed()||state.phase!=='idle'||douban.state.phase!=='complete'||douban.state.visibleCount!==95)return false;state.phase='waiting';noticeTimer=setTimer(()=>{noticeTimer=null;if(!allowed())return;state.phase='notification';emit();},3000);emit();return true;}
 function acknowledgeNotification(){if(!allowed()||state.phase!=='notification')return false;state.notificationClicked=true;state.phase='ready';emit();return true;}
 function schedule(phase,delay){state.phase=phase;resumePhase=phase;remaining=delay;deadline=now()+delay;timer=setTimer(()=>{timer=null;if(!allowed()||!active)return;if(phase==='typing'){const date=progress.getGlobalSystemDate();stamps[state.visibleCount]=`${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;const message=messages[state.visibleCount];state.visibleCount++;state.typingIndex=null;if(state.visibleCount===messages.length)state.phase='complete';else schedule('reading',kktReadingDelay(message));}else{state.typingIndex=state.visibleCount;schedule('typing',800);}emit();},delay);}
 function enterChat(){if(!allowed()||!state.notificationClicked||!['ready','paused'].includes(state.phase))return false;active=true;if(state.phase==='ready'){state.typingIndex=state.visibleCount;schedule('typing',800);}else schedule(resumePhase,remaining);emit();return true;}
 function leaveChat(){active=false;if(timer!==null){remaining=Math.max(0,deadline-now());clearTimer(timer);timer=null;state.phase='paused';emit();}}
 function cancel(){if(timer!==null)clearTimer(timer);if(noticeTimer!==null)clearTimer(noticeTimer);timer=noticeTimer=null;active=false;}
 const unsubscribe=progress.subscribe(()=>{if(revision!==(progress.state.chapterDebugRevision||0)){revision=progress.state.chapterDebugRevision||0;cancel();state.phase='idle';state.notificationClicked=false;state.visibleCount=0;state.typingIndex=null;stamps.length=0;remaining=800;emit();}else if(!allowed()&&state.phase!=='idle'){cancel();state.phase='cancelled';state.typingIndex=null;emit();}});
 return {state,onCommentsRendered,acknowledgeNotification,enterChat,leaveChat,getVisibleMessages:()=>messages.slice(0,state.visibleCount).map((m,i)=>({...m,mine:m.isMe,time:stamps[i]})),getTyping:()=>state.typingIndex===null?null:messages[state.typingIndex],subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},dispose(){cancel();unsubscribe();listeners.clear();}};
}
export const chapter2Kkt=createChapter2Kkt();
gameProgress.state.chapter2Kkt=chapter2Kkt.state;
