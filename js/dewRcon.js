//Coded by DARKC0DE
var dewRcon;
jQuery(function() {
	dewRcon = new dewRconHelper();
	dewRcon.dewWebSocket.onopen = function() {
		//When we are connected do something

		loadSettings();
	};
	dewRcon.dewWebSocket.onerror = function() {
		//Something bad happened
	};
	dewRcon.dewWebSocket.onmessage = function(message) {
		dewRcon.lastMessage = message.data;
    console.log(dewRcon.lastMessage);
    console.log(dewRcon.lastCommand);
		/*
		//We can display the latest messages from dew using the code below
		console.log(message.data);
		$('div').append($('<pre>', {
		    text: message.data
		}));
		*/
	};
})
dewRconHelper = function() {
	window.WebSocket = window.WebSocket || window.MozWebSocket;
	this.dewWebSocket = new WebSocket('ws://127.0.0.1:11776', 'dew-rcon');
	this.lastMessage = "";
  this.lastCommand = "";
	this.open = false;

	this.send = function(command) {
		this.dewWebSocket.send(command);
    this.lastCommand = command;
	}
}

function after(ms, fn){ setTimeout(fn, ms); }

//I know it's messy, don't judge me... :c will make it better later.
function loadSettings() {
	dewRcon.send('player.name');
	after(10, function() {
			settings.username.current = dewRcon.lastMessage;
			settings.username.update();
			dewRcon.send('server.name');
			after(10, function() {
					settings.servername.current = dewRcon.lastMessage;
					settings.servername.update();
					dewRcon.send('camera.crosshair');
					after(10, function() {
							settings.centeredcrosshair.current = parseInt(dewRcon.lastMessage);
							settings.centeredcrosshair.update();
							dewRcon.send('camera.fov');
							after(10, function() {
									settings.fov.current = parseInt(dewRcon.lastMessage);
									settings.fov.update();
									dewRcon.send('server.countdown');
									after(10, function() {
											settings.starttimer.current = parseInt(dewRcon.lastMessage);
											settings.starttimer.update();
											dewRcon.send('server.maxplayers');
											after(10, function() {
													settings.maxplayers.current = parseInt(dewRcon.lastMessage);
													settings.maxplayers.update();
													dewRcon.send('server.password');
													after(10, function() {
															if (isNaN(dewRcon.lastMessage)) {
																	settings.serverpass.current = dewRcon.lastMessage;
																	settings.serverpass.update();
															}
															dewRcon.send('input.rawinput');
															after(10, function() {
																	settings.rawinput.current = parseInt(dewRcon.lastMessage);
																	settings.rawinput.update();
																	dewRcon.open = true;
															});
													});
											});
									});
							});
					});
			});
	});
}
