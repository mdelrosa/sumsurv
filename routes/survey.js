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
            var survIDS = [];
            for (i=0;i<surv_db.length;i++) {
                survIDS[i] = surv_db[i].id;
            }
            Classroom.find({survey: {$in: survIDS}}).exec(function(err, classroom_db) {
                if(err) {console.log("All surveys classroom error: ", err); return false}
                else {
                    console.log("classes: ", classroom_db);
                    // finds number of occurrences of object with value
                    var countArr = [];
                    for (i=0;i<survIDS.length;i++) {
                        countArr[i] = 0;
                        for (j=0;j<classroom_db.length;j++) {
                            if (classroom_db[j].id === survIDS[i]) {
                                countArr[i] = countArr[i] + 1;
                            }
                        }
                    }
                    res.render('_surveys', {
                        surveys: surv_db,
                        countArr: countArr
                    });
                }
            })
        }
    })
}

// Render partial displaying classes which use this survey
exports.deployed = function(req, res) {
    Classroom.find({survey: req.query.survey}).populate('responses owner').exec(function(err, classroom_db) {
        if(err) { console.log("Deployed classroom error: ", err); return false}
        else { 
            res.render('_deployed', {
                classes: classroom_db,
                survey: req.query.survName
            })
        }
    })
}

function checkforid(checker, email) {
    for(i=0; i < checker.length; i++) {
        console.log("checker:",checker,"email:",email);
        if (checker[i][email]) {
            console.log("index:",i)
            return i;
        }
    }
    return false;
}

//checks what week the survey was taken (week1, week2, etc.)
function whatweek(startDay, startMonth, startYear, endDay, endMonth, endYear) {
    startMonth = startMonth;

    var startYear = startYear;
    var startMonth = startMonth;
    var startDay = startDay;

    endMonth = endMonth - 1;

    var differenceYear = endYear-startYear;
    var differenceMonth = endMonth - startMonth;
    var daysInBetween = 0;
    var monthHolder = 0;
    var monthsUntilNewYear = 0;
    var remainderDays = 0;
    var weeks = 0;
    var monthsTillNew = 0;
     
    var whatDate = function(number){
        if(number === 0 || number === 2 || number === 4 || number === 6 || number === 7 || number === 9 || number === 11){
           return 31;    
        }
        else if(number === 1) {
            return 28;    
        }
        else if(number === 3 || number === 5 ||  number === 8 || number === 10){
            return 30;  
        }
        else {
            console.log("Something is wrong in the same year loop");
        }
    };  


    if(differenceYear === 0){//YEAR IS THE SAME
        if(differenceMonth === 0){//MONTH IS THE SAME
            daysInBetween = endDay - startDay;
        }
        else{//IF MONTH IS DIFFERENT BUT YEAR IS THE SAME
            for(i=1; i < differenceMonth; i++){
                daysInBetween = whatDate(startMonth + i) + daysInBetween;
            }
            daysInBetween = whatDate(startMonth) - startDay + daysInBetween;
            daysInBetween = daysInBetween + endDay;
        }
    }
    else {//YEAR IS DIFFERENT
        monthsTillNew = 11 - startMonth;
        for(i=1; i < monthsTillNew + 1; i++){//start to end of year
            daysInBetween = whatDate(startMonth + i) + daysInBetween;
        }//beginning of year to end month
        for(i=0; i < endMonth; i++){
            daysInBetween = whatDate(i) + daysInBetween;
        }
        daysInBetween = whatDate(startMonth) - startDay + daysInBetween;
        daysInBetween = daysInBetween + endDay;
    }
    weeks = daysInBetween / 7;
    weeks = Math.ceil(weeks);
    if (weeks === 0){
        weeks = 1;
    };
    return weeks;
}

// Save an individual response to a survey
exports.save_response = function(req, res) {
    console.log("req.user", req.user);
    User.find({username: req.body.info.owner}).exec(function(err, found_user) {
        if(err) {console.log("Error in save_response user search: ", err); return false}
        Classroom.find({name: req.body.info.className, owner: found_user[0].id}).exec(function(err2, found_class) {
        	if(err2) {console.log("Error in save_response classroom search: ", err2); return false}        
            var checker = found_class[0].checker
                , checknum = checkforid(checker, req.user.email);
            if(checker && checker.length && checknum !== false) {
                var new_response = new Response({
                    results: req.body.results,
                    participant: req.user.id,
                    date: req.body.date,
                    time: req.body.time,
                    classname: found_class[0].name,
                    classroom: found_class[0].id,
                    userid: found_class[0].checker[checknum][req.user.email],
                    responseweek: whatweek(parseInt(found_class[0].span.start.date), parseInt(found_class[0].span.start.month), parseInt(found_class[0].span.start.year), parseInt(req.body.date.date), parseInt(req.body.date.month), parseInt(req.body.date.year))
                });   
                responsesaver(new_response);  
            }
            else {
                var pushed = {};
                if(!found_class[0].checker) { //if checker doesn't exist
                    pushed[req.user.email] = 1;
                    Classroom.update({_id: found_class[0].id}, {$addToSet: {checker: pushed}}).exec(function(err, num) {
                        if(err) {console.log("Error in pushing and checking of the userid: ", err); return false}
                        else{
                            var new_response = new Response({
                                results: req.body.results,
                                participant: req.user.id,
                                date: req.body.date,
                                time: req.body.time,
                                classroom: found_class[0].id,
                                classname: found_class[0].name,
                                userid: 1,
                                responseweek: whatweek(parseInt(found_class[0].span.start.date), parseInt(found_class[0].span.start.month), parseInt(found_class[0].span.start.year), parseInt(req.body.date.date), parseInt(req.body.date.month), parseInt(req.body.date.year))
                            });     
                            responsesaver(new_response);
                        }

                    })
                }
                else {
                    var newid = found_class[0].checker.length + 1;
                    pushed[req.user.email] = newid;
                    Classroom.update({_id: found_class[0].id}, {$addToSet: {checker: pushed}}).exec(function(err, num) {
                        if(err) {console.log("Error in giving new id to user: ", err); return false}
                        else{
                            var new_response = new Response({
                                results: req.body.results,
                                participant: req.user.id,
                                date: req.body.date,
                                time: req.body.time,
                                classroom: found_class[0].id,
                                classname: found_class[0].name,
                                userid: newid,
                                responseweek: whatweek(parseInt(found_class[0].span.start.date), parseInt(found_class[0].span.start.month), parseInt(found_class[0].span.start.year), parseInt(req.body.date.date), parseInt(req.body.date.month), parseInt(req.body.date.year))
                            });     
                            responsesaver(new_response);
                        }
                    })
                }
            }
            function responsesaver(toSave) {
            	toSave.save(function(err, saved_response) {
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
            }
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
    if(req.query.user) {console.log('req.query.user:',req.query.user)}
    else {console.log('No req.query.user')}
    if(req.user) {console.log('req.user:', req.user);}
    else {console.log('No req.user')}
    var owner = (req.query.user) ? req.query.user : req.user.id;
    console.log("owner:",owner);
    Classroom.find({owner: owner, name: req.query.className}).exec(function(err, found_class) {
        console.log("Found class:", found_class[0]);
        if(err) {console.log("Error in classroom export:", err); return false}
        else {
            Response.find({classroom: found_class[0].id}).populate('participant').exec(function(err2, response_db) {
                console.log("response_db:",response_db);
            	if(err2) {console.log("Error in response export: ", err2); return false}
                else {
                    var csvstr = [' , ClassName, Id, Response Week, Gender, Year, Status, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Comment, Answer Date, Time'];    	
                	var answerdate = "";
                    var answertime = ";"
                    for(i=1; i < response_db.length+1; i++) {
                        //These two lines decommafy the written responses
                		response_db[i-1].results[2] = decommafy(response_db[i-1].results[2]);
                		response_db[i-1].results[19] = decommafy(response_db[i-1].results[19]);
                        //takes the date the survey was taken and converts it to a x/x/xxxx format in string.
                        answerdate = response_db[i-1].date.month.toString() + "/" + response_db[i-1].date.date.toString() + "/" + response_db[i-1].date.year.toString();
                        answertime = response_db[i-1].time.hour.toString() + ":" + response_db[i-1].time.minutes.toString() + ":" + response_db[i-1].time.seconds.toString();
                        //This just turns the array into a string with comma separated values.
            			csvstr[i] = " ," + response_db[i-1].classname +"," + response_db[i-1].userid + "," + response_db[i-1].responseweek + "," + response_db[i-1].results.join(",") +","+ answerdate +  "," + answertime + ", ";
            		}
                    res.header('Content-type', 'text/csv');
                    res.send(csvstr);
                }
            });
        }
    });
};

exports.export_survey_all = function(req, res) {
    Survey.find({creator: req.user._id, name: req.query.survName}).exec(function(err0, found_survey) {
        if(err0) { console.log("Error in export_survey_all survey:", err0); return false }
        else {
            Classroom.find({survey: found_survey[0]._id}).populate('responses').exec(function(err, found_class) {
                if(err) {console.log("Error in export_survey_all classroom:", err); return false}
                else {
                    var response_db = [];
                    for (i=0;i<found_class.length;i++) {
                        response_db = response_db.concat(found_class[i].responses);
                    }
                    var csvstr = [' , ClassName, Id, Response Week, Gender, Year, Status, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Comment, Answer Date, Time, '];             
                    var answerdate = "";
                    var answertime = ";"
                    for(i=1; i < response_db.length+1; i++) {
                        //These two lines decommafy the written responses
                        response_db[i-1].results[2] = decommafy(response_db[i-1].results[2]);
                        response_db[i-1].results[19] = decommafy(response_db[i-1].results[19]);
                        //takes the date the survey was taken and converts it to a x/x/xxxx format in string.
                        answerdate = response_db[i-1].date.month.toString() + "/" + response_db[i-1].date.date.toString() + "/" + response_db[i-1].date.year.toString();
                        answertime = response_db[i-1].time.hour.toString() + ":" + response_db[i-1].time.minutes.toString() + ":" + response_db[i-1].time.seconds.toString();
                        //This just turns the array into a string with comma separated values.
                        csvstr[i] = " ," + response_db[i-1].classname +"," + response_db[i-1].userid + "," + response_db[i-1].responseweek + "," + response_db[i-1].results.join(",") +","+ answerdate +  "," + answertime + ", ";
                    }
                    res.header('Content-type', 'text/csv');
                    res.send(csvstr);
                }
            });
        }
    });
}

exports.export_weeks = function(req, res) {
    var owner = (req.query.user) ? req.query.user : req.user.id;
    var weeks = req.query.weeksarray.split(",");
    for(k=0; k<weeks.length; k++){
        weeks[k] = parseInt(weeks[k]);
    }
    var classid = req.query.classid;
        Response.find({classroom: classid}).exec(function(err, response_db) {
            if(err) {console.log("Error in export_survey_all classroom:", err); return false}
            else {
                var csvstr = [' , Id, Response Week, Gender, Year, Status, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Comment, Answer Date, Time'];        
                var answerdate = "";
                var answertime = ";"
                for(i=0; i < response_db.length; i++) {
                    for(j=0; j<weeks.length; j++) {
                        if(response_db[i].responseweek === weeks[j]){
                            //These two lines decommafy the written responses
                            response_db[i].results[2] = decommafy(response_db[i].results[2]);
                            response_db[i].results[19] = decommafy(response_db[i].results[19]);
                            //takes the date the survey was taken and converts it to a x/x/xxxx format in string.
                            answerdate = response_db[i].date.month.toString() + "/" + response_db[i].date.date.toString() + "/" + response_db[i].date.year.toString();
                            answertime = response_db[i].time.hour.toString() + ":" + response_db[i].time.minutes.toString() + ":" + response_db[i].time.seconds.toString();
                            //This just turns the array into a string with comma separated values.
                            csvstr[i+1] = " ," + response_db[i].userid + "," + response_db[i].responseweek + "," + response_db[i].results.join(",") +","+ answerdate +  "," + answertime + ", ";
                        }
                    }
                }
                res.header('Content-type', 'text/csv');
                res.send(csvstr);
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
