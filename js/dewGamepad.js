var buttonMap = {
		"FACE_1": "A",
		"FACE_2": "B",
		"FACE_3": "X",
		"FACE_4": "Y",
	},
	gp_on = 1,
	p_gp_on = 0,
	x_axis_function;

function gamepadSelect(id) {
	gamepadDeselect();
	$("[data-gp='" + id + "']").addClass('gp-on');
}

function gamepadDeselect() {
	$('*').removeClass('gp-on');
}

function gamepadLeft() {
	if (x_axis_function == "settings") {
		$('.gp-on').children('.left').trigger('click');
	}
}

function gamepadRight() {
	if (x_axis_function == "settings") {
		$('.gp-on').children('.right').trigger('click');
	}
}

function gamepadBind() {
	window.gamepad = new Gamepad();

	gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
		console.log('Connected', device);
		for (control in device.state) {
			value = device.state[control];
		}
		for (i = 0; i < device.buttons.length; i++) {
			value = device.buttons[i];
		}
		for (i = 0; i < device.axes.length; i++) {
			value = device.axes[i];
		}
		gamepadSelect("main1");
		usingGamepad = true;
		$.snackbar({content:'Controller connected! Use the left thumbstick to navigate the menu. Use the A and B buttons to go forwards and back.'});
		$('#connectgamepad')[0].play();
	});

	gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
		console.log('Disconnected', device);
	});

	gamepad.bind(Gamepad.Event.TICK, function(gamepads) {
		var gamepad, wrap, control, value, i, j;
		for (i = 0; i < gamepads.length; i++) {
			gamepad = gamepads[i];
			if (gamepad) {
				for (control in gamepad.state) {
					value = gamepad.state[control];
				}
				for (j = 0; j < gamepad.buttons.length; j++) {
					value = gamepad.buttons[j];
				}
				for (j = 0; j < gamepad.axes.length; j++) {
					value = gamepad.axes[j];
				}
			}
		}
	});

	window.gp_last = Date.now();

	/*gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
	    if(buttonMap[e.control] == "A") {
	        console.log("A button down.");
	    }
	});*/

	gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
		if (buttonMap[e.control] == "A") {
			$("[data-gp='" + currentMenu + "-" + gp_on + "']").trigger('click');
		}
		if (buttonMap[e.control] == "B") {
			$("#back").trigger('click');
		}
		if (buttonMap[e.control] == "X") {
			console.log("X");
		}
		if (buttonMap[e.control] == "Y") {
			if (currentMenu == "serverbrowser") {
				$('#refresh').trigger('click');
			}
		}
	});

	gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
		if (Date.now() - gp_last < 150) {
			return false;
		} else if (e.axis == "LEFT_STICK_Y" && e.value < -0.85) {
			gp_last = Date.now();
			if ($("[data-gp='" + currentMenu + "-" + (gp_on - 1) + "']").length > 0) {
				gp_on -= 1;
			}
			if (currentMenu == "serverbrowser") {
				$('#browser').animate({
					scrollTop: ($('.server.gp-on').offset().top - 150) + 'px'
				}, 'fast');
			}
			gamepadSelect(currentMenu + "-" + gp_on);
			$('#click')[0].currentTime = 0;
			$('#click')[0].play();
		} else if (e.axis == "LEFT_STICK_Y" && e.value > 0.85) {
			gp_last = Date.now();
			if ($("[data-gp='" + currentMenu + "-" + (gp_on + 1) + "']").length > 0) {
				gp_on += 1;
			}
			if (currentMenu == "serverbrowser") {
				$('#browser').animate({
					scrollTop: ($('.server.gp-on').offset().top - 150) + 'px'
				}, 'fast');
			}
			gamepadSelect(currentMenu + "-" + gp_on);
			$('#click')[0].currentTime = 0;
			$('#click')[0].play();
		} else if (e.axis == "LEFT_STICK_X" && e.value < -0.85) {
			gp_last = Date.now();
			gamepadLeft();
		} else if (e.axis == "LEFT_STICK_X" && e.value > 0.85) {
			gp_last = Date.now();
			gamepadRight();
		}
	});

	if (!gamepad.init()) {
		alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
	}
}
