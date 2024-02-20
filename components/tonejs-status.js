// import store from '../store.js';
// import {Math2, Memory, Note} from '../lib/music.js';

// MAYBE: extend from StatusMonitor?

export default {
    name: 'ToneJS status monitor',


    setup(props) {
        const {inject, onMounted, ref, watchEffect} = Vue;

	const sampler = inject('sampler');
	let available = ref(false);

        onMounted(() => {
            // Should I create a timer to regularly check the status of the sampler? Would it ever go away or break?
        });

        watchEffect(() => {
            available.value = sampler.value?.loaded;
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
        <div class="tonejs-status-monitor" :title="'ToneJS status: ' + (available ? 'on' : 'off')">
            <div class="led" :class="{on: available}"></div>
        </div>
    `,
};

