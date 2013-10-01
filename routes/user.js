
/*
 * GET users listing.
 */

var baseHead = 'Survo'
	, Models = require('../models/models')
	, Survey = Models.survey
	, Classroom = Models.classroom
	, User = Models.User;

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.error = function(req, res){
	if(req.user) { var user = req.user.username }
	else { var user = null }
		res.render('error', {
			title: baseHead + ' | Oops',
			user: user
		});
}

exports.about = function(req, res) {
	if (req.user) { var user = req.user.username }
	else { var user = null }
	res.render('about', {
		title:  baseHead +' | About AHL',
		user: user
	});
}

exports.survey = function(req, res){
  if (req.user) { var user = req.user.username }
  else { var user = null }
  res.render('survey', {
        title: baseHead + ' | SIMS',
        user: user
  });
};

exports.create = function(req, res) {
	Survey.find({creator: req.user}).exec(function(err, user_surveys) {
        var survIDS = [];
        for (i=0;i<user_surveys.length;i++) {
            survIDS[i] = user_surveys[i].id;
        }
        Classroom.find({survey: {$in: survIDS}}).populate('survey').exec(function(err, classroom_db) {
            if(err) {console.log("All surveys classroom error: ", err); return false}
            else {
                console.log("classes: ", classroom_db);
                // finds number of occurrences of object with value
                var countArr = [];
                for (i=0;i<survIDS.length;i++) {
                    countArr[i] = 0;
                    for (j=0;j<classroom_db.length;j++) {
                    	console.log("1: ", classroom_db[j].survey.id, "type: ", typeof classroom_db[j].survey);
                    	console.log("2: ", survIDS[i], "type: ", typeof survIDS[i]);
                    	console.log(classroom_db[j].survey.id === survIDS[i]);
                        if (classroom_db[j].survey.id === survIDS[i]) {
                            countArr[i] = countArr[i] + 1;
                        }
                    }
                }
                console.log("countArr: ", countArr);
				res.render('create', {
					title: baseHead + ' | Create New Survey',
					user: req.user.username,
					surveys: user_surveys,
					countArr: countArr
				});
			}
		});
	});
}

exports.splash = function(req, res) {
	if (req.user) { var user = req.user.username }
	else { var user = null }
	res.render('splash', {
		title: baseHead + ' | About SIMS',
		user: user
	});
}

exports.exportcsv = function(req, res) {
	if (req.user) { var user = req.user.username }
	else { var user = null }
	res.render('exportcsv', {
		title: baseHead + ' | Export CSV',
		user: req.user.username
	});
}

exports.my_classes = function(req, res) {
	Classroom.find({owner: req.user}).exec(function(err, db_classrooms) {
		if (err) {console.log("Classroom my_classes error: ", err)}
		else {
			res.render('classes', {
				title: baseHead + " | My Classes",
				user: req.user.username,
				classes: db_classrooms
			});
		}
	});
}

exports.part = function(req, res) {
	Classroom.where("roster").in([req.user.email]).populate('owner').exec(function(err, found_class) {
		console.log('req.query.message:',req.query.message);
		if(err) {console.log("Participating static error: ", err); return false}
		else {
			res.render('participating', {
				title: baseHead + " | Participating",
				user: req.user.username,
				classes: found_class,
				info: req.user.info
			});
		}
	})
}

exports.info_update = function(req, res) {
	var type = req.body.type
		, val = req.body.value;
		if (type === "gender") {
				User.update({_id: req.user.id}, {$set: {'info.gender': val}}, {upsert:true}).exec(function(err, num) {
				if(err) {console.log('User info update error:', err); return false}
				else if (!num) {console.log("Nothing updated!"); res.send({success: false}); return false}
				else {
					res.send({success: true});
				}
			});
		}
		else if (type === "year") {
			User.update({_id: req.user.id}, {$set: {'info.year': val}}, {upsert:true}).exec(function(err, num) {
				if(err) {console.log('User info update error:', err); return false}
				else if (!num) {console.log("Nothing updated!"); res.send({success: false}); return false}
				else {
					res.send({success: true});
				}
			})
		}
}

exports.take = function(req, res) {
	User.find({username: req.params.user}).exec(function(err0, found_user) {
		if(err0) { console.log("Take user error: ", err0) }
		else {
			Classroom.find({name: req.params.class, owner: found_user[0].id}).populate('owner').exec(function(err, found_class) {
				if(err) { console.log("Take class error: ", err); return false}
				else {
					if (found_class[0].roster.indexOf(req.user.email) === -1) {
						req.session.classID = found_class[0].id;
						res.redirect('/error/not_in_roster');
						return false
					}
					Survey.find({_id: found_class[0].survey}).exec(function(err2, found_surv) {
						if(err2) {console.log("Take survey error: ", err2); return false}
						else {
							try {
								if (found_surv[0].name === "SIMS") {
									res.render("sims", {
										user: req.user.username,
										title: baseHead + " | " + req.params.user + "'s " + req.params.class,
										className: req.params.class,
										owner: found_class[0].owner.username,
										demo: req.user.info
									});
								}
							}
							catch(err) {
								res.render("no_survey", {
									user: req.user.username,
									title: baseHead + " | No Survey Found",
									className: req.params.class,
									owner: found_class[0].owner.username
								});
							}
						}
					})
				}
			})			
		}
	})
}

exports.err = function(req, res) {
	res.render('not_roster', {
		user: req.user.username,
		title: baseHead + " | " + "Not In Roster",
		classID: req.session.classID
	});
	req.session.classID = null;
}

// Handle auth

exports.login = function(req, res) {
	res.render("login", {
		title: baseHead + ' | Log In',
		message: req.session.messages,
		createMessage: req.session.userMessage
	})
	req.session.messages = null;
	req.session.userMessage = null;
}

exports.import = function(req, res) {
	if (req.user) { var user = req.user.username }
    else { var user = null }
	res.render("import", {
		title: baseHead,
		user: user
	});
}

exports.mail = function(req, res) {
	if (req.user) { var user = req.user.username }
	else { var user = null }
	res.render("mail", {
		title: baseHead + " | Mail Test",
		user: user
	});
}

exports.reject = function(req, res) {
	if (req.user) { var user = req.user.username }
    else { var user = null }
	res.render("reject", {
		title: baseHead + " | Survey Unavailable",
		user: user
	});
}

exports.aboutsurvo = function(req, res) {
	if (req.user) { var user = req.user.username }
    else { var user = null }
	res.render("aboutsurvo", {
		title: baseHead + " | About Survo",
		user: user
	});
}

exports.testpage1 = function(req, res) {
	if (req.user) { var user = req.user.username }
    else { var user = null }
	res.render("testpage1", {
		title: baseHead + " | Test Page 1",
		user: user
	});
}

exports.testpage3 = function(req, res) {
	if (req.user) { var user = req.user.username }
    else { var user = null }
	res.render("testpage3", {
		title: baseHead + " | Test Page 3",
		user: user
	});
}


exports.testpage2 = function(req, res) {
	if (req.user) { var user = req.user.username }
    else { var user = null }
	res.render("testpage2", {
		title: baseHead + " | Test Page 2",
		user: user
	});
}