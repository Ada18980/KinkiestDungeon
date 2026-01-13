
interface ConsentListData {
    name: string,
    data?: Record<string, string>,
    color: string,
    bordercolor: string,
    textColor: string,
    priority: number,

    allowBlock: boolean,
    allowLess: boolean,
    allowMore: boolean,

    label: string,
    tooltip: string,
}


interface ConsentListEventData {
    list: ConsentListData[],
    player: entity,
}


function KDEnumerateConsentList(sort: boolean = true, player?: entity): ConsentListData[] {
    let data: ConsentListEventData = {
        list: [],
        player: player || KDPlayer(),
    };

    KinkyDungeonSendEvent("enumerateConsentBefore", data);

    // enumerate vanilla consent options
    let name = "Tickle";
    data.list.push({
        name: name,
        color: KDBaseWhite,
        bordercolor: KDBaseTeal,
        textColor: KDBaseWhite,

        allowBlock: false,
        allowLess: true,
        allowMore: false,

        priority: -10,
        label: TextGet("KDConsentListDesc_" + name),
        tooltip: TextGet("KDConsentListDesc_" + name),
    })

    
    KinkyDungeonSendEvent("enumerateConsentAfter", data);


    if (sort) {
        data.list = data.list.sort((a, b) => {
            return b.priority - a.priority;
        });
    }
    return data.list;
}


function KDDrawConsent(xOffset) {
    DrawButtonKDEx("backButton", (_b) => {
		if (KinkyDungeonPreviousState) {
            KinkyDungeonState = KinkyDungeonPreviousState;
            KinkyDungeonPreviousState = "";
        } else {
            KinkyDungeonState = "Menu";
        }
		return true;
	}, true, 1075, 900, 350, 64, TextGet("KinkyDungeonLoadBack"), KDBaseWhite, "", undefined, undefined, undefined, undefined,
	undefined, undefined, {
		hotkey: KDHotkeyToText(KinkyDungeonKeySkip[0]),
		hotkeyPress: KinkyDungeonKeySkip[0],
	});



    let MainList = "Consent_List";
    
	let horizontal = false;
    let x = 650;
    let w = 950;
    let yStart = 120;
    let wList = 300;
    let wpad = 25;
    let h = PIXIHeight - 200;
    let spacing = 80;
    if (ShouldUpdateList(MainList)) {
        let list: ConsentListData[] = KDEnumerateConsentList();
        PopulateList(MainList, x + xOffset, yStart, horizontal ? h : wList, horizontal ? wList : h, 50, 
            Math.round(h/spacing), 
            list, false
        );
    }

    let hotkeyUp = KinkyDungeonKey[0];
    let hotkeyDown = KinkyDungeonKey[2];
    let drawn: ProgressListData = KDDrawScrollableList(MainList, true, (
        container: PIXIContainer,
        isClickable: boolean,
        item: ProgressListData,
        index: number,
        visualIndex: number,
        isSelected: boolean,
        selectedIndex: number,
        list: KDScrollableListData)  => {
        let it = item;
		let w = list.w - 40;
        DrawTextFitKDTo(container, TextGet("KDProgressItem_" + item.name,
            item.data), 
            list.x + 20 + w*0.5 + (horizontal ? visualIndex * 80 : 0), list.y + 20 + (horizontal ? 0 : visualIndex * 80), 
            w - 80, item.textColor)
		if (item.level != undefined)
			DrawTextFitKDTo(container, "" + item.level, 
				list.x + 32 + (horizontal ? visualIndex * 80 : 0), list.y + 38 + (horizontal ? 0 : visualIndex * 80),
				w - 10, item.textColor, undefined, 48, "center", 
				100.5, 0.4)
       
        DrawRectKD(container, kdpixisprites, "MainProgressSelect" + item.name + "pbborder", {
            Color: item.bordercolor,
            Left: list.x + 60 + (horizontal ? visualIndex * 80 : 0),
            Height: 12,
            Top: list.y + 50 + (horizontal ? 0 : visualIndex * 80),
            Width: w - 70,
            zIndex: 102,
            alpha: 0.9,
            LineWidth: 1
        });
        FillRectKD(container, kdpixisprites, "MainProgressSelect" + item.name + "pbfill", {
            Color: item.color,
            Left: list.x + 60 + (horizontal ? visualIndex * 80 : 0),
            Height: 11,
            Top: list.y + 50 + (horizontal ? 0 : visualIndex * 80),
            Width: (w - 70) * item.progress,
            zIndex: 101,
            alpha: 0.9,
            LineWidth: 1
        });
        DrawButtonKDExTo(container, "ConsentSelect" + item.name, 
            (bdata) => {
                KDCurrentProgressMainSelection = it.name;
                if (bdata?.source == "hotkey") {
                    setTimeout(() => {
                    KDFixScrollableList(MainList);
                }, 100);
                }
                return true;
            }, isClickable, 
            list.x + 10 + (horizontal ? visualIndex * 80 : 0), 
            list.y + (horizontal ? 0 : visualIndex * 80),
            w - 10, 
            72, 
            "", 
            item.textColor, "", undefined, undefined,
            KDCurrentProgressMainSelection != item.name, KDButtonColor, undefined, undefined, {
                hotkey: selectedIndex == index - 1 ? KDHotkeyToText(hotkeyDown)
                : (selectedIndex == index + 1 ? KDHotkeyToText(hotkeyUp)
                : null),
                hotkeyPress: selectedIndex == index - 1 ? hotkeyDown
                : (selectedIndex == index + 1 ? hotkeyUp
                : null),
            });
        return KDCurrentProgressMainSelection == item.name;
    }, undefined, horizontal, undefined, undefined, hotkeyUp, hotkeyDown);
}
