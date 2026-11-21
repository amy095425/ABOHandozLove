import {isThreadLiked,toggleThreadLike} from '../state/threadsLikes.js';
import {chapter1Opening} from '../state/chapter1Opening.js?v=chapter1-payment-fix-2';
import {threadsNavigation,threadsLogo} from '../data/threads.js?v=threads-shell-1';
const paths={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
 search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
 create:'<path d="M12 4v16M4 12h16"/>',
 notifications:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 profile:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
 menu:'<path d="M4 6h16M4 12h16M9 18h11"/>',
 comment:'<path d="M21 11a9 8 0 0 1-9 8H7l-4 3 1-7a8 8 0 0 1-1-4 9 8 0 0 1 18 0Z"/>',
 repost:'<path d="m5 3-3 3 3 3M2 6h14a4 4 0 0 1 4 4M19 21l3-3-3-3M22 18H8a4 4 0 0 1-4-4"/>',
 share:'<path d="m22 2-7 20-4-9-9-4ZM11 13 22 2"/>',
 back:'<path d="m15 4-8 8 8 8"/>'
};
const svg=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
export function renderChapter1Post(post,e,animate=false){return `<article class="threads-post${animate?' is-new':''}" data-threads-post="${e(post.id)}"><div class="threads-avatar" style="background:${e(post.avatarColor)}" aria-hidden="true">${e(post.id[0].toUpperCase())}</div><div class="threads-post-copy"><header><strong>${e(post.id)}</strong><time>刚刚</time><span aria-hidden="true">···</span></header><p>${e(post.content)}</p><div class="threads-post-actions" aria-label="帖子互动图标"><button type="button" class="threads-like${isThreadLiked(post.id)?' is-liked':''}" data-threads-like="${e(post.id)}" aria-pressed="${isThreadLiked(post.id)}" aria-label="${isThreadLiked(post.id)?'取消点赞':'点赞'}">${svg('notifications')}</button><span role="img" aria-label="评论">${svg('comment')}</span><span role="img" aria-label="转发">${svg('repost')}</span><span role="img" aria-label="分享">${svg('share')}</span></div></div></article>`;}
export function renderThreads(e){
 return `<header class="threads-header"><button type="button" class="threads-back" data-action="home" aria-label="返回主屏幕">${svg('back')}</button><img class="threads-logo" src="${e(threadsLogo)}" alt="Threads"><span class="threads-menu" role="img" aria-label="菜单">${svg('menu')}</span></header><div class="threads-scroll" aria-label="Threads首页"><div class="threads-feed">${chapter1Opening.getVisiblePosts().map(post=>renderChapter1Post(post,e)).join('')}</div>${chapter1Opening.getVisiblePosts().length?'':'<div class="threads-empty-space" aria-hidden="true"></div>'}</div><nav class="threads-floating-nav" aria-label="Threads导航">${threadsNavigation.map(item=>`<button type="button" aria-label="${e(item.label)}" ${item.id==='home'?'data-threads-home aria-current="page"':'disabled aria-disabled="true"'}>${svg(item.id)}</button>`).join('')}</nav>`;
}
const mounted=new WeakSet();let unsubscribe,renderedCount=0;
function syncFeed(root,e){
 if(!root.classList.contains('app-threads'))return;
 const posts=chapter1Opening.getVisiblePosts();if(posts.length<=renderedCount)return;
 root.querySelector('.threads-empty-space')?.remove();const feed=root.querySelector('.threads-feed');if(!feed)return;
 feed.insertAdjacentHTML('beforeend',posts.slice(renderedCount).map(post=>renderChapter1Post(post,e,true)).join(''));renderedCount=posts.length;
 requestAnimationFrame(()=>{if(!root.classList.contains('app-threads'))return;const scroll=root.querySelector('.threads-scroll');scroll.scrollTo({top:scroll.scrollHeight,behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'});});
}
export function mountThreads(root,e){
 unsubscribe?.();root.innerHTML=renderThreads(e);renderedCount=chapter1Opening.getVisiblePosts().length;
 unsubscribe=chapter1Opening.subscribe(()=>syncFeed(root,e));chapter1Opening.enterThreads();
 if(renderedCount)requestAnimationFrame(()=>{if(root.classList.contains('app-threads')){const scroll=root.querySelector('.threads-scroll');scroll.scrollTop=scroll.scrollHeight;}});
 if(mounted.has(root))return;mounted.add(root);
 root.addEventListener('click',event=>{if(!root.classList.contains('app-threads'))return;const like=event.target.closest('[data-threads-like]');if(like){const liked=toggleThreadLike(like.dataset.threadsLike);like.classList.toggle('is-liked',liked);like.setAttribute('aria-pressed',String(liked));like.setAttribute('aria-label',liked?'取消点赞':'点赞');return;}const home=event.target.closest('[data-threads-home]');if(!home||home.disabled)return;root.querySelector('.threads-scroll')?.scrollTo({top:0,behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'});});
}
globalThis.addEventListener?.('hashchange',()=>{if(location.hash==='#threads')return;chapter1Opening.leaveThreads();unsubscribe?.();unsubscribe=null;});
