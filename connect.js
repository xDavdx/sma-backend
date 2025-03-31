const { MongoClient, ServerApiVersion } = require('mongodb');

// Povezava do MongoDB URI
const ATLAS_URI = "mongodb+srv://sma-database:SMA_database1@sma-database.nbwxbvp.mongodb.net/koncertiPodatki?retryWrites=true&w=majority";


const client = new MongoClient(ATLAS_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let database;

// Funkcija za povezavo s strežnikom
module.exports = {
    connectToServer: async () => {
        try {
            await client.connect();
            database = client.db("koncertiPodatki");
            console.log("✅ Povezava z MongoDB uspešna!");
        } catch (err) {
            console.error("❌ Napaka pri povezavi z MongoDB:", err);
        }
    },
    getDb: () => {
        if (!database) {
            throw new Error("❌ Ni povezave z bazo podatkov!");
        }
        return database;
    }
};
