// import store from '../store.js';
// import {Math2, Memory, Note} from '../lib/music.js';
// TODO: import MidiInput from '../lib/Music/midi-input.js';

// MAYBE: extend from StatusMonitor?

export default {
    name: 'Midi input status monitor',


    setup(props) {
        const {inject, onMounted, ref, watchEffect} = Vue;

        // const sampler = inject('sampler');
        let available = ref(false);

        onMounted(() => {
            // Should I create a timer to regularly check the status of midi devices?
        });

        watchEffect(() => {
            available.value = false; // ???
        });

        return {
            // libs
            //???
            // vars
            available,
            // listeners
            //???
            // helpers
            //???
            // refs
            //???
        };
    },


    template: `
        <div class="midi-status-monitor" :title="'Midi status: ' + (available ? 'on' : 'off')">
            <div class="led" :class="{on: available}"></div>
        </div>
    `,
};

