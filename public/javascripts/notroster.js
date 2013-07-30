// notroster.js

$(document).ready(function() {

	$('.btn-block').click(function() {
		var classID = $(this).attr('name');
		$.post('/class/request/add', { classID: classID }, function(res) {
			if (res.err) { console.log("Class add request error:", res.err); return false}
			else {
				if (res.success) {
					$('.btn').fadeOut('fast', function() {
						$('.thumbnail').append("<div class='alert alert-success margin'>"+
												"<button type='button' class='close' data-dismiss='alert'>&times;"+
												"</button><strong> Request sent! </strong>"+
												"</div>").fadeIn('fast');
					})
				}
			}
		})
	})

});