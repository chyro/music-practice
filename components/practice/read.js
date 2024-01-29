import store from '../../store.js';
// import ABCJS from '../../vendor/abcjs-basic-min.js'
import * as Music from '../../lib/music.js';

export default {
    name: 'Read Practice Component',


    setup() {
        const {watchEffect, onMounted, ref} = Vue;

        const name = 'Read Practice Component';

        // const $noteContainer = ref(null);

        onMounted(() => {
            //$noteContainer.value.innerText = 'Dynamically loaded';
        });

        function pickRandomNote() {
            // $noteContainer.value.innerText = 'Dynamically loaded'; // could display the SVG here but ~~~~
            // const rendered = ABCJS.renderAbc("*", note); // not sure how to get the generated SVG from that

            let key = 'C'; // eventually based on practice settings
            let testNote = Music.randomNote(0, 23); // essentially the whole treble clef
            // for (let i = -39; i < 49; i++) { testNote += Music.numToAbc(i); } // full piano keyboard, left to right
            let abcNoteSheet ="X:1\nL:1/4\nK:" + key + "\n" + testNote.abc;
            // ABCJS.renderAbc('note-container', sampleNotes[1]);
            ABCJS.renderAbc('note-container', abcNoteSheet);
        };

        return {store, name, pickRandomNote}; // , $noteContainer};
    },


    template: `
      <div>
        <h1>{{ name }}</h1>
        <div class="question">
            <!-- div v-if="note">{{ ABCJS.renderAbc("*", note) }}</div -->
            <div id="note-container"></div>
            <div ref="$noteContainer" class="note-container"></div>
        </div>
        <div class="answer">
            <p>TODO: display keyboard as webcomponent, event listener checking, generate next</p>
            <p>TODO also: detect midi input</p>
            <button v-on:click="pickRandomNote">Click</button>
        </div>
      </div>
    `,
};
