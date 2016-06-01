/*
    (c) 2016 Brayden Strasen & Ryan Palmer
    http://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var Setting = {
    change: function(s) {
        Setting.changing = s;
        $('#options').empty().append('<div id="dot"></div><div id="options-previous"></div><div id="options-title"></div><div id="setting-thumbnail"></div><div id="setting-name"></div><div id="setting-info"></div><div id="setting-select" class="animated"></div>');
        $('#options-previous').text(Menu.pages[Menu.selected].title);
        $('#options-title').text(Setting[s].title);
        if (Setting[s].thumb) {
            $('#setting-thumbnail,#setting-name,#setting-info').show();
            $('#setting-thumbnail').css({
                "background-image": "url('img/" + s + "/" + Setting[s].selected + "/" + Setting[s].current + ".jpg')"
            });
            $('#setting-name').text(Setting[s].current);
            $('#setting-info').html(Setting[s].options[Setting[s].selected.toLowerCase()][Setting[s].current].description);
        } else {
            $('#setting-thumbnail,#setting-name,#setting-info').hide();
        }
        for (i = 0; i < Object.keys(Setting[s].options).length; i++) {
            b = Object.keys(Setting[s].options)[i];
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
                Setting[s].selected = m;
                Audio.slide.currentTime = 0;
                Audio.slide.play();
            });
            $('#setting-select .selection').hover(function() {
                Audio.click.currentTime = 0;
                Audio.click.play();
            });
            $('#options').append("<div class='subsetting-select animated' id='menu-" + b + "'></div>");
            for (e = 0; e < Object.keys(Setting[s].options[b]).length; e++) {
                g = Object.keys(Setting[s].options[b])[e];
                $('#menu-' + b).append("<div data-gp='subsettings-" + b + "-" + (e + 1) + "' data-setting='" + g + "' class='selection'>" + g.toUpperCase() + "</div>");
                $('.subsetting-select .selection').hover(function() {
                    var m = $(this).attr('data-setting'),
                        p = $(this).parent('.subsetting-select').attr('id').split("-")[1];
                    $('#setting-thumbnail').css({
                        "background-image": "url('img/" + s + "/" + p + "/" + m + ".jpg')"
                    });
                    $('#setting-name').text(m);
                    $('#setting-info').html(Setting[s].options[p][m].description);
                    Audio.click.currentTime = 0;
                    Audio.click.play();
                });
                $('.subsetting-select .selection').click(function() {
                    Setting[s].current = $(this).attr('data-setting');
                    Setting[s].display();
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
            $('[data-option="PLAYLIST"]').html("PLAYLIST <span class='value'>" + Setting.playlist.current.toUpperCase() + "</span>");
            $('#map-thumb').css({
                "background-image": "url('img/playlist/" + Setting.playlist.selected + "/" + Setting.playlist.current + ".jpg')"
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
};
