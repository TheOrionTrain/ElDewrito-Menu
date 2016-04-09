var Lobby = {
    "address" : "0.0.0.0",
    "status" : false,
    "variant" : "not",
    "map" : "not",
    "players" : [],
    "update" : function() {
        if(Lobby.status && DewMenu.selected == "gamelobby") {
            $.getJSON("http://" + Lobby.address, function(d) {
                for(var i=0; i < Object.keys(d).length; i++) {
                    var x = Object.keys(d)[i];
                    Lobby[x] = d[x];
                }
                console.log(Lobby);
                var o = DewMenu.pages.gamelobby.options;
                o["GAME TYPE"].value = Lobby.variant;
                o["MAP"].value = Lobby.map;
                DewMenu.change("gamelobby");
            });
        }
    },
    "loop" : setInterval(function(){Lobby.update()},5000),
    "join" : function(s) {
        Lobby.address = servers[s].address;
        Lobby.status = 1;
        DewMenu.change("gamelobby");
		Lobby.update();
    }
},
DewMenu = {
    "change" : function(m) {
        if(DewMenu.pages[m]) {
            var ch = DewMenu.pages[m];
            if(ch.background) {
        		for(var i=0; i< ch.background.length; i++) {
        			if($('#bg-'+ch.background[i]).length) {
                        $('#videos > video').fadeOut(anit);
                        $('#videos > video')[0].pause();
        				$('#bg-'+ch.background[i]).stop().fadeIn(anit);
        				$('#bg-'+ch.background[i])[0].play();
        			}
        		}
        	} else {
                $('#videos > video').fadeOut(anit);
                $('#videos > video')[0].pause();
        		$('#bg1').stop().stop().fadeIn(anit);
        		$('#bg1')[0].play();
        	}
            $('#select-title').text(ch.title);
            if(ch.previous) {
                $('#select-previous').text(DewMenu.pages[ch.previous].title).click(function() {
                    DewMenu.previous();
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
                $('#select-main').append("<div class='selection' data-gp='"+m+"-"+(i+1)+"'>"+Object.keys(ch.options)[i]+v+"</div>");
            }
            $('#controls').empty();
            for(var i=0;i<Object.keys(ch.controls).length;i++) {
                var co = ch.controls[Object.keys(ch.controls)[i]];
                $('#controls').append("<div class='control-"+Object.keys(ch.controls)[i]+"'>"+co.label+"</div>");
            }
            gamepadSelect(m+"-1");
            DewMenu.selected = m;
            $('#select-main .selection').hover(function() {
    			$('#click')[0].currentTime = 0;
    			$('#click')[0].play();
                $('.selection').removeClass('gp-on');
        		$(this).addClass("gp-on");
        		gp_on = $(this).attr('data-gp').split("-")[1];
        		gamepadSelect(DewMenu.selected + "-" + gp_on);
                $('#description').text(DewMenu.pages[DewMenu.selected].options[Object.keys(DewMenu.pages[DewMenu.selected].options)[parseInt(gp_on)-1]].description);
    		});
            $('#select-main .selection').click(function() {
                var n = parseInt($(this).attr('data-gp').split("-")[1])-1;
                DewMenu.pages[DewMenu.selected].options[Object.keys(DewMenu.pages[DewMenu.selected].options)[n]].action();
            });
            $('#controls > div').click(function() {
                var button = $(this).attr('class').split('-')[1];
                DewMenu.pages[DewMenu.selected].controls[button].action();
            });
            $('#slide')[0].currentTime = 0;
            $('#slide')[0].play();
            if(ch.onload) {ch.onload();}
        }
    },
    "previous" : function() {
        DewMenu.change(DewMenu.pages[DewMenu.selected].previous);
    },
    "changeSetting" : function(set) {
        console.log("changeSetting: "+set);
        $('#beep')[0].currentTime = 0;
        $('#beep')[0].play();
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
                    "action" : function() {DewMenu.change("serverbrowser")}
                },
                "MATCHMAKING" : {
                    "description" : "Take your party online and into the frenetic action of live combat, objective-based missions, and dangerous military exercises.",
                    "action" : function() {DewMenu.change("matchmaking")}
                },
                "CUSTOM GAME" : {
                    "description" : "Take your party to combat and objective-based missions that you select and design. Your rules, your maps, your game.",
                    "action" : function() {
						dewRcon.send("server.lobbytype 2");
						DewMenu.change("customgame");
					}
                },
                "FORGE" : {
                     "description" : "Take your party to collaborate in real time to edit and play variations of your favorite maps, from the subtle to the insane.",
                     "action" : function() {
						 dewRcon.send("server.lobbytype 3");
						 DewMenu.change("forge");
					 }
                },
                "SETTINGS" : {
                    "description" : "Change how the game or menu plays or looks. You can customize everything from music, to the background, to the appearance of the server browser.",
                    "action" : function() {DewMenu.change("settings")}
                },
                "CREDITS" : {
                    "description" : "View the team of people who worked hard to build and take this menu to where it is today.",
                    "action" : function() {DewMenu.change("credits")}
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
                    "action" : function(){DewMenu.previous();}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        gamepadSelect("lobby-1");
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
        		setTimeout(loadServers, 1000);
        		loopPlayers = false;
            },
            "class" : "browser",
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
                    "action" : function(){DewMenu.previous();}
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
                        gamepadSelect("lobby-1");
                    }
                }
            }
        },
        "matchmaking" : {
            "title" : "MATCHMAKING",
            "background" : ["matchmaking","multiplayer"],
            "previous" : "main",
            "thumbnail": 1,
            "lists" : [
                "current-party",
                "friends-on"
            ],
            "options": {
                "PLAYLIST" : {
                    "description" : "Select a playlist that suits your favorite play style.",
                    "value" : "OFFLINE",
                    "action" : function() {DewMenu.changeSetting("playlist")}
                },
                "SEARCH RESTRICTIONS" : {
                    "description" : "Select options to prioritize how you get matched in matchmaking.",
                    "value" : "NONE (FASTEST)",
                    "action" : function() {DewMenu.changeSetting("restrictions")}
                },
                "PSYCH PROFILE" : {
                    "description" : "Select options that describe your playlist so that we can find you better matches.",
                    "action" : function() {DewMenu.change("psych")}
                },
                "START MATCHMAKING" : {
                     "description" : "Start selected Matchmaking game playlist.",
                     "action" : function() {DewMenu.change("searching")}
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
                    "action" : function(){DewMenu.previous()}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        gamepadSelect("lobby-1");
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
                "current-party"
            ],
            "options": {
                "SEARCHING FOR PLAYERS..." : {
                     "description" : "Searching for players...",
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
                    "action" : function(){DewMenu.previous()}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        gamepadSelect("lobby-1");
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
                     "value" : Lobby.variant.toUpperCase(),
                },
				"MAP" : {
                     "description" : "The map you are playing on this server.",
                     "value" : Lobby.map.toUpperCase(),
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
                    "action" : function(){DewMenu.previous()}
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
                     "action" : function() {DewMenu.changeSetting("gametype")}
                },
				"MAP" : {
                     "description" : "Choose which map you want to play.",
                     "value" : "EDGE",
                     "action" : function() {DewMenu.changeSetting("map")}
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
                    "action" : function(){DewMenu.previous()}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        gamepadSelect("lobby-1");
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
                     "action" : function() {DewMenu.changeSetting("gametype")}
                },
				"MAP" : {
                     "description" : "Choose which map you want to edit objects on.",
                     "value" : "EDGE",
                     "action" : function() {DewMenu.changeSetting("map")}
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
                    "action" : function(){DewMenu.previous()}
                },
                "START" : {
                    "label" : "Friends List",
                    "action" : function() {
                        gamepadSelect("lobby-1");
                    }
                }
            }
        }
	},
    "selected" : "main"
};
