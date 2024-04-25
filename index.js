const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')

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
app.get('/getUsers', (req, res) => {
    db.query('SELECT Nom, Prenom, Genre, NumTel, Addresse, UserName, Pwd FROM utilisateur', (err, result) => {
        if (err) {
            console.error("Error fetching users:", err);
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(result);
        }
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
    const { id, productName, unitPrice, vatRate, stock, alertQuantity } = req.body;

    db.query(
        'UPDATE produits SET productName = ?, unitPrice = ?, vatRate = ?, stock = ?, alertQuantity = ? WHERE id = ?',
        [productName, unitPrice, vatRate, stock, alertQuantity, id],
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
    const id = req.params.id;
    const query = 'DELETE FROM produits WHERE IdProd = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de la suppression du produit.');
            return;
        }
        res.status(200).send('Produit supprimé avec succès.');
    });
});

app.delete('/vendors/:id', (req, res) => {
    const { id } = req.params;

    // Delete vendor from the database
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

app.post('/addProduct', (req, res) => {

    const { NomProd, PrixUnitaire, TauxTVA, Stock, Quantite } = req.body;
    const query = 'INSERT INTO produits (NomProd, PrixUnitaire, TauxTVA, Stock, Quantite) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [NomProd, PrixUnitaire, TauxTVA, Stock, Quantite], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de l\'insertion du produit.');
            return;
        }
        res.status(201).send('Produit inséré avec succès.');
    });

});
app.get('/getProducts', (req, res) => {
    db.query('SELECT  NomProd, PrixUnitaire, TauxTVA, Stock, Quantite, Photo FROM produits', (err, result) => {
        if (err) {
            console.error("Error fetching users:", err);
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(result);
        }
    });
});
app.delete('/deleteVendor/:id', (req, res) => {
    const vendorId = req.params.id;

    // Supprimer le vendeur de la base de données
    db.query('DELETE FROM utilisateur WHERE IdUtilisateur = ?', [vendorId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de la suppression du vendeur');
        } else {
            console.log(`Vendeur supprimé avec l'ID ${vendorId}`);
            res.sendStatus(204);
        }
    });
});

app.listen(3002,() =>{
    console.log("running on port 3002");
});
