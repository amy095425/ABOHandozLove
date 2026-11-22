import {gameProgress} from './gameProgress.js?v=chapter2-ending-1';
import {chapter2Flight} from './chapter2Flight.js?v=chapter3-douban-1';
import {chapter2ThreadsPosts} from '../data/chapter2ThreadsPosts.js?v=chapter2-threads-1';
export const chapter2ThreadsDelay=content=>1500+Array.from(content).length*50;
export function createChapter2Threads({progress=gameProgress,flight=chapter2Flight,posts=chapter2ThreadsPosts,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now,random=Math.random}={}){
 const state={phase:'idle',notificationClicked:false,visibleCount:0,replyVisibleCount:0};const listeners=new Set();let noticeTimer=null,timer=null,active=false,remaining=600,deadline=0,next='post',revision=progress.state.chapterDebugRevision||0;
 const emit=()=>listeners.forEach(fn=>fn({...state})),allowed=()=>progress.getCurrentChapter()===2;
 function decorate(){return posts.map((post,i)=>({...post,displayId:`${post.author}.${Math.floor(random()*1679616).toString(36).padStart(4,'0')}`,avatarColor:`hsl(${Math.floor(random()*360)} 50% 88%)`,replies:post.replies.map((reply,j)=>({...reply,id:`${post.id}-reply-${j+1}`,displayId:`${reply.author}_${Math.floor(random()*1679616).toString(36).padStart(4,'0')}`}))}));}
 let decorated=decorate();
 function schedule(delay){remaining=delay;deadline=now()+delay;timer=setTimer(()=>{timer=null;if(!active||!allowed())return;
  if(next==='post'){const post=decorated[state.visibleCount];state.visibleCount++;if(state.visibleCount===decorated.length){if(post.replies.length){next='reply';schedule(chapter2ThreadsDelay(post.content));}else state.phase='complete';}else schedule(chapter2ThreadsDelay(post.content));}
  else{const replies=decorated.at(-1).replies;state.replyVisibleCount++;if(state.replyVisibleCount===replies.length)state.phase='complete';else schedule(1000);}
  emit();
 },delay);}
 function checkSuccess(){if(!allowed()||!flight.state.checkinConfirmed||state.phase!=='idle')return false;state.phase='waiting';noticeTimer=setTimer(()=>{noticeTimer=null;if(!allowed())return;state.phase='notification';emit();},2000);emit();return true;}
 function acknowledgeNotification(){if(!allowed()||state.phase!=='notification')return false;state.notificationClicked=true;state.phase='ready';emit();return true;}
 function enterThreads(){if(!allowed()||!state.notificationClicked||!['ready','paused'].includes(state.phase))return false;active=true;state.phase='streaming';schedule(remaining);emit();return true;}
 function leaveThreads(){active=false;if(timer!==null){remaining=Math.max(0,deadline-now());clearTimer(timer);timer=null;state.phase='paused';emit();}}
 function cancel(){if(noticeTimer!==null)clearTimer(noticeTimer);if(timer!==null)clearTimer(timer);noticeTimer=timer=null;active=false;}
 const unsubscribeFlight=flight.subscribe(checkSuccess);
 const unsubscribeProgress=progress.subscribe(()=>{if(revision!==(progress.state.chapterDebugRevision||0)){revision=progress.state.chapterDebugRevision||0;cancel();state.phase='idle';state.notificationClicked=false;state.visibleCount=state.replyVisibleCount=0;remaining=600;next='post';decorated=decorate();emit();checkSuccess();}else if(!allowed()&&state.phase!=='idle'){cancel();state.phase='cancelled';emit();}});checkSuccess();
 return {state,acknowledgeNotification,enterThreads,leaveThreads,getVisiblePosts:()=>decorated.slice(0,state.visibleCount).map((post,i)=>({...post,replies:i===decorated.length-1?post.replies.slice(0,state.replyVisibleCount):post.replies})),subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},dispose(){cancel();unsubscribeFlight();unsubscribeProgress();listeners.clear();}};
}
export const chapter2Threads=createChapter2Threads();
gameProgress.state.chapter2Threads=chapter2Threads.state;
