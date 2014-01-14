//Utils for finding and setting dates
var Models = require('../models/models')
  , Classroom = Models.classroom;



//Takes interval object from web-ready format and translates to date-ready format
function intToDHM(obj){
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


function findIntDates(classroom, intType, cb){
  //This function finds the most recently activated interval - it can only be during or after it. 
  //Suitable for use in survey availability date check? Maybe...
  //Dates need to be advanced in order to determine next email times, that is done in findEmailTimes
  var today = new Date;
  //present day minus intStart day
  console.log('Finding interval dates for classroom, intType: ', classroom.name, intType);
  var intStart = intToDHM(classroom.interval.start)
    , intStop = intToDHM(classroom.interval.end);
  var dateStart = new Date();
  var startDiff = today.getDay()-intStart.day;
  if(startDiff < 0){
    //This means start comes later in week, so subtract dates to get to last week
    //This variable will be subtracted from current date later, so adding to it now will make it go back farther
    startDiff = startDiff + 7;
  }
  console.log('startDiff: ',startDiff);
  dateStart.setDate(dateStart.getDate()-startDiff);
  dateStart.setHours(intStart.hour);
  dateStart.setMinutes(intStart.minute);
  console.log('dateStart is: ', dateStart);
  var dateDiff = today - dateStart;
  console.log('dateDiff: ',dateDiff);
  //may be possible to use dateDiff to check 

  
  var intDiff = intStop.day - intStart.day;
  //console.log('intDiff at first: ', intDiff);
  if(intDiff < 0){
    //This will be ADDED later, as looking for next instead of previous
    intDiff = intDiff + 7;
  }
  var dateStop = new Date(dateStart.valueOf());
  dateStop.setDate(dateStart.getDate()+intDiff);
  dateStop.setHours(intStop.hour);
  dateStop.setMinutes(intStop.minute);
  if(dateStop < dateStart){
    //If stop is sooner than start, then it occurs on the same day. If so, add a week for proper stop time
    dateStop.setDate(dateStop.getDate()+7);
  }
  if(dateStop === dateStart){
    dateStop.setMinutes(dateStop.getMinutes()-3);
    console.log('dateStop === dateStart, setting stop back 3 minutes. dateStop: ', dateStop);

  }
  console.log('dateStop is: ', dateStop);
  //pass found dates to callback
  //console.log('end of findIntDates, intStart and intStop: ',dateStart,dateStop);
  if(intType === 'next'){
    console.log('bumping int dates to find next')
    dateStart.setDate(dateStart.getDate()+7);
    dateStop.setDate(dateStop.getDate()+7);
  }
  var span = classroom.span;
  if(span.start){ var spanBegin = new Date(span.start.year, span.start.month, span.start.date)}
  if(span.end){ var spanEnd = new Date(span.end.year, span.end.month, span.end.date)}


  if(dateStop > spanEnd){dateStop = spanEnd};
  if(dateStart > spanEnd){
    dateStop='After Span';
    dateStart = 'After Span';
  }
  console.log('end of findIntDates. dateStart, dateStop, spanBegin, spanEnd: ',dateStart, dateStop, spanBegin, spanEnd);

	cb(dateStart, dateStop);
}


// function getRemTime(dateRem, adjDate){
//   var window = dateRem.valueOf()-adjDate.valueOf();
//   console.log('window: ', window);
//   if(window<86400000){
//     console.log('got under 24hrs between intStart and intStop');
//     dateRem = new Date(dateRem.valueOf() - (window/2));
//     console.log('split dateRem: ', dateRem);
//   }
//   else{
//     dateRem = new Date(dateRem.valueOf() - 86400000/2);
//     console.log('12hrs prior dateRem:', dateRem);
//   }
//   return dateRem;
// }



function findEmailTimes(classroom, cb){
  //use above function
	findIntDates(classroom, 'present', function(dateStart, dateStop){
    //Find Span dates for ultimate start and stop times
    //console.log('classroom in findEmailDates: ',classroom);
    console.log('findIntDates version of dateStart, dateStop:', dateStart, dateStop);
    console.log('span in findEmailDates:',classroom.span);
    var span = classroom.span;
    if(span.start){ var spanBegin = new Date(span.start.year, span.start.month, span.start.date)}
    if(span.end){ var spanEnd = new Date(span.end.year, span.end.month, span.end.date)}
		//Translate intStart and intStop to next/finished instances, aka dateReg and dateRem
		//Get time difference (intDelta) for later
		var dateReg;
    var dateRem;
    if(dateStart === 'After Span'){var dateReg = "After Span"}
    else{
      var dateReg = new Date(dateStart.valueOf())
  		, dateRem = new Date(dateStop.valueOf())
  		, intDelta = dateStop - dateStart
  		, now = new Date();
  		//advance regular time until it is both after now and the span start
  		while(dateReg <= now || dateReg <= spanBegin) {
  			dateReg.setDate(dateReg.getDate()+7);
        console.log('dateReg in setEmailDates: ', dateReg);
  		}
    }
    if(dateStop === 'After Span'){var dateRem = "After Span"}
    else{
      //Make adjDate, check to see if a given dateRem had an dateReg that was before spanBegin
      var adjDate = new Date(dateRem - intDelta);
      console.log('dateRem before manipulation: ', dateRem);
      while(dateRem <= now || adjDate <= spanBegin){
        console.log('adjDate in loop: ',adjDate);
        dateRem.setDate(dateRem.getDate()+7);
        adjDate = new Date(dateRem-intDelta);
      }
      //Dates are now after now and start
      //Now check they are before the span end
      if(dateReg > spanEnd){
        dateReg = "After Span";
      }
      //dateReg now good to be reported!
    

  		//console.log('adjDate: ',adjDate);

      //see if reminder has already been sent for the present interval. If so, advance things another week.
      if(classroom.maildeck){  
        if(classroom.maildeck.last){
          var doneThat = (classroom.maildeck.last.type === "reminder" && classroom.maildeck.last.time >= adjDate && classroom.maildeck.last.time < dateRem);
          console.log('classroom.maildeck.last.type : ',classroom.maildeck.last.type);
          console.log('classroom.maildeck.last.time',classroom.maildeck.last.time);
          console.log('dateReg and dateRem and adjDate: ',dateReg, dateRem, adjDate);
          console.log('classroom.maildeck.last.type === "reminder"?', classroom.maildeck.last.type === "reminder");
          console.log('classroom.maildeck.last.time >= dateReg?',classroom.maildeck.last.time >= dateReg);
          console.log('classroom.maildeck.last.time < dateRem?',classroom.maildeck.last.time < dateRem);
          console.log('classroom.maildeck.last.time < dateRem?',classroom.maildeck.last.time < dateRem);
          console.log('done that? : ', doneThat);
          if(doneThat){
            dateRem.setDate(dateRem.getDate()+7);
            adjDate = dateRem-intDelta;
          }
        }
      }
      //into dateRem, which is trickier...
      if(adjDate <= spanEnd){
        console.log('got adjDate < spanEnd');
        //this means reminder is valid
        //check to see if span will end it early
        if(dateRem > spanEnd){
          dateRem = new Date(spanEnd.valueOf());
          console.log('got dateRem < spanEnd, resetting dateRem = spanEnd');
        }
        var window = dateRem.valueOf()-adjDate.valueOf();
        console.log('window: ', window);
        if(window<86400000){
          console.log('got under 24hrs between intStart and intStop');
          dateRem = new Date(dateRem.valueOf() - (window/2));
          console.log('split dateRem: ', dateRem);
        }
        else{
          dateRem = new Date(dateRem.valueOf() - 86400000/2);
          console.log('12hrs prior dateRem:', dateRem);
        }
      }
      else{dateRem = "After Span"}
    }
    //
		console.log('end of findEmailTimes function Reg and Rem: ',dateReg,dateRem);
	  cb(doneThat, dateReg, dateRem);
	})
}

function saveEmailTimes(classroom, dateReg, dateRem){
  //In this section we want to set the found dates and return true
  console.log('saveEmailTimes dateReg and dateRem: ', dateReg, dateRem);
    Classroom.update({ _id: classroom._id }, { 'maildeck.regular': dateReg, 'maildeck.reminder':dateRem }).exec(function(err, num) {
      if(err) {
        console.log("Decklist reminder classroom error:", err); 
        res.send({success:false, message: "Classroom reminder update error:"+err})
        return false;
      }
      else if(!num) {
        console.log("Decklist reminder update error: No classes found");
        return false;
      }
      else {
        console.log("Decklist reminder update success! classroom.name, dateReg, dateRem: ",classroom.name, dateReg, dateRem);
        return true;
     }
    })
}

function setEmails(classroom){
  findEmailTimes(classroom, function(doneThat, dateReg, dateRem){
    saveEmailTimes(classroom, dateReg, dateRem);
  });
}

exports.setEmails = setEmails;
exports.findIntDates = findIntDates;
exports.findEmailTimes = findEmailTimes;

