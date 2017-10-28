var joinOrCreate;
var responseData;

$(function() {
    loadHome();
 });

function loadHome() {
    $("#root").hide().load("home.part.html", function() {
	formDefaultBehavior("#create-new-game", "/new-room");
	formDefaultBehavior("#join-game", "/join-room");
    }).fadeIn('slow');
}

function formDefaultBehavior(form, url) {
    $(form).hide();
    $(form + "-btn").click(function() {
	joinOrCreate = this.id;
	$(form + "-btn").toggleClass("btn-primary btn-dark");
	$(form).slideToggle("fast");
    });

	$(form).validate({
	    rules: {
		username: {
		    required: true,
		    minlength: 3
		},
		code: "required"
	    },
	    messages: {
		username: {
		    required: "this is required",
		    minlength: "at least 3 characters"
		},
		code: "this is required"
	    }// ,
	    // remote: {
	    // 	url: "/validate-room/",
	    // 	message: "enter a valid code"
	    // }
	});

    $(form).submit(function(event) {
	event.preventDefault();

	if ($(form).valid()){
	    $.post(url, $(form).serialize(), function(data){
		responseData = data;
		console.log(responseData);
		if (responseData) {
		    loadWaitingRoom();
		}
	    });
	}
    });

    $(document).mouseup(function(event) {
	if (!$(form).is(event.target) && !$(form + "-btn").is(event.target) && $(form).has(event.target).length === 0) {
	    $(form).slideUp("fast");
	    $(form + "-btn").removeClass("btn-dark");
	    $(form + "-btn").addClass("btn-primary");
	}
    });
}

function loadWaitingRoom() {
    $("#root").hide().load("waiting-room.part.html", function() {
	waitingRoomDefaultBehavior();
	if (joinOrCreate == "create-new-game-btn") {
	    $("#join-waiting").remove();
	    $("#code").text(responseData['code']);
     	} else if (joinOrCreate == "join-game-btn") {
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
