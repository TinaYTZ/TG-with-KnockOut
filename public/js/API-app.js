/* jslint maxlen: 500 */

/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */
/*global console:true */
var main = function () { 
	'use strict';
// this is actually just one string,
// but I spread it out over two lines
// to make it more readable
var userId;
var $dataArea=$('#dataArea');
$dataArea.show();
$('#QAArea').hide();
var answerId;
var text = '';
var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for( var i=0; i < 10; i++ )
      {  text += possible.charAt(Math.floor(Math.random() * possible.length));}
userId = text;



$.post('/user',{'userId': userId},function(response){console.log(response);});


$('#score').click(function(e){
	e.preventDefault();
	$('#QAArea').hide();
	$('#questionForm').hide();
	$('#scoreArea').show();

	$.getJSON('/score' ,  {'userId': userId}  ,function (Response) {
 	// simply print the response to the console 
  // for the time being console.log(flickrResponse);
 	console.log(userId);
 	var html=JSON.stringify(Response);
 	$('#scoreArea').html(html);
 	console.log('RESPONSE', Response);
    //should be stringify--> JSON.stringify(Response)
	}); 

});


$('#getQestion').click(function(e){
    e.preventDefault();
    
	$('#scoreArea').hide();
	$('#QAArea').show();
	$('#questionForm').hide();
	$.getJSON('/question', function (Response) {
 	// simply print the response to the console 
  // for the time being console.log(flickrResponse);
  //console.log('res'+res);
 	var html=Response.question;
 	answerId=Response.answerId;
 	$dataArea.html(html);
 	//console.log(Response);//should be stringify--> JSON.stringify(Response)
	}); 

});



$('#createQuestion').click(function(){
    $('#questionForm').show();
    $('#QAArea').hide();
    $('#scoreArea').hide();
});


$('#submitQuestion').click(function(e){
	e.preventDefault();
	console.log( $('#question').val());
   $.ajax({
            type: 'POST',
            url: '/question',
            timeout: 15000,
            data: JSON.stringify({"question": $('#question').val(),
                    "answer": $('#answer').val(),}),
            contentType: "application/json",
            success: function(data) {
            //     // Get result data
                 console.log('Result' + data);
            //     $(obj).text(data.function+data.value);
             },
            error: function (result) {
                 console.log('ajax error ' + result.status);
             }
        });
//     $.post('/question',
//     {
//         "question": $('#question').val(),
//         "answer": $('#answer').val(),
//     });
    $('#createQFb').html('Sucess');
    document.getElementById('question').value = '';
    document.getElementById('answer').value = '';
    $('#QAArea').hide();
    $('#scoreArea').hide();
});


$('#submitAnswer').click(function(e){
	e.preventDefault();
	$('#scoreArea').hide();
	console.log( $('#question').val());
	console.log($('#answerQA').val());
    // $.post('/answer',
    // {
    //     'answerId': answerId,
    //     'answer': $('#answerQA').val(),
    //     'userId': userId
    // });
    
   $.ajax({
            type: 'POST',
            url: '/answer',
            timeout: 15000,
            data: JSON.stringify({
                  "answerId": answerId,
                  "answer": $('#answerQA').val(),
                  "userId": userId}),
            contentType: "application/json",
            success: function(data) {
            //     // Get result data
                 console.log('Result' + data);
            //     $(obj).text(data.function+data.value);
             },
            error: function (result) {
                 console.log('ajax error ' + result.status);
             }
        });



    // $('#answerQA').text='Sucess'
    document.getElementById('answerQA').value = '';
    $.getJSON('/question', function (Response) {
 	// simply print the response to the console 
     // for the time being console.log(flickrResponse);
  	var res=JSON.stringify(Response);
  	console.log('res'+res);
 	var html=Response.question;
 	answerId=Response.answerId;
 	$dataArea.html(html);

 	console.log(Response);//should be stringify--> JSON.stringify(Response)
	}); 

    
});

};
   
    $(document).ready(main);