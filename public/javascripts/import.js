$(document).ready(function() {
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
      var data = $.csv.toArray(csv);
         
      var html = '';
      var n = 0;
      for(var row in data) {
        html += '<tr><td>' + data[n] + '</td></tr>';
        n += 1;
      }
      $('#contents').html(html);
       $.post('/import', {emailarray: data}, function(res) {
        if(res.err) {console.log("Unable to save your response."); return false}
        else {
          // display success alert
          $('#main-container').append("<div class='alert alert-success'>"+
                        "<button type='button' class='close' data-dismiss='alert'>&times;"+
                        "</button><strong>Your file has been uploaded </strong></div>");
        }
       })
    }

  }  
});