// 页面内互动只保存于当前会话；局部更新按钮，保持长帖阅读位置不变。
const avatarColors = new Map();
const interactionStates = new Map();
function avatarColor(key) {
  if (!avatarColors.has(key)) avatarColors.set(key, `hsl(${Math.floor(Math.random()*360)} 45% 89%)`);
  return avatarColors.get(key);
}
function initials(name) { return /^[a-z]/i.test(name) ? name.match(/^[a-z]{1,2}/i)[0].toUpperCase() : Array.from(name)[0] || '?'; }
const paths = {
  like: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  collect: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
  share: '<path d="M14 4l7 6-7 6v-4c-5 0-8 2-11 7 0-8 4-11 11-11Z"/>',
  home: '<path d="m3 11 9-8 9 8M5 9v12h5v-7h4v7h5V9"/>',
  books: '<path d="M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3ZM12 6v15"/>',
  group: '<circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M4 6a3 3 0 0 0 0 6m16-6a3 3 0 0 1 0 6M2 20v-3m20 3v-3"/>',
  me: '<circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
};
const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
const labels = { like:['点赞','已点赞'], collect:['收藏','已收藏'], share:['转发','已转发'], follow:['关注','已关注'], comment:['赞','已赞'] };
function actionButton(action, key, e, extra='') {
  const pressed=interactionStates.get(key)||false;
  return `<button type="button" class="douban-action douban-action-${action} ${extra}" data-douban-action="${action}" data-state-key="${e(key)}" aria-pressed="${pressed}">${action==='follow'?'':svg(action==='comment'?'like':action)}<span>${labels[action][Number(pressed)]}</span></button>`;
}
export function renderDoubanTabs() {
  return `<nav class="tabs douban-tabs" aria-label="豆瓣导航">${['首页','书影音','小组','我'].map((label,i)=>`<button type="button" ${i?'disabled aria-disabled="true"':'data-tab="首页" aria-current="page"'}>${svg(['home','books','group','me'][i])}<span>${label}</span></button>`).join('')}</nav>`;
}
export function renderDoubanFeed(posts, e) {
  return `<div class="scroll douban-feed" aria-label="豆瓣首页帖子列表">${posts.map(post => `
    <article class="douban-post" data-post-id="${e(post.id)}" aria-labelledby="douban-title-${e(post.id)}">
      <div class="douban-post-group"><span class="douban-group-avatar" style="background:${avatarColor(post.group)}" aria-hidden="true">${e(initials(post.group))}</span><span>${e(post.group)} · ${e(post.tag)}</span></div>
      <div class="douban-post-author"><img src="${e(post.avatar)}" alt="${e(post.author)}的头像" width="34" height="34"><span>${e(post.author)}</span>${actionButton('follow','follow:'+post.author,e)}</div>
      <h2 id="douban-title-${e(post.id)}" class="douban-post-title">${e(post.title)}</h2>
      ${post.content?`<p class="douban-post-content">${e(post.content)}</p>`:''}
      <div class="douban-post-actions" aria-label="帖子互动">${['like','collect','share'].map(action=>actionButton(action,post.id+':'+action,e)).join('')}</div>
      ${post.comments.length?`<section class="douban-comments" aria-label="${e(post.title)}的评论">${post.comments.map(comment => `
        <div class="douban-comment" data-floor="${comment.floor}">
          <span class="douban-comment-avatar" style="background:${avatarColor(comment.author)}" aria-hidden="true">${e(initials(comment.author))}</span>
          <div class="douban-comment-copy"><div class="douban-comment-meta"><span class="douban-comment-name">${e(comment.author)}</span><span class="douban-floor">${comment.floor}楼</span></div><p>${comment.replyTo?`回复 @${e(comment.replyTo)}：`:''}${e(comment.content)}</p></div>
          ${actionButton('comment',post.id+':comment:'+comment.floor,e)}
        </div>`).join('')}</section>`:''}
    </article>`).join('')}</div>`;
}
// 只处理豆瓣自己的按钮，不干预全局导航和其他 App。
document.addEventListener('click',event=>{
  const button=event.target.closest('#app.app-douban [data-douban-action]');
  if(!button)return;
  const key=button.dataset.stateKey,action=button.dataset.doubanAction;
  const pressed=!interactionStates.get(key);
  interactionStates.set(key,pressed);
  button.setAttribute('aria-pressed',String(pressed));
  button.querySelector('span').textContent=labels[action][Number(pressed)];
});
