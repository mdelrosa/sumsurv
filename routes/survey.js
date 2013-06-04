// survey.js
// Handle acreating/editing/submitting survey objects

var Models = require('../models/models')
	, Response = Models.response;

exports.save_response = function(req, res) {
	console.log(req.body)
	Response.find().exec(function(err, response_db) {
		if(err) {console.log('Unable to find responses'); return false}
		var newID = response_db.length;
		console.log('newID', newID);
		var new_response = new Response({id: newID, results: req.body.results});
		new_response.save(function(err) {
			if(err) {
				console.log('Unable to save response');
			 	res.send({success:false})
			 	return false;
			}
			console.log('Successfully saved new response!');
			res.send({success:true});
		})	
	})	
	
}