const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')


app.use(express.json());
app.use(cors());
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'amanilakehal20056',
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
app.post('/modifyProduct', (req, res) => {
    const { Id, nomProd, prixUnitaire, tauxTVA, quantiteA, stock, description, datePeremption } = req.body;

    // Fonction pour formater la date au format MySQL
    const formatDateForMySQL = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
        return formattedDate;
    };
    //

    // Formater la date de péremption
    const formattedDatePeremption = formatDateForMySQL(datePeremption);

    db.query(
        'UPDATE pharm.produits SET NomProd = ?, PrixUnitaire = ?, TauxTVA = ?, QuantiteA = ?, Stock = ?, Description = ?, DatePeremption = ? WHERE IdProd = ?',
        [nomProd, prixUnitaire, tauxTVA, quantiteA, stock, description, formattedDatePeremption, Id],
        (err, result) => {
            if (err) {
                console.error("Erreur lors de la modification du produit:", err);
                res.status(500).send("Erreur interne du serveur");
            } else {
                console.log("Produit modifié avec succès");
                res.status(200).send("Produit modifié avec succès");
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

app.post('/updateStock', (req, res) => {
    const { IdProd, newStock , DatePeremption } = req.body;
    if (!IdProd || newStock === undefined) {
        return res.status(400).send('Product ID and new stock must be provided');
    }
    db.query(
        'UPDATE produits SET Stock = ?,DatePeremption = ? WHERE IdProd = ?',
        [newStock,DatePeremption, IdProd],
        (err, result) => {
            if (err) {
                console.error('Error updating stock:', err);
                return res.status(500).send('Failed to update stock');
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Product not found');
            }
            res.send('Stock updated successfully');
        }
    );
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
    const { Id, nomProd, prixUnitaire, tauxTVA, stock, quantiteA,description,datePeremption } = req.body;

    db.query(

        'UPDATE produits SET NomProd = ?, PrixUnitaire = ?, TauxTVA = ?, Stock = ?,QuantiteA = ? ,Description = ? , DatePeremption = ? WHERE IdProd = ?',
        [nomProd, prixUnitaire, tauxTVA, stock, quantiteA, description,datePeremption,Id],
        (err, result) => {
            console.log(" le modifié " +nomProd);

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




// Delete vendor from the database
//app.delete('/deleteVendor/:id', (req, res) => {
//   const vendorId = req.params.id;

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
         INNER JOIN facture f ON c.NumCom = f.NumCom
         WHERE c.Traitee = 0 AND c.Envoyee = 1`,
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


app.post('/validateCommande', (req, res) => {
    const { commandId } = req.body;

    if (!commandId) {
        return res.status(400).send('Command ID is required');
    }

    db.query(
        `UPDATE commande SET Traitee = 1 WHERE NumCom = ?`,
        [commandId],
        (err, result) => {
            if (err) {
                console.error('Error updating command:', err);
                res.status(500).send('Failed to validate command');
                return;
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('No command found with the given ID');
            }
            res.status(200).send('Command validated successfully');
        }
    );
});


app.get('/daily-revenue', (req, res) => {
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
    db.query('SELECT IdProd, NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteA,Description,DatePeremption FROM pharm.produits', (err, result) => {
        if (err) {
            console.error("Error fetching products:", err);
            res.status(500).send("Internal server error");
        } else {
            // Check if the result has at least one row
            if (result.length > 0) {
                // console.log("First product:", result[0]); // Log the first row
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

    const { NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteA,Description,DatePeremption } = req.body;
    const query = 'INSERT INTO produits (NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteA,Description,DatePeremption) VALUES (?, ?, ?, ?, ?,?,?)';

    db.query(query, [NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteA ,Description,DatePeremption], (err, result) => {

        if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de l\'insertion du produit.');
            return;
        }
        res.status(201).send('Produit inséré avec succès.');
    });

});

/////////supplier
app.get('/getsuppliers', (req, res) => {
    db.query('SELECT IdFour, Titre, Nom, Prenom, Adresse, NumTel  FROM fournisseur', (err, result) => {
        if (err) {
            console.error("Error fetching users:", err);
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(result);
        }
    });
});

app.post('/modifySupplier', (req, res) => {
    const {  IdFour,Titre, Nom, Prenom,  Adresse,NumTel } = req.body;
    db.query('UPDATE fournisseur SET Titre = ?, Nom = ?, Prenom = ?, Adresse = ?, NumTel = ? WHERE fournisseur.IdFour = ?',
        [ Titre, Nom, Prenom,  Adresse, NumTel ,IdFour],
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
app.post('/addsupplier', (req, res) => {

    const { Titre,Nom,Prenom, Adresse,NumTel  } = req.body;
    db.query("INSERT INTO fournisseur(Titre, Nom, Prenom, Adresse, NumTel) VALUES (?, ?, ?, ?, ?)",
        [Titre, Nom, Prenom,  Adresse,NumTel ],
        (err, result) => {
            if (err) {
                console.error("Error adding supplier:", err);
                res.send(err);
            } else {
                console.log("supplier added successfully");
                res.send("Fournisseur ajouté avec succès");
            }
        })
});
app.get('/checkSupplierExistence/:FournisseurId', (req, res) => {
    const FournisseurId = req.params.FournisseurId;
    db.query('SELECT COUNT(*) AS count FROM fournisseur WHERE IdFour = ?', [FournisseurId], (err, result) => {
        if (err) {
            console.error("Erreur lors de la vérification de l'existence du fournisseur :", err);
            res.status(500).json({ error: "Erreur interne du serveur" });
            return;
        }

        const count = result[0].count;
        // Si count est supérieur à 0, l'ID existe
        res.status(200).json({ exists: count > 0 });
    });
});
app.delete('/deleteFournisseur/:FournisseurId', (req, res) => {
    const FournisseurId = req.params.FournisseurId;

    // Delete the supplier from the database
    db.query('DELETE FROM fournisseur WHERE IdFour = ?', [FournisseurId], (err, result) => {
        if (err) {
            console.error("Error deleting supplier:", err);
            res.status(500).send("Internal server error");
        } else {
            console.log(`Supplier deleted with ID ${FournisseurId}`);
            res.sendStatus(204); // Sending 204 response indicating successful deletion
        }
    });
});
app.get('/getProducts', (req, res) => {
    db.query('SELECT  NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteA  ,Description,DatePeremption FROM produits', (err, result) => {
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
