// participating.js
// clientside script for participating page

$(document).ready(function() {
	var updateActivate = function() {
		$('a.add-on').click(function() {
			var type = $(this).attr('id') //button id
				, val = $(this).prev().children(':selected').val(); //selected val
			console.log("add-on here")
			$.post('/user/info/update', { type: type, value: val }, function(res) {
				if (res.err) { console.log("User update info error:", res.err); return false}
				else {
					if(res.success) {
						$('a.add-on#'+type).parent().replaceWith('<a class="edit-info" id=+'+type+'+>'+val+'</a>');
						editActivate();
					}
				}
			})
		});
	}

	var editActivate = function() {
		$('.btn-info').tooltip();
		$('.edit-info').click(function() {
			if ($(this).attr('id') === "year") {
				var html = '<div class="input-append"><select id="appendedInput">'+
						   '<option value="First-year">First-year</option>'+
						   '<option value="Sophomore">Sophomore</option>'+
						   '<option value="Junior">Junior</option>'+
						   '<option value="Senior">Senior</option>'+
						   '</select><a class="btn add-on" id="year">Ok!</a></div>';
			};
			if ($(this).attr('id') === "gender") {
				var html = '<div class="input-append"><select id="appendedInput">'+
						   '<option value="Male">Male</option>'+
						   '<option value="Female">Female</option>'+
						   '<option value="N/A">Care not to specify</option>'+
						   '</select><a class="btn add-on" id="gender">Ok!</a></div>';
			}
			$(this).replaceWith(html);
			updateActivate();
		});
	}
	updateActivate();
	editActivate();

});