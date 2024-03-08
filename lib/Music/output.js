// import {Note} from '../lib/music.js';

// not sure if there will be multiple outputs, but at the least that will be a nice symmetry with the MusicInput.
// maybe should extend EventTarget, and trigger events when registered outputs change status? Along with a hasValidOutput() function?
export default class MusicOutput {

    #tonejsSampler = null;

    registerToneJSSampler(sampler) {
        this.#tonejsSampler = sampler;
    }

    hasValidOutput() {
        return this.#tonejsSampler !== null;
        // should I check its status?
    }

    // Maybe: registerMidiOutput(midiDevice) ?
    // Maybe: hasValidOutput() ?

    playNotes(notes, duration = 1) {
         // e.g. sampler.triggerAttackRelease(['C4', 'G4'], '4n', Tone.now() + 1);
        const spnNotes = notes.map((n) => { return n.spn; });
        this.#tonejsSampler.triggerAttackRelease(spnNotes, '4n');
        // TODO: loop other outputs
    }

}
