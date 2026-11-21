// 日期只用于排序，不改动原始备忘录对象或数组。
function memoDateKey(value=''){const parts=String(value).match(/\d+/g);return parts?.length>=3?Number(parts[0])*10000+Number(parts[1])*100+Number(parts[2]):0;}
export function sortedMemoEntries(items){return items.map((memo,index)=>({memo,index})).sort((a,b)=>memoDateKey(b.memo.date)-memoDateKey(a.memo.date));}
export function renderMemoList(items,e){return sortedMemoEntries(items).map(({memo,index})=>`<button type="button" class="row memo-list-row" data-note="${index}"><strong>${e(memo.title||'无标题')}</strong>${memo.date?`<time>${e(memo.date)}</time>`:''}</button>`).join('');}
export function renderMemoDetail(memo,e){return `<article class="memo-detail-scroll"><time class="memo-date">${e(memo.date||'')}</time><h2>${e(memo.title||'无标题')}</h2><div class="memo-content">${e(memo.content)}</div>${memo.audioSrc?`<audio controls preload="none" src="${e(memo.audioSrc)}" aria-label="备忘录语音"></audio>`:''}</article>`;}
