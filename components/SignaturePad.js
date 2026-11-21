// 淘宝与 Agoda 共用的签名画板；鼠标、触控均使用 Pointer Events。
let dispose=()=>{};
export function disposeSignature(){dispose();dispose=()=>{};}
export function mountSignature(root,store){
 disposeSignature();const canvas=root.querySelector('[data-tb-signature]');if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 let drawing=false,pointer=null,strokes=[],stroke=[];
 const point=ev=>{const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height))};};
 const redraw=()=>{const r=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,r.width,r.height);ctx.strokeStyle='#222';ctx.fillStyle='#222';ctx.lineWidth=2.7;ctx.lineCap='round';ctx.lineJoin='round';for(const points of strokes){ctx.beginPath();ctx.moveTo(points[0].x*r.width,points[0].y*r.height);if(points.length===1){ctx.arc(points[0].x*r.width,points[0].y*r.height,1.35,0,Math.PI*2);ctx.fill();}else{for(const q of points.slice(1))ctx.lineTo(q.x*r.width,q.y*r.height);ctx.stroke();}}};
 const down=ev=>{if(ev.button!==undefined&&ev.button!==0)return;ev.preventDefault();pointer=ev.pointerId;canvas.setPointerCapture(pointer);drawing=true;stroke=[point(ev)];strokes.push(stroke);store.markSigned(true);redraw();};
 const move=ev=>{if(!drawing||pointer!==ev.pointerId)return;ev.preventDefault();stroke.push(point(ev));redraw();};
 const up=ev=>{if(pointer!==ev.pointerId)return;drawing=false;pointer=null;};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',up);
 const observer=new ResizeObserver(redraw);observer.observe(canvas);redraw();
 canvas.clearSignature=()=>{strokes=[];drawing=false;store.markSigned(false);redraw();};
 dispose=()=>{observer.disconnect();for(const [name,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',up]])canvas.removeEventListener(name,fn);};
}
