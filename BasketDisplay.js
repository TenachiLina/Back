const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');

app.use(express.json());
app.use(cors());
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'amanilakehal20056',
    database: 'pharm',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.get("/basket", (req, res) => {
    const q = "SELECT commande.*, produits.* FROM commande JOIN produits ON commande.produits_IdProd = produits.IdProd";
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.post("/basket", (req, res) => {
    const { NumCom, utilisateur_IdUtilisateur, produits_IdProd, Quantité, Date, Traitée, Envoyée } = req.body;
    const q = "INSERT INTO commande (NumCom, utilisateur_IdUtilisateur, produits_IdProd, Quantité, Date, Traitée, Envoyée) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [NumCom, utilisateur_IdUtilisateur, produits_IdProd, Quantité, Date, Traitée, Envoyée];

    db.query(q, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Error inserting data' });
        }
        console.log('Data inserted successfully');
        return res.status(200).json({ message: 'Data inserted successfully' });
    });
});
app.get("/totalPrice", (req, res) => {
    const q = "SELECT SUM(commande.Quantité * produits.PrixUnitaire) AS totalPrice FROM commande JOIN produits ON commande.produits_IdProd = produits.IdProd";
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data[0]); // Assuming the result is a single row with totalPrice
    });
});

app.listen(3005, () => {
    console.log("running on port 3005");
});
