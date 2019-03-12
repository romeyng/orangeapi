var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mysql");
var app = express();
var router = express.Router();
const util = require('util');


var dbConfig = {
    host= "localhost",
    user= "camfuelapp",
    password= "password",
    database= "swiftpac_agents"
    
    
};
var jsonParser=bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({extended=false})
var connection = sql.createConnection(dbConfig);
// app.use(bodyParser.urlencoded({extended=true}));
// app.use(bodyParser.json());

const qry = util.promisify(connection.query).bind(connection);

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
    console.log("new customerrequest");
    console.log(req.body);
    name = req.body.customerName;
    company = req.body.company;
    accountType = req.body.accountType;
    email = req.body.accountType;
    
    q= insert into customers (customer_name, company_name, account_type, email) values (?,?,?,?);
    
    let values=[name,company,accountType,email];
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error= "+error)
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
    
    
    q= insert into fbo_locations (location_name, airport_code) values (?,?);
    
    let values=[name,airportCode];
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error= "+error)
            return res.send(error);
        } else {
            console.log('query success'+values)
            return res.send(results);
        }
     })
    });

app.post('/getcustomers', jsonParser, function(req,res){
    console.log(req.body.type);
    
    let values = Object.values(req.body);
    q=select customerID, customer_name, account_type from customers;
    console.log(values);
    if (req.body.type == "prepaid"){
    	q+= where account_type='prepaid' 

    }
    
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error= "+error);
            return res.send(error);
        } else {
            console.log('query success'+values);
            return res.send(results);
        }
    })
});

app.get('/getfuelrecon', jsonParser, function(req,res){
    console.log(req.body);
    //TODO= insert csutomer as well.
    let values = Object.values(req.body);
    console.log(values);
    q=SELECT fu.date_updated,ft.tail_no, fbo.airport_code, fu.fuelrequestID, fu.added, fu.uplifted, customers.customerID, customers.customer_name, customers.company_name FROM fuel_recon fu, customers, fuel_tickets ft,fbo_locations fbo where fu.fuelrequestID=ft.fuelrequestID and customers.customerID=ft.customerID and fbo.locationID=ft.locationID;
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error= "+error);
            return res.send(error);
        } else {
            console.log('query success'+values);
            return res.send(results);
        }
    })
});

app.get('/getlocations', jsonParser, function(req,res){
    console.log(req.body);
    //TODO= insert csutomer as well.
    let values = Object.values(req.body);
    console.log(values);
    q=select locationID, airport_code from fbo_locations;
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error= "+error);
            return res.send(error);
        } else {
            console.log('query success'+values);
            return res.send(results);
        }
    })
});

app.get('/getrates', jsonParser, function(req,res){
    console.log(req.body);
    //TODO= insert csutomer as well.
    let values = Object.values(req.body);
    console.log(values);
    q=SELECT * FROM rates,fbo_locations,fuel where rates.locationID=fbo_locations.locationID and rates.fuelID=fuel.fuelID;
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error= "+error);
            return res.send(error);
        } else {
            console.log('query success'+values);
            return res.send(results);
        }
    })
});

app.post('/addrate', jsonParser, function(req, res){
    console.log(req);
    baseRate= req.body.baseRate,
      markupType= req.body.markupType,
      fixed= req.body.fixed,
      pct= req.body.pct,
      tax= req.body.tax,
      multiplier= req.body.multiplier,
      unitDesc= req.body.unitDesc,
      rateDesc= req.body.rateDesc,
      rateName= req.body.rateName,
      customerID= req.body.customerID,
      locationID= req.body.locationID,
      fuelType= req.body.fuelType,

      let final = 0;
    if (markupType == "pct") {
      let markup =
        parseFloat(baseRate) * (parseFloat(pct) / 100);
      final = parseFloat(baseRate) + markup;
    } else {
      final = parseFloat(baseRate) + parseFloat(fixed);
    }
    final += parseFloat(tax);

    final= final.toFixed(2);
    console.log("final: "+ final);

    
    
    q= insert into rates (
base_rate,
markup_type,
fixed_rate,
pct_rate,
tax,
unit_multiplier,
unit_desc,
rate_desc,
rate_name,
locationID,
fuelID,
customerID,
final_rate) values (?,?,?,?,?,?,?,?,?,?,?,?,?);
    
    let values=[baseRate,markupType,fixed,pct,tax,multiplier,unitDesc,rateDesc,rateName,locationID,fuelType,customerID,final];
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error= "+error)
            return res.send(error);
        } else {
            console.log('query success'+values)
            return res.send(results);
        }
     })
    });



app.get('/genreconbalance', jsonParser, function(req,res){
    
    
    
    q=SELECT balance FROM balanceview;
    connection.query(q,function (error,results,fields) { 
        if (error){
            console.log("q fail error= "+error);
            return res.send(error);
        } else {
            console.log('query success');
            return res.send(results);
        }
    })
});
    
app.post('/createuplift', jsonParser,  async function(req, res){
	var createdTicket='0';
    console.log(req.body);
    fuelType=req.body.fuelType;
    fuelLocation=req.body.fuelLocation;
    userID= req.body.userID;
    customerID=req.body.customerID;
    tailNo= req.body.tailNo;
    arrival=req.body.dateCreated;
    required=req.body.dateComplete;
    origin=req.body.origin;
    destination=req.body.destination;
    mtow=req.body.mtow;
    requestQuantity= req.body.request;
    pilot = req.body.pilot;
    supervisor = req.body.supervisor;
    paymentMethod = req.body.paymentMethod;
    meterBefore = req.body.meterBefore;
    meterAfter = req.body.meterAfter;
    
    paystatus = req.body.paymentStatus

    let meter_diff= meterBefore-meterAfter;
    if (req.body.ticketStatus==true){
        var ticketStatus="done"
    } else{
        var ticketStatus="pending"
    }
    console.log("ticket status="+ticketStatus);
    
    q= insert into fuel_tickets (
         
	fuelID, 
	locationID, 
	userID, 
	customerID, 
	tail_no, 
	arrival_date, 
	required_on, 
	origin_airport, 
	destination_airport, 
	mtow, 
	quantity_requested, 
	
	pilot_name, 
	supervisor, 
	
	payment_method, 
	meter_before, 
	meter_after, 
	
	
	meter_diff, 
status) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
    
    let values=[fuelType,fuelLocation,userID,customerID,tailNo,arrival,required,origin,destination,mtow,requestQuantity,pilot,supervisor,paymentMethod,meterBefore,meterAfter,meter_diff,ticketStatus];
 reconQuery="insert into fuel_recon (fuelID,locationID,date_submitted, uplifted, fuelrequestID) VALUES (?,?,?,?,?)";
      
	

   
    	try {
    		console.log("runnig query"); 
     const ticketres=  await qry(q,values);
     createdTicket=ticketres.insertId;
     console.log("createdTicket"+createdTicket);
     
     
	}catch(err){
		console.log("error= "+err);
	}
	let reconVals = [fuelType, fuelLocation,required, meter_diff, createdTicket];
	console.log("createdTicket"+createdTicket);
    connection.query(reconQuery,reconVals,function (error,results,fields){
		    		if (error){
		            console.log("recon update query fail= "+reconVals+" error= "+error)
		            return res.send(error);
		        }else{
		        	console.log('RESULTS= '+results.insertId);
		        	return res.send(results);

		        }
		    	});

    
		    	



    });
app.post('/createsupply', jsonParser, function(req, res){
    console.log(req);
    date = req.body.dateReceived;
    supplier = req.body.supplier;
    quantity = req.body.quantity;
    fuelLocation = req.body.fuelLocation;
    fuelType= req.body.fuelType;
    customerID = req.body.customerID;
    supplyref= req.body.supplyref;

    
    
    q= insert into fuel_recon (fuelID, added, date_updated, locationID,customerID, supplyref, supplierID) values (?,?,?,?,?,?,?);
    
    let values=[fuelType, quantity,date, fuelLocation,customerID, supplyref, supplier];
    connection.query(q,values,function (error,results,fields) { 
        if (error){
            console.log("q fail"+values+" error= "+error)
            return res.send(error);
        } else {
            console.log('query success'+values)
            return res.send(results);
        }
     })
    });


