// models.js

var mongoose = require('mongoose');

// Will have to inherit result structure from Survey schema eventually....
var responseSchema = mongoose.Schema({
	id: Number,
	results: Array
});

var Response = mongoose.model('Response', responseSchema);

exports.response = Response;