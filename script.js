var joinOrCreated;

function loadHome() {
    $("#root").load("home.part.html", function() {
	$("#create-new-game-btn").click(function() {
	    joinOrCreated = this.id;
	    loadWaitingRoom();
	});
	$("#join-game-btn").click(function() {
	    joinOrCreated = this.id;
	    loadWaitingRoom();
	});
    });
}

function loadWaitingRoom() {
    $("#root").load("waiting-room.part.html", function() {
	waitingRoomDefaultBehavior();
	if (joinOrCreated == "create-new-game-btn") {
	    $("#join-waiting").remove();
     	    $.getJSON( "/new-room/", function( data ) {
     		$("#code").text(data);
     	    });
	} else if (joinOrCreated == "join-game-btn") {
	    $("#game-code").remove();
 	    $("#start-game").remove();
	}
    });
}

function waitingRoomDefaultBehavior() {
    $("#back-btn").click(function() {
	loadHome();
    });
    $("#p1-ready-btn").click(function() {
	$("#p1-ready").toggleClass("fa-question fa-check");
    });

    $("#p2-ready-btn").click(function() {
	$("#p2-ready").toggleClass("fa-question fa-check");
    });
}

$(function() {
    loadHome();
 });
