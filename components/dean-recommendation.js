// import store from '../store.js';
// import {Math2, Memory, Note} from '../lib/music.js';
import Dean from '../lib/Music/dean.js';

export default {
    name: 'Dean Recommendation',


    setup(props) {
        const {inject} = Vue;

        const navigator = inject('navigator');

        let recommendations = Dean.getRecommendations(); // {needsWork: [], refresher: [], nextCourse: []};

        // onMounted(() => {});
        // watchEffect(() => {});

        function navigateTo(practiceSessionInfo) {
            navigator.navigate(practiceSessionInfo.page, { component: practiceSessionInfo.component, params: practiceSessionInfo.params });
        }

        function registerFor(practiceSessionInfo) {
            // TODO
        }

        return {
            // libs
            //???
            // vars
            recommendations,
            // listeners
            navigateTo, registerFor,
            // helpers
            //???
            // refs
            //???
        };
    },


    template: `
        <div class="dean-recommendation dr">
            <div class="dr-needs-work" v-if="recommendations.needsWork.length > 0">
                <h3>I think you could benefit from some practice on those...</h3>
                <ul>
                    <li v-for="item, index in recommendations.needsWork">
                        <a v-on:click="navigateTo(item)">...</a>
                        <!-- How do I get a label for this? Components need to be able to label themselves? -->
                    </li>
                </ul>
            </div>
            <div class="dr-refresher" v-if="recommendations.refresher.length > 0">
                <h3>You could refresh skills you haven't practiced in a while</h3>
                TODO: links to practice for those
            </div>
            <div class="dr-nextCourse" v-if="recommendations.nextCourse.length > 0">
                <h3>You could register for new units to learn some new skills</h3>
                TODO: links to register->practice for those
            </div>
        </div>
    `,
};

