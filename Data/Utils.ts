/**
 * Returns a map from a list
 */
function ToNamedMap<N extends Namable>(Named: N[]): {[_: string]: N} {
	let list = {};
	for (let n of Named) {
		list[n.Name] = n;
	}
	return list;
}

function ToMap(Array: string[], ...Extra: string[]): {[_: string]: boolean} {
	if (Extra) {
		Array = [...Array, ...Extra];
	}
	let list: {[_: string]: boolean} = {};
	for (let n of Array) {
		list[n] = true;
	}
	return list;
}

function ToMapSubtract(Array: string[], Subtract: string[], ...Extra: string[]): {[_: string]: boolean} {
	if (Extra) {
		Array = [...Array, ...Extra];
	}
	let list: {[_: string]: boolean} = {};
	for (let n of Array) {
		list[n] = true;
	}
	// O(n) instead of O(n^2) to check while creating the first array
	for (let n of Subtract) {
		delete list[n];
	}
	return list;
}


function ToMapDefault(Array: string[], Default: string = ""): {[_: string]: string} {
	let list: {[_: string]: string} = {};
	for (let n of Array) {
		list[n] = Default;
	}
	return list;
}

function ToMapDupe(Array: string[], ExtraMap?: Record<string, string>): {[_: string]: string} {
	let list: {[_: string]: string} = Object.assign({}, ExtraMap || {});
	for (let n of Array) {
		list[n] = n;
	}
	return list;
}

function GenPlaceholderModelNames() {
	let ret = "";
	for (let model of Object.values(ModelDefs)) {
		if (!HasText("m_" + model.Name)) {
			ret = ret + ("m_" + model.Name + "," + model.Name) + "\n";
		}
		for (let layer of Object.values(model.Layers)) {
			if (layer.InheritColor) {
				if (!HasText("m_" + model.Name + "_l_" + layer.InheritColor)) {
					ret = ret + ("m_" + model.Name + "_l_" + layer.InheritColor + "," + layer.InheritColor) + "\n";
				}
			} else if (!HasText("m_" + model.Name + "_l_" + layer.Name)) {
				ret = ret + ("m_" + model.Name + "_l_" + layer.Name + "," + layer.Name) + "\n";
			}
		}
	}
	return ret;
}

/** Gets a list of all strings and runs them through pronoun tokens, for use in helping port old translation files forward */
function getOldPronounPairs() {
	let map = textProvider.getGroupManager().getGroup(textProvider.defaultGroupId);
	let defParams = KDGetGenericDialogueParams(KDPlayer());
	let list = [];

	for (let entry of map.entries()) {
		if (TextGet(entry[0], defParams) != TextGet(entry[0]))
			list.push(
				[TextGet(entry[0], defParams), TextGet(entry[0])]
			);
	}

	return list;
}
