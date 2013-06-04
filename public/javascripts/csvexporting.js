
$(document).ready(function{
	//the link to export/csv is opened
	$.get('/export/csv', function(res) {
				if(res.err) {console.log("Unable to download csv file."); return false}
				else {
					//downloads csv file
					var myWindow = window.open(res.csvstring);
					myWindow.focus();	
					});
				}
			});

})