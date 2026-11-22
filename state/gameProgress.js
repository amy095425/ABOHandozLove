// 全局游戏进度单例。所有 App 使用同一路径导入本模块，避免创建多份状态。
export function createGameProgress(){
 const state={currentChapter:1,chapter2Ready:false,chapter3Ready:false,agodaTaskCompleted:false,globalSystemDate:new Date('2030-10-07T14:51:00'),gameDate:'2030-10-07',chapterDebugRevision:0,calendarEvents:[]};
 const listeners=new Set();
 const notify=()=>listeners.forEach(listener=>listener({...state}));
 function getGlobalSystemDate(){return new Date(state.globalSystemDate.getTime());}
 function updateGlobalSystemDate(value){const date=new Date(value);if(Number.isNaN(date.getTime()))return false;state.globalSystemDate=date;state.gameDate=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;notify();return true;}
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
 function enterChapter(chapter){if(getChapterAction(chapter)!=='available')return false;state.currentChapter=chapter;if(chapter===2)updateGlobalSystemDate('2031-11-20T10:00:00');else if(chapter===3)updateGlobalSystemDate('2031-12-24T21:00:00');else notify();return true;}
 function debugJumpToChapter(chapter){if(![2,3].includes(chapter))return false;state.currentChapter=chapter;if(chapter===2)state.chapterDebugRevision++;updateGlobalSystemDate(chapter===2?'2031-11-20T10:00:00':'2031-12-24T21:00:00');console.log(chapter===2?'已跳转至第二章':'已跳转至第三章');return true;}
 function subscribe(listener){listeners.add(listener);return ()=>listeners.delete(listener);}
 return {state,debugJumpToChapter,getGlobalSystemDate,updateGlobalSystemDate,markAgodaTaskCompleted,triggerChapter2Ready,triggerChapter3Ready,getCurrentChapter,getChapterAction,enterChapter,subscribe};
}
export const gameProgress=createGameProgress();
export const gameState=gameProgress.state;
export const triggerChapter2Ready=gameProgress.triggerChapter2Ready;
export const triggerChapter3Ready=gameProgress.triggerChapter3Ready;
export const getCurrentChapter=gameProgress.getCurrentChapter;
// 仅用于开发者控制台测试；玩家页面不显示解锁控制按钮。
if(typeof window!=='undefined')window.gameProgress=gameProgress;

export const getGlobalSystemDate=gameProgress.getGlobalSystemDate;
export const updateGlobalSystemDate=gameProgress.updateGlobalSystemDate;
export function getSystemDateKey(){return gameProgress.state.gameDate;}
