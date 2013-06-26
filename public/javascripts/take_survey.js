// take_survey.js

$(document).ready(function() {

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
			$demoQuest = resultsArray[1][0],
			$radioQuest = resultsArray[1][2];

		if (results.indexOf(undefined) > -1) {
			// survey was not completed, notify user
			$('#survey-container').append("<div class='alert'>"+
									"<button type='button' class='close' data-dismiss='alert'>&times;"+
									"</button><strong>Oops! </strong>"+
									"You missed some questions!</div>");

			// Highlight unanswered questions
			var unanswered = findAllOccurrences(undefined, results)
				, highlightTabId = [];
			console.log(unanswered)
			for (i=0;i<unanswered.length;i++) {
				if (unanswered[i] < $demoQuest.length) {
					$('div.table-question table').children().toggleClass('warning', 250);
					highlightTabId.push('demographic');
				}
				else if (unanswered[i] < $demoQuest.length + 1){
					highlightTabId.push('status');
				}
				else if (unanswered[i] < $demoQuest.length + 1 + $radioQuest.length) {
					$('tr#question'+(unanswered[i]-$demoQuest.length).toString()).toggleClass('warning', 250);
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
				, info = new Object();
			info["owner"] = $('span#owner').attr('name');
			info["className"] = $('span#className').attr('name');
			// survey was completed, post survey
			console.log(info);
			$.post('/survey/success', {results: results, date: date, info: info}, function(res) {
				if(res.err) {console.log("Unable to save your response."); return false}
				else {

					// collapse form
					$('#survey-container').slideUp(function() {
						// display success alert
						$('#main-container').append("<div class='alert alert-success'>"+
												"<button type='button' class='close' data-dismiss='alert'>&times;"+
												"</button><strong>Thank You! </strong>"+
												"Your cooperation is sincerely appreciated!</div>");
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
		var $demoQuest = $('div.table-question table')
		, $statusQuest = $('textarea.status-text')
		, $radioQuest = $('form tr.question')
		, $comments = $('textarea.comment-text')
		, results = new Array
		, questionArray = [$demoQuest, $statusQuest, $radioQuest, $comments];

		// ** NOTE: Each of these for loops will most likely become a helper **
		// ** function once we write the generalized code **

		// Demographic tab
		for (i=0;i<$demoQuest.length;i++) {
			// grab demographic responses
			var answers = $demoQuest[i].getElementsByTagName('input'),
				res = undefined

			//find checked button in response
			for (j=0;j<answers.length;j++) {
				if (answers[j].checked) {
					res = answers[j].value;
				}
			}
			results.push(res);
		}

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