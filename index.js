const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')
/*const dbService = require('./dbService');*/

app.use(express.json());
app.use(cors());
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pharm',

})
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});


app.post('/register',(req,res)=>{

    const { userName, pwd, nom, prenom, numTel, add, gender } = req.body;
    db.query("INSERT INTO utilisateur(Nom, Prenom,Genre,NumTel,Addresse, TypeUtilisateur, UserName, Pwd) VALUES (?,?,?,?,?,'Client',?,?)",
        [nom,prenom,gender,numTel,add,userName,pwd],
        (err, result) => {
            if (err) {
                console.error("Error inserting data:", err);
                res.send(err);
            } else {
                res.send("User registered");
            }
        } )
})


app.post('/addseller', (req, res) => {

    const { nom, prenom, genre, numTel, add, userName, pwd } = req.body;
    db.query("INSERT INTO utilisateur(Nom, Prenom, Genre, NumTel, Addresse, TypeUtilisateur, UserName, Pwd) VALUES (?, ?, ?, ?, ?, 'Vendeur', ?, ?)",
        [nom, prenom, genre, numTel, add, userName, pwd],
        (err, result) => {
            if (err) {
                console.error("Error adding seller:", err);
                res.send(err);
            } else {
                console.log("Seller added successfully");
                res.send("Vendeur ajouté avec succès");
            }
        })
});
app.post('/modifySeller', (req, res) => {
    const { id, nom, prenom, genre, numTel, addresse, userName, pwd } = req.body;
    db.query('UPDATE utilisateur SET Nom = ?, Prenom = ?, Genre = ?, NumTel = ?, Addresse = ?, UserName = ?, Pwd = ? WHERE IdUtilisateur = ?',
        [nom, prenom, genre, numTel, addresse, userName, pwd, id],
        (err, result) => {
            if (err) {
                console.error("Erreur lors de la modification du vendeur:", err);
                res.status(500).send("Erreur interne du serveur");
            } else {
                res.status(200).send("Vendeur modifié avec succès");
            }
        }
    );
});

app.get('/getUsers', (req, res) => {
    db.query('SELECT IdUtilisateur, Nom, Prenom, Genre, NumTel, Addresse, UserName, Pwd FROM utilisateur WHERE TypeUtilisateur = "Vendeur"', (err, result) => {
        if (err) {
            console.error("Erreur lors de la récupération des vendeurs:", err);
            res.status(500).send("Erreur interne du serveur");
        } else {
            res.status(200).json(result);
        }
    });
});

app.get('/checkVendorExistence/:id', (req, res) => {
    const vendorId = req.params.id;
    db.query('SELECT COUNT(*) AS count FROM utilisateur WHERE IdUtilisateur = ?', [vendorId], (err, result) => {
        if (err) {
            console.error("Erreur lors de la vérification de l'existence du vendeur :", err);
            res.status(500).json({ error: "Erreur interne du serveur" });
            return;
        }

        const count = result[0].count;
        // Si count est supérieur à 0, l'ID existe
        res.status(200).json({ exists: count > 0 });
    });
});

app.put('/updateVendeur/:id', (req, res) => {
    const userId = req.params.id;
    const { Nom, Prenom, Genre, NumTel, Addresse, UserName, Pwd } = req.body;

    if (!userId) {
        res.status(400).send("ID de l'utilisateur non fourni.");
        return;
    }

    const query = 'UPDATE utilisateur SET Nom=?, Prenom=?, Genre=?, NumTel=?, Addresse=?, UserName=?, Pwd=? WHERE IdUtilisateur=?';
    db.query(query, [Nom, Prenom, Genre, NumTel, Addresse, UserName, Pwd, userId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de la mise à jour du vendeur.');
            return;
        }
        res.status(200).send('Vendeur mis à jour avec succès.');
    });
});





app.post('/LogIn',(req,res)=>{


    const { userNameLogIn, pwdLogIn } = req.body;

    db.query(
        "SELECT * FROM utilisateur WHERE UserName = ? AND Pwd = ?",
        [userNameLogIn,pwdLogIn],
        (err, result) => {
            if (err) {
                console.error("Error :", err);
                res.send(err);
            } else {
                if(result.length > 0){
                    res.send(result);
                }else{
                    res.send("Wrong Username or Password!");
                }

            }
        } )


})

app.put('/update-product', (req, res) => {
    const { IdProd, NomProd, PrixUnitaire, TauxTVA, Stock, Quantete,Description,DatePeremption } = req.body;

    db.query(

        'UPDATE produits SET NomProd = ?, PrixUnitaire = ?, TauxTVA = ?, Stock = ?, QuantiteA = ? ,Description = ? , DatePeremption = ? WHERE IdProd = ?',
        [IdProd,NomProd, PrixUnitaire, TauxTVA, Stock, Quantete, Description,DatePeremption],
        (err, result) => {
            if (err) {
                console.error('Error updating product:', err);
                res.send(err);
            } else {
                res.send('Product updated successfully');

            }
        }
    );
});

app.put('/update-vendor', (req, res) => {
    const { id, carteIdentite, nom, prenom, genre, numTel, addresse, typeUtilisateur, userName, pwd } = req.body;

    db.query(
        'UPDATE utilisateur SET CarteIdentite = ?, Nom = ?, Prenom = ?, Genre = ?, NumTel = ?, Addresse = ?, TypeUtilisateur = ?, UserName = ?, Pwd = ? WHERE utilisateur.IdUtilisateur = ?\n',
        [carteIdentite, nom, prenom, genre, numTel, addresse, typeUtilisateur, userName, pwd, id],
        (err, result) => {
            if (err) {
                console.error('Error updating vendor:', err);
                res.send(err);
            } else {
                res.send('Vendor updated successfully');
            }
        }
    );
});
app.delete('/deleteProduct/:id', (req, res) => {
    const IdProd = req.params.id;
    if (!IdProd) {
        res.status(400).send('ID du produit non fourni.');
        return;
    }
    const query = 'DELETE FROM produits WHERE IdProd = ?';
    db.query(query, [IdProd], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de la suppression du produit.');
            return;
        }
        res.status(200).send('Produit supprimé avec succès.');
    });
});



/*    // Delete vendor from the database
    db.query('DELETE FROM utilisateur WHERE IdUtilisateur = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting vendor');
        } else {
            console.log(`Deleted vendor with ID ${id}`);
            res.sendStatus(204);
        }
    });
});

*/

app.get('/ReceptionCommandes', (req, res) => {
    db.query(
        `SELECT DISTINCT c.NumCom, c.Date, u.Nom, u.Prenom, f.PrixTotal
         FROM commande c
                  INNER JOIN utilisateur u ON c.utilisateur_IdUtilisateur = u.IdUtilisateur
                  INNER JOIN facture f ON c.NumCom = f.NumCom`,
        (err, result) => {
            if (err) {
                console.error('Error fetching commands:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json(result);
        }
    );
});








app.get('/details-commandes', (req, res) => {
    const date = req.query.date;
    db.query(
        `SELECT DISTINCT c.NumCom, c.Date, u.Nom, u.Prenom, f.PrixTotal
         FROM commande c
                  INNER JOIN utilisateur u ON c.utilisateur_IdUtilisateur = u.IdUtilisateur
                  INNER JOIN facture f ON c.NumCom = f.NumCom
         WHERE c.Date = ?`,
        [date],
        (err, result) => {
            if (err) {
                console.error('Error fetching daily commands:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json(result);
        }
    );
});

// Endpoint pour obtenir les détails des commandes pour une période donnée (recette hebdomadaire)
app.get('/weekly-revenue', (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    db.query(
        `SELECT DISTINCT c.NumCom, c.Date, u.Nom, u.Prenom, f.PrixTotal
         FROM commande c
                  INNER JOIN utilisateur u ON c.utilisateur_IdUtilisateur = u.IdUtilisateur
                  INNER JOIN facture f ON c.NumCom = f.NumCom
         WHERE c.Date BETWEEN ? AND ?`,
        [startDate, endDate],
        (err, result) => {
            if (err) {
                console.error('Error fetching weekly commands:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json(result);
        }
    );
});

// Endpoint pour obtenir les détails des commandes pour un mois donné (recette mensuelle)
app.get('/monthly-revenue', (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    db.query(
        `SELECT DISTINCT c.NumCom, c.Date, u.Nom, u.Prenom, f.PrixTotal
         FROM commande c
                  INNER JOIN utilisateur u ON c.utilisateur_IdUtilisateur = u.IdUtilisateur
                  INNER JOIN facture f ON c.NumCom = f.NumCom
         WHERE c.Date BETWEEN ? AND ?`,
        [startDate, endDate],
        (err, result) => {
            if (err) {
                console.error('Error fetching monthly commands:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(200).json(result);
        }
    );
});

app.get('/getProducts', (req, res) => {
    db.query('SELECT NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteA FROM pharm.produits', (err, result) => {
        if (err) {
            console.error("Error fetching products:", err);
            res.status(500).send("Internal server error");
        } else {
            // Check if the result has at least one row
            if (result.length > 0) {
                console.log("First product:", result[0]); // Log the first row
                res.status(200).json(result);
            } else {
                console.log("No products found.");
                res.status(404).send("No products found.");
            }
        }
    });
});

app.get('/getStock', (req, res) => {
    db.query('SELECT NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteA, Description, DatePeremption  FROM pharm.produits ORDER BY DatePeremption', (err, result) => {
        if (err) {
            console.error("Error fetching products:", err);
            res.status(500).send("Internal server error");
        } else {
            // Check if the result has at least one row
            if (result.length > 0) {
                console.log("First product:", result[0]); // Log the first row
                res.status(200).json(result);
            } else {
                console.log("No products found.");
                res.status(404).send("No products found.");
            }
        }
    });
});







app.post('/addProduct', (req, res) => {

    const { NomProd, PrixUnitaire, TauxTVA, Stock, Quantite,Description,DatePeremption } = req.body;
    const query = 'INSERT INTO produits (NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteA ,Description,DatePeremption) VALUES (?, ?, ?, ?, ?,?,?)';
    db.query(query, [NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteA ,Description,DatePeremption], (err, result) => {

      if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de l\'insertion du produit.');
            return;
        }
        res.status(201).send('Produit inséré avec succès.');
    });

});





app.get('/getProducts', (req, res) => {
    db.query('SELECT  NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteA , Photo ,Description,DatePeremption FROM produits', (err, result) => {
        if (err) {
            console.error("Error fetching users:", err);
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(result);
        }
    });
});

// Supprimer un vendeur de la base de données
app.delete('/deleteVendor/:IdUtilisateur', (req, res) => {
    const vendorId = req.params.IdUtilisateur;

    // Supprimer le vendeur de la base de données
    db.query('DELETE FROM utilisateur WHERE IdUtilisateur = ?', [vendorId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de la suppression du vendeur');
        } else {
            console.log(`Vendeur supprimé avec l'ID ${vendorId}`);
            res.sendStatus(204); // Réponse 204 indiquant que la suppression a réussi
        }
    });
});




app.listen(3002,() =>{
    console.log("running on port 3002");
});
