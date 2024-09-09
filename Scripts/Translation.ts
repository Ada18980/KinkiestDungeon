let TranslationLanguage = "EN";
let TranslationCache = {};

/**
 * Dictionary for all supported languages and their files
 * @constant
 */
let TranslationDictionary = [

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
		LanguageName: "简体中文",
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
		LanguageCode: "RU",
		LanguageName: "한국어",
		EnglishName: "Pусский",
		Files: [
			"Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_RU.txt",
		]
	},
	{
		LanguageCode: "JP",
		LanguageName: "日本語",
		EnglishName: "Japanese",
		Files: [
			"Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_JP.txt",
		]
	},
	{
		LanguageCode: "ES",
		LanguageName: "Español",
		EnglishName: "Spanish",
		Files: [
			"Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_ES.txt",
		]
	},

];

/**
 * Checks if a file can be translated in the selected language
 * @param FullPath - Full path of the file to check for a corresponding translation file
 * @returns Returns TRUE if a translation is available for the given file
 */
function TranslationAvailable(FullPath: string): boolean {
	let FileName = FullPath.trim().toUpperCase();
	for (let L = 0; L < TranslationDictionary.length; L++)
		if (TranslationDictionary[L].LanguageCode == TranslationLanguage)
			for (let F = 0; F < TranslationDictionary[L].Files.length; F++)
				if (TranslationDictionary[L].Files[F].trim().toUpperCase() == FileName)
					return true;
	return false;
}

/**
 * Parse a TXT translation file and returns it as an array
 * @param str - Content of the translation text file
 * @returns Array of strings with each line divided. For each translated line, the english string precedes the translated one in the array.
 */
function TranslationParseTXT(str: string): string[] {
	const arr: string[] = str
		.replace(/\r\n/g, '\n')
		.trim()
		.split('\n')
		.filter(line => !line.startsWith('###'))
		.map(line => line.trim());
	
	return arr;
}

/**
 * Translates a string to another language from the array, the translation is always the one right after the english line
 * @param S - The original english string to translate
 * @param T - The active translation dictionary
 * @param CharacterName - Name of the character if it is required to replace it within the string.
 * @returns The translated string
 */
function TranslationString(S: string, T: string[], CharacterName: string): string {
	if ((S != null) && (S.trim() !== "")) {
		S = S.trim();
		for (let P = 0; P < T.length - 1; P++)
			if (S === T[P])
				return T[P + 1];
	}
	return S;
}

/**
 * build [translationsStringLineCache, translationsLineStringCache] for TranslationStringCache
 * @param translations - An array of strings in translation file format (with EN and translated values on alternate lines)
 * @param CharacterName - Name of the character if it is required to replace it within the string.
 * @returns The translated cache [translationsStringLineCache, translationsLineStringCache]
 */
function TranslationStringCachePreBuild(translations: string[], CharacterName: string): [Map<string, number>, Map<number, string>] {
	let translationsStringLineCache = new Map();
	let translationsLineStringCache = new Map();
	translations.forEach((T, i) => {
		let S = T;
		translationsStringLineCache.set(S, i);
		translationsLineStringCache.set(i, S);
	});
	return [translationsStringLineCache, translationsLineStringCache];
}

/**
 * Translates a string to another language from the array,
 * the translation is always the one right after the english line
 * this is the cache mode of TranslationString
 * @param S - The original english string to translate
 * @param translationsStringLineCache - The active translation dictionary <string, stringLine>
 * @param translationsLineStringCache - The active translation dictionary <stringLine, string>
 * @returns The translated string
 */
function TranslationStringCache(S: string, translationsStringLineCache: Map<string, number>, translationsLineStringCache: Map<number, string>): string {
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
 * Translates a set of tags. Rerenders the login message when on the login page.
 * @param S - Array of current tag-value pairs
 * @param T - The active translation dictionary
 */
function TranslationTextArray(S: {Tag: string, Value: string}[], T: string[]): void {
	for (let P = 0; P < S.length; P++)
		S[P].Value = TranslationString(S[P].Value, T, "");
}


/**
 * Translate an array of tags in the current selected language
 * @param Text - Array of current tag-value pairs
 */
function TranslationText(Text: {Tag: string, Value: string}[]): void {
	// If we play in a foreign language
	if ((TranslationLanguage != null) && (TranslationLanguage.trim() != "") && (TranslationLanguage.trim().toUpperCase() != "EN")) {

		// Finds the full path of the translation file to use
		let FullPath = "Screens/" + CurrentModule + "/" + CurrentScreen + "/Text_" + CurrentScreen + "_" + TranslationLanguage + ".txt";

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
 * Changes the current language and save the new selected language to local storage
 */
function TranslationNextLanguage(): void {
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
 */
function TranslationLoad(): void {
	let L = localStorage.getItem("BondageClubLanguage");
	if (L != null) TranslationLanguage = L;
}
