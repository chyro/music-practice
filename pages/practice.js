import * as practiceComponents from '../components/index-practice-components.js'

/**
 * Base page for practice session
 * linked to by the dean's recommendations etc
 * loads the requested practice component, and passes it the requested parameters
 *
 * TODO: report the results I suppose? or are the results too intricate, and the practice component should do that? also maybe result reporting should be ongoing rather than once at the end, at least sometimes?
 */
export default {
    name: 'Practice Page',
    components: practiceComponents,

    props: {
        component: String,
        params: Object,
        /* e.g. {component: 'practice', params: {prompt: 'listen'}} */
    },

    setup(props) {
        // const {} = Vue;

        let practiceComponent = 'practice'; // meaningful default
        let practiceParams = {};
        if (props && props.hasOwnProperty('params') && props.params) {
            if (props.params.hasOwnProperty('component')) {
                practiceComponent = props.params.component;
            }
            if (props.params.hasOwnProperty('params')) {
                practiceParams = props.params.params;
            }
        }

        return {
            // libs
            //???
            // vars
            practiceComponent, practiceParams
            // listeners
            //???
            // helpers
            //???
            // DOM refs
            //???
        };
    },

    template: `
        <div>
            Practice page
            <component :is="practiceComponent" :params="practiceParams"></component>
        </div>
    `,
};
