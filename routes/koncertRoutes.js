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










// 🆕 Endpoint za dodajanje koncerta z več slikami
router.post("/dodaj", upload.array('slike', 10), async (req, res) => {  // Omogočimo do 10 slik
    try {
        const { ime, datum, lokacija, vsebina, program, izvajalci, cikel } = req.body;

        if (!ime || !datum || !lokacija || !vsebina || !program || !izvajalci || !cikel) {
            return res.status(400).json({ message: "Vsi podatki so obvezni!" });
        }

        // Pretvorimo izvajalce in program v array
        const izvajalciArray = izvajalci.split(",").map((izvajalec) => izvajalec.trim());
        const programArray = program.split(";").map((del) => del.trim());

        const db = getDb();
        if (!db) {
            return res.status(500).json({ message: "❌ Database ni na voljo" });
        }

        // 📸 Pridobimo URL-je naloženih slik in jih shranimo v array
        const slikeUrl = req.files.map(file => file.path);

        const noviKoncert = {
            ime,
            datum: new Date(datum),
            lokacija,
            vsebina,
            program: programArray,
            izvajalci: izvajalciArray,
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






module.exports = router;
