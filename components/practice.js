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
        const {watchEffect, onMounted, ref} = Vue;

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
        let toneSampler = window.toneSampler;

        onMounted(() => {
            visualInput.value.addEventListener('press', keyPressed);
            // TODO: register for inputs from MIDI (and unregister on unmount probably)

            loadParams(props.params);
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

            const questionKey = testNote.pianoKey;
            const answerKey = e.detail.key;
            console.log('piano-keyboard is saying somebody pressed key #' + answerKey + ', test note was ' + questionKey);
            if (answerKey == questionKey) {
                Memory.registerCorrect(exerciseType, questionKey); // TODO: also note the time taken to answer
                pickRandomNote();
            } else {
                Memory.registerError(exerciseType, questionKey, answerKey);
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
                playNote();
            }
        };

        function playNote() {
            if (!testNote) return;
            // e.g. sampler.triggerAttackRelease(['C4', 'G4'], '4n', Tone.now() + 1);
            window.toneSampler.triggerAttackRelease(testNote.spn, '4n');
        }

        return {
            // libs
            store,
            // vars
            keyRange, prompt, toneSampler, // name, testNote, keyRange, prompt, notePicker,
            // listeners
            pickRandomNote, playNote, // keyPressed,
            // helpers
            loadParams,
            // refs
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
            <button :disabled="toneSampler == null" v-on:click="pickRandomNote">Start (display a random note)</button>
        </div>
      </div>
    `,
};
