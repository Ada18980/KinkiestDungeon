/**
 *  Manages the generation of file paths for localization resources.
 */
class TextResPathGenerator {
	static readonly BASE_PATH = "Screens/MiniGame/KinkyDungeon";
	private file_path: string;
	private file_prefix: string;

	constructor(base_path: string, file_prefix: string) {
		this.file_path = base_path;
		this.file_prefix = file_prefix;
	}

	genOriginalPath() {
		return `${this.file_path}/${this.file_prefix}.csv`;
	}

	genTranslationPath(language: string) {
		return `${this.file_path}/${this.file_prefix
			}_${language.toUpperCase()}.txt`;
	}

	genTranslationMap(
		allowed_languages: LanguageIdentifier[]
	): Map<LanguageIdentifier, ResourceUrl> {
		let map = new Map<LanguageIdentifier, ResourceUrl>();
		allowed_languages.forEach((lang) => {
			map.set(lang, this.genTranslationPath(lang));
		});
		return map;
	}
}

// Configuration options for resource loading
type ResourceLoadOptions = {
	requestInit?: RequestInit;
	signal?: AbortSignal;
	nocache?: boolean;
	retries?: number;
};

type ResourceParser<T> = (response: Response) => Promise<T>;

// Handles resource loading with caching and retry mechanism
class ResourceLoader {
	private static cache = new Map<string, any>();

	private static parserRegistry = new Map<string, ResourceParser<any>>([
		["text", (r) => r.text()],
		["json", (r) => r.json()],
		["blob", (r) => r.blob()],
	]);

	static registerParser<T>(type: string, parser: ResourceParser<T>) {
		this.parserRegistry.set(type, parser);
	}

	static async load<T>(
		url: string,
		type: string,
		options?: ResourceLoadOptions
	): Promise<T> {
		// Caching can lead to memory leaks, need to improve recycling strategy before enabling
		options.nocache = true;
		const cached = this.cache.get(url);
		if (cached && !options?.nocache) {
			return cached;
		}

		const response = await this.fetchWithRetry(url, options);
		const parser = this.parserRegistry.get(type);

		if (!parser) {
			throw new Error(`No parser registered for type: ${type}`);
		}

		return parser(response);
	}

	private static async fetchWithRetry(
		url: string,
		options?: ResourceLoadOptions
	): Promise<Response> {
		const retries = options?.retries ?? 3;
		let attempt = 0;

		while (attempt <= retries) {
			try {
				const response = await fetch(url, {
					...options?.requestInit,
					signal: options?.signal,
				});
				if (response.ok) return response;
				throw new Error(`HTTP ${response.status}`);
			} catch (error) {
				if (++attempt > retries) throw error;
				await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
			}
		}
		throw new Error("Unreachable");
	}
}

// Parses translation text files into structured format
class TranslationTextParser {
	static parseLines(text: string): string[] {
		return text.split(/\r?\n/);
	}

	static parseTranslationText(text: string): LocalizationResources {
		const textTranslationMap = new Map<string, string>();
		const tagTranslationMap = new Map<string, string>();

		const lines = this.parseLines(text);
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trimStart();

			if (line.startsWith("-")) {
				textTranslationMap.set(line.slice(1).trimStart(), lines[++i].trimStart());
			} else if (line.startsWith("::")) {
				tagTranslationMap.set(line.slice(2).trimStart(), lines[++i].trimStart());
			}
		}

		return { textTranslationMap, tagTranslationMap };
	}
}

ResourceLoader.registerParser("original-csv", async (r) => {
	const text = await r.text();
	return new Map(CommonParseCSV(text).map(([key, value]) => [key, value]));
});

ResourceLoader.registerParser("translation-txt", async (r) => {
	const text = await r.text();
	return TranslationTextParser.parseTranslationText(text);
});

/**
 * ===== Type Definitions =====
 */
const AvaliableLanguages = ["EN", "CN", "DE", "ES", "JP", "KR", "RU"] as const;
type LanguageIdentifier = (typeof AvaliableLanguages)[number];
const NormalSupportedLanguages = AvaliableLanguages.filter(
	(lang) => lang !== "EN"
);

type TextResKey = string;
type TextResValue = string;

type TextResMap = Map<TextResKey, TextResValue>;

type LocalizationResources = {
	textTranslationMap: TextResMap;
	tagTranslationMap: TextResMap;
};

type TextGroupId = string;
type ResourceUrl = string;

/**
 * Manages groups of source text resources
 */
class TextGroupManager {
	private sourceTextGroupMap: Map<TextGroupId, TextResMap> = new Map();

	/**
	 * Set group (note, this will directly overwrite)
	 * @param sourceText Original text mapping
	 */
	public setGroup(groupId: TextGroupId, sourceText: TextResMap): void {
		this.sourceTextGroupMap.set(groupId, sourceText);
	}

	public removeGroup(groupId: TextGroupId): void {
		this.sourceTextGroupMap.delete(groupId);
	}
	// Get group (create if not exists)
	public getGroup(groupId: TextGroupId): TextResMap {
		let group = this.sourceTextGroupMap.get(groupId);
		if (!group) {
			group = new Map();
			this.setGroup(groupId, group);
		}
		return group;
	}

	/**
	 * Appends a source text map to an existing text group identified by the given groupId.
	 *
	 * @param groupId - The identifier of the text group to which the source text map will be appended.
	 * @param sourceText - The original text map that will be merged into the existing text group.
	 * @returns void
	 */
	public appendTextMap(groupId: TextGroupId, sourceText: TextResMap): void {
		const group = this.getGroup(groupId);
		this.mergeMaps(group, sourceText);
	}

	/**
	 * Appends a text resource to the specified group.
	 *
	 * @param groupId - The identifier of the text group to which the text resource will be appended.
	 * @param key - The key for the text resource.
	 * @param value - The value of the text resource.
	 */
	public appendText(
		groupId: TextGroupId,
		key: TextResKey,
		value: TextResValue
	): void {
		this.appendTextMap(groupId, new Map([[key, value]]));
	}

	private mergeMaps<T>(target: Map<string, T>, source: Map<string, T>) {
		source.forEach((v, k) => target.set(k, v));
	}
}

// Handles language-specific translation operations
class LocalizationService {
	private currentLanguage: LanguageIdentifier = "EN";

	private localizationMap: Map<LanguageIdentifier, LocalizationResources> =
		new Map();

	public getCurrentTranslation(): LocalizationResources | null {
		return this.localizationMap.get(this.currentLanguage) || null;
	}

	/**
	 * Sets the translation for a specific language.
	 *
	 * @param language - The identifier of the language for which the translation is being set.
	 * @param translation - The localization resources containing the translation data.
	 */
	public setTranslation(
		language: LanguageIdentifier,
		translation: LocalizationResources
	): void {
		this.localizationMap.set(language, translation);
	}

	/**
	 * Appends a translation to the existing localization map for a given language.
	 * If the language does not exist in the map, it adds the new translation.
	 * If the language already exists, it merges the new translation with the existing one.
	 *
	 * @param language - The identifier of the language for which the translation is being added.
	 * @param translation - The localization resources to be appended.
	 * @returns void
	 */
	public appendTranslation(
		language: LanguageIdentifier,
		translation: LocalizationResources
	): void {
		const current = this.localizationMap.get(language);
		if (!current) {
			this.localizationMap.set(language, translation);
		} else {
			this.mergeLocalizationResources(current, translation);
		}
	}

	private mergeLocalizationResources(
		target: LocalizationResources,
		source: LocalizationResources
	): void {
		source.textTranslationMap.forEach((v, k) =>
			target.textTranslationMap.set(k, v)
		);
		source.tagTranslationMap.forEach((v, k) =>
			target.tagTranslationMap.set(k, v)
		);
	}

	/**
	 * Translates a given text resource key or value to the current localization.
	 *
	 * @param tag - The text resource key to be translated.
	 * @param text - The text resource value to be translated.
	 * @returns The translated string if found, otherwise `null`.
	 */
	public translate(tag: TextResKey, text: TextResValue): string | null {
		const currentLocalization = this.getCurrentTranslation();
		if (!currentLocalization) {
			return null;
		}

		const translation = currentLocalization.tagTranslationMap.get(tag);
		if (translation) {
			return translation;
		}

		return currentLocalization.textTranslationMap.get(text) || null;
	}

	/**
	 * Sets the current language of the TextResourceManager.
	 *
	 * @param lang - The language identifier to set as the current language.
	 * @returns A promise that resolves when the language has been set.
	 */
	public async setLanguage(lang: LanguageIdentifier): Promise<void> {
		if (this.currentLanguage === lang) {
			return;
		}

		this.currentLanguage = lang;
	}
}

type LocalizationFileUrlMap = Map<LanguageIdentifier, ResourceUrl>;

type TextResourceConfig = {
	groupId: TextGroupId; // group id
	original: ResourceUrl; // original text resource url
	localizationDictionary: LocalizationFileUrlMap; // translation text resource url

	lazyLoad?: boolean; // no support yet
};

type TemplateParams = { [key: string]: string | number | boolean };
// Resource Loader
// Provides resource loading state management, caching, and termination
class TextResourceLoader<T> {
	// Loader cache, will not cache if failed
	private resourcePromiseCache: Map<ResourceUrl, Promise<T>> = new Map();
	private abortController = new AbortController();

	/**
	 * Pushes a load request for a resource and returns a promise that resolves with the resource.
	 * If the resource is already being loaded, the existing promise is returned.
	 *
	 * @template T - The type of the resource being loaded.
	 * @param {ResourceUrl} url - The URL of the resource to load.
	 * @param {string} loadType - The type of load operation to perform.
	 * @returns {Promise<T>} A promise that resolves with the loaded resource.
	 *
	 * @throws Will log an error and remove the resource from the cache if the load fails.
	 */
	pushLoad(url: ResourceUrl, loadType: string): Promise<T> {
		const cached = this.resourcePromiseCache.get(url);
		if (cached) return cached;

		const promise = ResourceLoader.load<T>(url, loadType, {
			signal: this.abortController.signal,
		});
		promise.catch(() => {
			console.error(`Loading resource failed: ${url}`);

			this.resourcePromiseCache.delete(url);
		});

		this.resourcePromiseCache.set(url, promise);
		return promise;
	}

	abortAll(): void {
		this.abortController.abort();
		this.abortController = new AbortController();
	}

	isLoaded(): boolean {
		return this.resourcePromiseCache.size === 0;
	}

	clearCache(): void {
		this.resourcePromiseCache.clear();
	}

	/**
	 * Waits for all resource promises in the cache to resolve.
	 *
	 * @returns {Promise<void>} A promise that resolves when all resource promises have resolved.
	 */
	async waitAll(): Promise<void> {
		await Promise.all(this.resourcePromiseCache.values());
	}
}

// Singleton class for unified text resource management
// Methods use the default group by default. To operate on a specific group, please get the corresponding manager/service first.
class TextProvider {
	private static _instance: TextProvider = new TextProvider();

	public readonly defaultGroupId = "default";
	private _debugMode = false;
	private currentLanguage: LanguageIdentifier = null;

	private textGroupManager: TextGroupManager = new TextGroupManager();
	private translationServiceGroup: Map<TextGroupId, LocalizationService> =
		new Map();

	private originalTextLoader = new TextResourceLoader<TextResMap>();
	private translationTextLoader =
		new TextResourceLoader<LocalizationResources>();

	private textResourceConfig: TextResourceConfig[] = [];

	private constructor() {
		this.initializeDefaultConfig();
	}

	/**
	 * Initializes the default configuration for text resources.
	 */
	private initializeDefaultConfig() {
		const pathGener = new TextResPathGenerator(
			"Screens/MiniGame/KinkyDungeon",
			"Text_KinkyDungeon"
		);

		this.appendTextResource({
			groupId: this.defaultGroupId,
			original: pathGener.genOriginalPath(),
			localizationDictionary: pathGener.genTranslationMap(
				NormalSupportedLanguages
			),
		});
	}

	public setDebugMode(debug: boolean): void {
		this._debugMode = debug;
	}

	public static get instance(): TextProvider {
		return this._instance;
	}

	/**
	 * Retrieves the text associated with the specified tag.
	 *
	 * @param tag - The tag identifying the text to retrieve.
	 * @param params - Optional parameters to format the text.
	 * @returns The text associated with the specified tag, formatted with the provided parameters if any.
	 */
	getText(tag: string, params?: TemplateParams, legacy?: boolean): string {
		return this.getTextFromGroup(this.defaultGroupId, tag, params, legacy);
	}
	/**
	 * Retrieves the text associated with the specified tag.
	 *
	 * @param tag - The tag identifying the text to retrieve.
	 * @param params - Optional parameters to format the text.
	 * @returns The text associated with the specified tag, formatted with the provided parameters if any.
	 */
	hasText(tag: string, params?: TemplateParams): boolean {
		return !!this.getTextFromGroupStrict(this.defaultGroupId, tag, params);
	}

	public queryResourceConfig(groupId: TextGroupId): TextResourceConfig[] {
		return this.textResourceConfig.filter(
			(config) => config.groupId === groupId
		);
	}

	/**
	 * Appends a text resource configuration to the manager and sets up the original and translated text.
	 *
	 * @param config - The configuration object for the text resource.
	 * @param config.groupId - The identifier for the group of text resources.
	 * @param config.original - The original text to be loaded and set up.
	 * @param config.localizationDictionary - A map containing translations for different languages.
	 * @param config.localizationDictionary.has - Checks if a translation exists for the current language.
	 * @param config.localizationDictionary.get - Retrieves the translation for the current language.
	 *
	 * This method performs the following steps:
	 * 1. Adds the provided text resource configuration to the internal list.
	 * 2. Loads and sets up the original text using the provided groupId and original text.
	 * 3. Checks if a translation exists for the current language in the localization dictionary.
	 * 4. If a translation exists, loads and sets up the translated text for the current language.
	 */
	public appendTextResource(config: TextResourceConfig) {
		this.textResourceConfig.push(config);
		this.loadAndSetupOriginalText(config.groupId, config.original);
		const currentLang = this.currentLanguage;
		if (!config.localizationDictionary.has(currentLang)) return;

		this.loadAndSetupTranslationText(
			config.groupId,
			config.localizationDictionary.get(currentLang),
			currentLang
		);
	}

	/**
	 * Retrieves a text string from a specified group and tag, optionally applying template parameters.
	 *
	 * @param groupId - The identifier of the group from which to retrieve the text.
	 * @param tag - The tag associated with the desired text within the group.
	 * @param params - Optional template parameters to apply to the text.
	 * @param legacy - legacy mode, does not include [NotFound] tag
	 * @returns The retrieved text string, with template parameters applied if provided. If the text is not found, returns "[NotFound] " followed by the tag.
	 */
	getTextFromGroup(
		groupId: TextGroupId,
		tag: string,
		params?: TemplateParams,
		legacy?: boolean
	): string {
		let src = this.getTextFromGroupStrict(groupId, tag, params);
		return src != undefined ? src : (legacy ? tag : ("[NotFound] " + tag));
	}


	/**
	 * Retrieves a text string from a specified group and tag, optionally applying template parameters.
	 *
	 * @param groupId - The identifier of the group from which to retrieve the text.
	 * @param tag - The tag associated with the desired text within the group.
	 * @param params - Optional template parameters to apply to the text.
	 * @returns The retrieved text string, with template parameters applied if provided. If the text is not found, returns "[NotFound] " followed by the tag.
	 */
	getTextFromGroupStrict(
		groupId: TextGroupId,
		tag: string,
		params?: TemplateParams
	): string {
		const source = this.getGroupManager().getGroup(groupId);
		const translationService = this.getTranslationService(groupId);
		const sourceText = source.get(tag);

		let text = translationService.translate(tag, sourceText) || sourceText;

		if (text && params) {
			text = TextProvider.applyTemplate(text, params);
		}

		if (this._debugMode) {
			text = `${tag}::${text}`;
		}

		return text;
	}

	/**
	 * Retrieves the localization service for a given text group ID.
	 * If the service does not already exist, it creates a new instance,
	 * stores it in the translation service group, and then returns it.
	 *
	 * @param groupId - The identifier for the text group.
	 * @returns The localization service associated with the given text group ID.
	 */
	getTranslationService(groupId: TextGroupId): LocalizationService {
		let service = this.translationServiceGroup.get(groupId);
		if (!service) {
			service = new LocalizationService();
			this.translationServiceGroup.set(groupId, service);
		}
		return service;
	}

	// Get text group manager
	getGroupManager(): TextGroupManager {
		return this.textGroupManager;
	}

	/**
	 * Loads and sets up the original text for a given text group.
	 *
	 * This method pushes a load request for the original text from the specified URL,
	 * and once the text is loaded, it appends the text map to the text group manager.
	 *
	 * @param groupId - The identifier of the text group to which the text will be appended.
	 * @param url - The URL from which the original text will be loaded.
	 */
	loadAndSetupOriginalText(groupId: TextGroupId, url: ResourceUrl): void {
		this.originalTextLoader.pushLoad(url, "original-csv").then((source) => {
			this.textGroupManager.appendTextMap(groupId, source);
		});
	}

	/**
	 * Loads and sets up translation text for a specified language and group.
	 *
	 * @param groupId - The identifier for the text group.
	 * @param url - The URL from which to load the translation text.
	 * @param language - The language identifier for the translation.
	 */
	loadAndSetupTranslationText(
		groupId: TextGroupId,
		url: ResourceUrl,
		language: LanguageIdentifier
	) {
		const translationService = this.getTranslationService(groupId);
		this.translationTextLoader
			.pushLoad(url, "translation-txt")
			.then((translation) => {
				translationService.appendTranslation(language, translation);
			});
	}

	/**
	 * Sets the current language for the TextResourceManager. If the specified language
	 * is different from the current language, it updates the current language and
	 * reconfigures the text resources accordingly.
	 *
	 * @param language - The language identifier to set as the current language.
	 *
	 * This method performs the following steps:
	 * 1. Checks if the specified language is different from the current language.
	 * 2. Updates the current language.
	 * 3. Iterates through the text resource configurations and updates the translation
	 *    service for each group.
	 * 4. Loads and sets up the translation text for the specified language if available.
	 * 5. Clears the translation text cache after all translations have been loaded.
	 */
	setLanguage(language: LanguageIdentifier): void {
		if (this.currentLanguage === language) return;
		this.currentLanguage = language;

		this.textResourceConfig.forEach((config) => {
			const groupId = config.groupId;
			const localizationMap = config.localizationDictionary;

			const translationService = this.getTranslationService(groupId);
			translationService.setLanguage(language);

			if (!localizationMap.has(language)) return;

			this.loadAndSetupTranslationText(
				groupId,
				localizationMap.get(language),
				language
			);
		});

		this.translationTextLoader.waitAll().then(() => {
			this.translationTextLoader.clearCache();
		});
	}

	/**
	 * Asynchronously waits for all text resources to be loaded by both the original and translation text loaders.
	 *
	 * @returns {Promise<TextProvider>} A promise that resolves to the current instance of TextProvider once all text resources are loaded.
	 */
	async readyAll(): Promise<TextProvider> {
		await this.originalTextLoader.waitAll();
		await this.translationTextLoader.waitAll();

		return this;
	}

	static applyTemplate(text: string, params: TemplateParams): string {
		return text.replace(/\$\{(\w+)\}/g, (match, key) => {
			const value = params[key];
			return value !== undefined ? String(value) : match;
		});
	}
}

const textProvider = TextProvider.instance;

// === Compatible with old interfaces ===

function TextGet(TextTag: string, params?: TemplateParams): string {
	if (KDToggles.ModCompat && !params) {
		return textProvider.getText(TextTag, params, true);
	}
	return textProvider.getText(TextTag, params);
}
function HasText(TextTag: string, params?: TemplateParams): boolean {
	return textProvider.hasText(TextTag, params);
}



function TextLoad(): void {
	textProvider.setLanguage(TranslationLanguage as LanguageIdentifier);
}


function addTextKey(Name: string, Text: string) {
	textProvider
		.getGroupManager()
		.appendText("default", Name, Text);
}