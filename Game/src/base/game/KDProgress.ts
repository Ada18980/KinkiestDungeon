let KDCurrentProgressMainSelection = "";

function KinkyDungeonDrawProgress(xOffset = -125) {
	let x = 1225 + xOffset;

	KDDrawProgressList(xOffset);


	KDDrawInventoryTabs(xOffset);
}

interface ProgressListData {
    name: string,
    data?: Record<string, string>,
    progress: number,
    color: string,
    bordercolor: string,
    textColor: string,
    level: number,
    priority: number,
}
interface ProgressListEventData {
    list: ProgressListData[],
    trainings: ProgressListData[],
}

function KDEnumerateTrainingProgress(data: ProgressListEventData) {
    data.trainings.push({
        name: "TrainingHeels",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseGreal,
        bordercolor: KDBaseTeal,
        textColor: KDBaseWhite,
        level: 1,
        priority: -10,
    });
    data.trainings.push({
        name: "TrainingHeels2",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseGreal,
        bordercolor: KDBaseTeal,
        textColor: KDBaseWhite,
        level: 1,
        priority: -10,
    });
    data.trainings.push({
        name: "TrainingHeels3",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseGreal,
        bordercolor: KDBaseTeal,
        textColor: KDBaseWhite,
        level: 1,
        priority: -10,
    });
    data.trainings.push({
        name: "TrainingHeels4",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseGreal,
        bordercolor: KDBaseTeal,
        textColor: KDBaseWhite,
        level: 1,
        priority: -10,
    });
    data.trainings.push({
        name: "TrainingHeels5",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseGreal,
        bordercolor: KDBaseTeal,
        textColor: KDBaseWhite,
        level: 1,
        priority: -10,
    });
}

function KDEnumerateMainProgress(data: ProgressListEventData) {
    
    data.list.push({
        name: "Yea1",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseCyan,
        bordercolor: KDBaseCyan,
        textColor: KDBaseCyan,
        level: 1,
        priority: 10,
    });
    data.list.push({
        name: "Yea2",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseCyan,
        bordercolor: KDBaseCyan,
        textColor: KDBaseCyan,
        level: 1,
        priority: 10,
    });
    data.list.push({
        name: "Yea3",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseCyan,
        bordercolor: KDBaseCyan,
        textColor: KDBaseCyan,
        level: 1,
        priority: 10,
    });
    data.list.push({
        name: "Yea4",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseCyan,
        bordercolor: KDBaseCyan,
        textColor: KDBaseCyan,
        level: 1,
        priority: 10,
    });
    data.list.push({
        name: "Bad2",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseRed,
        bordercolor: KDBaseRed,
        textColor: KDBaseRed,
        level: 1,
        priority: 10,
    });
    data.list.push({
        name: "Ye2",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseCyan,
        bordercolor: KDBaseCyan,
        textColor: KDBaseCyan,
        level: 1,
        priority: 10,
    });
    data.list.push({
        name: "Ye3",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseCyan,
        bordercolor: KDBaseCyan,
        textColor: KDBaseCyan,
        level: 1,
        priority: 10,
    });
    data.list.push({
        name: "Ye4",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseCyan,
        bordercolor: KDBaseCyan,
        textColor: KDBaseCyan,
        level: 1,
        priority: 10,
    });
    data.list.push({
        name: "Bad",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseRed,
        bordercolor: KDBaseRed,
        textColor: KDBaseRed,
        level: 1,
        priority: 10,
    });
}

function KDEnumerateProgressItems(sort = true): ProgressListData[] {
    let data: ProgressListEventData = {
        list: [],
        trainings: [],
    };

    // enumerate trainings
    KDEnumerateTrainingProgress(data);

    KinkyDungeonSendEvent("enumerateProgressBefore", data);

    // enumerate main progressess
    KDEnumerateMainProgress(data);
    
    KinkyDungeonSendEvent("enumerateProgressAfter", data);

    data.list.push(...data.trainings);

    if (sort) {
        data.list = data.list.sort((a, b) => {
            return b.priority - a.priority;
        });
    }
    return data.list;
}

function KDDrawProgressList(xOffset) {
    let MainList = "MainProgress_List";
    
    let x = 650;
    let h = PIXIHeight - 200;
    let spacing = 80;
    if (ShouldUpdateList(MainList)) {
        let list: ProgressListData[] = KDEnumerateProgressItems();
        PopulateList(MainList, x + xOffset, 120, 300, h, 50, 
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
        DrawButtonKDExTo(container, "MainProgressSelect" + item.name, 
            (bdata) => {
                KDCurrentProgressMainSelection = it.name;
                return true;
            }, isClickable, 
            list.x + 10, 
            list.y + visualIndex * 80,
            list.w - 50, 
            72, 
            TextGet("KDProgressItem_" + item.name, item.data), 
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
    }, undefined, undefined, undefined, hotkeyUp, hotkeyDown);

    if (drawn) {
        // do nothing yet
    }

}

