import {createChapter2Douban} from './chapter2Douban.js?v=chapter3-douban-1';
import {gameProgress} from './gameProgress.js?v=chapter2-ending-1';
import {chapter3DoubanPost} from '../data/chapter3DoubanPost.js?v=chapter3-douban-1';
export const createChapter3Douban=options=>createChapter2Douban({...options,chapter:3,post:chapter3DoubanPost});
export const chapter3Douban=createChapter3Douban();
gameProgress.state.chapter3Douban=chapter3Douban.state;
