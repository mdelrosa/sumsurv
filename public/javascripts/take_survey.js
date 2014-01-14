// take_survey.js

$(document).ready(function() {

	$('body').click(function() {
		var checkDirty = checkInputs()
			, check = checkDirty[0]
			, num = 0;
		for (i=0;i<check.length-1;i++) {
			if(check[i]!==undefined) {
				num = num + 1;
			}
		}
		var percent = num/(check.length-1)*100;
		if(percent!==100) {
			$('.bar').css('width', percent.toString()+"%");
		}
		else {
			$('.bar').css('width', "100%");
			$('.progress').addClass('progress-success').removeClass('active');
		}
	});

	// Handle tab switching
	$('#myTab li a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	  if ($(this).parent().hasClass('incomplete')) {
	  	$(this).parent().toggleClass('incomplete');
	  }
	});

	// Activate internal tab buttons
	$('.tab-control a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
		// Clicking on internal tab buttons also switches active tab button
		var href = $(this).attr('href');
		if (href) {
			$('#myTab li.active').toggleClass('active');
			$('#myTab li a[href='+href+']').parent().toggleClass('active');
		}
	});

	// Handle survey submission
	$('a#submitform').click(function() {

		$('div.alert').remove();

		var resultsArray = checkInputs(),
			results = resultsArray[0],
			$radioQuest = resultsArray[1][1];

		if (results.indexOf(undefined) > -1) {
			// survey was not completed, notify user
			$('#survey-container').append("<div class='alert'>"+
									"<button type='button' class='close' data-dismiss='alert'>&times;"+
									"</button><strong>Oops! </strong>"+
									"You missed some questions!</div>");

			// Highlight unanswered questions
			var unanswered = findAllOccurrences(undefined, results)
				, highlightTabId = [];
			for (i=0;i<unanswered.length;i++) {
				if (unanswered[i] === 0) {
					highlightTabId.push('status');
				}
				else if (unanswered[i] <= $radioQuest.length) {
					$('tr#question'+unanswered[i].toString()).toggleClass('warning', 250);
					highlightTabId.push('questions');
				}
				else {
					highlightTabId.push('comments');
				}
			}

			// Highlight unfinished tabs

			highlightTabId = highlightTabId.getUnique();
			// var $highlightSelectors = $('ul.nav-pills').children('a');
			$('a[data-toggle]').setParentClass(highlightTabId);

			// Set alert to fade out
			setTimeout(function(){
				$('.alert').fadeOut('slow');
			}, 3000);

		} 

		else {
			var dateObj = new Date()
				, date = { year: dateObj.getFullYear(), month: dateObj.getMonth()+1, day: dateObj.getDay()+1, date: dateObj.getDate() }
				, time = { hour: dateObj.getHours(), minutes: dateObj.getMinutes(), seconds: dateObj.getSeconds()}
				, info = new Object();
			info["owner"] = $('span#owner').attr('name');
			info["className"] = $('span#className').attr('name');
			// Grab demographic info
			var demo = new Array;
			demo[0] = $('#demo #gender').attr('name');
			demo[1] = $('#demo #year').attr('name');
			// survey was completed, post survey
			$.post('/survey/success', {results: demo.concat(results), date: date, info: info, time: time}, function(res) {
				if(res.err) {console.log("Unable to save your response."); return false}
				else {
					// collapse form
					$('#survey-container').slideUp(function() {
						// display success alert
						$('#main-container').append("<div class='alert alert-success'>"+
												"<button type='button' class='close' data-dismiss='alert'>&times;"+
												"</button><strong>Thank You for completing this week’s motivation survey! </strong>"+
												"<br>We appreciate your input, and we look forward to hearing from you again next week."+
												"<br><a class='btn btn-danger' href='/logout'> Log Out </a></div>");
					});
				}
			});
		}
	});

	// Table row formatting //

	// Toggle warning class on table rows
	$('tr.question').click(function() {
		if ($(this).hasClass('warning')) {
			$(this).toggleClass('warning');
		}
	});

	// --Helper Functions-- //

	// Find all of element in array
	var findAllOccurrences = function(element, array) {
		var indices = [];
		var idx = array.indexOf(element);
		while (idx != -1) {
		    indices.push(idx);
		    idx = array.indexOf(element, idx + 1);
		}
		return indices;
	}

	// Get same array with unique elements
	Array.prototype.getUnique = function(){
		var u = {}, a = [];
	    for(var i = 0, l = this.length; i < l; ++i){
	      	if(u.hasOwnProperty(this[i])) {
	         	continue;
	      	}
	        a.push(this[i]);
	        u[this[i]] = 1;
	   }
	   return a;
	}

	// Check all inputs in survey
	var checkInputs = function() {
		var $statusQuest = $('textarea.status-text')
		, $radioQuest = $('form tr.question')
		, $comments = $('textarea.comment-text')
		, results = new Array
		, questionArray = [$statusQuest, $radioQuest, $comments];

		// ** NOTE: Each of these for loops will most likely become a helper **
		// ** function once we write the generalized code **

		// Status tab
		if ($statusQuest.val().length === 0) {
			results.push(undefined);
		}
		else {
			results.push($statusQuest.val());
		}

		// Questions tab
		for (i=0;i<$radioQuest.length;i++) {
			// grab questions from table
			var answers = $radioQuest[i].getElementsByTagName('input'),
				res = undefined;
			
			//find checked button in response
			for (j=0;j<answers.length;j++) {
				if (answers[j].checked) {
					res = j+1;
				}
			}
			results.push(res);
		}

		// Comments tab
		if ($comments.val().length === 0) {
			results.push("Admin None");
		}
		else {
			results.push($comments.val());
		}

		return [results, questionArray]
	}

	// Find parent particular parent element w/ id and highlight it

	$.fn.setParentClass = function(idArray) {
		if (this.length > 1) {
			for (j=0;j<this.length;j++) {
				for (i=0;i<idArray.length;i++) {
					if (this[j].href.indexOf('#'+idArray[i]) > -1) {
						this[j].parentNode.className += " incomplete";
					}
				}
			}
		}
		else if (this.length === 1) {
			for (i=0;i<idArray.length;i++) {
				if (this[j].href.indexOf('#'+idArray[i]) > -1) {
					this[j].parentNode.className += " incomplete";
				}
			}	
		}
	};

});