
/* Depreciated function for navigating the menu */

function changeMenu(menu, details) {
	if (menu == "main-custom") {
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-multiplayer').fadeIn(anit);
			$('#bg-multiplayer')[0].play();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-custom_games').fadeIn(anit);
			$('#bg-custom_games')[0].play();
			$('#bg-cover').css('background', 'rgba(0,0,0,0)');
		}
		host = 1;
		forge = 0;
		$('#title').text('CUSTOM GAME');
		$('#subtitle').text('');
		$('#network-toggle').attr('data-gp', 'customgame-x').hide();
		$('#type-selection').attr('data-gp', 'customgame-1').show();
		currentType = "Slayer";
		if (currentType == "Ctf")
			currentType = "ctf";
		$('#gametype-icon').css({
			"background-image": "url('img/gametypes/" + currentType + ".png')"
		});
		$('#customgame').attr('data-from', 'main');
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px"
		});
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'custom-main');
		$('#customgame').css({
			"top": "0px"
		});
		$('#main3').css({
			"top": "-720px"
		});
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>16</span></td></tr>");
		$('#start').children('.label').text("START GAME");
		playersJoin(1, 2, 20, "127.0.0.1:11775");
		currentMenu = "customgame";
	}
	if (menu == "main-forge") {
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-forge').fadeIn(anit);
			$('#bg-forge')[0].play();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-forge').fadeIn(anit);
			$('#bg-forge')[0].play();
			$('#bg-cover').css('background', 'rgba(0,0,0,0)');
		}
		host = 1;
		forge = 1;
		$('#title').text('FORGE');
		$('#subtitle').text('');
		$('#network-toggle').attr('data-gp', 'customgame-1').show();
		$('#type-selection').attr('data-gp', 'customgame-x').hide();
		currentType = "Forge";
		$('#gametype-icon').css({
			"background-image": "url('img/gametypes/" + currentType + ".png')"
		});
		$('#customgame').attr('data-from', 'main');
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px"
		});
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'custom-main');
		$('#customgame').css({
			"top": "0px"
		});
		$('#main3').css({
			"top": "-720px"
		});
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>16</span></td></tr>");
		$('#start').children('.label').text("START FORGE");
		currentMenu = "customgame";
	}
	if (menu == "custom-main") {
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeIn(anit);
			$('#bg1')[0].play();
			$('#bg-forge').fadeOut(anit);
			$('#bg-forge')[0].pause();
			$('#bg-multiplayer').fadeOut(anit);
			$('#bg-multiplayer')[0].pause();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeIn(anit);
			$('#bg1')[0].play();
			$('#bg-forge').fadeOut(anit);
			$('#bg-forge')[0].pause();
			$('#bg-custom_games').fadeOut(anit);
			$('#bg-custom_games')[0].pause();
			$('#bg-cover').css('background', 'rgba(0,0,0,0.25)');
		}
		$('#dewrito').css({
			"opacity": 0.95,
			"top": "240px",
			"-webkit-transition-timing-function": "400ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#customgame').css({
			"top": "-720px"
		});
		$('#main').css({
			"top": "0px"
		});
		$('#back').attr('data-action', 'main-main2');
		currentMenu = "main";
	}
	if (menu == "main-quickjoin") {
		var lowestPing = 5000;
		for (var i = 0; i < serverz.servers.length; i++) {
			if (typeof serverz.servers[i] != 'undefined') {
				if (serverz.servers[i].ping < lowestPing && (parseInt(serverz.servers[i].numPlayers) < parseInt(serverz.servers[i].maxPlayers)) && !serverz.servers[i].passworded) {
					lowestPing = parseInt(serverz.servers[i].ping);
					currentServer = serverz.servers[i];
				}
			}
			if (i == serverz.servers.length - 1) {
				jumpToServer(currentServer.address);
				setTimeout(function() {
					startgame(currentServer.address, 'JOIN GAME'.split(' '));
				}, 500);
			}
		}
	}
	if (menu == "serverbrowser-custom" && details) {
		if (getURLParameter('browser'))
			$('#back').show();
		host = 0;
		browsing = 0;
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>0</span></td></tr>");
		var d = servers[details];
		if (d.players.current != d.players.max) {
			changeMap2(getMapName(d.mapFile));
			$('#subtitle').text(d.name + " : " + d.address);
			if (d.variant === "") {
				d.variant = "Slayer";
			}
			$('#gametype-display').text(d.variant.toUpperCase());
			if (d.variantType === "none")
				d.variantType = "Slayer";
			$('#gametype-icon').css('background', "url('img/gametypes/" + (d.variantType === "ctf" || d.variantType === "koth") ? d.variantType : d.variantType.toString().capitalizeFirstLetter + ".png') no-repeat 0 0/cover");
			$('#serverbrowser').css({
				"top": "720px"
			});
			$('#customgame').css({
				"top": "0px"
			});
			$('#back').attr('data-action', 'custom-serverbrowser');
			$('#customgame').attr('data-from', 'serverbrowser');
			playersJoin(d.players.current, d.players.max, 20, d.address);
			currentServer = d;
			lobbyLoop(servers[selectedserver].address);
			loopPlayers = true;

		}
		$('#start').children('.label').text("JOIN GAME");
		$('#title').text('CUSTOM GAME');
		$('#network-toggle').hide();
		$('#type-selection').show();
		currentMenu = "customgame";
	}
	if (menu == "custom-serverbrowser") {
		browsing = 1;
		if (getURLParameter('browser'))
			$('#back').hide();
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-multiplayer').fadeIn(anit);
			$('#bg-multiplayer')[0].play();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-matchmaking').fadeIn(anit);
			$('#bg-matchmaking')[0].play();
		}
		$('#customgame').css({
			"top": "-720px"
		});
		$('#serverbrowser').css({
			"top": "0px"
		});
		$('#back').attr('data-action', 'serverbrowser-main');
		$('#browser').empty();
		setTimeout(loadServers, 1000);
		loopPlayers = false;
		currentMenu = "serverbrowser";
	}
	if (menu == "main-serverbrowser") {
		browsing = 1;
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-multiplayer').fadeIn(anit);
			$('#bg-multiplayer')[0].play();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-matchmaking').fadeIn(anit);
			$('#bg-matchmaking')[0].play();
		}
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px"
		});
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'serverbrowser-main');
		$('#serverbrowser').css({
			"top": "0px"
		});
		$('#main').css({
			"top": "720px"
		});
		$('#browser').empty();
		setTimeout(loadServers, 1000);
		loopPlayers = false;
		currentMenu = "serverbrowser";
	}
	if (menu == "serverbrowser-main") {
		browsing = 0;
		if (settings.background.current == Halo3Index) {
			$('#bg1').fadeIn(anit);
			$('#bg1')[0].play();
			$('#bg-multiplayer').fadeOut(anit);
			$('#bg-multiplayer')[0].pause();
		}
		if (settings.background.current === 0) {
			$('#bg1').fadeIn(anit);
			$('#bg1')[0].play();
			$('#bg-matchmaking').fadeOut(anit);
			$('#bg-matchmaking')[0].pause();
		}
		$('#dewrito').css({
			"opacity": 0.95,
			"top": "240px",
			"-webkit-transition-timing-function": "400ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#serverbrowser').css({
			"top": "-720px"
		});
		$('#main').css({
			"top": "0px"
		});
		$('#back').attr('data-action', 'main-main2');
		currentMenu = "main";
	}
	if (menu == "main2-main") {
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'main-main2');
		$('#main').css({
			"top": "0px"
		});
		$('#main2').css({
			"top": "720px"
		});
		currentMenu = "main";
	}
	if (menu == "main-main3") {
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'main3-main');
		$('#main3').css({
			"top": "0px"
		});
		$('#main').css({
			"top": "720px"
		});
		currentMenu = "main3";
	}
	if (menu == "main3-main") {
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'main-main2');
		$('#main3').css({
			"top": "-720px"
		});
		$('#main').css({
			"top": "0px"
		});
		currentMenu = "main3";
	}
	if (menu == "main2-credits") {
		if (settings.background.current === 0) {
			$('#bg1').fadeOut(anit);
			$('#bg1')[0].pause();
			$('#bg-firefight').fadeIn(anit);
			$('#bg-firefight')[0].play();
		}
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'credits-main2');
		$('#credits').css({
			"top": "0px"
		});
		$('#main2').css({
			"top": "720px"
		});
		$('#dewrito').css({
			"top": "-30px",
			"left": "265px",
			"-webkit-transition-timing-function": "200ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#dewrito').css({
			'background': "url('img/Halo 3 CE.png') no-repeat 0 0/cover"
		});
		currentMenu = "credits";
	}
	if (menu == "credits-main2") {
		if (settings.background.current === 0) {
			$('#bg1').fadeIn(anit);
			$('#bg1')[0].play();
			$('#bg-firefight').fadeOut(anit);
			$('#bg-firefight')[0].pause();
		}
		$('#back').fadeOut(anit);
		$('#credits').css({
			"top": "-720px"
		});
		$('#main2').css({
			"top": "0px"
		});
		$('#dewrito').css({
			"top": "240px",
			"left": "-10px",
			"-webkit-transition-timing-function": "200ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#bg-cover').css({
			"background": "rgba(0,0,0,0.25)"
		});
		var c = settings.logo.current;
		$('#dewrito').css({
			'background': "url('img/" + settings.logo.labels[c] + ".png') no-repeat 0 0/cover"
		});
		currentMenu = "main2";
	}
	if (menu == "main-main2") {
		$('#back').fadeOut(anit);
		$('#main').css({
			"top": "-720px"
		});
		$('#main2').css({
			"top": "0px"
		});
		currentMenu = "main2";
	}
	if (menu == "custom-options") {
		if (host === 1) {
			$('#customgame-options').show();
			$('#back').attr('data-action', 'options-custom');
			$('#customgame').fadeOut(anit);
			$('#options').fadeIn(anit);
			$('#dewrito').css('top', '400px');
			$('#dewrito').css({
				"opacity": 0.9,
				"top": "400px",
				"-webkit-transition-timing-function": "200ms",
				"-webkit-transition-delay": "200ms"
			});
			currentMenu = "customgame-options";
		}
	}
	if (menu == "options-haloonline") {
		$('#back').attr('data-action', 'haloonline-options');
		$('#dewrito-options').hide();
		$('#haloonline').fadeIn(anit);
		currentMenu = "haloonline";
	}
	if (menu == "haloonline-options") {
		$('#back').attr('data-action', 'options-main');
		if (getURLParameter('browser')) {
			$('#back').attr('data-action', 'options-serverbrowser');
		}
		$('#haloonline').hide();
		$('#dewrito-options').fadeIn(anit);
		currentMenu = "dewrito-options";
	}
	if (menu == "options-music") {
		$('#back').attr('data-action', 'music-options');
		$('#dewrito-options').hide();
		$('#choosemusic').fadeIn(anit);
		currentMenu = "music";
	}
	if (menu == "music-options") {
		$('#back').attr('data-action', 'options-main');
		if (getURLParameter('browser')) {
			$('#back').attr('data-action', 'options-serverbrowser');
		}
		$('#choosemusic').hide();
		$('#dewrito-options').fadeIn(anit);
		currentMenu = "dewrito-options";
	}
	if (menu == "serverbrowser-type") {
		$('#choosetype').show();
		$('#back').attr('data-action', 'options-serverbrowser');
		$('#serverbrowser').fadeOut(anit);
		$('#options').fadeIn(anit);
		currentMenu = "choosetype";
	}
	if (menu == "serverbrowser-map") {
		$('#choosemap').show();
		$('#back').attr('data-action', 'options-serverbrowser');
		$('#serverbrowser').fadeOut(anit);
		$('#options').fadeIn(anit);
		currentMenu = "choosemap";
	}
	if (menu == "options-serverbrowser") {
		$('.options-section').hide();
		$('#back').attr('data-action', 'options-serverbrowser');
		$('#serverbrowser').fadeIn(anit);
		$('#options').fadeOut(anit);
		currentMenu = "serverbrowser";
	}
	if (menu == "custom-map") {
		if (host === 1) {
			$('#choosemap').show();
			$('#back').attr('data-action', 'options-custom');
			$('#customgame').fadeOut(anit);
			$('#options').fadeIn(anit);
			$('#dewrito').css('top', '400px');
			$('#dewrito').css({
				"opacity": 0.9,
				"top": "400px",
				"-webkit-transition-timing-function": "200ms",
				"-webkit-transition-delay": "200ms"
			});
			currentMenu = "choosemap";
		}
	}
	if (menu == "custom-type") {
		if (host === 1 && forge === 0) {
			$('#choosetype').show();
			$('#back').attr('data-action', 'options-custom');
			$('#customgame').fadeOut(anit);
			$('#options').fadeIn(anit);
			$('#dewrito').css('top', '400px');
			$('#dewrito').css({
				"opacity": 0.9,
				"top": "400px",
				"-webkit-transition-timing-function": "200ms",
				"-webkit-transition-delay": "200ms"
			});
			currentMenu = "choosetype";
		}
	}
	if (menu == "options-custom") {
		$('.options-section').hide();
		f = $('#customgame').attr('data-from');
		$('#back').attr('data-action', 'custom-' + f);
		$('#customgame').fadeIn(anit);
		$('#options').fadeOut(anit);
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px",
			"-webkit-transition-timing-function": "200ms",
			"-webkit-transition-delay": "0ms"
		});
		currentMenu = "customgame";
	}
	if (menu == "main-options") {
		$('#dewrito-options').show();
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'options-main');
		$('#main2').fadeOut(anit);
		$('#options').fadeIn(anit);
		$('#dewrito').css({
			"top": "400px"
		});
		currentMenu = "dewrito-options";
	}
	if (menu == "serverbrowser-options") {
		$('#dewrito-options').show();
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'options-serverbrowser');
		$('#serverbrowser').fadeOut(anit);
		$('#options').fadeIn(anit);
		currentMenu = "dewrito-options";
	}
	if (menu == "options-serverbrowser") {
		$('.options-section').hide();
		$('#back').fadeOut(anit);
		$('#serverbrowser').fadeIn(anit);
		$('#options').fadeOut(anit);
		currentMenu = "serverbrowser";
	}
	if (menu == "options-main") {
		$('.options-section').hide();
		$('#back').fadeOut(anit);
		$('#main2').fadeIn(anit);
		$('#options').fadeOut(anit);
		$('#dewrito').css({
			"top": "240px",
			"-webkit-transition-delay": "0ms",
			"transition-delay": "0ms",
			"-moz-transition-delay": "0ms"
		});
		currentMenu = "main2";
	}
	if (menu == "custom-player") {
		$('#customgame').css({
			"left": "-800px"
		});
		$('#playerinfo').css({
			"right": "100px"
		});
		$('#back').attr('data-action', 'player-custom');
		$('#playermodel').css('background-image', "url('img/players/" + details + ".png')");
		playerInfo(details);
		currentMenu = "playerinfo";
	}
	if (menu == "player-custom") {
		$('#customgame').css({
			"left": "0px"
		});
		$('#playerinfo').css({
			"right": "-700px"
		});
		f = $('#customgame').attr('data-from');
		$('#back').attr('data-action', 'custom-' + f);
		currentMenu = "customgame";
	}
	if (menu == "setting-settings") {
		changeSettingsBack();
	}
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
	if (usingGamepad && details != 'back') {
		p_gp_on = gp_on;
		gp_on = 1;
		gamepadSelect(currentMenu + "-" + gp_on);
	}
	debugLog(currentMenu);
}
