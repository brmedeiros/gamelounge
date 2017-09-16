$(function() {
    $("#create-new-game-btn").click(function() {
	$("#root").load("waiting-room.html", function() {
	    $.getJSON( "/code-gen/", function( data ) {
		$("#code").text(data);
	    });
	});
    });

    $("#join-game-btn").click(function() {
	$("#root").load("waiting-room.html", function() {
	    $("#start-game").remove();
	    $.getJSON( "/code-gen/", function( data ) {
		$("#code").text(data);
	    });
	});
    });
});
