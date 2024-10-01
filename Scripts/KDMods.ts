let KDModsLoaded = false;

let KDMods: Record<string, File> = {};
let KDModInfo: Record<string, MODJSON> = {};
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
	/** Higher = earlier */
	priority: number,
	/** number is minimum version number  UNIMPLEMENTED */
	dependencies?: Record<string, number>,
	/** optional or recommended  UNIMPLEMENTED */
	optional?: Record<string, string>,
	/** warn or error  UNIMPLEMENTED */
	incompatibilities?: Record<string, string>,
	/** if the mod id is present, loads before. UNIMPLEMENTED */
	loadbefore?: string[],
	/** if the mod id is present, loads after. UNIMPLEMENTED */
	loadafter?: string[],
}

function KDLoadModJSON(json: string): MODJSON {
	let ret: MODJSON = {
		modname: "",
		moddesc: "",
		author: "",

		modbuild: 0,
		gamemajor: 5,
		gameminor: 3,
		gamepatch_min: -1,
		gamepatch_max: -1,
		priority: 0,
	};

	try {
		// Reduce chance of bomb
		if (json.length < 100000) {
			Object.assign(ret, JSON.parse(json));
		}
	} catch (e) {
		console.log(e.toString());
	}

	return ret;
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
					if (fileObject) {
						KDMods[mod.base] = fileObject;
					}
				}

			}

		}
	} catch (err) {
		// We are online and no local mod loading :()
	}

	if (execute) {
		KDExecuteMods();
	} else {
		await KDUpdateModInfo();
	}
}

function KDDrawMods() {
	if (!KDGetMods && (KDToggles.AutoLoadMods || KDToggles.AutoLoadMods == undefined)) {
		KDGetMods = true;
		KDGetModsLoad(false);
	}
	let count = 0;
	let keys = KDModLoadOrder.map((ent) => {return ent.name;});
	for (let i = KDModIndex; i < keys.length && count < KDModCount; i++) {
		let color = "#222222";
		let info = "KDNoModJSON";
		let name = keys[i];
		let ver = 0;
		if (KDModInfo[keys[i]]) {
			color = "#ffffff";
			info = "";
			try {
				name = KDModInfo[keys[i]].modname || name; // if blank, ignore modname
				if (KDModInfo[keys[i]].gamemajor >= 0 && VersionMajor != KDModInfo[keys[i]].gamemajor) {
					color = "#ff0000";
					info = "KDModOutdated2";
				} else if (KDModInfo[keys[i]].gameminor >= 0 && VersionMinor != KDModInfo[keys[i]].gameminor) {
					color = "#ff8800";
					info = "KDModOutdated3";
				} else if (KDModInfo[keys[i]].gamepatch_min >= 0 && VersionPatch < KDModInfo[keys[i]].gamepatch_min) {
					color = "#ffff00";
					info = "KDModOutdated";
				} else if (KDModInfo[keys[i]].gamepatch_max >= 0 && VersionPatch > KDModInfo[keys[i]].gamepatch_max) {
					color = "#ffff00";
					info = "KDModOutdated";
				}

				ver = KDModInfo[keys[i]].modbuild;
			} catch (e) {
				console.log(e.toString());
				color = "#ff00ff";
				info = "KDModMiscError";
			}
		}
		DrawTextKD(name + (info ? ` (${TextGet(info)})` : (TextGet("KDModVer") + ver)), 975, 370 + KDModSpacing * count, color, KDTextGray2);
		if (!KDExecuted)
			DrawButtonKDEx("moddelete_" + i, (bdata) => {
				delete KDMods[keys[i]];
				delete KDModInfo[keys[i]];
				KDUpdateModInfo();
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
			KDLoadModJSON[f.name] = null;
		}
	}

	KDUpdateModInfo();
}

let KDExecuted = false;
let KDLoading = false;

async function KDExecuteModsAndStart() {
	await KDExecuteMods();

	if (!KDToggles.OverrideOutfit)
		KinkyDungeonConfigAppearance = false;
	KinkyDungeonStartNewGame(true);
}

/** Updates mod info by unzipping mods and reading the info only */
async function KDUpdateModInfo() {
	while (KDLoading) {
		await sleep(100);
	}
	KDLoading = false;
	let errored = false;
	let modsProcessed = 0;
	let modFiles: {mod: File, name: string, priority: number}[] = [];
	try {
		KDModLoadOrder = [];
		for (let mod of Object.entries(KDMods)) {
			let file = mod[1];
			let entries = await model.getEntries(file, {});
			let priority = 0;
			let foundInfo = false;
			if (entries && entries.length) {
				for (let entry of entries) {
					let filename = entry.filename.split('/').pop();
					if (filename == 'mod.json') {
						foundInfo = true;
						const controller = new AbortController();
						const signal = controller.signal;
						const blobURL = await model.getURL(entry, {
							password: undefined,
							onprogress: (index, max) => {
								console.log(`Loading progress: ${index},${max}`);
							},
							signal
						});
						let blob = await fetch(blobURL).then(r => r.blob());
						let reader = new FileReader();
						let file = new File([blob], entry.filename);

						reader.onload = function(event) {
							console.log("LOADING MOD INFO " + file.name);
							if (typeof event.target.result === "string") {
								//@ts-ignore
								let res = event.target.result;
								let json = KDLoadModJSON(res);
								if (json) {
									KDModInfo[mod[0]] = json;
									if (json.priority) {
										priority = json.priority;
									}

									modFiles.push({mod: mod[1], name: mod[0], priority: priority});

									KDModLoadOrder = modFiles.sort((a, b) => {
										return (b.priority || 0) - (a.priority || 0);
									}).map((ent) => {return {mod: ent.mod, name: ent.name};});
									modsProcessed += 1;
								}
							}
						};
						await reader.readAsText(file);

					}
				}
			}
			if (!foundInfo) {
				modFiles.push({mod: mod[1], name: mod[0], priority: priority});
				modsProcessed += 1;
			}
		}
		console.log(modFiles);
	} catch (e) {
		modsProcessed = Object.entries(KDMods).length;
		console.log(e.toString());
		errored = true;
		KDModLoadOrder = Object.entries(KDMods).map((ent) => {return {mod: ent[1], name: ent[0]};});
	}
	while(modsProcessed < Object.entries(KDMods).length) {
		await sleep(100);
	}
	if (!errored)
		KDModLoadOrder = modFiles.sort((a, b) => {
			return (b.priority || 0) - (a.priority || 0);
		}).map((ent) => {return {mod: ent.mod, name: ent.name};});
	KDLoading = false;

}

let KDModLoadOrder: {mod: File, name: string}[] = [];

async function KDExecuteMods() {
	if (KDExecuted) return;
	KDExecuted = true;
	KDAwaitingModLoad = true;
	KDAllModFiles = [];

	await KDUpdateModInfo();

	if (KDOffline) {
		let mods = [];
		for (let file of KDModLoadOrder.map((ent) => {return ent.mod;})) {
		//@ts-ignore
			console.log(file.path);
			//@ts-ignore
			mods.push(file.path);
		}
		//@ts-ignore
		localStorage.setItem("KDMods", JSON.stringify(mods));

		await KDUpdateModInfo();
	}
	for (let file of KDModLoadOrder.map((ent) => {return ent.mod;})) {
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
		let modpromise = KDModLoadOrder.reduce((prev, current) => {
			return prev.then((chainresult) => {
				return new Promise(async (res) => {
					// Get the files for this zip file now! 
					console.log(`Loading ${current.name}`)
					let evalpromises = [];
					let entries = await model.getEntries(current.mod, {});
					console.log(KDAllModFiles);
					console.log(entries);

					for (let entry of entries) {
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

					for (let entry of entries) {
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
									evalpromises.push(new Promise((resolve,reject) => {
										eval(res);
										resolve(file.name);
									}));
								}
							};
							reader.readAsText(file);
						} 
						else {
							// none
						}			
					}

					for (let entry of entries) {
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

						if (entry.filename.endsWith('EN.csv')) {
							let file = new File([blob], entry.filename);
							reader.onload = function(event) {
								console.log(`READING TRANSLATIONS FILE ${file.name} FROM ${current.name}`);
								if (typeof event.target.result === "string") {
									//@ts-ignore
									let res = event.target.result;
									KDLoadTranslations(res);
								}
							};
							reader.readAsText(file);
						}
					}

					// Try to load a translation if it exists
					if (TranslationLanguage !== '') {
						for (let entry of entries) {
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
	
							if (entry.filename.endsWith(`${TranslationLanguage}.csv`)) {
								let file = new File([blob], entry.filename);
								reader.onload = function(event) {
									console.log(`READING TRANSLATIONS FILE ${file.name} FROM ${current.name}`);
									if (typeof event.target.result === "string") {
										//@ts-ignore
										let res = event.target.result;
										KDLoadTranslations(res);
									}
								};
								reader.readAsText(file);
							}
						}
					}
					

					if (evalpromises.length > 0) {
						// Only complete the promise once all .ks and .js files are loaded. These are the most critical to load in the right order. 
						Promise.all(evalpromises).then(() => {
							res(current.name);
						})
					}
					else {
						res(current.name);
					}
				})
			})
		}, Promise.resolve(null))

		modpromise.finally(() => {
			console.log("Finished loading mod files");
			KDLoadModSettings();
		})
	}

	/*try {

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
			// Find the translation file for English first
			} else if (entry.filename.endsWith('EN.csv')) {
				let file1 = fs.loadFile()
				let modtranslationnamearr = entry.filename.split("/");
				let modtranslationname = modtranslationnamearr[modtranslationnamearr.length - 1].slice(0, -6) // Should return the mod file's name 
				if (TranslationLanguage !== '') {
					let translation = KDAllModFiles.find((file) => { (file.filename.endsWith(`${TranslationLanguage}.csv`) && file.filename.contains(modtranslationname))})
					if (translation) {
						let file2 = new File([blob], translation.filename);

					}
				}
			}
			else {
				// none
			}

		}

		

	}*/ catch (e) {
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
                }, blocking ? false : true, CombarXX + modtoggleoffset + modsecondrowoffset, YY, 64, 64, TextGet(`KDModButton${modbutton.refvar}`), KDModSettings[KDModToggleTab][modbutton.refvar], false, blocking ? "#888888" : "#ffffff");
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
                DrawTextFitKD(`${TextGet(`KDModButton${modbutton.refvar}`)}: ${KDModSettings[KDModToggleTab][modbutton.refvar]}`, CombarXX + modtoggleoffset + 64 + 190 + modsecondrowoffset, YY + 32, 360, blocking ? "#888888" : "#ffffff", undefined, 30);
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
                DrawTextFitKD(`${TextGet(`KDModButton${modbutton.refvar}`)}`, CombarXX + modtoggleoffset + 64 + 190, YY + 32, 480, blocking ? "#888888" : "#ffffff", undefined, 30);
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
                DrawTextFitKD(`${TextGet(`KDModButton${modbutton.refvar}`)}: ${KDModSettings[KDModToggleTab][modbutton.refvar]}`, CombarXX + modtoggleoffset + 64 + 190 + modsecondrowoffset, YY + 32, 360, blocking ? "#888888" : "#ffffff", undefined, 30);
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
        // Assign null objects as {}
        if (KDModSettings === null) { KDModSettings = {} }
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
