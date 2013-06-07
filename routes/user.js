
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.about = function(req, res) {
	res.render('about', {
		title: 'Stolk-vey'
	});
}

exports.survey = function(req, res){
  res.render('survey', {
        title: 'This Survey'
  });
};

exports.splash = function(req, res) {
	res.render('splash', {
		title: 'Stolk-vey'
	});
}

exports.survey = function(req, res) {
	res.render('survey', {
		title: 'Stolk-vey'
	});
}

exports.survey_success = function(req, res) {
	res.render('response_success', {
		title: "Stolk-vey"
	});
}

exports.exportcsv = function(req, res) {
	res.render('exportcsv', {
		title: 'Stolk-vey'
	});
}