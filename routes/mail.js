// mail.js
// Handle sending emails

var nodemailer = require("nodemailer");

exports.test_mail = function(req, res) {
	var smtpTransport = nodemailer.createTransport("SMTP", {
		service: "Gmail",
		auth: {
			user: "authumlab@gmail.com",
			pass: "tqufkeinpstgfatv"
		}
	});

	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: "Tom Bobberson<foo@blurdybloop.com>", // sender address
	    to: "mason.delrosario@students.olin.edu", // list of receivers
	    subject: "Hello", // Subject line
	    text: "Hello world", // plaintext body
	    html: "<b>I farted.</b>" // html body
	}

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, response){
	    if(error){
	        console.log(error);
	    }else{
	        console.log("Message sent: " + response.message);
	    }

	    // if you don't want to use this transport object anymore, uncomment following line
	    //smtpTransport.close(); // shut down the connection pool, no more messages
	});
}