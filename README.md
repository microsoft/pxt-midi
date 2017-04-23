# MIDI

A MIDI interface for @boardname@

## Usage

### Setup

You will need to connect a MIDI via serial, radio or bluetooth get it to "talk" to the MIDI output device.

* for Bluetooth, use the [bluetooth midi package](https://pxt.microbit.org/pkg/microsoft/pxt-bluetooth-midi).

### Playing notes

Place a ``||midi play tone||`` block to play a single note on channel **0**. 
The frequency is mapped to the nearest note.

```block
midi.playTone(Note.A, music.beat(BeatFraction.Whole))
```

### Drums

Place a ``||midi play drum||`` block to play a drum sound. This blocks plays sounds on channel **10** which is reserved for drums.

```block
midi.playDrum(DrumSound.HandClap)
```

### Pitch bending

Place a ``||midi pitch bend||`` block to applying a sound bending effect to channel 0.

```block
midi.pitchBend(pins.analogInput(AnalogPin.P0))
```

### Channels

You can access and manipulate individual channels using the ``||midi input channel||`` block.
Channels are indexed from **1 to 16** and mapped internally to 0..15.

```block
let piano = midi.inputChannel(1);
```

#### play a note

```block
let piano = midi.inputChannel(1);
piano.note(30, music.beat(BeatFraction.Whole));
```

#### play a note on / off

```block
let piano = midi.inputChannel(1);
piano.noteOn(30);
basic.pause(100)
piano.noteOff(30)
```

### change instrument

```block
let trumpet = midi.inputChannel(2);
trumpet.setInstrument(MidiInstrument.Trumpet);
```

#### change pitch bend

The pitch bend expects values between ``0..1023`` where ``512`` means no bend.
This is slightly different from MIDI standards but aligns better with sensor data from the micro:bit.

```block
let piano = midi.inputChannel(1);
piano.pitchBend(Math.abs(input.acceleration(Dimension.X)))
```
## License

MIT

## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)

```package
midi=github:microsoft/pxt-midi
```