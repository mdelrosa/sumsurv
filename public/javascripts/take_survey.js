// take_survey.js

$(document).ready(function() {

	// Handle survey submission
	$('a#submitform').click(function() {

		$('div.alert').remove();

		var $radioQuest = $('form tr.question')
			results = new Array;

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

		if (results.indexOf(undefined) > -1) {
			// survey was not completed, notify user
			$('#alertDiv').append("<div class='alert'>"+
									"<button type='button' class='close' data-dismiss='alert'>&times;"+
									"</button><strong>Oops! </strong>"+
									"You missed some questions!</div>");

			var unanswered = findAllOccurrences(undefined, results);
			for (i=0;i<unanswered.length;i++) {
				$('tr#question'+unanswered[i]).toggleClass('warning', 250);

			}

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
					$('form#surveyform').slideUp(function() {
						// display success alert
						$('#formHolder').append("<div class='alert alert-success'>"+
												"<button type='button' class='close' data-dismiss='alert'>&times;"+
												"</button><strong>Thank You! </strong>"+
												"Your cooperation is sincerely appreciated!</div>");
					});
				}
			});
		}
	});

	// Toggle warning class on table rows
	$('tr.question').click(function() {
		if ($(this).hasClass('warning')) {
			$(this).toggleClass('warning');
		}
	})

	// --Helper Functions-- //

	var findAllOccurrences = function(element, array) {
		var indices = [];
		var idx = array.indexOf(element);
		while (idx != -1) {
		    indices.push(idx+1);
		    idx = array.indexOf(element, idx + 1);
		}
		return indices;
	}


});