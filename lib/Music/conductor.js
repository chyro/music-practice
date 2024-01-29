
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
    static randomPitch(range1, range2) {
        // const sampleNotes = ["X:1\nT:Example\nK:Bb\nBcde|\n", "X:1\nK:D\nDD AA|BBA2|\n"];
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
        let randomNoteInRange = Math.floor(Math.random() * (max - min + 1)) + min;
        return this.numToAbc(randomNoteInRange);
    }

    static numToAbc(noteNum) {
        const noteInOctave = (noteNum + 120) % 12; // +120 to avoid negative modulo
        const octave = Math.floor(noteNum / 12);
        const sharp = [1, 3, 6, 8, 10].indexOf(noteInOctave);

        let adjustedNote = noteInOctave;
        for (const i of [1, 3, 6, 8, 10]) {
            if (noteInOctave >= i) adjustedNote--;
        }

        const aIndexed = (adjustedNote + 2 + 700) % 7; // +2 to go from C=0 to A=1, +700 to make sure we never get a negative modulo
        let abcNote = String.fromCharCode(97 + aIndexed);
        // adjusting for octaves: upper / lower case
        if (noteNum < 12) abcNote = abcNote.toUpperCase();
        // adjusting further: ' and ,
        for (let i = 1; i < octave; i++) {
            abcNote += "'";
        }
        for (let i = 0; i > octave; i--) {
            abcNote += ",";
        }

        if (sharp != -1) {
            abcNote = '^' + abcNote;
            // need to use _ instead somehow, but how to decide? Based on key signature?
        }

        // console.log({noteNum, noteInOctave, octave, sharp, adjustedNote, abcNote});
        return abcNote;
    }
}

