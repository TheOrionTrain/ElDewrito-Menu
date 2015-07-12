function menuConvert(to) {
    $('#main2').empty();
    $('#main2').append('<div class="select-main"><div data-gp="main2-1" data-action="menu" data-menu="main-serverbrowser" class="selection"><span class="label">BROWSE SERVERS</span><span class="value">&nbsp;</span></div><div data-gp="main2-2" data-action="menu" data-menu="main-custom" class="selection"><span class="label">CUSTOM GAMES</span><span class="value">&nbsp;</span></div><div data-gp="main2-3" data-action="menu" data-menu="main-forge" class="selection"><span class="label">FORGE</span><span class="value">&nbsp;</span></div><div data-gp="main2-4" data-action="menu" data-menu="main-options" class="selection"><span class="label">SETTINGS</span><span class="value">&nbsp;</span></div><div data-gp="main2-5" data-action="menu" data-menu="main2-credits" class="selection"><span class="label">CREDITS</span><span class="value">&nbsp;</span></div></div>');
    if(to == "halo3") {
        settings.musictrack.current = 6;
        settings.musictrack.update();
        settings.background.current = 6;
        settings.background.update();
    }
    else if(to == "halo2") {
        $("#bg1").attr("src", "video/Halo 2.webm");
		settings.musictrack.current = 3;
		settings.musictrack.update();
		settings.background.current = 5;
		settings.background.update();
    }
    else if(to == "halo1") {
        $("#bg1").attr("src", "video/Halo CE.webm");
		settings.musictrack.current = 2;
		settings.musictrack.update();
		settings.background.current = 4;
		settings.background.update();
    }
    else if(to == "odst") {
        settings.musictrack.current = 8;
        settings.musictrack.update();
        settings.background.current = 7;
        settings.background.update();
    }
}
