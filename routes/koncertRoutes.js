const express = require("express");
const router = express.Router();
const { getDb } = require("../connect");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Konfiguracija Cloudinary
cloudinary.config({
    cloud_name: "di5ver2j4",
    api_key: "352126136644247",
    api_secret: "zo8mc2WWiMPOkIqEmz_7W73wnNU"
});

// Nastavitev Multer in CloudinaryStorage za več slik
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "koncerti", // Mapa v Cloudinary
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
});

const upload = multer({ storage });

// Pridobi vse koncerte
router.get("/", async (req, res) => {
    try {
        const db = getDb();
        if (!db) {
            return res.status(500).json({ message: "❌ Database ni na voljo" });
        }

        const koncerti = await db.collection("objave").find({}).toArray();  // Spremenjeno na 'objave'
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

        const koncert = await db.collection("objave").findOne({ _id: new ObjectId(koncertId) }); // Spremenjeno na 'objave'

        if (!koncert) {
            return res.status(404).json({ message: "❌ Koncert ni najden" });
        }

        res.json(koncert);
    } catch (err) {
        console.error("❌ Napaka pri pridobivanju koncerta:", err);
        res.status(500).json({ message: "Napaka strežnika" });
    }
});








// dodaj koncerte
router.post("/dodaj", upload.array('slike', 10), async (req, res) => {  // Omogočimo do 10 slik
    try {
        const { ime, podnaslov, datum, lokacija, vsebina, program, izvajalci, cikel } = req.body;

        if (!ime || !podnaslov || !datum || !lokacija || !vsebina || !program || !cikel) {
            return res.status(400).json({ message: "Vsi podatki so obvezni!" });
        }

        let izvajalciArray = JSON.parse(izvajalci);

        // Pretvori izvajalce v seznam objektov (ime, instrument)
        const programArray = JSON.parse(program);


        const db = getDb();
        if (!db) {
            return res.status(500).json({ message: "❌ Database ni na voljo" });
        }

        // Pridobimo URL-je naloženih slik in jih shranimo v array
        const slikeUrl = req.files.map(file => file.path);

        const noviKoncert = {
            ime,
            podnaslov,
            datum: new Date(datum),
            lokacija,
            vsebina,
            program: programArray,
            izvajalci: izvajalciArray, // Shrani izvajalce kot objekt z imenom in inštrumentom
            cikel,
            slike: slikeUrl, // Shrani array slik
        };

        await db.collection("objave").insertOne(noviKoncert);

        res.status(201).json({ message: "✅ Koncert uspešno dodan!" });
    } catch (err) {
        console.error("❌ Napaka pri dodajanju koncerta:", err);
        res.status(500).json({ message: "Napaka pri dodajanju koncerta!" });
    }
});











// Uredi koncert
router.put("/uredi/:id", upload.array('slike', 10), async (req, res) => {
    try {
        const db = getDb();
        const koncertId = req.params.id;

        if (!ObjectId.isValid(koncertId)) {
            return res.status(400).json({ message: "Neveljaven ID" });
        }

        const { ime, podnaslov, datum, lokacija, vsebina, program, izvajalci, cikel } = req.body;

        const slikeUrl = req.files.map(file => file.path);

        const updateFields = {
            ime,
            podnaslov,
            datum: new Date(datum),
            lokacija,
            vsebina,
            program: JSON.parse(program),
            izvajalci: JSON.parse(izvajalci),
            cikel,
        };

        // Če so naložene nove slike, jih dodamo
        if (slikeUrl.length > 0) {
            updateFields.slike = slikeUrl;
        }

        const result = await db.collection("objave").updateOne(
            { _id: new ObjectId(koncertId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Koncert ni najden" });
        }

        res.json({ message: "✅ Koncert uspešno posodobljen!" });
    } catch (err) {
        console.error("❌ Napaka pri urejanju koncerta:", err);
        res.status(500).json({ message: "Napaka pri urejanju koncerta" });
    }
});



router.delete("/:id", async (req, res) => {
    try {
        const db = getDb();
        const koncertId = req.params.id;

        if (!ObjectId.isValid(koncertId)) {
            return res.status(400).json({ message: "❌ Neveljaven ID" });
        }

        const result = await db.collection("objave").deleteOne({ _id: new ObjectId(koncertId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "❌ Koncert ni bil najden" });
        }

        res.json({ message: "✅ Koncert uspešno izbrisan!" });
    } catch (err) {
        console.error("❌ Napaka pri brisanju koncerta:", err);
        res.status(500).json({ message: "Napaka strežnika pri brisanju koncerta" });
    }
});










module.exports = router;
