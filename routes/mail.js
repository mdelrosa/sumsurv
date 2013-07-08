// mail.js
// Handle sending emails
var Models = require('../models/models')
    , Emaillist = Models.emaillist
    , Classroom = Models.classroom;

var nodemailer = require("nodemailer")
    , cronJob = require('cron').CronJob;

exports.test_mail = function(req, res) {
	  Classroom.find({name: req.query.name}).populate("owner").exec(function(err, classroom_db) {
		   if(err) {console.log('Unable to find responses'); return false}
		   else{
			var smtpTransport = nodemailer.createTransport("SMTP", {
				service: "Gmail",
				auth: {
					user: "authumlab@gmail.com",
					pass: "tqufkeinpstgfatv"
				}
			});
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
			var urllink = "survo.herokuapps.com/" + encodeURIComponent(classroom_db[0].owner.username).toString() + "/" + encodeURIComponent(classroom_db[0].name).toString() + "/take"
			console.log("urllinkr ", urllink);
			var mailOptions = {
			    from: "Autonomous Humans Lab<authumlab@gmail.com>", // sender address
			    to: classroom_db[0].roster.join(","), // list of receivers
			    subject: "Welcome to SIMS.", // Subject line
			    text: "Hello world", // plaintext body
			    html:        
   			            '<div style="80%"><p><center><img src="http://i.imgur.com/6FO9p55.png" style="width:100%"/></center></p>' +
			    		'<p>Survey from ' +first+ " to " +last+ '.</p>' +
			    		'<p>Hi there!</p>' +
			    		'<p>You\'re getting this email because, in your infinite wisdom, you decided to participate in our study regarding motivation during your summer research experience. Good choice! We feel this will be a very interesting and useful study which may positively affect your very own summer experience.</p>' + 
			    		'<p></p>' +
			    		'<p>These emails will be sent out on a weekly basis, probably on a Thursday. You will be able to access the motivation survey from Thursday to Sunday. The survey questions will be asking you about the week you are in currently.</p>' +
			    		'<p></p>' +
			    		'<p>You will need to make an account before you take these surveys. Please ensure that this account is linked to the email address you gave us (if it is not, you will not be able to participate).</p>' +
			    		'<p></p>' +
			    		'<p>You’ll be using a web-app called Survo. Keep in mind that this app is in super alpha stage and many things may break while you use it. We ask you to be patient with us and let us know ASAP if anything goes wrong. That being said, we are looking for feedback in both the usability and the robustness of this app, so your comments are sincerely appreciated.</p>' +
			    		'<p></p>' +
			    		'<p>That’s about it for now! Here\'s the link:</p>' +
			    		'<p></p>' +
			    		'<p><center><a href="'+urllink+'" target="survey page"><img src="http://i.imgur.com/MaVMQlI.png" /></a></center></p>' +
			    		'<p> </p>' +
			    		'<p>Happy surveying,</p>' +
			    		'<p>Autonomous Humans Lab</p>' +
			    		'<p>P.S. This is a no-reply email, so don’t reply to this! To contact us, email mason.delrosario@students.olin.edu or Doyung.lee@students.olin.edu. Thanks!</p>' +
			    		'<div style="background-color: #dcdcdc"><center><footer><p style="color: #999999">Mason del Rosario Doyung Lee Alex Dillon Jon Stolk</p>' +
			    		'<p style="color: #999999">Footer.</center></p></footer></center></div></div>'
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
			// setup e-mail data with unicode symbols
			new cronJob('00 00 15 * * 1-5', function() {
				surveymail();
			}, null, true, "America/New_York");

		   };
	  
	   var surveymail = function() {
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
			    		'<p>Hey everyone!</p>' + 
			    		'<p></p>' +
			    		'<p>It’s that time of week again (Thursday, hopefully). This survey is for the week of ' +first+ " to " +last+ '. Treat this survey as a reflection on your activities this week. If you’re interested in recording your responses (we hope you are), the survey will be up until Sunday night.</p>' + 
			    		'<p></p>' +
			    		'<p>Remember to email mason.delrosario@students.olin.edu or Doyung.lee@students.olin.edu if you have any issues or comments!</center></p>' +
			    		'<p></p>' +
			    		'<p>Here’s the link:</p>'+
			    		'<p><center><a href="'+urllink+'" target="survey page"><img src="http://i.imgur.com/MaVMQlI.png" /></a></center></p>' +
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
	   }

	  });	
}