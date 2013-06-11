// make_survey.js

$(document).ready(function() {

	$('.btn-name').click(function() {

		$('div.alert').remove();

		if (!$('input.survey-name').val()) {
			$('div.name-div').append("<div class='alert margin'>"+
									"<button type='button' class='close' data-dismiss='alert'>&times;"+
									"</button><strong>Oops! </strong>"+
									"You need to enter a name!</div>");
		}
		else {
			var survName = $('input.survey-name').val();
			if (survName.length > 0) {
				$.post('/survey/create', {name: survName} , function(res) {
					if(res.err) {console.log("Unable to create your survey"); return false}
					else {
						if (res.success === true) {
							// Add survey editing options to page
							console.log("Succesfully saved survey");
							$('div.name-input').slideUp();
							$('div.name-div h3').fadeOut("slow", function() {
								$(this).html(survName).fadeIn("slow");
							});
						}
						else {
							$('div.name-div').append("<div class='alert margin'>"+
													"<button type='button' class='close' data-dismiss='alert'>&times;"+
													"</button><strong>Oops! </strong>"+
													res.message+
													"</div>")
						}
					}
				});
			}
			else {
				$('div.name-div').append("<div class='alert margin'>"+
						"<button type='button' class='close' data-dismiss='alert'>&times;"+
						"</button><strong>Oops! </strong>"+
						"You did not enter a name!</div>")
			}
		}
	});


})