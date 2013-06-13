// make_survey.js

$(document).ready(function() {

	var activateEdit = function() {

		$('.edit-link').mouseenter(function() {
			if (!$(this).hasClass('editing')) {
				$(this).append(' Edit?');
			}
			$(this).mouseleave(function() {
				if (!$(this).hasClass('editing')) {
					$(this).html('<i class="icon icon-edit"></i>');
				}
			});
		});

		$('.edit-link').click(function() {
			$('.edit-link').html('<i class="icon icon-edit"></i>');
			$('.editing').toggleClass('editing');
			$(this).html('<i class="icon icon-edit"></i> Editing');
			$(this).toggleClass('editing');
			setPagesDiv($(this).attr('name'));
		});
		
	}

	var setPagesDiv = function(name) {
		$('div.current-surv h3').fadeOut("fast", function() {
			$(this).html(name).fadeIn("fast");
		});
		$.get('/pages/current', {name: name}, function(data) {
			if(data.err) {console.log("Unable to get pages"); return false}
			else {
				$('div.margin.pages').fadeOut("fast", function() {
					$(this).html(data).fadeIn("fast");
				});
			}
		});
	}

	activateEdit();

	// initialize new-survey popover
	$('.btn-new').popover({trigger: 'click', html: true, placement: 'right'});

	$('.btn-new').click(function(){

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
								$('form.name-input').slideUp();
								setPagesDiv(survName);
								$.get('/surveys/all', function(data) {
									if (data.err) { console.log("Unable to update surveys"); return false}
									else {
										$('div.survey-container').fadeOut("fast", function() {
											$(this).html(data).fadeIn("fast", function() {
												$('tr:last td a.edit-link').append(" Editing").toggleClass("editing");
												activateEdit();
											});
										});
									}
								});
								
								$('.btn-new').popover("toggle");
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
	});

	// $('.btn-') // work on page creation here

})