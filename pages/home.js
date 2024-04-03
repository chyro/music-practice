import deanRecommendation from '../../components/dean-recommendation.js';

export default {
    name: 'Home',
    components: {deanRecommendation},

    setup() {
        const title = 'Home page'
        return {title}
    },

    template: `
        <div>
            {{ title }}
            <deanRecommendation/>
            Anything else? welcome line? last connection time? login form? link to stats? link to list of units? MotD?
        </div>
    `,
};
