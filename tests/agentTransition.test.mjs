import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameProgress} from '../state/gameProgress.js?v=chapter2-ending-1';
import {createChapter1Kkt,kktReadingDelay} from '../state/chapter1Kkt.js?v=chapter2-ending-1';
import {agentChatData} from '../data/agentChatData.js?v=chapter2-agent-1';
import {renderKkt} from '../apps/kkt.js?v=chapter3-douban-1';
import data from '../data/kkt.js?v=chapter1-agent-wired-1';
test('哥哥结束3秒通知，经纪人逐条打字，离开续播，结束3秒邀请，确认行程才进入第二章',()=>{
 let time=0,id=0;const jobs=new Map(),progress=createGameProgress();
 const tick=ms=>{const end=time+ms;while(true){const next=[...jobs].filter(([,j])=>j.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;jobs.delete(next[0]);next[1].fn();}time=end;};
 const story=createChapter1Kkt({progress,messages:[{text:'我可能比你想象中还想见你',isMe:true}],now:()=>time,setTimer:(fn,delay)=>{jobs.set(++id,{fn,at:time+delay});return id;},clearTimer:id=>jobs.delete(id)});
 progress.markAgodaTaskCompleted();tick(5000);story.acknowledgeNotification();story.enterChat();tick(800);assert.equal(story.state.phase,'complete');tick(2999);assert.equal(story.state.agentPhase,'idle');tick(1);assert.equal(story.state.agentPhase,'notification');assert.equal(story.enterAgentChat(),false);tick(10000);assert.equal(story.state.agentVisibleCount,0);assert.ok(story.acknowledgeAgent());assert.ok(story.enterAgentChat());tick(300);story.leaveChat();tick(10000);assert.equal(story.state.agentVisibleCount,0);story.enterAgentChat();tick(499);assert.equal(story.state.agentVisibleCount,0);tick(1);assert.equal(story.state.agentVisibleCount,1);
 for(let i=1;i<agentChatData.length;i++){tick(kktReadingDelay(agentChatData[i-1]));assert.equal(story.getAgentTyping(),agentChatData[i]);tick(799);assert.equal(story.state.agentVisibleCount,i);tick(1);assert.equal(story.state.agentVisibleCount,i+1);}
 assert.equal(story.state.agentPhase,'complete');story.leaveChat();tick(2999);assert.equal(story.state.calendarPrompt,false);tick(1);assert.equal(story.state.calendarPrompt,true);assert.equal(progress.getCurrentChapter(),1);story.acknowledgeCalendarPrompt(true);assert.equal(story.state.pendingCalendarEvent,true);assert.equal(progress.getCurrentChapter(),1);assert.ok(story.completeCalendarEvent());assert.equal(progress.getCurrentChapter(),2);assert.equal(progress.state.gameDate,'2031-11-20');assert.equal(story.completeCalendarEvent(),false);story.dispose();
});
test('经纪人聊天室显示经纪人名字，原联系人数据保留',()=>{assert.equal(data.agent.name,'经纪人');assert.equal(data.friend.name,'哥哥🐕');assert.ok(data.messages.length);assert.ok(renderKkt(data,'agent-chat',String).includes('与经纪人的聊天'));});
