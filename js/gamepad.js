/*
    (c) 2016 Brayden Strasen & Ryan Palmer
    http://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var Controller = {
    "selected": 1,
    "previous": 0,
    "servers": 0,
    "last": Date.now(),
    "buttons": {
        "FACE_1": "A",
        "FACE_2": "B",
        "FACE_3": "X",
        "FACE_4": "Y"
    },
    "select": function(id) {
        Controller.deselect();
        $("[data-gp='" + id + "']").addClass('gp-on');
    },
    "deselect": function() {
        $('*').removeClass('gp-on');
    },
    "forward": function() {
        if ($("[data-gp='" + Menu.selected + "-" + (Controller.selected + 1) + "']").length > 0) {
            Controller.selected += 1;
        }
        Controller.select(Menu.selected + "-" + Controller.selected);
        if (Menu.selected == "serverbrowser") {
            $('#browser').scrollTo('.server.gp-on');
        }
        if (Menu.selected.indexOf("songs-") > -1) {
            $('#' + Menu.selected).scrollTo('.selection.gp-on');
        }
        Audio.play("click");
    },
    "backward": function() {
        if ($("[data-gp='" + Menu.selected + "-" + (Controller.selected - 1) + "']").length > 0) {
            Controller.selected -= 1;
        }
        Controller.select(Menu.selected + "-" + Controller.selected);
        if (Menu.selected == "serverbrowser") {
            $('#browser').scrollTo('.server.gp-on');
        }
        if (Menu.selected.indexOf("songs-") > -1) {
            $('#' + Menu.selected).scrollTo('.selection.gp-on');
        }
        Audio.play("click");
    },
    "bind": function() {
        window.gamepad = new Gamepad();

        gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
            if (device.id.contains("Joystick") || device.id.contains("Throttle"))
                return;
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
            Controller.select("main1");
            $.snackbar({
                content: 'Controller connected! Use the left thumbstick to navigate the menu. Use the A and B buttons to go forwards and back.'
            });
            Audio.play("connect");
        });

        gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
            if (device.id.contains("Joystick") || device.id.contains("Throttle"))
                return;
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

        gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
            if (Controller.buttons[e.control] == "A") {
                $('.control-A').trigger('click');
            }
            if (Controller.buttons[e.control] == "B") {
                $('.control-B').trigger('click');
            }
            if (Controller.buttons[e.control] == "X") {
                $('.control-X').trigger('click');
            }
            if (Controller.buttons[e.control] == "Y") {
                $('.control-Y').trigger('click');
            }
            if (e.control == "DPAD_DOWN") {
                Controller.last = Date.now();
                Controller.forward();
            }
            if (e.control == "DPAD_UP") {
                Controller.last = Date.now();
                Controller.backward();
            }
            if (e.control == "DPAD_LEFT") {

            }
            if (e.control == "DPAD_RIGHT") {

            }
        });

        gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
            if (Date.now() - Controller.last < 150) {
                return false;
            } else if (e.axis == "LEFT_STICK_Y" && e.value < -0.85) {
                Controller.last = Date.now();
                Controller.backward();
            } else if (e.axis == "LEFT_STICK_Y" && e.value > 0.85) {
                Controller.last = Date.now();
                Controller.forward();
            } else if (e.axis == "LEFT_STICK_X" && e.value < -0.85) {
                Controller.last = Date.now();

            } else if (e.axis == "LEFT_STICK_X" && e.value > 0.85) {
                Controller.last = Date.now();

            }
        });

        if (!gamepad.init()) {
            alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
        }
    }
};
