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
				responses: []
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
	console.log("rAdd: ", req.body.rAdd)
	var rAdd = req.body.rAdd;
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
	Classroom.find({name: req.query.className, owner: req.user}).exec(function(err, found_class) {
		if(err) { console.log("Survey error: ", err); return false}
		Survey.find({id: found_class.survey}).exec(function(err2, found_survey) {
			if(err) { console.log("Survey error: ", err2); return false}
			else {
				console.log("found_survey",found_survey[0])
				res.render("_classSurvey", {
					survey: found_survey[0],
					responses: found_class.responses
				});
			}
		})
	})
}

// --NOTE: Populate isn't working quite properly here
// Update class survey
exports.survey_update = function(req, res) {
	console.log(req.body);
	Survey.findOne({name: req.body.survey, creator: req.user}).exec(function(err, found_survey) {
		if(err) {console.log("Classroom survey search error: ", err); return false}
		else {
			Classroom.update({name: req.body.className, owner: req.user}, { survey: found_survey._id }).exec(function(err2) {
				if(err2) { console.log("Classroom survey update error: ", err2); return false}
				else {
					Classroom.find({name: req.body.className, owner: req.user}).populate("survey").exec(function(err3, found_class) {
						if(err3) {console.log("Classroom survey populate error: ", err3); return false}
						else {
							res.send({success: true});
						}
					})
				}
			})
		}
	});
}