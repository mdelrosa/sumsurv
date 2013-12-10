// classroom.js

var Models = require('../models/models')
	, User = Models.User
	, Response = Models.response
    , Survey = Models.survey
    , Page = Models.page
    , Emaillist = Models.emaillist
    , Classroom = Models.classroom;

var nodemailer = require("nodemailer")

// New class creation
exports.new_class = function(req, res) {
	var d = new Date()
		, month = d.getMonth()
		, year = d.getFullYear()
		, date = d.getDate();
	Classroom.find({owner: req.user, name: req.body.name}).exec(function(err, db_classrooms) {
		if (db_classrooms.length > 0) {
			res.send({success: false, message: "This class already exists!"});
		}
		else {
			var newClassroom = new Classroom({
				name: req.body.name,
				owner: req.user,
				roster: [],
				surveys: null,
				responses: [],
				interval: { start: 4, end: 7 },
				span: { start: { date: date, month: month, year: year} }
			});
			newClassroom.save(function(err) {
	            if(err) {
	            	console.log("Error: ", err)
	                console.log('Unable to save class');
	                res.send({success:false, message: "Unable to save your classroom. Please try again!"})
	            }
	            else {
		            console.log("Successfully saved new classroom!");
		            res.send({success:true});
	            }
			});	
		}
	});
}

// Class deletion
exports.delete = function(req, res) {
	Classroom.find({owner: req.user, name: req.body.name}).remove().exec(function(err) {
		if(err) {console.log("Delete error: ", err); return false}
		else {
			res.send({success: true});
		}
	})
}

// Render all classes partial
exports.all = function(req, res) {
	Classroom.find({owner: req.user}).exec(function(err, class_db) {
		if(err) {console.log("All error: ", err); return false}
		else {
			res.render("_myClasses", {
				classes: class_db
			})
		}
	})
}

// 
exports.roster_update = function(req, res) {
	var rAddRaw = req.body.rAdd
		, rAdd = [];
	for (i=0;i<rAddRaw.length;i++) {
		rAdd[i] = rAddRaw[i].toLowerCase();
	}
	if (rAdd.length) {
		Classroom.update({owner: req.user, name: req.body.name}, {$addToSet: {roster: {$each: rAdd}}}).populate('roster').exec(function(err) {
			if(err) { console.log("Error in update: ", err); return false}
			else {
		        console.log("Successfully updated roster!");
		        res.send({success:true});
			}
		});
	}
}

// Add one user to roster based on userID; from request
exports.roster_add = function(req, res) {
	User.find({ _id: req.body.userID }).exec(function(err, found_user) {
		console.log(found_user[0]);
		Classroom.update({ name: req.body.className, owner: req.user.id }, { $addToSet: { roster: found_user[0].email}, $pull: { requests: { type: "add", userID: req.body.userID}}}, function(err, num) {
			if(err) { console.log("Roster add classroom update error:", err); return false}
			else if(num===0) {console.log("Nothing updated"); return false}
			else {
				res.send({
					success:true,
					email: found_user[0].email
				});
			}
		})
	})
}

// Render roster partial
exports.roster = function(req, res) {
	Classroom.find({name: req.query.className, owner: req.user}).exec(function(err, found_class) {
		if(err) { console.log("Roster error: ", err); return false}
		else {
			console.log(found_class[0]);
			res.render("_roster", {
				roster: found_class[0].roster,
				requests: found_class[0].requests
			})
		}
	})
}

// Remove specified participant
exports.remove = function(req, res) {
	Classroom.update({ name: req.body.className }, { $pull: { roster: req.body.participant } }, function(err, newDb) {
		if(err || newDb === null) {console.log("Error in remove participant: ", err)}
		else {
			res.send({success: true});
		}			
	})
}

// Render class span selection popover
exports.view_span = function(req, res) {
	Classroom.find({owner: req.user._id, name: req.query.name}).exec(function(err, found_class) {
		if(err) { console.log("view_requests classroom error:", err); return false}
		else {
			if (found_class.span) {
				if (req.query.editing === "start") {
					var span = found_class[0].span.start
				}
				else if (req.query.editing === "end") {
					var span = found_class[0].span.end
				}
			}
			else {
				var span = null;
			}
			res.render('_span', {
				span: span
			});				
		}
	});		
}

// Edit class span
exports.edit_span = function(req, res) {
	// Initialize maildeck on updating the start day
	if (req.body.editing === "start") {
		Classroom.update({ owner: req.user.id, name: req.body.name }, { $set: { 'span.start':  req.body.n } }).exec(function(err, num) {
			if(err || !num) { console.log("edit_span error:", err); return false }
			else {
				Classroom.find({ owner: req.user.id, name: req.body.name }).exec(function(err, found_class) {
					if(err) { console.log("edit_span search error:", err); return false}
					else {
						res.send({success:true})
						// console.log('req.body.n',req.body.n);
						// var n = req.body.n
						// 	, intStart = found_class[0].interval.start
						// 	, date = new Date(n.year, n.month, n.date )
						// 	, intDay = (parseInt(intStart.day) === 7) ? 0 : parseInt(intStart.day)
						// 	, spanDay = date.getDay()
						// 	, addToDate = (spanDay <= intDay) ? intDay - spanDay : (7 - spanDay) + intDay;
						// date.setDate(date.getDate()+addToDate);
						// // change to 24 hour
						// var hourUp = (intStart.time === "PM") ? ((intStart.hour === '12') ? 12 : 12 + parseInt(intStart.hour)) : ((intStart.hour === '12') ? 0 : parseInt(intStart.hour));
						// // add four to time to standardize for EST, add one more for each time zone to the left
						// date.setUTCHours(hourUp+4);
						// date.setUTCMinutes(parseInt(intStart.minute));
						// // If we are initializing the span such that it begins before today, set maildeck for next week's int
						// while (new Date > date) {
						// 	date.setDate(date.getDate()+7);
						// }
						// Classroom.update({ owner: req.user.id, name: req.body.name }, { $set: { 'maildeck.regular': date } }, function(err, num) {
						// 	if (err || !num) { console.log("Classroom maildeck update err:", err); return false}
						// 	else {
						// 		res.send({success: true})
						// 	}
						// });
						var update = maildeck_update(req.user.id, req.body.name, found_class[0]);
						if (update) { return true };
					}
				})
			}
		})
	}
	else {
		Classroom.update({ owner: req.user.id, name: req.body.name }, { $set: { 'span.end': req.body.n } }).exec(function(err, num) {
			if(err || !num) { console.log("edit_span error:", err); return false }
			else {
				res.send({success:true})
				Classroom.find({ owner: req.user.id, name: req.body.name }).exec( function(err, found_class) {
					// // Initialize reminder time
					// var n = found_class[0].span.start
					// 	, intEnd = found_class[0].interval.end
					// 	, remindDate = new Date(n.year, n.month, n.date)
					// 	, intDay = (parseInt(intEnd.day)===7) ? 0 : parseInt(intEnd.day)
					// 	, spanDay = remindDate.getDay()
				 //    	, addToDate = (spanDay <= intDay) ? intDay - spanDay : (7 - spanDay) + intDay;
			  //   	console.log('remindDate first:', remindDate);
					// remindDate.setDate(remindDate.getDate() + addToDate);
					// console.log('remindDate second:', remindDate);
					// // Change to 24 hour
					// var hourUp = (intEnd.time === "PM") ? ((intEnd.hour === '12') ? 12 : 12 + parseInt(intEnd.hour)) : ((intEnd.hour === '12') ? 0 : parseInt(intEnd.hour));
					// // Add 4 hours to standardize for EST time
					// remindDate.setUTCHours(hourUp+4);
					// remindDate.setUTCMinutes(parseInt(intEnd.minute));
					// console.log('remindDate third:', remindDate);
					// // Subtract ten hours from reminderDate
					// remindDate.setUTCHours(remindDate.getUTCHours()-12);
					// console.log('remindDate fourth:', remindDate);
					// Classroom.update({ owner: req.user.id, name: req.body.name }, { $set: { 'maildeck.reminder': remindDate } }, function(err, num) {
					// 	if (err || !num) { console.log("Classroom maildeck update err:", err); return false }
					// 	else {
					// 		res.send({success: true});
					// 	}
					// })
					var update = maildeck_update(req.user.id, req.body.name, found_class[0]);
					if (update) { return true };
				})
			}
		})
	}
}

// Update maildeck of a classroom
var maildeck_update = function(owner, name, classroom) {
	var s = classroom.span.start
		, intStart = classroom.interval.start
		, dateRem = new Date(s.year, s.month, s.date)
		, dateReg = new Date(s.year, s.month, s.date)
		, intReg = classroom.interval.start
		, intRem = classroom.interval.end
		, spanDay = dateRem.getDay()
		, dayRem = (parseInt(intRem.day) === 7) ? 0 : parseInt(intRem.day)
		, dayReg = (parseInt(intReg.day) === 7) ? 0 : parseInt(intReg.day)
		, addReg = (spanDay <= dayReg) ? dayReg - spanDay : (7 - spanDay) + dayReg
		, addRem = (spanDay <= dayRem) ? dayRem - spanDay : (7 - spanDay) + dayRem
		, hourRem = (intRem.time === "PM") ? ((intRem.hour === '12') ? 12 : 12 + parseInt(intRem.hour)) : ((intRem.hour === '0') ? 0 : parseInt(intRem.hour))
		, hourReg = (intReg.time === "PM") ? ((intReg.hour === '12') ? 12 : 12 + parseInt(intReg.hour)) : ((intReg.hour === '0') ? 0 : parseInt(intReg.hour));
	console.log('dateReg0:',dateReg);
	console.log('dateRem0:',dateRem);
	dateRem.setDate(dateRem.getDate() + addRem);
	dateReg.setDate(dateReg.getDate() + addReg);
	console.log('dateReg1:',dateReg);	
	console.log('dateRem1:',dateRem);
	dateReg.setHours(hourReg);
	dateRem.setHours(hourRem);
	console.log('dateReg2:',dateReg);
	console.log('dateRem2:',dateRem);
	dateReg.setMinutes(parseInt(intReg.minute));
	dateRem.setMinutes(parseInt(intRem.minute));
	//Now could check to see if dateRem is short time from dateReg, set .reminder time commensurately
	dateRem.setHours(dateRem.getHours()-12);
	console.log('dateReg3:',dateReg);
	console.log('dateRem3:',dateRem);
	while ( new Date > dateReg ) {
		dateReg.setDate(dateReg.getDate()+7);
	}
	while ( new Date > dateRem ) {
		dateRem.setDate(dateRem.getDate()+7);
	}
	console.log('dateReg4:', dateReg);
	console.log('dateRem4:', dateRem);
	Classroom.update({ owner: owner, name: name }, { $set: { 'maildeck.reminder': dateRem, 'maildeck.regular': dateReg } }, function(err, num) {
		if (err || !num) { console.log("Classroom maildeck update err:", err); return false }
		else {
			return true;
		}
	});
}

// Get a class's requests
exports.view_requests = function(req, res) {
	Classroom.find({owner: req.user.id, name: req.query.name}).exec(function(err, class_db) {
		if(err) { console.log("view_requests classroom error:", err); return false}
		else {
			res.render('_requests', {
				requests: class_db[0].requests
			});
		}
	})
}

// Save a new request to be added to the class roster
exports.part_add = function(req, res) {
	var addUserReq = { username: req.user.username, userID: req.user.id, type: "add" };
	Classroom.update({ _id: req.body.classID }, { $push: { 'requests': addUserReq }}, function(err, newDb) {
		if(err || newDb === null) { console.log("Participant add error:", err); return false }
		else {
			console.log("newDb:", newDb);
			Classroom.find({ _id: req.body.classID}).populate('owner').exec(function(err, class_db) {
				if(err) {console.log("Email request error: ", err); return false}
				else {
					//send email here please.
					//class_db[0].owner.email
					var smtpTransport = nodemailer.createTransport("SMTP", {
						service: "Gmail",
						auth: {
							user: "authumlab@gmail.com",
							pass: "tqufkeinpstgfatv"
						}
					});

					var urllink = "survo.herokuapp.com/classes"
					var mailOptions = {
					    from: "Autonomous Humans Lab<authumlab@gmail.com>", // sender address
					    to: 'leedoyung@gmail.com', // list of receivers
					    subject: "You have a request from a Survo user!", // Subject line
					    text: "You Have a Request.", // plaintext body
					    html:        
		   			            '<div style="80%"><p><center><img src="http://i.imgur.com/6FO9p55.png" style="width:100%"/></center></p>' +
					    		'<p>Hi there!</p>' +
					    		'<p>You\'ve received a request from someone to join your class roster, '+class_db[0].name+'</p>' + 
					    		'<p></p>' +
					    		'<p><bold><center><a href="'+urllink+'">Click here to go to your dashboard</a></center></bold></p>' +
					    		'<p> </p>' +
					    		'<p>Best,</p>' +
					    		'<p>Autonomous Humans Lab</p>' +
					    		'<p>P.S. This is a no-reply email, so don’t reply to this! To contact us, email mason.delrosario@students.olin.edu or Doyung.lee@students.olin.edu. Thanks!</p>' +
					    		'<div style="background-color: #dcdcdc"><center><footer><p style="color: #999999">Mason del Rosario Doyung Lee Alex Dillon Jon Stolk</p>' +
					    		'<p style="color: #999999">Footer.</center></p></footer></center></div></div>'
					    		//html body
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
					res.send({success: true});

				}
			})
			res.send({success: true});
		}
	})
}

// Render survey partial
exports.survey = function(req, res) {
	Classroom.find({name: req.query.className, owner: req.user._id}).populate('survey').exec(function(err, found_class) {
		if(err) { console.log("Survey error: ", err); return false}
		else {
			Response.where('_id').in(found_class[0].responses).populate('participant').exec(function(err2, found_responses) {
				if(err2) { console.log("Survey responses error: ", err2); return false}
				var className = encodeURIComponent(req.query.className);
				res.render("_classSurvey", {
					survey: found_class[0].survey,
					responses: found_responses,
					className: className,
					interval: found_class[0].interval,
					span: found_class[0].span
				});
			});
		}
	});
}

// Handle updating interval of classroom
exports.interval = function(req, res) {
	console.log("req.body", req.body);
	if (req.body.start) {
		console.log("got start");
		Classroom.update({name: req.body.className, owner: req.user.id}, {$set: {'interval.start': req.body.start}}, {upsert: true}).exec(function(err) {
			if(err) { console.log("Interval error: ", err); return false }
			else {
				Classroom.find({name: req.body.className, owner: req.user.id}).exec(function(err, found_class) {
					if(err) {console.log('Interval error', err); return false}
					else {
						res.send({success:true})
						var update = maildeck_update(req.user.id, req.body.className, found_class[0]);
						if (update) { return true}
					}
				});
			}
		});
	}
	else if (req.body.end) {
		console.log("got end");
			Classroom.update({name: req.body.className, owner: req.user.id}, {$set: {'interval.end': req.body.end}}, {upsert: true}).exec(function(err) {
			if(err) { console.log("Interval error: ", err); return false }
			else {
				Classroom.find({name: req.body.className, owner: req.user.id}).exec(function(err, found_class) {
					if(err) {console.log('Interval error', err); return false}
					else {
						res.send({success:true})
						var update = maildeck_update(req.user.id, req.body.className, found_class[0]);
						if (update) { return true }
					}
				});
			}
		});	
	}
}

// Update class survey
exports.survey_update = function(req, res) {
	Survey.findOne({name: req.body.survey, creator: req.user}).exec(function(err, found_survey) {
		if(err) {console.log("Classroom survey search error: ", err); return false}
		else {
			Classroom.update({name: req.body.className, owner: req.user}, { survey: found_survey._id }).exec(function(err2) {
				if(err2) { console.log("Classroom survey update error: ", err2); return false}
				else {
					res.send({success:true})
				}
			})
		}
	});
}