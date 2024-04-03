// import Note from './note.js';

/**
 * Pretentious name for the "entry point" class that manages the overall learning progress:
 * - keep track of registered units, timing of practices, performance
 * - suggest practice of registered units, based on need (low performance and / or no recent practice)
 * - suggest registering to new units, if all current units are solid, based on skill tree dependencies
 */
export default class Dean {
    /*
    TODO...
    / 1. Dean returns [sight read 40-52] [listening 40-52]
    2. Dean keeps track of started units ~> returns any ongoing unit
    3. Dean keeps track of success rate
    ~> returns ongoing units, prioritizing those with high error rate, prioritizing those not done for a long time, skipping those already done today
    ~> for all units with a decent success rate, suggests registering to child units
    */
    static getRecommendations() {
        return { needsWork: [
            {page: 'practice', component: 'practice', params: {}},
            {page: 'practice', component: 'practice', params: {prompt: 'listen'}},
        ], refresher: [], nextCourse: [] };
        // return { needsWork: this.getFailedUnits(), refresher: this.getUnpracticedUnits(), nextCourse: this.getNextUnits() };
    }

    static getFailedUnits() {
        // TODO: get all currently enrolled units
        // TODO: for each, get the success rate of the last few sessions (how many?)
        // TODO: return random 3 out of the bottom 5 track records
        return [];
    }

    static getUnpracticedUnits() {
        // TODO: get all currently enrolled units
        // TODO: sort organically somehow? prioritize those not practiced for a while, but also take into account those that had low results?
        // or is this redundant with the previous one? I think it is good to have both section... Maybe calling the same search function but with different params, one with more weight on date and one with more weight on score?
        // TODO: return random 3 out of the top 5
        return [];
    }

    static getNextUnits() {
        // TODO: get all un-enrolled units
        // for each, if all parent units are already enrolled and have decent track record, add to the "maybe" pile
        // return random 2 of the "maybe" pile
        return [];
    }
// Do I need a "all courses" class, separate from the class that handles progress tracking?
// Actually selecting units will be tricky, since reading and hearing proficiency might be recorded per-note. One unit per note is dumb. Having each unit include the notes of the previous one might help but is not very flexible. Maybe leave units as per-octave but then add upper level units as consecutive group of octaves? Or treat all sightreading as a single unit and let it handle the note selection...
// Should units be more complex, and contain a series of sub-items? Like registering for a unit about listening for a range would include practice sessions with absolute test, intervals, chords, etc
}
