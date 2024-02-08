/**
 * Helper class for some math-related functions
 */
export default class Math2 { // avoiding Math name which would overwrite the JS object. Alternatively, this could extend the Math object which extra functions...
    /**
     * Actual modulo: just like JavaScript's % operator, except never negative.
     */
    static modulo(num, mod) {
        return ((num % mod) + mod) % mod;
    }

    static getRandomRotator(weightedOptions) {
        return new RandomRotator(weightedOptions);
    }
}

/**
 * RandomRotator
 *
 * Attempt at returning large numbers of random values, in specific uneven proportions
 * e.g. {dog: 3, cat: 5} should return on +/- 300 dogs and 500 cats out of 800 attempts
 *
 * Usage:
 * const pool = Math2.getRandomRotator({dog: 3, cat: 5});
 * const picked = {dog: 0, cat: 0};
 * for (let i = 0; i < 800; i++) {
 *   picked[pool.pick()]++;
 * }
 * console.log(picked);
 */
class RandomRotator {
    #weightedOptions = {};
    #optionsPool = {};

    constructor(weightedOptions) {
        this.#weightedOptions = { ...weightedOptions };
        this.#optionsPool = { ...weightedOptions };
    }

    pick() {
        const {picked, optionsPool} = RandomRotator.rotatingWeightedRandom(this.#optionsPool, this.#weightedOptions);
        this.#optionsPool = optionsPool; // actually not useful since passed by reference so this already happens by side effect but let's pretend JS is a clean language
        return picked;
    }

    static rotatingWeightedRandom(optionsPool, weightedOptions) {
        const picked = RandomRotator.weightedRandom(optionsPool);
        optionsPool[picked]--;
        if (optionsPool[picked] <= 0) { // pool is running low, refilling pool
            for (let o in weightedOptions) {
                optionsPool[o] += weightedOptions[o];
            }
        }
        return {picked, optionsPool};
    }

    static weightedRandom(options) {
        let totalPotential = 0;
        for (let o in options) {
            totalPotential += options[o];
        }
        let pick = Math.floor(Math.random() * totalPotential);
        let selectedOption;
        for (selectedOption in options) {
            pick -= options[selectedOption];
            if (pick < 0) {
                break;
            }
        }
        return selectedOption;
    }
}
