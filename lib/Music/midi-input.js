export default class MidiInput {

    static #midiInputSingleton;

    static getMidiInputSingleton() {
        if (!MidiInput.#midiInputSingleton) {
            MidiInput.#midiInputSingleton = new MidiInput();
        }
        return MidiInput.#midiInputSingleton;
    }

    #midiAccess = null;

    async getMidiAccess() {
        if (!this.#midiAccess) {
            this.#midiAccess = await navigator.requestMIDIAccess();
        }
        return this.#midiAccess;
    }

    async getMidiInputs() {
        const midiAccess = await this.getMidiAccess();
        const allMidiInputs = {};
        if (midiAccess.inputs.size > 0) {
            const inputs = midiAccess.inputs.values();
            for (let input_it = inputs.next(); input_it && !input_it.done; input_it = inputs.next()) {
                const input = input_it.value;
                allMidiInputs[input.id] = {id: input.id, name: input.name, input: input};
            }
        }
        return allMidiInputs;
    }

    // TODO: keep a global list of all known midi input
    // registerAsKnownMidiInput() => add to the list if not yet there
    // allow user to mark inputs as enabled / disabled - even if they are no longer connected
    init() {
        let midiAccess = null;
        navigator.requestMIDIAccess().then((midiAccess) => {
            // window.midiAccess = midiAccess;
            // console.log("MIDI access ok, trying to link device");
            midiAccess.addEventListener("statechange", function (e) {
                if (e instanceof MIDIConnectionEvent) {
                    // initMidi(window.midiAccess);
                    initMidi(midiAccess);
                }
            });
            // initMidi(window.midiAccess);
            initMidi(midiAccess);
        }, () => { console.error(`Failed to get MIDI access - ${msg}`); });
    }
    initMidiInputs(midiAccess) {
        if (midiAccess.inputs.size > 0) {
          var inputs = midiAccess.inputs.values();
          for (var input_it = inputs.next(); input_it && !input_it.done; input_it = inputs.next()) {
            var input = input_it.value;
            // TODO: registerAsKnownMidiInput()
            // TODO: if (!registeredInputWasDisabledByUser()) {
            input.onmidimessage = MidiEventsHandler;
            if (input.enabled !== false) {
              input.enabled = true;
            }
            if (typeof input.volume === "undefined") {
              input.volume = 1.0;
            }
          }
        }
    }
    MidiEventsHandler(e) {
        const [command, key, velocity] = event.data;
        /*
        let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
        for (const character of event.data) {
            str += `0x${character.toString(16)} `;
        }
        */
        let direction = '???';
        if (command === Midi.command.KEYDOWN) {
            // TODO: handle new note
            // add to local list of "currently down" keys, to recognize chords
            // notify core code about the pressed key... and chords? or chords?
        } else if (command === Midi.command.KEYUP) {
            // remove from local list of "currently down" keys
        }

        // Note: all events from all midi inputs go through here, if there are multiple keyboards that might lead to conflicts.
        // Also events might be missed? Devices might be unplugged halfway through... Need a good way to clean up the states.
    }

    // TODO:
    // core code code should not need to register listeners all the time
    // this wrapper should get all the midi mess, then broadcast keys to the core code
    // so the core code can listen to one unique, reliable, centralized place
    //
    // actually other inputs should also be coming from the same centralized place - maybe a MusicInput wrapper, listening to this MidiInput wrapper?


/*
Sources:
https://multiplayerpiano.com/ => https://multiplayerpiano.net/
https://medium.com/swinginc/playing-with-midi-in-javascript-b6999f2913c3
https://github.com/LapisHusky/mppclone/blob/main/client/script.js#L3558 => https://github.com/Hri7566/mppclone
*/
}
