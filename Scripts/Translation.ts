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

// It won't work
function KDLoadTranslations(text: string) {
	// pass
}
