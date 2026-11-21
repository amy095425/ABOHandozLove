const paths={
 home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
 shorts:'<path d="m15 2-10 6a4 4 0 0 0 0 7l4 2-3 2 3 3 10-6a4 4 0 0 0 0-7l-4-2 3-2Z"/><path d="m10 9 5 3-5 3Z"/>',
 add:'<circle cx="12" cy="12" r="9"/><path d="M7 12h10m-5-5v10"/>',
 subscriptions:'<path d="M6 3h12M4 6h16M3 9h18v12H3Z"/><path d="m10 12 5 3-5 3Z"/>',
 me:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="9" r="3"/><path d="M5 19a7 7 0 0 1 14 0"/>',
 search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>'
};
const svg=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
export function renderYouTube(d,e){
 return `<header class="yt-topbar"><button data-action="home" class="yt-home-back" aria-label="返回主屏幕">‹</button><div class="yt-logo" aria-label="YouTube"><svg viewBox="0 0 32 24" aria-hidden="true"><rect x="0" y="1" width="32" height="22" rx="6" fill="#ff0033"/><path d="m13 6 10 6-10 6Z" fill="#fff"/></svg><strong>YouTube</strong></div><span class="yt-search" role="img" aria-label="搜索">${svg('search')}</span></header><div class="scroll yt-feed" aria-label="YouTube 首页视频列表">${d.videos.map(v=>`<article class="yt-video" data-video-id="${v.id}"><img class="yt-cover" src="${e(v.cover)}" alt="${e(v.title)}" loading="lazy" width="640" height="360"><div class="yt-video-details"><span class="yt-channel-avatar" aria-hidden="true">KBS</span><div class="yt-video-copy"><h2 title="${e(v.title)}">${e(v.title)}</h2><p>${e(v.channel)}</p><p>${e(v.views)} · ${e(v.time)}</p></div></div></article>`).join('')}</div><nav class="tabs yt-tabs" aria-label="YouTube导航">${d.tabs.map((label,i)=>`<button type="button" ${i?'disabled aria-disabled="true"':'data-tab="首页" aria-current="page"'}>${svg(['home','shorts','add','subscriptions','me'][i])}<span>${e(label)}</span></button>`).join('')}</nav>`;
}
