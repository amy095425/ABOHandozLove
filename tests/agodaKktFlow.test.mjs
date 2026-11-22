import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createGameProgress} from '../state/gameProgress.js?v=chapter2-ending-1';
import {createAgodaTask} from '../state/agodaTask.js?v=chapter2-ending-1';
import {createChapter1Kkt} from '../state/chapter1Kkt.js?v=chapter2-ending-1';
import {createAgodaStore} from '../apps/agodaStore.js?v=chapter2-ending-1';

// Exercise a real paid order through the shared progress subscription and KKT timer.
test('Agoda签名支付完成后5秒触发KKT，点击后推送酒店确认消息',()=>{
 let time=0,id=0;const jobs=new Map();
 const setTimer=(fn,delay)=>{jobs.set(++id,{fn,at:time+delay});return id;};
 const clearTimer=id=>jobs.delete(id);
 const tick=ms=>{const end=time+ms;while(true){const next=[...jobs].filter(([,j])=>j.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;jobs.delete(next[0]);next[1].fn();}time=end;};
 const progress=createGameProgress();let nextStages=0;
 const story=createChapter1Kkt({progress,setTimer,clearTimer,now:()=>time});
 const task=createAgodaTask({progress,setTimer,clearTimer,onNextStage:()=>nextStages++});
 const store=createAgodaStore({random:()=>.5});
 store.enterExplore();store.setDates('2030-10-07','2030-10-10');store.openHotel(1);store.selectRoom(1);store.toggleGuest('kim',true);store.beginPayment();store.selectCard('mastercard');assert.ok(store.verifyPassword('060105'));store.markSigned(true);
 const order=store.pay('data:image/png;base64,test-signature');
 assert.ok(task.checkPaidOrder(order));assert.equal(progress.state.agodaTaskCompleted,true);
 tick(2000);assert.equal(nextStages,1);assert.equal(story.state.phase,'waiting');
 tick(2999);assert.equal(story.state.phase,'waiting');tick(1);assert.equal(story.state.phase,'notification');
 tick(10000);assert.equal(story.state.visibleCount,0);
 assert.ok(story.acknowledgeNotification());assert.ok(story.enterChat());tick(800);
 assert.equal(story.getVisibleMessages()[0].text,'【半岛酒店】Kim Dohoon 先生/女士您好！您已成功订购【王府半岛·豪华套间大床房】，入住时间为 2030年10月7号至10月10号 。当前订单已确认。请核对入住人、入住/离店日期及房型信息。如需修改或取消，请提前联系我们。感谢您的支持，祝您生活愉快！');
 task.dispose();story.dispose();
});

test('所有生产模块共用同一版本的全局进度，入口引用更新后的付款和通知模块',()=>{
 const urls=[];
 for(const folder of ['apps','components','state','data'])for(const file of readdirSync(new URL('../'+folder+'/',import.meta.url))){
  if(!file.endsWith('.js'))continue;
  const source=readFileSync(new URL('../'+folder+'/'+file,import.meta.url),'utf8');
  for(const match of source.matchAll(/from\s*['"]([^'"]*gameProgress\.js[^'"]*)['"]/g))urls.push(new URL(match[1],new URL('../'+folder+'/'+file,import.meta.url)).href);
 }
 assert.ok(urls.length>1);assert.equal(new Set(urls).size,1);assert.ok(urls[0].endsWith('?v=chapter2-ending-1'));
 const main=readFileSync(new URL('../apps/main.js?v=chapter1-payment-fix-2',import.meta.url),'utf8');
 assert.ok(main.includes('./agoda.js?v=modal-headers-1'));
 assert.ok(main.includes('../components/chapter1Notice.js?v=notification-layout-1'));
 assert.ok(readFileSync(new URL('../index.html',import.meta.url),'utf8').includes('./apps/main.js?v=single-home-1'));
});
