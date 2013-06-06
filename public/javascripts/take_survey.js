// take_survey.js

$(document).ready(function() {

	// Handle tab switching
	$('#myTab li a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	});

	// Handle survey submission
	$('a#submitform').click(function() {

		$('div.alert').remove();

		var $demoQuest = $('form table.table-question')
			, $statusQuest = $('textfield.status-text')
			, $radioQuest = $('form tr.question')
			, results = new Array;

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
					res = answers[j].getAttribute("text");
				}
			}
			results.push(res);
		}

		// Status tab
		console.log('Status text',$('textarea.status-text').val());

		// Questions tab
		for (i=0;i<$radioQuest.length;i++) {
			// grab questions from table
			var answers = $radioQuest[i].getElementsByTagName('input'),
				res = undefined;
			
			//find checked button in response
			for (j=0;j<answers.length;j++) {
				if (answers[j].checked) {
					res = j;
				}
			}
			results.push(res);
		}

		// Comments tab
		console.log('comments', $('textarea.comments-text').val())

		if (results.indexOf(undefined) > -1) {
			// survey was not completed, notify user
			$('#survey-container').append("<div class='alert'>"+
									"<button type='button' class='close' data-dismiss='alert'>&times;"+
									"</button><strong>Oops! </strong>"+
									"You missed some questions!</div>");

			// Highlight unanswered questions
			var unanswered = findAllOccurrences(undefined, results);
			for (i=0;i<unanswered.length;i++) {
			$('tr#question'+unanswered[i]).toggleClass('warning', 250)
				$('tr#question'+unanswered[i]).toggleClass('warning', 250)
			}

			// Highlight unfinished tabs

			// var highlightId = $('tr.question').parents('div.tab-pane').map(function(){return this.id}).get()[0];
			// $('li').on( function() {
			// 	if $((this).attr('href') === highlightId) {

			// 	}
			// });

			// Set alert to fade out
			setTimeout(function(){
				$('.alert').fadeOut('slow');
			}, 3000);

		} 

		else {
			// survey was completed, post survey
			$.post('/survey/success', {results: results}, function(res) {
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
		    indices.push(idx+1);
		    idx = array.indexOf(element, idx + 1);
		}
		return indices;
	}

	// Find parent particular parent element w/ id and highlight it

	// $.fn.setParentAttr = function(attr, val, selector) {
	// 	this.parents(selector).map({return this}).get()[0].attr(attr, val);
	// };

});