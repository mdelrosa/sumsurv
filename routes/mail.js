// mail.js
// Handle sending emails
var Models = require('../models/models')
    , Emaillist = Models.emaillist
    , Classroom = Models.classroom;

var nodemailer = require("nodemailer");

exports.test_mail = function(req, res) {
	  Classroom.find({name: req.query.name}).exec(function(err, classroom_db) {
		   if(err) {console.log('Unable to find responses'); return false}
		   else{
			var smtpTransport = nodemailer.createTransport("SMTP", {
				service: "Gmail",
				auth: {
					user: "authumlab@gmail.com",
					pass: "tqufkeinpstgfatv"
				}
			});

			// setup e-mail data with unicode symbols
			
			var datedata= new Date(); 
			var month = datedata.getMonth()+1; 
			var date = datedata.getDate(); 
			var year = datedata.getFullYear();
			var day = datedata.getDay();
			var lastday = date+7-day;
			var firstday = date-day;
			var firstmonth = datedata.getMonth()+1;
			var firstyear = datedata.getFullYear();
			var first = firstmonth.toString()+ "/" +firstday.toString()+ "/" +firstyear.toString();
			var last = month.toString()+ "/" +lastday.toString()+ "/" +year.toString();
			if (firstday < 1) {
				firstmonth = month - 1;
				if (firstmonth < 0) {
					firstyear = firstyear - 1;
					firstmonth == 11;
				};
				if (firstmonth == 0 || firstmonth == 2 || firstmonth == 4 || firstmonth == 6 || firstmonth == 7 || firstmonth == 9 || firstmonth == 11){
					firstday = 31 + firstday;
				}
				else if (firstmonth == 3 || firstmonth == 5 || firstmonth == 8 || firstmonth == 10) {
					firstday = 30 + firstday;
				}
				else if (firstmonth == 1) {
					firstday = 28 + firstday;
				};				
			};
			var mailOptions = {
			    from: "Tim Bibbersun<authumlab@gmail.com>", // sender address
			    to: classroom_db[0].roster.join(","), // list of receivers
			    subject: "SIMS weekly survey", // Subject line
			    text: "Hello world", // plaintext body
			    html:        
   			            '<div style="80%"><p><center><img src="http://i.imgur.com/6FO9p55.png" style="width:100%"/></center></p>' +
			    		'<p>Survey from ' +first+ " to " +last+ '.</p>' +
			    		'<p>You\'re getting this email because, in your infinite wisdom, you decided to participate in our study regarding motivation in your {{Stuff of History}} course. Good choice! We feel this will be a very interesting and useful study which may positively effect your very own class experience.</p>' + 
			    		'<p></p>' +
			    		'<p>Before we get started, we need to mention that each email link is unique, so you\'ll need to click the link sent explicitly to you in order to fill out the survey - each link only works once, so you can\'t forward the link to your friend.</p>' +
			    		'<p></p>' +
			    		'<p>For this first collection the survey will be available from now until 11:45pm Sunday night. Afterward the schedule for these weekly surveys may shift forward a bit, but any changes will be explained in subsequent emails. That\'s it! Here\'s the link:</center></p>' +
			    		'<p></p>' +
			    		'<p><center><a href="localhost:3000" target="survey page"><img src="http://i.imgur.com/MaVMQlI.png" /></a></center></p>' +
			    		'<p> </p>' +
			    		'<p>Happy surveying,</p>' +
			    		'<p>Autonomous Humans Lab</p>' +
			    		'<div style="background-color: #dcdcdc"><center><footer><p style="color: #999999">Footah Mason del Rosario Doyung Lee Alex Dillon Jon Stolk Potoo</p>' +
			    		'<p style="color: #999999">This will fill up space about home potoo yes please why that tut tut singaling yeh?</center></p></footer></center></div></div>'
			    		,//html body
			}
				// send mail with defined transport object
			smtpTransport.sendMail(mailOptions, function(error, response){
			    if(error){
			        console.log(error);
			    }else{
			        console.log("Message sent: " + response.message);
			        smtpTransport.close();
			        res.send("success");
			    }
				    // if you don't want to use this transport object anymore, uncomment following line
			        // shut down the connection pool, no more messages
			});	
		   };
	  });	
}