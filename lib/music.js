import Conductor from './Music/conductor.js';

// Helper functions, to reduce the depth and reduce caller syntax
export function randomPitch(range1, range2) {
    return Conductor.randomPitch(range1, range2);
}
export function numToAbc(noteNum) {
    return Conductor.numToAbc(noteNum);
}

