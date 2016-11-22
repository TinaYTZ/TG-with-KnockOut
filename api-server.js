// Server-side code
/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: single, undef: true, unused: true, strict: true, trailing: true */


'use strict';
var express=require('express'),
    app = express(),
    server= require('http').createServer(app);
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var redis = require('redis');
var client = redis.createClient();

client.on('connect', function() {
    console.log('connected');
});




server.listen(process.env.PORT || 3000);
console.log('api server running PORT 3000...');
app.use(express.static('./'));

var fb;
var db;
var MongoClient = mongodb.MongoClient;
var id;
MongoClient.connect('mongodb://localhost:27017/exampleDb', function(err, database){
    		if(!err) {
       		 	console.log('We are connected');
       		 	db=database;
    		    db.collection('question').find({}).toArray(function (err, result) {
    	  			if (err) {
          				console.log(err);
     	 			} 
     	 			else if (result.length) {
       		 			id=result.length+1;
       		 			console.log(id);
     	 				} else {
        				console.log('No document(s) found with defined "find" criteria!');
     		 		}
  				});
    		}
    		else{console.log(err);} 

    	});


//client.hgetall('test', function(err, reply) {
    // reply is null when the key is missing
//    console.log('redis testing',reply);
//});



app.get('/', function(req,res){
    res.sendFile(__dirname+'/public/APIindex.html'); 

});

app.post('/user',function(req,res){
    var createU= req.body.userId; 
    client.hmset(createU, ['correct',0, 'wrong',0],redis.print);
    res.json({'result':'success'});

});

app.get('/question', function(req,res){
    //res.sendFile(__dirname+'/public/index.html');

    db.collection('question').find({}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {
      	//console.log(result);
        var randomID=Math.floor(Math.random() * result.length);
       	fb={ "question":result[randomID].question,
      		 "answerId":result[randomID].answerId};
        //console.log(result.length+'Found:', result[randomID]);
        console.log(result.length+'Found:', fb);
        res.json(fb);

      } else {
        console.log('No document(s) found with defined "find" criteria!');
      }
  });
});


app.post('/score', function(req,res){
    var t;
    var uid=req.body.userId;
    console.log('req.body.userId', req.body.userId);
    client.hget(uid, 'correct',function (err, obj) {
      console.dir(obj);
      t=obj;
      console.log('correct', t);
      var f;
      client.hget(uid,'wrong',function (err, obj) {
        console.dir(obj);
        f=obj;
        res.json({'userId':req.body.userId,'correct':t, 'wrong': f});
      });
    });
});


// app.post('/score', function(req,res){
//     var t;
//     console.log('req.body.userId', req.body.userId);
//     for (var i=0; i<req.body.userId.length;i++){
//       var records=[];
//       client.hget(req.body.userId[i], 'correct',function (err, obj) {
//        console.dir(obj);
//        t=obj;
//        console.log('correct', t);
//       });
//       var f;
//       client.hget(req.body.userId[i],'wrong',function (err, obj) {
//       console.dir(obj);
//       f=obj;
//       var string="t  "+t+"  f  "+f;
//       console.log('string'+string)
//       console.log("t",t,"f",f);
//       records.push("user"+req.body.userId[i]+"result"+string);
//       console.log("records"+ records);        
//       var str=records;
//       }); 
//     }
//    res.json({"history":str});

//     //res.json({'correct':t, 'wrong': f});
//     //res.json(re);
//     //console.log(re);
  

//   //  console.log("wrong", f);

//     //res.json({'correct':t, 'wrong': f});
// });


app.post('/question', function(req,res){
    //res.sendFile(__dirname+'/public/index.html'); 
    console.log("req"+ req)
    console.log(req.body.question);
     db.collection('question').insert({ 'question': req.body.question,
    					                  'answer': req.body.answer,
    					                 'answerId':id });
     id=id+1;
     res.json({"result":"success"});

});

app.post('/user', function(req){
    //res.sendFile(__dirname+'/public/index.html'); 
    console.log(req.body.userId);
    client.hmset(req.body.userId, ['correct', 0 , 'wrong', 0], redis.print);
//     res.json({'result':'success'});

});

app.post('/answer', function(req,res){
	var cf; 
  console.log(req);
	console.log('answerId',req.body.answerId );
	console.log('answer',req.body.answer );
	db.collection('question').find({'answerId': parseInt( req.body.answerId)}).toArray(function (err, result) {
  	console.log(result);
  	console.log('standard answer',result[0].answer);
  	console.log('ur answer',req.body.answer );
  	if (result[0].answer===req.body.answer)
      {
      	cf={'correct': true};
      	client.hincrby(req.body.userId, 'correct',1);
	   }
    else{
    	cf={'correct': false};
    	client.hincrby(req.body.userId, 'wrong',1);
    }
		console.log(cf);
		res.json(cf); 
  });
});


