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
	dataset.max = Math.max(0, items.length - dataset.num_per_page); // if we scroll past this we'll have empty rows
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

function KDScrollScrollableLists(mouseX: number, mouseY: number, scrollAmount: number): boolean {
	let highestZ = -1000000;
	let highest = "";
	for (let name in KDScrollableListDataset) {
        let list = KDScrollableListDataset[name];
        if (list && list.lastDrawn > CommonTime() - 100) {
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
		list.index = Clamp(list.index + amount, list.min, list.max);
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

function Clamp(x: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, x));
}

function LinearScale(percent: number, min: number, max: number): number {
	percent = Clamp(percent, 0, 1);
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

	const scrollTabName = name + "scrollTab"
	const scrollGutterName = name + "scrollGutter";

	// draw the scrollbar
	DrawButtonKDEx(
		name + "upbtn",
		(): boolean => KDScrollScrollableList(name, -1),
		true,
		list.x + list.w - scrollbarSize,
		list.y,
		scrollbarSize,
		scrollbarSize,
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
		name + "upbtn",
		(): boolean => KDScrollScrollableList(name, 1),
		true,
		list.x + list.w - scrollbarSize,
		list.y + list.h - scrollbarSize,
		scrollbarSize,
		scrollbarSize,
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

	const gutterTop = list.y + scrollbarSize;
	const gutterHeight = list.h - scrollbarSize * 2;

	const tabLeft = list.x + list.w - scrollbarSize;
	const tabWidth = scrollbarSize;

	/*
	 * The scroll tab scales logarithmically between its minimum and maximum sizes.
	 * Its size decreases quickly at first and slows as page count grows.
	 * Linear scale results in a a scroll bar that's too big and awkward for low page counts.
	 *
	 * Content that doesn't need to be scrolled (i.e., <= 1 page) uses the maximum.
	 * The minimum size is reached after the specified limit.
	 *
	 * Once we know how big the tab is, we can determine where its center is for the current index.
	 */
	const PAGE_SCALING_LIMIT = 10;
	const pages = Clamp(list.items.length / list.num_per_page, 1, PAGE_SCALING_LIMIT);
	const scale = 1 - Math.log(pages) / Math.log(PAGE_SCALING_LIMIT);
	const tabMaxSize = gutterHeight;
	const tabMinSize = scrollbarSize;
	const tabHeight = LinearScale(scale, tabMinSize, tabMaxSize);

	const tabCenterMin = gutterTop + tabHeight / 2;
	const tabCenterMax = gutterTop + gutterHeight - tabHeight / 2;
	const tabCenter = list.max == 0 ?
		// avoid division by 0. if max = 0, then it's not scrollable so the tab is the full height
		LinearScale(0.5, tabCenterMin, tabCenterMax) :
		LinearScale(list.index / list.max, tabCenterMin, tabCenterMax);
	const tabTop = tabCenter - tabHeight / 2;

	FillRectKD(
		container,
		kdpixisprites,
		scrollTabName,
		{
			Left: tabLeft,
			Top: tabTop,
			Width: tabWidth,
			Height: tabHeight,
			Color: KDStrongHighlightColor,
			alpha: 0.9,
			LineWidth: 2,
			zIndex: -0.9,
		}
	);
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
		list.x + list.w - scrollbarSize,
		gutterTop,
		scrollbarSize,
		gutterHeight,
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

	if (list.items.length > list.num_per_page && mouseHoldTaken == scrollGutterName) {
		const scale = Clamp(MouseY - gutterTop, 0, gutterHeight) / gutterHeight;
		list.index = Math.round(LinearScale(scale, 0, list.max));
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