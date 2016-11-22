// Server-side code
/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: single, undef: true, unused: true, strict: true, trailing: true */


'use strict';
var express=require('express'),
    app = express(),
    server= require('http').createServer(app);
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var redis = require('redis');
var client = redis.createClient();
var users=[];
var scoreList=[];
var connections=[];
var io=require('socket.io').listen(server);
var request = require('request');

client.on('connect', function() {
    console.log('connected');
});

server.listen(process.env.PORT || 4000);
console.log('server running PORT 4000...');
app.use(express.static('./'));

var question;
var questionid;

function getQuestion(){
  request.get(
    'http://localhost:3000/question',
    function (error, response, body) {
        if (!error ) {
           var obj = JSON.parse(body);
           console.log('obj', obj);
           question=obj.question;
           questionid=obj.answerId;
            console.log('question', obj.question);
            console.log('answerId', obj.answerId);


        }
    }
);
}
function postUser(user){
var option={ uri:'http://localhost:3000/user',
                     method:'POST',
                     json:{"userId":user} };
        request(option,function (error) {
          if (!error ) {
            }
        }); 
      }

getQuestion();

//client.hgetall('test', function(err, reply) {
    // reply is null when the key is missing
//    console.log('redis testing',reply);
//});

//io.sockets.emit('question', question);


io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('connected: %s sockets connected', connections.length);

    function updateUsernames(){
         io.sockets.emit('get users',users);
     }
    function updateQuestion(){
         io.sockets.emit('Question',{'question':question,'answerId':questionid});
     }
    

    function updateScore( userId, correct){
         scoreList.push({'userId':userId, 'correct':correct} );
         console.log(scoreList);
         io.sockets.emit('score',scoreList);
      }  

    function clearScore( ){
         scoreList=[];
         io.sockets.emit('score',scoreList);
      }  

    function getHistory(){
  
   for (var i = 0; i < users.length; i++) {
    var uid=users[i];
    var option={ uri:'http://localhost:3000/score',
                     method:'POST',
                     json:{"userId":uid} };
    request(option,function (error, response, body) {
          if (!error ) {
            console.log('body',body);
            io.sockets.emit('history', body);
            }
        }); 
  //    temp={'userId':users[i]};
  //    userJson.push(temp);

  }
}
     

    //discounnect
    socket.on('disconnect', function(){
        //if(! socket.username)return;
        users.splice(users.indexOf(socket.username),1);
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected: %s sockets',connections.length) ;

    });
   

    //new user
    socket.on('new user',function(data,callback){
        callback(true);
        //console.log('data', data);
        var username= data;
        console.log('new username', username);
        users.push(username);
        console.log('users',users);
        updateUsernames();
        updateQuestion();
        postUser(data);

    });
    socket.on('new-round',function(){
      clearScore();
        request.get(
        'http://localhost:3000/question',
          function (error, response, body) {
            if (!error ) {
           var obj = JSON.parse(body);
            console.log('obj', obj);
           question=obj.question;
           questionid=obj.answerId;
            console.log('question', obj.question);
            console.log('answerId', obj.answerId);
            updateQuestion();

          }
         }); 
      });
    


   socket.on('submit-answer',function(data){
        //console.log(data);
        console.log(data.answerId);
         var option={uri:'http://localhost:3000/answer',
                     method:'POST',
                     json:{   
                          "answerId": data.answerId,
                          "answer": data.answer,
                          "userId": data.userId
                          }
                     };
        request(option,function (error, response, body) {
          if (!error ) {
            console.log('body',body);
            console.log('body.correct', body.correct);
//            var obj = JSON.parse(body);
//            console.log('obj',obj);
            if(body.correct==='correct'){
              //broadcastwinner();
              //updateQuestion();        
            }
            updateScore(data.userId,body.correct);
            socket.emit('check-answer',body.correct);
            getHistory();
            //console.log(obj.question);
            }
        });
  });


});




app.get('/', function(req,res){
    res.sendFile(__dirname+'/public/index.html'); 

});

