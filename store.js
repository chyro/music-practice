export default Vue.reactive({
    /* variables starting with $ are automatically saved in localstorage */

    /**
     * ???
     */

    $progress: {
        // music piece: []?
        // score note: []? per note, per signature, per key?
        // also keep track of notes for listening practice?
        // Split by practice type, letting the practice determine the content? Might I want one practice's progress to matter for another practice?
        // Since practices will have overlap, maybe some test can establish progress for multiple practices?
    },

    /**
     * Demo stuff
     */
    //component1
    $counter: 0,

    //component2
    message: null,

    //component3
    searchString: '',
    sortedColumn: null,
    sortedOrder: null,
    
})