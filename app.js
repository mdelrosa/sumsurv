
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , classroom = require('./routes/classroom')
  , survey = require('./routes/survey')
  , mail = require('./routes/mail')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongo')(express)
  , Models = require('./models/models')
  , User = Models.User
  , Survey = Models.survey
  , cronJob = require('cron').CronJob
  , Classroom = Models.classroom
  , nodemailer = require("nodemailer");

// Seed the admin
var admin = new User({
    username: 'stolktacular',
    email: "authumlab@gmail.com",
    password: "jsizzle",
    classes: []
  });
admin.save(function(err, stolk) {
  if(err) {
    console.log(err);
  } 
  else {
    // Seed the SIMS survey
    var SIMS = new Survey({
      name: "SIMS",
      pages: [],
      creator: stolk._id
    });
    SIMS.save(function(err) {
      if(err) {console.log("SIMS Save Error: ", err); return false}
      else {
        console.log("Succesffuly saved SIMS")
        Survey.find({name:"SIMS"}).populate("creator").exec(function(err, found) {
          if(err) {console.log("SIMS Error: ", err); return false}
          else {
            console.log("Found: ", found[0])
            console.log("SIMS is owned by: ", found[0].creator);
          }
        })
      }
    })
  }
});


 //                         __                  _   _                 
 //                        / _|                | | (_)                
 //  _ __   _____      __ | |_ _   _ _ __   ___| |_ _  ___  _ __  ___ 
 // | '_ \ / _ \ \ /\ / / |  _| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
 // | | | |  __/\ V  V /  | | | |_| | | | | (__| |_| | (_) | | | \__ \
 // |_| |_|\___| \_/\_/   |_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
 
// New Sub-Functions for handling date incrementing and mail sending.
function bumpEmailTime(classroom, type){
  if(type === "regular"){
    //Code to increment regular date
    var bumpDate = classroom.maildeck.regular;
    while (bumpDate <= new Date) {
      bumpDate.setDate(bumpDate.getDate()+7);
    }
    Classroom.update({ _id: classroom._id }, { 'maildeck.regular': bumpDate }).exec(function(err, num) {
      if(err) { console.log("Decklist regular classroom error:", err); res.send({success:false, message: "Classroom regular update error:"+err})}
      else if(!num) {console.log("Decklist regular update error: No classes found");}
      else {console.log("Decklist regular update success! classroom.name and bumpDate :",classroom.name, bumpDate);}      
    })
  }
  else if(type === "reminder"){
    //Code to increment reminder date
    var bumpDate = classroom.maildeck.reminder;
    while (bumpDate <= new Date) {
      bumpDate.setDate(bumpDate.getDate()+7);
    }
    Classroom.update({ _id: classroom._id }, { 'maildeck.reminder': bumpDate }).exec(function(err, num) {
      if(err) { console.log("Decklist reminder classroom error:", err); res.send({success:false, message: "Classroom reminder update error:"+err})}
      else if(!num) {console.log("Decklist reminder update error: No classes found");}
      else {console.log("Decklist reminder update success! classroom.name and bumpDate :",classroom.name, bumpDate);}
    })
  }
  else{console.log('WTF?? from bumpEmailTime! classroom, type are: ',classroom,type)}
}

function makeRoster(classroom, type, callback){
  if(type==="regular"){
    //Just return entire roster if it is the regular email
    roster=classroom.roster;
    callback(classroom, type, roster);
  }
  else if(type==="reminder"){
    //Insert code for paring down roster
    User.find({email: {$in: classroom.roster}}).exec(function(err, user_db) {
      if(err)  {console.log('Unable to find users'); return false}
      else if (user_db){
        //console.log('classroom within user find: ', classroom);
        var currentId = 0;
        var datedata = new Date();
        var month = datedata.getMonth()+1; 
        var date = datedata.getDate(); 
        var year = datedata.getFullYear();
        var whatweeknow = whatweek(parseInt(classroom.span.start.date), parseInt(classroom.span.start.month), parseInt(classroom.span.start.year), date, month, year);
        var roster = classroom.roster;
        for (k=0; k<user_db.length; k++) {
          currentId = user_db[k].id;
          for(j=0; j<classroom.responses.length; j++) {
            if(currentId === classroom.responses[j].participant.toString()) {
              if(classroom.responses[j].responseweek === whatweeknow){
                roster.splice(roster.indexOf(user_db[k].email), 1);
                //console.log("This is the new roster doe", roster);
                  break;
              }
            }
          }
        console.log('post-check reminder roster: ', roster);
        }
      }
      callback(classroom, type, roster);
    }
  )}
  else{console.log('WTF from makeRoster: classroom, type, roster are: ',classroom,type,roster)}
}

function makeLink(classroom, type, roster, callback){
  if (roster.length){
    var urllink = "http://motivationsurvey.com/" + encodeURIComponent(classroom.owner.username).toString() + "/" + encodeURIComponent(classroom.name).toString() + "/take";
    callback(classroom, type, roster, urllink);
  }
  else (console.log('No roster length for class: ',classroom.name))
}

function sendMail(classroom, type, roster){
  //This is the final function (of my additions... still uses surveymail)! Basically just generates htmllink and calls surveymail
  //Old mailer function (with updated variable inputs) is used as callback after link is generated
  makeLink(classroom, type, roster, surveymail);
}

function goPostal(classroom,type){
  //This is what starts the chain, and what is called from the cron loop
  bumpEmailTime(classroom, type);
  makeRoster(classroom, type, sendMail);
  console.log('goPostal sequence complete!')
}



var job = new cronJob("00 * * * * *", function() {
  //first * is which second, next is minute, next is the hour, ? ? and then day of the week.  
  Classroom.find({}).populate('owner responses').exec(function(err, found_class) {
    if(err) { console.log("Decklist class error:", err); res.send({ success: false })}
    else {
      for (i=0;i<found_class.length;i++) {
        //Print each class for log
        console.log('Class name:'+found_class[i].name+ " ---");
        //Check for maildeck
        if (found_class[i].maildeck) {
          console.log("regular:", found_class[i].maildeck.regular, "now:", new Date, "before now:", found_class[i].maildeck.regular <= new Date);
          console.log("reminder:", found_class[i].maildeck.reminder, "now:", new Date, "before now:", found_class[i].maildeck.reminder <= new Date);
          //After printing maildeck properties, let's keep everything inside this yes maildeck condition
          if(found_class[i].maildeck.regular <= new Date){
            var classroom = found_class[i];
            goPostal(classroom,"regular");
            console.log('Regular postal has gone for classroom: ', classroom.name);
          }
          else if(found_class[i].maildeck.reminder <= new Date){
            var classroom = found_class[i];
            goPostal(classroom,"reminder");
            console.log('Reminder postal has gone for classroom: ', classroom.name);
          }
        }
        else {console.log("class maildeck not defined.")}
      }
    } 
  })
}, null, true, "America/New_York");

var surveymail = function(classroom, type, roster, urllink) {
  var smtpTransport = nodemailer.createTransport("SMTP", {

    service: "Gmail",
    auth: {
      user: "authumlab@gmail.com",
      pass: "tqufkeinpstgfatv"
    }
  });

  var datedata= new Date(); 
  var month = datedata.getMonth()+1; 
  var date = datedata.getDate(); 
  var year = datedata.getFullYear();
  var day = datedata.getDay();
  var lastday = date+7-day;
  var firstday = date-day;
  var firstmonth = datedata.getMonth()+1;
  var firstyear = datedata.getFullYear();
  var first = firstmonth.toString()+ "/" +firstday.toString()+ "/" +firstyear.toString();
  var last = month.toString()+ "/" +lastday.toString()+ "/" +year.toString();
  if (firstday < 1) {
    firstmonth = month - 1;
    if (firstmonth < 0) {
      firstyear = firstyear - 1;
      firstmonth == 11;
    };
    if (firstmonth == 0 || firstmonth == 2 || firstmonth == 4 || firstmonth == 6 || firstmonth == 7 || firstmonth == 9 || firstmonth == 11){
      firstday = 31 + firstday;
    }
    else if (firstmonth == 3 || firstmonth == 5 || firstmonth == 8 || firstmonth == 10) {
      firstday = 30 + firstday;
    }
    else if (firstmonth == 1) {
      firstday = 28 + firstday;
    };        
  };
  var htmlBody;
  if (type === "regular") {
    htmlBody = '<div style="80%"><p><center><img src="http://i.imgur.com/6FO9p55.png" style="width:100%"/></center></p>' +
          '<p>Hey everyone!</p>' + 
          '<p></p>' +
          '<p>It’s that time of week again. This survey is for the week of ' +first+ " to " +last+ '. Treat this survey as a reflection on your activities this week.</p>' + 
          '<p></p>' +
          '<p>Remember to email alexander.dillon@olin.edu if you have any issues or comments!</center></p>' +
          '<p></p>' +
          '<p>Here’s the link:</p>'+
          '<p><center><a href="'+urllink+'" target="survey page"><img src="http://i.imgur.com/MaVMQlI.png" /></a></center></p>' +
          '<p> </p>' +
          '<p>Happy surveying,</p>' +
          '<p>Autonomous Humans Lab</p>' +
          '<div style="background-color: #dcdcdc"><center><footer><p style="color: #999999">Autonomous Humans Lab</p>' +
          '<p style="color: #999999">motivationsurvey.com</center></p></footer></center></div></div>'
  }
  else if (type === "reminder") {
    htmlBody = '<div style="80%"><p><center><img src="http://i.imgur.com/6FO9p55.png" style="width:100%"/></center></p>' +
          '<p>Hey everyone!</p>' + 
          '<p></p>' +
          "<p>It seems that you have not taken this week's survey yet... This makes us terribly sad. If you would like to make us happy you can click the link below.</p>" + 
          '<p></p>' +
          '<p>Remember to email alexander.dillon@olin.edu if you have any issues or comments!</center></p>' +
          '<p></p>' +
          '<p>Here’s the link:</p>'+
          '<p><center><a href="'+urllink+'" target="survey page"><img src="http://i.imgur.com/MaVMQlI.png" /></a></center></p>' +
          '<p> </p>' +
          '<p>Happy surveying,</p>' +
          '<p>Autonomous Humans Lab</p>' +
          '<div style="background-color: #dcdcdc"><center><footer><p style="color: #999999">Autonomous Humans Lab</p>' +
          '<p style="color: #999999">motivationsurvey.com</center></p></footer></center></div></div>'
  }
  else{console.log('Unrecognized type in email construction: ', type)}
  var mailOptions = {
      from: "Autonomous Humans Lab<authumlab@gmail.com>", // sender address
      bcc: roster.join(","), // list of receivers
      subject: "SIMS Weekly ", // Subject line
      text: "Hello world", // plaintext body
      html:  htmlBody
  }

  // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
            // shut down the connection pool, no more messages
            smtpTransport.close();
        }
    }); 
}

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user.id);
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
})

// Passport set up local strategy
passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) {return done(null, false, { message: 'Unknown user ' + username}); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err)
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password'});
      }
    })
  })
}))

var app = express();

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/sumsurv');

app.configure(function(){
  app.listen(process.env.NODE_ENV === 'production' ? 80 : 3000, function() {
	  console.log("Ready");

	  // if run as root, downgrade to the owner of this file
	  if (process.getuid() === 0) {
	    require('fs').stat(__filename, function(err, stats) {
	      if (err) return console.log(err);
	      process.setuid(stats.uid);
	    })
	  }

	});
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('secret', process.env.SESSION_SECRET || 'terrible, terrible secret')
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(app.get('secret')));
  app.use(express.session({ secret: '2fast2furious' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// static page routes
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/about', user.about);
app.get('/splash', ensureDate, user.splash);
app.get('/survey', ensureAuthenticated, ensureDate, user.survey);
app.get('/survey/create', ensureAuthenticated, user.create);
app.get('/export', ensureAuthenticated, user.exportcsv);
app.get('/mail', user.mail);
app.get('/classes', ensureAuthenticated, user.my_classes);
app.get('/part', ensureAuthenticated, user.part);
app.get('/:user/:class/take', ensureAuthenticated, ensureDate, ensureDemo, user.take);
app.get('/error/not_in_roster', ensureAuthenticated, user.err);
app.get('/testpage1', user.testpage1);
app.get('/testpage2', user.testpage2);
app.get('/testpage3', user.testpage3);

app.get('/aboutsurvo', user.aboutsurvo);

app.get('/error', user.error);


// Mail routes
app.get('/mail/send', mail.test_mail);
app.get('/mail/list', mail.list);

// user routes
app.get('/login', user.login);
app.get('/logout', function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/')
})

//redirect to rejection page
app.get('/reject', user.reject);

// Survey creation partials
app.get('/pages/current', survey.current_pages);
app.get('/surveys/all', survey.all_surveys);
app.get('/survey/deployed', survey.deployed);

// Survey response exporting
app.get('/survey/export/all', survey.export_survey_all);
app.get('/survey/export/weeks', survey.export_weeks);

// Class creation partials
app.get('/class/all', classroom.all);
app.get('/class/roster', classroom.roster);
app.get('/class/survey', classroom.survey);
app.get('/class/requests', classroom.view_requests);
app.get('/class/span/view', classroom.view_span);

//import text file
app.get('/import', ensureAuthenticated, user.import);

//get that text file's data
app.post('/import', survey.import);

//exporting page route(s)
app.get('/class/export', survey.export);

// handling user object info
app.post('/user/info/update', user.info_update);

// handling survey objects
app.post('/survey/create', survey.create);
app.post('/survey/success', survey.save_response);

// -- handling classroom objects
// deletion
app.post('/class/delete', classroom.delete)
// roster
app.post('/class/create', classroom.new_class);
app.post('/class/roster/update', classroom.roster_update);
app.post('/class/roster/remove', classroom.remove);
app.post('/class/roster/add', classroom.roster_add);
// survey
app.post('/class/survey/update', classroom.survey_update);
// span
app.post('/class/span/edit', classroom.edit_span);
// interval
app.post('/class/interval', classroom.interval);
// participant requests
app.post('/class/request/add', classroom.part_add);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

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
          monthsTillNew = 11 - startM
      }
      return Math.ceil(daysInBetween/7)
}



// Login middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {return next()}
  // If not unique route
  if (!req.params) {
    req.session.nextpath = req.route.path;  
    req.session.nextparams = false;
  }
  else {
    req.session.nextpath = req.route.path;
    req.session.nextparams = new Object();
    for(var key in req.route.params) {
      req.session.nextparams[key] = req.route.params[key];
    }
  }
  res.redirect('/login');
}

// Demographic middleware; if info is not filled out, then catch user and send to participating
function ensureDemo(req, res, next) {
	if(req.user.info && req.user.info.gender && req.user.info.year) { return next() }
	else {
		res.redirect('/part')
	}
}

//date confirmation middleware
function ensureDate(req, res, next) {
  var d = new Date();
  // Helper function that parses/formats interval objects
  function intCheckFormat(obj) {
    var day = (parseInt(obj.day) === 7) ? 0 : parseInt(obj.day);
    if (parseInt(obj.hour) === 12) {
      var hour = (obj.time === "PM") ? 12 : 0;
    }
    else {
      var hour = (obj.time === "PM") ? parseInt(obj.hour) + 12 : parseInt(obj.hour);
    }
    var minute = parseInt(obj.minute);
    return { day: day, hour: hour, minute: minute }
  }
  User.find({ username: req.params.user }).exec(function(err, found_user) {
    if(err) { console.log('ensureDate user search error:', err); return false }
    else {
      Classroom.find({ name: req.params.class, owner: found_user[0].id }).exec(function(err, found_class) {
        if(err) { console.log('ensureDate class search error:', err); return false }
        else {
            if(found_class.length > 0) {
            var today = new Date
                , span = found_class[0].span
                , begin = new Date(span.start.year, span.start.month, span.start.date)
                , finish = new Date(span.end.year, span.end.month, span.end.date)
            console.log('span:', span, '\ntoday:',today);
            console.log('begin:', begin, '\nfinish', finish);

            if (today >= begin && today <= finish) {
              var start = intCheckFormat(found_class[0].interval.start)
                  , end = intCheckFormat(found_class[0].interval.end);
              if (end.day > start.day) {
                // End comes after start; make sure d falls in between them
                console.log('end.day > start.day');
                if ( (d.getDay() > start.day && d.getDay()<end.day) || 
                     (d.getHours() >= start.hour && d.getMinutes() >= start.minute && d.getDay() === start.day) ||
                     (d.getHours() <= end.hour && d.getMinutes() <= end.minute && d.getDay() === end.day)) {
                  return next()
                }
                else { res.redirect('/reject') }
              }
              else if (end.day < start.day) {
                console.log('end.day < start.day');
                // End comes earlier in week than start; make sure d falls outside of them
                if ( (d.getDay() > start.day || d.getDay() < end.day) ||
                     (d.getHours() >= start.hour && d.getMinutes() >= start.minute && d.getDay() === start.day) ||
                     (d.getHours() <= end.hour && d.getMinutes() <= end.minute && d.getDay() === end.day) ) {
                  return next()
                }
                else { res.redirect('/reject') }
              }
              else if (end.day===start.day) {
                console.log('end.day === start.day');
                // The end day is the same as the start day; check start/end times to see if we check between or outside
                if (end.hour > start.hour) {
                  console.log('end.hour > start.hour');
                  // The end hour comes after the start hour; check in between times
                  if ( (d.getHours() > start.hour || ( d.getHours() === start.hour && d.getMinutes() >= start.minute)) &&
                       (d.getHours() < end.hour || (d.getHours() === end.hour && d.getMinutes() < end.minute)) && 
                       (d.getDay() === start.day) ) {
                    return next()
                  }
                  else { res.redirect('/reject') }
                }
                else if (end.hour < start.hour) {
                  console.log('end.hour < start.hour');
                  // The end hour comes before the start hour; check outside the times
                  if ( (d.getDay() === start.day && ((d.getHours() >= start.hour && d.getMinutes() >= start.minute) || (d.getHours() <= end.hour && d.getMinutes() <= end.minute)) ) ||
                       (d.getDay() !== start.day) ) {
                    return next()
                  }
                  else { res.redirect('/reject') }
                }
                else if (end.hour === start.hour) {
                  console.log('end.hour === start.hour');
                  // Interval starts/ends in the same hour of the same day... wut.
                  if (end.minute > start.minute) {
                    console.log('end.minute > start.minute');
                    // End after start; check between
                    if ( (d.getMinutes() >= start.minute && d.getMinutes() <= end.minute) &&
                         start.day === d.getDay() && start.hour === d.getHours() ) {
                      return next()
                    }
                    else { res.redirect('/reject') }
                  }
                  else if (end.minute < start.minute) {
                    console.log('end.minute < start.minute');
                    // End before start; reject between
                    if ( (d.getMinutes() < start.minute && d.getMinutes() > end.minute) &&
                         start.day === d.getDay() && start.hour === d.getHours() ) {
                      res.redirect('/reject')
                    }
                    else { return next() }
                  }
                }
              }
            }
            else {
              if (today < begin) {
                console.log("Before begin");
                res.redirect('/reject');
              }
              else {
                console.log("After finish");
                res.redirect('/reject')
              }
            }
          }
          else {
            res.redirect('/');
          }
        } 
      })
    }  
  })
}

// Login auth @ post /login
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      console.log('login failed')
      req.session.messages = [info.message];
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err) }
      console.log("successful login");
      req.session.user = user;
      if (req.session.nextpath) {
        if (!req.session.nextparams) {
          res.redirect(req.session.nextpath);
          req.session.nextpath = false;
        }
        else {
          res.redirect(req.session.nextpath.formParamURL(req.session.nextparams))
          req.session.nextpath = false;
          req.session.nextparams = false;
        }
      }
      else {
        res.redirect('/part');
      }
    });
  })(req, res, next);
});

// Form a param url after ensureAuthenticated middleware
String.prototype.formParamURL = function(params) {
  var result = ""
      , getParamKey = false
      , paramNames = []
      , nextParam = "";
  for (i=0;i<this.length;i++) {
    if(!getParamKey) {
      if(this[i] === ":") {
        getParamKey = true;
      }
      else {
        result = result + this[i]
      }
    }
    else {
      if (this[i] !== "/") {
        nextParam += this[i];
      }
      else {
        getParamKey = false;
        result = result + params[nextParam]+"/";
        nextParam = "";
      }
    }
  }
  return result;
}

// Handle new user creation
app.post('/user/create', function(req, res, next) {
  var r = req.body
  if (r.username.length === 0|| r.email.length === 0 || r.password.length === 0 || r.passwordCheck.length === 0) {
    req.session.userMessage = "Missing credentials!";
    return res.redirect('/login');
  }
  else if (r.password !== r.passwordCheck) {
    req.session.userMessage = "Passwords did not match!";
    return res.redirect('/login');
  }
  User.find({email: r.email.toLowerCase()}).exec(function(err, user_db) {
    if (user_db.length > 0) {
      req.session.userMessage = "Email already registered!";
      return res.redirect('/login');
    }
    for (i=0;i<user_db.length;i++) {
      if (user_db[i].username === r.username) {
        req.session.userMessage = "Username already in use!";
        return res.redirect('/login');
      }
    }
    var newUser = new User({
      username: r.username,
      email: r.email.toLowerCase(),
      password: r.password
    });
    newUser.save(function(err) {
      if(err) {
        console.log("Error: ", err);
        req.session.userMessage = "Unable to save your credentials. Please try again!";
        return res.redirect('/login');
      }
      else {
        console.log("success");
        req.session.userMessage = "Successfully saved your credentials!";
        return res.redirect('/login');
      }
    });
  });
})

