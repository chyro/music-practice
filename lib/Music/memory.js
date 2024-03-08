/**
 * Memory-related function, in particular calculation of spaced repetitions
 */
export default class Memory {
    static registerCorrect(exerciseType, questionNote) { console.log('Noting: correct'); }
    static registerError(exerciseType, questionNote, answerNote) { console.log('Noting: error'); }
}
