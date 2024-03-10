import Math2 from '../math2.js';

/**
 * Helper class so that the calling code doesn't need to care about the keyNum / abc ambivalence.
 */
export default class Note {
    /**
     * Unique pitch identifier, as a number referring to a piano key.
     *
     * Taking the "middle C" as 0, so that common notes will have easy numbers, and to gracefully handle pianos of various widths.
     * 88 notes: [-39, 48] i.e. A,,,, and c''' (actual center being EF...)
     * 49 notes: [-24, 24]
     */
    // #cIndex; // retired: pianoKey exists elsewhere, cIndex not really, no benefit in creating a conflicting standard

    /**
     * Unique pitch identifier, as a number referring to a piano key.
     *
     * Full piano keyboard is 88 key, so keyNum goes from 1 to 88.
     * Small pianos with 49 notes range from 16 to 64.
     * Middle C is #40.
     */
    #pianoKey;

    /**
     * Duration of the pitch (optional)
     */
    #length;

    /**
     * ABC notation representing the note, using defaults if necessary
     */
    #abc;

    /**
     * Scientific Pitch Notation representing the note, i.e. C4
     */
    #spn;

    /**
     * Key signature, if specified this might affect the way the accidentals are represented.
     * e.g. keyNum 3 could be ^D but might be better represented as _E if the key signature is Em.
     */
    #signature;

    // #defaults = {length: 1/4, signature: 'C'};

    /*
    constructor(keyNum, abc, length) {
        this.#keyNum = keyNum;
        this.#abc = abc;
        this.#length = length;
    }
    */

    // factories: will not always call with the same params, also easier to link e.g. Note.fromKey(12).abc
    static fromPianoKey(pianoKey) {
        let newNote = new Note();
        newNote.pianoKey = pianoKey;
        return newNote;
    }

    /**
     * C-index: pitch number, with middle C being #0
     */
    /* // retired
    set cIndex(cIndex) {
        this.pianoKey = cIndex + 40;
    }

    get cIndex() {
        return this.pianoKey - 40;
    }
    */

    /**
     * piano key number, from 1 to 88
     */
    set pianoKey(pianoKey) {
        this.#pianoKey = parseInt(pianoKey);
        this.#abc = undefined;
        this.#spn = undefined;
    }

    get pianoKey() {
        // if (this.#pianoKey == undefined && this.#abc != undefined) // too complicated if there are multiple possible encoding, let's ensure that cIndex will always be set no matter how the Note is created
        return this.#pianoKey;
    }

    set length(length) {
        this.#length = length;
        this.#abc = undefined;
    }

    get length() {
        return this.#length;
    }

    set abc(abc) {
        this.#abc = abc;
        this.#pianoKey = undefined; // TODO: calculate piano key, to simplify conversions by always having a common base
    }

    get abc() {
        if (this.#abc == undefined && this.#pianoKey != undefined) {
            this.#abc = Note.keyToAbc(this.#pianoKey, this.#length);
        }
        return this.#abc;
    }

    get spn() {
        if (this.#spn == undefined && this.#pianoKey != undefined) {
            this.#spn = Note.keyToSpn(this.#pianoKey);
        }
        return this.#spn;
    }

    equals(note) {
        return note.pianoKey == this.#pianoKey;
    }

    static keyToAbc(pianoKey, length, signature) {
        // const sampleNotes = ["X:1\nT:Example\nK:Bb\nBcde|\n", "X:1\nK:D\nDD AA|BBA2|\n"];
        const noteInOctave = Math2.modulo(pianoKey - 4, 12);
        const octave = Math.floor((pianoKey - 40) / 12); // octave should be based on C-index, i.e. pianoKey - 40
        const sharp = [1, 3, 6, 8, 10].indexOf(noteInOctave);

        let adjustedNote = noteInOctave;
        for (const i of [1, 3, 6, 8, 10]) {
            if (noteInOctave >= i) adjustedNote--;
        }

        const aIndexed = Math2.modulo(adjustedNote + 2, 7); // +2 to go from C=0 to A=1
        let abcNote = String.fromCharCode(97 + aIndexed);
        // adjusting for octaves: upper / lower case
        if (pianoKey < 52) abcNote = abcNote.toUpperCase();
        // adjusting further: ' and ,
        for (let i = 1; i < octave; i++) {
            abcNote += "'";
        }
        for (let i = 0; i > octave; i--) {
            abcNote += ",";
        }

        if (sharp != -1) {
            abcNote = '^' + abcNote;
            // TODO: depending on this.#signature, use _ instead
        }

        if (length != undefined) {
            // converting note.length=1/4; back into "1/4"
            // examples for note C: 1 => C, 2 => C2, .5 => C/2, .75 => C3/4, 1.5 => C3/2
            let numerator = length;
            let denumerator = 1;
            while (Math.floor(numerator) != numerator) {
                if (denominator >= 8) {
                    console.error("Invalid length: " + length);
                    numerator = denominator = 1;
                    break;
                }
                numerator = numerator * 2;
                denominator = denominator * 2;
            }
            if (numerator == 1 && denominator == 1) {
                // that's the default, no need to write anything
            } else if (numerator == 1 && denominator != 1) {
                abcNote += '/' + denominator;
            } else if (numerator != 1 && denominator == 2) {
                abcNote += numerator + '/';
            } else {
                abcNote += numerator + '/' + denominator;
            }
        }

        // console.log({pianoKey, noteInOctave, octave, sharp, adjustedNote, abcNote});
        return abcNote;
    }

    static keyToSpn(pianoKey) {
        const noteInOctave = Math2.modulo(pianoKey - 4, 12);
        const octave = Math.floor((pianoKey + 8) / 12); // 1 -> A0, 2 -> A#0, 3 -> B0, 4 -> C1, and so on
        const sharp = [1, 3, 6, 8, 10].indexOf(noteInOctave);

        let adjustedNote = noteInOctave;
        for (const i of [1, 3, 6, 8, 10]) {
            if (noteInOctave >= i) adjustedNote--;
        }

        const aIndexed = Math2.modulo(adjustedNote + 2, 7); // +2 to go from C=0 to A=1
        let spnNote = String.fromCharCode(65 + aIndexed);

        if (sharp != -1) {
            spnNote = spnNote + '#';
            // TODO: depending on this.#signature, use 'b' instead
        }

        spnNote = spnNote + octave;

        // console.log({pianoKey, noteInOctave, octave, sharp, adjustedNote, spnNote});
        return spnNote;
    }
}
