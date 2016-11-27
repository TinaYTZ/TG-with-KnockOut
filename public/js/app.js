/* jslint maxlen: 5000 */

/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */
/*global console:true, io:true, ko:true*/

'use strict';

var socket= io.connect();
var users=[];
var answerId;

function UserItem(name) {
    var self = this;
    self.name = name;
}

function LeadboardItem(record){
      var self = this; 
      self.item = record;
}

function HistoryItem(record) {
    var self = this;
    self.record = record;
}

var  viewmodel= {
    userName :ko.observable(''),
    answerQA:ko.observable(''),
    checkAnswer:ko.observable(''),
    question:ko.observable(''),
    historyList:ko.observableArray(),
    leadboardList:ko.observableArray([]),
    userList:ko.observableArray([]),
    userFormArea:ko.observable(false),

    historyArea:ko.observable(false),
    mainArea:ko.observable(true),
    checkAnswerArea:ko.observable(false),

    addUser: function() {
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
        viewmodel.historyList.removeAll();

        console.log('anserQA',this.answerQA());
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
        this.checkAnswerArea(false);
        this.historyArea(false);
        viewmodel.historyList.removeAll();


    }



    
};
viewmodel.userFormArea(true);
viewmodel.mainArea(false);

socket.on('Question', function(data){
  //$('#answerQA').removeAttr('disabled');
  //$('#submitAnswer').removeAttr('disabled');
  viewmodel.question(data.question);
  answerId=data.answerId;
  console.log('answerid',answerId);
  });

socket.on('get users', function(data){
    viewmodel.userList.removeAll();
    users=[];
   for (var i = 0; i < data.length; i++) {
    users.push(new UserItem(data[i]));
  }
    viewmodel.userList(users);
  
  });


socket.on('check-answer', function(data){
  var text='answer:'+data;
  viewmodel.checkAnswer(text);
  });



socket.on('score',function(data){
    var record=[];
    viewmodel.leadboardList.removeAll();
    for (var i = 0; i < data.length; i++) {
      var text=data[i].userId+':    '+data[i].correct;
     var item=new LeadboardItem(text);
     record.push(item);     
     }
     viewmodel.leadboardList(record);


});
 
  socket.on('history', function(data){
     console.log('history',JSON.stringify(data));  
     var item=new HistoryItem(JSON.stringify(data));  
     var array=viewmodel.historyList();
     array.push(item);
     viewmodel.historyList(array);
  });
// Activates knockout.js
ko.applyBindings(viewmodel);
