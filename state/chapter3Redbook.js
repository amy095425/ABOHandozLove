import {gameProgress} from './gameProgress.js?v=chapter2-ending-1';
import {chapter3Douban} from './chapter3Douban.js?v=chapter3-douban-1';
import {chapter3RedbookPost} from '../data/chapter3RedbookPost.js?v=chapter3-redbook-1';
export function createChapter3Redbook({progress=gameProgress,douban=chapter3Douban,post=chapter3RedbookPost,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now}={}){
 const state={phase:'idle',notificationClicked:false,visibleCount:0,interactions:{}};const listeners=new Set();let timer=null,noticeTimer=null,active=false,remaining=1000,deadline=0,revision=progress.state.chapterDebugRevision||0;
 const emit=()=>listeners.forEach(fn=>fn({...state})),allowed=()=>progress.getCurrentChapter()===3;
 function onDoubanRendered(floor){if(floor!==54||!allowed()||douban.state.phase!=='complete'||douban.state.visibleCount!==54||state.phase!=='idle')return false;state.phase='waiting';noticeTimer=setTimer(()=>{noticeTimer=null;if(!allowed())return;state.phase='notification';emit();},2000);emit();return true;}
 function acknowledgeNotification(){if(!allowed()||state.phase!=='notification')return false;state.notificationClicked=true;state.phase='ready';emit();return true;}
 function schedule(delay){remaining=delay;deadline=now()+delay;timer=setTimer(()=>{timer=null;if(!active||!allowed())return;const comment=post.comments[state.visibleCount];state.visibleCount++;if(state.visibleCount===post.comments.length)state.phase='complete';else schedule(1500+Array.from(comment.content).length*40);emit();},delay);}
 function enterPost(){if(!allowed()||!state.notificationClicked||!['ready','paused'].includes(state.phase))return false;active=true;state.phase='streaming';schedule(remaining);emit();return true;}
 function leavePost(){active=false;if(timer!==null){remaining=Math.max(0,deadline-now());clearTimer(timer);timer=null;state.phase='paused';emit();}}
 function cancel(){if(timer!==null)clearTimer(timer);if(noticeTimer!==null)clearTimer(noticeTimer);timer=noticeTimer=null;active=false;}
 const unsubscribe=progress.subscribe(()=>{if(revision!==(progress.state.chapterDebugRevision||0)){revision=progress.state.chapterDebugRevision||0;cancel();state.phase='idle';state.notificationClicked=false;state.visibleCount=0;remaining=1000;emit();}else if(!allowed()&&state.phase!=='idle'){cancel();state.phase='cancelled';emit();}});
 return {state,onDoubanRendered,acknowledgeNotification,enterPost,leavePost,getVisibleComments:()=>post.comments.slice(0,state.visibleCount),subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},dispose(){cancel();unsubscribe();listeners.clear();}};
}
export const chapter3Redbook=createChapter3Redbook();
gameProgress.state.chapter3Redbook=chapter3Redbook.state;
