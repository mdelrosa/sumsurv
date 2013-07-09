// classroom.js

var Models = require('../models/models')
	, User = Models.User
	, Response = Models.response
    , Survey = Models.survey
    , Page = Models.page
    , Emaillist = Models.emaillist
    , Classroom = Models.classroom;

// New class creation
exports.new_class = function(req, res) {
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
				interval: { start: 4, end: 7 }
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

// Render roster partial
exports.roster = function(req, res) {
	Classroom.find({name: req.query.className, owner: req.user}).exec(function(err, found_class) {
		if(err) { console.log("Roster error: ", err); return false}
		else {
			res.render("_roster", {
				roster: found_class[0].roster
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

// Render survey partial
exports.survey = function(req, res) {
	Classroom.find({name: req.query.className, owner: req.user.id}).populate('survey').exec(function(err, found_class) {
		if(err) { console.log("Survey error: ", err); return false}
		else {
			Response.where('_id').in(found_class[0].responses).populate('participant').exec(function(err2, found_responses) {
				if(err2) { console.log("Survey responses error: ", err2); return false}
				var className = encodeURIComponent(req.query.className);
				console.log(found_class[0].interval);
				res.render("_classSurvey", {
					survey: found_class[0].survey,
					responses: found_responses,
					className: className,
					interval: found_class[0].interval
				});
			});
		}
	});
}

exports.interval = function(req, res) {
	console.log("req.body", req.body);
	if (req.body.start) {
		console.log("got start");
		Classroom.update({name: req.body.className, owner: req.user.id}, {$set: {'interval.start': req.body.start}}, {upsert: true}).exec(function(err) {
			if(err) { console.log("Interval error: ", err); return false }
			else {
				res.send({success: true});
			}
		});
	}
	else if (req.body.end) {
		console.log("got end");
			Classroom.update({name: req.body.className, owner: req.user.id}, {$set: {'interval.end': req.body.end}}, {upsert: true}).exec(function(err) {
			if(err) { console.log("Interval error: ", err); return false }
			else {
				res.send({success: true});
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