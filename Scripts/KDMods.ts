let KDModsLoaded = false;

let KDMods = {};
let KDModIndex = 0;
let KDModCount = 9;
let KDModSpacing = 50;

let KDGetMods = false;
let KDOffline = false;

let KDModCompat = {
	"KinkyDungeonHiddenFactions.push(": "KinkyDungeonHiddenFactionsPush(",
};

let KDModToggleTab = "None";
let KDModListPage = 0;
let KDModPage = 0;
let KDModSettings = {};
let KDModConfigs = {};
let KDModFileCount = 0;

interface MODJSON {
	modname: string,
	moddesc: string,
	author: string,
	modbuild: number,
	gamemajor: number,
	gameminor: number,
	gamepatch_min: number,
	gamepatch_max: number,
	priority: number,
	/** number is minimum version number */
	dependencies: Record<string, number>,
	/** optional or recommended */
	optional: Record<string, string>,
	/** warn or error */
	incompatibilities: Record<string, string>,
}

async function KDGetModsLoad(execute) {
	try {
		//@ts-ignore
		let API = window.kdAPI;
		if (API) {
			KDOffline = true;
			/*if (localStorage.getItem("KDMods") && JSON.parse(localStorage.getItem("KDMods"))) {
				let mods = JSON.parse(localStorage.getItem("KDMods"));
				if (mods)
					for (let m of mods) {
						if (m) {
							let fileObject = await API.getFile(m);
							if (fileObject) KDMods[fileObject.base] = fileObject.file;
						}
					}
			}*/
			let modFiles = await API.getMods();
			for (let mod of modFiles) {
				if (mod.file) {
					// Create a Blob using the buffer
					const blob = new Blob([mod.file], { type: 'application/octet-stream' });

					// Create a File object with the Blob
					const fileObject = new File([blob], mod.base, { type: 'application/octet-stream' });
					if (fileObject) KDMods[mod.base] = fileObject;
				}

			}

		}
	} catch (err) {
		// We are online and no local mod loading :()
	}

	if (execute) {
		KDExecuteMods();
	}
}

function KDDrawMods() {
	if (!KDGetMods && (KDToggles.AutoLoadMods || KDToggles.AutoLoadMods == undefined)) {
		KDGetMods = true;
		KDGetModsLoad(false);
	}
	let count = 0;
	let keys = Object.keys(KDMods);
	for (let i = KDModIndex; i < keys.length && count < KDModCount; i++) {
		DrawTextKD(keys[i], 975, 370 + KDModSpacing * count, "#ffffff", KDTextGray2);
		DrawButtonKDEx("moddelete_" + i, (bdata) => {
			delete KDMods[keys[i]];
			return true;
		}, true, 1275, 350 + KDModSpacing * count, 200, 45, TextGet("KinkyDungeonDeleteMod"), "#ffffff", "");
		count++;
	}
}

function getFileInput(callback?, ...callbackArgs) {
	let input = document.createElement('input');
	input.type = 'file';
	input.multiple = true;
	input.onchange = _this => {
		let files = Array.from(input.files);
		if (callback) {callback(files,...callbackArgs);}
		else KDLoadMod(files);
	};
	input.click();
}

function KDLoadMod(files: any[]) {
	console.log(files);
	for (let f of files) {
		if (f && f.name) {
			KDMods[f.name] = f;
		}
	}
}

let KDExecuted = false;

async function KDExecuteModsAndStart() {
	await KDExecuteMods();

	if (!KDToggles.OverrideOutfit)
		KinkyDungeonConfigAppearance = false;
	KinkyDungeonStartNewGame(true);
}

async function KDExecuteMods() {
	if (KDExecuted) return;
	KDExecuted = true;
	KDAwaitingModLoad = true;
	KDAllModFiles = [];

	if (KDOffline) {
		let mods = [];
		for (let file of Object.values(KDMods)) {
		//@ts-ignore
			console.log(file.path);
			//@ts-ignore
			mods.push(file.path);
		}
		//@ts-ignore
		localStorage.setItem("KDMods", JSON.stringify(mods));
	}
	for (let file of Object.values(KDMods)) {
		let entries = await model.getEntries(file, {});
		if (entries && entries.length) {
			//const filenamesUTF8 = Boolean(!entries.find(entry => !entry.filenameUTF8));
			//const encrypted = Boolean(entries.find(entry => entry.encrypted));
			//encodingInput.value = filenamesUTF8 ? "utf-8" : filenameEncoding || "cp437";

			entries.forEach((entry, entryIndex) => {
				KDAllModFiles.push(entry);
			});

			KDModFileCount++;

		}

	}

	try {

		for (let entry of KDAllModFiles) {
			console.log(entry);
			const controller = new AbortController();
			const signal = controller.signal;
			const blobURL = await model.getURL(entry, {
				password: undefined,
				onprogress: (index, max) => {
					console.log(`Loading progress: ${index},${max}`);
				},
				signal
			});
			console.log(blobURL);
			let blob = await fetch(blobURL).then(r => r.blob());
			console.log(blob);
			let reader = new FileReader();

			if (entry.filename.startsWith('.')) {
				// none
			} else if (entry.filename.endsWith('.js') || entry.filename.endsWith('.ks')) {
				// none
			} else {
				KDModFiles[KinkyDungeonRootDirectory + entry.filename] = URL.createObjectURL(blob);
				KDModFiles[KinkyDungeonRootDirectory + "" + entry.filename] = KDModFiles[KinkyDungeonRootDirectory + entry.filename];

				if (entry.filename?.startsWith("Data/")
					|| entry.filename?.startsWith("DisplacementMaps/")
					|| entry.filename?.startsWith("Models/")
					|| entry.filename?.startsWith("TextureAtlas/")
					|| entry.filename?.startsWith("Music/")) {
						KDModFiles[entry.filename] = URL.createObjectURL(blob);
						KDModFiles[PIXI.utils.path.toAbsolute(entry.filename)] = URL.createObjectURL(blob);
					}
			}

		}
		for (let entry of KDAllModFiles) {
			console.log(entry);
			const controller = new AbortController();
			const signal = controller.signal;
			const blobURL = await model.getURL(entry, {
				password: undefined,
				onprogress: (index, max) => {
					console.log(`Loading progress: ${index},${max}`);
				},
				signal
			});
			console.log(blobURL);
			let blob = await fetch(blobURL).then(r => r.blob());
			console.log(blob);
			let reader = new FileReader();

			if (entry.filename.startsWith('.')) {
				// none
			} else if (entry.filename.endsWith('.js') || entry.filename.endsWith('.ks')) {
				let file = new File([blob], entry.filename);
				// Eval js files. eval() is dangerous. Don't load untrusted mods.
				reader.onload = function(event) {
					console.log("EXECUTING MOD FILE " + file.name);
					if (typeof event.target.result === "string") {
						//@ts-ignore
						let res = event.target.result;
						if (KDToggles.ModCompat) {
							for (let compat of Object.entries(KDModCompat)) {
								res = event.target.result.replace(compat[0],
									compat[1]
								);
							}
						}
						eval(res);
					}
				};
				reader.readAsText(file);
			} else {
				// none
			}

		}

		KDLoadModSettings()

	} catch (e) {
		console.log(e);
	}

	for (let [k, v] of Object.entries(KDModFiles) as [string, string][]) {
		// compat w/ PIXI loading
		let ext = PIXI.utils.path.extname(k);
		//if (ext) PIXI.Assets.load();
		KDModFiles[PIXI.utils.path.toAbsolute(k)] = v;
		PIXI.Assets.resolver.add(k, {
			src: v,
			format: ext,
		});
		PIXI.Assets.resolver.add(PIXI.utils.path.toAbsolute(k), {
			src: v,
			format: ext,
		});
	}

	if (KDAllModFiles.length > 0)
		KDModsLoaded = true;

	KDLoadPerks();
	KinkyDungeonRefreshRestraintsCache();
	KinkyDungeonRefreshEnemiesCache();
	KDAwaitingModLoad = false;
}

function KDDrawModConfigs() {
    let XX = KDToggleTab == "Main" ? 940 : 540;
    let YYstart = 140;
    let YYmax = 800;
    let YY = YYstart;
    let YYd = 74;
    let XXd = 450;
    let toggles = Object.keys(KDToggles);
    YY = YYstart + 50;
    YYd = 80;
    let CombarXX = 550;
    let modrows = 8; // Number of mods or config options
    // Draw text as a title for mod configuration
    DrawTextFitKD(`Mod Configuration - ${TextGet("KDModButton" + (KDModToggleTab))}`, 1250, YYstart - 70, 1000, "#ffffff", undefined, 40);
    let loadedmods = Object.keys(KDModConfigs);
    loadedmods = loadedmods.splice((KDModListPage) * modrows, modrows); // Select only the page of mods for which we are on
    loadedmods.forEach((loadedmod) => {
        DrawButtonKDEx(TextGet("KDModButton" + (loadedmod)), () => {
            console.log("Pressed button for " + loadedmod);
            KDModPage = 0;
            KDModToggleTab = loadedmod;
			return true;
        }, true, CombarXX, YY, 300, 64, TextGet("KDModButton" + (loadedmod)), "#ffffff", "");
        YY += YYd;
    })
    if (Object.keys(KDModConfigs).length > modrows) {
        if (KDModListPage != 0) {
            DrawButtonKDEx("KDModConfigListUp", (b) => {
                KDModListPage -= 1;
                return true;
            }, true, CombarXX + 105, YYstart, 90, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Up.png");
        }
        if (KDModListPage < (((Object.keys(KDModConfigs).length % modrows) == 0) ? (Object.keys(KDModConfigs).length / modrows - 1) : Math.floor(Object.keys(KDModConfigs).length / modrows))) {
            DrawButtonKDEx("KDModConfigListDown", (b) => {
                KDModListPage += 1;
                return true;
            }, true, CombarXX + 105, YYstart + ((YYd) * modrows) + 50, 90, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Down.png");
        }
    }
    YY = YYstart + 50;
    YYd = 80;
    let modtoggleoffset = 350;
    if (KDModConfigs.hasOwnProperty(KDModToggleTab)) {
    	let configtabset = KDModConfigs[KDModToggleTab].slice((KDModPage) * (modrows * 2), (KDModPage) * (modrows * 2) + (modrows * 2));
		let modsecondrowoffset = 0;
        let modtogglecount = 0;
        configtabset.forEach((modbutton) => {
            // variable is a toggle of some sort that is expecting a true/false value.
            if (modbutton.type == "boolean") {
                if (KDModSettings[KDModToggleTab] == undefined) { KDModSettings[KDModToggleTab] = {}};
                if (KDModSettings[KDModToggleTab][modbutton.refvar] == undefined) { KDModSettings[KDModToggleTab][modbutton.refvar] = (modbutton.default != undefined) ? modbutton.default : false};
                var blocking = (typeof modbutton.block == "function") ? modbutton.block() : undefined
                DrawCheckboxKDEx(modbutton.refvar, (bdata) => {
                    KDModSettings[KDModToggleTab][modbutton.refvar] = !KDModSettings[KDModToggleTab][modbutton.refvar]
                    return true;
                }, blocking ? false : true, CombarXX + modtoggleoffset + modsecondrowoffset, YY, 64, 64, TextGet(modbutton.name), KDModSettings[KDModToggleTab][modbutton.refvar], false, blocking ? "#888888" : "#ffffff");
                YY += YYd;
            }
            // variable is a range that cycles by stepcount between rangelow and rangehigh.
            else if (modbutton.type == "range") {
                if (KDModSettings[KDModToggleTab] == undefined) { KDModSettings[KDModToggleTab] = {}};
                if (KDModSettings[KDModToggleTab][modbutton.refvar] == undefined) { KDModSettings[KDModToggleTab][modbutton.refvar] = (modbutton.default != undefined) ? modbutton.default : ((modbutton.rangehigh + modbutton.rangelow) / 2)};
                var blocking = (typeof modbutton.block == "function") ? modbutton.block() : undefined
                // Determine the significant digits from the stepcount - this will be used in a .toFixed operation to ensure we get valid results.
                let decimalPlacesInBase = (modbutton.stepcount.toString()).includes('.') ? (modbutton.stepcount.toString()).split('.')[1].length : 0;
                // Left to decrement
                DrawButtonKDEx(`ModRangeButtonL${modbutton.name}`, (bdata) => {
                    if (KDModSettings[KDModToggleTab][modbutton.refvar] > modbutton.rangelow) {
                        KDModSettings[KDModToggleTab][modbutton.refvar] = parseFloat((KDModSettings[KDModToggleTab][modbutton.refvar] - modbutton.stepcount).toFixed(decimalPlacesInBase))
                    }
                    return true;
                }, blocking ? false : true, CombarXX + modtoggleoffset + modsecondrowoffset, YY, 64, 64, '<', blocking ? "#888888" : "#ffffff");
                // Label for the button
                DrawTextFitKD(`${modbutton.name}: ${KDModSettings[KDModToggleTab][modbutton.refvar]}`, CombarXX + modtoggleoffset + 64 + 190 + modsecondrowoffset, YY + 32, 360, blocking ? "#888888" : "#ffffff", undefined, 30);
                // Right to increment
                DrawButtonKDEx(`ModRangeButtonR${modbutton.name}`, (bdata) => {
                    if (KDModSettings[KDModToggleTab][modbutton.refvar] < modbutton.rangehigh) {
                        KDModSettings[KDModToggleTab][modbutton.refvar] = parseFloat((KDModSettings[KDModToggleTab][modbutton.refvar] + modbutton.stepcount).toFixed(decimalPlacesInBase))
                    }
                    return true;
                }, blocking ? false : true, CombarXX + modtoggleoffset + 64 + 360 + 20 + modsecondrowoffset, YY, 64, 64, '>', blocking ? "#888888" : "#ffffff");
                YY += YYd;
            }
            // variable has custom code that wants to run when clicking a button.
            else if (modbutton.type == "custom") {
                if (KDModSettings[KDModToggleTab] == undefined) { KDModSettings[KDModToggleTab] = {}};
                if (KDModSettings[KDModToggleTab][modbutton.refvar] == undefined) { KDModSettings[KDModToggleTab][modbutton.refvar] = (modbutton.default != undefined) ? modbutton.default : false};
                var blocking = (typeof modbutton.block == "function") ? modbutton.block() : undefined
                DrawButtonKDEx(modbutton.name, modbutton.click(), blocking ? false : true, CombarXX + modtoggleoffset, YY, 350, 64, modbutton.name, blocking ? "#888888" : "#ffffff", "");
                YY += YYd;
            }
            // variable is a spacer - Only print text here.
            else if (modbutton.type == "text") {
                var blocking = (typeof modbutton.block == "function") ? modbutton.block() : undefined
                DrawTextFitKD(`${modbutton.name}`, CombarXX + modtoggleoffset + 64 + 190, YY + 32, 480, blocking ? "#888888" : "#ffffff", undefined, 30);
                YY += YYd;
            }
			// variable is a string value - Put an input box here.
			else if (modbutton.type == "string") {
				let elem = (KDTextField(modbutton.refvar, CombarXX + modtoggleoffset + modsecondrowoffset, YY, 480, 64, undefined, KDModSettings[KDModToggleTab][modbutton.refvar], "100")).Element;
				elem.addEventListener('input', function() {
					let currValue = elem.value;
					KDModSettings[KDModToggleTab][modbutton.refvar] = currValue;
				})
				YY += YYd;
			}
			// variable is a list of options - Similar to range, but we are iterating over an options property.
			else if (modbutton.type == "list") {
                if (KDModSettings[KDModToggleTab] == undefined) { KDModSettings[KDModToggleTab] = {}};
                if (KDModSettings[KDModToggleTab][modbutton.refvar] == undefined) { modbutton.default };
                var blocking = (typeof modbutton.block == "function") ? modbutton.block() : undefined
                // Left to decrement
                DrawButtonKDEx(`ModRangeButtonL${modbutton.name}`, (bdata) => {
					let newindex = ((modbutton.options.indexOf(KDModSettings[KDModToggleTab][modbutton.refvar])-1) == -1) ? (modbutton.options.length-1) : (modbutton.options.indexOf(KDModSettings[KDModToggleTab][modbutton.refvar])-1);
                    KDModSettings[KDModToggleTab][modbutton.refvar] = modbutton.options[newindex];
                    return true;
                }, blocking ? false : true, CombarXX + modtoggleoffset + modsecondrowoffset, YY, 64, 64, '<', blocking ? "#888888" : "#ffffff");
                // Label for the button
                DrawTextFitKD(`${modbutton.name}: ${KDModSettings[KDModToggleTab][modbutton.refvar]}`, CombarXX + modtoggleoffset + 64 + 190 + modsecondrowoffset, YY + 32, 360, blocking ? "#888888" : "#ffffff", undefined, 30);
                // Right to increment
                DrawButtonKDEx(`ModRangeButtonR${modbutton.name}`, (bdata) => {
                    let newindex = ((modbutton.options.indexOf(KDModSettings[KDModToggleTab][modbutton.refvar])+1) == modbutton.options.length) ? (0) : (modbutton.options.indexOf(KDModSettings[KDModToggleTab][modbutton.refvar])+1);
                    KDModSettings[KDModToggleTab][modbutton.refvar] = modbutton.options[newindex];
                    return true;
                }, blocking ? false : true, CombarXX + modtoggleoffset + 64 + 360 + 20 + modsecondrowoffset, YY, 64, 64, '>', blocking ? "#888888" : "#ffffff");
                YY += YYd;
            }
            modtogglecount++;
            if (modtogglecount == 8) {
                modsecondrowoffset = 550;
                YY = YYstart + 50;
            }
        })
        if (KDModConfigs[KDModToggleTab].length > (modrows * 2)) {
            if (KDModPage != 0) {
                DrawButtonKDEx("KDModToggleListUp", (b) => {
                    KDModPage -= 1;
                    return true;
                }, true, CombarXX + 105 + modtoggleoffset * 2, YYstart, 90, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Up.png");
            }
            if (KDModPage < (((KDModConfigs[KDModToggleTab].length % (modrows * 2)) == 0) ? (KDModConfigs[KDModToggleTab].length / (modrows * 2) - 1) : Math.floor(KDModConfigs[KDModToggleTab].length / (modrows * 2)))) {
                DrawButtonKDEx("KDModToggleListDown", (b) => {
                    KDModPage += 1;
                    return true;
                }, true, CombarXX + 105 + modtoggleoffset * 2, YYstart + ((YYd) * modrows) + 50, 90, 40, "", "#ffffff", KinkyDungeonRootDirectory + "Down.png");
            }
        }
    }
    DrawButtonKDEx("KBBackOptions", () => {
        KinkyDungeonKeybindingsTemp = Object.assign({}, KinkyDungeonKeybindingsTemp);
        KinkyDungeonState = "Menu";
        try {
            localStorage.setItem("KDModSettings", JSON.stringify(KDModSettings));
        }
        catch (err) {
            console.error(err);
        }
        KinkyDungeonSendEvent("afterModConfig", {}); // Mods can register events with this handle in generic events, to do stuff after leaving the mod config window.
        return true;
    }, true, 975, 880, 550, 64, TextGet("GameReturnToMenuFromOptions"), "#ffffff", "");
}

function KDLoadModSettings() {
    try {
        KDModSettings = JSON.parse(localStorage.getItem('KDModSettings'))
    }
    catch (err) {
        console.log("Cannot load mod config from local storage.")
    }
	addTextKey("KDModConfigsButton", "Mod Configuration");
	KinkyDungeonSendEvent("afterModSettingsLoad", {});
}

if (typeof TransformStream == "undefined") {
	const script = document.createElement("script");
	script.src = "lib/web-streams-polyfill.min.js";
	document.body.appendChild(script);
}


const model = (() => {

	return {
		getEntries(file, options) {
			return (new zip.ZipReader(new zip.BlobReader(file))).getEntries(options);
		},
		async getURL(entry, options) {
			return URL.createObjectURL(await entry.getData(new zip.BlobWriter(), options));
		},
		getEntryFile : function(entry, creationMethod, onend, onprogress) {
			var writer, zipFileEntry;

			function getData() {
				entry.getData(writer, function(blob) {
					var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
					onend(blobURL);
				}, onprogress);
			}
			//Write the entire file as a blob
			if (creationMethod == "Blob") {
				writer = new zip.BlobWriter();
				getData();
			} else {
				//Use the file writer to write the file clicked by user.
				console.log("No blob");
			}
		}
	};

})();
