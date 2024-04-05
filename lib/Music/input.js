import {Note} from '../music.js';
/*
Mostly what we want from here is being notified of played notes.

propagate key events, in a way that the core code doesn't need to know
- if it comes from midi or from other sources
- if midi was disconnected halfway, or replaced
etc

calling code might register to "pressed-key" (i.e. only last played note), or to "played-chord" (all currently pressed keys)
the former might be simpler and more flexible, for low difficulty exercises, or more leniency during complex playthrough
the latter might be useful for more rigorous practice, e.g. getting things right when first reading a piece, before fluency makes things hard to track

This class is an EventTarget
https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/EventTarget
calling code can do:
const input = new MusicInput();
input.registerOnScreenKeyboard(document.querySelector('#keyboard'));
input.registerMidiKeyboard(deviceId);
input.addEventListener
*/
export default class MusicInput extends EventTarget {
    /* constructor() {
      super();
    } */

    init() {
        // listen to "played note" notifications from MidiInput helper class
        // listen to "played note" notifications from onscreen keyboards, whatever else
    }

    onScreenKeyboardPress(e) {
        this.notifyPressedKey(Note.fromPianoKey(e.detail.key));
    }

    registerOnScreenKeyboard(el) {
        el.addEventListener('press', this.onScreenKeyboardPress.bind(this));
        // Maybe right-clicking the onscreen keyboard could keep the key pressed, for chords?
        // el.addEventListener('chord', (e) => { ??? });
    }

    unregisterOnScreenKeyboard(el) {
        el.removeEventListener('press', this.onScreenKeyboardPress);
    }

    registerMidiKeyboard(midiInput) {
        midiInput.addEventListener('press', (e) => { this.notifyPressedKey(Note.fromPianoKey(e.detail.key)); });
        // can ignore midi status, since the MidiInput takes care of that.
    }

    notifyPressedKey(note) {
        this.dispatchEvent(new CustomEvent("pressed-key", { detail: {note: note} }));

        // TODO: add note to this.pressedKeys, remove on "up", attach that to the event
        this.dispatchEvent(new CustomEvent("played-chord", { detail: {chord: [note]} }));
    }
}
