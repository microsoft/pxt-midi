enum MidiCommand {
    //% block="tune request"
    TuneRequest = 0xf6,
    //% block="timing clock"
    TimingClock = 0xf8,
    //% block="start"
    Start = 0xfa,
    //% block="continue"
    Continue = 0xfb,
    //% block="stop"
    Stop = 0xfc,
    //% block="active sensing"
    ActiveSensing = 0xfe,
    //% block="reset"
    Reset = 0xff
}

enum MidiChannelMode {
    //% block="all sound off"
    AllSoundOff = 120 << 8 | 0,
    //% block="reset all controllers"
    ResetAllControllers = 121 << 8 | 0,
    //% block="local control off"
    LocalControlOff = 122 << 8 | 0,
    //% block="local control on"
    LocalControlOn = 122 << 8 | 127,
    //% block="all notes off"
    AllNotesOff = 123 << 8 | 0,
    //% block="omni mode off"
    OmniModeOff = 124 << 8 | 0,
    //% block="omni mode on"
    OmniModeOn = 125 << 8 | 0,
    //% block="mono mode off"
    MonoModeOff = 126 << 8 | 0,
    //% block="mono mode on"
    MonoModeOn = 126 << 8 | 1,
    //% block="poly mode on"
    PolyModeOn = 127 << 8 | 0
}

/**
 * Blocks to simulate MIDI instruments.
 */
//% weight=85 icon="\uf001" color="#5ea9dd"
//% groups='["Play", "Constants", "Channels", "Transports"]'
namespace midi {
    /**
     * Transport needs to be set prior to using MIDI APIs
     */
    let transport: (data: Buffer) => void;

    /**
     * Sets the transport mechanism to send MIDI commands
     * @param newTransport current transport
     */
    //% advanced=true blockHidden=1
    export function setTransport(newTransport: (data: Buffer) => void) {
        transport = newTransport;
    }

    /**
     * Sends a MIDI message
     * @param data 1,2 or 3 numbers
     */
    //% advanced=true blockHidden=1
    export function sendMessage(data: number[]) {
        if (!transport) return;

        const buf = pins.createBuffer(data.length);
        for (let i = 0; i < data.length; ++i)
            buf.setNumber(NumberFormat.UInt8LE, i, data[i])
        control.__midiSend(buf); // simulator support
        transport(buf);
    }

    /**
    * Send raw MIDI messages via serial
    */
    //% blockId=midi_raw_serial_transport block="midi use raw serial"
    //% weight=2 blockGap=8
    //% group=Transports
    export function useRawSerial() {
        function send(data: Buffer): void {
            serial.writeBuffer(data)
        }
        setTransport(send)
    }

    /**
     * Send human readable MIDI messages via serial
     */
    //% blockId=midi_serial_transport block="midi use serial"
    //% weight=1 blockGap=8
    //% group=Transports
    export function useSerial() {
        function send(data: Buffer): void {
            // waiting for beta
            //const buf = pins.createBuffer(data.length);
            //for (let i = 0; i < data.length; ++i)
            //    buf[i] = data[i];
            // serial.writeBuffer(buf);
            serial.writeString("midi:")
            for (let i = 0; i < data.length; ++i) {
                if (i > 0) serial.writeString(",");
                serial.writeNumber(data[i]);
            }
            serial.writeLine("");
        }
        setTransport(send)
    }

    let channels: MidiController[];
    /**
     * Gets the MIDI controller for a given channel.
     * @param channel the selected channel, eg: 1
     */
    //% blockId="midi_channel" block="midi channel %channel"
    //% group="Channels" weight=90 channel.min=1 channel.max=16
    export function channel(channel: number): MidiController {
        channel -= 1;
        channel = Math.max(0, Math.min(15, channel));

        if (!channels) channels = [];
        let i = channels[channel];
        if (!i) i = channels[channel] = new MidiController(channel);

        return i;
    }

    /**
     * A Output MIDI controller, typically a keyboard.
     */
    //%
    export class MidiController {
        channel: number;
        velocity: number;

        constructor(channel: number) {
            this.channel = channel;
            this.velocity = 0x7f;
        }

        /**
         * Plays a note for the given duration and adds a small pause
         * @param key key to play between 0 and 127, eg: 69
         * @param duration duration of play
         */
        //% blockId=midi_note block="%this|note %key|duration %duration=device_beat"
        //% blockGap=8 weight=82
        //% group="Channels"
        note(key: number, duration: number): void {
            key = key >> 0;
            if (duration > 0) {
                this.noteOn(key);
                basic.pause(duration);
            }
            this.noteOff(key);
            basic.pause(6);
        }

        /**
         * Starts playing a note
         * @param key the note to play, eg: 69
         */
        //% blockId=midi_note_on block="%this|note on %key"
        //% key.min=0 key.max=127 velocity.min=0 velocity.max=127
        //% blockGap=8 weight=81
        //% group="Channels"
        noteOn(key: number, velocity = 0): void {
            key = key >> 0;
            if (key < 0 || key > 0x7f) return;

            sendMessage([0x90 | this.channel, key, velocity || this.velocity]);
        }

        /**
         * Stops playing a note
         * @param key the note to stop, eg: 69
         */
        //% blockId=midi_note_off block="%this|note off %key"
        //% key.min=0 key.max=127 velocity.min=0 velocity.max=127
        //% blockGap=8 weight=80
        //% group="Channels"
        noteOff(key: number, velocity = 0): void {
            key = key >> 0;
            if (key < 0 || key > 0x7f) return;

            sendMessage([0x80 | this.channel, key, velocity || this.velocity]);
        }

        /**
         * Sets the instrument on this channel
         * @param instrument the instrument to select
         */
        //% blockId=midi_set_instrument block="%this|set instrument %instrument=midi_instrument"
        //% instrument.min=0 instrument.max=16
        //% weight=70
        //% group="Channels"
        setInstrument(instrument: number): void {
            instrument = instrument >> 0;
            instrument -= 1;
            if (instrument < 0 || instrument > 0x7f) return;

            sendMessage([0xc0 | this.channel, instrument]);
        }

        /**
         * Sets the velocity
         * @param velocity velocity of the instrument
         */
        //% blockId=midi_set_velocity block="%this|set velocity %velocity"
        //% velocity.min=0 velocity.max=127
        //% blockGap=8 weight=79
        //% group="Channels"
        setVelocity(velocity: number): void {
            velocity = velocity >> 0;
            this.velocity = velocity & 0x7f;
        }

        /**
         * Sets the pitch on the channel
         * @param amount current bend, eg: 8192
         */
        //% blockGap=8 blockId=midi_set_pitch_bend block="%this|set pitch bend %amount"
        //% amount.min=0 amount.max=16383  weight=78
        //% group="Channels"
        pitchBend(amount: number) {
            amount = amount >> 0;
            amount = Math.max(0, amount & 0x3fff);
            sendMessage([0xe0 | this.channel, amount & 0x7f, (amount >> 7) & 0x7f]);
        }

        /**
         * Sends a MIDI command
         * @param cmd the command to send
         */
        //% blockId=midi_command block="%this|command $cmd=midi_command_id"
        //% blockGap=8
        //% group="Channels"
        command(cmd: number) {
            cmd = cmd >> 0;
            sendMessage([cmd | this.channel]);
        }

        /**
         * This message sent when the patch number changes.
         * @param program the new program value
         */
        //% blockId=midi_program_change block="%this|program change to %program"
        //% blockGap=8
        //% group="Channels"
        //% program.min=0 program.max=127
        programChange(program: number) {
            program = program >> 0;
            sendMessage([0xc0 | this.channel, program & 0x7f]);
        }

        /**
         * Channel Pressure (After-touch). This message is most often sent by pressing down on the key after it "bottoms out".
         * This message is different from polyphonic after-touch. Use this message to send the single greatest pressure value (of all the current depressed keys).
         * @param pressure the pressure value
         */
        //% blockId=midi_after_touch block="%this|after touch %pressure"
        //% blockGap=8
        //% group="Channels"
        //% pressure.min=0 pressure.max=127
        aftertouch(pressure: number) {
            pressure = pressure >> 0;
            sendMessage([0xd0 | this.channel, pressure & 0x7f]);
        }

        /**
         * Polyphonic Key Pressure (Aftertouch). This message is most often sent by pressing down on the key after it "bottoms out".
         * @param key the note to play
         * @param pressure the pressure
         */
        //% blockId=midi_polyphonic_after_touch block="%this|polyphonic after touch %key|%pressure"
        //% blockGap=8
        //% group="Channels"
        //% key.min=0 key.max=127
        //% pressure.min=0 pressure.max=127
        polyphonicAftertouch(key: number, pressure: number) {
            key = key >> 0;
            pressure = pressure >> 0;
            sendMessage([0xa0 | this.channel, key & 0x7f, pressure & 0x7f]);
        }

        /**
         * Control Change. This message is sent when a controller value changes. Controllers include devices such as pedals and levers.
         * Controller numbers 120-127 are reserved as "Channel Mode Messages".
         * @param controller the controller number
         * @param value the value
         */
        //% blockId=midi_control_change block="%this|control change %key|to %pressure"
        //% blockGap=8
        //% group="Channels"
        //% fn.min=0 fn.max=119
        //% value.min=0 value.max=127
        controlChange(fn: number, value: number) {
            fn = fn >> 0;
            value = value >> 0;
            sendMessage([0xb0 | this.channel, fn & 0x7f, value & 0x7f]);
        }

        /**
         * Channel mode control Change.
         * @param mode the channel mode change
         */
        //% blockId=midi_channel_mode block="%this|mode %mode"
        //% blockGap=8
        //% group="Channels"
        channelMode(mode: MidiChannelMode) {
            sendMessage([0xb0 | this.channel, (mode >> 8) & 0x7f, mode & 0x7f]);
        }
    }

    /**
     * Plays a tone on channel 0
     * @param frequency frequency of the note that will be mapped to a key
     * @param duration duration of the note
     */
    //% blockId=midi_play_tone block="midi play|tone %frequency=device_note|for %duration=device_beat" blockGap=8
    //% weight=91
    //% group="Play"
    export function playTone(frequency: number, duration: number): void {
        channel(1).note(frequencyToKey(frequency), duration);
    }

    /**
     * Turns on a note on channel 1
     * @param frequency frequency of the note that will be mapped to a key
     */
    //% blockId=midi_tone_on block="midi tone on %frequency=device_note" blockGap=8
    //% weight=70
    //% group="Play"
    export function toneOn(frequency: number): void {
        channel(1).noteOn(frequencyToKey(frequency));
    }

    /**
     * Turns off a note on channel 1
     * @param frequency frequency of the note that will be mapped to a key
     */
    //% blockId=midi_tone_off block="midi tone off %frequency=device_note"
    //% weight=70
    //% group="Play"
    export function toneOff(frequency: number): void {
        channel(1).noteOff(frequencyToKey(frequency));
    }

    /**
     * Applies a pitch bend effect to channel **1**.
     * @param bend the amount of bending to be applied on channel **1**, eg: 8192
     */
    //% blockId=midi_pitch_bend block="midi pitch bend %bend"
    //% bend.min=0 bend.max=16383
    //% group="Play"
    export function pitchBend(bend: number): void {
        channel(1).pitchBend(bend);
    }

    /**
     * Maps a frequency to a note key
     * @param frequency
     */
    //% blockId=midi_frequency_to_key block="key at %frequency=device_note" useEnumVal=1
    //% weight=4 blockGap=8
    //% group="Constants"
    export function frequencyToKey(frequency: number): number {
        frequency = frequency | 0;
        const log2 = 0.6931471805599453;
        return Math.max(0, 
            Math.min(127, 
            Math.round(Math.log(frequency/440.0) / log2 * 12 + 69))
        );
    }

    /**
     * Plays a drum sound on channel **10**
     * @param key index of the sound
     */
    //% blockId=midi_drum block="midi play drum %key=midi_drum_sound"
    //% weight=90
    //% group="Play"
    export function playDrum(key: number): void {
        channel(10).noteOn(key);
    }

    /**
     * Selects a drum sound
     * @param drumSound the type of sound
     */
    //% blockId=midi_drum_sound block="%sound"
    //% shim=TD_ID weight=5 blockGap=8
    //% group="Constants"
    export function drumSound(sound: DrumSound): number {
        return sound;
    }

    /**
     * Selects an instrument
     */
    //% blockId=midi_instrument block="$i"
    //% shim=TD_ID weight=4 blockGap=8
    //% group="Constants"
    export function instrument(i: MidiInstrument): number {
        return i;
    }

    /**
     * Selects a command
     */
    //% blockId=midi_command_id block="$c"
    //% shim=TD_ID weight=3 blockGap=8
    //% group="Constants"
    export function command(c: MidiCommand): number {
        return c;
    }
}
