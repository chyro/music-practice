import readPractice from '../../components/practice/read.js';

export default {
    name: 'Read Practice Page',
    components: {readPractice},

    setup() {
        const title = 'Read Practice Page';
        return {title};
    },

    template: `
        <div>
            {{ title }}
            <readPractice></readPractice>
        </div>
    `,
};
