import {DoodleGenerator, RandomGenerator} from '../lib/unique-doodle.js'

/**
 * Generates a unique visual representation for a given string.
 * Requesting the same string multiple times will always give the same representation.
 */

export default {
    name: 'String Icon',

    props: {
        string: String,
        width: { type: Number, default: 60 },
        height: { type: Number, default: 60 },
    },

    watch: {
        string: function(newString) {
            this.generateIcon(newString);
        }
    },

    setup(props) {
        const {onMounted, ref} = Vue;

        const fillColor = ref('rgb(240, 240, 240)');
        const strokeColor = ref('rgb(0, 0, 0)');
        const pathDots = ref('');

        onMounted(() => {
            generateIcon(props.string);
        });

        function generateIcon(baseStr) {
            let width = 40, height = 40;

            const rand = RandomGenerator.createFromStrSeed(baseStr);

            const minLength = (width + height) * .2, maxLength = (width + height) * .3;
            const length = minLength + rand.getInt(maxLength - minLength);

            const bgRed = 150 + rand.getInt(50);
            const bgGreen = 150 + rand.getInt(50);
            const bgBlue = 150 + rand.getInt(50);

            const red = rand.getInt(180);
            const green = rand.getInt(180);
            const blue = rand.getInt(180);

            const doodler = new DoodleGenerator(width, height, length);
            doodler.setRandomGenerator(rand);

            const randomPath = doodler.createPathString();

            fillColor.value = `rgb(${bgRed}, ${bgGreen}, ${bgBlue})`;
            strokeColor.value = `rgb(${red}, ${green}, ${blue})`;
            pathDots.value = randomPath;
        }

        return {
            // vars
            strokeColor, pathDots, fillColor,
        };
    },


    template: `
        <svg xmlns="http://www.w3.org/2000/svg"
            :width="width" :height="height" viewBox="0 0 40 40" preserveAspectRatio="none"
            fill="none" :stroke="strokeColor"
        >
            <title>Midi device ID: {{ string }}</title>
            <rect width="100%" height="100%" :fill="fillColor" rx="20%" stroke="none" />
            <path :d="pathDots"></path>
        </svg>
    `,
};

