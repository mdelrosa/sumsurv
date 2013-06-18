// classes.js
// Handle class editing/creation

$(document).ready(function() {

	// change roster/survey div
	var setClassDiv = function(name) {
		// Render current class' roster/survey
		$.get('/class/roster', { name: name }, function(data) {
			if(data.err) { console.log("Unable to fetch roster.") }
			else {
				$(".roster").fadeOut("fast", function() {
					$(this).html(data).fadeIn("fast");
					// initialize new-survey popover
					$('button.roster-add').popover({trigger: 'click', html: true, placement: 'bottom'});
					activateRosterEdit();
				})
			}
		});
		$.get('/class/survey', { name: name }, function(data) {
			if(data.err) { console.log("Unable to fetch survey.") }
			else {
				$(".survey").fadeOut("fast", function() {
					$(this).html(data).fadeIn("fast");
				})
			}
		});
	}

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
			setClassDiv($(this).attr('name'));
		});
	}

	// activate roster jquery
	var activateRosterEdit = function() {
		$('.roster-add').click(function() {
			$('.btn-text-roster').click(function() {
				$('.alert').remove();
				var csvRoster = $('textarea').val();
				if (csvRoster.length === 0) {
					$('div.roster-add').append("<div class='alert margin'>"+
											"<button type='button' class='close' data-dismiss='alert'>&times;"+
											"</button><strong>Oops! </strong>"+
											"You didn't enter anything!</div>");
				}
				else {
					$.post('/class/roster/update', {csvRoster})
				}
			});
		});
	}

	activateEdit();

	// initialize new-class popover
	$('.btn-new').popover({trigger: 'click', html: true, placement: 'right'});

	// name new class
	$('.btn-new').click(function() {
		$('.btn-name').click(function() {

			$('div.alert').remove();

			var className = $('.class-name').val();
			if (className.length > 0) {
				$.post('/class/create', {name: className}, function(res) {
					if (res.err) { console.log("Unable to create new class."); return false}
					else {
						if (res.success) {
							// Do success stuff here (render partials, initialize new elements' jquery)
							$.get('/class/all', function(data) {
								if(data.err) { console.log("Unable to load all classes.") }
								else {
									$(".class-container").fadeOut("fast", function() {
										$(this).html(data).fadeIn("fast", function() {
											$('tr:last td a.edit-link').append(" Editing").toggleClass("editing");
											activateEdit();
										})
									})
								}
							});
							setClassDiv(className);
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
										"You need to enter a name!</div>");
			}
		});
	});

});