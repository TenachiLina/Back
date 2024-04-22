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


app.listen(3002,() =>{
    console.log("running on port 3002");
});
