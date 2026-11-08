
interface KDPronounData {
	player: entity,
	type: string,
	pronoun: string,
	priority: number,
	lowercase: boolean,
}

type KDCustomPronounForm = "they" | "them" | "their" | "theyre" | "theyve";

interface KDCustomPronounData {
	they?: string,
	them?: string,
	their?: string,
	theyre?: string,
	theyve?: string,
	/** e.g. "they attack" instead of "she attacks" */
	plural?: boolean,
}

let KDCustomPronounFields: {type: string, field: KDCustomPronounForm}[] = [
	{type: "", field: "they"},
	{type: "Obj", field: "them"},
	{type: "Pos", field: "their"},
	{type: "Is", field: "theyre"},
	{type: "Have", field: "theyve"},
];

/** Generates a key based on id */
function KDCustomPronounKey(id: number): string {
	return "Custom" + id;
}
function KDGetCustomPronounData(pronoun: string, data: KDGameDataBase = KDGameData): KDCustomPronounData | undefined {
	return data?.CustomPronouns?.[pronoun];
}

function KDSetCustomPronoun(id: number, forms: KDCustomPronounData) {
	if (!KDGameData.CustomPronouns) KDGameData.CustomPronouns = {};
	KDGameData.CustomPronouns[KDCustomPronounKey(id)] = forms;
}

function KDDeleteCustomPronoun(id: number | string) {
	if (KDGameData.CustomPronouns) delete KDGameData.CustomPronouns["Custom" + id];
}

function KDGetCustomPronounForm(pronoun: string, type: string, lowercase: boolean, data: KDGameDataBase = KDGameData): string {
	let field = KDCustomPronounFields.find((f) => f.type == type)?.field;
	let form = field ? KDGetCustomPronounData(pronoun, data)?.[field] : undefined;

    // default to They
	if (!form) return TextGet("KDPro_They" + type + (lowercase ? "LC" : ""));

	return (lowercase
        ? form.charAt(0).toLocaleLowerCase()
        : form.charAt(0).toLocaleUpperCase())
            + form.substring(1);
}

/** wraps the standard pronoun get */
function KDGetPronounText(pronoun: string, type: string, lowercase: boolean): string {
	if (KDGetCustomPronounData(pronoun))
        return KDGetCustomPronounForm(pronoun, type, lowercase);
	return TextGet("KDPro_" + pronoun + type + (lowercase ? "LC" : ""));
}

/** "She/Her" 
 * optional argument so we can get pronoun from within a save in the load screen
*/
function KDGetPronounLabel(pronoun: string, data: KDGameDataBase = KDGameData): string {
	if (KDGetCustomPronounData(pronoun, data)) {
		return TextGet("KDPronoun_CustomForms")
			.replace("PRO1", KDGetCustomPronounForm(pronoun, "", false, data))
			.replace("PRO2", KDGetCustomPronounForm(pronoun, "Obj", false, data));
	}
	return TextGet("KDPronoun_" + (pronoun || ""));
}

/** She, They, Custom5, etc that applies to entity */
function KDGetPronounKey(player: entity, override?: string): string {
	if (player?.player) return override || KDGameData.PlayerPronoun || "She";
	if (!player) return "She";
	return override || (KDIsNPCPersistent(player.id) ? KDGetPersistentNPC(player.id).entity?.CustomPronoun : player.CustomPronoun) || "She";
}

/** restore after KDGameData gets reset */
function KDRestorePlayerPronoun() {
	KDGameData.PlayerPronoun = localStorage.getItem('KDLastPronoun') || "She";
	let custom = localStorage.getItem('KDPlayerCustomPronoun');
	if (custom) {
		KDSetCustomPronoun(-1, JSON.parse(custom));
	}
}