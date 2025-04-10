const mongoose = require("mongoose");

const KoncertSchema = new mongoose.Schema({
    ime: { type: String, required: true },
    podnaslov: { type: String, required: true },
    datum: { type: Date, required: true },
    lokacija: { type: String, required: true },
    vsebina: { type: String, required: true },
    program: [{
        skladatelj: { type: String, required: true },
        naslov: { type: String, required: true },
        stavki: [{ type: String }]
    }],
    izvajalci: [{
        ime: { type: String, required: false }, // Ime izvajalca
        instrument: { type: String, required: false }, // Instrument izvajalca
    }], // ARRAY objektov, kjer vsak objekt vsebuje 'ime' in 'instrument'
    cikel: { type: String, enum: ["mlada klasika", "mlada kreativa", "abonma", "gostuje"], required: true },
});

module.exports = mongoose.model("Koncert", KoncertSchema);
