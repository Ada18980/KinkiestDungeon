let KDScrollableListDataset: Record<string, KDScrollableListData> = {};
interface KDScrollableListData {
    index: number,
	x: number,
	y: number,
	w: number,
	h: number,
	zIndex: number,
	allowWrap: boolean,
    visual_index: number,
    /** MouseX */
    click_hold_y: number,
    max: number,
    min: number,
    selectedindex: number,
    items: any[],
    lastUpdated: number,
    updateInterval: number,
}
let KDScrollableListExp = 0.5;
let KDScrollableListMin = 0.25;

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
			if (list.allowWrap && list.index == list.max) {
				list.index = list.min;
			}
			else if (list.allowWrap && list.index == list.min) {
				list.index = list.max;
			}
			else if (list.index != list.max && list.index != list.min) {
				list.index = Math.max(
					Math.min(list.index + scrollAmount, 
						list.max), 
						list.min);
			}
			return true;
			
		}
	}
	return false;
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