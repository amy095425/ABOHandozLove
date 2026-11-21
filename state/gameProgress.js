// 全局游戏进度单例。所有 App 使用同一路径导入本模块，避免创建多份状态。
export function createGameProgress(){
 const state={currentChapter:1,chapter2Ready:false,chapter3Ready:false,agodaTaskCompleted:false};
 const listeners=new Set();
 const notify=()=>listeners.forEach(listener=>listener({...state}));
 function triggerChapter2Ready(){state.chapter2Ready=true;notify();}
 function triggerChapter3Ready(){state.chapter3Ready=true;notify();}
 function markAgodaTaskCompleted(){if(state.agodaTaskCompleted)return false;state.agodaTaskCompleted=true;notify();return true;}
 function getCurrentChapter(){return state.currentChapter;}
 function getChapterAction(chapter){
  if(chapter===state.currentChapter)return 'current';
  if(chapter<state.currentChapter&&chapter>=1)return 'completed';
  if(chapter===2&&state.currentChapter===1&&state.chapter2Ready)return 'available';
  if(chapter===3&&state.currentChapter===2&&state.chapter3Ready)return 'available';
  return 'locked';
 }
 function enterChapter(chapter){if(getChapterAction(chapter)!=='available')return false;state.currentChapter=chapter;notify();return true;}
 function subscribe(listener){listeners.add(listener);return ()=>listeners.delete(listener);}
 return {state,markAgodaTaskCompleted,triggerChapter2Ready,triggerChapter3Ready,getCurrentChapter,getChapterAction,enterChapter,subscribe};
}
export const gameProgress=createGameProgress();
export const gameState=gameProgress.state;
export const triggerChapter2Ready=gameProgress.triggerChapter2Ready;
export const triggerChapter3Ready=gameProgress.triggerChapter3Ready;
export const getCurrentChapter=gameProgress.getCurrentChapter;
// 仅用于开发者控制台测试；玩家页面不显示解锁控制按钮。
if(typeof window!=='undefined')window.gameProgress=gameProgress;
