// import Conductor from './Music/conductor.js';
import Note from './Music/note.js';
import Math2 from './math2.js';
import Memory from './Music/memory.js';

// Helper functions, to reduce the depth, reduce caller syntax complexity, reduce coupling
export function randomNote(range1, range2) {
    return Conductor.randomNote(range1, range2);
}

/*
export function numToAbc(noteNum) {
    return Conductor.numToAbc(noteNum);
}
*/

// export {Conductor, Note, Math2, Memory};
export {Note, Math2, Memory};
