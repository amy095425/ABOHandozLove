import test from 'node:test';
import assert from 'node:assert/strict';
import {gameProgress,createGameProgress,updateGlobalSystemDate,getGlobalSystemDate} from '../state/gameProgress.js?v=chapter2-ending-1';
import {formatStatusTime} from '../components/StatusBar.js?v=chapter2-ending-1';
import {createCalendarModel} from '../apps/calendarModel.js?v=chapter2-ending-1';
import {insertMessage} from '../data/messageStore.js?v=chapter2-ending-1';
test('全局时间通知订阅，进入第二章即时统一到2031年11月20日10点',()=>{
 const p=createGameProgress();assert.equal(p.state.gameDate,'2030-10-07');assert.equal(p.getGlobalSystemDate().getHours(),14);let seen;
 p.subscribe(s=>seen=s.globalSystemDate);p.triggerChapter2Ready();assert.ok(p.enterChapter(2));assert.equal(p.state.gameDate,'2031-11-20');assert.equal(seen.getHours(),10);assert.equal(p.getGlobalSystemDate().getMinutes(),0);
 const copy=p.getGlobalSystemDate();copy.setFullYear(2000);assert.equal(p.getGlobalSystemDate().getFullYear(),2031);assert.equal(p.updateGlobalSystemDate('invalid'),false);
});
test('状态栏、日历今天与新增短信均读统一时间，旧短信日期不变',()=>{
 updateGlobalSystemDate('2030-10-07T14:51:00');assert.equal(formatStatusTime(),'14:51');const model=createCalendarModel();assert.equal(model.state.selectedDate,'2030-10-07');
 const old=insertMessage({sender:'日期校验',text:'第一章'}),oldDate=old.date;
 gameProgress.triggerChapter2Ready();gameProgress.enterChapter(2);assert.equal(formatStatusTime(),'10:00');model.today();assert.equal(model.state.selectedDate,'2031-11-20');assert.equal(createCalendarModel().state.selectedDate,'2031-11-20');assert.equal(getGlobalSystemDate().getFullYear(),2031);
 const message=insertMessage({sender:'日期校验',text:'第二章'});assert.match(message.date,/2031/);assert.match(message.date,/11/);assert.equal(old.date,oldDate);
});
