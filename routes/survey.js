// survey.js
// Handle acreating/editing/submitting survey objects

var Models = require('../models/models')
	, Response = Models.response
    , Survey = Models.survey
    , Page = Models.page
    , Emaillist = Models.emaillist
    , Classroom = Models.classroom
    , User = Models.User;


// --Survey creation-- //
// Add new survey object to database
exports.create = function(req, res) {
    Survey.find({creator: req.user._id}).exec(function(err, survey_db) {
        if (err) { console.log('Unable to find surveys'); return false}
        // If survey of this name exists, then send a failure message
        for (i=0;i<survey_db.length;i++) {
            if (survey_db[i].name === req.body.name) {
                res.send({success:false, message:"This survey already exists!"});
                return false
            }
        }
        // Save new survey
        var new_survey = new Survey({name: req.body.name, creator: req.user});
        new_survey.save(function(err) {
            if(err) {
                console.log('Unable to save survey');
                res.send({success:false, message: "Unable to save your survey. Please try again!"})
                return false
            }
            console.log("Successfully saved new survey!");
            res.send({success:true});
        })
    })
}

// Render page partial of current survey
exports.current_pages = function(req, res) {
    Survey.find({creator: req.user, name: req.body.name}).exec(function(err, current_surv) {
        if(err) {console.log("Unable to find survey")}
        else {
            res.render('_currentPages', {
                current_survey: current_surv,
                pages: current_surv.pages
            });
        }
    });
}

// Render surveys partial of survey editing page
exports.all_surveys = function(req, res) {
    Survey.find({creator: req.user}).exec(function(err, surv_db) {
        if(err) {console.log("Unable to find surveys"); return false}
        else {
            res.render('_surveys', {
                surveys: surv_db
            })
        }
    })
}

// Save an individual response to a survey
exports.save_response = function(req, res) {
    console.log("req.body", req.body);
    User.find({username: req.body.info.owner}).exec(function(err, found_user) {
        if(err) {console.log("Error in save_response user search: ", err); return false}
        Classroom.find({name: req.body.info.className, owner: found_user[0].id}).exec(function(err2, found_class) {
        	if(err2) {console.log("Error in save_response classroom search: ", err2); return false}
            var new_response = new Response({
                results: req.body.results,
                participant: req.user.id,
                classroom: found_class[0].id,
                date: req.body.date
            });
        	new_response.save(function(err, saved_response) {
        		if(err) {
        			console.log('Unable to save response');
        		 	res.send({success:false})
        		 	return false;
        		}
        		console.log('Successfully saved new response!');
                Classroom.update({name: req.body.info.className, owner: found_user[0]}  , { $addToSet: { responses: saved_response.id }}).exec(function(err3, updated_class) {
                    if(err3) { console.log("Err in classroom update: ", err3); return false }
                    console.log("Successfully updated classroom!");
                    res.send({success:true})
                });
            });
        });
    });
}

//This function takes away commas to prevent issues in csv
String.prototype.sliceCharacterFromString = function(char)  {
        	var i = 0
            	, newString = "";
	        while (i < this.length) {
    	        if (this[i] !== char) {
        	        newString = newString + this[i];
            	}
            	else {
            		newString = newString + '|>';
            	}
	            i = i + 1;
	        }
    	    return newString
}

function decommafy(str) {
	return str.sliceCharacterFromString(",");	

}

exports.export = function(req, res) {
    Classoom.find({owner: req.user.username, name: req.body.name}).exec(function(err, found_class) {
        if(err) {console.log("Error in classroom export:", err2); return false}
        else {
            Response.find({classroom: found_class[0].id},function(err2, response_db){
            	if(err2) {console.log("Error in response export: ", err2); return false}
                else {
                    var csvstr = [' , Id, Gender, Year, Status, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Comment, Answer Date, Owner, Class, '];    	
                	var answerdate = "";
                    for(i=1; i < response_db.length+1; i++) {
                        //These two lines decommafy the written responses
                		response_db[i-1].results[2] = decommafy(response_db[i-1].results[2]);
                		response_db[i-1].results[19] = decommafy(response_db[i-1].results[19]);
                        //takes the date the survey was taken and converts it to a x/x/xxxx format in string.
                        answerdate = response_db[i-1].date.month.toString() + "/" + response_db[i-1].date.day+toString() + "/" + dresponse_db[i-1].date.year.toString();
                        //This just turns the array into a string with comma separated values.
            			csvstr[i] = " ," + response_db[i-1].id + "," + response_db[i-1].results.join(",") + answerdate +  "," + response_db[i-1].info.owner + "," response_db[i-1].info.className + ", ";
            		}
                    res.header('Content-type', 'text/csv');
                    res.send(csvstr);
                }
            });
        }
    });
};


exports.import = function(req, res) {
    Emaillist.find().exec(function(err, emaillist_db) {
        if(err) {console.log('Unable to find responses'); return false}
        var new_emaillist = new Emaillist({emailarray: req.body.emailarray});
        new_emaillist.save(function(err) {
            if(err) {
                console.log('Unable to save response');
                res.send({success:false})
                return false;
            }
            console.log('Successfully obtained emails!');
            res.send({success:true});
        })  
    })  
}
