"use strict";
let ServerURL = "http://localhost:4288";

/**
 * Returns whether the player is currently in a chatroom or viewing a subscreen while in a chatroom
 * @returns {boolean} - True if in a chatroom
 */
function ServerPlayerIsInChatRoom() {
	return false;
}

/** Sends a message with the given data to the server via socket.emit */
function ServerSend(Message, Data) {
}

/**
 * Prepares an appearance bundle so we can push it to the server. It minimizes it by keeping only the necessary
 * information. (Asset name, group name, color, properties and difficulty)
 * @param {Item[]} Appearance - The appearance array to bundle
 * @returns {AppearanceBundle} - The appearance bundle created from the given appearance array
 */
function ServerAppearanceBundle(Appearance) {
	let Bundle = [];
	for (let A = 0; A < Appearance.length; A++) {
		let N = {};
		N.Group = Appearance[A].Asset.Group.Name;
		N.Name = Appearance[A].Asset.Name;
		if ((Appearance[A].Color != null) && (Appearance[A].Color != "Default")) N.Color = Appearance[A].Color;
		if ((Appearance[A].Difficulty != null) && (Appearance[A].Difficulty != 0)) N.Difficulty = Appearance[A].Difficulty;
		if (Appearance[A].Property != null) N.Property = Appearance[A].Property;
		Bundle.push(N);
	}
	return Bundle;
}