var joinOrCreated;

function loadHome() {
    $("#root").load("home-content.html", function() {
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
    $("#root").load("waiting-room-content.html", function() {
	waitingRoomDefaultBehavior();
	if (joinOrCreated == "create-new-game-btn") {
	    $("#join-waiting").remove();
     	    $.getJSON( "/code-gen/", function( data ) {
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

    // $("#create-new-game-btn").click(function() {
    // 	$("#root").load("waiting-room-content.html", function() {
    // 	    $("#join-waiting").remove();
    // 	    $.getJSON( "/code-gen/", function( data ) {
    // 		$("#code").text(data);
    // 	    });
    // 	});
    // });

    // $("#join-game-btn").click(function() {
    // 	$("#root").load("waiting-room-content.html", function() {
    // 	    $("#game-code").remove();
    // 	    $("#start-game").remove();
    // 	    $.getJSON( "/code-gen/", function( data ) {
    // 		$("#code").text(data);
    // 	    });
    // 	});
    // });

    // $("#back-btn").click(function() {
    // 	$("#root").load("home-content.html");
    // });

    // $("#p1-ready-btn").click(function() {
    // 	$("#p1-ready").toggleClass("fa-question fa-check");
    // });

    // $("#p2-ready-btn").click(function() {
    // 	$("#p2-ready").toggleClass("fa-question fa-check");
    // });

});
