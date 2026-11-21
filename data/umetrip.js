// 航旅纵横展示数据：修改行程、统计和页面文字请从此文件开始。
export const flightHistory = [
 {date:'2030-09-20',year:'2030',airline:'东方航空',flightNo:'MU3005',time:'14:30 - 17:00',from:'上海虹桥',to:'河南郑州',color:'red'},
 {date:'2030-09-14',year:'2030',airline:'东方航空',flightNo:'MU3005',time:'18:00 - 20:00',from:'河南郑州',to:'上海虹桥',color:'red'},
 {date:'2030-08-20',year:'2030',airline:'东方航空',flightNo:'MU3005',time:'12:00 - 14:00',from:'上海虹桥',to:'河南郑州',color:'red'},
 {date:'2030-08-16',year:'2030',airline:'东方航空',flightNo:'MU3005',time:'14:00 - 16:00',from:'河南郑州',to:'上海虹桥',color:'red'},
 {date:'2030-06-17',year:'2030',airline:'大韩航空',flightNo:'KE0530',time:'17:00 - 18:30',from:'韩国仁川',to:'河南郑州',color:'blue'}
];
export const flightSummary = [
 {icon:'tower',value:'24',label:'累计次数',color:'green'},
 {icon:'clock',value:'186h40min',label:'累计时长',color:'blue'},
 {icon:'compass',value:'103287km',label:'累计里程',color:'orange'}
];
export const flightCopy={upcoming:'待出行',finished:'已结束',family:'家人行程',more:'更多',categories:['航班','火车','用车','酒店'],insights:'更多航线图、热力图数据 >',history:'历史行程',tags:'标签',filter:'筛选',review:'去点评 >'};
export default {id:'umetrip',name:'航旅纵横',color:'#1da66f',glyph:'航',iconImage:'./agoda/航旅纵横图标.png',tabs:['首页','行程','经验','动态','我'],title:'行程'};

// 动态数据为空时显示空状态；后续按以下字段添加消息即可显示卡片。
export const flightDynamics = [];
/*
const flightDynamics = [
 {id:1,time:'21:09',title:'出票提醒',content:'您有新行程：11月15日 深航 ZH9858 ...',link:'#'}
];
*/
