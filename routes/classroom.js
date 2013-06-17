// classroom.js

var Models = require('../models/models')
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
				surveys: [],
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
	console.log("here")
	Classroom.find({owner: req.user}).exec(function(err, class_db) {
		if(err) {console.log("All error: ", err); return false}
		else {
			res.render("_myClasses", {
				classes: class_db
			})
		}
	})
}

// Render roster partial
exports.roster = function(req, res) {
	Classroom.find({name: req.body.name, owner: req.user}).exec(function(err, found_class) {
		if(err) { console.log("Roster error: ", err); return false}
		else {
			res.render("_roster", {
				roster: found_class.roster
			})
		}
	})
}

// Render survey partial
exports.survey = function(req, res) {
	Classroom.find({name: req.body.name, owner: req.user}).exec(function(err, found_class) {
		if(err) { console.log("Survey error: ", err); return false}
		else {
			res.render("_classSurvey", {
				responses: found_class.responses
			})
		}
	})
}
