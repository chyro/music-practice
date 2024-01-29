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
    #keyNum;

    /**
     * Duration of the pitch (optional)
     */
    #length;

    /**
     * ABC notation representing the note, using defaults if necessary
     */
    #abc;

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
    static fromKey(keyNum) {
        let newNote = new Note();
        newNote.num = keyNum;
        return newNote;
    }

    set num(keyNum) {
        this.#keyNum = keyNum;
        this.#abc = undefined;
    }

    get num() {
        if (this.#keyNum == undefined && this.#abc != undefined) {
            // TODO: calculate this.#keyNum based on this.#abc
        }
        return this.#keyNum;
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
        this.#keyNum = undefined;
    }

    get abc() {
        if (this.#abc == undefined && this.#keyNum != undefined) {
            this.#abc = Note.numToAbc(this.#keyNum, this.#length);
        }
        return this.#abc;
    }

    static numToAbc(noteNum, length, signature) {
        // const sampleNotes = ["X:1\nT:Example\nK:Bb\nBcde|\n", "X:1\nK:D\nDD AA|BBA2|\n"];
        const noteInOctave = this.#positiveModulo(noteNum, 12); // noteNum % 12 but with real modulo instead of JS's negative-friendly oddity
        const octave = Math.floor(noteNum / 12);
        const sharp = [1, 3, 6, 8, 10].indexOf(noteInOctave);

        let adjustedNote = noteInOctave;
        for (const i of [1, 3, 6, 8, 10]) {
            if (noteInOctave >= i) adjustedNote--;
        }

        const aIndexed = this.#positiveModulo(adjustedNote + 2, 7); // +2 to go from C=0 to A=1
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

        // console.log({noteNum, noteInOctave, octave, sharp, adjustedNote, abcNote});
        return abcNote;
    }

    static #positiveModulo(num, mod) { // until I have a math lib...
        return ((num % mod) + mod) % mod;
    }
}

