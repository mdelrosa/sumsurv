// models.js

var mongoose = require('mongoose')
	, bcrypt = require('bcrypt')
	, SALT_WORK_FACTOR = 10;

// Page schema
var pageSchema = mongoose.Schema({
	name: { type: String, required: true, unique: false},
	type: { type: String, required: true, unique: false},
	questions: { type: Array, required: true},
	survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
	settings: { type: Object, required: true }
}),
	Page = mongoose.model('Page', pageSchema);
exports.page = Page;

// Survey schema
var surveySchema = mongoose.Schema({
	name: { type: String, required: true, unique: false},
	pages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Page" }],
	creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}),
	Survey = mongoose.model('Survey', surveySchema);
exports.survey = Survey;

// Response schema
// **NOTE: Will have to inherit result structure from Survey schema eventually. **
var responseSchema = mongoose.Schema({
	results: Array,
	participant: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
	classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom"},
	date: Object,
	time: Object,
	userid: Number,
	responseweek: Number
}),
	Response = mongoose.model('Response', responseSchema);
exports.response = Response;

// Classroom schema
var classroomSchema = mongoose.Schema({
	name: { type: String, required: true},
	owner: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
	roster: [String],
	survey: {type: mongoose.Schema.Types.ObjectId, ref: 'Survey'},
	responses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Response" }],
	interval: { type: Object, required: true},
	span: { type: Object },
	requests: { type: Array },
	checker: { type: Array}
}),
	Classroom = mongoose.model('Classroom', classroomSchema);
exports.classroom = Classroom;

// User schema
var userSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true},
	email: { type: String, required: true, unique: true},
	password: {type: String, required: true},
	info: { type: Object }
});

// Email list serve schema
var emaillistSchema = mongoose.Schema({
	emailarray: Array
});

// Export emailist
var Emaillist = mongoose.model('Emaillist', emaillistSchema);
exports.emaillist = Emaillist;

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