// make_survey.js

$(document).ready(function() {
	$('.btn-name').click(function() {
		if (!$('input.survey-name').val()) {
			console.log("I got nothin.");
			$('div.name-div').append("<div class='alert margin'>"+
									"<button type='button' class='close' data-dismiss='alert'>&times;"+
									"</button><strong>Oops! </strong>"+
									"You need to enter a name!</div>");
		}
		else {
			var survName = $('input.survey-name').val();
			console.log("I got a name.")
			$('div.name-input').slideUp();
			$('div.name-div h3').fadeOut("slow", function() {
				$(this).html(survName).fadeIn("slow");
			})
		}
	})


})