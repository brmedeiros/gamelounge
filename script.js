var joinOrCreated;
var responseData;

function loadHome() {
    $("#root").hide().load("home.part.html", function() {
	$("#creator-name-form").hide();
	$("#create-new-game-btn").click(function() {
	    joinOrCreated = this.id;
	    $("#create-new-game-btn").toggleClass("btn-primary btn-dark");
	    $("#creator-name-form").slideToggle("fast");

	    $("#creator-name-form").submit(function(event) {
		event.preventDefault();
		$.post("/new-room/", $("#creator-name-form").serialize(), function(data) {
		    responseData = data;
		    console.log(responseData);
		});
		loadWaitingRoom();
	    });
	});

	$("#player-name-form").hide();
	$("#join-game-btn").click(function() {
	    joinOrCreated = this.id;
	    $("#join-game-btn").toggleClass("btn-primary btn-dark");
	    $("#player-name-form").slideToggle("fast");

	    $("#player-name-form").submit(function(event) {
		event.preventDefault();
		$.post("/join-room/", $("#player-name-form").serialize(), function(data) {
		    responseData = data;
		    console.log(responseData);
		});
		loadWaitingRoom();
	    });
	});

	hideShowForm("#creator-name-form", "#create-new-game-btn");
	hideShowForm("#player-name-form", "#join-game-btn");

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
	    $("#creator-name").text(responseData['creator'] + "'s game");
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

function hideShowForm(form, button) {
    $(document).mouseup(function(event) {
	if (!$(form).is(event.target) && !$(button).is(event.target) && $(form).has(event.target).length === 0) {
	    $(form).slideUp("fast");
	    $(button).removeClass("btn-dark");
	    $(button).addClass("btn-primary");
	}
    });
}

$(function() {
    loadHome();
 });
