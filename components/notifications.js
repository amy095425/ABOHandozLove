let banner,timer;
// 全局唯一横幅，用 DOM 文本节点呈现通知内容。
export function showNotification({title,body,appId='messages'}){
 banner?.remove();clearTimeout(timer);
 banner=document.createElement('button');banner.type='button';banner.className='global-notification';banner.setAttribute('aria-label',`${title}：${body}`);
 const heading=document.createElement('strong'),preview=document.createElement('span');heading.textContent=title;preview.textContent=body;banner.append(heading,preview);
 banner.addEventListener('click',()=>{banner?.remove();location.hash=appId;});
 document.querySelector('#phone').append(banner);timer=setTimeout(()=>banner?.remove(),6500);
}
