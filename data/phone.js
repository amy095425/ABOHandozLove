import {callHistoryData} from './callHistoryData.js?v=phone-recents-1';
/* 修改本 App 的文字与内容；空数组代表默认没有历史数据。 */
export default {
  "id": "phone",
  "name": "电话",
  "color": "#2bc568",
  "glyph": "☎",
  "tabs": [
    "个人收藏",
    "最近通话",
    "通讯录",
    "拨号键盘",
    "语音留言"
  ],
  "title": "最近通话",
  "empty": "暂无内容",
  "search": "搜索",
  "action": "查看空白详情",
  "detailTitle": "详情",
  "input": "输入信息",
  "items": [],
  "calls": callHistoryData,
  "voicemails": []
};
