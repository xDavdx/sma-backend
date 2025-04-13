const express = require("express");
const { getDb } = require("../connect");
const router = express.Router();



// GET vse rezervacije
router.get("/", async (req, res) => {
    try {
        const db = getDb();
        const rezervacije = await db.collection("rezervacije").find({}).toArray();
        res.json(rezervacije);
    } catch (err) {
        console.error("Napaka pri pridobivanju rezervacij:", err);
        res.status(500).json({ message: "Napaka pri pridobivanju rezervacij" });
    }
});


// POST nova rezervacija
router.post("/", async (req, res) => {
    const { ime, email, steviloVstopnic, koncertId, koncertIme } = req.body;

    if (!ime || !email || !steviloVstopnic || !koncertId || !koncertIme) {
        return res.status(400).json({ message: "Manjkajo podatki" });
    }

    try {
        const db = getDb();
        const novaRezervacija = {
            ime,
            email,
            steviloVstopnic: parseInt(steviloVstopnic),
            koncertId,
            koncertIme,
            casRezervacije: new Date(),
        };

        await db.collection("rezervacije").insertOne(novaRezervacija);
        res.status(201).json({ message: "Rezervacija uspešno shranjena" });
    } catch (err) {
        console.error("Napaka pri shranjevanju rezervacije:", err);
        res.status(500).json({ message: "Napaka na strežniku" });
    }
});

module.exports = router;
