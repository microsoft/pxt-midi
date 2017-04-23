// tests go here; this will not be compiled when this package is used as a library
midi.playTone(400, 500);
for (let i = 0; i < 127; ++i)
    midi.playDrum(i)
let i = midi.inputChannel(1);
i.setInstrument(MidiInstrument.Banjo);

let piano = midi.inputChannel(0);
let trumpet = midi.inputChannel(1);
piano.setInstrument(MidiInstrument.Trumpet);
