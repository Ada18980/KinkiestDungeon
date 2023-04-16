// This should be true only for standalone
const StandalonePatched = true;

function AssetGet(arg1, arg2, arg3) {
	return undefined;
}
const ServerURL: string = "";
const ArcadeDeviousChallenge = false;
const ChatRoomCharacter: Character[] = [];
const ChatRoomChatLog: {Garbled: string, Time: number, SenderName: string}[] = [];
const DialogGamingPreviousRoom: string = "";
const MiniGameReturnFunction: string = "ArcadeKinkyDungeonEnd";

/**
 * Returns the expressions of character C as a single big object
 * @param C - The character whose expressions should be returned
 * @returns Expression - The expresssion of a character
 */
function WardrobeGetExpression(C: Character): any {
	let characterExpression = {};
	ServerAppearanceBundle(C.Appearance).filter(item => item.Property != null && item.Property.Expression != null).forEach(item => characterExpression[item.Group] = item.Property.Expression);
	return characterExpression;
}

/**
 * Prepares an appearance bundle so we can push it to the server. It minimizes it by keeping only the necessary
 * information. (Asset name, group name, color, properties and difficulty)
 * @param Appearance - The appearance array to bundle
 * @returns The appearance bundle created from the given appearance array
 */
function ServerAppearanceBundle(Appearance: Item[]): AppearanceBundle {
	let Bundle: AppearanceBundle = [];
	for (let A = 0; A < Appearance.length; A++) {
		let N: any = {};
		N.Group = Appearance[A].Asset.Group.Name;
		N.Name = Appearance[A].Asset.Name;
		if ((Appearance[A].Color != null) && (Appearance[A].Color != "Default")) N.Color = Appearance[A].Color;
		if ((Appearance[A].Difficulty != null) && (Appearance[A].Difficulty != 0)) N.Difficulty = Appearance[A].Difficulty;
		if (Appearance[A].Property != null) N.Property = Appearance[A].Property;
		Bundle.push(N);
	}
	return Bundle;
}

function AssetGet(family: string, group: string, asset: string): Asset | undefined { return undefined; };

/**
 * Returns a specific reputation value for the player
 * @param RepType - Type/name of the reputation to get the value of.
 * @returns Returns the value of the reputation. It can range from 100 to -100, and it defaults to 0 if the player never earned this type of reputation before.
 */
function ReputationGet(RepType: string): number { return 0; }
function DialogSetReputation(a: string, b: number): void {}

let ChatRoomCharacterUpdate = (C: Character): void => {}
function ChatRoomPublishCustomAction(msg: string, LeaveDialog: boolean, Dictionary: any): void {}

const TypedItemDataLookup: {[_: string]: any} = {};
const ModularItemDataLookup: {[_: string]: any} = {};

function TypedItemSetOption(C, item, options, option, push = false) {}
function TypedItemSetOptionByName(a, b, c, d) {}

function ModularItemMergeModuleValues({ asset, modules }, moduleValues): ItemProperties { return undefined; }

function ExtendedItemSetType(C, Options, Option) {}
function ExtendedItemExit() {}

let MiniGameVictory = true;

function InventoryRemove(C, AssetGroup, Refresh = false) {}
function InventoryGetLock(Lock): any {}
function InventoryAllow(C, asset, prerequisites = asset.Prerequisite, setDialog = true) { return true; }
function InventoryWear(C, AssetName, AssetGroup, ItemColor, Difficulty, MemberNumber, Craft, Refresh=true) {}
function InventoryLock(C, Item, Lock, MemberNumber, Update = true) {}
function InventoryUnlock(C, Item) {}

let KDPatched = true;
let ServerURL = "http://localhost:4288";
function ServerSend(Message, Data) {}
function ServerPlayerIsInChatRoom() { return false; }

function CharacterAppearanceLoadCharacter(C: Character): void {}
function CharacterChangeMoney(C: Character, amount: number): void {}

function DrawImage(Image: string, X: number, Y: number, Invert: boolean = false): boolean { return true; }

// These two are declared with `let` as they are explicitly and intentionally assignable, for performance optimization in BC
let CharacterAppearanceBuildCanvas = (C: Character): void => {}
let CharacterRefresh = (C: Character, push: boolean = false): void => {}

function suppressCanvasUpdate<T>(f: () => T): T {
	return f();
}
