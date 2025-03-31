const express = require("express");
const router = express.Router();
const { getDb } = require("../connect");
const { ObjectId } = require("mongodb");

// Pridobi vse koncerte
router.get("/", async (req, res) => {
    try {
        const db = getDb();
        if (!db) {
            return res.status(500).json({ message: "❌ Database ni na voljo" });
        }

        const koncerti = await db.collection("objave").find({}).toArray();
        console.log("🎵 Pridobljeni koncerti:", koncerti); // Debugging log
        res.json(koncerti);
    } catch (err) {
        console.error("❌ Napaka pri pridobivanju koncertov:", err);
        res.status(500).json({ message: "Napaka strežnika" });
    }
});

// Pridobi en koncert po ID-ju
router.get("/:id", async (req, res) => {
    try {
        const db = getDb();
        if (!db) {
            return res.status(500).json({ message: "❌ Database ni na voljo" });
        }

        const koncertId = req.params.id;

        // Preveri, ali je ID veljaven ObjectId
        if (!ObjectId.isValid(koncertId)) {
            return res.status(400).json({ message: "❌ Neveljaven ID formata" });
        }

        const koncert = await db.collection("objave").findOne({ _id: new ObjectId(koncertId) });

        if (!koncert) {
            return res.status(404).json({ message: "❌ Koncert ni najden" });
        }

        res.json(koncert);
    } catch (err) {
        console.error("❌ Napaka pri pridobivanju koncerta:", err);
        res.status(500).json({ message: "Napaka strežnika" });
    }
});

module.exports = router;
