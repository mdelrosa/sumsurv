// survey.js
// Handle acreating/editing/submitting survey objects

var Models = require('../models/models')
	, Response = Models.response
    , Emaillist = Models.emaillist;

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

//This function takes away commas to prevent issues in csv
String.prototype.sliceCharacterFromString = function(char)  {
        	var i = 0
            	, newString = "";
	        while (i < this.length) {
    	        if (this[i] !== char) {
        	        newString = newString + this[i];
            	}
            	else {
            		newString = newString + '|>';
            	}
	            i = i + 1;
	        }
    	    return newString
}

function decommafy(str) {
	return str.sliceCharacterFromString(",");	

}

exports.exportcsv1 = function(req, res){
    Response.find({},function(err, response_db){
    	var csvstr = [' , Id, Gender, Year, Status, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Comment, '];    	
    	for(i=1; i < response_db.length+1; i++) {
    		response_db[i-1].results[2] = decommafy(response_db[i-1].results[2]);
    		response_db[i-1].results[19] = decommafy(response_db[i-1].results[19]);
			csvstr[i] = " ," + response_db[i-1].id + "," + response_db[i-1].results.join(",") + ", ";
		}
        res.header('Content-type', 'text/csv');
        res.send(csvstr);
    });
};


exports.import = function(req, res) {
    Emaillist.find().exec(function(err, emaillist_db) {
        if(err) {console.log('Unable to find responses'); return false}
        var new_emaillist = new Emaillist({emailarray: req.body.emailarray});
        new_emaillist.save(function(err) {
            if(err) {
                console.log('Unable to save response');
                res.send({success:false})
                return false;
            }
            console.log('Successfully obtained emails!');
            res.send({success:true});
        })  
    })  
}
