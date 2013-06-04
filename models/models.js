// models.js

var mongoose = require('mongoose');

var responseSchema = mongoose.Schema({
	id: Number,
	results: Array
});

var Response = mongoose.model('Response', responseSchema);

exports.response = Response;