let MouseX: number = 0;
let MouseY: number = 0;

/**
 * Check if the mouse position is within the boundaries of a given zone (Useful for UI components)
 * @param Left - Starting position on the X axis
 * @param Top - Starting position on the Y axis
 * @param Width - Width of the zone
 * @param Height - Height of the zone
 * @returns Returns TRUE if the click occurred in the given zone
 */
function MouseIn(Left: number, Top: number, Width: number, Height: number): boolean {
	return MouseXIn(Left, Width) && MouseYIn(Top, Height);
}

/**
 * Check if the mouse position is within the boundaries of a given zone along the X axis
 * @param Left - Starting position on the X axis
 * @param Width - Width of the zone
 * @returns Returns TRUE if the click occurred in the given zone
 */
function MouseXIn(Left: number, Width: number): boolean {
	return (MouseX >= Left) && (MouseX <= Left + Width);
}

/**
 * Check if the mouse position is within the boundaries of a given zone along the Y axis
 * @param Top - Starting position on the Y axis
 * @param Height - Height of the zone
 * @returns Returns TRUE if the click occurred in the given zone
 */
function MouseYIn(Top: number, Height: number): boolean {
	return (MouseY >= Top) && (MouseY <= Top + Height);
}

/**
 * A common check for whether the specified position is being hovered over
 * @param Left - Starting position on the X axis
 * @param Top - Starting position on the Y axis
 * @param Width - Width of the zone
 * @param Height - Height of the zone
 * @returns Returns TRUE if the mouse is currently hovering over the specified zone
 */
function MouseHovering(Left: number, Top: number, Width: number, Height: number): boolean {
	return MouseIn(Left, Top, Width, Height) && !CommonIsMobile;
}
