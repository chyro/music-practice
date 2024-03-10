import MidiInput from '../lib/Music/midi-input.js'
// import {getUniqueDoodlePath} from '../lib/unique-doodle.js'
import StringIcon from '../components/string-icon.js'

export default {
    name: 'Midi setup',

    components: {StringIcon},

    setup() {
        const {inject, ref, toRaw, triggerRef} = Vue;

        const title = 'Midi setup page';

        const musicInput = inject('music-input');
        // I cannot provide midiInput here... Ideally I don't want the App to provide it, it shouldn't be aware of it.
        // Who then would be in charge of initializing it? Should I forsake the Vue3 injection system, and do
        // a basic JS factory/singleton in MidiInput? But then I could have done that for everything provided by App...
        // Would that be going against the Vue3 way of doing things?
        const midiInput = MidiInput.getMidiInputSingleton();

        const midiDevices = ref({});

        function selectMidiInput(deviceId) {
            unselectMidiInput();
            midiDevices.value[deviceId].selected = true;
        }
        function unselectMidiInput() {
            // TODO: for each midiDevices.value, set .selected to false
        };
        async function scanMidi() {
            // Maybe: set a loading wheel?
            const localMidiDevices = toRaw(midiDevices.value);
            for (const midiId in localMidiDevices) {
                localMidiDevices[midiId].status = 'offline';
            }

            const midiInputs = await midiInput.getMidiInputs();
            for (const midiId in midiInputs) {
                if (!localMidiDevices.hasOwnProperty(midiId)) {
                    localMidiDevices[midiId] = {
                        id: midiId,
                        name: midiInputs[midiId].name,
                        selected: false,
                    };
                }
                localMidiDevices[midiId].status = 'online';
            }

            midiDevices.value = localMidiDevices;
            triggerRef(midiDevices);
        }

        return {
            // libs
            // getUniqueDoodlePath,
            // vars
            title, midiDevices,
            // DOM refs
            // practiceType, keyboardRangeOption, keySignature,
            // functions
            scanMidi, selectMidiInput, unselectMidiInput,
        };
    },

    template: `
        <div>
            <h1>{{ title }}</h1>
            <button v-on:click="scanMidi">Scan midi devices</button>
            <div>
                <table>
                    <tr>
                        <th>device ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th><!-- register in MidiInput, to use in the rest of the app --></th>
                    </tr>
                    <template v-for="device, index in midiDevices" key="device.id">
                        <tr :class=" device.status + (device.selected ? ' selected' : '')">
                            <!-- td><svg fill="none" width=40 height=40 viewbox="0 0 40 40" stroke="black"><path :d="getUniqueDoodlePath(device.id)"/></svg></td -->
                            <!-- td><StringIcon :width=80 :height=20 :string="device.id"/></td -->
                            <td><StringIcon :string="device.id"/></td>
                            <td>{{ device.name }}</td>
                            <td>{{ device.status ? 'online' : 'offline' }}</td>
                            <td>
                                <button v-if="device.selected" v-on:click="unselectMidiInput">selected - click to unselected</button>
                                <button v-if="!device.selected" v-on:click="selectMidiInput(device.id)">click to select</button>
                            </td>
                        </tr>
                    </template>
                </table>
            </div>
        </div>
    `,
};
