// This should be true only for standalone
const StandalonePatched = true;

const ArcadeDeviousChallenge = false;
const ChatRoomCharacter: Character[] = [];
const ChatRoomChatLog: {Garbled: string, Time: number, SenderName: string}[] = [];
const DialogGamingPreviousRoom: string = "";
const MiniGameReturnFunction: string = "ArcadeKinkyDungeonEnd";




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

function TypedItemSetOption(C: PlayerCharacter, item: Item, options: any, option: any, push = false) {}
function TypedItemSetOptionByName(a: Character, b: Item, c: string, d: boolean) {}

function ExtendedItemSetType(C: any, Options: any, Option: any) {}
function ExtendedItemExit() {}

let MiniGameVictory = true;

function InventoryRemove(C: Character, AssetGroup: string, Refresh = false) {}
function InventoryGetLock(Lock: Item): any {}
function InventoryWear(C: Character, AssetName: any, AssetGroup: any, ItemColor?: any, Difficulty?: undefined, MemberNumber?: undefined, Craft?: undefined, Refresh=true) {}
function InventoryLock(C: Character, Item: Item, Lock: string, MemberNumber: number, Update = true) {}
function InventoryUnlock(C: Character, Item: string) {}

let KDPatched = true;
let ServerURL = "http://localhost:4288";
function ServerSend(Message: string, Data: any) {}
function ServerPlayerIsInChatRoom() { return false; }

function CharacterAppearanceLoadCharacter(C: Character): void {}
function CharacterChangeMoney(C: Character, amount: number): void {}

function DrawImage(Image: string, X: number, Y: number, Invert: boolean = false): boolean { return true; }

// These two are declared with `let` as they are explicitly and intentionally assignable, for performance optimization in BC
let CharacterAppearanceBuildCanvas = (C: Character): void => {}
let CharacterRefresh = (C: Character, push: boolean = false): void => {}
