import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createGameProgress} from '../state/gameProgress.js?v=chapter1-payment-fix-2';
import {createChapter1Kkt,kktReadingDelay} from '../state/chapter1Kkt.js?v=chapter1-kkt-details-3';
import {chapter1KktChat} from '../data/chapter1KktChat.js?v=chapter1-kkt-details-3';
function setup(){let time=0,id=0;const jobs=new Map(),progress=createGameProgress();const story=createChapter1Kkt({progress,now:()=>time,setTimer:(fn,delay)=>{jobs.set(++id,{fn,at:time+delay});return id;},clearTimer:id=>jobs.delete(id)});return {story,progress,pending:()=>jobs.size,tick(ms){const end=time+ms;while(true){const next=[...jobs].filter(([,j])=>j.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;jobs.delete(next[0]);next[1].fn();}time=end;}};}
test('任务完成后精确5秒弹出，不点击不推流',()=>{const s=setup();assert.equal(s.story.enterChat(),false);s.progress.markAgodaTaskCompleted();s.tick(4999);assert.equal(s.story.state.phase,'waiting');s.tick(1);assert.equal(s.story.state.phase,'notification');s.tick(100000);assert.equal(s.story.state.visibleCount,0);assert.equal(s.story.enterChat(),false);assert.ok(s.story.acknowledgeNotification());assert.ok(s.story.enterChat());assert.equal(s.story.getTyping().isMe,false);s.tick(799);assert.equal(s.story.state.visibleCount,0);s.tick(1);assert.equal(s.story.state.visibleCount,1);s.story.dispose();});
test('全部文本图片按序推送，下一条均先输入800ms，阅读时长正确',()=>{const s=setup();s.progress.markAgodaTaskCompleted();s.tick(5000);s.story.acknowledgeNotification();s.story.enterChat();for(let i=0;i<chapter1KktChat.length;i++){assert.equal(s.story.state.visibleCount,i);assert.equal(s.story.getTyping().isMe,chapter1KktChat[i].isMe);s.tick(799);assert.equal(s.story.state.visibleCount,i);s.tick(1);assert.equal(s.story.state.visibleCount,i+1);assert.equal(s.story.getTyping(),null);const msg=chapter1KktChat[i];if(msg.type==='image'){assert.ok(existsSync(msg.src));assert.equal(kktReadingDelay(msg),2500);}else assert.equal(kktReadingDelay(msg),1500+Array.from(msg.text).length*40);if(i<chapter1KktChat.length-1){s.tick(kktReadingDelay(msg)-1);assert.equal(s.story.getTyping(),null);s.tick(1);}}assert.equal(s.story.state.phase,'complete');assert.equal(s.pending(),0);assert.deepEqual(s.story.getVisibleMessages().map(m=>m.text),chapter1KktChat.map(m=>m.text));assert.equal(s.story.getVisibleMessages().at(-1).text,'我可能比你想象中还想见你');assert.ok(s.story.getVisibleMessages().every((m,i)=>m.mine===chapter1KktChat[i].isMe));s.story.dispose();});
test('输入气泡和阅读阶段均可暂停续播，不重复消息',()=>{const s=setup();s.progress.markAgodaTaskCompleted();s.tick(5000);s.story.acknowledgeNotification();s.story.enterChat();s.tick(300);s.story.leaveChat();s.tick(99999);assert.equal(s.story.state.visibleCount,0);s.story.enterChat();s.tick(499);assert.equal(s.story.state.visibleCount,0);s.tick(1);assert.equal(s.story.state.visibleCount,1);s.tick(100);s.story.leaveChat();s.tick(10000);s.story.enterChat();s.tick(kktReadingDelay(chapter1KktChat[0])-100);assert.equal(s.story.state.visibleCount,1);assert.equal(s.story.getTyping(),chapter1KktChat[1]);s.tick(800);assert.equal(s.story.state.visibleCount,2);s.story.dispose();});
test('离开第一章清理通知与输入计时器',()=>{const s=setup();s.progress.markAgodaTaskCompleted();s.progress.triggerChapter2Ready();s.progress.enterChapter(2);s.tick(100000);assert.equal(s.story.state.phase,'cancelled');assert.equal(s.pending(),0);assert.equal(s.story.acknowledgeNotification(),false);s.story.dispose();});

test('高潮剧情使用新图片且通知预览来自第一条确认信息',async()=>{
 const {chapter1KktPreview}=await import('../data/chapter1KktChat.js?v=chapter1-kkt-details-3');
 assert.deepEqual(chapter1KktChat.filter(m=>m.type==='image').map(m=>m.src),['./agoda/kkt图片3.png','./agoda/kkt图片4.jpg']);
 assert.equal(chapter1KktPreview,chapter1KktChat[0].text.slice(0,30)+'...');
 const {renderKktMessage}=await import('../apps/kkt.js?v=chapter1-kkt-details-3');
 const people={owner:{name:'ZHEN🐈‍⬛',avatar:'me.png'},friend:{name:'哥哥🐕',avatar:'friend.png'}};
 for(const isMe of [false,true]){
  const html=renderKktMessage(people,{isMe,type:'image',src:'./agoda/kkt图片3.png'},String);
  assert.ok(html.includes(isMe?'is-mine is-image':'is-friend is-image'));
  assert.ok(html.includes(isMe?'me.png':'friend.png'));
 }
});
