
/*
 * GET home page.
 */

var baseHead = "Survo";

exports.index = function(req, res){
  if (req.user) { var user = req.user.username }
  else { var user = null }
  res.render('index', {
  	title: baseHead+ ' | Home',
  	user: user
  });
};