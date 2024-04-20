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


app.get("/",(req, res) =>{
   const sqlInsert = "INSERT INTO produits(NomProd, PrixUnitaire, TauxTVA, Stock, `Quantité d'alerte`) VALUES ('Paracétamol',25,0.75,900,10);"
   /* db.query(sqlInsert,(err,result)=>{
        res.send("Hi I'm Lily548")

    });*/
});

app.post('/register',(req,res)=>{

    /*const userName = req.body.userName
    const pwd = req.body.pwd
    const nom = req.body.nom
    const prenom = req.body.prenom
    const numTel = req.body.numTel
    const add = req.body.add
    console.log(userName);*/
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

app.listen(3002,() =>{
    console.log("running on port 3002");
});
