import homepage from './pages/home.js'
import practice from './pages/practice.js'
import * as pages from './pages/index.js'
import TonejsStatus from './components/tonejs-status.js'
import store from './store.js'

export default {
    name: 'App',
    components: Object.assign({homepage, practice, TonejsStatus}, pages),

    setup() {
        const {onMounted, provide, ref, watchEffect} = Vue;
        const page = ref(null);

        const sampler = ref(null);
        provide('sampler', sampler); // MAYBE: this should pass a SoundManager wrapper class, so the rest of the code can mindlessly call "SoundManager.play('C5')" without caring?

        onMounted(() => {
            //store management: save $variables to localstorage
            window.addEventListener('beforeunload', () => {
                Object.keys(store).forEach(function (key){
                    if (key.charAt(0) == "$") {localStorage.setItem(key, store[key]); } else {localStorage.removeItem("$" + key);}
                });
            });
            Object.keys(store).forEach(function (key){
                if (key.charAt(0) == "$") {
                    if (localStorage.getItem(key)) store[key] = localStorage.getItem(key);
                }}
            );
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
                    onload: () => { sampler.value = loadingSampler; }, // maybe: triggerRef(sampler);
                }).toDestination();
            }
        });

        return {page, pages}
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
            </div>
        </div>
        <div id="content">
            <!-- button v-on:click="page = 'readPractice'">Only works when it's on the menu - can't have undeclared subpages this way</button -->
            <component :is="page || 'homepage'"></component>
        </div>
    `,
};
