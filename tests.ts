// tests go here; this will not be compiled when this package is used as a library
midi.playTone(400, 500);
for (let i = 0; i < 127; ++i)
    midi.playDrum(i)
let i = midi.channel(1);
i.setInstrument(MidiInstrument.Banjo);

let piano = midi.channel(0);
let trumpet = midi.channel(1);
piano.setInstrument(MidiInstrument.Trumpet);

serial.writeLine('B ' + Note.B + ' -> ' + midi.frequencyToKey(Note.B))
