import {gameProgress} from './gameProgress.js?v=chapter2-ending-1';
import {chapter3Redbook} from './chapter3Redbook.js?v=chapter3-redbook-1';
import {chapter3ThreadsPosts} from '../data/chapter3ThreadsPosts.js?v=chapter3-threads-1';
export const chapter3ThreadsDelay=post=>post.image?2500:1500+Array.from(post.content).length*40;
export function createChapter3Threads({progress=gameProgress,redbook=chapter3Redbook,posts=chapter3ThreadsPosts,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now}={}){
 const state={phase:'idle',notificationClicked:false,visibleCount:0};const listeners=new Set();let timer=null,noticeTimer=null,remaining=600,deadline=0,active=false,revision=progress.state.chapterDebugRevision||0;
 const decorated=posts.map((post,i)=>({...post,avatarColor:`hsl(${(i*73+25)%360} 50% 88%)`}));
 const emit=()=>listeners.forEach(fn=>fn({...state})),allowed=()=>progress.getCurrentChapter()===3;
 function onRedbookRendered(floor){if(floor!==21||!allowed()||state.phase!=='idle'||redbook.state.phase!=='complete'||redbook.state.visibleCount!==25)return false;state.phase='waiting';noticeTimer=setTimer(()=>{noticeTimer=null;if(!allowed())return;state.phase='notification';emit();},3000);emit();return true;}
 function acknowledgeNotification(){if(!allowed()||state.phase!=='notification')return false;state.notificationClicked=true;state.phase='ready';emit();return true;}
 function schedule(delay){remaining=delay;deadline=now()+delay;timer=setTimer(()=>{timer=null;if(!active||!allowed())return;const post=posts[state.visibleCount];state.visibleCount++;if(state.visibleCount===posts.length)state.phase='complete';else schedule(chapter3ThreadsDelay(post));emit();},delay);}
 function enterThreads(){if(!allowed()||!state.notificationClicked||!['ready','paused'].includes(state.phase))return false;active=true;state.phase='streaming';schedule(remaining);emit();return true;}
 function leaveThreads(){active=false;if(timer!==null){remaining=Math.max(0,deadline-now());clearTimer(timer);timer=null;state.phase='paused';emit();}}
 function cancel(){if(timer!==null)clearTimer(timer);if(noticeTimer!==null)clearTimer(noticeTimer);timer=noticeTimer=null;active=false;}
 const unsubscribe=progress.subscribe(()=>{if(revision!==(progress.state.chapterDebugRevision||0)){revision=progress.state.chapterDebugRevision||0;cancel();state.phase='idle';state.notificationClicked=false;state.visibleCount=0;remaining=600;emit();}else if(!allowed()&&state.phase!=='idle'){cancel();state.phase='cancelled';emit();}});
 return {state,onRedbookRendered,acknowledgeNotification,enterThreads,leaveThreads,getVisiblePosts:()=>decorated.slice(0,state.visibleCount),subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},dispose(){cancel();unsubscribe();listeners.clear();}};
}
export const chapter3Threads=createChapter3Threads();
gameProgress.state.chapter3Threads=chapter3Threads.state;
