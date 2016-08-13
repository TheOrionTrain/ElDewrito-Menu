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
                    Audio.slide.currentTime = 0;
                    Audio.slide.play();
                });
                $('#setting-select .selection').hover(function() {
                    Audio.click.currentTime = 0;
                    Audio.click.play();
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
                        Audio.click.currentTime = 0;
                        Audio.click.play();
                    });
                    $('.subsetting-select .selection').click(function() {
                        Options[s].current = $(this).attr('data-setting');
                        Options[s].display();
                        $('#options').fadeOut(anit);
                        Audio.slide.currentTime = 0;
                        Audio.slide.play();
                    });
                }
            }
            $('#options').fadeIn(anit);
            $('#options-previous').click(function() {
                $('#options').fadeOut(anit);
                Audio.slide.currentTime = 0;
                Audio.slide.play();
            });
            Audio.slide.currentTime = 0;
            Audio.slide.play();
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
            if (i != Settings.list.length) {
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
                    i++;
                    Settings.load(i);
                });
            } else {
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
