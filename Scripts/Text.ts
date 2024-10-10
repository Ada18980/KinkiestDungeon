let TextScreenCache: TextCache | null = null;
const TextAllScreenCache: Map<string, TextCache> = new Map();

/**
 * Finds the text value linked to the tag in the buffer
 * @param TextTag - Tag for the text to find
 * @returns Returns the text associated to the tag, will return a missing tag text if the tag was not found.
 */
function TextGet(TextTag: string): string {
	return TextScreenCache ? TextScreenCache.get(TextTag) : "";
}

/**
 * Loads the CSV text file of the current screen into the buffer. It will get the CSV from the cache if the file was already fetched from
 * the server
 * @param TextGroup - Screen for which to load the CSV of
 */
function TextLoad(TextGroup: string = null): void {

	// Finds the full path of the CSV file to use cache
	if ((TextGroup == null) || (TextGroup == "")) TextGroup = CurrentScreen;
	const FullPath = "Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv";

	TextScreenCache = TextAllScreenCache.get(FullPath);
	if (!TextScreenCache) {
		TextScreenCache = new TextCache(FullPath, "");
		TextAllScreenCache.set(FullPath, TextScreenCache);
	}
}

/**
 * Cache the Module and TextGroup for later use, speeds up first use
 */
function TextPrefetch(Module: string, TextGroup: string): void {
	const FullPath = "Screens/" + Module + "/" + TextGroup + "/Text_" + TextGroup + ".csv";
	if (TextAllScreenCache.has(FullPath)) {
		TextAllScreenCache.set(FullPath, new TextCache(FullPath, "MISSING VALUE FOR TAG: "));
	}
}

/**
 * A class that can be used to cache a simple key/value CSV file for easy text lookups. Text lookups will be automatically translated to
 * the game's current language, if a translation is available.
 */
class TextCache {

	private path: string;
	private warn: string;
	private language: string;
	cache: Record<string, string>;
	translationcache: any;
	private rebuildListeners: any[];
	private loaded: boolean;

	/**
	 * Creates a new TextCache from the provided CSV file path.
	 * @param path - The path to the CSV lookup file for this TextCache instance
	 * @param warn - prefix for warning when key is not found
	 */
	constructor(path: string, warn: string = "") {
		this.path = path;
		this.warn = warn;
		this.language = TranslationLanguage;
		this.cache = {};
		this.translationcache = {};
		this.rebuildListeners = [];
		this.loaded = false;
		this.buildCache();
	}

	/**
	 * Gets the current translation path
	 * @returns {string}
	 */
	public getPath(): string {
		const lang = (TranslationLanguage || "").trim().toUpperCase();
		return this.path.replace(/\/([^/]+)\.csv$/, `/$1_${lang}.txt`);
	}

	/**
	 * Looks up a string from this TextCache. If the cache contains a value for the provided key and a translation is available, the return
	 * value will be automatically translated. Otherwise the EN string will be used. If the cache does not contain a value for the requested
	 * key, the key will be returned.
	 * @param key - The text key to lookup
	 * @returns The text value corresponding to the provided key, translated into the current language, if available
	 */
	get(key: string): string {
		if (!this.loaded) return "";
		if (TranslationLanguage !== this.language) {
			this.buildCache();
		}
		const value = this.cache[key];
		return (value != null) ? value : (this.warn + key);
	}

	/**
	 * Adds a callback function as a rebuild listener. Rebuild listeners will
	 * be called whenever the cache has completed a rebuild (either after
	 * initial construction, or after a language change).
	 * @param callback - The callback to register
	 * @param immediate - Whether or not the callback should be called on registration
	 * @returns A callback function which can be used to unsubscribe the added listener
	 */
	onRebuild(callback: Function, immediate: boolean = true): Function {
		if (typeof callback === "function") {
			this.rebuildListeners.push(callback);
			if (immediate) {
				callback();
			}
			return () => {
				this.rebuildListeners = this.rebuildListeners.filter((listener) => listener !== callback);
			};
		}
		return CommonNoop;
	}

	/**
	 * Kicks off a build of the text lookup cache
	 */
	buildCache(): void {
		if (!this.path) return;
		this.fetchCsv()
			.then((lines) => {
				return  this.translate(lines);
			})
			.then((lines) => {
				return this.cacheLines(lines);
			})
			.then(() => {
				this.rebuildListeners.forEach((listener) => listener(this));
			});
	}

	/**
	 * Fetches and parses the CSV file for this TextCache
	 * @returns A promise resolving to an array of string arrays, corresponding to lines of CSV values in the CSV
	 * file.
	 */
	fetchCsv(): Promise<string[][]> {
		if (CommonCSVCache[this.path]) return Promise.resolve(CommonCSVCache[this.path]);
		return new Promise((resolve) => {
			CommonGet(this.path, (xhr) => {
				if (xhr.status === 200) {
					CommonCSVCache[this.path] = CommonParseCSV(xhr.responseText);
					return resolve(CommonCSVCache[this.path]);
				}
				return Promise.resolve([]);
			});
		});
	}

	/**
	 * Stores the contents of a CSV file in the TextCache's internal cache
	 * @param lines - An array of string arrays corresponding to lines in the CSV file
  	 * Update 15.12.2023 - Certain languages already have this.cache, so they are not processed
	 */
	cacheLines(lines: string[][]): void {
		this.language = TranslationLanguage;
		const lang = (TranslationLanguage || "").trim().toUpperCase();
		if (lang !== "RU") {lines.forEach((line) => (this.cache[line[0]] = line[1]));}

		let newRecord: [string, string][] = [];
		for (let pair of PostTranslationRecord) {
			if (this.translationcache[pair[1]]) {
				this.cache[pair[0]] = this.translationcache[pair[1]] || pair[1];
			} else newRecord.push(pair);
		}
		PostTranslationRecord = newRecord;
		this.loaded = true;
	}

	/**
	 * Translates the contents of a CSV file into the current game language
	 * @param lines - An array of string arrays corresponding to lines in the CSV file
	 * @returns A promise resolving to an array of string arrays corresponding to lines in the CSV file with the
	 * values translated to the current game language
	 */
	translate(lines: string[][]): Promise<string[][]> {
		this.language = TranslationLanguage;
		const lang = (TranslationLanguage || "").trim().toUpperCase();
		if (!lang || lang === "EN") return Promise.resolve(lines);

		const translationPath = this.path.replace(/\/([^/]+)\.csv$/, `/$1_${lang}.txt`);
		if (!TranslationAvailable(translationPath)) {
			return Promise.resolve(lines);
		}

		if (TranslationCache[translationPath]) {
			return Promise.resolve(this.buildTranslations(lines, TranslationCache[translationPath]));
		} else {
			return new Promise((resolve) => {
				CommonGet(translationPath, (xhr) => {
					if (xhr.status === 200) {
						TranslationCache[translationPath] = TranslationParseTXT(xhr.responseText);
						return resolve(this.buildTranslations(lines, TranslationCache[translationPath]));
					}
					return resolve(lines);
				});
			});
		}
	}

	/**
	 * Maps lines of a CSV to equivalent CSV lines with values translated according to the corresponding translation file
	 * @param lines - An array of string arrays corresponding to lines in the CSV file
	 * @param translations - An array of strings in translation file format (with EN and translated values on alternate lines)
	 * @returns An array of string arrays corresponding to lines in the CSV file with the
	 * values translated to the current game language
  	 * Update 15.12.2023 - For certain languages (current only RU), the method of transferring to direct writing to this.cache via arrays has been changed
	 */
	buildTranslations(lines: string[][], translations: string[]): string[][] {
		this.language = TranslationLanguage;
		const lang = (TranslationLanguage || "").trim().toUpperCase();
		let [translationsStringLineCache, translationsLineStringCache] = TranslationStringCachePreBuild(translations, "");


		if (lang === "RU") {
			lines.forEach((line, numberl) => (this.cache[line[0]] = this.buildTranslationsRU(line[1], lines, translations, numberl, translationsStringLineCache)));

			for (let entry of translationsStringLineCache.entries()) {
				if (!this.cache[entry[0]] && entry[1] % 2 == 0) // even only
					this.translationcache[entry[0]] = translationsLineStringCache.get(entry[1] + 1);
			}
			return [];
		}

		for (let entry of translationsStringLineCache.entries()) {
			if (entry[1] % 2 == 0) // even only
				this.translationcache[entry[0]] = translationsLineStringCache.get(entry[1] + 1);
		}

		return lines.map(line => ([line[0], TranslationStringCache(line[1], translationsStringLineCache, translationsLineStringCache)]));
	}
	/**
	* Translates a string to another language from the array,
	* the translation is always the one right after the english line
	* Works for certain languages as a replacement for TranslationStringCache
	* And writes the string directly to this.cache
	* @param S - The original english string to translate
	* @param massiven - working array
	* @param massivru - data from translation file
	* @param numberl - index of lines array
	* @param {Map<string, number>} translationsStringLineCache
   	 */
	buildTranslationsRU(S: string, massiven: string[][], massivru: string[], numberl: number, translationsStringLineCache): string {
		if (S != null){
			let S1 = S.trim();
			if (S1 !== "") {
				try {
					let schet = 0;
					for (let i = 0; i < numberl; i++) {
						if (S1 === massiven[i][1]) {schet = schet + 1;}
					}
					for (let i = 0; i < (massivru.length); i++) {
						if (S1 === massivru[i] && schet === 0) {
							let s = massivru[i + 1];
							if (s) {
								return s;
							}
							return S;
						} else if (S1 === massivru[i] && schet > 0) {
							schet = schet - 1;
						}
					}
				}
				catch (e) {
                		console.warn('TranslationStringCache catch:', S, translationsStringLineCache.get(S1), e);
				}
			}
		}
	return S;
	}
}
