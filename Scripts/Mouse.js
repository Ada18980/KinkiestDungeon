"use strict";
var MouseX = 0;
var MouseY = 0;

/**
 * Check if the mouse position is within the boundaries of a given zone (Useful for UI components)
 * @param {number} Left - Starting position on the X axis
 * @param {number} Top - Starting position on the Y axis
 * @param {number} Width - Width of the zone
 * @param {number} Height - Height of the zone
 * @returns {boolean} - Returns TRUE if the click occurred in the given zone
 */
function MouseIn(Left, Top, Width, Height) {
	return MouseXIn(Left, Width) && MouseYIn(Top, Height);
}

/**
 * Check if the mouse position is within the boundaries of a given zone along the X axis
 * @param {number} Left - Starting position on the X axis
 * @param {number} Width - Width of the zone
 * @returns {boolean} - Returns TRUE if the click occurred in the given zone
 */
function MouseXIn(Left, Width) {
	return (MouseX >= Left) && (MouseX <= Left + Width);
}

/**
 * Check if the mouse position is within the boundaries of a given zone along the Y axis
 * @param {number} Top - Starting position on the Y axis
 * @param {number} Height - Height of the zone
 * @returns {boolean} - Returns TRUE if the click occurred in the given zone
 */
function MouseYIn(Top, Height) {
	return (MouseY >= Top) && (MouseY <= Top + Height);
}

/**
 * A common check for whether the specified position is being hovered over
 * @param {number} Left - Starting position on the X axis
 * @param {number} Top - Starting position on the Y axis
 * @param {number} Width - Width of the zone
 * @param {number} Height - Height of the zone
 * @returns {boolean} - Returns TRUE if the mouse is currently hovering over the specified zone
 */
function MouseHovering(Left, Top, Width, Height) {
	return MouseIn(Left, Top, Width, Height) && !CommonIsMobile;
}
