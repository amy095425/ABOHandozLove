import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameProgress} from '../state/gameProgress.js?v=chapter2-ending-1';
import {createChapter2Douban,doubanCommentDelay} from '../state/chapter2Douban.js?v=chapter3-douban-1';
import {chapter2DoubanPost} from '../data/chapter2DoubanPost.js?v=chapter2-douban-1';
import {chapter3DoubanPost} from '../data/chapter3DoubanPost.js?v=chapter3-douban-1';
// Minimal DOM fixture: count actual appended comment markup, rather than only store snapshots.
function dom(){const article={append(el){this.comments=el;}},feed={scrollHeight:0,clientHeight:600,scrollTop:0,querySelector:()=>article,scrollTo(){}};const root={writes:0,set innerHTML(value){this.markup=value;this.writes++;},querySelector:()=>feed};globalThis.document={addEventListener(){},createElement(){return {setAttribute(){},rows:[],replaceChildren(){this.rows=[];},insertAdjacentHTML(where,html){this.rows.push(html);this.lastElementChild={classList:{add(){}}};}};}};return {root,article,feed};}
function clock(){let time=0,id=0;const jobs=new Map();return {jobs,now:()=>time,setTimer:(fn,delay)=>{jobs.set(++id,{fn,at:time+delay});return id;},clearTimer:id=>jobs.delete(id),tick(ms){const end=time+ms;for(;;){const next=[...jobs].filter(([,j])=>j.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;jobs.delete(next[0]);next[1].fn();}time=end;}};}
test('第二章95楼与第三章54楼在当前详情视图逐条追加，不依赖路由CSS类，不需退出重进',async()=>{
 const fixture=dom();const {createDoubanDetailView}=await import('../apps/doubanStory.js?v=chapter3-redbook-1');
 for(const chapter of [2,3]){
  const c=clock(),progress=createGameProgress(),post=chapter===2?chapter2DoubanPost:chapter3DoubanPost;progress.debugJumpToChapter(chapter);
  const story=createChapter2Douban({...c,progress,post,chapter});c.tick(5000);story.acknowledgeNotification();let completed=0;
  const view=createDoubanDetailView({root:fixture.root,e:String,chapter,post,story,onComplete:()=>completed++,requestFrame:fn=>fn()});view.start();assert.equal(view.displayedComments.length,0);assert.equal(fixture.article.comments.rows.length,0);c.tick(999);assert.equal(fixture.article.comments.rows.length,0);c.tick(1);
  for(let i=0;i<post.comments.length;i++){
   assert.equal(view.currentIndex,i+1);assert.equal(fixture.article.comments.rows.length,i+1);assert.ok(fixture.article.comments.rows[i].includes(`data-floor="${i+1}"`));
   // Unrelated global time changes must neither rebuild the DOM nor cancel the timer.
   const writes=fixture.root.writes;progress.updateGlobalSystemDate(chapter===2?'2031-11-20T10:01:00':'2031-12-24T21:01:00');assert.equal(fixture.root.writes,writes);
   view.start();view.sync();assert.equal(fixture.article.comments.rows.length,i+1);
   if(i<post.comments.length-1){c.tick(doubanCommentDelay(post.comments[i])-1);assert.equal(fixture.article.comments.rows.length,i+1);c.tick(1);}
  }
  assert.equal(completed,1);assert.equal(c.jobs.size,0);assert.equal(view.currentIndex,post.comments.length);view.unsubscribe();story.dispose();
 }
 delete globalThis.document;
});
test('真正离开才清理定时器；返回恢复已读，重新订阅后继续增量追加',async()=>{const f=dom(),{createDoubanDetailView}=await import('../apps/doubanStory.js?v=chapter3-redbook-1'),c=clock(),progress=createGameProgress();progress.debugJumpToChapter(3);const story=createChapter2Douban({...c,progress,post:chapter3DoubanPost,chapter:3});c.tick(5000);story.acknowledgeNotification();let view=createDoubanDetailView({root:f.root,e:String,chapter:3,post:chapter3DoubanPost,story,requestFrame:fn=>fn()});view.start();c.tick(1000);view.unsubscribe();story.leavePost();c.tick(100000);assert.equal(story.state.visibleCount,1);view=createDoubanDetailView({root:f.root,e:String,chapter:3,post:chapter3DoubanPost,story,requestFrame:fn=>fn()});view.start();assert.equal(f.article.comments.rows.length,1);c.tick(doubanCommentDelay(chapter3DoubanPost.comments[0]));assert.equal(f.article.comments.rows.length,2);view.unsubscribe();story.dispose();delete globalThis.document;});

test('第95楼写入当前详情DOM后才启动KKT的3秒通知，重复同步不重复触发',async()=>{
 const f=dom(),{createDoubanDetailView}=await import('../apps/doubanStory.js?v=chapter3-redbook-1');
 const {createChapter2Kkt}=await import('../state/chapter2Kkt.js?v=chapter3-douban-1');
 const c=clock(),progress=createGameProgress();progress.debugJumpToChapter(2);
 const story=createChapter2Douban({...c,progress}),kkt=createChapter2Kkt({...c,progress,douban:story});
 c.tick(5000);story.acknowledgeNotification();let callbacks=0;
 const view=createDoubanDetailView({root:f.root,e:String,chapter:2,post:chapter2DoubanPost,story,requestFrame:fn=>fn(),onComplete:last=>{assert.equal(f.article.comments.rows.length,95);assert.equal(last.floor,95);callbacks++;kkt.onCommentsRendered(last.floor);}});
 view.start();c.tick(1000);for(let i=0;i<94;i++)c.tick(doubanCommentDelay(chapter2DoubanPost.comments[i]));
 assert.equal(callbacks,1);assert.equal(kkt.state.phase,'waiting');view.start();view.sync();assert.equal(callbacks,1);
 c.tick(2999);assert.equal(kkt.state.phase,'waiting');c.tick(1);assert.equal(kkt.state.phase,'notification');
 view.dispose();story.dispose();kkt.dispose();delete globalThis.document;
});
