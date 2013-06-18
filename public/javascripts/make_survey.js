// make_survey.js

$(document).ready(function() {

	// activate jquery functions on edit buttons
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

	// change survey div
	var setPagesDiv = function(name) {
		$('div.current-surv h3').fadeOut("fast", function() {
			$(this).html(name).fadeIn("fast");
		});
		$.get('/pages/current', {name: name}, function(data) {
			if(data.err) {console.log("Unable to get pages"); return false}
			else {
				$('div.margin.pages').fadeOut("fast", function() {
					$(this).html(data).fadeIn("fast");
					pageAdd();
				});
			}
		});
	}

	// initialize page adding button
	var pageAdd = function() {
		$('.add-page').click(function() {
			$('.page-name').html('<div class="form-inline name-input"><input class="input-small" type="text" placeholder="Page Name"></input><button class="btn btn-pagename"><i class="icon-check"></i> Enter</button></div>').fadeIn("fast");
			$('.page-type').html('<div class="form-inline"><select><option>Multiple Choice</option><option>Radio Scale</option><option>Text</option></select><button class="btn btn-pageinfo"><i class="icon-check"></i> Enter</button></div>')
		})
	}

	var pageCreate = function() {

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

	$('.btn-pagename').click(function() {
		$()
	});

});