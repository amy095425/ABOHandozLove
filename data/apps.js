import threads from './threads.js?v=threads-shell-1';
import calendar from './calendar.js?v=calendar-chapters-1';
import {homeIconOverrides} from './homeIcons.js?v=single-home-1';
import umetrip from './umetrip.js?v=umetrip-1';
import kkt from './kkt.js?v=chapter1-agent-wired-1';
import youtube from './youtube.js?v=youtube-feed-1';
import douban from './douban.js?v=comment-20301112-1';
import health from './health.js?v=health-range-15-1';
import redbook from './redbook.js?v=redbook-titles-4';
import taobao from './taobao.js';
import agoda from './agoda.js?v=agoda-icon-1';
import notes from './notes.js?v=memo-croissant-1';
import messages from './messages.js';
import clock from './clock.js';
import phone from './phone.js?v=phone-recents-1';
export const apps = [kkt,youtube,douban,health,redbook,taobao,agoda,notes,messages,clock,phone,umetrip,calendar,threads];

// 保持原数据对象引用，确保短信、备忘录等共享状态继续同步。
for(const app of apps){if(homeIconOverrides[app.id])Object.assign(app,homeIconOverrides[app.id]);}
