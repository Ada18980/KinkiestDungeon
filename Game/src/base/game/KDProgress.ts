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
    failcolor?: string,
    bordercolor: string,
    textColor: string,
    level?: number,
    priority: number,

    drawType: string,
    drawData: ProgressListDrawData,
}



interface ProgressListEventData {
    list: ProgressListData[],
    trainings: ProgressListData[],
    player: entity,
}

interface ProgressListDrawData {
    type: string,
    name: string,
    progressString: string,
    bonusprogress?: string,
    failpercentage?: string,
}
interface ProgressListDrawTrainingData extends ProgressListDrawData {
}

function KDEnumerateTrainingProgress(data: ProgressListEventData) {
    for (let type of KDTrainingTypes) {
        if (KDTrainingTypeProperties[type]
            && !KDTrainingTypeProperties[type].dontShowProgress
            && KDTrainingTypeProperties[type].prereq(data.player)) {
            let points = (KDGameData.Training ? (KDGameData.Training[type]?.training_points || 0) : 0);
            let skipped = (KDGameData.Training ? (KDGameData.Training[type]?.turns_skipped || 0) : 0);
            let total = (KDGameData.Training ? (KDGameData.Training[type]?.turns_trained || 0) : 0);
            let next = KDGetTrainingXPNext(type, data.player);
            let lvl = KDGetTrainingXPMax(type, data.player);
            let drawData: ProgressListDrawTrainingData = {
                type: "Training",
                name: type,
                progressString: Math.round(points*100) + "/" + Math.round(lvl * 100),
                bonusprogress: "+" + Math.round(next * 100),
                failpercentage: Math.round(10000*(skipped / Math.max(total, points + skipped, 0.000001)))/100 + "%",
            };
            data.trainings.push({
                name: "Training" + type,
                progress: points/lvl,
                color: KDTrainingTypeProperties[type].color,
                bordercolor: KDBaseTeal,
                textColor: KDBaseWhite,
                failcolor: skipped == 0 ? KDBaseGreal : KDBaseRed,
                level: Math.floor(KDGameData.Training ? (KDGameData.Training[type]?.training_stage || 0) : 0),
                priority: -10,
                drawType: drawData.type,
                drawData: drawData,
            });
        }
    }
    
}

function KDEnumerateMainProgress(data: ProgressListEventData) {
    /*
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
        name: "Bad",
        progress: Math.random() * 0.5 + 0.25,
        color: KDBaseRed,
        bordercolor: KDBaseRed,
        textColor: KDBaseRed,
        level: 7,
        priority: 10,
    });
    */
}

function KDEnumerateProgressItems(sort: boolean = true, player?: entity): ProgressListData[] {
    let data: ProgressListEventData = {
        list: [],
        trainings: [],
        player: player || KDPlayer(),
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
    
	let horizontal = false;
    let x = 650;
    let w = 950;
    let yStart = 120;
    let wList = 300;
    let wpad = 25;
    let h = PIXIHeight - 200;
    let spacing = 80;
    if (ShouldUpdateList(MainList)) {
        let list: ProgressListData[] = KDEnumerateProgressItems();
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
        DrawButtonKDExTo(container, "MainProgressSelect" + item.name, 
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

    if (drawn?.drawType && KDProgressDrawTypes[drawn.drawType]) {
        KDProgressDrawTypes[drawn.drawType](kdcanvas, 0, "MainProgressDraw", drawn, drawn.drawData, horizontal ? x + xOffset : (x + xOffset + wList + wpad),
        yStart + (horizontal ? wList + wpad :0 )
        , horizontal ? w + wpad + wList : w, horizontal ? h - wList - wpad : h);
    } else {
        KDProgressDrawTypes.Unselected(kdcanvas, 0, "MainProgressDraw", null, null, horizontal ? x + xOffset : (x + xOffset + wList + wpad),
        yStart + (horizontal ? wList + wpad :0 )
        , horizontal ? w + wpad + wList : w, horizontal ? h - wList - wpad : h);
    }

}


let KDProgressDrawTypes: Record<string, (container: PIXIContainer, z: number, id: string, data: ProgressListData, drawData: ProgressListDrawData, x: number, y: number, width: number, height: number) => void> = {
    Base: (container: PIXIContainer, z: number, id: string, item: ProgressListData, drawData: ProgressListDrawData, x: number, y: number, width: number, height: number) => {
        // draw the usual background
        DrawRectKD(container, kdpixisprites, id + "mainborder", {
            Left: x,
            Height: height + 8,
            Top: y - 4,
            Width: width,
			Color: KDBaseBlack, 
			alpha: KDUIAlpha,
			LineWidth: 2,
			zIndex: z - 1,
        });
        FillRectKD(container, kdpixisprites, id + "mainfill", {
            Left: x,
            Height: height + 8,
            Top: y - 4,
            Width: width,
			Color: KDBaseBlack,
			alpha: KDUIAlphaHighlight,
			LineWidth: 2,
			zIndex: z - 0.9,
        });

        if (drawData) {
            let mult = KDGetFontMult();
            let textSplit = KinkyDungeonWordWrap(TextGet("KDProgress_" + drawData.type + "_" + drawData.name), 28*mult, 80*mult).split('\n');
            let fsize = 18;

            for (let i = 0; i < textSplit.length; i++) {
                DrawTextFitKD(textSplit[i], 
                    x + 50, y + 25 + i * (fsize+1), width - 100, KDTextWhite, KDTextGray0, fsize, "left")
            }
            
            DrawRectKD(container, kdpixisprites, id + "pb1border", {
                Color: item.bordercolor,
                Left: x + 40,
                Height: 24,
                Top: y + 120,
                Width: width - 80,
                zIndex: z + 102,
                alpha: 0.9,
                LineWidth: 1
            });
            FillRectKD(container, kdpixisprites, id + "pb1fill", {
                Color: item.color,
                Left: x + 40,
                Height: 24,
                Top: y + 120,
                Width: (width - 80) * item.progress,
                zIndex: z + 101,
                alpha: 0.9,
                LineWidth: 1
            });

            let yy = y + 180;
            if (drawData.progressString) {
                DrawTextFitKD(TextGet("KDProgressCurrent"), 
                        x + width/2 + 20, yy, 300, KDTextWhite, 
                        KDTextGray0, 24, "right");
                DrawTextFitKD(drawData.progressString, 
                        x + width/2 + 40, yy, 300, item.color, 
                        KDTextGray0, 24, "left");
                yy += 33;
            }

            if (drawData.bonusprogress) {
                DrawTextFitKD(TextGet("KDProgressBonusProgress"), 
                        x + width/2 + 20, yy, 380, KDTextWhite, 
                        KDTextGray0, 24, "right");
                DrawTextFitKD(drawData.bonusprogress, 
                        x + width/2 + 40, yy, 300, item.color, 
                        KDTextGray0, 24, "left");
                yy += 33;
            }

            if (drawData.failpercentage != undefined) {
                DrawTextFitKD(TextGet("KDProgressFailPercentage"), 
                        x + width/2 + 20, yy, 320, KDTextWhite, 
                        KDTextGray0, 24, "right");
                DrawTextFitKD(drawData.failpercentage, 
                        x + width/2 + 40, yy, 300, item.failcolor, 
                        KDTextGray0, 24, "left");
                yy += 33;
            }
            
            // always till the end
            if (KDGameData.RecentProgress && KDGameData.RecentProgress[drawData.type + "_" + drawData.name]) {
                let hh = height - (yy- y) - 80;
                if (hh > 0) {
                    DrawTextFitKD(TextGet("KDProgressRecentModifiers"), 
                        x + 50, yy, width - 100, KDTextWhite, 
                        KDTextGray0, 24, "left");
                    yy += 30;
                    DrawRectKD(container, kdpixisprites, id + "rmborder", {
                        Left: x + 40,
                        Height: hh,
                        Top: yy,
                        Width: width - 80,
                        zIndex: z + 12,
                        Color: KDBaseBlack, 
                        alpha: KDUIAlpha,
                        LineWidth: 1
                    });
                    FillRectKD(container, kdpixisprites, id + "rmfill", {
                        Left: x + 40,
                        Height: hh,
                        Top: yy,
                        Width: width - 80,
                        zIndex: z + 11,
                        Color: KDBaseBlack,
                        alpha: KDUIAlphaHighlight,
                        LineWidth: 1
                    });
                    yy += 8;

                    let listt: ProgressTag[] = [];
                    listt.push(...KDGameData.RecentProgress[drawData.type + "_" + drawData.name].currentLevelList);
                    listt.push(...KDGameData.RecentProgress[drawData.type + "_" + drawData.name].currentFloorList);
                    listt.push(...KDGameData.RecentProgress[drawData.type + "_" + drawData.name].lastFloorList);
                    for (let tag of listt) {
                        if (yy + 18 < height - 50) {
                            yy += 8;
                            let xx = DrawTextFitKD(TextGet("KDProgressTag_" + tag.key, tag.keyparams), 
                                x + 50, yy, width * 0.5, KDTextWhite, 
                                KDTextGray0, 18, "left");
                            DrawTextFitKD((tag.value > 0 ? "+" : "") + tag.value, 
                                x + 50 + xx + 10, yy, width * 0.1, item.color, 
                                KDTextGray0, 18, "left");
                            if (tag.desc) {
                                DrawTextFitKD(TextGet("KDProgressTagDesc_" + tag.desc, tag.descparams), 
                                    x + width - 50, yy, width * 0.4, KDTextGraymid, 
                                    KDTextGray0, 16, "right");
                            }
                            yy += 8;
                        }
                    }
                }
                
            }

        }
        
    },
    Unselected: (container: PIXIContainer, z: number, id: string, data: ProgressListData, drawData: ProgressListDrawData, x: number, y: number, width: number, height: number) => {
        KDProgressDrawTypes.Base(container, z, id, data, drawData, x, y, width, height);
        DrawTextFitKD(TextGet("KDProgressUnselected"), 
            x + width/2, y + height/2 - 12, width - 30, KDTextWhite)

    },
    Training: (container: PIXIContainer, z: number, id: string, data: ProgressListData, drawData: ProgressListDrawData, x: number, y: number, width: number, height: number) => {
        KDProgressDrawTypes.Base(container, z, id, data, drawData, x, y, width, height);

    },
}

interface ProgressTag {
    key: string,
    keyparams?: any,
    descparams?: any,
    tag: string,
    desc: string,
    value: number,
}

interface ProgressRecord {
    currentFloorList: ProgressTag[],
    lastFloorList: ProgressTag[],
    currentLevelList: ProgressTag[],
}

function AddProgressFloor(type: string, name: string, item: ProgressTag, force: boolean): boolean {
    if (!KDGameData.RecentProgress) KDGameData.RecentProgress = {};
    let id = type + "_" + name;
    if (!KDGameData.RecentProgress[id]) KDGameData.RecentProgress[id] = {
        currentFloorList: [],
        lastFloorList: [],
        currentLevelList: [],
    };

    if (force || !KDGameData.RecentProgress[id].currentFloorList.some((litem) => {
        return litem.tag == item.tag;
    })) {
        KDGameData.RecentProgress[id].currentFloorList.push(item);
        return true;
    }
    return false;
}
function AddProgressLevel(type: string, name: string, item: ProgressTag, force: boolean): boolean {
    if (!KDGameData.RecentProgress) KDGameData.RecentProgress = {};
    let id = type + "_" + name;
    if (!KDGameData.RecentProgress[id]) KDGameData.RecentProgress[id] = {
        currentFloorList: [],
        lastFloorList: [],
        currentLevelList: [],
    };

    if (force || !KDGameData.RecentProgress[id].currentLevelList.some((litem) => {
        return litem.tag != item.tag;
    })) {
        KDGameData.RecentProgress[id].currentLevelList.push(item);
        return true;
    }
    return false;
}

/** Ticks the progress record one floor */
function TickProgressRecord() {
    if (KDGameData.RecentProgress) {
        for (let record in KDGameData.RecentProgress) {
            let current = KDGameData.RecentProgress[record];
            current.lastFloorList = current.currentFloorList;
        }
    }
}
/** Ticks the progress record one floor */
function LevelUpProgressRecord(type: string, name: string) {
    if (KDGameData.RecentProgress) {
        let id = type + "_" + name;
        if (KDGameData.RecentProgress[id]) KDGameData.RecentProgress[id].currentLevelList = [];
    }
}