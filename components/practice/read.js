import store from '../../store.js';
// import ABCJS from '../../vendor/abcjs-basic-min.js'
import {Math2, Memory, Note} from '../../lib/music.js';

export default {
    name: 'Read Practice Component',


    setup() {
        const {watchEffect, onMounted, ref} = Vue;

        const name = 'Read Practice Component';
        const exerciseType = 'Read Practice';

        const noteContainer = ref(null);
        const visualInput = ref(null);
        let testNote;

        /**
         * Practice settings
         *
         * TODO: get those as component param, from the upcoming Dean class
         */
        const keySignature = 'C';
        const keyRange = [1, 88];
        const notesToPractice = {};
        for (let i of Array(24).keys()) notesToPractice[i + 40] = 5; // essentially the whole treble clef - all notes equally likely to come up
        notesToPractice[46] = 25; // except F# which will come up 5 times more, to see if that works

        const notePicker = Math2.getRandomRotator(notesToPractice);

        onMounted(() => {
            visualInput.value.addEventListener('press', keyPressed);
        });

        function keyPressed(e) {
            const questionKey = testNote.pianoKey;
            const answerKey = e.detail.key;
            console.log('piano-keyboard is saying somebody pressed key #' + answerKey + ', test note was ' + questionKey);
            if (answerKey == questionKey) {
                Memory.registerCorrect(exerciseType, questionKey); // TODO: also note the time taken to answer
                // TODO: generate the next test note
            } else {
                Memory.registerError(exerciseType, questionKey, answerKey);
            }
        }

        function pickRandomNote(e) {
            // noteContainer.value.innerText = 'Dynamically loaded'; // could display the SVG here but ~~~~
            // const rendered = ABCJS.renderAbc("*", note); // not sure how to get the generated SVG from that

            testNote = notePicker.pick();
            testNote = Note.fromPianoKey(testNote);
            let abcNoteSheet ="X:1\nL:1/4\nK:" + keySignature + "\n" + testNote.abc;
            // for (let i = 1; i < 88; i++) { abcNoteSheet += Note.fromPianoKey(i).abc; } // full piano keyboard, left to right
            ABCJS.renderAbc('note-container', abcNoteSheet);

            // TODO: init elsewhere
            // TODO: load mp3 files in a sensible place
            const sampler = new Tone.Sampler(
                { urls: { "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3" },
                release: 1, baseUrl: "https://tonejs.github.io/audio/salamander/"}
            ).toDestination();

            // Tone.loaded().then(() => { sampler.triggerAttackRelease(["Eb4", "G4", "Bb4"], 4); });
            Tone.loaded().then(() => {
                sampler.triggerAttackRelease(testNote.spn, '4n', );
                // sampler.triggerAttackRelease(['C4', 'G4'], '4n', Tone.now() + 1);
            });
        };

        return {
            // libs
            store,
            // vars
            name, exerciseType, testNote, keyRange, notePicker,
            // listeners
            pickRandomNote, keyPressed,
            // refs
            noteContainer, visualInput
        };
    },


    template: `
      <div>
        <h1>{{ name }}</h1>
        <div class="question">
            <!-- div v-if="note">{{ ABCJS.renderAbc("*", note) }}</div -->
            <div id="note-container"></div>
            <div ref="noteContainer" id="note-container"></div>
        </div>
        <div class="answer">
            <p class="class{{keyRange[0]}}">{{keyRange[0]}}-{{keyRange[1]}}</p>
            <piano-keyboard ref="visualInput" :from="keyRange[0]" :to="keyRange[1]" interactive=1></piano-keyboard>
            <p>TODO also: detect midi input</p>
            <button v-on:click="pickRandomNote">Start (display a random note)</button>
        </div>
      </div>
    `,
};
