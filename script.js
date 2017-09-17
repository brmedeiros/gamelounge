$(function() {
    $("#create-new-game-btn").click(function() {
	$("#root-home").load("waiting-room.html", function() {
	    $.getScript("/script.js");
	    $.getJSON( "/code-gen/", function( data ) {
		$("#code").text(data);
	    });
	});
    });

    $("#join-game-btn").click(function() {
	$("#root-home").load("waiting-room.html", function() {
	    $.getScript("/script.js");
	    $("#start-game").remove();
	    $.getJSON( "/code-gen/", function( data ) {
		$("#code").text(data);
	    });
	});
    });

    $(function() {
	$("#back-btn").click(function() {
	    $("#root-waiting-room").load("home.html");
	    // $.getScript("/script.js");
	});
    });
});
