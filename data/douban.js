import { doubanPosts } from './doubanPostsData.js?v=comment-20301112-1';
/* 修改本 App 的文字与内容；空数组代表默认没有历史数据。 */
export default {
  "id": "douban",
  "name": "豆瓣",
  "color": "#27a657",
  "glyph": "豆",
  "tabs": [
    "首页",
    "书影音",
    "小组",
    "我"
  ],
  "title": "豆瓣",
  "empty": "暂无内容",
  "search": "搜索",
  "action": "查看帖子框架",
  "detailTitle": "帖子",
  "input": "输入信息",
  "items": [],
  "posts": doubanPosts,
  "comments": [],
  "postText": "",
  "commentHint": "写评论…"
};
