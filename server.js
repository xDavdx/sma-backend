const express = require("express");
const cors = require("cors");
const connect = require("./connect"); // Povezava z MongoDB
const koncertRoutes = require("./routes/koncertRoutes");
const abonentRoutes = require("./routes/abonentRoutes"); // Uvozi abonentRoutes
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());




// Pravilne poti za API-je
app.use("/koncerti", koncertRoutes);
app.use("/abonent", abonentRoutes); // Dodaj pot za abonente

// API endpoint za testiranje
app.get("/", (req, res) => {
    res.send("✅ Backend deluje!");
});

// Povezovanje z MongoDB in zagon serverja
connect.connectToServer()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server teče na portu: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Napaka pri povezavi z MongoDB:", err);
        process.exit(1); // Ustavi server, če povezava ni uspela
    });
