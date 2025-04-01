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





// Sprejmi podatke z slikami
router.post("/dodaj", upload.single("slika"), async (req, res) => {
    try {
        const { ime, datum, vsebina, program, cikel } = req.body;
        let slikaUrl = "";

        if (req.file) {
            slikaUrl = req.file.path;  // Shrani URL slike iz Cloudinary
        }

        // Preveri, če so vsi podatki na voljo
        if (!ime || !datum || !vsebina || !program || !cikel) {
            return res.status(400).json({ message: "Vsi podatki so obvezni!" });
        }

        const db = getDb();
        if (!db) {
            return res.status(500).json({ message: "❌ Database ni na voljo" });
        }

        // Ustvari nov objekt za koncert
        const noviKoncert = {
            ime,
            datum: new Date(datum),  // Poskrbi, da je datum v pravilnem formatu
            vsebina,
            program,
            cikel,
            slika: slikaUrl,  // Dodaj sliko URL, če je na voljo
        };

        // Shrani nov koncert v zbirko 'objave'
        await db.collection("objave").insertOne(noviKoncert);

        res.status(201).json({ message: "✅ Objavo (koncert) uspešno dodan!" });
    } catch (err) {
        console.error("❌ Napaka pri dodajanju koncerta:", err);
        res.status(500).json({ message: "Napaka pri dodajanju koncerta!" });
    }
});

module.exports = router;
