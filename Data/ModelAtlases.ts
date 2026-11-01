'use strict';

/*
 * Per-folder model texture atlases, one per folder in Models/
 * Configs are generated into tools/models/ and tools/mobile/ by tools/gen_model_atlas_confs.py.
 */

let KDModAtlasFolderWhitelist: string[] = [];
// Records the number of hits for each atlas
// Decrements every X seconds, 
let KDModelAtlasHits: Record<string, number> = {

}
let KDImageAtlasCache: Record<string, string> = {

}
let KDModelAtlasCacheInterval = 100;//real quick for testing to check performance
// Removes this fraction - 1 hit
let KDModelAtlasCachePercent = 0.1;

/**
 * Gets the texture atlas a texture would be packed into
 * For mod textures - we wouldn't know where the mod atlas would be. But mods can be whitelisted by adding to KDModAtlasFolderWhitelist
 * 
 * @param Image - what you would pass to KDTex(Image) "Models/Armbinder/BinderLeftBoxtie.png"
 * @returns atlas id - not full URL for performance
 */
function KDGetModelAtlasID(Image: string): string {
	if (!Image) return "";
	let path = Image.replace(/\\/g, "/");

	// Matches Models/<Folder>/ at the start or after a slash, so ModelsBack/ is excluded
	let match = path.match(/(?:^|\/)Models\/(\w+)\//);
	if (!match) return "";

	let folder = match[1];

	if (KDModFiles[Image] && !KDModAtlasFolderWhitelist[folder]) return "";

	return folder;
}

function KDGetModelAtlasURL(folder: string, mobile: boolean = KDToggles.MobileTextures) {
	return mobile
		? `TextureAtlas/mobile/models_mobile_${folder}_0000.json`
		: `TextureAtlas/models/models_${folder}_0000.json`;
}