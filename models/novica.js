const mongoose = require("mongoose");

const NovicaSchema = new mongoose.Schema({
    ime: { type: String, required: true },
    datum: { type: Date, required: true },
    podnaslov: { type: String, required: true },
    vsebina: { type: String, required: true },
    slike: [{ type: String }]
});

module.exports = mongoose.model("Novica", NovicaSchema);
