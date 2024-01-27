import component1 from '../../components/component1.js';

export default {
    name: 'Play',
    components: {component1},

    setup() {
        const title = 'Play Practice'
        return {title}
    },

    template: `
        <div>
            {{ title }}
            <component1></component1>
        </div>
    `,
};