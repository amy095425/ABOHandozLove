import { youtubeVideos } from './youtubeVideosData.js?v=youtube-feed-1';
/* 修改本 App 的文字与内容；空数组代表默认没有历史数据。 */
export default {
  "id": "youtube",
  "name": "YouTube",
  "color": "#ed2828",
  "glyph": "▶",
  "tabs": [
    "首页",
    "Shorts",
    "添加",
    "订阅",
    "我"
  ],
  "title": "YouTube",
  "empty": "暂无内容",
  "search": "搜索 YouTube",
  "action": "查看空白详情",
  "detailTitle": "视频",
  "input": "输入信息",
  "items": [],
  "videos": youtubeVideos,
  "placeholderCount": 4
};
