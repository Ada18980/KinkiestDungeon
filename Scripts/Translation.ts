let TranslationLanguage = "EN";
let TranslationCache: Record<string, string[]> = {};

/**
 * Loads the previous translation language from local storage if it exists
 */
function TranslationLoad(): void {
	let language;
	if (localStorage.getItem("LanguageChange") == "1")
	{
		language = localStorage.getItem("BondageClubLanguage");
	}
	else
	{
		language = GetUserPreferredLanguage();
		if (language != null) localStorage.setItem("BondageClubLanguage",language);
	}

	if (language != null) TranslationLanguage = language;
}

function GetUserPreferredLanguage() {
  var languages;
  try {
    languages = Intl.DateTimeFormat().resolvedOptions().locale.split("-");
  } catch {
    languages = navigator.language.split("-");
  }
  if (!languages) {
    return "";
  }

  for (let i = 0; i < languages.length; i++) {
    let lang = languages[i];
    if (KDLanguages.includes(lang)) return lang;
  }
  return "";
}


/**
 * Loads an array of texts loaded from a .csv file
 * @param text1 - Primary array to load - this will probably be English
 * @param text2 - Secondary array to load - this is probably a translation - This part might not be working?
 */
function KDLoadTranslations(text1: string, text2: string = null) {
	let parsedkeys = {};
	let parsedkeystranslation = {};
	const text1array = text1.replace(/\r\n?/g, '\n').trim().split('\n');
	text1array.forEach((line: string) => {
		try {
			let keyloc = line.indexOf(",");
			const textkey = line.slice(0,keyloc);
			let val = line.slice(keyloc+1);
			// Remove quotes if the value string has commas in it.
			if ((val.startsWith('"') && (val.endsWith('"'))) || ((val.startsWith("'")) && (val.endsWith("'")))) {
				val = val.slice(1,-1);
			}
			if (textkey === null || val === undefined) {
				console.log("Error while parsing line: " + line);
			}
			else {
				parsedkeys[textkey] = val;
			}
		}
		catch (err) {
			console.log(err);
		}
	})
	if (text2 != null) {
		const text2array = text2.replace(/\r\n?/g, '\n').trim().split('\n');
		text2array.forEach((line: string) => {
			try {
				let keyloc = line.indexOf(",");
				const textkey = line.slice(0,keyloc);
				let val = line.slice(keyloc+1);
				// Remove quotes if the value string has commas in it.
				if ((val.startsWith('"') && (val.endsWith('"'))) || ((val.startsWith("'")) && (val.endsWith("'")))) {
					val = val.slice(1,-1);
				}
				if (textkey === null || val === undefined) {
					console.log("Error while parsing line: " + line);
				}
				else {
					parsedkeystranslation[textkey] = val;
				}
			}
			catch (err) {
				console.log(err);
			}
		})
	}
	const keys = Object.keys(parsedkeys)
	console.log(parsedkeys);
	console.log(parsedkeystranslation);
	keys.forEach((key: string) => {
		if (parsedkeystranslation[key] != undefined) {
			addTextKey(key, (parsedkeystranslation[key].slice('\r')));
		}
		else {
			addTextKey(key, (parsedkeys[key].slice('\r')));
		}
	})
}