const express = require("express");
const router = express.Router();
const { getDb } = require("../connect");
const { ObjectId } = require("mongodb");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary config
cloudinary.config({
    cloud_name: "di5ver2j4",
    api_key: "352126136644247",
    api_secret: "zo8mc2WWiMPOkIqEmz_7W73wnNU"
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "novice",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    },
});
const upload = multer({ storage });

// GET vse novice
router.get("/", async (req, res) => {
    try {
        const db = getDb();
        const novice = await db.collection("novice").find({}).sort({ _id: -1 }).toArray();
        res.json(novice);
    } catch (err) {
        console.error("Napaka pri pridobivanju novic:", err);
        res.status(500).json({ message: "Napaka pri branju novic" });
    }
});

// GET ena novica
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const db = getDb();
        const novica = await db.collection("novice").findOne({ _id: new ObjectId(id) });
        if (!novica) return res.status(404).json({ message: "Novica ni najdena" });
        res.json(novica);
    } catch (err) {
        console.error("Napaka pri pridobivanju ene novice:", err);
        res.status(500).json({ message: "Napaka pri branju novice" });
    }
});

// POST dodaj novico
router.post("/dodaj", upload.array("slike", 10), async (req, res) => {
    try {
        const { ime, podnaslov, sekcije, datum } = req.body;
        const slikeUrl = req.files.map(file => file.path);
        const parsedSekcije = JSON.parse(sekcije);

        if (!ime || !podnaslov || !datum || !parsedSekcije.length) {
            return res.status(400).json({ message: "Manjkajoči podatki" });
        }

        const db = getDb();
        const novaNovica = {
            ime,
            podnaslov,
            datum: new Date(datum),
            sekcije: parsedSekcije.map(s => ({
                datum: new Date(s.datum),
                podpodnaslov: s.podpodnaslov || "",
                vsebina: s.vsebina
            })),
            slike: slikeUrl
        };

        await db.collection("novice").insertOne(novaNovica);
        res.status(201).json({ message: "✅ Novica uspešno dodana!" });
    } catch (err) {
        console.error("Napaka pri dodajanju novice:", err);
        res.status(500).json({ message: "Napaka pri dodajanju novice" });
    }
});

module.exports = router;
