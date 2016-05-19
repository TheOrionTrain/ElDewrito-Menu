var Audio = {
    "connect" : new Audio("audio/halo3/loop.ogg"),
    "notification" : new Audio("audio/odst/a_button.ogg"),
    "beep" : new Audio("audio/halo3/countdown_for_respawn.ogg"),
    "beeep" : new Audio("audio/halo3/player_respawn.ogg"),
    "click" : new Audio("audio/halo3/cursor_horizontal.ogg"),
    "slide" : new Audio("audio/halo3/a_button.ogg")
},
Lobby = {
    "address" : "0.0.0.0",
    "status" : false,
    "players" : [],
    "update" : function() {
        if(Lobby.status && Menu.selected == "gamelobby") {
            $.getJSON("http://" + Lobby.address, function(d) {
                for(var i=0; i < Object.keys(d).length; i++) {
                    var x = Object.keys(d)[i];
                    if(typeof d[x] == "String") {
                        Lobby[x] = sanitizeString(d[x]);
                    } else {
                        Lobby[x] = d[x];
                    }
                }
                console.log(Lobby);
                var o = Menu.pages.gamelobby.options;
                $('[data-option="GAME TYPE"]').html("GAME TYPE <span class='value'>"+Lobby.variant.toUpperCase()+"</span>");
                $('[data-option="MAP"]').html("MAP <span class='value'>"+Lobby.map.toUpperCase()+"</span>");
                $('#map-thumb').css({
            		"background-image": "url('img/maps/"+getMapName(Lobby.mapFile).toUpperCase()+".jpg')"
            	});
                $('#party-text').text(Lobby.name);
                $('#lobby').empty().append("<tr class='top' hex-colour='#000000' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='info' colspan='2'>Current Lobby <span class='numbers'><span id='joined'>"+Lobby.numPlayers+"</span>/<span id='maxplayers'>"+Lobby.maxPlayers+"</span></span></td></tr>");
                var color = "#000000";
                Lobby.players.sort(function(a, b) {
    				return a.team - b.team
    			});
    			if (typeof Lobby.passworded == 'undefined') {
    				for (var i = 0; i < Lobby.players.length; i++) {
    					if (typeof Lobby.players[i] != 'undefined' && Lobby.players[i].name != "") {
    						if (Lobby.teams) {
                                color = (parseInt(Lobby.players[i].team) === 0) ? "#c02020" : "#214EC0";
                            }
    						var isDev = (developers.indexOf(Lobby.players[i].uid) >= 0) ? "developer" : "";
    						Lobby.display(Lobby.players[i].name,color,isDev);
    					}
    				}
                }
            });
        }
    },
    "display" : function(player, color, isDev) {
    	$('<tr>', {
    		'hex-color': color,
    		'data-color': hexToRgb(color, 0.5),
    		'style': 'background:' + hexToRgb(color, 0.5) + ';',
    		html: $('<td>', {
    			class: 'name ' + isDev,
    			text: player
    		})
    	}).hover(function() {
            Audio.click.currentTime = 0;
            Audio.click.play();
        }).mouseover(function() {
            var n = $(this).attr('id'),
                col = $(this).attr('hex-color'),
                bright = brighter(col);
            $(this).css("background-color", hexToRgb(bright, 0.75));
        }).mouseout(function() {
            var n = $(this).attr('id'),
                col = $(this).attr('hex-color');
            $(this).css("background-color", hexToRgb(col, 0.5));
        }).append(
    	$('<td>', {
    		class: 'rank',
    		html: $('<img>', {
    			src: 'img/ranks/reach/0.png'
    		})
    	})).appendTo('#lobby');
    },
    "loop" : setInterval(function(){Lobby.update()},5000),
    "join" : function(s) {
        Lobby.address = servers[s].address;
        Lobby.status = 1;
        Menu.change("gamelobby");
        Lobby.update();
    },
    "joinIP" : function(ip) {
        Lobby.address = ip;
        Lobby.status = 1;
        Menu.change("gamelobby");
        Lobby.update();
    }
},
Chat = {
	time: 0,
	pinned: 0,
	currentTab: "",
	hovering: 0,
	focused: 0,
	createTab: function(player) {
		Chat.currentTab = player;
		$('.chat-tab,.chat-window').removeClass('selected');
		$('#chat-tabs').append("<div data-player='"+player+"' class='chat-tab selected'>"+player+"<div class='x'></div></div>");
		$('#chat-windows').append("<div data-player='"+player+"' class='chat-window selected'></div>");
		$('.chat-tab').click(function() {
			Chat.changeTab($(this).attr('data-player'));
		});
		$('.chat-tab > .x').click(function() {
			Chat.destroyTab($(this).parent('.chat-tab').attr('data-player'));
		});
		var n = $('.chat-tab').length;
		$('.chat-tab').css('width',Math.floor(420/n)+'px');
	},
	renameTab: function(previous, name) {
		$('.chat-tab[data-player="'+previous+'"]').text(name);
		$('.chat-tab[data-player="'+previous+'"]').attr("data-player", name);
		$('.chat-window[data-player="'+previous+'"]').attr("data-player", name);
	},
	destroyTab: function(player) {
		if(player == Chat.currentTab) {
			$('.chat-window[data-player="'+player+'"]').remove();
			$('.chat-tab[data-player="'+player+'"]').remove();
			if($('.chat-tab').length > 0) {
				var e = $('.chat-tab:first-of-type').attr('data-player');
				Chat.changeTab(e);
			} else {
				Chat.hideBox();
			}
		} else {
			$('.chat-window[data-player="'+player+'"]').remove();
			$('.chat-tab[data-player="'+player+'"]').remove();
		}
		var n = $('.chat-tab').length;
		$('.chat-tab').css('width',Math.floor(420/n)+'px');
	},
	isOpen: function(player) {
		if($('.chat-tab[data-player="'+player+'"]').length > 0) {
			return true;
		} else {
			return false;
		}
	},
	receiveMessage: function(player,message,balloon) {
		if(!Chat.isOpen(player)) {
			Chat.createTab(player);
		}
		console.log(balloon);
		$('<span>', {
			class: 'chat-message ' + (message.split(': ')[0] == pname ? "self" : ""),
			text: message
		}).prepend(balloon == 1 ? '<div class="balloon"/> ' : null).appendTo('.chat-window[data-player="'+player+'"]');
		$('.chat-window[data-player="'+player+'"]').scrollTop($('.chat-window[data-player="'+player+'"]')[0].scrollHeight);
		Chat.showBox();
	},
	sendMessage: function(player,message) {

		if (player.contains("Party Chat -")) {
			friendServer.send(JSON.stringify({
				type: "partymessage",
				message: message,
				player: pname,
				senderguid: puid,
				partymembers: party
			}));
		} else {
			friendServer.send(JSON.stringify({
				type: "pm",
				message: message,
				player: pname,
				senderguid: puid,
				guid: getPlayerUIDFromFriends(player) == "" ? getPlayerUID(player) : getPlayerUIDFromFriends(player)
			}));
		}

		Chat.receiveMessage(player,pname+": "+message, party[0].name == pname ? 1 : 0);
	},
	showBox: function() {
		$('#chatbox').clearQueue().fadeIn(anit);
		Chat.time = 8000;
	},
	hideBox: function() {$('#chatbox').clearQueue().fadeOut(anit);},
	changeTab: function(player) {
		Chat.currentTab = player;
		$('.chat-tab,.chat-window').removeClass('selected');
		$('.chat-tab[data-player="'+player+'"]').addClass('selected');
		$('.chat-window[data-player="'+player+'"]').addClass('selected');
	},
	loop: setInterval(function() {
		if(!Chat.pinned && !Chat.hovering && !Chat.focused) {
			Chat.time -= 100;
			if(Chat.time <= 0) {
				Chat.time = 0;
				Chat.hideBox();
			}
		}
	},100)
},
Menu = {
    "background" : "default",
    "change" : function(m) {
        if(Menu.pages[m]) {
            var ch = Menu.pages[m];
            if(ch.background) {
        		for(var i=0; i< ch.background.length; i++) {
        			if($('#bg-'+ch.background[i]).length && ch.background[i] != Menu.background) {
                        $('#videos > video').fadeOut(anit);
                        $('#videos > video')[0].pause();
        				$('#bg-'+ch.background[i]).stop().fadeIn(anit);
        				$('#bg-'+ch.background[i])[0].play();
                        Menu.background = ch.background[i];
        			}
        		}
        	} else {
                if(Menu.background != "default") {
                    $('#videos > video').fadeOut(anit);
                    $('#videos > video')[0].pause();
            		$('#bg1').stop().stop().fadeIn(anit);
            		$('#bg1')[0].play();
                    Menu.background = "default";
                }
        	}
            $('#select-title').text(ch.title);
            if(ch.previous) {
                $('#select-previous').text(Menu.pages[ch.previous].title).click(function() {
                    $('.control-B').trigger('click');
                });
            } else {
                $('#select-previous').text("");
            }
            $('#lobby-container > table').hide();
            for(var i=0;i<ch.lists.length;i++) {
                $('#'+ch.lists[i]).show();
            }
            if(ch.lists.length > 0) {
                $('#lobby-container').removeClass().addClass('showing');
            } else {
                $('#lobby-container').removeClass().addClass('hidden');
            }
            if(ch.logo) {
        		$('#dewrito').removeClass().addClass("animated "+ch.logo);
        	} else {
        		$('#dewrito').removeClass().addClass("animated hidden");
        	}
            if(ch.thumbnail) {
                $('#map-thumb').show();
            } else {
                $('#map-thumb').hide();
            }
            if(ch.class) {
                $('#main').removeClass().addClass("menu-container animated "+ch.class);
            } else {
                $('#main').removeClass().addClass("menu-container animated");
            }
            $('#select-main').empty();
            for(var i=0;i<Object.keys(ch.options).length;i++) {
                var da = ch.options[Object.keys(ch.options)[i]],
                    v = (da.value) ? "<span class='value'>"+da.value+"</span>" : "";
                $('#select-main').append("<div data-option='"+Object.keys(ch.options)[i]+"' class='selection' data-gp='"+m+"-"+(i+1)+"'>"+Object.keys(ch.options)[i]+v+"</div>");
            }
            $('#controls').empty();
            for(var i=0;i<Object.keys(ch.controls).length;i++) {
                var co = ch.controls[Object.keys(ch.controls)[i]];
                $('#controls').append("<div class='control-"+Object.keys(ch.controls)[i]+"'>"+co.label+"</div>");
            }
            Controller.select(m+"-1");
            Menu.selected = m;
            $('#select-main .selection').hover(function() {
    			Audio.click.currentTime = 0;
    			Audio.click.play();
                $('.selection').removeClass('gp-on');
        		$(this).addClass("gp-on");
        		Controller.selected = $(this).attr('data-gp').split("-")[1];
        		Controller.select(Menu.selected + "-" + Controller.selected);
                $('#description').text(Menu.pages[Menu.selected].options[Object.keys(Menu.pages[Menu.selected].options)[parseInt(Controller.selected)-1]].description);
    		});
            $('#select-main .selection').click(function() {
                var n = parseInt($(this).attr('data-gp').split("-")[1])-1;
                Menu.pages[Menu.selected].options[Object.keys(Menu.pages[Menu.selected].options)[n]].action();
            });
            $('#controls > div').click(function() {
                var button = $(this).attr('class').split('-')[1];
                Menu.pages[Menu.selected].controls[button].action();
            });
            Audio.slide.currentTime = 0;
            Audio.slide.play();
            if(ch.onload) {ch.onload();}
            Menu.animate();
        }
    },
    animate: function() {
        $('#select-main .selection').each(function(i) {
            var el=$(this);
            el.css({
                "margin-left": "-100px",
                "opacity" : 0
            });
            setTimeout(function() {
                el.css({
                    "margin-left": "0px",
                    "opacity" : 1
                });
            }, i * (anit/8));
        });
        $('#select-icon').css({
            "transform": "scale(0.9)"
        })
        $('#party-text, #description, #map-thumb').removeClass('animated').css({
            "opacity" : 0
        });
        setTimeout(function() {
            $('#description').addClass('animated').css({
                "opacity" : 0.667
            });
        }, 300);
        setTimeout(function() {
            $('#map-thumb').addClass('animated').css({
                "opacity" : 1
            });
        }, 400);
        setTimeout(function() {
            $('#party-text').addClass('animated').css({
                "opacity" : 0.667
            });
        }, 10);
        $('#main:not(.browser):not(.leaderboard) #select-title').removeClass('animated').css({
            "top": "280px",
            "opacity" : 0
        });

        $('#main:not(.browser):not(.leaderboard) #select-previous').removeClass('animated').css({
            "top" : "260px",
            "width": "0px"
        });
        $('.browser #select-title, .browser #select-previous, .leaderboard #select-title, .leaderboard #select-previous').attr('style'," ");
        setTimeout(function() {
            $('#select-icon').css({
                "transform": "scale(1)"
            })
            $('#main:not(.browser):not(.leaderboard) #select-title').addClass('animated').css({
                "top": "240px",
                "opacity" : 1
            });
            $('#main:not(.browser):not(.leaderboard) #select-previous').addClass('animated').css({
                "top" : "320px",
                "width": "400px"
            });
        }, 200);
    },
    "previous" : function() {
        Menu.change(Menu.pages[Menu.selected].previous);
    },
    "pages" : {
        "main" : {
            "title" : "MAIN MENU",
            "thumbnail": 0,
            "lists" : [
                "current-party",
                "friends-on"
            ],
            "options": {
                "BROWSE SERVERS" : {
                    "description" : "Take your party to view the current multiplayer servers online that are available to join.",
                    "action" : function() {Menu.change("serverbrowser")}
                },
                "MATCHMAKING" : {
                    "description" : "Take your party online and into the frenetic action of live combat, objective-based missions, and dangerous military exercises.",
                    "action" : function() {Menu.change("matchmaking")}
                },
                "CUSTOM GAME" : {
                    "description" : "Take your party to combat and objective-based missions that you select and design. Your rules, your maps, your game.",
                    "action" : function() {
						if (dewRconConnected) {
                            dewRcon.send("server.lobbytype 2");
                        }
						Menu.change("customgame");
					}
                },
                "FORGE" : {
                     "description" : "Take your party to collaborate in real time to edit and play variations of your favorite maps, from the subtle to the insane.",
                     "action" : function() {
						if (dewRconConnected) {
                            dewRcon.send("server.lobbytype 3");
                        }
						 Menu.change("forge");
					 }
                },
                "LEADERBOARD" : {
                     "description" : "View the top player stats including kills, deaths, and rank. Powered by the HaloStats.Click API.",
                     "action" : function() {
						 Menu.change("leaderboard");
					 }
                },
                "SETTINGS" : {
                    "description" : "Change how the game or menu plays or looks. You can customize everything from music, to the background, to the appearance of the server browser.",
                    "action" : function() {Menu.change("settings")}
                }
            },
            "controls" : {
                "A" : {
                    "label" : "Select",
                    "action" : function() {
                        $('.gp-on').trigger('click');
                    }
                },
                "B" : {
                    "label" : "Back",
                    "action" : function(){Menu.previous();}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        Controller.select("lobby-1");
                    }
                }
            }
        },
        "serverbrowser" : {
            "title" : "SERVERS",
            "previous" : "main",
            "onload" : function() {
                browsing = 1;
        		$('#browser').empty();
                $('#lobby').empty();
        		setTimeout(Browser.load, 1000);
        		loopPlayers = false;
            },
            "class" : "browser",
            "background": ["matchmaking","multiplayer"],
            "thumbnail": 0,
            "lists" : [],
            "options": {},
            "controls" : {
                "A" : {
                    "label" : "Select",
                    "action" : function() {
                        $('.gp-on').trigger('click');
                    }
                },
                "B" : {
                    "label" : "Back",
                    "action" : function(){Menu.previous();}
                },
                "X" : {
                    "label" : "Direct Connect",
                    "action" : function(){directConnect();}
                },
                "Y" : {
                    "label" : "Refresh",
                    "action" : function(){$('#refresh').trigger('click');}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        Controller.select("lobby-1");
                    }
                }
            }
        },
        "leaderboard" : {
            "title" : "LEADERBOARD",
            "previous" : "main",
            "onload" : function() {
                leading = 1;
        		$('#leaders').empty();
                $('#lobby').empty();
        		setTimeout(Leaderboard.load, 1000);
        		loopPlayers = false;
            },
            "class" : "leaderboard",
            "background": ["matchmaking","multiplayer"],
            "thumbnail": 0,
            "lists" : [],
            "options": {},
            "controls" : {
                "A" : {
                    "label" : "Select",
                    "action" : function() {
                        $('.gp-on').trigger('click');
                    }
                },
                "B" : {
                    "label" : "Back",
                    "action" : function(){Menu.previous();}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        Controller.select("lobby-1");
                    }
                }
            }
        },
        "matchmaking" : {
            "title" : "MATCHMAKING",
            "background" : ["matchmaking","multiplayer"],
            "previous" : "main",
			"onload" : function() {
				Setting.playlist.display();
			},
            "thumbnail": 1,
            "lists" : [
                "current-party",
                "friends-on"
            ],
            "options": {
                "PLAYLIST" : {
                    "description" : "Select a playlist that suits your favorite play style.",
                    "value" : Setting.playlist.current.toUpperCase(),
                    "action" : function() {Setting.change("playlist");}
                },
                "SEARCH RESTRICTIONS" : {
                    "description" : "Select options to prioritize how you get matched in matchmaking.",
                    "value" : "NONE (FASTEST)",
                    "action" : function() {Setting.change("restrictions")}
                },
                "PSYCH PROFILE" : {
                    "description" : "Select options that describe your playlist so that we can find you better matches.",
                    "action" : function() {Menu.change("psych")}
                },
                "START MATCHMAKING" : {
                     "description" : "Start selected Matchmaking game playlist.",
                     "action" : function() {
						 startSearch(Setting.playlist.current);
						 Menu.change("searching");
					 }
                }
            },
            "controls" : {
                "A" : {
                    "label" : "Select",
                    "action" : function() {
                        $('.gp-on').trigger('click');
                    }
                },
                "B" : {
                    "label" : "Back",
                    "action" : function(){Menu.previous()}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        Controller.select("lobby-1");
                    }
                }
            }
        },
		"searching" : {
            "title" : "SEARCHING",
            "background" : ["matchmaking","multiplayer"],
            "previous" : "matchmaking",
            "thumbnail": 0,
            "lists" : [
                "search"
            ],
            "options": {
                "SEARCHING FOR PLAYERS..." : {
                     "description" : "Matchmaking is a work in progress.",
                     "action" : function() {

                     }
                }
            },
            "controls" : {
                "A" : {
                    "label" : "Select",
                    "action" : function() {
                        $('.gp-on').trigger('click');
                    }
                },
                "B" : {
                    "label" : "Back",
                    "action" : function(){
						Menu.previous();
						matchmakingServer.send(JSON.stringify({
							type: 'leavesearch',
							playlist: Setting.playlist.selected,
							player: player
						}));
					}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        Controller.select("lobby-1");
                    }
                }
            }
        },
        "gamelobby" : {
            "title" : "ONLINE GAME",
            "background" : ["matchmaking","multiplayer"],
            "previous" : "serverbrowser",
            "thumbnail": 1,
            "lists" : [
                "current-party",
				"lobby"
            ],
            "options": {
				"GAME TYPE" : {
                     "description" : "The game type you are playing on this server.",
                     "value" : " ",
                },
				"MAP" : {
                     "description" : "The map you are playing on this server.",
                     "value" : " ",
                },
				"GAME OPTIONS" : {
                     "description" : "The rules for the server.",
                     "action" : function() {
                         //View lobby options
                     }
                },
                "JOIN GAME" : {
                     "description" : "Start the selected mission.",
                     "action" : function() {
                         //Join the game officially
                     }
                }
            },
            "controls" : {
                "A" : {
                    "label" : "Select",
                    "action" : function() {
                        $('.gp-on').trigger('click');
                    }
                },
                "B" : {
                    "label" : "Back",
                    "action" : function(){Menu.previous()}
                }
            }
        },
		"customgame" : {
            "title" : "CUSTOM GAME",
            "background" : ["custom_games","multiplayer"],
            "previous" : "main",
            "thumbnail": 1,
            "lists" : [
                "current-party",
				"lobby"
            ],
            "options": {
				"NETWORK" : {
                     "description" : "Choose which network to play on.",
                     "value" : "LOCAL",
                     "action" : function() {}
                },
				"GAME TYPE" : {
                     "description" : "Choose the game type you would like to play.",
                     "value" : "SLAYER",
                     "action" : function() {Menu.changeSetting("gametype")}
                },
				"MAP" : {
                     "description" : "Choose which map you want to play.",
                     "value" : "EDGE",
                     "action" : function() {Menu.changeSetting("map")}
                },
				"GAME OPTIONS" : {
                     "description" : "Choose the rules for the game.",
                     "action" : function() {

                     }
                },
                "START GAME" : {
                     "description" : "Start the selected mission.",
                     "action" : function() {

                     }
                }
            },
            "controls" : {
                "A" : {
                    "label" : "Select",
                    "action" : function() {
                        $('.gp-on').trigger('click');
                    }
                },
                "B" : {
                    "label" : "Back",
                    "action" : function(){Menu.previous()}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        Controller.select("lobby-1");
                    }
                }
            }
        },
		"forge" : {
            "title" : "FORGE",
            "background" : ["forge","multiplayer"],
            "previous" : "main",
            "thumbnail": 1,
            "lists" : [
                "current-party",
				"lobby"
            ],
            "options": {
				"NETWORK" : {
                     "description" : "Choose which network to play on.",
                     "value" : "LOCAL",
                     "action" : function() {}
                },
				"GAME TYPE" : {
                     "description" : "Choose the game type you would like to edit object setup for.",
                     "value" : "BASIC EDITING",
                     "action" : function() {Menu.changeSetting("gametype")}
                },
				"MAP" : {
                     "description" : "Choose which map you want to edit objects on.",
                     "value" : "EDGE",
                     "action" : function() {Menu.changeSetting("map")}
                },
				"GAME OPTIONS" : {
                     "description" : "Choose the rules for the game.",
                     "action" : function() {

                     }
                },
                "START GAME" : {
                     "description" : "Start the selected mission.",
                     "action" : function() {

                     }
                }
            },
            "controls" : {
                "A" : {
                    "label" : "Select",
                    "action" : function() {
                        $('.gp-on').trigger('click');
                    }
                },
                "B" : {
                    "label" : "Back",
                    "action" : function(){Menu.previous()}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        Controller.select("lobby-1");
                    }
                }
            }
        }
	},
    "maps" : {
        "guardian" : "Guardian",
        "riverworld" : "Valhalla",
        "s3d_avalanche" : "Diamondback",
        "s3d_edge" : "Edge",
        "s3d_reactor" : "Reactor",
        "s3d_turf" : "Icebox",
        "zanzibar" : "Last Resort",
        "cyberdyne" : "The Pit",
        "bunkerworld" : "Standoff",
        "chill" : "Narrows",
        "shrine" : "Sandtrap",
        "deadlock" : "High Ground",
        "hangem-high" : "Hangem-High CE"
    },
    "selected" : "main"
};
