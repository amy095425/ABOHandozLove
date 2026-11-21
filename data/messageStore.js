import imessageData from './messages.js';
export {imessageData};
const changed=()=>globalThis.dispatchEvent?.(new Event('messages-updated'));
export function insertMessage({sender,text}){
 let thread=imessageData.items.find(item=>item.sender===sender);
 if(!thread){thread={id:`sms-${imessageData.items.length+1}`,sender,title:sender,messages:[],unread:false};imessageData.items.unshift(thread);}
 const message={id:`${Date.now()}-${thread.messages.length}`,text,mine:false,date:new Date().toLocaleString('zh-CN',{hour12:false})};
 thread.messages.push(message);thread.preview=text;thread.unread=true;
 imessageData.items=imessageData.items.filter(item=>item!==thread);imessageData.items.unshift(thread);changed();return message;
}
export const getMessagesUnread=()=>imessageData.items.some(thread=>thread.unread)?1:0;
export function markMessagesRead(id){const thread=imessageData.items.find(item=>item.id===id);if(thread){thread.unread=false;changed();}}
