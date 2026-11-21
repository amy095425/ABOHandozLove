// 后续将真实帖子追加到此数组；当前主页不渲染帖子。
export const threadsPosts = [];
/*
// 数据结构示例说明，目前不要渲染数据，留着备用：
{
 id: 1,
 authorName: 'omger901', // ins 风格英文/数字 ID
 avatarColor: '#ffb6c1', // 马卡龙色系纯色头像
 time: '2小时前',
 content: '纳尼 我是活在24年吗😳',
 quotedPost: { // 可选的引用帖子
  authorName: '6bb072',
  content: '我不行了ive红毯走出了一个V型 双塔又开始竞走了🤪'
 },
 likes: 398,
 comments: 25,
 reposts: 7
}
*/
export const threadsNavigation = [
 {id:'home',label:'首页'},
 {id:'search',label:'搜索'},
 {id:'create',label:'发帖'},
 {id:'notifications',label:'通知'},
 {id:'profile',label:'个人主页'}
];
export const threadsLogo='./agoda/Threads图标.png';
export default {id:'threads',name:'Threads',color:'#000',glyph:'@',iconImage:threadsLogo,tabs:[],title:'Threads'};
