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
    click_hold_y: number,
    click_hold_y_index: number,
    max: number,
    min: number,
	/** which one is selected */
    selectedindex: number,
    items: any[],
    lastUpdated: number,
    updateInterval: number,
	lastDrawn: number
}
let KDScrollableListExp = 10;
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
function PopulateList(name: string, x: number, y: number, w: number, h: number, zIndex: number, num_per_page: number, items: any[], allowWrap?: boolean): KDScrollableListData {
	let dataset = KDScrollableListDataset[name];
	if (!dataset) {
		dataset = {
			index: 0,
			selectedindex: 0,
			visual_index: 0,
			min: 0,
			lastUpdated: 0,
			lastDrawn: 0,
			updateInterval: 500,
		} as any;
		KDScrollableListDataset[name] = dataset;
	}
	Object.assign(dataset, {x, y, w, h, zIndex, num_per_page, items, allowWrap});
	dataset.max = Math.max(0, items.length - dataset.num_per_page);
	if (dataset.index > dataset.max) {
		dataset.index = dataset.max;
	}
	dataset.lastUpdated = CommonTime();
	return dataset;
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

function KDHighestScrollableList(x?: number, y?: number): string {
	let highestZ = -1000000;
	let highest = "";
	for (let name in KDScrollableListDataset) {
        let list = KDScrollableListDataset[name];
        if (list && list.lastDrawn > CommonTime() - 100) {
			if (list.zIndex > highestZ) {
				if (x == undefined || y == undefined || PointIn(x, y, list.x, list.y, list.w, list.h)) {
					highestZ = list.zIndex;
					highest = name;
				}
			}
		}
	}
	return highest;
}

function KDPageScrollableLists(direction: number): void {
	const highest = KDHighestScrollableList();
	const list = KDScrollableListDataset[highest];
	if (list) {
		KDScrollScrollableList(highest, direction * list.num_per_page - 1);
	}
}

function KDScrollScrollableLists(mouseX: number, mouseY: number, scrollAmount: number): boolean {
	const highest = KDHighestScrollableList(mouseX, mouseY);
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
		list.index = KDClamp(list.index + amount, list.min, list.max);
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

function KDClamp(x: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, x));
}

function KDLinearScale(percent: number, min: number, max: number): number {
	// the return value is `percent` percent of the way from `min` to `max`
	percent = KDClamp(percent, 0.0, 1.0);
	return min + (max - min) * percent;
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

	list.lastDrawn = CommonTime();
	
	
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

	// the entire bar, inclusive of up/down buttons
	const barX = horizontal ? list.x : (list.x + list.w - scrollbarSize);
	const barY = horizontal ? (list.y + list.h - scrollbarSize) : list.y;
	const barW = scrollbarSize;
	const barH = list.h;

	const upX = barX;
	const upY = barY;
	const upW = scrollbarSize;
	const upH = scrollbarSize;

	const downX = barX + (horizontal ? (list.w - scrollbarSize) : 0);
	const downY = barY + (horizontal ? 0 : (list.h - scrollbarSize));
	const downW = upW;
	const downH = upH;

	const gutterX = upX + (horizontal ? upW : 0);
	const gutterY = upY + (horizontal ? 0 : upH);
	const gutterW = barW - (horizontal ? (upW + downW) : 0);
	const gutterH = barH - (horizontal ? 0 : (upH + downH));

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
	} else {
		FillRectKD(
			container,
			kdpixisprites,
			name + "scrollBg",
			{
				Left: barX,
				Top: barY,
				Width: barW + (horizontal ? 0 : pad),
				Height: barH, // TODO may need padding. test when we have a horizontal case
				Color: "#181a1c",
				alpha: 1.0,
				LineWidth: 2,
				zIndex: -1.1,
			}
		);
	}

	// draw the scrollbar

	DrawButtonKDEx(
		name + "upbtn", (): boolean => KDScrollScrollableList(name, -1), true,
		upX,
		upY,
		upW,
		upH,
		"",
		KDBaseWhite,
		`${KinkyDungeonRootDirectory}Up${scrollSuff}.png`,
		undefined,
		undefined,
		true,
		undefined,
		undefined,
		undefined,
		{
			centered: true,
			hotkey: scrollhotkeyUp ? KDHotkeyToText(scrollhotkeyUp) : undefined,
			hotkeyPress: scrollhotkeyUp,
		},
	);

	DrawButtonKDEx(
		name + "downbtn",
		(): boolean => KDScrollScrollableList(name, 1),
		true,
		downX,
		downY,
		downW,
		downH,
		"",
		KDBaseWhite,
		`${KinkyDungeonRootDirectory}Down${scrollSuff}.png`,
		undefined,
		undefined,
		true,
		undefined,
		undefined,
		undefined,
		{
			centered: true,
			hotkey: scrollhotkeyDown ? KDHotkeyToText(scrollhotkeyDown) : undefined,
			hotkeyPress: scrollhotkeyDown,
		}
	);

	const tabThickness = Math.min(gutterW, gutterH);
	const tabMinLength = tabThickness;
	const tabMaxLength = Math.max(gutterW, gutterH);
	const scale = list.num_per_page / (list.items.length || 1);
	const tabLength = KDLinearScale(scale, tabMinLength, tabMaxLength);

	const tabCenterMin = (horizontal ? gutterX : gutterY) + tabLength / 2;
	const tabCenterMax = tabCenterMin + tabMaxLength - tabLength;
	const tabCenter = list.max == 0 ?
		// avoid division by 0. if max = 0, then it's not scrollable so the tab is the full height
		KDLinearScale(0.5, tabCenterMin, tabCenterMax) :
		KDLinearScale(list.index / list.max, tabCenterMin, tabCenterMax);

	const tabX = horizontal ? (tabCenter - tabLength / 2) : gutterX;
	const tabY = horizontal ? gutterY : (tabCenter - tabLength / 2);
	const tabW = horizontal ? tabLength : tabThickness;
	const tabH = horizontal ? tabThickness : tabLength;

	const scrollTabName = name + "_tab";
	DrawHoldButtonKDExTo(
		container,
		scrollTabName,
		((data: any): boolean => {
			if (mouseHoldTaken == "") {
				mouseHoldTaken = data?.button?.name;
				list.click_hold_y = (horizontal ? MouseX : MouseY) - tabCenter;
			}
			return mouseHoldTaken == data?.button?.name;
		}),
		true,
		tabX,
		tabY,
		tabW,
		tabH,
		"",
		KDBaseWhite,
		"",
		undefined,
		false,
		true,
		KDStrongHighlightColor,
		undefined,
		undefined,
		{alpha: 0.9},
		3
	);

	const scrollGutterName = name + "scrollGutter";
	DrawHoldButtonKDExTo(
		container,
		scrollGutterName,
		((data: any): boolean => {
			if (mouseHoldTaken == "") {
				mouseHoldTaken = data?.button?.name;
			}
			return mouseHoldTaken == data?.button?.name;
		}),
		true,
		gutterX,
		gutterY,
		gutterW,
		gutterH,
		"",
		KDBaseWhite,
		"",
		undefined,
		false,
		true,
		undefined,
		undefined,
		undefined,
		undefined,
		2
	);

	if (list.items.length > list.num_per_page) {
		const mouse = horizontal ? MouseX : MouseY;
		const scrollDragName = name + "_drag";

		if (mouseHoldTaken == scrollGutterName) {
			const gutterStart = horizontal ? gutterX : gutterY;
			const gutterLength = horizontal ? gutterW : gutterH;
			const scale = KDClamp(mouse - gutterStart, 0.0, gutterLength) / gutterLength;
			list.index = Math.round(KDLinearScale(scale, 0, list.max));
		} else if (mouseHoldTaken == scrollTabName) {
			const length = tabCenterMax - tabCenterMin;
			const scale = KDClamp(mouse - list.click_hold_y - tabCenterMin, 0.0, length) / length;
			list.index = Math.round(KDLinearScale(scale, 0, list.max));
		} else if (!mouseDown) {
			list.click_hold_y = 0;
		} else if (list.click_hold_y == 0) {
			const width = list.w - (horizontal ? 0 : scrollbarSize);
			const height = list.h - (horizontal ? scrollbarSize : 0);
			if (mouseHoldTaken == "" && MouseIn(list.x, list.y, width, height)) {
				list.click_hold_y = mouse;
				list.click_hold_y_index = list.index;
			}
		} else if (["", scrollDragName].includes(mouseHoldTaken)) {
			// the number of pages to scroll when dragging across the entire length of the list
			const PAGES_PER_SWIPE = 2.5;
			const delta = mouse - list.click_hold_y;
			const percent = Math.abs(delta) / (horizontal ? list.w : list.h);
			const offset = Math.round(percent * PAGES_PER_SWIPE * list.num_per_page);

			if (offset > 0 && delta != 0) {
				if (mouseHoldTaken == "") {
					mouseHoldTaken = scrollDragName;
				} else {
					list.index = KDClamp(list.click_hold_y_index + -Math.sign(delta) * offset, list.min, list.max);
				}
			}
		}
	}


	let lastSelectedIndex = list.selectedindex;	

	list.selectedindex = -1;
	let selected: any = null;
	if (list) {
		let diff = Math.round(list.index - list.visual_index);
		let diffReal = (list.index - list.visual_index);
		let drawnFirst = false;
		let drawnLast = false;
		for (let i = -1 - diff; i <= list.num_per_page - diff; i++) {
			if (list.items[i + list.index]) {
				if (drawCallback(container, ( i >= 0 && i <= list.num_per_page), list.items[i + list.index], i + list.index,
						i + diffReal,
						list.selectedindex == i + list.index, lastSelectedIndex, list)) {
					list.selectedindex = i + list.index;
					selected = list.items[i + list.index];
				}
				if (i + list.index == 0) drawnFirst = true;
				if (i + list.index == list.items.length - 1) drawnLast = true;
			}
		}

		if (!drawnFirst) {
			let i = -list.index;
			if (drawCallback(container, ( i >= 0 && i <= list.num_per_page), list.items[i + list.index], i + list.index,
					i + diffReal,
					list.selectedindex == i + list.index, lastSelectedIndex, list)) {
				list.selectedindex = i + list.index;
				selected = list.items[i + list.index];
			}
		}
		if (!drawnLast) {
			let i = -list.index + list.items.length - 1;
			if (drawCallback(container, ( i >= 0 && i <= list.num_per_page), list.items[i + list.index], i + list.index,
					i + diffReal,
					list.selectedindex == i + list.index, lastSelectedIndex, list)) {
				list.selectedindex = i + list.index;
				selected = list.items[i + list.index];
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