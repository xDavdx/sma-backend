const express = require("express");
const router = express.Router();
const { getDb } = require("../connect");  // Povezava na bazo
const { ObjectId } = require("mongodb");

// Shrani novega abonenta
router.post("/dodaj", async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Ime in email sta obvezna!" });
        }

        const db = getDb(); // Pridobimo bazo
        if (!db) {
            return res.status(500).json({ message: "❌ Database ni na voljo" });
        }

        // Preveri, če uporabnik že obstaja
        const existingAbonent = await db.collection("abonent").findOne({ email });
        if (existingAbonent) {
            return res.status(400).json({ message: "Ta email že obstaja!" });
        }

        // Shrani novega abonenta
        const newAbonent = { name, email };
        await db.collection("abonent").insertOne(newAbonent);

        res.status(201).json({ message: "Uspešno ste se prijavili za obveščanje!" });
    } catch (err) {
        console.error("❌ Napaka pri shranjevanju abonenta:", err);
        res.status(500).json({ message: "Napaka strežnika" });
    }
});

// Preveri vse abonente (to je lahko uporabno za testiranje, da vidiš vse zapisane uporabnike)
router.get("/", async (req, res) => {
    try {
        const db = getDb();
        if (!db) {
            return res.status(500).json({ message: "❌ Database ni na voljo" });
        }

        const abonenti = await db.collection("abonent").find({}).toArray();
        console.log("📬 Pridobljeni abonenti:", abonenti); // Debugging log
        res.json(abonenti);
    } catch (err) {
        console.error("❌ Napaka pri pridobivanju abonentov:", err);
        res.status(500).json({ message: "Napaka strežnika" });
    }
});

module.exports = router;
