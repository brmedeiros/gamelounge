$(function() {

    $.getScript("script.js");

    $("#create-new-game-btn").click(function() {
    	$("#root").load("waiting-room-content.html", function() {
	    $("#join-waiting").remove();
    	    $.getJSON( "/code-gen/", function( data ) {
    		$("#code").text(data);
    	    });
    	});
    });

    $("#join-game-btn").click(function() {
    	$("#root").load("waiting-room-content.html", function() {
	    $("#game-code").remove();
    	    $("#start-game").remove();
    	    $.getJSON( "/code-gen/", function( data ) {
    		$("#code").text(data);
    	    });
	});
    });

    $("#back-btn").click(function() {
	$("#root").load("home-content.html");
    });

});
