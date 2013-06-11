
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.about = function(req, res) {
    if (req.user) { var user = req.user.username }
    else { var user = null }	
	res.render('about', {
		title: 'Stolk-vey',
		user: user
	});
}

exports.survey = function(req, res){
  if (req.user) { var user = req.user.username }
  else { var user = null }
  res.render('survey', {
        title: 'This Survey',
        user: user
  });
};

exports.splash = function(req, res) {
	if (req.user) { var user = req.user.username }
    else { var user = null }
	res.render('splash', {
		title: 'Stolk-vey',
		user: user
	});
}

exports.survey = function(req, res) {
	if (req.user) { var user = req.user.username }
    else { var user = null }
	res.render('survey', {
		title: 'Stolk-vey',
		user: user
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

exports.import = function(req, res) {
	if (req.user) { var user = req.user.username }
    else { var user = null }
	res.render("import", {
		title: 'Stolk-vey',
		user: user
	});
}