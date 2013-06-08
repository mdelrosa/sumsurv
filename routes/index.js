
/*
 * GET home page.
 */

exports.index = function(req, res){
  if (req.user) { var user = req.user.username }
  else { var user = null }
  res.render('index', {
  	title: 'Stolk-vey',
  	user: user
  });
};