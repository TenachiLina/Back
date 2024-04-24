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


app.get("/produits",(req,res)=>{
    const q = "SELECT * FROM produits"
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.post("/produits", (req, res) => {
    const { IdProd, NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteDalerte, Photo } = req.body; // Assuming these are the fields you want to insert
    const q = "INSERT INTO produits (IdProd, NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteDalerte, Photo) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [IdProd, NomProd, PrixUnitaire, TauxTVA, Stock, QuantiteDalerte, Photo];

    db.query(q, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Error inserting data' });
        }
        console.log('Data inserted successfully');
        return res.status(200).json({ message: 'Data inserted successfully' });
    });
});


app.listen(3003,() =>{
    console.log("running on port 3003");
});
