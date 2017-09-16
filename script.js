$(function() {
    $("#create-game").click(function() {
	$("#root").load("waiting-room.html");
	$.getJSON( "/code-gen/", function( data ) {
	    $("#code").text(data);
	});
    });
});
