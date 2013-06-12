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
