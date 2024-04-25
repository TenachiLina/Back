const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')
const dbService = require('./dbService');

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
    const { IdProd, NomProd, PrixUnitaire, TauxTVA, Stock, Quantete,Descriptionn,DatePeremption } = req.body;

    db.query(
        'UPDATE produits SET NomProd = ?, PrixUnitaire = ?, TauxTVA = ?, Stock = ?, Quantete = ? WHERE IdProd = ?',
        [IdProd,NomProd, PrixUnitaire, TauxTVA, Stock, Quantete, Descriptionn,DatePeremption],
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


app.delete('/vendors/:id', (req, res) => {
    const { id } = req.params;
    const db = dbService.getd;

    const result = db.deleteRowById(id);

    result
        .then(data => response.json({success : data}))
        .catch(err => console.log(err));

});

app.post('/addProduct', (req, res) => {

    const { NomProd, PrixUnitaire, TauxTVA, Stock, Quantite,Descriptionn,DatePeremption } = req.body;
    const query = 'INSERT INTO produits (NomProd, PrixUnitaire, TauxTVA, Stock, Quantite,Descriptionn,DatePeremption) VALUES (?, ?, ?, ?, ?,?,?)';
    db.query(query, [NomProd, PrixUnitaire, TauxTVA, Stock, Quantite,Descriptionn,DatePeremption], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de l\'insertion du produit.');
            return;
        }
        res.status(201).send('Produit inséré avec succès.');
    });

});
app.get('/getProducts', (req, res) => {
    db.query('SELECT  NomProd, PrixUnitaire, TauxTVA, Stock, Quantite, Photo ,Descriptionn,DatePeremption FROM produits', (err, result) => {
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
