# MIDI [![Build Status](https://travis-ci.org/Microsoft/pxt-midi.svg?branch=master)](https://travis-ci.org/Microsoft/pxt-midi)

Emulates a MIDI output controller.

## Usage

### Setup

You will need to connect a MIDI via serial, radio or bluetooth get it to "talk" to the MIDI output device.

* for Bluetooth, use the [bluetooth midi package](https://pxt.microbit.org/pkg/microsoft/pxt-bluetooth-midi).

* for bridge applications like [Hairless MIDI](http://projectgus.github.io/hairless-midiserial/), call ``useRawSerial``

```block
midi.useRawSerial()
```

### Playing tones

Place a ``||midi play tone||`` block to play a single note (on channel **1**). 
The frequency is mapped to the nearest note.

```block
midi.playTone(Note.A, music.beat(BeatFraction.Whole))
```

### Tone on / off

Place a ``||midi tone on||`` block to start a tone (on channel **1**).
Place a ``||midi tone off||`` to turn it off.

```block
midi.toneOn(Note.A)
midi.toneOn(Note.B)
basic.pause(music.beat())
midi.toneOff(Note.A)
midi.toneOff(Note.B)
```

### Drums

Place a ``||midi play drum||`` block to play a drum sound. This blocks plays sounds on channel **10** which is reserved for drums.

```block
midi.playDrum(DrumSound.HandClap)
```

### Pitch bending

Place a ``||midi pitch bend||`` block to applying a sound bending effect to channel **1**.

```block
midi.pitchBend(8192 + input.acceleration(Dimension.X) * 8)
```

### Channels

You can access and manipulate individual channels using the ``||midi channel||`` block.
Channels are indexed from **1 to 16** and mapped internally to **0..15**.

```block
let piano = midi.channel(1);
```

#### play a note

```block
let piano = midi.channel(1);
piano.note(30, music.beat(BeatFraction.Whole));
```

#### play a note on / off

```block
let piano = midi.channel(1);
piano.noteOn(30);
basic.pause(100)
piano.noteOff(30)
```

### change instrument

```block
let trumpet = midi.channel(2);
trumpet.setInstrument(MidiInstrument.Trumpet);
```

#### change pitch bend

The pitch bend expects values between ``0..16383`` where ``8192`` means no bend.

```block
let piano = midi.channel(1);
piano.pitchBend(8192 + input.acceleration(Dimension.X) * 8)
```

## Radio serial

You can use radio to send MIDI messages from various @boardname@ and play them via  [Hairless MIDI](http://projectgus.github.io/hairless-midiserial/).

```typescript
radio.setGroup(10)
// routes all radio messages via radio
midi.setTransport(function (data: Buffer) {
    led.toggle(3, 4)
    radio.sendBuffer(data);
})

// proxies all radio buffers to serial
radio.onReceivedBuffer(function (buffer: Buffer) {
    serial.writeBuffer(buffer);
    led.toggle(4, 4);
})

// test send message
input.onButtonPressed(Button.A, function () {
    led.toggle(0, 0)
    midi.playTone(Note.C, 500)
})
```

## License

MIT

## Supported targets

* for PXT/microbit
* for PXT/calliope

(The metadata above is needed for package search.)

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
