// 默认数据只在创建会话状态时载入；切换页面不会重新覆盖购物车或订单。
export const initialCart = [
  { productId: 2, quantity: 3, selected: true },
  { productId: 3, quantity: 3, selected: true },
  { productId: 5, quantity: 2, selected: true },
  { productId: 14, quantity: 2, selected: true },
  { productId: 1, quantity: 3, selected: true },
  { productId: 4, quantity: 3, selected: true },
  { productId: 11, quantity: 3, selected: true }
];

// 历史订单按日期倒序排列，保留成交时的商品名称与金额。
export const initialOrders = [
  {
    orderId: 'TB20300927001', date: '2030年9月27日', status: '已签收',
    items: [{ name: '蒙牛特仑苏纯牛奶 250ml*12盒', quantity: 2, price: 69.90 }],
    totalPrice: 139.80
  },
  {
    orderId: 'TB20300914002', date: '2030年9月14日', status: '已签收',
    items: [
      { name: '杜蕾斯超薄避孕套 空气感 10片装', quantity: 3, price: 49.90 },
      { name: '杜蕾斯人体润滑液 水溶性 50ml', quantity: 1, price: 39.90 }
    ],
    totalPrice: 189.60
  },
  {
    orderId: 'TB20300903003', date: '2030年9月3日', status: '已签收',
    items: [{ name: '杜蕾斯超薄避孕套 空气感 10片装', quantity: 2, price: 49.90 }],
    totalPrice: 99.80
  },
  {
    orderId: 'TB20300901004', date: '2030年9月1日', status: '已签收',
    items: [{ name: '费列罗榛果威化巧克力 48粒礼盒装', quantity: 1, price: 159.00 }],
    totalPrice: 159.00
  },
  {
    orderId: 'TB20300820005', date: '2030年8月20日', status: '已签收',
    items: [{ name: '旺旺大礼包 雪饼仙贝组合 休闲零食', quantity: 2, price: 59.00 }],
    totalPrice: 118.00
  },
  {
    orderId: 'TB20300816006', date: '2030年8月16日', status: '已签收',
    items: [{ name: '【ABO特供】Alpha易感期阻隔喷雾 隔离信息素 100ml', quantity: 1, price: 128.00 }],
    totalPrice: 128.00
  }
];
