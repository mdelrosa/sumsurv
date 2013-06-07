// survey.js
// Handle acreating/editing/submitting survey objects

var Models = require('../models/models')
	, Response = Models.response;

exports.save_response = function(req, res) {
	console.log(req.body)
	Response.find().exec(function(err, response_db) {
		if(err) {console.log('Unable to find responses'); return false}
		var newID = response_db.length;
		console.log('newID', newID);
		var new_response = new Response({id: newID, results: req.body.results});
		new_response.save(function(err) {
			if(err) {
				console.log('Unable to save response');
			 	res.send({success:false})
			 	return false;
			}
			console.log('Successfully saved new response!');
			res.send({success:true});
		})	
	})	
	
}

//parseCSV and download to computer
function parseCSV(str) {
    var arr = [];
    var quote = false;  // true means we're inside a quoted field

    // iterate over each character, keep track of current row and column (of the returned array)
    var row;
    var col;
    var c;
    for (row = col = c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c+1];        // current character, next character
        arr[row] = arr[row] || [];             // create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }  

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline and we're not in a quoted field, move on to the next
        // row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}


exports.exportcsv1 = function(req, res){
    Response.find({},function(err, response_db){
    	var csvstr = [' , Id, Question1, Question2, Question3, Question4, Question5, Question6, Question7, Question8, Question9, Question10, Question11, Question12, Question13, Question14, Question15, Question16, '];
    	for(i=1; i < response_db.length+1; i++) {
			csvstr[i] = " ," + response_db[i-1].id + "," + response_db[i-1].results.join(",") + ", ";
		}
        res.header('Content-type', 'text/csv');
        res.send(csvstr);
        console.log(csvstr);
    });
};

