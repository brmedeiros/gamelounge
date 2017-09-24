$(function() {

    $("#create-new-game-btn").click(function() {
    	$("#root-home").load("waiting-room.html", function() {
    	    $.getJSON( "/code-gen/", function( data ) {
    		$("#code").text(data);
    		});
    	});
    });

    $("#join-game-btn").click(function() {
    	$("#root-home").load("waiting-room.html", function() {
    	    $("#start-game").remove();
    	    $.getJSON( "/code-gen/", function( data ) {
    		$("#code").text(data);
    	    });
    	});
    });

    $("#back-btn").click(function() {
    	$("#root-waiting-room").load("home.html");
    });

});
