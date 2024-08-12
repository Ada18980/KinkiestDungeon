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

function getFileInput(callback?) {
	let input = document.createElement('input');
	input.type = 'file';
	input.multiple = true;
	input.onchange = _this => {
		let files = Array.from(input.files);
		if (callback) {callback(files);}
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
	} catch (e) {
		console.log(e);
	}

	for (let entry of Object.entries(KDModFiles)) {
		// compat w/ PIXI loading
		let ext = PIXI.utils.path.extname(entry[0]);
		//if (ext) PIXI.Assets.load();
		KDModFiles[PIXI.utils.path.toAbsolute(entry[0])] = entry[1];
		PIXI.Assets.resolver.add(entry[0], {
			src: entry[1],
			format: ext,
		});
		PIXI.Assets.resolver.add(PIXI.utils.path.toAbsolute(entry[0]), {
			src: entry[1],
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
