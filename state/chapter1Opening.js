import {gameProgress} from './gameProgress.js?v=chapter2-ending-1';
import {chapter1Threads} from '../data/threadsPostsData.js?v=chapter1-opening-1';
export const readingDelay=content=>1500+Array.from(content).length*10;
export function createChapter1Opening({progress=gameProgress,posts=chapter1Threads,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now}={}){
 const state={phase:'idle',notificationClicked:false,visibleCount:0};
 let notificationTimer=null,feedTimer=null,deadline=0,remaining=600,inThreads=false;
 const listeners=new Set(),emit=()=>listeners.forEach(fn=>fn({...state}));
 const allowed=()=>progress.getCurrentChapter()===1;
 function clearFeed(){if(feedTimer!==null)clearTimer(feedTimer);feedTimer=null;}
 function scheduleNext(delay){deadline=now()+delay;feedTimer=setTimer(()=>{feedTimer=null;if(!inThreads||!allowed()||!state.notificationClicked)return;const post=posts[state.visibleCount];if(!post){state.phase='complete';emit();return;}state.visibleCount++;if(state.visibleCount===posts.length){state.phase='complete';emit();return;}remaining=readingDelay(post.content);scheduleNext(remaining);emit();},delay);}
 function onUnlocked(){if(!allowed()||state.phase!=='idle')return false;state.phase='waiting';notificationTimer=setTimer(()=>{notificationTimer=null;if(!allowed())return;state.phase='notification';emit();},5000);emit();return true;}
 function acknowledgeNotification(){if(!allowed()||state.phase!=='notification')return false;state.notificationClicked=true;state.phase='ready';emit();return true;}
 function enterThreads(){inThreads=true;if(!allowed()||!state.notificationClicked||!['ready','paused'].includes(state.phase))return false;state.phase='streaming';scheduleNext(remaining);emit();return true;}
 function leaveThreads(){inThreads=false;if(feedTimer!==null){remaining=Math.max(0,deadline-now());clearFeed();state.phase='paused';emit();}}
 function subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}
 const unsubscribeProgress=progress.subscribe(()=>{if(allowed())return;if(notificationTimer!==null)clearTimer(notificationTimer);notificationTimer=null;clearFeed();state.phase='cancelled';emit();});
 function dispose(){if(notificationTimer!==null)clearTimer(notificationTimer);notificationTimer=null;clearFeed();unsubscribeProgress();listeners.clear();}
 return {state,onUnlocked,acknowledgeNotification,enterThreads,leaveThreads,subscribe,getVisiblePosts:()=>posts.slice(0,state.visibleCount),dispose};
}
export const chapter1Opening=createChapter1Opening();
// 作为全局游戏状态的一部分暴露，刷新页面恢复第一章开场初始状态。
gameProgress.state.chapter1Opening=chapter1Opening.state;
