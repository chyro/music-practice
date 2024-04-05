import store from '../store.js';
import {Math2, Memory, Note} from '../lib/music.js';

export default {
    name: 'Generic Music Practice Component',

    props: {
        //e.g. message: String, // <component2 :message="msg"></component2>
        params: Object,
        /* {
            keySignature: String,
            keyRange: Array,
            prompt: String, // "read" or "listen"
            notesToPractice: Array, // either specific (e.g. "focused listening practice on octave 4"), if unspecified then random? possibly would be good to adjust the notes on the fly during practice, maybe overkill, maybe does not fit in this component
        } */
    },

    watch: {
        params: function(newParams) {
            this.loadParams(newParams);
        }
    },

    setup(props) {
        const {onBeforeUnmount, inject, onMounted, ref, watchEffect} = Vue;

        const noteReadContainer = ref(null);
        const visualInput = ref(null);
        let testNote;

        const defaultParams = {
            keyRange: [1, 88],
            keySignature: 'C',
            notesToPractice: {},
            prompt: 'read',
        };
        if (Object.keys({}).length == 0) { // sane default
            for (let i of Array(24).keys()) defaultParams.notesToPractice[i + 40] = 5; // essentially the whole treble clef - all notes equally likely to come up
        }

        /**
         * Practice settings
         */
        const keySignature = ref(defaultParams.keySignature);
        const keyRange = ref(defaultParams.keyRange);
        const notesToPractice = ref(defaultParams.notesToPractice);
        const prompt = ref(defaultParams.prompt);
        const exerciseType = ref(null); // calculated

        let notePicker = Math2.getRandomRotator({});
        const musicInput = inject('music-input');
        const musicOutput = inject('music-output');

        onMounted(() => {
            musicInput.value.registerOnScreenKeyboard(visualInput.value);
            musicInput.value.addEventListener('pressed-key', keyPressed);

            loadParams(props.params);
        });

        onBeforeUnmount(() => {
            musicInput.value.unregisterOnScreenKeyboard(visualInput.value);
            musicInput.value.removeEventListener('pressed-key', keyPressed);

            // Anything else? Reporting statistics maybe?
        });

        watchEffect(() => {
            exerciseType.value = prompt.value + ' practice';
            notePicker = Math2.getRandomRotator(notesToPractice.value);
        });

        function loadParams(attrParams) {
            const params = { ...defaultParams, ...attrParams};
            // console.log({defaultParams, attrParams, params});
            keySignature.value = params.keySignature;
            keyRange.value = params.keyRange;
            notesToPractice.value = params.notesToPractice;
            prompt.value = params.prompt;
        }

        function keyPressed(e) {
            if (!testNote) return; // no active question: ignore

            musicOutput.value.playNotes([Note.fromPianoKey(e.detail.note.pianoKey)]);

            console.log('piano-keyboard is saying somebody pressed key #' + e.detail.note.pianoKey + ', test note was ' + testNote.pianoKey);
            if (testNote.equals(e.detail.note)) { // correct! moving on
                Memory.registerCorrect(exerciseType, testNote); // TODO: also note the time taken to answer

                // small delay before showing the next question
                new Promise(r => setTimeout(r, 2000)).then(pickRandomNote);
                // inspired by https://stackoverflow.com/a/39914235
            } else {
                Memory.registerError(exerciseType, testNote, e.detail.note);
            }
        }

        function pickRandomNote() {
            // noteReadContainer.value.innerText = 'Dynamically loaded'; // could display the SVG here but ~~~~
            // const rendered = ABCJS.renderAbc("*", note); // not sure how to get the generated SVG from that

            testNote = notePicker.pick();
            testNote = Note.fromPianoKey(testNote);

            if (prompt.value == 'read') {
                let abcNoteSheet ="X:1\nL:1/4\nK:" + keySignature + "\n" + testNote.abc;
                ABCJS.renderAbc('note-read-container', abcNoteSheet);
            }

            if (prompt.value == 'listen') {
                musicOutput.value.playNotes([testNote]);
            }
        };

        function playNote() {
            musicOutput.value.playNotes([testNote]);
        };

        return {
            // libs
            store,
            // vars
            keyRange, prompt, musicOutput, // name, testNote, keyRange, prompt, notePicker,
            // listeners
            pickRandomNote, playNote, // keyPressed,
            // helpers
            loadParams,
            // DOM refs
            noteReadContainer, visualInput
        };
    },


    template: `
      <div>
        <h1>Practice</h1>
        <div class="question">
            <div v-if="prompt == 'read'"><div ref="noteReadContainer" id="note-read-container"></div></div>
            <div v-if="prompt == 'listen'"><button v-on:click="playNote">Play note</button></div>
        </div>
        <div class="answer">
            <piano-keyboard ref="visualInput" :from="keyRange[0]" :to="keyRange[1]" interactive=1></piano-keyboard>
            <button v-on:click="pickRandomNote">Start (display a random note)</button>
            <!-- maybe: :disabled="!musicOutput.hasValidOutput()" -->
        </div>
      </div>
    `,
};
