let TranslationLanguage = "EN";
let TranslationCache: Record<string, string[]> = {};

/**
 * Loads the previous translation language from local storage if it exists
 */
function TranslationLoad(): void {
  let language =
    localStorage.getItem("LanguageChange") === "1"
      ? localStorage.getItem("BondageClubLanguage")
      : GetUserPreferredLanguage();

  if (language) {
    localStorage.setItem("BondageClubLanguage", language);
    TranslationLanguage = language;
  }

  TranslationLanguage = "EN";
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
