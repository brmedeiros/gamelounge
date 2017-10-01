var joinOrCreated;
var responseData;

$(function() {
    loadHome();
 });

function loadHome() {
    $("#root").hide().load("home.part.html", function() {
	formDefaultBehavior("#create-new-game", "/new-room");
	formDefaultBehavior("#join-game", "/join-room");
	hideForm("#create-new-game");
	hideForm("#join-game");
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

function formDefaultBehavior(form, url) {
    $(form).hide();
    $(form + "-btn").click(function() {
	joinOrCreated = this.id;
	$(form + "-btn").toggleClass("btn-primary btn-dark");
	$(form).slideToggle("fast");

	$(form).submit(function(event) {
	    event.preventDefault();
	    $.post(url, $(form).serialize(),function(data){
		responseData = data;
		console.log(responseData);
		if (responseData) {
		    loadWaitingRoom();
		}
	    });
	});
    });
}

function hideForm(form) {
    $(document).mouseup(function(event) {
	if (!$(form).is(event.target) && !$(form + "-btn").is(event.target) && $(form).has(event.target).length === 0) {
	    $(form).slideUp("fast");
	    $(form + "-btn").removeClass("btn-dark");
	    $(form + "-btn").addClass("btn-primary");
	}
    });
}
