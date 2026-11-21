import {memosData} from './memosData.js?v=memo-croissant-1';
/* 修改本 App 的文字与内容；空数组代表默认没有历史数据。 */
const notes = {
  "id": "notes",
  "name": "备忘录",
  "color": "#ffd64b",
  "glyph": "▤",
  "tabs": [],
  "title": "备忘录",
  "empty": "暂无内容",
  "search": "搜索",
  "detailTitle": "备忘录",
  "input": "在此输入备忘录",
  "items": [],
  "noteText": ""
};

// 仅追加未存在的新记录，不替换或改写原有 items。
for(const memo of memosData){if(!notes.items.some(item=>item.id===memo.id))notes.items.push({...memo});}
export default notes;
