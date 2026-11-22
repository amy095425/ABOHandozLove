import {chapter3Threads} from '../state/chapter3Threads.js?v=chapter3-threads-1';
import {chapter2Ending} from '../state/chapter2Ending.js?v=chapter3-douban-1';
import {gameProgress} from '../state/gameProgress.js?v=chapter2-ending-1';
import {chapter2Threads} from '../state/chapter2Threads.js?v=chapter3-douban-1';
import {isThreadLiked,toggleThreadLike} from '../state/threadsLikes.js';
import {chapter1Opening} from '../state/chapter1Opening.js?v=chapter2-ending-1';
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
const currentStory=()=>gameProgress.getCurrentChapter()>=3&&chapter3Threads.state.notificationClicked?chapter3Threads:gameProgress.getCurrentChapter()>=2?chapter2Threads:chapter1Opening;
export function renderThreadReply(reply,e,animate=false){return `<p class="threads-inline-reply${animate?' is-new':''}" data-thread-reply="${e(reply.id)}"><strong>${e(reply.displayId||reply.author)}:</strong> ${e(reply.text)}</p>`;}
export function renderChapter1Post(post,e,animate=false){return `<article class="threads-post${animate?' is-new':''}" data-threads-post="${e(post.id)}"><div class="threads-avatar" style="background:${e(post.avatarColor)}" aria-hidden="true">${e((post.displayId||post.author||post.id)[0].toUpperCase())}</div><div class="threads-post-copy"><header><strong>${e(post.displayId||post.author||post.id)}</strong><time>刚刚</time><span aria-hidden="true">···</span></header><p>${e(post.content)}</p>${post.image?`<img class="threads-post-image" src="${e(post.image)}" alt="threads图片1" loading="lazy">`:""}<div class="threads-post-actions" aria-label="帖子互动图标"><button type="button" class="threads-like${isThreadLiked(post.id)?' is-liked':''}" data-threads-like="${e(post.id)}" aria-pressed="${isThreadLiked(post.id)}" aria-label="${isThreadLiked(post.id)?'取消点赞':'点赞'}">${svg('notifications')}</button><span role="img" aria-label="评论">${svg('comment')}</span><span role="img" aria-label="转发">${svg('repost')}</span><span role="img" aria-label="分享">${svg('share')}</span></div>${post.replies?`<section class="threads-inline-replies" aria-label="帖子回复" aria-live="polite">${post.replies.map(reply=>renderThreadReply(reply,e)).join('')}</section>`:''}</div></article>`;}
export function renderThreads(e){
 return `<header class="threads-header"><button type="button" class="threads-back" data-action="home" aria-label="返回主屏幕">${svg('back')}</button><img class="threads-logo" src="${e(threadsLogo)}" alt="Threads"><span class="threads-menu" role="img" aria-label="菜单">${svg('menu')}</span></header><div class="threads-scroll" aria-label="Threads首页"><div class="threads-feed">${currentStory().getVisiblePosts().map(post=>renderChapter1Post(post,e)).join('')}</div>${currentStory().getVisiblePosts().length?'':'<div class="threads-empty-space" aria-hidden="true"></div>'}</div><nav class="threads-floating-nav" aria-label="Threads导航">${threadsNavigation.map(item=>`<button type="button" aria-label="${e(item.label)}" ${item.id==='home'?'data-threads-home aria-current="page"':'disabled aria-disabled="true"'}>${svg(item.id)}</button>`).join('')}</nav>`;
}
const mounted=new WeakSet();let unsubscribe,renderedCount=0,stream=chapter1Opening,renderedReplies=new Map();
function syncFeed(root,e){
 if(!root.classList.contains('app-threads'))return;
 const posts=stream.getVisiblePosts(),feed=root.querySelector('.threads-feed');if(!feed)return;
 const scroller=root.querySelector('.threads-scroll'),follow=renderedCount===0||scroller.scrollHeight-scroller.clientHeight-scroller.scrollTop<100;
 let changed=false;
 if(posts.length>renderedCount){root.querySelector('.threads-empty-space')?.remove();const added=posts.slice(renderedCount);feed.insertAdjacentHTML('beforeend',added.map(post=>renderChapter1Post(post,e,true)).join(''));for(const post of added)renderedReplies.set(post.id,post.replies?.length||0);renderedCount=posts.length;changed=true;}
 for(const post of posts){const count=renderedReplies.get(post.id)||0;if((post.replies?.length||0)<=count)continue;const container=[...feed.querySelectorAll('[data-threads-post]')].find(el=>el.dataset.threadsPost===post.id)?.querySelector('.threads-inline-replies');if(!container)continue;container.insertAdjacentHTML('beforeend',post.replies.slice(count).map(reply=>renderThreadReply(reply,e,true)).join(''));renderedReplies.set(post.id,post.replies.length);changed=true;}
 if(stream===chapter2Threads&&stream.state.phase==='complete')chapter2Ending.onThreadsRendered();
 if(changed&&follow)requestAnimationFrame(()=>{if(!root.classList.contains('app-threads'))return;const scroll=root.querySelector('.threads-scroll');scroll.scrollTo({top:scroll.scrollHeight,behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'});});
}
export function mountThreads(root,e){
 unsubscribe?.();stream.leaveThreads();stream=currentStory();root.innerHTML=renderThreads(e);const visible=stream.getVisiblePosts();renderedCount=visible.length;renderedReplies=new Map(visible.map(post=>[post.id,post.replies?.length||0]));
 unsubscribe=stream.subscribe(()=>syncFeed(root,e));stream.enterThreads();if(stream===chapter2Threads&&stream.state.phase==='complete')chapter2Ending.onThreadsRendered();
 if(renderedCount)requestAnimationFrame(()=>{if(root.classList.contains('app-threads')){const scroll=root.querySelector('.threads-scroll');scroll.scrollTop=scroll.scrollHeight;}});
 if(mounted.has(root))return;mounted.add(root);
 root.addEventListener('click',event=>{if(!root.classList.contains('app-threads'))return;const like=event.target.closest('[data-threads-like]');if(like){const liked=toggleThreadLike(like.dataset.threadsLike);like.classList.toggle('is-liked',liked);like.setAttribute('aria-pressed',String(liked));like.setAttribute('aria-label',liked?'取消点赞':'点赞');return;}const home=event.target.closest('[data-threads-home]');if(!home||home.disabled)return;root.querySelector('.threads-scroll')?.scrollTo({top:0,behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'});});
}
globalThis.addEventListener?.('hashchange',()=>{if(location.hash==='#threads')return;stream.leaveThreads();unsubscribe?.();unsubscribe=null;});
