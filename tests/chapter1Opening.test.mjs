import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameProgress} from '../state/gameProgress.js?v=chapter1-payment-fix-2';
import {createChapter1Opening,readingDelay} from '../state/chapter1Opening.js?v=chapter1-payment-fix-2';
import {chapter1Threads} from '../data/threadsPostsData.js?v=chapter1-opening-1';
function virtualClock(){
 let now=0,id=0;const jobs=new Map();
 return {now:()=>now,setTimer:(fn,delay)=>{jobs.set(++id,{fn,at:now+delay});return id;},clearTimer:id=>jobs.delete(id),pending:()=>jobs.size,
 tick(ms){const end=now+ms;while(true){const next=[...jobs].filter(([,j])=>j.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;jobs.delete(next[0]);next[1].fn();}now=end;}};
}
function setup(){const clock=virtualClock(),progress=createGameProgress(),story=createChapter1Opening({progress,...clock});return {clock,progress,story};}
test('5秒后显示通知，点击前不能自动或手动开始推流',()=>{
 const {clock,story}=setup();assert.equal(story.enterThreads(),false);assert.ok(story.onUnlocked());assert.equal(story.onUnlocked(),false);clock.tick(4999);assert.equal(story.state.phase,'waiting');clock.tick(1);assert.equal(story.state.phase,'notification');clock.tick(120000);assert.equal(story.state.visibleCount,0);assert.equal(story.enterThreads(),false);assert.ok(story.acknowledgeNotification());assert.ok(story.enterThreads());assert.equal(story.state.visibleCount,0);story.dispose();
});
test('14条按顺序和当前字数延时推送，结束后不重复或自动解锁第二章',()=>{
 const {clock,progress,story}=setup();story.onUnlocked();clock.tick(5000);story.acknowledgeNotification();story.enterThreads();clock.tick(600);assert.equal(story.state.visibleCount,1);
 for(let i=0;i<13;i++){const count=story.state.visibleCount;assert.equal(readingDelay(chapter1Threads[i].content),1500+Array.from(chapter1Threads[i].content).length*10);clock.tick(readingDelay(chapter1Threads[i].content)-1);assert.equal(story.state.visibleCount,count);clock.tick(1);assert.equal(story.state.visibleCount,count+1);}
 assert.deepEqual(story.getVisiblePosts(),chapter1Threads);assert.equal(story.state.phase,'complete');assert.equal(clock.pending(),0);assert.equal(progress.state.chapter2Ready,false);story.leaveThreads();story.enterThreads();clock.tick(100000);assert.equal(story.state.visibleCount,14);story.dispose();
});
test('离开暂停，回来按剩余时间续播，不重置已读帖子',()=>{
 const {clock,story}=setup();story.onUnlocked();clock.tick(5000);story.acknowledgeNotification();story.enterThreads();clock.tick(600);clock.tick(500);story.leaveThreads();assert.equal(story.state.phase,'paused');clock.tick(100000);assert.equal(story.state.visibleCount,1);story.enterThreads();assert.equal(story.enterThreads(),false);clock.tick(readingDelay(chapter1Threads[0].content)-501);assert.equal(story.state.visibleCount,1);clock.tick(1);assert.equal(story.state.visibleCount,2);story.dispose();
});
test('切换章节取消开场定时器，不能再点击通知开始第一章',()=>{
 const {clock,progress,story}=setup();story.onUnlocked();progress.triggerChapter2Ready();progress.enterChapter(2);clock.tick(100000);assert.equal(story.state.phase,'cancelled');assert.equal(story.acknowledgeNotification(),false);assert.equal(story.state.visibleCount,0);assert.equal(clock.pending(),0);story.dispose();
});
