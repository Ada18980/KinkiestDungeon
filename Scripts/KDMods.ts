let KDModsLoaded = false;

let KDMods = {};
let KDModIndex = 0;
let KDModCount = 9;
let KDModSpacing = 50;

function KDDrawMods() {
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

function getFileInput() {
	let input = document.createElement('input');
	input.type = 'file';
	input.onchange = _this => {
		let files = Array.from(input.files);
		KDLoadMod(files);
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

async function KDExecuteMods() {
	KDAllModFiles = [];
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

		if (entry.filename.endsWith('.js') || entry.filename.endsWith('.ks')) {
			let file = new File([blob], entry.filename);
			// Eval js files. eval() is dangerous. Don't load untrusted mods.
			reader.onload = function(event) {
				console.log("EXECUTING MOD FILE " + file.name);
				if (typeof event.target.result === "string")
					// eslint-disable-next-line no-eval
					eval(event.target.result);
			};
			reader.readAsText(file);
		} else {
			KDModFiles[KinkyDungeonRootDirectory + entry.filename] = URL.createObjectURL(blob);
			KDModFiles[KinkyDungeonRootDirectory + "" + entry.filename] = KDModFiles[KinkyDungeonRootDirectory + entry.filename];

			if (entry.filename?.startsWith("Data/")) KDModFiles["Data/" + entry.filename] = URL.createObjectURL(blob);
			if (entry.filename?.startsWith("Models/")) KDModFiles["Models/" + entry.filename] = URL.createObjectURL(blob);
			if (entry.filename?.startsWith("TextureAtlas/")) KDModFiles["TextureAtlas/" + entry.filename] = URL.createObjectURL(blob);
			if (entry.filename?.startsWith("Music/")) KDModFiles["Music/" + entry.filename] = URL.createObjectURL(blob);
		}

	}

	if (KDAllModFiles.length > 0)
		KDModsLoaded = true;

	KinkyDungeonRefreshRestraintsCache();
	KinkyDungeonRefreshEnemiesCache();
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
