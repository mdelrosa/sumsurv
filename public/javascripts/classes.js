// classes.js
// Handle class editing/creation

$(document).ready(function() {
	// Handle request popover
	var activateRequest = function(name) {
		$('button.requests').popover({trigger: 'click', html: true, placement: 'bottom', callback: popoverDismiss()});
		$('button.requests').click(function() {
			$('div.requests').html('<div class="progress progress-striped active">'+
			   '<div class="bar" style="width: 100%;"></div>'+
			   '</div>')
			$.get('/class/requests', { name: name }, function(data) {
				if(data.err) { console.log("Error in class requests:", data.err) }
				else {
					$('div.requests').html(data);
					$('.add-action').click(function() {
						var classID = $(this).parent().prev().children('p').attr('name')
							, $clicked = $(this);
						if ($clicked.attr('name') === "accept") {
							$.post('/class/roster/add', { userID: classID, className: name }, function(res) {
								if(res.err) {console.log("Class roster add error:", res.err); return false}
								else {
									if (res.success) {
										// create a deffered object
										var $dfd = $.Deferred()
											, remover = function(n) {
												n.remove("tr");
											}
											, roster = function(n) {
												$('table#table-roster').append('<tr><td>'+res.email+'</td><td><button class="btn btn-small btn-remove"><i class="icon-minus"></i> Remove</button></td></tr>');
												var reqNum = $('.table-requests tbody').children().length;
												if(reqNum === 0) {
													$('button.requests').popover('hide');
													$('button.requests').html('<i class="icon-globe"></i>  No Requests').toggleClass('btn-inverse');
												}
												else {
													word = (reqNum) ? " Request" : " Requests";
													$('button.requests').html('<i class="icon-globe icon-inverse"></i>  '+reqNum.toString()+word);
												}
											};
										$dfd.done(remover).done(roster);
										// ensure that tablecheck is performed after element is removed
										$clicked.parents("tr").fadeOut('fast', function() {
											$dfd.resolve(this);
										})
									}
								}
							});
						}
					});
				}
			});
		});
	}

	// Activate class deletion button and render appropriate html
	var setDeleteClass = function(name) {
		$('#class-delete').click(function() {
			$.post('/class/delete', {name: name}, function(res) {
				if(res.err) { console.log("Class delete error: ", res.err); return false }
				else if (res.success) {
					$('.roster').slideUp(function() {
						$(this).html('<h3 class="text-center"> Roster</h3>').slideDown('fast');
					});
					$('.survey').slideUp(function() {
						$(this).html('<h3 class="text-center"> Survey</h3>').slideDown('fast');
					});
					$('#class-header').fadeOut('fast', function() {
						$('#class-header').html("<h2 class='span6'> Current Class</h2>"+
												"<div class='offset1 span4 alert alert-success margin'>"+
												"<button type='button' class='close' data-dismiss='alert'>&times;"+
												"</button><strong> " + name + " </strong>"+
												"was deleted!</div>").fadeIn('fast');

					});
					$.get('/class/all', function(data) {
						if(data.err) { console.log("Unable to load all classes.") }
						else {
							$(".class-container").fadeOut("fast", function() {
								$(this).html(data).fadeIn("fast", function() {
									activateEdit();
								});
							})
						}
					});
				}
				else {
					$('#class-current').append("<div class='alert alert-success margin'>"+
											"<button type='button' class='close' data-dismiss='alert'>&times;"+
											"</button><strong> " + name + " </strong>"+
											"could not be deleted!</div>");

				}
			})
		});
	}

	// Activate set interval submission in popover
	var setDaySquare = function(name, editing) {
		var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
			, editingDay = null;
		$('.btn-interval').click(function() {
			var interval = {day: $('#select-day :selected').val(), hour: $('.hour-select :selected').val(), minute: $('.minute-select :selected').val(), time: $('.ampm-select :selected').val()};
			if (editing === "start") {
				$.post('/class/interval', { start: interval, className: name }, function(res) {
					if(res.err) { console.log("Class interval error: ", res.err); return false}
					else if (res.success) {
						$('.change-start').html(days[interval.day-1] + " @ " + interval.hour + ":" +interval.minute + " " + interval.time);
						return false
					} 
					else {
						console.log("Unable to save new start date");
						return false
					}
				});
			}
			else if (editing === "end") {
				$.post('/class/interval', { end: interval, className: name }, function(res) {
					if(res.err) { console.log("Class interval error: ", res.err); return false}
					else if (res.success) {
						$('.change-end').html(days[interval.day-1] + " @ " + interval.hour + ":" +interval.minute + " " + interval.time);
						return false
					} 
					else {
						console.log("Unable to save new end date");
						return false
					}
				});
			}
			$('a').popover('hide');
		});
	}

	// Change interval start/end days
	var setDate = function(name) {
		$('a').popover({trigger: 'click', html: true, placement: 'bottom', callback: popoverDismiss()});
		var editing = null
			, editingDay = null;
		$('.change-start').click(function() {
			editing = "start";
			setDaySquare(name, editing);
		});
		$('.change-end').click(function() {
			editing = "end";
			setDaySquare(name, editing);
		});
	}

	// Activate set interval submission in popover (this is span)
	var setSpanSquare = function(name) {
		//var editing = ($('a.btn.add-on.btn-inverse').attr('id') === 'startspan') ? "start" : "end";
		var d = new Date();
		$('.span-day').val(d.getDate());
		$('.span-month').val(d.getMonth()+1);
		$('.span-year').val(d.getFullYear());
		setDatePicker(name);
	}

	var setDatePicker = function(name){
		$('a.btn.add-on.btn-inverse').click(function(){
			var alldate = $(this).prev().val();
			var dateArr = alldate.split("/")
			, date = dateArr[1]
			, month = dateArr[0]-1
			, year = dateArr[2]
			, n = { date: date, month: month, year: year }
			var editing = ($(this).attr('id') === 'setstart') ? "start" : "end";
			$.post('/class/span/edit', { editing: editing, name: name, n: n }, function(res) {
					if (res.err) { console.log("Class span edit error:", req.err); return false }
					else {
						if (res.success) {
							console.log("yay");
							$('.span-'+editing).html((month+1).toString()+'/'+date.toString()+'/'+year.toString());
							$('.alert').remove();
							$('#main-container').append("<div class='alert alert-success'>"+
							 						"<button type='button' class='close' data-dismiss='alert'>&times;"+
							  						"</button><strong>Date set! </strong></div>");
							setInterval('5000', $('.alert').fadeOut('slow', function() {
							 	$(this).remove();	
							}));
						}
					}
			})
		})
	}
	// Change span start/end days
	var setSpanDate = function(name) {
		$('a').popover({trigger: 'click', html: true, placement: 'bottom', callback: popoverDismiss()});
		var editing = null
			, editingDay = null;
		$('.datepicker').datepicker();
		$('.datepicker2').datepicker();
		$('input.datepicker').val($('input.datepicker').attr('default-val'));
		$('input.datepicker2').val($('input.datepicker2').attr('default-val'));
		setSpanSquare(name);
	}

	// handle popover dismissal
	var popoverDismiss = function() {
		$('body').click('on', function(e) { $('.popper').each(function() {
				if(!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
					$(this).popover('hide');
				}
			})
		})
	}

	// change roster/survey div
	var setClassDiv = function(name) {
		// Render current class' roster/survey
		$('#class-header').fadeOut('fast', function() {
			$(this).html('<h2 class="span6"> ' + name + '</h2><div class="span6 btn-group pull-right"><a class="btn btn-info" href="/class/export?className='+name+'">Export Data </a><a class="btn btn-danger" id="class-delete"> Delete Class</a></div>').fadeIn('fast');
			setDeleteClass(name)
		});
		$.get('/class/roster', { className: name }, function(data) {
			if(data.err) { console.log("Unable to fetch roster.") }
			else {
				$(".roster").fadeOut("fast", function() {
					$(this).html(data).fadeIn("fast");
					// initialize new-survey popover
					$('button.roster-add').popover({trigger: 'click', html: true, placement: 'bottom', callback: popoverDismiss()});
					$('.btn-remove').click(function() {
						var participant = $(this).parent().prev().text()
							, parentRow = $(this).parent().parent();
						$.post('/class/roster/remove', { participant: participant, className: name}, function(res) {
							if(res.err) {console.log("Unable to remove participant"); return false}
							else {
								if(res.success) {
									parentRow.fadeOut('fast');
								}
							}
						});
					});
					activateRosterEdit();
					activateRequest(name);
					sendemail();
				})
			}
		});
		$.get('/class/survey', { className: name }, function(data) {
			if(data.err) { console.log("Unable to fetch survey.") }
			else {
				$(".survey").fadeOut("fast", function() {
					$(this).html(data).fadeIn("fast");
					$('.btn-surv-select').click(function() {
						var selectedSurv = $('select option:selected').html();
						$.post('/class/survey/update', { className: name, survey: selectedSurv}, function(res) {
							if(res.err) { console.log("Unable to update class survey: ", res.err); return false}
							else {
								if(res.success) {
									$('h4#surv-name').fadeOut('fast', function() {
										$(this).html(selectedSurv).fadeIn('fast')
									});
								}
							}
						});
					});
					$('.response-square').tooltip({html: true, placement: 'top', trigger: 'hover'});
					setDate(name);
					setSpanDate(name);
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
			$(this).parent().prev().toggleClass('editing');
			setClassDiv($(this).attr('name'));
		});
	}

	// activate roster jquery
	var activateRosterEdit = function() {
		$('.roster-add').click(function() {
			activateImport();
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
					var rosterAdd = csvRoster.split(", ");
					var className = $('td.editing').html();
					console.log("classname", className);
					$.post('/class/roster/update', {rAdd: rosterAdd, name: className}, function(res) {
						if(res.err) { console.log("Error posting roster"); return false}
						else {
							if(res.success) {
								console.log("Success!");
								// Add get that renders roster
								setClassDiv($("a.editing").attr("name"));
								$('.roster-add').popover("toggle");
							}
						}
					})
					
				}
			});
		});
	}

	//sends email to the list
	var sendemail = function(){
		$('.send-email').click(function() {
			$('.container1').append("<div class='progress progress-striped active'>"+
  								 "<div class='bar' style='width: 100%;''></div>" +
								 "</div>");
			var className = $('td.editing').html();
			console.log("outside");
			$.get('/mail/send', { name: className }, function(data) {
				console.log("it works?");
				if(data.err) { 
					console.log("Unable to send survey to mailer.");
					$('.progress-striped').remove(); 
					$('.container1').append("<div class='alert alert-error'>"+
											"<button type='button' class='close' data-dismiss='alert'>&times;"+
											"</button><strong>Fail to send </strong>"+
											"Something is wrong.</div>");
				}
				else {
					console.log("it works!");
					$('.progress-striped').remove();
					$('.container1').append("<div class='alert alert-success'>"+
											"<button type='button' class='close' data-dismiss='alert'>&times;"+
											"</button><strong>Email sent! </strong>"+
											"The survey has been sent.</div>");
				}
			});
		});
	}

	// Activate jquery for importing roster
	var activateImport = function() {
		if(isAPIAvailable()) {
	      $('#files').bind('change', handleFileSelect);
	    }

	    function isAPIAvailable() {
	      // Check for the various File API support.
	      if (window.File && window.FileReader && window.FileList && window.Blob) {
	        // File APIs supported.
	        return true;
	      } else {
	        document.writeln("Looks like this isn't supported in your version of the browser.");
	        return false;
	      }
	    }

	    function handleFileSelect(evt) {
	      var files = evt.target.files; // FileList object
	      var file = files[0];

	    // read the file metadata
	      var output = ''
	          output += '<span style="font-weight:bold;">' + escape(file.name) + '</span><br />\n';
	      arrayafy(file);

	    } 

	    //saves the file into an array
	    function arrayafy(file) {
	      var reader = new FileReader();
	      reader.readAsText(file);
	      reader.onload = function(event){
	        var csv = event.target.result;
	        $('textarea').html(csv);   
	      }

	    }
	}

	activateEdit();

	// initialize new-class popover
	$('.btn-new').popover({trigger: 'click', html: true, placement: 'right', callback: popoverDismiss()});


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
											$('tr:last td:first').toggleClass("editing");
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
	
	var activateImport = function() {
		if(isAPIAvailable()) {
	      $('#files').bind('change', handleFileSelect);
	    }

	    function isAPIAvailable() {
	      // Check for the various File API support.
	      if (window.File && window.FileReader && window.FileList && window.Blob) {
	        // File APIs supported.
	        return true;
	      } else {
	        document.writeln("Looks like this isn't supported in your version of the browser.");
	        return false;
	      }
	    }

	    function handleFileSelect(evt) {
	      var files = evt.target.files; // FileList object
	      var file = files[0];

	    // read the file metadata
	      var output = ''
	          output += '<span style="font-weight:bold;">' + escape(file.name) + '</span><br />\n';
	      arrayafy(file);
	    } 

	    //saves the file into an array
	    function arrayafy(file) {
	      var reader = new FileReader();
	      reader.readAsText(file);
	      reader.onload = function(event){
	        var csv = event.target.result;
	        var data = $.csv;
	        // var data1 = $.csv.toArray(csv);
	        console.log("data: ", data);
	        console.log("csv: ", csv);
	        $('textarea').html(csv);   
	      }

	    }
	}  

});
