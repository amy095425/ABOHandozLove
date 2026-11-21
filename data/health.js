import { cycleData } from "./healthCycleData.js?v=health-range-15-1";
const health = {
  "id": "health",
  "name": "健康",
  "color": "#ffffff",
  "glyph": "♥",
  "tabs": [
    "摘要",
    "共享",
    "浏览"
  ],
  "title": "摘要",
  "empty": "暂无内容",
  "search": "搜索",
  "action": "查看空白详情",
  "detailTitle": "详情",
  "input": "输入信息",
  "items": [],
  "metrics": [
    {
      "label": "步数",
      "icon": "steps",
      "value": "2499",
      "unit": "步"
    },
    {
      "label": "心率",
      "icon": "heart",
      "value": "82",
      "unit": "次/分"
    },
    {
      "label": "睡眠",
      "icon": "sleep",
      "value": "7",
      "unit": "小时",
      "extraValue": "24",
      "extraUnit": "分钟"
    }
  ],
  "cycleTitle": "生理期追踪",
  "legend": [
    {
      "type": "omega",
      "label": "Omega 发情期",
      "name": "韩振"
    },
    {
      "type": "alpha",
      "label": "Alpha 易感期",
      "name": "金道勋"
    }
  ],
  "accounts": [
    {
      "name": "韩振",
      "initial": "韩",
      "subtitle": "此设备"
    },
    {
      "name": "金道勋",
      "initial": "金",
      "subtitle": "已绑定家人"
    }
  ],
  "weekdays": [
    "日",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六"
  ]
};
export default { ...health, cycleData };
