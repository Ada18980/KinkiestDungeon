"use strict";
var TranslationLanguage = "EN";
var TranslationCache = {};

/**
 * Dictionary for all supported languages and their files
 * @constant
 */
var TranslationDictionary = [

	{
		LanguageCode: "EN",
		LanguageName: "English",
		EnglishName: "English",
		Files: [
		]
	},
	{
		LanguageCode: "DE",
		LanguageName: "Deutsch",
		EnglishName: "German",
		Files: [
			"Assets/Female3DCG/Female3DCG_DE.txt",
		]
	},
	{
		LanguageCode: "FR",
		LanguageName: "Français",
		EnglishName: "French",
		Files: [
			"Assets/Female3DCG/ColorGroups_FR.txt",
			"Assets/Female3DCG/Female3DCG_FR.txt",
			"Assets/Female3DCG/LayerNames_FR.txt",
		]
	},
	{
		LanguageCode: "RU",
		LanguageName: "Русский",
		EnglishName: "Russian",
		Files: [
			"Assets/Female3DCG/Female3DCG_RU.txt",
			"Assets/Female3DCG/ColorGroups_RU.txt",
			"Assets/Female3DCG/LayerNames_RU.txt",
		]
	},
	{
		LanguageCode: "CN",
		LanguageName: "中文",
		EnglishName: "Chinese",
		Files: [
			"Assets/Female3DCG/ColorGroups_CN.txt",
			"Assets/Female3DCG/Female3DCG_CN.txt",
			"Assets/Female3DCG/LayerNames_CN.txt",
			"Screens/Character/Appearance/Text_Appearance_CN.txt",
			"Screens/Character/BackgroundSelection/Text_BackgroundSelection_CN.txt",
			"Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_CN.txt",
		]
	},
	{
		LanguageCode: "KR",
		LanguageName: "한국어",
		EnglishName: "Korean",
		Files: [
			"Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_KR.txt",
		]
	},
	{
		LanguageCode: "JP",
		LanguageName: "Japanese",
		EnglishName: "Japanese",
		Files: [
			"Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_JP.txt",
		]
	},
	{
		LanguageCode: "ES",
		LanguageName: "Espanol",
		EnglishName: "Spanish",
		Files: [
			"Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_ES.txt",
		]
	},

];

/**
 * Checks if a file can be translated in the selected language
 * @param {string} FullPath - Full path of the file to check for a corresponding translation file
 * @returns {boolean} - Returns TRUE if a translation is available for the given file
 */
function TranslationAvailable(FullPath) {
	var FileName = FullPath.trim().toUpperCase();
	for (let L = 0; L < TranslationDictionary.length; L++)
		if (TranslationDictionary[L].LanguageCode == TranslationLanguage)
			for (let F = 0; F < TranslationDictionary[L].Files.length; F++)
				if (TranslationDictionary[L].Files[F].trim().toUpperCase() == FileName)
					return true;
	return false;
}

/**
 * Parse a TXT translation file and returns it as an array
 * @param {string} str - Content of the translation text file
 * @returns {string[]} - Array of strings with each line divided. For each translated line, the english string precedes the translated one in the array.
 */
function TranslationParseTXT(str) {

	const arr = [];
	let c;
	str = str.replace(/\r\n/g, '\n').trim();

	// iterate over each character, keep track of current row (of the returned array)
	for (let row = c = 0; c < str.length; c++) {
		let cc = str[c];        // current character, next character
		arr[row] = arr[row] || "";             // create a new row if necessary
		if (cc == '\n') { ++row; continue; }   // If it's a newline, move on to the next row
		arr[row] += cc;                        // Otherwise, append the current character to the row
	}

	// Removes any comment rows (starts with ###)
	for (let row = arr.length - 1; row >= 0; row--)
		if (arr[row].indexOf("###") == 0) {
			arr.splice(row, 1);
		}

	// Trims the full translated array
	for (let row = 0; row < arr.length; row++)
		arr[row] = arr[row].trim();
	return arr;
}

/**
 * Translates a string to another language from the array, the translation is always the one right after the english line
 * @param {string} S - The original english string to translate
 * @param {string[]} T - The active translation dictionary
 * @param {string} CharacterName - Name of the character if it is required to replace it within the string.
 * @returns {string} - The translated string
 */
function TranslationString(S, T, CharacterName) {
	if ((S != null) && (S.trim() !== "")) {
		S = S.trim();
		for (let P = 0; P < T.length - 1; P++)
			if (S === T[P].replace("DialogCharacterName", CharacterName).replace("DialogPlayerName", CharacterNickname(Player)))
				return T[P + 1].replace("DialogCharacterName", CharacterName).replace("DialogPlayerName", CharacterNickname(Player));
	}
	return S;
}

/**
 * build [translationsStringLineCache, translationsLineStringCache] for TranslationStringCache
 * @param {string[]} translations - An array of strings in translation file format (with EN and translated values on alternate lines)
 * @param {string} CharacterName - Name of the character if it is required to replace it within the string.
 * @returns {[Map<string, number>, Map<number, string>]} - The translated cache [translationsStringLineCache, translationsLineStringCache]
 */
function TranslationStringCachePreBuild(translations, CharacterName) {
	let translationsStringLineCache = new Map();
	let translationsLineStringCache = new Map();
	// for (let P = 0; P < T.length - 1; P++) {
	// 	if (S1 === T[P].replace("DialogCharacterName", CharacterName).replace("DialogPlayerName", CharacterNickname(Player)))
	// 		return T[P + 1].replace("DialogCharacterName", CharacterName).replace("DialogPlayerName", CharacterNickname(Player));
	// }
	translations.forEach((T, i) => {
		let S = T.replace("DialogCharacterName", CharacterName).replace("DialogPlayerName", CharacterNickname(Player));
		translationsStringLineCache.set(S, i);
		translationsLineStringCache.set(i, S);
	})
	return [translationsStringLineCache, translationsLineStringCache];
}

/**
 * Translates a string to another language from the array,
 * the translation is always the one right after the english line
 * this is the cache mode of TranslationString
 * @param {string} S - The original english string to translate
 * @param {Map<string, number>} translationsStringLineCache - The active translation dictionary <string, stringLine>
 * @param {Map<number, string>} translationsLineStringCache - The active translation dictionary <stringLine, string>
 * @returns {string} - The translated string
 */
function TranslationStringCache(S, translationsStringLineCache, translationsLineStringCache) {
	if (S != null) {
		let S1 = S.trim();
		if (S1 !== "") {
			try {
				let l = translationsStringLineCache.get(S1);
				if (l) {
					// the translation is always the one right after the english line
					let s = translationsLineStringCache.get(l + 1);
					if (s) {
						return s;
					}
					console.warn('TranslationStringCache lost translationsLineStringCache:', S, l);
				}
				return S;
			} catch (e) {
				// ignore
				console.warn('TranslationStringCache catch:', S, translationsStringLineCache.get(S1), e);
			}
		}
	}
	return S;
}

/**
 * Translates a character dialog from the specified array
 * @param {Character} C - The character for which we need to translate the dialog array.
 * @param {string[]} T - The active translation dictionary
 * @returns {void} - Nothing
 */
function TranslationDialogArray(C, T) {
	for (let D = 0; D < C.Dialog.length; D++) {
		C.Dialog[D].Option = TranslationString(C.Dialog[D].Option, T, C.Name);
		C.Dialog[D].Result = TranslationString(C.Dialog[D].Result, T, C.Name);
	}
}

/**
 * Translates a set of tags. Rerenders the login message when on the login page.
 * @param {Array.<{Tag: string, Value: string}>} S - Array of current tag-value pairs
 * @param {string[]} T - The active translation dictionary
 * @returns {void} - Nothing
 */
function TranslationTextArray(S, T) {
	for (let P = 0; P < S.length; P++)
		S[P].Value = TranslationString(S[P].Value, T, "");
}

/**
 * Translate a character dialog if the file is in the dictionary
 * @param {Character} C - The character for which we want to translate the dialog
 * @returns {void} - Nothing
 */
function TranslationDialog(C) {

	// If we play in a foreign language
	if ((TranslationLanguage != null) && (TranslationLanguage.trim() != "") && (TranslationLanguage.trim().toUpperCase() != "EN")) {

		var OnlinePlayer = C.AccountName.indexOf("Online-") >= 0;
		// Finds the full path of the translation file to use
		var FullPath = (OnlinePlayer ? "Screens/Online/ChatRoom/Dialog_Online" :  (C.ID == 0) ? "Screens/Character/Player/Dialog_Player" : "Screens/" + CurrentModule + "/" + CurrentScreen + "/Dialog_" + C.AccountName) + "_" + TranslationLanguage + ".txt";

		// If the translation file is already loaded, we translate from it
		if (TranslationCache[FullPath]) {
			TranslationDialogArray(C, TranslationCache[FullPath]);
			return;
		}

		// If the translation is available, we open the txt file, parse it and returns the result to build the dialog
		if (TranslationAvailable(FullPath))
			CommonGet(FullPath, function() {
				if (this.status == 200) {
					TranslationCache[FullPath] = TranslationParseTXT(this.responseText);
					TranslationDialogArray(C, TranslationCache[FullPath]);
				}
			});

	}

}

/**
 * Translate an array of tags in the current selected language
 * @param {Array.<{Tag: string, Value: string}>} Text - Array of current tag-value pairs
 * @returns {void} - Nothing
 */
function TranslationText(Text) {
	// If we play in a foreign language
	if ((TranslationLanguage != null) && (TranslationLanguage.trim() != "") && (TranslationLanguage.trim().toUpperCase() != "EN")) {

		// Finds the full path of the translation file to use
		var FullPath = "Screens/" + CurrentModule + "/" + CurrentScreen + "/Text_" + CurrentScreen + "_" + TranslationLanguage + ".txt";

		// If the translation file is already loaded, we translate from it
		if (TranslationCache[FullPath]) {
			TranslationTextArray(Text, TranslationCache[FullPath]);
			return;
		}

		// If the translation is available, we open the txt file, parse it and returns the result to build the dialog
		if (TranslationAvailable(FullPath))
			CommonGet(FullPath, function() {
				if (this.status == 200) {
					TranslationCache[FullPath] = TranslationParseTXT(this.responseText);
					TranslationTextArray(Text, TranslationCache[FullPath]);
				}
			});

	}

}

/**
 * Translates the asset group and asset descriptions based on the given dictionary
 * @param {string[]} T - The active translation dictionary
 * @returns {void} - Nothing
 */
function TranslationAssetProcess(T) {
	for (let A = 0; A < AssetGroup.length; A++)
		AssetGroup[A].Description = TranslationString(AssetGroup[A].Description, T, "");
	for (let A = 0; A < Asset.length; A++)
		Asset[A].Description = TranslationString(Asset[A].Description, T, "");
}

/**
 * Translates the description of the assets and groups of an asset family
 * @param {string} Family - Name of the asset family to translate
 * @returns {void} - Nothing
 */
function TranslationAsset(Family) {

	// If we play in a foreign language
	if ((TranslationLanguage != null) && (TranslationLanguage.trim() != "") && (TranslationLanguage.trim().toUpperCase() != "EN")) {

		// Finds the full path of the translation file to use
		var FullPath = "Assets/" + Family + "/" + Family + "_" + TranslationLanguage + ".txt";

		// If the translation file is already loaded, we translate from it
		if (TranslationCache[FullPath]) {
			TranslationAssetProcess(TranslationCache[FullPath]);
			return;
		}

		// If the translation is available, we open the txt file, parse it and returns the result to build the dialog
		if (TranslationAvailable(FullPath))
			CommonGet(FullPath, function() {
				if (this.status == 200) {
					TranslationCache[FullPath] = TranslationParseTXT(this.responseText);
					TranslationAssetProcess(TranslationCache[FullPath]);
				}
			});

	}

}

/**
 * Changes the current language and save the new selected language to local storage
 * @returns {void} - Nothing
 */
function TranslationNextLanguage() {
	for (let L = 0; L < TranslationDictionary.length; L++)
		if (TranslationDictionary[L].LanguageCode == TranslationLanguage) {
			if (L != TranslationDictionary.length - 1)
				TranslationLanguage = TranslationDictionary[L + 1].LanguageCode;
			else
				TranslationLanguage = TranslationDictionary[0].LanguageCode;
			localStorage.setItem("BondageClubLanguage", TranslationLanguage);
			return;
		}
}

/**
 * Loads the previous translation language from local storage if it exists
 * @returns {void} - Nothing
 */
function TranslationLoad() {
	var L = localStorage.getItem("BondageClubLanguage");
	if (L != null) TranslationLanguage = L;
}
