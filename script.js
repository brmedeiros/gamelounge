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

    $("#p1-ready-btn").click(function() {
	$("#p1-ready").toggleClass("fa-question fa-check");
    });

    $("#p2-ready-btn").click(function() {
	$("#p2-ready").toggleClass("fa-question fa-check");
    });

});
