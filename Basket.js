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

// Route to fetch basket items
app.get("/basket", (req, res) => {
    const q = "SELECT commande.*, produits.*, commande.Quantité AS Quantity FROM commande JOIN produits ON commande.produits_IdProd = produits.IdProd";
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// Route to calculate total price
// Backend route for deleting items from the commande table
app.delete("/deleteItem/:productId", (req, res) => {
    const productId = req.params.productId;
    const q = "DELETE FROM commande WHERE produits_IdProd = ?";
    db.query(q, [productId], (err, result) => {
        if (err) {
            console.error('Error deleting item:', err);
            return res.status(500).json({ error: 'An error occurred while deleting item.' });
        }
        console.log('Item deleted successfully');
        return res.status(200).json({ message: 'Item deleted successfully' });
    });
});

// Route to clear basket items
app.delete("/delete", (req, res) => {
    const q = "DELETE FROM commande";
    db.query(q, (err, result) => {
        if (err) {
            console.error('Error deleting basket items:', err);
            return res.status(500).json({ error: 'An error occurred while clearing basket.' });
        }
        console.log('Basket cleared successfully');
        return res.status(200).json({ message: 'Basket cleared successfully' });
    });
});


app.post('/commande', (req, res) => {
    const { produits_IdProd, quantity } = req.body;

    db.query(
        "INSERT INTO commande(produits_IdProd, utilisateur_IdUtilisateur, Quantité) VALUES (?, 25, ?)",
        [produits_IdProd, quantity],
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
app.get("/totalPrice", (req, res) => {
    const q = "SELECT SUM(commande.Quantité * produits.PrixUnitaire) AS totalPrice FROM commande JOIN produits ON commande.produits_IdProd = produits.IdProd";
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data[0]);
    });
});

app.post('/confirmOrder', (req, res) => {
    const { NumCom, PrixTotal } = req.body;

    db.query(
        "INSERT INTO facture(NumCom, PrixTotal) VALUES (?, ?)",
        [NumCom, PrixTotal],
        (err, result) => {
            if (err) {
                console.error("Error inserting data into facture table:", err);
                res.status(500).send("Error confirming order");
            } else {
                console.log("Order confirmed successfully");
                res.status(200).send("Order confirmed successfully");
            }
        }
    );
});


// Start the server
app.listen(3004, () => {
    console.log("Server running on port 3004");
});
