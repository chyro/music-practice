import component1 from '../../components/component1.js';

export default {
    name: 'Listen',
    components: {component1},

    setup() {
        const title = 'Listen Practice'
        return {title}
    },

    template: `
        <div>
            {{ title }}
            <component1></component1>
        </div>
    `,
};