/**
 * Memory-related function, in particular calculation of spaced repetitions
 */
export default class Memory {
    static registerCorrect(exerciseType, questionKey) { console.log('Noting: correct'); }
    static registerError(exerciseType, questionKey, answerKey) { console.log('Noting: error'); }
}
