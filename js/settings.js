var settings = {
    "musictrack" : {
        "name" : "MENU MUSIC",
        "current" : 6,
        "min" : 0,
        "max" : 9,
        "default" : "Halo 3 Mythic",
        "labels" : [
            "Halo Reach",
            "Halo Reach Beta",
            "Halo Combat Evolved",
            "Halo 2",
            "Halo 2 Guitar",
            "Halo 3",
            "Halo 3 Mythic",
            "Halo 3 ODST",
            "ElDewrito",
            "Halo Online"
        ],
        "increment" : 1,
        "update" : function() {
            var c = settings.musictrack.current;
            $('#music').attr('src','audio/'+settings.musictrack.labels[c]+'.ogg');
            $("[data-option='musictrack']").children('.value').text(settings.musictrack.labels[c]);
        }
    },
    "resolution" : {
        "name" : "RESOLUTION",
        "current" : 0.5,
        "min" : 0,
        "max" : 1.5,
        "default" : "1280x720",
        "labels" : [
            "640x360",
            "1280x720",
            "1920x1080",
            "2560x1440"
        ],
        "increment" : 0.5,
        "update" : function() {
            var c = settings.resolution.current;
            $('#menu').css({'-webkit-transform':'scale('+(0.5+c)+')','-moz-transform':'scale('+(0.5+c)+')'});
            $("[data-option='resolution']").children('.value').text(settings.resolution.labels[c/0.5]);
        }
    },
    "background" : {
        "name" : "BACKGROUND",
        "current" : 0,
        "min" : 0,
        "max" : 5,
        "default" : "Halo Reach.webm",
        "labels" : [
            "Halo Reach.webm",
			"Halo CE.webm",
            "Crash.webm",
            "Halo Reach.mp4",
			"Halo CE.mp4",
            "Crash.mp4"
        ],
        "increment" : 1,
        "update" : function() {
            var c = settings.background.current;
            $('#bg').attr('src','video/'+settings.background.labels[c]);
            $("[data-option='background']").children('.value').text(settings.background.labels[c]);
        }
    },
    "logo" : {
        "name" : "LOGO",
        "current" : 0,
        "min" : 0,
        "max" : 2,
        "default" : "Halo 3 CE",
        "labels" : [
            "Halo 3 CE",
			"ElDewrito",
            "Halo Online"
        ],
        "increment" : 1,
        "update" : function() {
            var c = settings.logo.current;
            $('#dewrito').css({'background':"url('img/"+settings.logo.labels[c]+".png') no-repeat 0 0/cover"});
            $("[data-option='logo']").children('.value').text(settings.logo.labels[c]);
        }
    },
    "musicvolume" : {
        "name" : "MUSIC VOLUME",
        "current" : 0.25,
        "min" : 0,
        "max" : 1,
        "default" : 25,
        "increment" : 0.05,
        "update" : function() {
            var c = settings.musicvolume.current;
            $('#music')[0].volume = c;
            $("[data-option='musicvolume']").children('.value').text(Math.round(c*100));
        }
    },
    "sfxvolume" : {
        "name" : "EFFECTS VOLUME",
        "current" : 0.05,
        "min" : 0,
        "max" : 1,
        "default" : 5,
        "increment" : 0.05,
        "update" : function() {
            var c = settings.sfxvolume.current;
            $('#click')[0].volume = c;
            $('#slide')[0].volume = c;
            $("[data-option='sfxvolume']").children('.value').text(Math.round(c*100));
        }
    }
},

maps = {
    "HaloOnline" : {
        "name": "HALO ONLINE",
        "DIAMONDBACK" : "Hot winds blow over what should be a dead moon. A reminder of the power the Forerunners once wielded.",
        "EDGE" : "The remote frontier world of Parition has provided this ancient databank with the safety of seclusion.",
        "GUARDIAN" : "Millennia of tending has produced trees as ancient as the Forerunner structures they have grown around.",
        "ICEBOX" : "Though they dominate on the open terrain, many Scarabs have fallen victim to the narrow streets of Earth's cities.",
        "REACTOR" : "Being constructed just prior to the Invasion, its builders had to evacuate before it was completed.",
        "RIVERWORLD" : "The crew of V-398 barely survived their unplanned landing in this gorge... this curious gorge."
    },
    "HaloReach" : {
        "name": "HALO REACH",
        "ANCHOR 9" : "Orbital dockyards provide rapid refueling and repairs for a variety of UNSC vessels.",
        "BATTLE CANYON" : "The telemetry spires in these canyons help manage the Halo ring’s vast translocation grid.",
        "BOARDWALK" : "New Alexandria's civilian concourses provide access to rapid transit and views of Reach's serene vistas.",
        "BONEYARD" : "The once formidable Commonwealth awaits its final destination at one of the UNSC's ship breaking facilities.",
        "BREAKNECK" : "The initial Covenant strike is over, but the fight for Mombasa has just begun.",
        "BREAKPOINT" : "ONI officials believe the data buried within this artifact is key to our survival.",
        "CONDEMNED" : "The final moments aboard Orbital Gamma Station, a human communications space station.",
        "COUNTDOWN" : "It was only a matter of time before even the most clandestine UNSC operations were thrust into the public eye.",
        "HIGH NOON" : "Despite millennia of abandonment, transportation facilities like this one continue to function flawlessly.",
        "HIGHLANDS" : "A training facility located in the Highland Mountains, where Spartans are born.",
        "PENANCE" : "The Covenant have harnessed the waters of this moon to refuel their massive supercarriers.",
        "POWERHOUSE" : "Hydroelectric plants like this one provide clean, sustainable energy for the inhabitants of Reach.",
        "REFLECTION" : "Reach's elite mix business with pleasure, building lavish penthouses atop soaring corporate ivory towers.",
        "RIDGELINE" : "Overlooking one of Halo's impressive relay complexes, this idyllic cliffside once served as a UNSC staging area.",
        "SOLITARY" : "The security spire's damaged interior only hints at the terrifying power of its previous inhabitant.",
        "SPIRE" : "Shielding infantry from aerial assault, these massive spires force the Covenant’s foes to fight on deadly ground.",
        "SWORD BASE" : "Before Winter Contingency was declared, ONI spooks kept themselves occupied in this remote installation.",
        "TEMPEST" : "Though we may never fully understand these devices, it is not our nature to leave ancient stones unturned.",
        "ZEALOT" : "Covenant vessels like the Ardent Prayer are a prelude to the devastation the full fleet can visit upon a planet."
    },
    "Halo1" : {
        "name": "HALO COMBAT EVOLVED",
        "BATTLE CREEK" : "Splash Splash, Bang Bang.",
        "BLOOD GULCH" : "The Quick and the Dead.",
        "BOARDING ACTION" : "Ship-to-Ship Combat.",
        "CHILL OUT" : "Dude, you really need to...",
        "CHIRON TL-34" : "Spartan Clone Training Complex.",
        "DAMNATION" : "Covenant Hydro-Processing Center.",
        "DANGER CANYON" : "Don't Look Down... Unless You Fall.",
        "DEATH ISLAND" : "Sand, Surf, and Spent Shells.",
        "DERELICT" : "Deep Space Anomaly #0198.",
        "GEPHYROPHOBIA" : "Scary, huh?",
        "HANG EM HIGH" : "Tombstones for Everybody.",
        "ICE FIELDS" : "Slipping and Sliding.",
        "INFINITY" : "I imagined it would be bigger.",
        "LONGEST" : "A long walk down a short hall...",
        "PRISONER" : "Get on Top.",
        "RAT RACE" : "Up the Ramps, Down the Tubes.",
        "SIDEWINDER" : "Red Blood, White Snow",
        "TIMBERLAND" : "An enemy behind every tree!",
        "WIZARD" : "Round and Round and Round."
    },
    "Halo2" : {
        "name": "HALO 2",
        "ASCENSION" : "This relay station is part of a network that has kept Delta Halo functioning smoothly for untold centuries.",
        "BACKWASH" : "There are strong indications that beneath the shroud of mist drowning this swamp on Delta Halo lies a powerful intelligence.",
        "BEAVER CREEK" : "These forgotten structures were once the site of many bitter battles but have since been reclaimed by nature.",
        "BURIAL MOUNDS" : "This makeshift Heretic camp on Basis is littered with wreckage from the destruction of Installation 04.",
        "COAGULATION" : "Recent excavations have failed to shed light on the true purpose of the outposts in this bloody gulch.",
        "COLOSSUS" : "Numerous scientific expeditions have failed to reveal what the Forerunners intended with all this damn gas.",
        "CONTAINMENT" : "Fighting for a patch of dirt abutting a wall containing a galaxy-devouring parasite may seem pointless to some, but ... um ....",
        "DESOLATION" : "Once a scientific outpost, this derelict Forerunner facility waits patiently to be reactivated.",
        "DISTRICT" : "The alleys of Old Mombasa were never kind to the unwary. On Covenant-controlled Earth, ramshackle homes prove ideal for ambush.",
        "ELONGATION" : "A well-placed bribe can speed a cargo ship through what are surely some of the longest inspections in the galaxy.",
        "FOUNDATION" : "Deep in Chicago Industrial Zone 08 lies the decommissioned Tactical Autonomous Robotic Defense System testing facility.",
        "GEMINI" : "This sanctuary now rings with the sound of combat - the end of the ancient duality of the Covenant is truly at hand.",
        "HEADLONG" : "Although during the day Section 14 monitors almost all harbour traffic, at night it's one of the city's most notorious hangouts.",
        "IVORY TOWER" : "Once home to the famous socialite Lance O'Donnell, the top floor of this building is now a public park.",
        "LOCKOUT" : "Some believe this remote facility was once used to study the Flood. But few clues remain amidst the snow and ice.",
        "MIDSHIP" : "Don't let its luxury fool you - the Pious Inquisitor is one of the fastest ships in the Covenant fleet.",
        "RELIC" : "Covenant scripture dictates that structures of this type are memorials to Forerunners who fell in battle against the Flood.",
        "SANCTUARY" : "Though its original purpose has been lost to the march of eons, this structure is now a cemetery to countless brave warriors.",
        "TERMINAL" : "The CTMS made New Mombasa's rail system one of the safest on Earth; unfortunately it was one of the Covenant's first targets.",
        "TOMBSTONE" : "The UNSC decommissioned this munitions testing complex after safety concerns came to light.",
        "TURF" : "Though they dominate on open terrain, many Scarabs have fallen victim to the narrow streets of Earth's cities.",
        "UPLIFT" : "Unknowable energies see the from this long-abandoned Forerunner spire, making it a vital prize for Covenant and Human forces.",
        "WARLOCK" : "Despite overwhelming evidence to the contrary, some stubbornly maintain that this structure was once a Forerunner arena.",
        "WATERWORKS" : "While the Forerunners excelled at mimicking natural beauty, the machinery in this cavern exemplifies their true genius.",
        "ZANZIBAR" : "Wind Power Station 7 sits as a mute reminder of the EAP's late 25th-century attempt at re-nationalization."
    },
    "Halo3" : {
        "name": "HALO 3",
        "ASSEMBLY" : "The Covenant war machine continues its march to conquest; even with its head severed it is still dangerous",
        "AVALANCHE" : "“Freezing winds scour blasted terrain, and ancient battle scars are a grim reminder that this is a precious prize.",
        "BLACKOUT" : "Bathed in frozen moonlight, this abandoned drilling platform is now a monument to human frailty.",
        "CITADEL" : "In the heart of this Forerunner structure, far above the troubled surface of the Ark, another battle rages.",
        "COLD STORAGE" : "Deep in the bowels of Installation 05 things have gotten a little out of hand. I hope you packed extra underwear.",
        "CONSTRUCT" : "Vast quantities of water and other raw materials are consumed in creating even the smallest orbital installations.",
        "EPITAPH" : "Some believe the Forerunner preferred desolate places. Others suggest that few other sites survived the Flood.",
        "FOUNDRY" : "After the orbital elevator fell, supply warehouses sending munitions to space were soon abandoned.",
        "GHOST TOWN" : "These fractured remains near Voi remind us that brave souls died here to buy our salvation.",
        "GUARDIAN" : "Millennia of tending has produced trees as ancient as the Forerunner structures they have grown around.",
        "HERETIC" : "Because of its speed and luxury the Pious Inquisitor has become an irresistible prize during these dark times.",
        "HIGH GROUND" : "A relic of older conflicts, this base was reactivated after the New Mombasa Slipspace Event.",
        "ISOLATION" : "Containment protocols are almost impervious to pre-Gravemind infestations. What could possibly go wrong?",
        "LAST RESORT" : "Remote industrial sites like this one are routinely requisitioned and used as part of Spartan training exercises.",
        "LONGSHORE" : "Abandoned during the invasion of Earth, the Mombasa Quays are now bereft of commerce, but rife with danger.",
        "NARROWS" : "Without cooling systems such as these, excess heat from the Ark's forges would render the construct uninhabitable.",
        "ORBITAL" : "With a lot of situational awareness, and a little luck, hopefully the only thing you will lose is your luggage.",
        "RAT NEST" : "Snowmelt from Kilimanjaro feeds reservoirs every bit as vital as the fuel and ammunition stores.",
        "SANDBOX" : "This endless wasteland still holds many secrets. Some of them are held more deeply than others.",
        "SANDTRAP" : "Although the Brute occupiers have been driven from this ancient structure, they left plenty to remember them by.",
        "SNOWBOUND" : "Hostile conditions did not prevent the Covenant from seeking salvage on this buried Forerunner construct.",
        "STANDOFF" : "Once, nearby telescopes listened for a message from the stars. Now, these silos contain our prepared response.",
        "THE PIT" : "Software simulations are held in contempt by the veteran instructors who run these training facilities.",
        "VALHALLA" : "The crew of V-398 barely survived their unplanned landing in this gorge... this curious gorge."
    },
    "Custom" : {
        "name" : "CUSTOM MAPS"
    }
};
