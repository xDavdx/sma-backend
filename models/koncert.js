const mongoose = require("mongoose");

const KoncertSchema = new mongoose.Schema({
    ime: { type: String, required: true },
    datum: { type: Date, required: true },
    vsebina: { type: String, required: true },
    program: { type: String, required: true },
    cikel: { type: String, enum: ["mlada klasika", "mlada kreativa", "abonma", "gostuje"], required: true },
});

module.exports = mongoose.model("Koncert", KoncertSchema);
