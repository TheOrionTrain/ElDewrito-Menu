//Coded by DARKC0DE
var dewRcon;
jQuery(function() {
	dewRcon = new dewRconHelper();
	dewRcon.dewWebSocket.onopen = function() {
		//When we are connected do something
	};
	dewRcon.dewWebSocket.onerror = function() {
		//Something bad happened
	};
	dewRcon.dewWebSocket.onmessage = function(message) {
		dewRcon.lastMessage = message.data;
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
  
	this.send = function(command) {
		this.dewWebSocket.send(command);
	}
}
