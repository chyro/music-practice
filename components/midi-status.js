// import store from '../store.js';
// import {Math2, Memory, Note} from '../lib/music.js';
import MidiInput from '../lib/Music/midi-input.js';

// MAYBE: extend from StatusMonitor?

export default {
    name: 'Midi input status monitor',


    setup(props) {
        const {onBeforeUnmount, onMounted, ref} = Vue;

        const midiInput = MidiInput.getMidiInputSingleton();

        // const sampler = inject('sampler');
        let available = ref(false);

        onMounted(() => {
            midiInput.addEventListener('state-change', stateChanged);
            // Should I create a timer to regularly check the status of midi devices?
        });

        onBeforeUnmount(() => {
            midiInput.removeEventListener('state-change', stateChanged);
        });

        function stateChanged() {
            available.value = midiInput.hasActiveDevices();
        }

        /*watchEffect(() => {
            available.value = false; // ???
        });*/

        return {
            // libs
            //???
            // vars
            available,
            // listeners
            //???
            // helpers
            //???
            // DOM refs
            //???
        };
    },


    template: `
        <div class="midi-status-monitor msm" :title="'Midi status: ' + (available ? 'on' : 'off')">
            <div class="led" :class="{on: available}"></div>
        </div>
    `,
};

