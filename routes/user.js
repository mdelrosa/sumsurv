
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
		res.render('create', {
			title: baseHead + ' | Create New Survey',
			user: req.user.username,
			surveys: user_surveys
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
		if (err) {console.log("Could not find user's classrooms")}
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
		if(err) {console.log("Participating static error: ", err); return false}
		else {
			console.log("found_class: ", found_class);
			res.render('participating', {
				title: baseHead + " | Participating",
				user: req.user.username,
				classes: found_class
			});
		}
	})
}

exports.take = function(req, res) {
	User.find({username: req.params.user}).exec(function(err0, found_user) {
		console.log("found_user: ", found_user)
		if(err0) { console.log("Take user error: ", err0) }
		else {
			Classroom.find({name: req.params.class, owner: found_user[0]._id}).populate('owner').exec(function(err, found_class) {
				if(err) { console.log("Take class error: ", err); return false}
				else {
					if (found_class[0].roster.indexOf(req.user.email) === -1) {
						res.redirect('/error/not_in_roster');
						return false
					}
					console.log("found_class: ", found_class)
					Survey.find({_id: found_class[0].survey}).exec(function(err2, found_surv) {
						if(err2) {console.log("Take survey error: ", err2); return false}
						else {
							console.log("className: ", req.params.class);
							console.log("owner: ", found_class[0].owner.username)
							try {
								if (found_surv[0].name === "SIMS") {
									res.render("sims", {
										user: req.user.username,
										title: baseHead + " | " + req.params.user + "'s " + req.params.class,
										className: req.params.class,
										owner: found_class[0].owner.username
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
		title: baseHead + " | " + "Not In Roster"
	})
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