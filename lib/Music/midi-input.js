export default class MidiInput extends EventTarget {

    static #midiInputSingleton;

    static getMidiInputSingleton() {
        if (!MidiInput.#midiInputSingleton) {
            MidiInput.#midiInputSingleton = new MidiInput();
            MidiInput.#midiInputSingleton.init();
        }
        return MidiInput.#midiInputSingleton;
    }

    #midiAccess = null;
    #midiDevices = [];

    async init() {
        this.loadStateFromStore();

        const midiAccess = await this.getMidiAccess();

        // automatically handle newly plugged or unplugged devices:
        midiAccess.onstatechange = this.scanMidi.bind(this);

        this.scanMidi();
    }

    async getMidiAccess() {
        if (!this.#midiAccess) {
            this.#midiAccess = await navigator.requestMIDIAccess();
        }
        return this.#midiAccess;
    }

    /**
     * Queries the browser's midi controller, returns the list of midi input devices currently connected
     */
    async getCurrentMidiInputs() {
        const midiAccess = await this.getMidiAccess();
        const connectedMidiInputs = {};
        if (midiAccess.inputs.size > 0) {
            const inputs = midiAccess.inputs.values();
            for (let input_it = inputs.next(); input_it && !input_it.done; input_it = inputs.next()) {
                const input = input_it.value;
                connectedMidiInputs[input.id] = {id: input.id, name: input.name, input: input};
            }
        }
        return connectedMidiInputs;
    }

    /**
     * Returns the list of midi input devices that are known, i.e. connected currently or previously
     *
     * This makes a copy, to avoid potential apocalypse if the calling code makes changes.
     */
    getKnownMidiInputs() {
        // return structuredClone(this.#midiDevices); // fails to copy the midi device objects stored in sublevels...
        const localMidiDevices = {};
        for (const deviceId in this.#midiDevices) {
            localMidiDevices[deviceId] = {
                id: this.#midiDevices[deviceId].id,
                name: this.#midiDevices[deviceId].name,
                input: this.#midiDevices[deviceId].input,
                useIfAvailable: this.#midiDevices[deviceId].useIfAvailable,
                status: this.#midiDevices[deviceId].status,
            };
        }
        return localMidiDevices;
    }

    /**
     * Refresh the list of known devices
     */
    async scanMidi() {
        let stateChanged = false;

        const localMidiDevices = this.getKnownMidiInputs();
        for (const deviceId in localMidiDevices) {
            localMidiDevices[deviceId].status = 'offline';
            // TODO maybe: localMidiDevices[deviceId].input = null; ???
        }

        const midiInputs = await this.getCurrentMidiInputs();
        for (const deviceId in midiInputs) {
            if (!localMidiDevices.hasOwnProperty(deviceId)) {
                // Why would we have midi devices if we're not using them? Enable by default, except for the useless system thing.
                const useIfAvailable = !midiInputs[deviceId].name.startsWith('Midi Through Port');
                localMidiDevices[deviceId] = {
                    id: deviceId,
                    name: midiInputs[deviceId].name,
                    useIfAvailable: useIfAvailable,
                };
                stateChanged = true; // detected new device
            }
            localMidiDevices[deviceId].input = midiInputs[deviceId].input; // might or might not have changed, if the device was disconnected and reconnected
            localMidiDevices[deviceId].status = 'online';
        }

        // update listeners
        // Note: localMidiDevices is guaranteed to contain everything from midiAccess.inputs (potentially newly connected)
        // and everything from this.#midiDevices (potentially newly disconnected).
        for (const deviceId in localMidiDevices) {
            const shouldBeUsed = (localMidiDevices[deviceId].useIfAvailable && localMidiDevices[deviceId].status == 'online');
            const isUsed = (this.#midiDevices.hasOwnProperty(deviceId) && this.#midiDevices[deviceId].useIfAvailable && this.#midiDevices[deviceId].status == 'online');

            // listening to newly connected devices
            if (shouldBeUsed && !isUsed) {
                console.info('Detected new device: ' + localMidiDevices[deviceId].name);
                this.startListening(localMidiDevices[deviceId].input);
                stateChanged = true; // detected connected device
            }

            // UNlistening to devices that are no longer connected
            if (!shouldBeUsed && isUsed) {
                console.info('Detected disconnected device: ' + localMidiDevices[deviceId].name);
                this.stopListening(localMidiDevices[deviceId].input);
                stateChanged = true; // detected disconnected device
            }
        }

        if (stateChanged) {
            this.#midiDevices = localMidiDevices; // update internal state
            this.saveStateToStore(); // store changed state for next runtime
            this.dispatchEvent(new CustomEvent('state-change')); // notify anyone who cares
        }

        return this.getKnownMidiInputs();
    }

    getDeviceStatus(midiId) {
        return this.#midiDevices[midiId];
    }

    markAsNotUsed(midiId) {
        const deviceInfo = this.#midiDevices[midiId];
        if (!deviceInfo.useIfAvailable) return;

        // make a note it is not used, e.g. for next runtime or next time it's plugged in
        deviceInfo.useIfAvailable = false;
        this.saveStateToStore();

        // stop using it, if it was registered
        if (deviceInfo.status == 'online') {
            this.stopListening(deviceInfo.input);
        }
    }

    markAsUsed(midiId) {
        const deviceInfo = this.#midiDevices[midiId];
        if (deviceInfo.useIfAvailable) return; // already marked as used

        deviceInfo.useIfAvailable = true;
        this.saveStateToStore();

        if (deviceInfo.status == 'online') {
            this.startListening(deviceInfo.input);
        }
    }

    startListening(midiDevice) {
        if (!midiDevice) { console.error('Error connecting midi device: param is null'); return; }
        midiDevice.onmidimessage = this.midiEventsHandler;
// TODO: I have had issues with new connections. Should I send sound to it, would that help establish the connection?
    }

    stopListening(midiDevice) {
        if (!midiDevice) { console.error('Error disconnecting midi device: param is null'); return; }
        midiDevice.onmidimessage = null;
    }

    // Should I add this to a window.addEventListener('beforeunload', () => {}), rather than call it on each modification and risk forgetting?
    // But then might it sometimes crash and fail to save?
    saveStateToStore() {
        const lsMidiDevices = {};
        for (const deviceId in this.#midiDevices) {
            lsMidiDevices[deviceId] = {
                name: this.#midiDevices[deviceId].name,
                useIfAvailable: this.#midiDevices[deviceId].useIfAvailable,
            };
        }
        localStorage.setItem('midiDevicesHistory', JSON.stringify(lsMidiDevices));
    }

    loadStateFromStore() {
        const storedMidiDevices = JSON.parse(localStorage.getItem('midiDevicesHistory'));
        const localMidiDevices = {};

        for (const deviceId in storedMidiDevices) {
            const lsDeviceInfo = storedMidiDevices[deviceId];
            localMidiDevices[deviceId] = {
                id: deviceId,
                name: lsDeviceInfo.name,
                input: null,
                useIfAvailable: lsDeviceInfo.useIfAvailable,
                status: 'offline',
            };
        }

        this.#midiDevices = localMidiDevices;
    }

    midiEventsHandler(e) {
        const [command, key, velocity] = event.data;
        /*
        let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
        for (const character of event.data) str += `0x${character.toString(16)} `;
        */

        if (command === Midi.command.KEYDOWN) {
            // TODO: handle chords: add to local list of "currently down" keys, remove on keyup - or handle in music-input?
console.log('dispatching "press" event');
            this.dispatchEvent(new CustomEvent('press', { detail: {key: key} }));
            // this.dispatchEvent(new CustomEvent('chord', { detail: {key: key} }));
        } else if (command === Midi.command.KEYUP) {
console.log('keyup: do nothing');
            // remove from local list of "currently down" keys
        }
    }




/**** old notes
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
        * /
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
*/

/*
Sources:
https://multiplayerpiano.com/ => https://multiplayerpiano.net/
https://medium.com/swinginc/playing-with-midi-in-javascript-b6999f2913c3
https://github.com/LapisHusky/mppclone/blob/main/client/script.js#L3558 => https://github.com/Hri7566/mppclone
*/
}
