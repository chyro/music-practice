import homepage from './pages/home.js'
import customPractice from './pages/custom-practice.js'
import midiSetup from './pages/midi-setup.js'
import * as pages from './pages/index.js'
import TonejsStatus from './components/tonejs-status.js'
import MidiStatus from './components/midi-status.js'
import MusicInput from './lib/Music/input.js'
import MusicOutput from './lib/Music/output.js'
import store from './store.js'

export default {
    name: 'App',
    components: Object.assign({homepage, customPractice, midiSetup, MidiStatus, TonejsStatus}, pages),

    setup() {
        const {onMounted, provide, ref, shallowRef, watchEffect} = Vue;
        const page = ref(null);
        const pageParams = ref(null);

        // so children (pages, contained components) can navigate if needed
        provide('navigator', {navigate: function (targetPage, targetParams = {}) { page.value = targetPage; pageParams.value = targetParams; }});

        const sampler = ref(null);
        provide('sampler', sampler); // TODO: remove this, replace tonejs-status with output-status

        const musicInput = ref(new MusicInput);
        provide('music-input', musicInput);
        const musicOutput = shallowRef(new MusicOutput);
        provide('music-output', musicOutput);

        onMounted(() => {
            //store management: save $variables to localstorage
            window.addEventListener('beforeunload', () => {
                Object.keys(store).forEach(function (key){
                    if (key.charAt(0) == "$") { localStorage.setItem(key, store[key]); } else { localStorage.removeItem("$" + key); }
                });
            });
            Object.keys(store).forEach(function (key) {
                if (key.charAt(0) == "$") {
                    if (localStorage.getItem(key)) store[key] = localStorage.getItem(key);
                }
            });
        });

        //url management
        watchEffect(() => {
            const urlpage = window.location.pathname.split("/").pop();
            if (page.value == null) { page.value = urlpage; }
            if (page.value != urlpage) { const url = page.value ? page.value : './'; window.history.pushState({url: url}, '', url); }
            window.onpopstate = function() { page.value = window.location.pathname.split("/").pop(); };

            // I wish this could be in onMounted, but sound is not allowed until the user interacts. Trying here, when pages change:
            if (!sampler.value) {
                // TODO: load mp3 files in a sensible place
                const loadingSampler = new Tone.Sampler({
                    urls: { "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3" },
                    release: 1, baseUrl: "https://tonejs.github.io/audio/salamander/",
                    onload: () => {
                        sampler.value = loadingSampler; // maybe: triggerRef(sampler);
                        musicOutput.value.registerToneJSSampler(loadingSampler);
                    },
                }).toDestination();
            }
        });

        return {page, pageParams, pages};
    },

    template: `
        <div id="sidebar">
            <nav>
                <button v-on:click="page = ''">Home</button>
                <template v-for="item, index in pages" key="item.name">
                    <button v-on:click="page = index">
                        {{ item.name }}
                    </button>
                </template>
            </nav>
            <div class="status">
                <TonejsStatus/>
                <MidiStatus v-on:click="page = 'midiSetup'"/>
            </div>
        </div>
        <div id="content">
            <!-- button v-on:click="page = 'readPractice'">Only works when it's on the menu - can't have undeclared subpages this way</button -->
            <component :is="page || 'homepage'" :params="pageParams"></component>
        </div>
    `,
};
