// 页面仅挂载一次。App 切换和内部页面渲染均不重建状态栏。
export const statusBarMarkup = `<time id="time"></time><span class="status-icons" role="img" aria-label="蜂窝网络满格，Wi-Fi 满格，电池满电">
<svg class="status-cellular" viewBox="0 0 18 14" aria-hidden="true"><rect x="0" y="9" width="3" height="5" rx=".8"/><rect x="5" y="6" width="3" height="8" rx=".8"/><rect x="10" y="3" width="3" height="11" rx=".8"/><rect x="15" y="0" width="3" height="14" rx=".8"/></svg>
<svg class="status-wifi" viewBox="0 0 20 16" aria-hidden="true"><path d="M1.3 4.9a13.2 13.2 0 0 1 17.4 0M4.1 7.9a9 9 0 0 1 11.8 0M7 10.8a4.7 4.7 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1.35"/></svg>
<svg class="status-battery" viewBox="0 0 28 14" aria-hidden="true"><rect x=".75" y=".75" width="23" height="12.5" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="2.5" y="2.5" width="19.5" height="9" rx="1.4"/><path d="M25.3 4.5a2.5 2.5 0 0 1 0 5Z"/></svg></span>`;
export function formatStatusTime(date=new Date()) {
  return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}
export function mountStatusBar(host) {
  if(!host || host.dataset.mounted)return;
  host.dataset.mounted='true';host.innerHTML=statusBarMarkup;
  const time=host.querySelector('time');
  const updateTime=()=>{time.textContent=formatStatusTime();};
  updateTime();setInterval(updateTime,1000);
  document.addEventListener('visibilitychange',updateTime);
  const phone=document.querySelector('#phone'),app=document.querySelector('#app');
  function updateSurface(){
    const isApp=phone.classList.contains('in-app');
    const background=isApp?getComputedStyle(app).backgroundColor:'rgb(0, 0, 0)';
    const rgb=background.match(/[\d.]+/g)?.slice(0,3).map(Number)||[0,0,0];
    const luminance=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
    host.style.setProperty('--status-surface',background);
    host.dataset.tone=luminance>145?'dark':'light';
  }
  new MutationObserver(updateSurface).observe(phone,{attributes:true,attributeFilter:['class']});
  new MutationObserver(updateSurface).observe(app,{attributes:true,attributeFilter:['class']});
  updateSurface();
}
