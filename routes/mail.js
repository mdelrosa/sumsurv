// mail.js
// Handle sending emails
var Models = require('../models/models')
    , Emaillist = Models.emaillist;

var nodemailer = require("nodemailer");

exports.test_mail = function(req, res) {
	  Emaillist.find({}).exec(function(err, emaillist_db) {
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
			var day = datedata.getDay() + 1;
			if (datedata.getDay() == 0) {var day = 7} else {day = datedata.getDay()};
			var lastday = date-day;
			var firstday = date-day-6;
			var first = month.toString()+ "/" +firstday.toString()+ "/" +year.toString();
			var last = month.toString()+ "/" +lastday.toString()+ "/" +year.toString();

			var mailOptions = {
			    from: "Tim Bibbersun<foo@blurdybloop.com>", // sender address
			    to: emaillist_db[emaillist_db.length-1].emailarray.toString(), // list of receivers
			    subject: "Hello", // Subject line
			    text: "Hello world", // plaintext body
			    html:        
   			            '<div style="80%"><p><center><img src="http://i.imgur.com/6FO9p55.png" style="width:100%"/></center></p>' +
			    		'<p>Survey from ' +first+ " to " +last+ '.</p>' +
			    		'<p><center>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</center></p>' +
			    		'<p><center><a href="www.google.com" target="survey page"><img src="http://i.imgur.com/MaVMQlI.png" /></a></center></p>' +
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
			    }

			    // if you don't want to use this transport object anymore, uncomment following line
			    smtpTransport.close(); // shut down the connection pool, no more messages
			});
		   };
	  });	
}