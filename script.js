var joinOrCreated;
var responseData;

function loadHome() {
    $("#root").hide().load("home.part.html", function() {
	$("#creator-name-form").hide();
	$("#create-new-game-btn").click(function() {
	    joinOrCreated = this.id;
	    $("#create-new-game-btn").toggleClass("disabled");
	    $("#creator-name-form").slideToggle("fast");

	    $("#creator-name-form").submit(function(event) {
		event.preventDefault();
		$.post("/new-room/", $("#creatorName").serialize(), function(data) {
		    responseData = data;
		    console.log(responseData);
		});
		loadWaitingRoom();
	    });
	});

	$("#player-name-form").hide();
	$("#join-game-btn").click(function() {
	    joinOrCreated = this.id;
	    $("#join-game-btn").toggleClass("disabled");
	    $("#player-name-form").slideToggle("fast");

	    $("#player-name-form").submit(function(event) {
		event.preventDefault();
		$.post("/join-room/", $("#playerName").serialize(), function(data) {
		    responseData = data;
		    console.log(responseData);
		});
		loadWaitingRoom();
	    });
	});

	$(document).mouseup(function(event) {
	    var nameForm = $("#creator-name-form, #player-name-form");
	    var openFormBtn = $("#create-new-game-btn, #join-game-btn");
	    if (!nameForm.is(event.target) && !openFormBtn.is(event.target) && nameForm.has(event.target).length === 0) {
		nameForm.slideUp();
		openFormBtn.removeClass("disabled");
	    }
	});
    }).fadeIn('slow');
}

function loadWaitingRoom() {
    $("#root").hide().load("waiting-room.part.html", function() {
	waitingRoomDefaultBehavior();
	if (joinOrCreated == "create-new-game-btn") {
	    $("#join-waiting").remove();
	    $("#code").text(responseData['code']);
     	} else if (joinOrCreated == "join-game-btn") {
	    $("#game-code").remove();
 	    $("#start-game").remove();
	}
    }).fadeIn('slow');
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
