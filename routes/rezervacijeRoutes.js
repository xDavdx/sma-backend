const express = require("express");
const { getDb } = require("../connect");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config({ path: "./config.env" });


const formatirajDatum = (datum) => {
    const meseci = ["januar", "februar", "marec", "april", "maj", "junij", "julij", "avgust", "september", "oktober", "november", "december"];
    const date = new Date(datum);
    const ure = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${date.getDate()}. ${meseci[date.getMonth()]} ob ${ure}:${minute}`;
};



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
    const { ime, email, steviloVstopnic, koncertId, koncertIme, koncertDatum, koncertLokacija, vir, drugiVir } = req.body;

    if (!ime || !email || !steviloVstopnic || !koncertId || !koncertIme) {
        return res.status(400).json({ message: "Manjkajo podatki" });
    }

    const koncniVir = vir === "drugo" ? drugiVir : vir;

    try {
        const db = getDb();
        const novaRezervacija = {
            ime,
            email,
            steviloVstopnic: parseInt(steviloVstopnic),
            koncertId,
            koncertIme,
            koncertDatum,
            koncertLokacija,
            vir: koncniVir || "ni navedeno",
            casRezervacije: new Date(),
        };

        await db.collection("rezervacije").insertOne(novaRezervacija);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });


        const mailOptions = {
            from: `"Slovenski mladi abonma" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Potrditev rezervacije - ${koncertIme}`,
            html: `
                <p>Spoštovani ${ime},</p>
                <p>Uspešno ste rezervirali <strong>${steviloVstopnic}</strong> brezplačnih vstopnic za koncert: <strong>${koncertIme}</strong>.</p>
                <p><strong>Datum:</strong> ${formatirajDatum(koncertDatum)}<br>
                <strong>Lokacija:</strong> ${koncertLokacija}</p>
                <p>Hvala za vašo rezervacijo! Veselimo se vašega obiska.</p>
                <br>
                <p>Lep pozdrav,<br>Ekipa Slovenskega mladega abonmaja</p>
            `

        };

// Pošlji mail
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Napaka pri pošiljanju maila:", error);
                // Ni nujno, da vrneš napako uporabniku
            } else {
                console.log("E-mail poslan:", info.response);
            }
        });

        res.status(201).json({ message: "Rezervacija uspešno shranjena" });
    } catch (err) {
        console.error("Napaka pri shranjevanju rezervacije:", err);
        res.status(500).json({ message: "Napaka na strežniku" });
    }
});

module.exports = router;
