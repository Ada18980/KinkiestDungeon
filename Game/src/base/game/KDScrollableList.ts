let KDScrollableListDataset: Record<string, KDScrollableListData> = {};
interface KDScrollableListData {
	/** which index is at the top */
    index: number,
	x: number,
	y: number,
	w: number,
	h: number,
	num_per_page: number,
	zIndex: number,
	allowWrap: boolean,
    visual_index: number,
    /** MouseX */
    click_hold_y: number,
    click_hold_y_index: number,
    max: number,
    min: number,
	/** which one is selected */
    selectedindex: number,
    items: any[],
    lastUpdated: number,
    updateInterval: number,
}
let KDScrollableListExp = 4;
let KDScrollableListMin = 4;

let KDScrollBarSpacingW = 0.63;
let KDScrollBarW = 0.3;

function ShouldUpdateList(name: string, reset = true) {
	if (KDScrollableListDataset[name]) {
		if (CommonTime() - KDScrollableListDataset[name].lastUpdated > KDScrollableListDataset[name].updateInterval) {
			if (reset)
				KDScrollableListDataset[name].lastUpdated = 0;
			return true;
		}
		return false;
	}
	return true;
}
function ForceUpdateList(name: string) {
	if (KDScrollableListDataset[name]) {
		KDScrollableListDataset[name].lastUpdated = 0;
	}
}
function PopulateList(name: string, x: number, y: number, w: number, h: number, z: number, num_per_page: number, list: any[], allowWrap?: boolean): KDScrollableListData {
	if (!KDScrollableListDataset[name]) {
		KDScrollableListDataset[name] = {
			allowWrap: allowWrap,
			x: x,
			y: y,
			w: w,
			h: h,
			click_hold_y: 0,
			click_hold_y_index: 0,
			index: 0,
			selectedindex: 0,
			visual_index: 0,
			items: [],
			lastUpdated: 0,
			updateInterval: 500,
			zIndex: z,
			max: list.length - 1,
			min: 0,
			num_per_page: num_per_page
		};
	} else {
		let index = KDScrollableListDataset[name].index;
		let selectedindex = KDScrollableListDataset[name].selectedindex;
		let vindex = KDScrollableListDataset[name].visual_index;
		let click_hold_y = KDScrollableListDataset[name].click_hold_y;
		let click_hold_y_index = KDScrollableListDataset[name].click_hold_y_index;
		let lastUpdated = KDScrollableListDataset[name].lastUpdated;

		KDScrollableListDataset[name] = {
			allowWrap: allowWrap,
			x: x,
			y: y,
			w: w,
			h: h,
			click_hold_y: click_hold_y,
			click_hold_y_index: click_hold_y_index,
			index: index,
			selectedindex: selectedindex,
			visual_index: vindex,
			items: [],
			lastUpdated: lastUpdated,
			updateInterval: 500,
			zIndex: z,
			max: list.length - 1,
			min: 0,
			num_per_page: num_per_page
		};

	}
	KDScrollableListDataset[name].items = list;
	KDScrollableListDataset[name].lastUpdated = CommonTime();
	return KDScrollableListDataset[name];
}

function KDFixScrollableList(name: string, pad = 3): boolean {
	if (KDScrollableListDataset[name]) {
		let list = KDScrollableListDataset[name];
		let origIndex = list.index;
		if (list.num_per_page > pad) pad = Math.max(0, Math.ceil(list.num_per_page*0.4 - 1));
		if (list.selectedindex < pad + list.index && list.index > list.min) {
			list.index = Math.max(list.min, Math.min(list.max, list.selectedindex - pad));
		} else if (list.selectedindex > list.num_per_page-pad - 1 + list.index && list.index < list.max) {
			list.index = Math.min(list.max, Math.max(list.min, list.selectedindex - (list.num_per_page - pad - 1)));
		}
		return list.index != origIndex;
	}
	return false;
}

function KDScrollScrollableLists(mouseX: number, mouseY: number, scrollAmount: number): boolean {
	let highestZ = -1000000;
	let highest = "";
	for (let name in KDScrollableListDataset) {
        let list = KDScrollableListDataset[name];
        if (list) {
			if (list.zIndex > highestZ) {
				if (PointIn(mouseX, mouseY, list.x, list.y, list.w, list.h)) {
					highestZ = list.zIndex;
					highest = name;
				}
			}
		}
	}

	if (highest) {
		let list = KDScrollableListDataset[highest];
		if (list) {
			return KDScrollScrollableList(highest, scrollAmount)
		}
	}
	return false;
}


function KDScrollScrollableList(name: string, amount: number) {
	let list = KDScrollableListDataset[name];
	if (!list) return false;
	let origIndex = list.index;
	if (list.allowWrap && list.index == list.max) {
		list.index = list.min;
	}
	else if (list.allowWrap && list.index == list.min) {
		list.index = list.max;
	}
	else {
		list.index = Math.max(
			Math.min(list.index + amount, 
				Math.max(list.min, list.max - Math.max(0, Math.ceil(list.num_per_page*.3)))), 
				list.min);
	}
	return list.index != origIndex;
}

function KDUpdateScrollableLists(delta: number) {
    let speed = 1;
    for (let name in KDScrollableListDataset) {
        let list = KDScrollableListDataset[name];
        if (list) {
            if (list.visual_index != list.index) {
                speed = delta * Math.max(KDScrollableListMin, KDScrollableListExp*Math.abs(list.visual_index - list.index));
                if (Math.abs(list.visual_index - list.index) < speed) {
					list.visual_index = list.index;
				} else {
					list.visual_index += Math.sign(list.index - list.visual_index) * speed;
				}
            }
        }
    }
}

let KDPIXIScrollableListContainers : Record<string, PIXIContainer> = {

}

/** return function of callback is if this is selected or not */
function KDDrawScrollableList(name: string, useContainer: boolean, drawCallback: (
	container: PIXIContainer,
	isClickable: boolean,
	item: any,
	index: number,
	visualIndex: number,
	isSelected: boolean,
	selectedIndex: number,
	list: KDScrollableListData) => boolean, drawBG = true, horizontal = false, scrollbarSize = 36,
	scrollSuff = "Small", scrollhotkeyUp = "", scrollhotkeyDown = "", alpha?: number, alphaborder?: number, color?: string, pad: number = 4): any {
	let list = KDScrollableListDataset[name];
	let container = kdcanvas;
	
	
	if (useContainer != undefined) {
		if (!KDPIXIScrollableListContainers[name]) {
			KDPIXIScrollableListContainers[name] = new PIXI.Container();
			container = KDPIXIScrollableListContainers[name];
			container.zIndex = list.zIndex;
			container.sortableChildren = true;
			kdcanvas.addChild(container);

			// Create a graphics object to define our mask
			let mask = new PIXI.Graphics();
			// Add the rectangular area to show
			mask.beginFill(0xffffff);
			mask.drawRect(list.x - pad, list.y - pad, list.w + 2*pad, list.h + 2*pad);
			mask.endFill();
			container.mask = mask;
			container.addChild(mask);
		}
		else container = KDPIXIScrollableListContainers[name];
	}

	if (drawBG) {
		if (alphaborder > 0 || alphaborder == undefined)
			DrawRectKD(container, kdpixisprites, name + "borderbg", {
				Left: list.x - pad,
				Top: list.y - pad,
				Width: list.w + 2*pad,
				Height: list.h + 2*pad,
				Color: color != undefined ? color :  KDBaseBlack, 
				alpha: alphaborder != undefined ? alphaborder :  KDUIAlpha,
				LineWidth: 2,
				zIndex: - 1,
			});
		if (alpha > 0 || alpha == undefined)
			FillRectKD(container, kdpixisprites, name + "border", {
				Left: list.x - pad,
				Top: list.y - pad,
				Width: list.w + 2*pad,
				Height: list.h + 2*pad,
				Color: color != undefined ? color :  KDBaseBlack,
				alpha: alpha != undefined ? alpha :  KDUIAlphaHighlight,
				LineWidth: 2,
				zIndex: - 0.9,
			});
	}

	// draw the scrollbar
	if (scrollbarSize > 0 && list.items.length > 0) {
		let spacing = horizontal ? (list.w - scrollbarSize*2) * (1/list.items.length) : ((list.h - scrollbarSize*2) * (1/list.items.length));
		FillRectKD(container, kdpixisprites, name + "scrollb", {
			Left: list.x + (horizontal ? scrollbarSize + spacing * list.visual_index : list.w - scrollbarSize * KDScrollBarSpacingW),
			Top: list.y + (horizontal ? list.h - scrollbarSize * KDScrollBarSpacingW : scrollbarSize + spacing * list.visual_index) + 3,
			Width: (!horizontal) ? scrollbarSize * KDScrollBarW - 1 : (Math.max(1, 
				Math.min((list.w - scrollbarSize*2) - spacing * list.visual_index, 
			(list.w - scrollbarSize*2) * (list.num_per_page-1)/list.items.length) - 7)),
			Height: horizontal ? scrollbarSize * KDScrollBarW - 1 : (Math.max(1, 
				Math.min((list.h - scrollbarSize*2) - spacing * list.visual_index, 
			(list.h - scrollbarSize*2) * (list.num_per_page-1)/list.items.length) - 7)),
			Color: KDStrongHighlightColor,
			alpha: 0.9,
			LineWidth: 2,
			zIndex: - 0.9,
		});
		DrawHoldButtonKDExTo(container, name + "scrollbtn", (_b) => {
			if (!mouseHoldTaken || mouseHoldTaken == name + "_scroll") {
				mouseHoldTaken = name + "_scroll";
				/*let mouseDelta = horizontal ? (MouseX - (scrollbarSize + list.x)) : (MouseY - (scrollbarSize + list.y));
				mouseDelta /= horizontal ? list.w : list.h;
				mouseDelta = Math.max(0, Math.min(mouseDelta, 1));
				list.index = Math.max(
				Math.min(Math.round(list.items.length * mouseDelta - list.num_per_page/2), 
					Math.max(list.min, list.max - Math.max(0, Math.ceil(list.num_per_page*.3)))), 
					list.min);*/
				return true;
			}
			return false;
		}, true, 
		list.x + (horizontal ? scrollbarSize : list.w - scrollbarSize), 
		list.y + (horizontal ? list.h - scrollbarSize : scrollbarSize) + 3,
		horizontal ? (list.w - scrollbarSize*2) : scrollbarSize, horizontal ? scrollbarSize : (list.h - scrollbarSize*2), "", 
		KDBaseWhite, "", undefined, 
		true, true);

		DrawButtonKDEx(name + "upbtn", (_b) => {
			KDScrollScrollableList(name, -1);
			return true;
		}, true, 
		list.x + (horizontal ? 0 : list.w - scrollbarSize), 
		list.y + (horizontal ? list.h - scrollbarSize : 0), 
		scrollbarSize, scrollbarSize, "", 
		KDBaseWhite, KinkyDungeonRootDirectory + (horizontal ? "Left" : "Up") + scrollSuff + ".png", undefined, 
		undefined, true, undefined, undefined, undefined, {
				centered: true,
				//hotkey: scrollhotkeyUp ? KDHotkeyToText(scrollhotkeyUp) : undefined,
				//hotkeyPressed: scrollhotkeyUp,
			});
		DrawButtonKDEx(name + "downbtn", (_b) => {
			KDScrollScrollableList(name, 1);
			return true;
		}, true, 
		list.x + list.w - scrollbarSize, 
		list.y + list.h - scrollbarSize, 
		scrollbarSize, scrollbarSize, "", 
		KDBaseWhite, KinkyDungeonRootDirectory + (horizontal ? "Right" : "Down") + scrollSuff + ".png", undefined, 
		undefined, true, undefined, undefined, undefined, {
				centered: true,
				//hotkey: scrollhotkeyDown ? KDHotkeyToText(scrollhotkeyDown) : undefined,
				//hotkeyPressed: scrollhotkeyDown,
			});


	}

	// draw the items
	if (list.items.length > 0 && (mouseHoldTaken == name + "_scroll")) {
		let mouseDelta = horizontal ? (MouseX - (scrollbarSize + list.x)) : (MouseY - (scrollbarSize + list.y));
		mouseDelta /= horizontal ? list.w : list.h;
		mouseDelta = Math.max(0, Math.min(mouseDelta, 1));
		list.index = Math.max(
		Math.min(Math.round(list.items.length * mouseDelta - list.num_per_page/2), 
			Math.max(list.min, list.max - Math.max(0, Math.ceil(list.num_per_page*.3)))), 
			list.min);
	}
	else if (list.items.length > 0 && (!mouseHoldTaken || mouseHoldTaken == name + "_drag")) {
		let spacing = horizontal ? (list.w - scrollbarSize*2) * (list.num_per_page/list.items.length) : ((list.h - scrollbarSize*2) * (list.num_per_page/list.items.length));
		if (mouseDown && !list.click_hold_y) {
			if (MouseIn(list.x, list.y, list.w - scrollbarSize, list.h)) {
				list.click_hold_y = (horizontal ? MouseX : MouseY);
				list.click_hold_y_index = list.index;
			}
		} else if (!mouseDown) {
			list.click_hold_y = 0;
		} else {
			if (Math.abs(list.click_hold_y - (horizontal ? MouseX : MouseY)) > 50) {
				MouseClicked = true;
				mouseHoldTaken = name + "_drag";
			}
			

			list.index = Math.min(Math.max(list.min, list.max - Math.max(0, Math.ceil(list.num_per_page*.3))), 
			Math.max(list.min,
				Math.round(list.click_hold_y_index + (list.click_hold_y - (horizontal ? MouseX : MouseY))/spacing)
			));
			list.visual_index = Math.min(list.max, 
			Math.max(list.min - Math.max(0, Math.ceil(list.num_per_page*.3)),
				list.click_hold_y_index + (list.click_hold_y - (horizontal ? MouseX : MouseY))/spacing
			));
		}
	}

	let lastSelectedIndex = list.selectedindex;	

	list.selectedindex = -1;
	let selected: any = null;
	if (list) {
		let diff = Math.round(list.index - list.visual_index);
		let diffReal = (list.index - list.visual_index);
		for (let i = -1 - diff; i <= list.num_per_page - diff; i++) {
			if (list.items[i + list.index]) {
				if (drawCallback(container, i >= 0 && i <= list.num_per_page, list.items[i + list.index], i + list.index,
						i + diffReal,
						list.selectedindex == i + list.index, lastSelectedIndex, list)) {
					list.selectedindex = i + list.index;
					selected = list.items[i + list.index];
				}
			}
		}
	}


	if (scrollhotkeyUp && scrollhotkeyDown) {
		if (KinkyDungeonKeybindingCurrentKey == scrollhotkeyUp
				|| KinkyDungeonKeybindingCurrentKey == scrollhotkeyDown) {
					if (KDFixScrollableList(name, 3)) {
						//KinkyDungeonKeybindingCurrentKey = "";
					}
				}
	}
	

	return selected;
}