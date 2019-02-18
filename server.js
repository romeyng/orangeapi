var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mysql");
var app = express();
var router = express.Router();

var dbConfig = {
    host: "localhost",
    user: "camfuelapp",
    password: "password",
    database: "swiftpac_agents"
    
    
};

var connection = sql.createConnection(dbConfig);
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());



//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});


//Setting up server
var server = app.listen(process.env.PORT || 8080, function (){
    var port = server.address().port;
    console.log("App is running on port ", port);
});


app.get('/', (req,res)=>{
    q="select * from fuel_tickets";
    connection.query(q,function(error, results,fields){
        if (error){
            return res.send(error);
        } else {
            
            return res.send(results);
        }
    });
    
});

app.post('/administrative', function(req, res){
    name = req.body.customerName;
    fuelCompany = req.body.fuelCompany;
    accountType = req.body.accountType;
    q= "insert into customers (customer_name,fuel_company,account_type) values ?";
    values=[[name],[fuelCompany],[accountType]];
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            return res.send(error);
        } else {
            
            return res.send(results);
        }
     })
    
    
});



