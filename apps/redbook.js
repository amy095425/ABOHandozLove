const avatarColors=new Map();
const initials=name=>/^[a-z]/i.test(name)?name[0].toUpperCase():Array.from(name)[0];
function color(name){if(!avatarColors.has(name))avatarColors.set(name,`hsl(${Math.floor(Math.random()*360)} 42% 88%)`);return avatarColors.get(name);}
const paths={home:'<path d="m3 11 9-8 9 8v10h-6v-7H9v7H3Z"/>',shop:'<path d="M4 8h16l1 13H3ZM8 8V6a4 4 0 0 1 8 0v2"/>',add:'<path d="M6 12h12M12 6v12"/>',message:'<path d="M21 11a9 8 0 0 1-9 8H7l-5 3 1-7a8 8 0 0 1 0-8 9 8 0 0 1 18 4Z"/>',me:'<circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',heart:'<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8 6l8 9 8-9a5 5 0 0 0 0-7Z"/>'};
const svg=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
export function renderRedbook(d,e){return `<header class="rb-topbar"><button data-action="home" aria-label="返回主屏幕">‹</button><strong>发现</strong><span class="rb-top-spacer"></span></header><div class="scroll rb-scroll" aria-label="小红书首页"><div class="rb-waterfall">${d.posts.map(p=>`<article class="rb-card" data-post-id="${p.id}">${p.coverAvailable===false?`<div class="rb-cover-placeholder" role="img" aria-label="图片${p.id}占位" style="aspect-ratio:${p.width}/${p.height}">图片${p.id}</div>`:`<img class="rb-cover" src="${e(p.cover)}" alt="${e(p.title)}" width="${p.width}" height="${p.height}" loading="lazy">`}<div class="rb-card-body"><h2 title="${e(p.title)}">${e(p.title)}</h2><div class="rb-user"><span class="rb-avatar" style="background:${color(p.author)}" aria-hidden="true">${e(initials(p.author))}</span><span class="rb-author" title="${e(p.author)}">${e(p.author)}</span><span class="rb-likes" aria-label="${e(p.likes)}赞">${svg('heart')}<span>${e(p.likes)}</span></span></div></div></article>`).join('')}</div></div><nav class="tabs rb-tabs" aria-label="小红书导航">${d.tabs.map((label,i)=>`<button type="button" ${i?'disabled aria-disabled="true"':'data-tab="首页" aria-current="page"'} class="${i===2?'rb-add':''}">${svg(['home','shop','add','message','me'][i])}<span>${e(label)}</span></button>`).join('')}</nav>`;}
let observer;
export function mountRedbookMasonry(screen){
 observer?.disconnect();
 const cards=[...screen.querySelectorAll('.rb-card')];
 function layout(){for(const card of cards){const span=Math.ceil((card.getBoundingClientRect().height+8)/9);card.style.gridRowEnd=`span ${Math.max(1,span)}`;}}
 if('ResizeObserver' in window){observer=new ResizeObserver(layout);cards.forEach(card=>observer.observe(card));}
 screen.querySelectorAll('.rb-cover').forEach(img=>{img.addEventListener('load',layout);img.addEventListener('error',()=>{const box=document.createElement('div');box.className='rb-cover-placeholder';box.style.aspectRatio=`${img.width||3}/${img.height||4}`;box.textContent=`图片${img.closest('.rb-card').dataset.postId}`;img.replaceWith(box);layout();});});
 layout();
}
