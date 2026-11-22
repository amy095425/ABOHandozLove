import { owner, friend, messages } from './kktChatData.js?v=kkt-receipt-1';
const agent={id:'agent',name:'经纪人',avatar:'./kkt/agent-avatar.svg'};
export default {
  id: 'kkt', name: 'kakaotalk', color: '#fee500', glyph: 'TALK',
  tabs: ['好友', '聊天', '发现', '更多'], title: '聊天',
  empty: '暂无对话', search: '搜索', input: '输入信息',
  detailTitle: friend.name,
  owner, friend, agent, contacts: [friend,agent], items: [friend,agent], messages
};
