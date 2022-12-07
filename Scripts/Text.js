"use strict";

/** @type {TextCache | null} */
let TextScreenCache = null;
/** @type {Map<string, TextCache>} */
const TextAllScreenCache = new Map;

/**
 * Finds the text value linked to the tag in the buffer
 * @param {string} TextTag - Tag for the text to find
 * @returns {string} - Returns the text associated to the tag, will return a missing tag text if the tag was not found.
 */
function TextGet(TextTag) {
	return TextScreenCache ? TextScreenCache.get(TextTag) : "";
}

/**
 * Loads the CSV text file of the current screen into the buffer. It will get the CSV from the cache if the file was already fetched from
 * the server
 * @param {string} [TextGroup] - Screen for which to load the CSV of
 * @returns {void} - Nothing
 */
function TextLoad(TextGroup) {

	// Finds the full path of the CSV file to use cache
	if ((TextGroup == null) || (TextGroup == "")) TextGroup = CurrentScreen;
	const FullPath = "Screens/" + CurrentModule + "/" + TextGroup + "/Text_" + TextGroup + ".csv";

	TextScreenCache = TextAllScreenCache.get(FullPath);
	if (!TextScreenCache) {
		TextScreenCache = new TextCache(FullPath, "");
		TextAllScreenCache.set(FullPath, TextScreenCache);
	}
}

/**
 * Cache the Module and TextGroup for later use, speeds up first use
 * @param {string} Module
 * @param {string} TextGroup
 */
function TextPrefetch(Module, TextGroup) {
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
	/**
	 * Creates a new TextCache from the provided CSV file path.
	 * @param {string} path - The path to the CSV lookup file for this TextCache instance
	 * @param {string} [warn] - prefix for warning when key is not found
	 */
	constructor(path, warn = "") {
		this.path = path;
		this.warn = warn;
		this.language = TranslationLanguage;
		this.cache = {};
		this.rebuildListeners = [];
		this.loaded = false;
		this.buildCache();
	}

	/**
	 * Looks up a string from this TextCache. If the cache contains a value for the provided key and a translation is available, the return
	 * value will be automatically translated. Otherwise the EN string will be used. If the cache does not contain a value for the requested
	 * key, the key will be returned.
	 * @param {string} key - The text key to lookup
	 * @returns {string} - The text value corresponding to the provided key, translated into the current language, if available
	 */
	get(key) {
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
	 * @param {Function} callback - The callback to register
	 * @param {boolean} [immediate] - Whether or not the callback should be called on registration
	 * @returns {Function} - A callback function which can be used to unsubscribe the added listener
	 */
	onRebuild(callback, immediate = true) {
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
	 * @returns {void} - Nothing
	 */
	buildCache() {
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
	 * @returns {Promise<string[][]>} - A promise resolving to an array of string arrays, corresponding to lines of CSV values in the CSV
	 * file.
	 */
	fetchCsv() {
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
	 * @param {string[][]} lines - An array of string arrays corresponding to lines in the CSV file
	 * @returns {void} - Nothing
	 */
	cacheLines(lines) {
		lines.forEach((line) => (this.cache[line[0]] = line[1]));
		this.loaded = true;
	}

	/**
	 * Translates the contents of a CSV file into the current game language
	 * @param {string[][]} lines - An array of string arrays corresponding to lines in the CSV file
	 * @returns {Promise<string[][]>} - A promise resolving to an array of string arrays corresponding to lines in the CSV file with the
	 * values translated to the current game language
	 */
	translate(lines) {
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
	 * @param {string[][]} lines - An array of string arrays corresponding to lines in the CSV file
	 * @param {string[]} translations - An array of strings in translation file format (with EN and translated values on alternate lines)
	 * @returns {string[][]} - An array of string arrays corresponding to lines in the CSV file with the
	 * values translated to the current game language
	 */
	buildTranslations(lines, translations) {
		let [translationsStringLineCache, translationsLineStringCache] = TranslationStringCachePreBuild(translations, "");
		return lines.map(line => ([line[0], TranslationStringCache(line[1], translationsStringLineCache, translationsLineStringCache)]));
	}
}
