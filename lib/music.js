import Conductor from './Music/conductor.js';
import Note from './Music/note.js';

// Helper functions, to reduce the depth and reduce caller syntax
export function randomNote(range1, range2) {
    return Conductor.randomNote(range1, range2);
}
/*
export function numToAbc(noteNum) {
    return Conductor.numToAbc(noteNum);
}
*/

