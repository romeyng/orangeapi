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
var jsonParser=bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({extended:false})
var connection = sql.createConnection(dbConfig);
// app.use(bodyParser.urlencoded({extended:true}));
// app.use(bodyParser.json());



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

app.post('/createcustomer', jsonParser, function(req, res){
    console.log(req);
    name = req.body.customerName;
    company = req.body.company;
    accountType = req.body.accountType;
    email = req.body.accountType;
    
    q= `insert into customers (customer_name, company_name, account_type, email) values (?,?,?,?)`;
    
    let values=[name,company,accountType,email];
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error: "+error)
            return res.send(error);
        } else {
            console.log('query success'+values)
            return res.send(results);
        }
     })
    });

app.post('/createlocation', jsonParser, function(req, res){
    console.log(req);
    name = req.body.locationName;
    airportCode = req.body.airportCode;
    
    
    q= `insert into fbo_locations (location_name, airport_code) values (?,?)`;
    
    let values=[name,airportCode];
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error: "+error)
            return res.send(error);
        } else {
            console.log('query success'+values)
            return res.send(results);
        }
     })
    });

app.get('/getcustomers', jsonParser, function(req,res){
    console.log(req.body);
    //TODO: insert csutomer as well.
    let values = Object.values(req.body);
    console.log(values);
    q=`select customer_name from customers`;
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error: "+error);
            return res.send(error);
        } else {
            console.log('query success'+values);
            return res.send(results);
        }
    })
});

app.get('/getfuelrecon', jsonParser, function(req,res){
    console.log(req.body);
    //TODO: insert csutomer as well.
    let values = Object.values(req.body);
    console.log(values);
    q=`SELECT fu.date_updated,ft.tail_no, fbo.airport_code, fu.fuelrequestID, fu.added, fu.uplifted, customers.customerID, customers.customer_name, customers.company_name FROM fuel_recon fu, customers, fuel_tickets ft,fbo_locations fbo where fu.fuelrequestID=ft.fuelrequestID and customers.customerID=ft.customerID and fbo.locationID=ft.locationID`;
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error: "+error);
            return res.send(error);
        } else {
            console.log('query success'+values);
            return res.send(results);
        }
    })
});

    
    




