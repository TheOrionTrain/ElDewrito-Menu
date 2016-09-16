/*
    (c) 2016 Brayden Strasen & Ryan Palmer
    http://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var Options = {
        change: function(s) {
            Options.changing = s;
            $('#options').empty().append('<div id="dot"></div><div id="options-previous"></div><div id="options-title"></div><div id="setting-thumbnail"></div><div id="setting-name"></div><div id="setting-info"></div><div id="setting-select" class="animated"></div>');
            $('#options-previous').text(Menu.pages[Menu.selected].title);
            $('#options-title').text(Options[s].title);
            if (Options[s].thumb) {
                $('#setting-thumbnail,#setting-name,#setting-info').show();
                $('#setting-thumbnail').css({
                    "background-image": "url('img/" + s + "/" + Options[s].selected + "/" + Options[s].current + ".jpg')"
                });
                $('#setting-name').text(Options[s].current);
                $('#setting-info').html(Options[s].options[Options[s].selected.toLowerCase()][Options[s].current].description);
            } else {
                $('#setting-thumbnail,#setting-name,#setting-info').hide();
            }
            for (i = 0; i < Object.keys(Options[s].options).length; i++) {
                b = Object.keys(Options[s].options)[i];
                $('#setting-select').append("<div data-gp='settings-" + (i + 1) + "' data-menu='" + b + "' class='selection'>" + b.toUpperCase() + "</div>");
                $('#setting-select .selection').click(function() {
                    var m = $(this).attr('data-menu');
                    $('.subsetting-select').hide().css({
                        "left": "360px",
                        "opacity": 0
                    });
                    $('#menu-' + m).css('display', 'block');
                    $('#menu-' + m).animate({
                        "left": "410px",
                        "opacity": 1
                    }, anit / 8);
                    Options[s].selected = m;
                    Audio.play("slide");
                });
                $('#setting-select .selection').hover(function() {
                    Audio.play("click");
                });
                $('#options').append("<div class='subsetting-select animated' id='menu-" + b + "'></div>");
                for (e = 0; e < Object.keys(Options[s].options[b]).length; e++) {
                    g = Object.keys(Options[s].options[b])[e];
                    $('#menu-' + b).append("<div data-gp='subsettings-" + b + "-" + (e + 1) + "' data-setting='" + g + "' class='selection'>" + g.toUpperCase() + "</div>");
                    $('.subsetting-select .selection').hover(function() {
                        var m = $(this).attr('data-setting'),
                            p = $(this).parent('.subsetting-select').attr('id').split("-")[1];
                        $('#setting-thumbnail').css({
                            "background-image": "url('img/" + s + "/" + p + "/" + m + ".jpg')"
                        });
                        $('#setting-name').text(m);
                        $('#setting-info').html(Options[s].options[p][m].description);
                        Audio.play("click");
                    });
                    $('.subsetting-select .selection').click(function() {
                        Options[s].current = $(this).attr('data-setting');
                        Options[s].display();
                        $('#options').fadeOut(anit);
                        Audio.play("slide");
                    });
                }
            }
            $('#options').fadeIn(anit);
            $('#options-previous').click(function() {
                $('#options').fadeOut(anit);
                Audio.play("slide");
            });
            Audio.play("slide");
        },
        playlist: {
            display: function() {
                $('[data-option="PLAYLIST"]').html("PLAYLIST <span class='value'>" + Options.playlist.current.toUpperCase() + "</span>");
                $('#map-thumb').css({
                    "background-image": "url('img/playlist/" + Options.playlist.selected + "/" + Options.playlist.current + ".jpg')"
                });
            },
            selected: "standard",
            current: "Slayer",
            title: "Playlist",
            thumb: 1,
            options: {
                standard: {},
                social: {}
            }
        },
        restrictions: {
            title: "Search Restrictions",
            options: {

            }
        }
    },
    Settings = {
        done: 0,
        list: [
            ['gamemenu', 'game.menuurl'],
            ['username', 'player.name'],
            ['servername', 'server.name'],
            ['centeredcrosshair', 'camera.crosshair'],
            ['fov', 'camera.fov'],
            ['starttimer', 'server.countdown'],
            ['maxplayers', 'server.maxplayers'],
            ['serverpass', 'server.password'],
            ['rawinput', 'input.rawinput'],
            ['saturation', 'graphics.saturation'],
            ['gameversion', 'game.version'],
            ['maplist', 'game.listmaps']
        ],
        load: function(i) {
            if(dewRconConnected) {
                for (var i = 0; i < Settings.list.length; i++) {
                    if (Settings.list[i][0] == "serverpass")
                        i++;
                    dewRcon.send(Settings.list[i][1], function(ret) {
                        if (Settings.list[i][0] == "gameversion") {
                            settings[Settings.list[i][0]].set(ret);
                            $('#version').text("ElDewrito " + ret);
                        } else if (Settings.list[i][0] == "maplist") {
                            mapList = new Array(ret.split(','));
                        } else {
                            settings[Settings.list[i][0]].current = ret;
                            settings[Settings.list[i][0]].update();
                        }
                    });
                    if (i != Settings.list.length) {} else {
                        if (!friendServerConnected)
                            StartConnection();
                        Settings.done = 1;
                        if (!dewRconConnected && hook) {
                            Music.song.pause();
                            $("video").each(function() {
                                $(this)[0].pause();
                            });
                            clearInterval(totallyLoopingPlayers);
                        }
                    }
                }
            }
            var categories = Object.keys(Settings);
            for (var i = 0; i < categories.length; i++) {
                var category = Settings[categories[i]];
                if (categories[i] != "done" && categories[i] != "list" && categories[i] != "load" && categories[i] != "update") {
                    var sets = Object.keys(category);
                    for (var g = 0; g < sets.length; g++) {
                        var setting = Settings[categories[i]][sets[g]];
                        if (!setting.load) {
                            setting.current = isset(localStorage.getItem(sets[g]), setting.original);
                            if (setting.type == "number") {
                                setting.current = parseFloat(setting.current);
                            }
                            console.log(sets[g] + ": " + setting.current);
                            setting.return();
                        }
                    }
                }
            }
        },
        update: function(setting, o = 0) {
            var p = setting.split('.');
            setting = Settings[p[0]][p[1]];
            setting.current = o;
            localStorage.setItem(p[1], setting.current);
            return setting.return();
        },
        menu: {
            background: {
                type: "choice",
                label: "Background",
                original: "Halo Reach",
                return: function() {
                    var c = Settings.menu.background.current,
                        s = Settings.menu.staticbg.current;
                    $('#videos').empty();
                    if (typeof backgrounds[c] == "object") {
                        var dir = backgrounds[c].folder,
                            files = backgrounds[c].files;
                        for (var i = 0; i < files.length; i++) {
                            var b = (i == 0) ? "bg1" : "bg-" + files[i];
                            if (s == "Off") {
                                $('#videos').append("<video id='" + b + "' src='video/" + dir + "/" + files[i] + ".webm' loop autoplay type='video/webm'></video>");
                            } else {
                                $('#videos').append("<img id='" + b + "' src='img/backgrounds/" + dir + "/" + files[i] + ".jpg'>");
                            }
                        }
                    } else if (typeof backgrounds[c] == "string") {
                        if (s == "Off") {
                            $('#videos').append("<video id='bg1' src='video/" + backgrounds[c] + ".webm' loop autoplay type='video/webm'></video>");
                        } else {
                            $('#videos').append("<img id='bg1' src='img/backgrounds/" + backgrounds[c] + ".jpg'>");
                        }
                    }
                    $('#bg1').show();
                    return c;
                }
            },
            musicvolume: {
                type: "number",
                label: "Music Volume",
                original: 0.25,
                min: 0,
                max: 1,
                increment: 0.05,
                return: function() {
                    var c = Settings.menu.musicvolume.current;
                    Music.song.volume = c;
                    return (c * 100).toFixed(0);
                }
            },
            staticbg: {
                type: "choice",
                label: "Static Background",
                original: "On",
                choices: [
                    "On",
                    "Off"
                ],
                return: function() {
                    var c = Settings.menu.staticbg.current;
                    Settings.menu.background.return();
                    return c;
                }
            }
        }
    }
