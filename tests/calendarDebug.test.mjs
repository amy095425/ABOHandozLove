import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameProgress} from '../state/gameProgress.js?v=chapter2-ending-1';
import {createChapter2Douban} from '../state/chapter2Douban.js?v=chapter3-douban-1';
test('调试跳转绕过前置条件，统一章节日期；正常章节入口仍检查前置条件',()=>{
 const p=createGameProgress();assert.equal(p.enterChapter(2),false);assert.equal(p.getCurrentChapter(),1);assert.ok(p.debugJumpToChapter(2));assert.equal(p.getCurrentChapter(),2);assert.equal(p.state.gameDate,'2031-11-20');assert.equal(p.getGlobalSystemDate().getHours(),10);assert.equal(p.state.chapter2Ready,false);assert.ok(p.debugJumpToChapter(3));assert.equal(p.getCurrentChapter(),3);assert.equal(p.state.gameDate,'2031-12-24');assert.equal(p.debugJumpToChapter(1),false);
});
test('重复跳第二章重置评论和通知，5秒重新开场，第三章取消第二章计时',()=>{
 const p=createGameProgress();let time=0,id=0;const jobs=new Map();
 const tick=ms=>{const end=time+ms;while(true){const next=[...jobs].filter(([,j])=>j.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;jobs.delete(next[0]);next[1].fn();}time=end;};
 const story=createChapter2Douban({progress:p,now:()=>time,setTimer:(fn,delay)=>{jobs.set(++id,{fn,at:time+delay});return id;},clearTimer:id=>jobs.delete(id)});
 p.debugJumpToChapter(2);tick(5000);story.acknowledgeNotification();story.enterPost();tick(1000);assert.equal(story.state.visibleCount,1);
 p.debugJumpToChapter(2);assert.equal(story.state.visibleCount,0);assert.equal(story.state.notificationClicked,false);assert.equal(story.state.phase,'waiting');assert.equal(jobs.size,1);tick(4999);assert.equal(story.state.phase,'waiting');tick(1);assert.equal(story.state.phase,'notification');
 p.debugJumpToChapter(3);assert.equal(jobs.size,0);tick(100000);assert.notEqual(story.state.phase,'notification');assert.equal(story.enterPost(),false);
 p.debugJumpToChapter(2);tick(5000);assert.equal(story.state.phase,'notification');story.dispose();
});
