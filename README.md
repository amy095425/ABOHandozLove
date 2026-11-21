# 捡手机 · 纯净框架

这是一个无依赖的静态网站，只保留 13 个 App 的仿真界面骨架。没有后端、外部资源请求、通知剧情或播放器。

## 本地预览

在本目录运行 `python3 -m http.server 8000`，浏览器访问 http://localhost:8000 。使用了 JavaScript 模块，请通过本地服务器打开，不要双击 HTML。

## 内容修改位置

每个 App 的文字、配色、图标、底部 Tab 和数据都在独立文件中。空数组代表没有历史内容；新 App 的灰卡片只是界面占位。

| App | 文件 | 主要字段 |
| --- | --- | --- |
| kakaotalk | `data/kktChatData.js` | `owner` 机主、`friend` 唯一好友、`messages` 聊天记录 |
| YouTube | `data/youtube.js` | `items` 视频，`placeholderCount` 灰色卡片数量 |
| 豆瓣 | `data/doubanPostsData.js` | 三篇完整帖子：作者、头像、组名、分类、标题、正文与评论 |
| 微信 | `data/wechat.js` | `items` 聊天列表，`contacts` 通讯录，`messages` 聊天，`moments` 朋友圈 |
| 健康app | `data/health.js` | `metrics` 卡片名称、图标、数值、单位 |
| 小红书 | `data/redbook.js` | `items` 笔记 |
| 淘宝 | `data/taobao.js` | `categories` 分类，`items` 商品 |
| Agoda | `data/agoda.js` | `items` 酒店，`dateLabel` 日期标题 |
| 备忘录 | `data/notes.js` | `folders` 文件夹，`items` 笔记列表，`noteText` 空白编辑器初始值 |
| 短信 | `data/messages.js` | `items` 对话列表，`messages` 聊天气泡 |
| 闹钟 | `data/clock.js` | `alarms` 闹钟，`worldClocks` 世界时钟 |
| 电话 | `data/phone.js` | `calls` 最近通话，`voicemails` 语音留言 |

常用数据格式：

```js
// 视频 / 笔记 / 商品 / 酒店的 items
{ title: '标题', text: '内容', imageLabel: '图片1', image: './assets/example.jpg' }
// 聊天列表 items 或 contacts
{ title: '联系人' }
// messages（mine: true 表示自己发送）
{ text: '消息内容', mine: true }
// 豆瓣 comments、微信 moments
{ text: '正文' }
// 备忘录 items
{ title: '标题', text: '正文' }
// alarms / worldClocks
{ time: '07:00', enabled: false }
{ city: '上海', time: '09:41' }
// calls / voicemails
{ name: '联系人', time: '今天' }
{ name: '联系人', text: '留言文字' }
```

图片默认使用统一灰块。新建 `assets` 文件夹存放自己的图片，在卡片数据填写 `image` 即可替换封面。头像、朋友圈封面和豆瓣配图的结构在 `apps/main.js` 的 `placeholder()`、`body()` 中，替换相应调用为图片标签即可。

## 布局和导航修改

- `data/apps.js`：App 注册及排列顺序。主屏幕按顺序分成两页，第一页 8 个，第二页 5 个；Dock 是常用快捷入口。
- `apps/main.js`：主页网格、各 App 页面骨架、内部跳转和统一返回逻辑。`body()` 按 App ID 组织页面，`cards()` 组织图文卡片，`chat()` 组织聊天详情。
- `styles/main.css`：公共布局及 `.app-xxx` 各 App 配色，桌面手机容器和小屏适配。
- `index.html`：入口和手机外壳。

所有 App 可点顶部“主屏幕”、点击底部小白条或在小白条区域上滑返回；键盘 Esc 同样返回。主页支持触屏左右滑动、分页圆点和聚焦分页容器后按左右方向键。

聊天列表为空时，“打开空白聊天室”可直接查看详情。豆瓣提供空白帖子入口；微信“发现”进入朋友圈；备忘录从文件夹进入空列表，再打开空白编辑器。

输入、发送、评论、勾选、日期和人数只用于当前会话的界面演示，不发送到服务器，不保存到浏览器存储，刷新恢复数据文件中的初始值。当前聊天数据是 App 级的一份骨架；未来需要多个独立聊天室时，可给会话添加 ID 并扩展详情选择逻辑。秒表、计时器、搜索、播放、购物与预订仅保留界面，不执行实际业务。

## 清理记录

删除旧目录：`X`、`global`、`home`、`ig`、`kkt`、`tiktok`、`信息`、`其他`、`图片`、`备忘录`、`外卖`、`天气`、`微信`、`微博`、`日历`、`时钟`、`电话`、`相册`、`音乐`。

随目录删除旧聊天数据、来电/视频通话剧情、全局通知和横幅、音乐播放器、相册、外卖订单、社交帖子及相关图片、音频、样式和脚本。首页原有大段内联代码已替换。根目录原始文字文稿 docx 留作参考，不会被页面加载。

新增：`apps/main.js`、`styles/main.css`、`data/apps.js`、13 个 App 数据文件和本说明；重写 `index.html`。无安装或构建步骤。

## 开机流程（锁屏 → 密码 → 主屏幕）

- 外层根组件：`index.html` 的 `#phone`。`#device-content` 包裹原有主屏幕和 App；新增 `#lock-screen` 与 `#passcode-screen` 作为独立覆盖层。
- 全局壁纸：`styles/boot.css` 顶部的 `--wallpaper: #000000`。三层均使用该变量，页面采用 `100vh` / `100dvh` 全高度，无桌面外框和浅色留边。
- 交互逻辑：`apps/boot.js`。正确密码在顶部 `PASSCODE` 中设置，当前为 `2499`；错误提示停留时间为 `ERROR_DURATION`，当前为 1600 毫秒。
- 点击“向上轻扫解锁”或在锁屏上滑进入密码页。数字键、实体键盘数字和 Backspace 均可输入或删除；点击“取消”返回锁屏。
- 错误密码触发圆点抖动，450 毫秒后清空圆点，1.6 秒后恢复标题。正确密码触发密码页退出及主屏幕浮现。
- 刷新恢复锁屏，解锁前主屏幕和 App 区域不可点击或通过 Tab 聚焦。此密码用于前端仿真剧情，不是账号认证。
- 手电筒支持按钮亮灭状态；相机打开可关闭的模拟取景框，不调用设备摄像头或闪光灯。
- App 的内部页面、数据文件与原有返回主屏幕逻辑没有改动。

本机预览建议：`python3 -m http.server 8000 --bind 127.0.0.1`，访问 http://127.0.0.1:8000/ 。


豆瓣首页的独立渲染组件为 `apps/douban.js`，样式在 `styles/douban.css`。帖子按数据数组顺序完整展示，底部显示四个 Tab，仅首页可点击；评论浅色首字头像在当前会话内保持颜色稳定。

豆瓣的关注、点赞、收藏、转发与评论点赞由 `apps/douban.js` 管理，重复点击可取消，当前会话内保留状态，刷新后重置。转发为界面状态演示，不向外发送。评论的 `floor` 控制楼层，`replyTo` 控制“回复 @用户名：”前缀。


健康 App：页面和导航在 `apps/health.js`，专用样式在 `styles/health.css`。摘要、图例及共享账号信息在 `data/health.js`；2030年1月至2031年3月的单月切换数据在 `data/healthCycleData.js`。日历按真实星期位置排列，重叠日期左右分色，只显示给定记录，不执行周期预测。共享页是本地账号展示，不向外发送数据。

生理期追踪默认显示2030年10月，右上角箭头切换月份，首尾月份禁用对应方向。切换只更新周期模块，不重建摘要卡片；当前会话切回摘要时保留选中的月份。


KakaoTalk 单人聊天：`apps/kkt.js` 渲染独立的聊天列表与聊天室，`styles/kkt.css` 控制浅蓝背景、白色/黄色气泡和两侧圆形头像。`data/kktChatData.js` 仅包含韩振、备注“哥哥🐕”的金道勋和完整分日聊天记录。默认聊天 Tab，好友/发现/更多禁用；发送的新消息带机主头像和当前时间，仅保留当前会话。


KakaoTalk 聊天已更新为 `data/kktChatData.js` 中的完整分日记录，所有对话直接可见。`type: image` 使用 `src` 路径，点击放大，加载失败显示灰色占位；`type: link` 打开静态付款成功凭证，内容在 `data/kktReceiptData.js`。`apps/kktModals.js` 管理关闭、图片预览和账单，不发起支付。此前的付款密码、签字板和购买解锁状态已撤回删除。


玩家输入限制：所有聊天和评论回复栏仅为 UI 展示，输入框与发送按钮禁用；全局表单提交不会新增消息或评论。已有剧情、图片放大和账单查看继续可用。


YouTube 首页：视频数据及本地封面路径在 `data/youtubeVideosData.js`，独立页面组件在 `apps/youtube.js`，样式在 `styles/youtube.css`。首页显示六条视频，16:9 封面与最多两行标题；底部五个 Tab 中仅首页可点击，搜索图标为静态展示。


全局状态栏：`components/StatusBar.js` 在 `#device-content` 中只挂载一次，统一维护当前时间和信号/Wi-Fi/满电 SVG；样式仅在 `styles/status-bar.css`。各 App 不创建状态栏，不覆写图标与尺寸，仅由全局组件按页面背景选择明暗对比。


小红书首页：`data/xiaohongshuPostsData.js` 保存15条帖子及封面路径、作者、文案和赞数；`apps/redbook.js` 独立渲染双列瀑布流，`styles/redbook.css` 控制样式。卡片不绑定点击，五个Tab中仅首页可用。15张封面均已接入，第9张使用 `小红书/小红书9.png`；图片按原始宽高比例展示。


## 淘宝仿真购物

- `data/taobaoProducts.js`：附件中的200件商品原文数据，按ID每20件归为一类。
- `data/taobaoConfig.js`：10种分类名称（付款页地址改由 `data/taobaoPaymentData.js` 管理）。
- `apps/taobaoStore.js`：淘宝独立的购物车、订单、当前Tab和结算状态；金额按整数分计算。
- `apps/taobao.js`：首页与分类单列文字列表、搜索建议、购物车、商品半屏面板、确认订单和订单列表。
- `styles/taobao.css`：淘宝专用样式，不创建状态栏、不修改其他App。

首页每次刷新随机排列，同一会话保持顺序。商品数量限制1–999，减到0自动移除。购物车总数量显示为Tab角标；勾选商品后结算，付款成功只删除本次结算商品，未勾选项保留。立即购买不改变已有购物车。订单保存商品和价格快照，新订单状态为待发货，预置历史订单为已签收。银行卡付款仅为本地剧情模拟，不调用支付服务；选卡后验证6位密码，再完成手写签名才能生成订单。购物车与订单在当前页面会话保留，刷新后恢复默认的19件购物车商品和6笔历史订单。

淘宝列表已去除所有商品图片与 Emoji 占位。首页搜索通过 `searchQuery` 匹配商品标题（忽略英文大小写），最多8条建议；无结果时展示4件会话随机推荐。输入时局部更新下拉面板，清空、点击外部或打开商品面板时收起。每条商品未加购时显示“加入购物车”，加购后原地切换为数量加减器；首页、分类、搜索购买面板均读取同一购物车状态。列表和面板加减只更新对应控件与角标，保留滚动位置。购买面板未加购时可预选购买数量，加购后底部按钮变为同步的购物车数量控件；立即购买仍走原结算流程。

默认购物车与历史订单可在 `data/taobaoInitialData.js` 修改；创建会话时复制到独立状态，后续加减、移除和付款不会改动默认数据模板。

淘宝付款配置与联动：
- `data/taobaoPaymentData.js`：4个收货地址、2张银行卡及剧情密码。
- `apps/taobaoPayment.js`：地址/选卡/密码面板、成功页和支持触控、鼠标的签名画板。
- `apps/taobaoStore.js`：付款步骤校验；订单保存地址、银行卡展示信息和签名快照，不保存输入密码。
- `data/messageStore.js`：共享短信数据、插入消息和未读状态；银行卡B支付成功会添加实际金额的扣款短信。打开短信会话后清除未读。
- `components/notifications.js`、`styles/notifications.css`：全局通知横幅及主屏短信角标。点击横幅打开短信列表；不会新建状态栏。
- 购物车、历史及新订单、短信和未读状态保留于当前会话，刷新页面恢复初始状态。

## Agoda 探索与酒店预订

- `data/agodaData.js`：原附件酒店加上海迪士尼乐园酒店，共166家酒店及498种房型，修改酒店与基础价格在此处。
- `data/agodaBookingData.js`：入住人资料、支付方式选项。
- `apps/agodaStore.js`：一次进入探索页生成一个0.9–1.2系数；所有房型最终价格按整数分保存。日期、选房、入住人、支付和通知均使用预订快照，只有重新进入探索页才重新报价。日期范围2026–2040年，按UTC日期差计算晚数。
- `apps/agoda.js`、`styles/agoda.css`：探索列表、年月日选择器、三种房型、确认页、30秒倒计时及我的订单。倒计时只局部更新提示，不重置输入与价格；到时后显示催单提示，不取消订单。
- `components/SignaturePad.js`：从淘宝画板提取的共享实现；`apps/taobaoPayment.js` 复用其鼠标/触屏签名逻辑。银行卡面板和密码UI也直接复用现有付款组件，两张卡分别验证原有密码。
- 支付成功后关闭弹窗、显示成功提示并保存订单，调用原有 `insertMessage` 和 `showNotification`，短信金额严格等于订单总金额；按本次提供的短信模板显示尾号0105。短信阅读后清除主屏角标。
- Agoda订单与其他App数据独立，在当前会话保留，刷新后重置。“地区”Tab支持21个地区分类与酒店列表；账户暂为不可点击的占位Tab。

Agoda 默认历史订单在 `data/agodaInitialOrders.js` 修改，初始化时复制到当前会话；固定使用指定的晚数及成交金额，不参与实时价格浮动。新订单追加在列表顶部，重新进入App不会重复载入历史订单。
首页及地区页支持按酒店名/地区实时搜索。人数默认2大人、0小孩，面板内可调整（大人1–10、小孩0–10），人数与已选日期会保存到新订单。人数仅作为入住资料，不改变既有按房型单价×晚数计算总价的规则。
酒店左侧为100×100px马卡龙纯色DIV，颜色随本次探索报价快照固定；卡片同时标注基础价与本次浮动报价，预订继续使用本次报价。

## 航旅纵横

- `data/umetrip.js`：主屏幕入口、`航旅纵横图标`相对路径、统计数字、顶部文字及5条航班记录。
- `apps/umetrip.js`：默认“行程”视图，历史行程按日期倒序显示；底部“行程”和“动态”可切换，首页、经验、我禁用。顶部分类、标签和筛选为静态展示。
- `styles/umetrip.css`：独立的统计卡片与时间线样式，隐藏原生滚动条。
- 主屏幕第二页进入，哈希路由为 `#umetrip`；使用全局状态栏与底部Home横条，点击横条或按Escape返回主屏幕。

航旅纵横动态：在 `data/umetrip.js` 的 `flightDynamics` 数组中填入 `{id,time,title,content,link}` 即可渲染消息卡片，正文保留换行。空数组显示“暂无最新动态”；`link: '#'` 作为详情占位，不跳转，配置有效链接后可查看详情。默认进入行程页，动态切换复用全局导航状态，不改写历史行程数据。

## 电话最近通话

- `data/callHistoryData.js`：按用户确认完整保留26条记录，其中道勋哥15条、未接来电5条。修改姓名、日期、时间和通话类型在此处。
- `apps/phone.js`：iOS风格最近通话、所有/未接筛选、五个SVG底栏图标；FaceTime按 `isFaceTime` 显示。历史记录倒序渲染，未接姓名、日期、时间统一红色。
- `styles/phone.css`：灰底圆形首字头像、紧凑列表、蓝色信息图标及独立滚动区。
- 最近通话为默认页，拨号键盘与语音留言沿用原有逻辑；继续使用全局状态栏和Home横条。

备忘录追加内容：`data/memosData.js` 中保存“好累……”长文（2030年10月1日，`memo_pregnancy`），由 `data/notes.js` 合并到现有 items，不覆盖原记录。`apps/notes.js` 按日期倒序展示列表（保留原数组与索引），详情正文以 `white-space: pre-wrap` 渲染并单独滚动。`audioSrc` 为空时不创建音频播放器。原有文本备忘录继续使用原编辑器，新长文显示为阅读视图。

## 日历与全局游戏章节

- `state/gameProgress.js`：项目的共享状态单例，默认 `currentChapter: 1`、`chapter2Ready: false`、`chapter3Ready: false`。退出App不会清空；刷新页面恢复初始值。各App必须使用相同的不带版本号的模块路径导入，避免产生多份进度。
- `data/calendar.js`：日历入口、默认日期、月份边界、三个章节事件日期。
- `apps/calendarModel.js`：月份切换、日期选择及星期位置计算，范围2030年1月至2040年12月。
- `apps/calendar.js`、`styles/calendar.css`：日历网格、红点、章节弹窗和主屏幕红白图标。年月选择器可快速定位，支持左右箭头/滑动；“今天”固定返回剧情日期2030年10月7日。

其他App在任务完成后可调用：

```js
import { triggerChapter2Ready, triggerChapter3Ready, getCurrentChapter } from '../state/gameProgress.js';
triggerChapter2Ready(); // 仅设置前置任务完成；玩家仍需在日历中确认进入第二章
triggerChapter3Ready(); // 同理；第三章还要求当前处于第二章
const chapter = getCurrentChapter();
```

开发者控制台测试：`gameProgress.triggerChapter2Ready()`；到2031年11月20日点击日期并确认后，`gameProgress.getCurrentChapter()` 返回2。之后执行 `gameProgress.triggerChapter3Ready()`，到2031年12月24日确认进入第三章。也可查看 `gameProgress.state`。页面不提供玩家可见的测试解锁按钮；确认时会再次校验前置条件，不能跨章或退回已完成章节。

## Threads 主页框架

- `data/threads.js`：主屏幕素材路径、底栏配置、空的 `threadsPosts` 数组及完整字段示例（包括可选 `quotedPost`）。当前不渲染任何帖子。
- `apps/threads.js`：白底首页、居中Threads标志、静态菜单和悬浮胶囊底栏；首页可点击并滚回顶部，其余四项禁用。
- `styles/threads.css`：黑色毛玻璃底栏、纯白SVG图标、空白可滚动主体和底部内容安全间距，样式限于本App。
- 使用 `agoda/Threads图标.png` 作为主屏幕图标；顶部标志复用原图并反色。主屏幕第二页进入，路由为 `#threads`；左上返回或全局Home条可回主屏幕，状态栏仍由外层统一挂载。

## 第一章开场剧情

- `apps/boot.js` 在正确密码解锁后派发 `phone-unlocked`，`components/chapter1Notice.js` 接收事件并启动5秒倒计时。开场横幅独立于普通短信通知，不自动消失，出现时覆盖点击区域并禁用底层交互；只有点击横幅才能继续剧情。
- `state/chapter1Opening.js` 是共享的开场状态机，挂在 `gameProgress.state.chapter1Opening` 中。状态包含 `phase`、`notificationClicked`、`visibleCount`。第一章会话仅触发一次，刷新重新开场；切换到其他章节会清理计时器。
- `data/threadsPostsData.js` 保存14条完整剧情帖子及通知文案。用户名与马卡龙配色使用提供的数据，时间统一显示“刚刚”。
- 点击通知后进入Threads，初始为空，600ms后推入第一条；后续间隔使用 `1500 + Array.from(当前帖正文).length * 10` 毫秒。只追加新节点，新增帖子滑入并自动滚到底部；等待期间可以手动回看。
- 离开Threads会暂停递归计时器，回来后保留已显示的帖子并按剩余阅读时间继续，不会重复开场或重复插入。第14条后停止。播放完毕不会自行设置第二章就绪，后续任务仍可使用原有章节方法。
- `tests/chapter1Opening.test.mjs` 使用虚拟时钟检查5秒门槛、强制通知点击、长度延时、暂停续播和跨章节清理，运行：`node --test tests/chapter1Opening.test.mjs`。

## 第一章第二阶段：航旅纵横提醒

- `state/chapter1Flight.js` 监听第一阶段 `complete`，只启动一次2000ms定时器。计时不随玩家离开Threads而重置；切换章节时清理。
- `data/flightOpeningData.js` 保存完整KE 247提醒、动态卡片字段和前20字加省略号的通知预览。
- `components/chapter1Notice.js` 复用全屏点击阻断、底层inert及Escape/Tab拦截机制：第二阶段使用白底通知和绿色航旅纵横图标，不自动消失。
- 只有点击通知才向航旅纵横原有 `flightDynamics` 数组注入一条 `chapter1_ke247` 动态，已存在时不重复添加。全局 `open-umetrip-dynamics` 事件定向打开动态Tab，同App内部或跨App跳转均适用。原有历史行程保留。
- 全局可查看 `gameProgress.state.chapter1Flight`，刷新会话后重新开始。运行 `node --test tests/chapter1Opening.test.mjs tests/chapter1Flight.test.mjs` 验证两个阶段。

## 第一章第三阶段：无声闹钟

- `state/chapter1Alarm.js`：航旅通知已点击且“动态”页实际渲染 `chapter1_ke247` 卡片后，开始3000ms计时。未满3秒切走会取消并在返回时重新计时；闹钟已弹出则只能用关闭按钮关闭。同一会话只提醒一次，切换章节时清理。
- `components/chapter1Alarm.js`、`styles/chapter1-alarm.css`：全黑全屏闹钟、实时大号时间、白色图标、橙色关闭按钮。调用 `navigator.vibrate([2000])`，不支持或被拦截时忽略；不创建音频。
- `data/chapter1AlarmData.js`：酒店预订提醒文案。
- 关闭后仅移除闹钟覆盖并解除底层阻断，保留航旅纵横动态页及其滚动位置，不触发主屏幕路由。状态可在 `gameProgress.state.chapter1Alarm` 查看。
- 测试：`node --test tests/chapter1Opening.test.mjs tests/chapter1Flight.test.mjs tests/chapter1Alarm.test.mjs`。

Threads点赞：`state/threadsLikes.js` 保存会话内点赞状态。点击帖子爱心切换红色实心/未点赞状态，局部更新按钮；追加帖子、退出再进入时仍保留，刷新后清空。

## 时钟中的已关闭剧情提醒

`state/chapter1Alarm.js` 在闹钟响起时保存提醒文案、响起时间和启用状态。点击关闭将 `alarmRecord.enabled` 设为 false，保留记录；`apps/clock.js` 在进入时钟时读取并显示完整订酒店文案及关闭状态的灰色滑块（剧情提醒仅供回看，不重新开启）。`styles/clock.css` 提供黑底iOS风格列表。时钟默认显示闹钟，世界时钟、秒表、计时器均禁用；原有闹钟数据仍保留。记录在当前页面会话内有效，刷新后随剧情恢复初始状态。

## 第一章 Agoda 隐藏任务

`state/agodaTask.js` 在 Agoda 签名确认、生成新订单并显示支付成功后执行静默检查：第一章、北京王府半岛酒店、豪华套房、2030-10-07至2030-10-10、入住人包含Kim Dohoon。ISO日期与对应中文日期等价；不限制付款卡、价格或是否同时包含韩振。

全部匹配后设置 `gameProgress.state.agodaTaskCompleted = true`，2秒后调用导出的 `triggerChapter1NextStage()`；当前只输出“第一章 Agoda 任务完成，准备进入下一阶段”。未匹配时不产生任务提示、不重置已完成标记，支付、订单和原有扣款短信照常处理。重复正确订单不会重复安排剧情；切换出第一章会取消待执行的回调。刷新后恢复未完成状态。

测试：`node --test tests/*.test.mjs`；对应检查在 `tests/agodaTask.test.mjs`。

## 第一章高潮：Agoda任务完成后的KakaoTalk

- `data/chapter1KktChat.js`：90条完整剧情消息，按提供顺序保存，图片为 `kkt/kkt图片1.png` 与 `kkt/kkt图片2.jpg`；通知预览来自第二条长消息。
- `state/chapter1Kkt.js`：监听全局 `agodaTaskCompleted` 变为true，5秒后产生强制通知；点击之前不推送消息。仅在哥哥聊天室中续播。每条消息先显示对应一侧的800ms输入气泡，再显示正文；之后等待 `1500 + Array.from(当前消息正文).length * 10` 毫秒再开始下一条输入，图片阅读时间2500ms。
- `components/chapter1Notice.js`：复用原有强制通知覆盖层，新通知黄色、头像为金道勋、发送者哥哥🐕；点击通过 `open-kkt-story-chat` 事件直达聊天室，兼容已经位于KakaoTalk的情况。
- `apps/kkt.js`：保留原有聊天数据，按已发布进度在历史末尾合并剧情；仅局部移除输入气泡、追加新消息并滚到底部。原有头像、白/黄气泡、图片放大及禁止自由回复继续保留。
- 离开聊天室（包括回聊天列表）会暂停，输入或阅读阶段均按剩余时间续播，不重复插入；刷新页面重置剧情。全局可查看 `gameProgress.state.chapter1Kkt`，全部消息完成后不自动解锁其他章节。
- 测试：`node --test tests/*.test.mjs`，新增 `tests/chapter1Kkt.test.mjs`。
