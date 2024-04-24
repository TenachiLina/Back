const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pharm',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.post('/commande', (req, res) => {
    const { produits_IdProd } = req.body;

    db.query(
        "INSERT INTO commande(produits_IdProd) VALUES (?)",
        [produits_IdProd],
        (err, result) => {
            if (err) {
                console.error("Error inserting data:", err);
                res.status(500).send("Error inserting data into database");
            } else {
                console.log("Data inserted successfully");
                res.status(200).send("Data inserted successfully");
            }
        }
    );
});

app.listen(3004, () => {
    console.log("Server running on port 3004");
});
