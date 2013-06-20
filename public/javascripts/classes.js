// classes.js
// Handle class editing/creation

$(document).ready(function() {

	// change roster/survey div
	var setClassDiv = function(name) {
		// Render current class' roster/survey
		$.get('/class/roster', { className: name }, function(data) {
			if(data.err) { console.log("Unable to fetch roster.") }
			else {
				$(".roster").fadeOut("fast", function() {
					$(this).html(data).fadeIn("fast");
					// initialize new-survey popover
					$('button.roster-add').popover({trigger: 'click', html: true, placement: 'bottom'});
					$('.btn-remove').click(function() {
						var participant = $(this).parent().prev().text();
						console.log("participant: ", participant);
						$.post('/class/roster/remove', { participant: participant, className: name}, function(res) {
							if(res.err) {console.log("Unable to remove participant"); return false}
							else {
								if(res.success) {
									setClassDiv(name);
								}
							}
						});
					});
					activateRosterEdit();
				})
			}
		});
		$.get('/class/survey', { className: name }, function(data) {
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
		console.log("activate!");
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
    	  console.log("activate!2");
	      arrayafy(file);

	    } 

	    //saves the file into an array
	    function arrayafy(file) {
	      var reader = new FileReader();
	      reader.readAsText(file);
	      reader.onload = function(event){
	        var csv = event.target.result;
	        var data = $.csv;
	        var data1 = $.csv.toArray(csv);
	        console.log("data " + data);
	        $('textarea').html(data);   
	  //      var html = '';
	  //      var n = 0;
	  //      for(var row in data) {
	  //        html += + data[n] + ;
	  //        n += 1;
	  //      }
	  //      $('#contents').html(html);
	         $.post('/import', {emailarray: data1}, function(res) {
	  //        if(res.err) {console.log("Unable to save your response."); return false}
	  //       else {
	  //          // display success alert
	  //          $('#main-container').append("<div class='alert alert-success'>"+
	  //                        "<button type='button' class='close' data-dismiss='alert'>&times;"+
	  //                        "</button><strong>Your file has been uploaded </strong></div>");
	  //       }
	         })
	      }

	    }
	}  


});