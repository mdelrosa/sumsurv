$(document).ready(function() {
        $( ".slider" ).slider({
            value:100,
            min: 1,
            max: 7,
            step: 1,
            slide: function( event, ui ) {
                $( "#amount" ).val( "$" + ui.value );
            }
        });
        $( "#amount" ).val( "$" + $( "#slider" ).slider( "value" ) );
});
