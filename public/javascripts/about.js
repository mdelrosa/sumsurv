// about.js

$(document).ready(function() {

	$('.thumb-sub').hide();

	$('.about-img').mouseenter(function() {
		$(this).animate({ width: "+=20", height: '+=20' });
		$(this).next().show('fast');
	}).mouseleave(function() {
		$(this).animate({ width: "-=20", height: '-=20'})
		$(this).next().hide('fast');
	})

	var widthSet = function() {
		var newWidth = $('img.about-img').parent().width()*.8;
		$('img.about-img').css({'height':newWidth+'px','width':newWidth+'px'});
	}

	widthSet();

	$(window).resize(function(){console.log("resized");widthSet()})
});