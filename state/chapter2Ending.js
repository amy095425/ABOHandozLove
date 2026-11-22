import {gameProgress} from './gameProgress.js?v=chapter2-ending-1';
import {chapter2Threads} from './chapter2Threads.js?v=chapter3-douban-1';
import {chapter2YouTubeEvent} from '../data/chapter2YouTubeData.js?v=chapter2-ending-1';
export function createChapter2Ending({progress=gameProgress,threads=chapter2Threads,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 const state={phase:'idle',notificationClicked:false,reserved:false};const listeners=new Set();let timer=null,revision=progress.state.chapterDebugRevision||0;
 const emit=()=>listeners.forEach(fn=>fn({...state})),allowed=()=>progress.getCurrentChapter()===2;
 function onThreadsRendered(){if(!allowed()||state.phase!=='idle'||threads.state.phase!=='complete'||threads.state.visibleCount!==7||threads.state.replyVisibleCount!==14)return false;state.phase='waiting';timer=setTimer(()=>{timer=null;if(!allowed())return;state.phase='notification';emit();},5000);emit();return true;}
 function acknowledgeNotification(){if(!allowed()||state.phase!=='notification')return false;state.notificationClicked=true;state.phase='ready';emit();return true;}
 function openReservation(){if(!allowed()||state.phase!=='ready')return false;state.phase='booking';emit();return true;}
 function reserve(){if(!allowed()||state.phase!=='booking')return false;state.reserved=true;state.phase='calendar';emit();return true;}
 function confirmCalendar(){if(!allowed()||state.phase!=='calendar'||!state.reserved)return false;state.phase='complete';const events=progress.state.calendarEvents;if(!events.some(event=>event.id===chapter2YouTubeEvent.id))events.push({...chapter2YouTubeEvent});progress.triggerChapter3Ready();const entered=progress.enterChapter(3);if(entered){progress.updateGlobalSystemDate('2031-12-24T21:00:00');console.log('已进入第三章');}emit();return entered;}
 const unsubscribe=progress.subscribe(()=>{if(revision!==(progress.state.chapterDebugRevision||0)){revision=progress.state.chapterDebugRevision||0;if(timer!==null)clearTimer(timer);timer=null;state.phase='idle';state.notificationClicked=state.reserved=false;emit();}else if(!allowed()&&!['idle','complete'].includes(state.phase)){if(timer!==null)clearTimer(timer);timer=null;state.phase='cancelled';emit();}});
 return {state,onThreadsRendered,acknowledgeNotification,openReservation,reserve,confirmCalendar,subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},dispose(){if(timer!==null)clearTimer(timer);unsubscribe();listeners.clear();}};
}
export const chapter2Ending=createChapter2Ending();
gameProgress.state.chapter2Ending=chapter2Ending.state;
