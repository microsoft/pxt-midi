// tests go here; this will not be compiled when this package is used as a library
midi.playNote(400, 500);
for (let i = 0; i < 127; ++i)
    midi.drum(i)
let i = midi.inputChannel(1);
i.setInstrument(MidiInstrument.Banjo);