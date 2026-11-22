import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameProgress} from '../state/gameProgress.js?v=chapter2-ending-1';
import {createChapter2Douban,doubanCommentDelay} from '../state/chapter2Douban.js?v=chapter3-douban-1';
import {chapter2DoubanPost as post} from '../data/chapter2DoubanPost.js?v=chapter2-douban-1';
function setup(){const progress=createGameProgress();let time=0,id=0;const jobs=new Map();const story=createChapter2Douban({progress,now:()=>time,setTimer:(fn,delay)=>{jobs.set(++id,{fn,at:time+delay});return id;},clearTimer:id=>jobs.delete(id)});return {progress,story,jobs,tick(ms){const end=time+ms;while(true){const next=[...jobs].filter(([,j])=>j.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;jobs.delete(next[0]);next[1].fn();}time=end;}};}
const enter=s=>{s.progress.triggerChapter2Ready();s.progress.enterChapter(2);};
test('第二章5秒通知，点击前无评论，点击后主楼等待1秒再推送95条',()=>{const s=setup();s.tick(100000);assert.equal(s.story.state.phase,'idle');enter(s);s.tick(4999);assert.equal(s.story.state.phase,'waiting');s.tick(1);assert.equal(s.story.state.phase,'notification');assert.equal(s.story.enterPost(),false);s.tick(100000);assert.equal(s.story.state.visibleCount,0);assert.ok(s.story.acknowledgeNotification());assert.ok(s.story.enterPost());s.tick(999);assert.equal(s.story.state.visibleCount,0);s.tick(1);for(let i=0;i<95;i++){assert.equal(s.story.state.visibleCount,i+1);if(i<94){s.tick(doubanCommentDelay(post.comments[i])-1);assert.equal(s.story.state.visibleCount,i+1);s.tick(1);}}assert.equal(s.story.state.phase,'complete');assert.equal(s.jobs.size,0);assert.deepEqual(s.story.getVisibleComments(),post.comments);assert.equal(s.story.enterPost(),false);s.story.dispose();});
test('离开暂停并按剩余延时续播，章节变化清理定时器',()=>{const s=setup();enter(s);s.tick(5000);s.story.acknowledgeNotification();s.story.enterPost();s.tick(400);s.story.leavePost();s.tick(100000);assert.equal(s.story.state.visibleCount,0);s.story.enterPost();s.tick(599);assert.equal(s.story.state.visibleCount,0);s.tick(1);assert.equal(s.story.state.visibleCount,1);s.progress.triggerChapter3Ready();s.progress.enterChapter(3);s.tick(100000);assert.equal(s.story.state.phase,'cancelled');assert.equal(s.jobs.size,0);s.story.dispose();});
test('95楼完整有序，保留回复和emoji，纯色作者头像，无图片404',async()=>{assert.equal(post.comments.length,95);assert.deepEqual(post.comments.map(c=>c.floor),Array.from({length:95},(_,i)=>i+1));assert.equal(post.comments[7].replyTo,'八代丝');assert.equal(post.comments[89].replyTo,'生育率');assert.ok(post.content.endsWith('🫰'));assert.ok(post.comments[35].content.includes('🧏‍♀️'));globalThis.document={addEventListener(){}};const {renderDoubanFeed}=await import('../apps/douban.js?v=chapter3-douban-1');const html=renderDoubanFeed([post],String);assert.ok(html.includes('回复 @八代丝：'));assert.ok(html.includes('95楼'));assert.ok(!html.includes('<img'));assert.ok(!html.includes('undefined'));delete globalThis.document;});

test('点击通知后停留主页不会推流，手动进入详情才等待一秒推第一条',()=>{
 const s=setup();enter(s);s.tick(5000);s.story.acknowledgeNotification();s.tick(60000);assert.equal(s.story.state.phase,'ready');assert.equal(s.story.state.visibleCount,0);assert.equal(s.jobs.size,0);
 s.story.enterPost();s.tick(999);assert.equal(s.story.state.visibleCount,0);s.tick(1);assert.equal(s.story.state.visibleCount,1);
 s.story.leavePost();s.tick(60000);assert.equal(s.story.state.visibleCount,1);s.story.dispose();
});
test('首页新帖仅有纯色头像、标题与摘要，不泄露评论；详情互动按钮保留',async()=>{
 globalThis.document={addEventListener(){}};
 const {renderDoubanPreview,renderDoubanFeed}=await import('../apps/douban.js?v=chapter3-douban-1');
 const card=renderDoubanPreview(post,String);assert.ok(card.includes('data-action="douban-story"'));assert.ok(card.includes(post.title));assert.ok(card.includes(post.content));assert.ok(card.includes('匿'));assert.ok(!card.includes('douban-comments'));assert.ok(!card.includes('data-floor'));assert.ok(!card.includes('<img'));
 const feed=renderDoubanFeed([],String,card);assert.ok(feed.indexOf(card)>feed.indexOf('aria-label="豆瓣首页帖子列表"'));
 const detail=renderDoubanFeed([{...post,comments:[]}],String);for(const action of ['follow','like','collect','share'])assert.ok(detail.includes('data-douban-action="'+action+'"'));assert.ok(detail.includes(post.group));assert.ok(detail.includes(post.tag));assert.ok(detail.includes(post.content));
 delete globalThis.document;
});
