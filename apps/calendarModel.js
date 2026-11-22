import {gameProgress,getGlobalSystemDate,getSystemDateKey} from '../state/gameProgress.js?v=chapter2-ending-1';
import {calendarConfig} from '../data/calendar.js?v=calendar-chapters-1';
const monthNumber=value=>{const [y,m]=value.split('-').map(Number);return y*12+m-1;};
export const minCalendarMonth=monthNumber(calendarConfig.minMonth),maxCalendarMonth=monthNumber(calendarConfig.maxMonth);
export const dateString=(year,month,day)=>`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
export function createCalendarModel(){
 const state={month:monthNumber(getSystemDateKey()),selectedDate:getSystemDateKey()};
 function setMonth(month){if(!Number.isInteger(month)||month<minCalendarMonth||month>maxCalendarMonth)return false;state.month=month;return true;}
 function moveMonth(delta){return setMonth(state.month+delta);}
 function today(){state.month=monthNumber(getSystemDateKey());state.selectedDate=getSystemDateKey();}
 function selectDate(date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;const [y,m,d]=date.split('-').map(Number);if(m<1||m>12||y<2030||y>2040||monthNumber(date)!==state.month||d<1||d>new Date(Date.UTC(y,m,0)).getUTCDate())return false;state.selectedDate=date;return true;}
 function monthGrid(){const year=Math.floor(state.month/12),month=state.month%12+1;return {year,month,offset:new Date(Date.UTC(year,month-1,1)).getUTCDay(),days:new Date(Date.UTC(year,month,0)).getUTCDate()};}
 return {state,setMonth,moveMonth,today,selectDate,monthGrid};
}
