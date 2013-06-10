// models.js

var mongoose = require('mongoose')
	, bcrypt = require('bcrypt')
	, SALT_WORK_FACTOR = 10;

// Response schema
// **NOTE: Will have to inherit result structure from Survey schema eventually. **
var responseSchema = mongoose.Schema({
	id: Number,
	results: Array
});

// Export responses
var Response = mongoose.model('Response', responseSchema);
exports.response = Response;

// User schema
var userSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true},
	email: { type: String, required: true, unique: true},
	password: {type: String, required: true}
});

// Bcrypt middleware
userSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) return next(err);
			user.password = hash;
			next();
		})
	})
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);
	});
};

// Export user
var User = mongoose.model("User", userSchema);
exports.User = User;