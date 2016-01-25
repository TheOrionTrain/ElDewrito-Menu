function isset(val, other) {
	return (val !== undefined && val !== null && val !== "") ? val : other;
}

function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
}

function randomNum(n) {
	return Math.floor(Math.random() * n);
}

function sanitizeString(str) {
	return String(str).replace(/(<([^>]+)>)/ig, "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

String.prototype.capitalizeFirstLetter = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.contains = function(it) {
	return this.indexOf(it) != -1;
};

Array.prototype.remove = function(value) {
	var index = this.indexOf(value);
	if (index > -1) {
    	this.splice(index, 1);
	}
}

jQuery.fn.scrollTo = function(elem, speed) {
    $(this).animate({
        scrollTop:  $(this).scrollTop() - $(this).offset().top + $(elem).offset().top - 150
    }, speed == undefined ? 100 : speed);
    return this;
};

String.prototype.toTitleCase = function() {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

function acr(s) {
	var words, acronym, nextWord;
	words = s.split(' ');
	acronym = "";
	index = 0;
	while (index < words.length) {
		nextWord = words[index];
		acronym = acronym + nextWord.charAt(0);
		index = index + 1;
	}
	return acronym.toUpperCase();
}

function hexToRgb(hex, opacity) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + opacity + ")";
}

function brighter(color) {
	var colorhex = (color.split("#")[1]).match(/.{2}/g);
	for (var i = 0; i < 3; i++) {
		var e = parseInt(colorhex[i], 16);
		e += 30;
		colorhex[i] = ((e > 255) ? 255 : e).toString(16);
	}
	return "#" + colorhex[0] + colorhex[1] + colorhex[2];
}

function clearAllCookies() {
	for (var i = 0; i < Object.keys(settings).length; i++) {
		var set = Object.keys(settings)[i];
		localStorage.removeItem(set);
	}
	localStorage.removeItem('song');
	localStorage.removeItem('album');
	alert("All cookies reset.");
	window.location.reload();
}


function checkFileExists(f) {
	$.ajax({
    	url: f,
    	type:'HEAD',
    	error: function() {
       	return false;
    	},
    	success: function() {
        	return true;
    	}
	});
}

/*Delete these test functions when done testing the alerts */
function test() {
	dewAlert({
		title: "This is a test alert",
		content: "Here is some text and even <a href='http://thefeeltra.in'>a link here</a>. This is so cool yay.",
		cancel: true,
		callback: test_callback
	});
}
function test_callback(clicked) {
	console.log("Callback: "+clicked);
}
/* Delete these test functions when done testing the alerts */

var current_callback;

function dewAlert(options) {
	var defaults = {
		title : "Alert",
		content : "This is an alert",
		info : "",
		acceptText : "Accept",
		cancelText : "Cancel",
		cancel : 0,
		callback : false
	};
	$.each(defaults, function(index, value) {
    	if(options && options[index]) {
			defaults[index] = options[index];
		}
	});
	$('#alert-title').text(defaults.title);
	$('#alert-content').html(defaults.content);
	$('#alert-yes').text(defaults.acceptText);
	$('#alert-no').text(defaults.cancelText);
	current_callback = defaults.callback;
	$('#alert').attr('data-info',defaults.info);
	if(defaults.cancel) {$('#alert-no').show();}
	else {$('#alert-no').hide();}
	$('#alert-container').fadeIn(anit);
	$('#alert').css('top','200px');
	$('#notification')[0].currentTime = 0;
	$('#notification')[0].play();
}

function hideAlert(clicked,callback,info) {
	if(current_callback != false) {
		current_callback(clicked, info);
	}
	$('#alert').css('top','-300px');
	$('#alert-container').fadeOut(anit);
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
}

function submenu(action,friend,isOnline,o) {
	if(action == "cancel") {
		$('#click-menu-container').hide();
	}
	if(action == "show") {
		console.log(o.pageX/scale);
		if(isOnline) {
			$('#click-menu li[data-action="join"], #click-menu li[data-action="invite"]').show();
		} else {
			$('#click-menu li[data-action="join"], #click-menu li[data-action="invite"]').hide();
		}
		$('#click-menu').css({"left":o.pageX/scale+"px","top":o.pageY/scale+"px"}).attr("data-friend",friend);
		$('#click-menu-container').show();
	}
	else if(action == "join") {
		//jumpToServer(serverz.players[friend].address);
		$('#click-menu-container').hide();
	}
	else if(action == "invite") {
		friendServer.send(JSON.stringify({
			type: "partyinvite",
			player: pname,
			senderguid: puid,
			
		}));
		$('#click-menu-container').hide();
	}
	else if(action == "remove") {
		removeFriend(friend);
		$('#click-menu-container').hide();
	}
}
