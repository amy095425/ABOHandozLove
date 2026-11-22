import {chapter3Redbook} from '../state/chapter3Redbook.js?v=chapter3-redbook-1';
import {chapter3Douban} from '../state/chapter3Douban.js?v=chapter3-douban-1';
import {chapter3DoubanPost} from '../data/chapter3DoubanPost.js?v=chapter3-douban-1';
import {chapter2Kkt} from '../state/chapter2Kkt.js?v=chapter3-douban-1';
import {chapter2Douban} from '../state/chapter2Douban.js?v=chapter3-douban-1';
import {chapter2DoubanPost} from '../data/chapter2DoubanPost.js?v=chapter2-douban-1';
import {renderDoubanFeed,renderDoubanComment} from './douban.js?v=chapter3-douban-1';
let activeView=null;
export function pauseDoubanStory(){
 const view=activeView;activeView=null;view?.dispose?.();
 chapter2Douban.leavePost();chapter3Douban.leavePost();
}
// Injected dependencies also let the view itself be exercised with a deterministic clock.
export function createDoubanDetailView({root,e,chapter,story,post,onComplete=()=>{},isActive=()=>true,requestFrame=globalThis.requestAnimationFrame}){
 const view={root,chapter,story,displayedComments:[],currentIndex:0,completionNotified:false,unsubscribe:null};
 // Never render the source comments array here. Only restore comments already revealed.
 root.innerHTML=`<header><button data-action="back">‹ 返回</button><span class="douban-detail-header-title" title="${e(post.title)}">${e(post.title)}</span><button data-action="home">主屏幕</button></header>${renderDoubanFeed([{...post,comments:[]}],e)}`;
 view.feed=root.querySelector('.douban-feed');
 const article=view.feed.querySelector('article');
 view.comments=document.createElement('section');view.comments.className='douban-comments';view.comments.setAttribute('aria-label','帖子评论');view.comments.setAttribute('aria-live','polite');view.comments.setAttribute('aria-relevant','additions');article.append(view.comments);
 const connected=()=>isActive()&&root.querySelector('.douban-feed')===view.feed;
 function sync(animate=true){
  if(!connected())return;
  const visible=story.getVisibleComments();
  if(visible.length<view.currentIndex){view.displayedComments=[];view.currentIndex=0;view.completionNotified=false;view.comments.replaceChildren();}
  const follow=view.currentIndex===0||view.feed.scrollHeight-view.feed.clientHeight-view.feed.scrollTop<100;
  let changed=false;
  while(view.currentIndex<visible.length){
   const comment=visible[view.currentIndex];view.displayedComments.push(comment);view.currentIndex++;
   view.comments.insertAdjacentHTML('beforeend',renderDoubanComment(post,comment,e));
   if(animate)view.comments.lastElementChild?.classList.add('douban-comment-arriving');changed=true;
  }
  if(!view.completionNotified&&story.state.phase==='complete'&&view.currentIndex===post.comments.length){view.completionNotified=true;onComplete(view.displayedComments.at(-1));}
  if(changed&&animate&&follow)requestFrame(()=>{if(connected())view.feed.scrollTo({top:view.feed.scrollHeight,behavior:'smooth'});});
 }
 view.unsubscribe=story.subscribe(()=>sync());
 view.start=()=>{sync(false);return story.state.phase==='streaming'||story.enterPost();};
 view.dispose=()=>{view.unsubscribe?.();view.unsubscribe=null;story.leavePost();};
 view.sync=sync;
 return view;
}
export function mountDoubanStory(root,e,chapter=2){
 if(activeView?.root===root&&activeView.chapter===chapter&&root.querySelector('.douban-feed')===activeView.feed){activeView.start();return activeView;}
 pauseDoubanStory();
 const story=chapter===3?chapter3Douban:chapter2Douban,post=chapter===3?chapter3DoubanPost:chapter2DoubanPost;
 const view=createDoubanDetailView({root,e,chapter,story,post,isActive:()=>activeView===view,onComplete:last=>{if(chapter===2&&last?.floor===95)chapter2Kkt.onCommentsRendered(95);if(chapter===3&&last?.floor===54)chapter3Redbook.onDoubanRendered(54);}});
 activeView=view;view.sync(false);view.start();return view;
}
