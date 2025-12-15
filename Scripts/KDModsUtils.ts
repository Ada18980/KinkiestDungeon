let onlineModsLoaded = false;
let onlineModsDeleted = false;

const kdModList = "KinkyDungeonModList";

const getOnlineModNameList = () => {
	let modList: string[] = JSON.parse(localStorage.getItem(kdModList) || "[]");
	if (!Array.isArray(modList)) modList = [];
	return modList;
};

// save mods to indexedDB
const batchSaveMods = async (files: File[]) => {
	const modList = getOnlineModNameList();

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		let fileName = file.name;
		if (typeof fileName === "string" && fileName.endsWith(".zip")) {
			fileName = fileName.replace(".zip", "");
		}

		const res = await KinkyDungeonModSave(file, fileName);
		if (res.success) {
			if (!modList.includes(fileName)) modList.push(fileName);
		}
	}

	localStorage.setItem(kdModList, JSON.stringify(modList));
};

// auto load mods
const autoLoadMods = async () => {
	const modList = getOnlineModNameList();
	const loadModList: File[] = [];

	for (const modName of modList) {
		const res = await KinkyDungeonModLoad(modName);
		if (res) {
			loadModList.push(res);
		}
	}

	if (loadModList.length) onlineModsLoaded = true;

	return loadModList;
};

const kdModStore = "KinkyDungeonModSave";

// init or open IndexedDB
function KinkyDungeonModDbOpen() {
	let db: IDBDatabase;

	return new Promise<IDBDatabase>((resolve) => {
		const request = indexedDB.open(kdModStore);

		request.onupgradeneeded = (event) => {
			// @ts-ignore
			db = event.target.result;
			if (!db.objectStoreNames.contains(kdModStore)) {
				db.createObjectStore(kdModStore, { autoIncrement: true });
			}
		};

		request.onsuccess = () => {
			db = request.result;
			resolve(db);
		};

		request.onerror = (event) => {
			resolve(db);
		};
	});
}

// handle save single mod to indexedDB
function KinkyDungeonModSave(file: File, fileName: string) {
	return new Promise<{ success: boolean; msg?: string; err?: string }>(
		(resolve) => {
			KinkyDungeonModDbOpen().then((db) => {
				const transaction = db.transaction(kdModStore, "readwrite");
				const store = transaction.objectStore(kdModStore);
				const data = { modFile: file };
				const request = store.put(data, fileName);

				request.onsuccess = () => {
					const msg = `mod: ${fileName} save success`;
					resolve({
						success: true,
						msg,
						err: "",
					});
				};
				request.onerror = () => {
					const err = `Could not add ${fileName} to the mod store`;
					resolve({
						success: true,
						msg: "",
						err,
					});
				};
				transaction.oncomplete = () => {
					db.close();
				};
			});
		}
	);
}

// handle load single mod from indexedDB
function KinkyDungeonModLoad(modName: string) {
	return new Promise<File>((resolve) => {
		if (!modName) {
			console.error("mod name is empty");
			return;
		}

		KinkyDungeonModDbOpen().then((db) => {
			const transaction = db.transaction(kdModStore, "readonly");
			const store = transaction.objectStore(kdModStore);
			const request = store.get(modName);

			request.onsuccess = () => {
				if (request.result) {
					console.log(`Successfully loaded mod: ${modName}`);
					let out = Object.assign({}, request.result).modFile;
					resolve(out);
				} else {
					console.log(`Successfully loaded, but no such mod ${modName}`);
					resolve(null);
				}
			};
			request.onerror = () => {
				console.error(`Could not fetch mod: ${modName}`);
				resolve(null);
			};
		});
	});
}

function KinkyDungeonModDelete(modName: string) {
	return new Promise((resolve) => {
		KinkyDungeonModDbOpen().then((db) => {
			const transaction = db.transaction(kdModStore, "readwrite");
			const store = transaction.objectStore(kdModStore);
			const request = store.delete(modName);

			request.onsuccess = () => {
				let modList = getOnlineModNameList();
				if (modList.includes(modName)) {
					modList = modList.filter((x) => x != modName);
				}
				localStorage.setItem(kdModList, JSON.stringify(modList));

				console.log(`Successfully del mod: ${modName}`);
				resolve(true);
			};
			request.onerror = () => {
				console.error(`error del mod: ${modName}`);
				resolve(false);
			};
		});
	});
}
