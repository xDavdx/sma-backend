const mongoose = require("mongoose");

const KoncertSchema = new mongoose.Schema({
    ime: { type: String, required: true },
    datum: { type: Date, required: true },
    vsebina: { type: String, required: true },
    program: { type: [String], required: true }, // ARRAY programskih točk
    izvajalci: { type: [String], required: true }, // ARRAY izvajalcev
    cikel: { type: String, enum: ["mlada klasika", "mlada kreativa", "abonma", "gostuje"], required: true },
});

module.exports = mongoose.model("Koncert", KoncertSchema);
