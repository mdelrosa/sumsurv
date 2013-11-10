// mail.js
// Handle sending emails
var Models = require('../models/models')
    , Emaillist = Models.emaillist
    , Classroom = Models.classroom
    , User = Models.User;

var nodemailer = require("nodemailer")
    , cronJob = require('cron').CronJob;

exports.list = function(req, res) {
	var date = new Date();
	console.log(date);
	res.send({success: true});
}

exports.test_mail = function(req, res) {
	  Classroom.find({name: req.query.name}).populate("owner responses").exec(function(err, classroom_db) {
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
			var urllink = "survo.herokuapp.com/" + encodeURIComponent(classroom_db[0].owner.username).toString() + "/" + encodeURIComponent(classroom_db[0].name).toString() + "/take"
			var mailOptions = {
			    from: "Autonomous Humans Lab<authumlab@gmail.com>", // sender address
			    bcc: classroom_db[0].roster.join(","), // list of receivers
			    subject: "Welcome to SIMS.2", // Subject line
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
			    		//html body
			}
				// send mail with defined transport object
			// smtpTransport.sendMail(mailOptions, function(error, response){
			//     if(error){
			//         console.log(error);
			//     }else{
			//         console.log("Message sent: " + response.message);
			//         smtpTransport.close();
			//         res.send("success");
			//     }
			// 	    // if you don't want to use this transport object anymore, uncomment following line
			//         // shut down the connection pool, no more messages
			// });	
			// setup e-mail data with unicode symbols
			var hour = parseInt(classroom_db[0].interval.start.hour);
			var day = parseInt(classroom_db[0].interval.start.day);
			hour = (classroom_db[0].interval.start.time === "AM") ? hour : hour+12;
			day = (day === 7) ? 0 : day;
			var spanEnd = {
				"date": parseInt(classroom_db[0].span.end.date),
				"month": parseInt(classroom_db[0].span.end.month),
				"year": parseInt(classroom_db[0].span.end.year)
			}
			var datedata = new Date()
				, date = datedata.getDate()
				, month = datedata.getMonth()
				, year = datedata.getFullYear();
			var cronTime = '00 '+classroom_db[0].interval.start.minute+" "+hour.toString()+" * * "+day.toString();
<<<<<<< HEAD
			console.log(cronTime);
			// var job = new cronJob(cronTime, function() {
			// //first * is which second, next is minute, next is the hour, ? ? and then day of the week.	
			// 	surveymail(classroom_db[0].roster, urllink);
			// }, null, true, "America/New_York");

			//var job2 = new cronJob(cronTime, function()) {
			//this job is to send emails to only the people who have not taken a survey for the week.
			//	remindmail(classroom_db[0].roster, classroom_db[0].responses);	
			//}
			console.log("classroom_db[0].roster", classroom_db[0].roster);
			console.log("classroom_db[0].responses", classroom_db[0].responses);
			User.find({email: {$in: classroom_db[0].roster}}).exec(function(err, user_db) {
				if(err)  {console.log('Unable to find users'); return false}
				else {
					var currentId = 0;
					var month = datedata.getMonth()+1; 
					var date = datedata.getDate(); 
					var year = datedata.getFullYear();
					var whatweeknow = whatweek(parseInt(found_class[0].span.start.date), parseInt(found_class[0].span.start.month), parseInt(found_class[0].span.start.year), date, month, year);
					for (i=0; i<user_db.length; i++) {
						currentId = user_db[i].id;
						for(j=0; j<classroom_db[0].responses.length; j++) {
							if(currentId === classroom_db[0].responses[j].id) {
								if(classroom_db[0].responses[j].responseweek < whatweeknow){
										
								}
							}
						}
					}
				}
			})
=======
			console.log("spanEnd:",spanEnd);
			console.log("today:", date, month, year);
			console.log("cronTime:",cronTime);
			var job = new cronJob(cronTime, function() {
			//first * is which second, next is minute, next is the hour, ? ? and then day of the week.	
				surveymail(classroom_db[0].roster, spanEnd, urllink, job);
			}, null, true, "America/New_York");
>>>>>>> ab8ba0a2e0bbad5ee60bdcb9eb241ec261ec769c
		   };

	  });	
}

var surveymail = function(roster, spanEnd, urllink) {
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
	var mailOptions = {
	    from: "Autonomous Humans Lab<authumlab@gmail.com>", // sender address
	    bcc: roster.join(","), // list of receivers
	    subject: "SIMS Weekly ", // Subject line
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
<<<<<<< HEAD
		// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, response){
	    if(error){
	        console.log(error);
	    }else{
	        console.log("Message sent: " + response.message);
	        smtpTransport.close();
	    }
		    // if you don't want to use this transport object anymore, uncomment following line
	        // shut down the connection pool, no more messages
	});	

	//checks what week the survey was taken (week1, week2, etc.)
	function whatweek(startDay, startMonth, startYear, endDay, endMonth, endYear) {
	    startMonth = startMonth;

	    var startYear = startYear;
	    var startMonth = startMonth;
	    var startDay = startDay;

	    endMonth = endMonth - 1;

	    var differenceYear = endYear-startYear;
	    var differenceMonth = endMonth - startMonth;
	    var daysInBetween = 0;
	    var monthHolder = 0;
	    var monthsUntilNewYear = 0;
	    var remainderDays = 0;
	    var weeks = 0;
	    var monthsTillNew = 0;
	     
	    var whatDate = function(number){
	        if(number === 0 || number === 2 || number === 4 || number === 6 || number === 7 || number === 9 || number === 11){
	           return 31;    
	        }
	        else if(number === 1) {
	            return 28;    
	        }
	        else if(number === 3 || number === 5 ||  number === 8 || number === 10){
	            return 30;  
	        }
	        else {
	            console.log("Something is wrong in the same year loop");
	        }
	    };  


	    if(differenceYear === 0){//YEAR IS THE SAME
	        if(differenceMonth === 0){//MONTH IS THE SAME
	            daysInBetween = endDay - startDay;
	        }
	        else{//IF MONTH IS DIFFERENT BUT YEAR IS THE SAME
	            for(i=1; i < differenceMonth; i++){
	                daysInBetween = whatDate(startMonth + i) + daysInBetween;
	            }
	            daysInBetween = whatDate(startMonth) - startDay + daysInBetween;
	            daysInBetween = daysInBetween + endDay;
	        }
	    }
	    else {//YEAR IS DIFFERENT
	        monthsTillNew = 11 - startM