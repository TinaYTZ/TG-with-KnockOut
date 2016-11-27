/* jslint maxlen: 500 */

/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */
/*global console:true */

  'use strict';
var socket= io.connect();

var $userForm=$('#userForm');
//var $username=$('#username'); 
var userId;
var $dataArea=$('#dataArea');

var users=[];



var answerId;
var text = '';
// var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
// for( var i=0; i < 10; i++ )
//       {  text += possible.charAt(Math.floor(Math.random() * possible.length));}
// userId = text;


socket.on('Question', function(data){
  //$('#answerQA').removeAttr('disabled');
  //$('#submitAnswer').removeAttr('disabled');
  var html=data.question;
  answerId=data.answerId;
  console.log('answerid',answerId);
  $dataArea.html(html);
  });

socket.on('get users', function(data){
    users=[];
   for (var i = 0; i < data.length; i++) {
    users.push(new userItem(data[i]));
  }
    viewmodel.userList(users);
  
  });


socket.on('check-answer', function(data){
  var text='answer:'+data;
  viewmodel.checkAnswer(text);
  });



socket.on('score',function(data){
    console.log("score"+JSON.stringify(data));
    var record=[];
    for (var i = 0; i < data.length; i++) {
     var text=data[i].userId+"    "+data[i].correct;
     var item=new leadboardItem(text);
     record.push(item);     
     }
     viewmodel.leadboardList(record);


});
 
  socket.on('history', function(data){
    console.log('history',JSON.stringify(data));  
     var item=new historyItem(JSON.stringify(data));  
     var array=viewmodel.historyList();
     array.push(item);
     viewmodel.historyList(array);
  });



function userItem(name) {
    var self = this;
    self.name = name;
}

function leadboardItem(record){
      var self = this; 
      self.item = record;
}

function historyItem(record) {
    var self = this;
    self.record = record;
}


// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
var  viewmodel= {
    userName :ko.observable(''),
    answerQA:ko.observable(''),
    checkAnswer:ko.observable(''),
    
    historyList:ko.observableArray(),
    leadboardList:ko.observableArray([]),
    userList:ko.observableArray([]),
    userFormArea:ko.observable(false),

    historyArea:ko.observable(false),
    mainArea:ko.observable(true),
    checkAnswerArea:ko.observable(false),

    addUser: function() {
            console.log("new user's Name", viewmodel.userName());
            socket.emit('new user', viewmodel.userName(),function(data){
            //data true or false
            if(data){
                viewmodel.userFormArea(false);
                viewmodel.mainArea(true);
            }else{
            }
          });
        },
    submitAnswer:function() {
        console.log("anserQA",this.answerQA());
        socket.emit('submit-answer',{
        'answerId': answerId,
        'answer': this.answerQA(),
        'userId': this.userName()
    });
        this.historyArea(true);
        this.checkAnswerArea(false);
    },
    getQestion:function(){
        socket.emit('new-round');
        this.answerQA('');
        this.checkAnswerArea(false)
        this.historyArea(false);

    }



    
};
viewmodel.userFormArea(true);
viewmodel.mainArea(false);

// Activates knockout.js
ko.applyBindings(viewmodel);

