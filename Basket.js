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
    const q = "SELECT commande.*, produits.*, commande.Quantite AS Quantity FROM commande JOIN produits ON commande.produits_IdProd = produits.IdProd WHERE commande.Traitee = 1 AND commande.Envoyee = 0";
    db.query(q, (err, data) => {
        if (err) {
            console.error('Error fetching basket items:', err);
            return res.status(500).json({ error: 'An error occurred while fetching basket items.' });
        }
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
        "INSERT INTO commande(produits_IdProd, utilisateur_IdUtilisateur, Quantite, Date, Traitee, Envoyee) VALUES (?, 25, ?, NOW(), false, false)",
        [produits_IdProd, quantity],
        (err, result) => {
            if (err) {
                console.error("Error inserting data:", err);
                res.status(500).send("Error inserting data into database");
            } else {
                console.log("Data inserted successfully");

                // Update Traitee to 1 for the inserted item
                db.query(
                    "UPDATE commande SET Traitee = 1 WHERE produits_IdProd = ?",
                    [produits_IdProd],
                    (err, updateResult) => {
                        if (err) {
                            console.error("Error updating Traitee field:", err);
                            res.status(500).send("Error updating Traitee field");
                        } else {
                            console.log("Traitee field updated successfully");
                            res.status(200).send("Data inserted and Traitee field updated successfully");
                        }
                    }
                );
            }
        }
    );
});



app.get("/totalPrice", (req, res) => {
    const q = "SELECT SUM(commande.Quantite * produits.PrixUnitaire) AS totalPrice FROM commande JOIN produits ON commande.produits_IdProd = produits.IdProd WHERE commande.Traitee = 1 AND commande.Envoyee = 0";
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data[0]);
    });
});

app.post('/confirmOrder', (req, res) => {
    const { NumCom } = req.body;

    // Update the Envoyee field to 1 and Traitee field to 0 for the corresponding order
    db.query(
        "UPDATE commande SET Envoyee = 1, Traitee = 0 WHERE NumCom = ?",
        [NumCom],
        (err, result) => {
            if (err) {
                console.error("Error updating fields:", err);
                res.status(500).send("Error confirming order");
            } else {
                console.log("Envoyee field updated to 1 and Traitee field updated to 0 successfully");
                res.status(200).send("Order confirmed successfully");
            }
        }
    );
});
app.post('/ViewInvoices', (req, res) => {
    // Select items with Traitee = 0 and Envoyee = 1 and group them by NumCom to calculate the total price for each order
    const selectQuery = `
        SELECT NumCom, SUM(Quantite * PrixUnitaire) AS totalPrice 
        FROM commande 
        JOIN produits ON commande.produits_IdProd = produits.IdProd 
        WHERE Traitee = 0 AND Envoyee = 1 
        GROUP BY NumCom
    `;

    db.query(selectQuery, async (err, data) => {
        if (err) {
            console.error("Error selecting items for facture:", err);
            res.status(500).send("Error confirming order");
        } else {
            try {
                // Start a transaction
                await new Promise((resolve, reject) => {
                    db.beginTransaction(err => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Iterate over each NumCom and totalPrice and insert them into the facture table
                for (const item of data) {
                    const { NumCom, totalPrice } = item;
                    const insertQuery = "INSERT INTO facture(NumCom, PrixTotal) VALUES (?, ?)";
                    await new Promise((resolve, reject) => {
                        db.query(insertQuery, [NumCom, totalPrice], (err, result) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }

                // Commit the transaction
                await new Promise((resolve, reject) => {
                    db.commit(err => {
                        if (err) {
                            db.rollback(() => reject(err));
                        } else {
                            console.log("Transaction successfully committed");
                            resolve();
                        }
                    });
                });

                res.status(200).send("Orders confirmed and inserted into facture table successfully");
            } catch (error) {
                // Rollback the transaction in case of an error
                console.error("Error in transaction:", error);
                db.rollback(() => {
                    console.error("Transaction rolled back");
                    res.status(500).send("Error confirming order");
                });
            }
        }
    });
});



// Start the server
app.listen(3004, () => {
    console.log("Server running on port 3004");
});
