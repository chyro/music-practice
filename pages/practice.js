import practiceComponent from '../../components/practice.js';

export default {
    name: 'Customizable Practice Page',
    components: {practiceComponent},

    setup() {
        const {watchEffect, onMounted, ref} = Vue;

        const title = 'Customizable practice';
        const practiceType = ref('read');
        const keySignature = ref('C');
        const keyboardRangeOption = ref('1-88');
        let keyboardRange = [1, 88];

        const practiceParams = ref(null);

        function resetPractice(e) {
            practiceParams.value = {
                prompt: practiceType.value,
                keySignature: keySignature.value,
                keyRange: keyboardRange,
                // notesToPractice: Array, // TODO
            };
        }

        watchEffect(() => {
            keyboardRange = keyboardRangeOption.value.split('-');
        });

        return {
            // vars
            title, keyboardRange, practiceParams,
            // refs
            practiceType, keyboardRangeOption, keySignature,
            // functions
            resetPractice
        };
    },

    template: `
        <div>
            {{ title }}
            <p>Practice type: <input type="radio" v-model="practiceType" value="read"> Read <input type="radio" v-model="practiceType" value="listen"> Listen</p>
            <p>Key signature: <input type="radio" v-model="keySignature" value="C"> C <input type="radio" v-model="keySignature" value="G"> G <input type="radio" v-model="keySignature" value="Cm"> Cm</p>
            <p>Keyboard range: <input type="radio" v-model="keyboardRangeOption" value="1-88"> full width <input type="radio" v-model="keyboardRangeOption" value="15-64"> small piano <input type="radio" v-model="keyboardRangeOption" value="35-60"> right hand only <input type="radio" v-model="keyboardRangeOption" value="20-45"> left hand only</p>
            <button v-on:click="resetPractice">Load selected settings</button>
            <practiceComponent :params="practiceParams"></practiceComponent>
        </div>
    `,
};
