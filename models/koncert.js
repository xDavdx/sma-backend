const mongoose = require("mongoose");

const KoncertSchema = new mongoose.Schema({
    ime: { type: String, required: true },
    datum: { type: Date, required: true },
    vsebina: { type: String, required: true },
    slika: { type: String, required: false },
    cikel: { type: String, enum: ["mlada klasika", "mlada kreativa", "abonma", "gostuje"], required: true },
    barva: { type: String, required: true } // Barva kartice
});

module.exports = mongoose.model("Koncert", KoncertSchema);
