import {gameProgress,getGlobalSystemDate,getSystemDateKey} from '../state/gameProgress.js?v=chapter2-ending-1';
// 仅负责手机最外层流程；不读取或修改 App 的内部数据。
const PASSCODE = '2499';
const ERROR_DURATION = 1600;
const phone = document.querySelector('#phone');
const content = document.querySelector('#device-content');
const lock = document.querySelector('#lock-screen');
const passcode = document.querySelector('#passcode-screen');
const title = document.querySelector('#passcode-title');
const dots = document.querySelector('#passcode-dots');
const keypad = document.querySelector('#passcode-keypad');
let state = 'lock', digits = '', busy = false, errorTimer, successTimer;
// 每次刷新重新锁定，并从主屏幕开始，避免地址中的 App 路径绕过开机流程。
history.replaceState(null, '', location.pathname + location.search);
const letters = ['', '', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];
keypad.innerHTML = [1,2,3,4,5,6,7,8,9].map(n => key(n)).join('') + '<span></span>' + key(0) + '<button class="passcode-delete" aria-label="删除一位密码"><svg viewBox="0 0 28 24" aria-hidden="true"><path d="M10 4h15v16H10L2 12Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m13 8 8 8m0-8-8 8" stroke="currentColor" stroke-width="1.7"/></svg></button>';
function key(n) { return `<button class="passcode-key" data-digit="${n}" aria-label="${n}"><span>${n}</span><small>${letters[n]}</small></button>`; }
function updateDots() {
  [...dots.children].forEach((dot, i) => dot.classList.toggle('filled', i < digits.length));
  dots.setAttribute('aria-label', `已输入 ${digits.length} 位密码`);
}
function reset() {
  clearTimeout(errorTimer); clearTimeout(successTimer);
  digits = ''; busy = false;
  title.textContent = '输入密码'; title.classList.remove('error');
  dots.classList.remove('shake'); updateDots();
}
function setState(next) {
  state = next; phone.dataset.boot = next;
  content.inert = next !== 'unlocked';
  lock.inert = next !== 'lock'; lock.setAttribute('aria-hidden', String(next !== 'lock'));
  passcode.inert = next !== 'passcode'; passcode.setAttribute('aria-hidden', String(next !== 'passcode'));
}
function openPasscode() {
  if (state !== 'lock') return;
  reset(); setState('passcode'); keypad.querySelector('button').focus({preventScroll:true});
}
function inputDigit(n) {
  if (state !== 'passcode' || busy || digits.length >= 4) return;
  digits += n; updateDots();
  if (digits.length !== 4) return;
  busy = true;
  if (digits === PASSCODE) {
    successTimer = setTimeout(() => {
      setState('unlocked');
      window.dispatchEvent(new Event('phone-unlocked'));
      document.querySelector('#home-pages').focus({preventScroll:true});
      digits = ''; updateDots(); busy = false;
    }, 180);
  } else {
    title.textContent = '密码错误'; title.classList.add('error');
    dots.classList.add('shake');
    // 抖动结束后清空；错误提示继续保留至 1.6 秒后。
    errorTimer = setTimeout(() => {
      digits = ''; updateDots(); dots.classList.remove('shake');
      errorTimer = setTimeout(reset, ERROR_DURATION - 450);
    }, 450);
  }
}
keypad.addEventListener('click', event => {
  const key = event.target.closest('button'); if (!key) return;
  if (key.dataset.digit !== undefined) inputDigit(key.dataset.digit);
  else if (!busy) { digits = digits.slice(0,-1); updateDots(); }
});
document.querySelector('#unlock-hint').addEventListener('click', openPasscode);
document.querySelector('#cancel-passcode').addEventListener('click', () => {
  reset(); setState('lock'); document.querySelector('#unlock-hint').focus({preventScroll:true});
});
let start;
lock.addEventListener('pointerdown', event => {
  if (event.target.closest('button')) return;
  start = {x:event.clientX, y:event.clientY}; lock.setPointerCapture(event.pointerId);
});
lock.addEventListener('pointerup', event => {
  if (start && start.y-event.clientY > 45 && Math.abs(start.x-event.clientX)<100) openPasscode();
  start = null;
});
lock.addEventListener('pointercancel', () => { start = null; });
// 在锁屏底部提示区域也支持上滑。
const hint=document.querySelector('#unlock-hint');
let hintY;
hint.addEventListener('pointerdown',event=>{hintY=event.clientY;hint.setPointerCapture(event.pointerId);});
hint.addEventListener('pointerup',event=>{if(hintY-event.clientY>25)openPasscode();});
document.addEventListener('keydown', event => {
  if (state === 'unlocked') return;
  if (state === 'passcode' && /^\d$/.test(event.key)) {event.preventDefault(); inputDigit(event.key);}
  if (event.key === 'Backspace' && !busy) {event.preventDefault(); digits=digits.slice(0,-1); updateDots();}
  if (event.key === 'Escape') {event.stopImmediatePropagation();reset();setState('lock');}
}, true);
const torch = document.querySelector('.flashlight');
torch.addEventListener('click', () => torch.setAttribute('aria-pressed', String(torch.getAttribute('aria-pressed') !== 'true')));
const camera = document.querySelector('#camera-preview');
document.querySelector('.camera').addEventListener('click', () => {camera.hidden=false;lock.inert=true;document.querySelector('#close-camera').focus();});
document.querySelector('#close-camera').addEventListener('click', () => {camera.hidden=true;lock.inert=false;document.querySelector('.camera').focus();});
function updateClock() {
  const now = getGlobalSystemDate();
  document.querySelector('#lock-time').textContent = now.toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit',hour12:false});
  document.querySelector('#lock-date').textContent = now.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'});
}
updateClock(); gameProgress.subscribe(updateClock); setState('lock');
