import Note from './note.js';

/**
 * Pretentious name for the "entry point" class that will manage the overall process.
 */
export default class Conductor {

    /**
     * taking the "middle C" as 0, so that common notes will have easy numbers, and to gracefully handle pianos of various widths
     * 88 notes: [-39, 48] i.e. A,,,, and c''' (actual center being EF...)
     * 49 notes: [-24, 24]
     *
     * Call samples:
     * randomNote(0, 11) returns a random note in the octave of the middle C
     * randomNote(11) returns a random note within 11 notes of the middle C, i.e. the same as randomNote(-11, 11)
     * randomNote() ... not sure yet
     */
    static randomNote(range1, range2) {
        let min = -39, max = 48; // piano extremes
        if (range1 != undefined) {
            if (range2 != undefined) {
                min = range1;
                max = range2;
            } else {
                min = -range1;
                max = range1;
            }
        }
        let randomNoteInRange = Note.fromKey(Math.floor(Math.random() * (max - min + 1)) + min);
        return randomNoteInRange;
    }
}

