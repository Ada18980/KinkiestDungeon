
interface ConsentListData {
    name: string,
    data?: Record<string, string>,
    color: string,
    bordercolor: string,
    textColor: string,
    priority: number,

    perkRed: string,
    perkYellow: string,
    perkGreen: string,
    perkNoRed?: string,
    perkNoYellow?: string,
    perkNoGreen?: string,

    /** for backwards compatibility when backporting consent */
    populateFromNoPerks?: boolean,
    /** this one does NOT get turned on when loading a save, if current one is not enabled*/
    dontPopulateFromSave?: boolean,

    label: string,
    tooltip: string,

    prereq?: () => boolean,
}


interface ConsentListEventData {
    list: ConsentListData[],
    player: entity,
    consentsToShow?: string[],
}


let KDConsentListBasic: Record<string, ConsentListData> = {

    

    PlugFront: {
            name: "PlugFront",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,

            prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode");},

            perkRed: "arousalModePlugNoFront",
            perkYellow: "",
            perkGreen: "",
            perkNoRed: "arousalModePlugFront",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "PlugFront"),
            tooltip: TextGet("KDConsentListDesc_" + "PlugFront"),
        },


    PlugRear: {
            name: "PlugRear",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,

            prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode");},

            perkRed: "arousalModePlugNoRear",
            perkNoRed: "arousalModePlug",
            perkYellow: "",
            perkGreen: "",

            populateFromNoPerks: true,

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "PlugRear"),
            tooltip: TextGet("KDConsentListDesc_" + "PlugRear"),
        },

        
    ChastityBra: {
            name: "ChastityBra",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,

            prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode");},

            perkRed: "FreeBoob2",
            perkYellow: "FreeBoob1",
            perkGreen: "",


            priority: -10,
            label: TextGet("KDConsentListDesc_" + "ChastityBra"),
            tooltip: TextGet("KDConsentListDesc_" + "ChastityBra"),
        },
    ChastityBelt: {
            name: "ChastityBelt",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,

            prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode");},

            perkRed: "NoBelt2",
            perkYellow: "NoBelt1",
            perkGreen: "",


            priority: -10,
            label: TextGet("KDConsentListDesc_" + "ChastityBelt"),
            tooltip: TextGet("KDConsentListDesc_" + "ChastityBelt"),
        },

    Tickle: {
            name: "Tickle",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "Less_Tickle",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Tickle"),
            tooltip: TextGet("KDConsentListDesc_" + "Tickle"),
        },
    Shocks: {
            name: "Shocks",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "Estim",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Shocks"),
            tooltip: TextGet("KDConsentListDesc_" + "Shocks"),
    },
    
    Brats: {
            name: "Brats",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "NoBrats",
            perkGreen: "OnlyBrats",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Brats"),
            tooltip: TextGet("KDConsentListDesc_" + "Brats"),
    },

    Encasement: {
            name: "Encasement",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "SlimeOptout",
            perkGreen: "SlimePref",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Encasement"),
            tooltip: TextGet("KDConsentListDesc_" + "Encasement"),
    },
    Tape: {
            name: "Tape",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "TapeOptout",
            perkGreen: "TapePref",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Tape"),
            tooltip: TextGet("KDConsentListDesc_" + "Tape"),
    },
    Armbinders: {
            name: "Armbinders",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "Less_Armbinders",
            perkGreen: "More_Armbinders",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Armbinders"),
            tooltip: TextGet("KDConsentListDesc_" + "Armbinders"),
    },
    Boxbinders: {
            name: "Boxbinders",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "Less_Boxbinders",
            perkGreen: "More_Boxbinders",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Boxbinders"),
            tooltip: TextGet("KDConsentListDesc_" + "Boxbinders"),
    },
    Jackets: {
            name: "Jackets",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "Less_Jackets",
            perkGreen: "More_Jackets",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Jackets"),
            tooltip: TextGet("KDConsentListDesc_" + "Jackets"),
    },
    Yokes: {
            name: "Yokes",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "Less_Yokes",
            perkGreen: "More_Yokes",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Yokes"),
            tooltip: TextGet("KDConsentListDesc_" + "Yokes"),
    },
    Petsuits: {
            name: "Petsuits",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "NoPet",
            perkGreen: "More_Petsuits",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Petsuits"),
            tooltip: TextGet("KDConsentListDesc_" + "Petsuits"),
    },
    Hypnosis: {
            name: "Hypnosis",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "NoHypno",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Hypnosis"),
            tooltip: TextGet("KDConsentListDesc_" + "Hypnosis"),
    },
    DollTransform: {
            name: "DollTransform",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "NoDollTransform",
            perkYellow: "",
            perkGreen: "PermaDoll",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "DollTransform"),
            tooltip: TextGet("KDConsentListDesc_" + "DollTransform"),
    },
    /*DollTransformArousal: {
            name: "DollTransformArousal",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,

            prereq: () => {return KinkyDungeonStatsChoice.get("arousalMode");},

            perkRed: "",
            perkYellow: "NoDollTransformArousal",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "DollTransformArousal"),
            tooltip: TextGet("KDConsentListDesc_" + "DollTransformArousal"),
    },*/
    Bubbles: {
            name: "Bubbles",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "BubbleOptout",
            perkGreen: "BubblePref",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Bubbles"),
            tooltip: TextGet("KDConsentListDesc_" + "Bubbles"),
    },
    DollTerminal: {
            name: "DollTerminal",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "NoDoll",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "DollTerminal"),
            tooltip: TextGet("KDConsentListDesc_" + "DollTerminal"),
    },
    Invis: {
            name: "Invis",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "NoInvis",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Invis"),
            tooltip: TextGet("KDConsentListDesc_" + "Invis"),
        },
    SenseDep: {
            name: "SenseDep",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "NoSenseDep",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "SenseDep"),
            tooltip: TextGet("KDConsentListDesc_" + "SenseDep"),
    },
    Kigu: {
            name: "Kigu",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "NoKigu",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Kigu"),
            tooltip: TextGet("KDConsentListDesc_" + "Kigu"),
        },
    Hoods: {
            name: "Hoods",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "NoHood",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Hoods"),
            tooltip: TextGet("KDConsentListDesc_" + "Hoods"),
    },
    Masks: {
            name: "Masks",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "Unmasked",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Masks"),
            tooltip: TextGet("KDConsentListDesc_" + "Masks"),
    },
    Blindfolds: {
            name: "Blindfolds",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "NoBlindfolds",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Blindfolds"),
            tooltip: TextGet("KDConsentListDesc_" + "Blindfolds"),
    },
    Rough: {
            name: "Rough",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "",
            perkYellow: "NoRough",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Rough"),
            tooltip: TextGet("KDConsentListDesc_" + "Rough"),
    },
    Nurses: {
            name: "Nurses",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "NoNurse",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Nurses"),
            tooltip: TextGet("KDConsentListDesc_" + "Nurses"),
    },
    Police: {
            name: "Police",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "NoPolice",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Police"),
            tooltip: TextGet("KDConsentListDesc_" + "Police"),
    },
    Ballsuit: {
            name: "Ballsuit",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "BallsuitOptout",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "Ballsuit"),
            tooltip: TextGet("KDConsentListDesc_" + "Ballsuit"),
    },
    PrisonerMarkings: {
            name: "PrisonerMarkings",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "NoPrisonerMarkings",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "PrisonerMarkings"),
            tooltip: TextGet("KDConsentListDesc_" + "PrisonerMarkings"),
    },
    SleepFood: {
            name: "SleepFood",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "No_SleepFood",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "SleepFood"),
            tooltip: TextGet("KDConsentListDesc_" + "SleepFood"),
    },
    ArousalFood: {
            name: "ArousalFood",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "No_ArousalFood",
            perkYellow: "",
            perkGreen: "",

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "ArousalFood"),
            tooltip: TextGet("KDConsentListDesc_" + "ArousalFood"),
    },
    ConsentIngame: {
            name: "ConsentIngame",
            color: KDBaseWhite,
            bordercolor: KDBaseTeal,
            textColor: KDBaseWhite,


            perkRed: "LockMenuWhileTied",
            perkYellow: "",
            perkGreen: "",

            dontPopulateFromSave: true,

            priority: -10,
            label: TextGet("KDConsentListDesc_" + "ConsentIngame"),
            tooltip: TextGet("KDConsentListDesc_" + "ConsentIngame"),
    },
};

function KDEnumerateConsentList(sort: boolean = true, player?: entity, consentsToShow?: string[]): ConsentListData[] {
    let data: ConsentListEventData = {
        list: [],
        player: player || KDPlayer(),
        consentsToShow: consentsToShow,
    };

    KinkyDungeonSendEvent("enumerateConsentBefore", data);

    // enumerate vanilla consent options
    for (let kink of Object.values(KDConsentListBasic)) {
        if (!consentsToShow || consentsToShow.includes(kink.name)) {
            let txt = KDConsentFilter ? TextGet("KDConsentItem_" + kink.name).toLocaleLowerCase() : "";

            if (KDConsentFilter != ""
                && !(txt == KDConsentFilter.toLocaleLowerCase()
                || txt.includes(KDConsentFilter.toLocaleLowerCase())))
                continue;
                
            if (!kink.prereq || kink.prereq())
                data.list.push(kink);
        }
       
    }

    
    KinkyDungeonSendEvent("enumerateConsentAfter", data);


    if (sort) {
        data.list = data.list.sort((a, b) => {
            return b.priority - a.priority;
        });
    }
    return data.list;
}

let KDConsent_Sidebar = 580;
let KDConsent_SideOffset = 80;
let KDConsent_Buttonstart = 386;
let KDConsent_Buttonspace = 94;

let KDShowConsents: string[] = null;
let KDUpdatedSeenConsents = true;

function KDDrawConsentHeader(xOffset, sidebar, headery, linespace, ii, fontsizeheading) {
    if (KinkyDungeonPreviousState != "Menu") {
        DrawTextFitKD(TextGet("KinkyDungeonConsent"), 
                xOffset + sidebar + (PIXIWidth - xOffset - sidebar - 20)/2, 
                headery + linespace*ii++, 
                (PIXIWidth - xOffset - 80 - sidebar), KDBaseWhite, undefined, fontsizeheading)
        DrawTextFitKD(TextGet("KDConsentLimits_Red"), 
                xOffset + sidebar + (PIXIWidth - xOffset - sidebar - 20)/2, 
                headery + linespace*ii++, 
                (PIXIWidth - xOffset - 80 - sidebar), KDBaseRed, KDBaseBlack, fontsizeheading)
        DrawTextFitKD(TextGet("KDConsentLimits_Yellow"), 
                xOffset + sidebar + (PIXIWidth - xOffset - sidebar - 20)/2, 
                headery + linespace*ii++, 
                (PIXIWidth - xOffset - 80 - sidebar), KDBaseYellow, KDBaseBlack, fontsizeheading)
        DrawTextFitKD(TextGet("KDConsentLimits_Green"), 
                xOffset + sidebar + (PIXIWidth - xOffset - sidebar - 20)/2, 
                headery + linespace*ii++, 
                (PIXIWidth - xOffset - 80 - sidebar), KDBaseGreal, KDBaseBlack, fontsizeheading)
        DrawTextFitKD(TextGet("KinkyDungeonConsent2"), 
                xOffset + sidebar + (PIXIWidth - xOffset - sidebar - 20)/2, 
                headery + linespace*ii++, 
                (PIXIWidth - xOffset - 80 - sidebar), KDBaseWhite, undefined, fontsizeheading)
    } else {
        DrawTextFitKD(TextGet("KDNewConsentInfo"), 
                xOffset + sidebar + (PIXIWidth - xOffset - sidebar - 20)/2, 
                headery + linespace*ii++, 
                (PIXIWidth - xOffset - 80 - sidebar), KDBaseWhite, undefined, fontsizeheading)
    }
    
    return ii;
}

let KDSeenConsents: string[] = [];
let KDCheckedConsentAtStartup = true; // is set false later in KDFirstRunMainmenu

function KDDrawConsent(xOffset) {



    let MainList = "Consent_List";

    let sidebar = KDConsent_Sidebar;
    
	let horizontal = false;
    let x = sidebar + 50 + xOffset;
    let wList = PIXIWidth - KDConsent_SideOffset - x;
    let yStart = 200;
    let wspacing = 150;
    let h = PIXIHeight - yStart - 140;
    let spacing = 80;

    let ii = 0;
    let linespace = 24;
    let fontsizeheading = 18;
    let headery = 80;
    ii = KDDrawConsentHeader(xOffset, sidebar, headery, linespace, ii, fontsizeheading);

    DrawTextFitKD(
		TextGet("KDConsentFilter"),
		700, 890, 300, KDBaseWhite, KDTextGray0, 18, "center");
	let TF = KDTextField("ConsentFilter", 550, 910,  300, 45, "text", "", "45");
	if (TF.Created) {
		KDConsentFilter = "";
		TF.Element.oninput = (_event: any) => {
			KDConsentFilter = ElementValue("ConsentFilter");
		};
	}

    if (!KDUpdatedSeenConsents) {
        for (let kink of Object.values(KDConsentListBasic)) {
            if (!KDSeenConsents.includes(kink.name)) {
                KDSeenConsents.push(kink.name);
            }
        }
        localStorage.setItem("KDSeenConsents", JSON.stringify(KDSeenConsents));
        KDUpdatedSeenConsents = true;
    }



    if (ShouldUpdateList(MainList)) {
        let list: ConsentListData[] = KDEnumerateConsentList(undefined, undefined, KDShowConsents);
        PopulateList(MainList, x, yStart, horizontal ? h : wList, 
            horizontal ? wList : h, 50, 
            Math.round(h/spacing), 
            list, false
        );
    }

    let listspacing = 100;

    let hotkeyUp = KinkyDungeonKey[0];
    let hotkeyDown = KinkyDungeonKey[2];
    let drawn: ConsentListData = KDDrawScrollableList(MainList, true, (
        container: PIXIContainer,
        isClickable: boolean,
        item: ConsentListData,
        index: number,
        visualIndex: number,
        isSelected: boolean,
        selectedIndex: number,
        list: KDScrollableListData)  => {
        let it = item;
		let w = list.w - 40;
        DrawTextFitKDTo(container, TextGet("KDConsentItem_" + item.name,
            item.data), 
            list.x + 25 + (horizontal ? visualIndex * 80 : 0), list.y + listspacing/2 + (horizontal ? 0 : visualIndex * 80), 
            w - 80, item.textColor, undefined, undefined, "left")
		   
        ii = 0;
        let hh = 64;
        for (let color of ["Red", "Yellow", "", "Green"]) {
            if (item["perk" + color] || !color)
                DrawCheckboxKDExTo(container, item.name + "_" + color, 
                    () => {
                        if (!color) delete KDConsentArray[item.name];
                        else if (KDConsentArray[item.name] == color) {
                            delete KDConsentArray[item.name];
                        } else KDConsentArray[item.name] = color;
                        KDUpdatePlugSettings(true);
                        KDSaveToggles();
                        return true;
                    }, isClickable, 
                    list.x + KDConsent_Buttonstart + (horizontal ? visualIndex * 80 : 0) + KDConsent_Buttonspace*ii, 
                    list.y + listspacing/2 - hh/2 + (horizontal ? 0 : visualIndex * 80), 
                    hh, hh, "", KDConsentArray[item.name] == color || (!color && !KDConsentArray[item.name]), 
                    undefined, undefined,
                    "UI/Consent" + (color || "Check") + ".png", {
                        bordercolor: KDColorList["KDBase" + (color || "White")],
                        centered: true
                    });
            ii++;
            }

        if (MouseIn(list.x + 10 + (horizontal ? visualIndex * 80 : 0), 
            list.y + (horizontal ? 0 : visualIndex * 80),
            w - 10, 
            listspacing)) {
                KDConsentListItem = item.name;
            }
        if (KDConsentListItem == item.name) {
            DrawRectKD(container, kdpixisprites, name + "border", {
				Left: list.x + 10 + (horizontal ? visualIndex * 80 : 0), 
				Top: list.y + (horizontal ? 0 : visualIndex * 80) + 5,
				Width: w - 20, 
				Height: listspacing-10,
				Color: KDUIColorHighlight,
				alpha: KDUIAlphaHighlight,
				LineWidth: 2,
				zIndex: - 0.9,
			});

            return true;
        }
        return false;
    }, undefined, 
    horizontal, 
    undefined, undefined, hotkeyUp, hotkeyDown,
        0.3, 1, KDUIColor);

    if (DrawButtonKDEx("removeGuest", (_b) => {
			if (!KDConfirmOverInventoryAction) {
				KDConfirmOverInventoryAction = true;
                if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/ClickError.ogg");
			} else {
				KDSendInput("safeword", {
					player: KDPlayer().id,
				});
                KinkyDungeonPreviousState = "";
                KinkyDungeonState = "Game";
                KinkyDungeonDrawState = "Game";
				KDConfirmOverInventoryAction = false;
			}
			if (KDSoundEnabled())
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "Damage" + ".ogg");
			return true;
		}, KDSafewordEnabled(),
            1500, 900, 350, 64, TextGet(
            KDConfirmOverInventoryAction ? "KDSafewordConfirm" : "KDSafeword"
        ), KDSafewordEnabled() ? KDBaseWhite : KDBaseLightGrey, "", undefined, !KDSafewordEnabled(), undefined, undefined,
        undefined, undefined, KDSafewordEnabled() ? {
            hotkey: KDHotkeyToText(KinkyDungeonKeyEnter[0]),
            hotkeyPress: KinkyDungeonKeyEnter[0],
        } : undefined)) {
         DrawTextFitKDgetHeight(
                KDGetSafewordDesc(),
                xOffset + 55, yStart + 36, sidebar - 55, KDTextWhite, 
                undefined, 20, "left",
                undefined, undefined, undefined, undefined, 
                undefined, true, "top"
            )

     } else {
        if (mouseDown) KDConfirmOverInventoryAction = false;
        if (drawn) {
            DrawTextFitKDgetHeight(
                TextGet("KDConsentItemTooltip_" + drawn.name) + TextGet(
                    HasText("KDConsentItemTooltip_" + drawn.name + "_" + (KDConsentArray[drawn.name] || "Check")) ? 
                        "KDConsentItemTooltip_" + drawn.name + "_" + (KDConsentArray[drawn.name] || "Check")
                        : "KDConsentItemTooltip_" + (KDConsentArray[drawn.name] || "Check")
                ),
                xOffset + 55, yStart + 36, sidebar - 55, KDTextWhite, 
                undefined, 20, "left",
                undefined, undefined, undefined, undefined, 
                undefined, true, "top"
            )
        }
    }
}

let KDConsentListItem = "";

function KDGetSafewordDesc() {
    return TextGet("KDSafewordDesc") + (KinkyDungeonPreviousState == "Game" ? "" : TextGet("KDSafewordMenu"));
}

function KDSafewordEnabled() {
    return KinkyDungeonPreviousState == "Game";
}