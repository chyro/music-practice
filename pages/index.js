import page1 from './page1.js';
import page2 from './page2.js';
import page3 from './page3.js';
import page4 from './page4.js';
import readPractice from './practice/read.js';
import listenPractice from './practice/listen.js';
import playPractice from './practice/play.js';

export {
    page1,
    page2,
    page3,
    page4,
    // maybe instead: practice index, leading to those 3 and/or others
    readPractice,
    listenPractice,
    playPractice,
    // and then... status? stats?
    // also a login page which would take credentials and load $progress from an online DB?
    // so status page needs to show login status, and a note that if you want to keep your progress between devices you need to enter an identifier
};
