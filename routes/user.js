
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.about = function(req, res) {
	res.render('about', {
		title: 'Stolk-vey',
		user: req.user
	});
}

exports.survey = function(req, res){
  res.render('survey', {
        title: 'This Survey',
        user: req.user
  });
};

exports.splash = function(req, res) {
	res.render('splash', {
		title: 'Stolk-vey',
		user: req.user
	});
}

exports.survey = function(req, res) {
	res.render('survey', {
		title: 'Stolk-vey',
		user: req.user
	});
}

exports.exportcsv = function(req, res) {
	res.render('exportcsv', {
		title: 'Stolk-vey',
		user: req.user.username
	});
}

// Handle auth

exports.login = function(req, res) {
	res.render("login", {
		title: 'Stolk-vey',
		message: req.session.messages
	})
	req.session.messages = null;
}