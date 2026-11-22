import {gameProgress} from './gameProgress.js?v=chapter2-ending-1';
import {chapter2DoubanPost} from '../data/chapter2DoubanPost.js?v=chapter2-douban-1';
export const doubanCommentDelay=comment=>1500+Array.from(comment.content).length*40;
export function createChapter2Douban({progress=gameProgress,post=chapter2DoubanPost,chapter=2,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now}={}){
 const state={phase:'idle',notificationClicked:false,visibleCount:0};
 const listeners=new Set();let noticeTimer=null,timer=null,active=false,remaining=1000,deadline=0,debugRevision=progress.state.chapterDebugRevision||0;
 const emit=()=>listeners.forEach(fn=>fn({...state}));
 const allowed=()=>progress.getCurrentChapter()===chapter;
 function schedule(delay){remaining=delay;deadline=now()+delay;timer=setTimer(()=>{timer=null;if(!active||!allowed())return;const comment=post.comments[state.visibleCount];state.visibleCount++;if(state.visibleCount===post.comments.length)state.phase='complete';else schedule(doubanCommentDelay(comment));emit();},delay);}
 function checkChapter(){
  if(debugRevision!==(progress.state.chapterDebugRevision||0)){debugRevision=progress.state.chapterDebugRevision||0;if(noticeTimer!==null)clearTimer(noticeTimer);if(timer!==null)clearTimer(timer);noticeTimer=timer=null;active=false;remaining=1000;deadline=0;state.phase='idle';state.notificationClicked=false;state.visibleCount=0;emit();}

  if(!allowed()){if(noticeTimer!==null)clearTimer(noticeTimer);if(timer!==null)clearTimer(timer);noticeTimer=timer=null;active=false;if(state.phase!=='idle'){state.phase='cancelled';emit();}return;}
  if(state.phase!=='idle')return;
  state.phase='waiting';noticeTimer=setTimer(()=>{noticeTimer=null;if(!allowed())return;state.phase='notification';emit();},5000);emit();
 }
 function acknowledgeNotification(){if(state.phase!=='notification'||!allowed())return false;state.notificationClicked=true;state.phase='ready';emit();return true;}
 function enterPost(){if(!allowed()||!state.notificationClicked||!['ready','paused'].includes(state.phase))return false;active=true;state.phase='streaming';schedule(remaining);emit();return true;}
 function leavePost(){active=false;if(timer!==null){remaining=Math.max(0,deadline-now());clearTimer(timer);timer=null;state.phase='paused';emit();}}
 const unsubscribe=progress.subscribe(checkChapter);checkChapter();
 return {state,acknowledgeNotification,enterPost,leavePost,getVisibleComments:()=>post.comments.slice(0,state.visibleCount),subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},dispose(){if(noticeTimer!==null)clearTimer(noticeTimer);if(timer!==null)clearTimer(timer);unsubscribe();listeners.clear();}};
}
export const chapter2Douban=createChapter2Douban();
gameProgress.state.chapter2Douban=chapter2Douban.state;
