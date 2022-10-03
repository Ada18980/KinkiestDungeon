"use strict";

/**
 * DynamicDraw.js
 * --------------
 * This file contains common utilities for dynamically drawing text onto assets.
 *
 * An options hash that can be used to customize dynamically drawn text. No options need be specified, and some options are only applicable
 * to certain drawing functions.
 * @typedef DynamicDrawOptions
 * @type {object}
 * @property {number} [fontSize] - The target font size. Note that if space is constrained, the actual drawn font size will be reduced
 * automatically to fit. Defaults to 30px.
 * @property {string} [fontFamily] - The desired font family to draw text in. This can be a single font name, or a full CSS font stack
 * (e.g. "'Helvetica', 'Arial', sans-serif"). Defaults to the player's chosen global font.
 * @property {CanvasTextAlign} [textAlign] - The text alignment to use. Can be any valid
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-align text alignment}. Not applicable to the {@link DynamicDrawTextArc}
 * function. Defaults to "center".
 * @property {CanvasTextBaseline} [textBaseline] - The text baseline to use. Can be any valid
 * {@link https://developer.mozilla.org/en-us/docs/Web/CSS/vertical-align vertical alignment}. Defaults to "middle".
 * @property {string} [color] - The color that the text should be drawn in. Can be any valid CSS color string. Defaults to "#000".
 * @property {DynamicDrawTextEffect} [effect] - A dynamic text effect to apply. No effects are applied by default.
 * @property {number} [width] - The maximum width of the drawn text. Not applicable to the {@link DynamicDrawTextFromTo} function, as
 * constraints are defined by the endpoints. When defined for the {@link DynamicDrawTextArc} function, it defines the maximum width of the
 * text perpendicular to the radius line on which the text is centered. Unlimited by default.
 * @property {boolean} [contain] - Whether or not the text should be fully contained in the box defined by the from/to coordinates. Only
 * applicable to the {@link DynamicDrawTextFromTo} function. Defaults to true.
 * @property {number} [angle] - The angle at which the text should be drawn, relative to the center of the circle. Angles are measured
 * clockwise in radians starting at the vertical 12 o'clock position. For example 0 corresponds to 12 o'clock, PI/2 corresponds to
 * 3 o'clock, PI corresponds to 6 o'clock, and 3PI/2 corresponds to 9 o'clock. Only applicable to the {@link DynamicDrawTextArc} function.
 * Defaults to 0.
 * @property {number} [radius] - The radius in pixels of the circle whose arc the text should be drawn along. A smaller radius will result
 * in a greater text curvature and vice versa. Only applicable to the {@link DynamicDrawTextArc} function. Defaults to 450px.
 * @property {number} [maxAngle] - The maximum angle that the text should be drawn along. This effectively determines the maximum length of
 * the arc along which the text will be drawn. Only applicable to the {@link DynamicDrawTextArc} function. Defaults to PI (a semicircle).
 * @property {DynamicDrawTextDirection} [direction] - The direction the text should be drawn in along the circular arc. Only applicable to
 * the {@link DynamicDrawTextArc} function. Defaults to {@link DynamicDrawTextDirection.CLOCKWISE};
 * @property {DynamicDrawTextCurve} [textCurve] - The direction of the curve of the text. This determines whether the center of the text
 * curves upwards ({@link DynamicDrawTextCurve.SMILEY}) or downwards ({@link DynamicDrawTextCurve.FROWNY}). Only applicable to the
 * {@link DynamicDrawTextArc} function. Defaults to {@link DynamicDrawTextCurve.FROWNY}.
 *
 * A drawing callback, used to add drawing effects to dynamic text.
 * @callback DynamicDrawTextEffectFunction
 * @param {string} text - The text to draw
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
 * @param {number} x - The x coordinate at which the text should be drawn
 * @param {number} y - The y coordinate at which the text should be drawn
 * @param {DynamicDrawOptions} [options] - Additional drawing options
 *
 * A definition object that wraps the drawing functions that define a dynamic text effect
 * @typedef DynamicDrawTextEffectDefinition
 * @type {object}
 * @property {DynamicDrawTextEffectFunction} [before] - A drawing callback that is called before the dynamic text is drawn
 * @property {DynamicDrawTextEffectFunction} [after] - A drawing callback that is called after the dynamic text is drawn
 *
 * @see {@link DynamicDrawText} - for drawing basic horizontal text.
 * @see {@link DynamicDrawTextFromTo} - for drawing text in a straight line between any given two coordinates.
 * @see {@link DynamicDrawTextArc} - for drawing text in a circular arc.
 */

/**
 * A common regex that can be used to check whether a given string is permitted for dynamic drawing (the character limitations are primarily
 * to restrict the use of control characters and unicode characters that would cause odd behavior).
 * @type {RegExp}
 */
const DynamicDrawTextRegex = /^(?:\w|[ ~!$#%*+])*$/;

/**
 * A regex pattern that can be attached to HTML input elements to check for validity - matches the DynamicDrawTextRegex
 * @type {string}
 */
const DynamicDrawTextInputPattern = "(?:\\w|[ ~!$#%*+])*";

/**
 * An array of valid printable characters that are permitted for dynamic drawing (used internally for text measurement purposes)
 * @type {string[]}
 */
const DynamicDrawValidTextCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_- ~!$#%*+".split("");

/**
 * A padding multiplier for text when drawn in an arc. The extra padding helps ensure that the bottoms of characters don't collide
 * @type {number}
 */
const DynamicDrawTextArcPaddingRatio = 1.15;

/**
 * Cache for font measurements. These are used to make text which is drawn in an arc look more natural by respecting the widths of
 * characters in various fonts.
 * @type {Record.<string, {
 *     width: number,
 *     weights: Record.<string, number>
 * }>}
 */
const DynamicDrawFontMeasurements = {};

/**
 * An enum encapsulating the directions that circular text can be drawn in (clockwise and anticlockwise)
 * @enum {number}
 */
const DynamicDrawTextDirection = {
	CLOCKWISE: 1,
	ANTICLOCKWISE: -1,
};

/**
 * An enum encapsulating the possible curve directions of circular text. Can be "SMILEY" (bottom of text on the outer arc) or "FROWNY"
 * (bottom of text on the inner arc).
 * @enum {number}
 */
const DynamicDrawTextCurve = {
	SMILEY: -1,
	FROWNY: 1,
};

/**
 * An enum encapsulating the available drawing effects that can be applied to dynamic text.
 * @enum {string}
 */
const DynamicDrawTextEffect = {
	BURN: "burn",
};

/**
 * The default options that are used for dynamic text drawing.
 * @type {DynamicDrawOptions}
 */
const DynamicDrawTextDefaultOptions = {
	fontSize: 30,
	fontFamily: CommonGetFontName(),
	textAlign: "center",
	textBaseline: "middle",
	color: "#000",
	effect: undefined,
	width: undefined,
	contain: true,
	angle: 0,
	radius: 450,
	maxAngle: Math.PI,
	direction: DynamicDrawTextDirection.CLOCKWISE,
	textCurve: DynamicDrawTextCurve.FROWNY,
};

/**
 * Dynamic text effect definitions. The definitions define the drawing effects that can be applied to dynamically drawn text.
 * @type {Record.<DynamicDrawTextEffect, DynamicDrawTextEffectDefinition>}
 */
const DynamicDrawTextEffects = {
	[DynamicDrawTextEffect.BURN]: {
		before(text, ctx, x, y, { width }) {
			ctx.save();
			ctx.fillStyle = "#000";
			ctx.fillText(text, x - 1, y - 1, width);
			ctx.restore();
		},
	},
};

/**
 * Pre-loads a font family and calculates font measurements for the family. This should generally be called in an item's load function so
 * that font data is loaded in preparation for dynamic font drawing. This will also be called at draw-time, but if the font is already
 * pre-loaded, this function will do nothing.
 * @param {string} fontFamily - the font family to load. Can be a single font name or a full CSS font stack
 * (e.g. "'Helvetica', 'Arial', sans-serif")
 * @returns {void} - Nothing
 */
function DynamicDrawLoadFont(fontFamily) {
	// If we've already measured the font, do nothing
	if (DynamicDrawFontMeasurements[fontFamily]) return;

	const canvas = document.createElement("canvas");
	canvas.width = 20;
	canvas.height = 20;
	const ctx = canvas.getContext("2d");

	// Dummy text fill to force the browser to load the font (otherwise it won't get loaded until after the first time
	// the text has been populated, causing the first draw to fallback)
	ctx.font = `1px ${fontFamily}`;
	ctx.fillText("", 0, 0);

	// Measure each of the valid characters in the given font and record the maximum width
	let maxWidth = 0;
	const measurements = DynamicDrawValidTextCharacters.map(char => {
		const width = ctx.measureText(char).width;
		if (width > maxWidth) maxWidth = width;
		return width;
	});

	// Capture the maximum character width for the font, and set up a relative map for character weights
	const weightMap = DynamicDrawFontMeasurements[fontFamily] = {
		width: maxWidth,
		weights: {},
	};

	// Normalise the width of each character as a weight relative to the max width
	DynamicDrawValidTextCharacters.forEach((char, i) => {
		weightMap.weights[char] = measurements[i] / maxWidth;
	});
}

/**
 * Draws the given text to the provided canvas rendering context at the given positions. Text is drawn horizontally, respecting the
 * configuration in the provided options (if any).
 * @param {string} text - The text to draw
 * @param {CanvasRenderingContext2D} ctx - The rendering context to draw the text to
 * @param {number} x - The x coordinate at which to draw the text
 * @param {number} y - The y coordinate at which to draw the text
 * @param {DynamicDrawOptions} options - Additional drawing options
 * @returns {void} - Nothing
 */
function DynamicDrawText(text, ctx, x, y, options) {
	options = DynamicDrawParseOptions(options);
	DynamicDrawTextAndEffects(text, ctx, x, y, options);
}

/**
 * Draws the given text in a straight line between the two provided coordinates. If the contain option is specified, the text will be fully
 * contained in the rectangle defined by the from and to positions.
 * @param {string} text - The text to draw
 * @param {CanvasRenderingContext2D} ctx - The rendering context to draw the text to
 * @param {number[]} from - The [x, y] coordinates to start drawing the text at
 * @param {number[]} to - The [x, y] coordinates to end drawing the text at
 * @param {DynamicDrawOptions} options - Additional drawing options
 * @returns {void} - Nothing
 */
function DynamicDrawTextFromTo(text, ctx, from, to, options) {
	const { fontSize, contain } = options = DynamicDrawParseOptions(options);

	// From coordinate (x0, y0)
	const x0 = from[0];
	const y0 = from[1];
	// To coordinate (x1, y1)
	const x1 = to[0];
	const y1 = to[1];
	// Calculate x & y deltas
	const dx = x1 - x0;
	const dy = y1 - y0;
	// Diagonal distance
	options.width = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
	if (contain && dx !== 0) {
		// If the text should be fully contained withing the [x0, y0], [x1, y1] box, subtract appropriately
		options.width -= 2 * Math.abs(dy / dx) * (fontSize / 2);
	}
	// Center point (cx, cy)
	const cx = x0 + 0.5 * dx;
	const cy = y0 + 0.5 * dy;

	// Calculate the angle of the text
	let angle;
	if (dx === 0) {
		// If dx is 0, the text is vertical
		angle = dy > 0 ? Math.PI / 2 : -Math.PI / 2;
	} else {
		angle = Math.atan(dy / dx);
	}
	// If dx < 0, then we need to rotate 180 degrees to respect directionality
	if (dx < 0) angle += Math.PI;

	// Save the canvas state and rotate by the calculated angle about the center point
	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(angle);
	ctx.translate(-cx, -cy);
	// Draw the text and any dynamic text effects
	DynamicDrawTextAndEffects(text, ctx, cx, cy, options);
	// Restore the canvas rotation
	ctx.restore();
}

/**
 * Draws the given text in a circular arc at the given [x, y] coordinate. The text will be drawn so that the center of the text is
 * positioned on the given coordinates.
 * @see {@link DynamicDrawOptions}
 * @param {string} text - The text to draw
 * @param {CanvasRenderingContext2D} ctx - The rendering context to draw the text to
 * @param {number} x - The x coordinate at which to center the text
 * @param {number} y - The y coordinate at which to center the text
 * @param {DynamicDrawOptions} options - Additional drawing options. These can be used to specify the radius of the circle (determining how
 * curved the text appears), as well as the direction along the circle that the text is drawn in (by default, text is drawn clockwise).
 * @returns {void} - Nothing
 */
function DynamicDrawTextArc(text, ctx, x, y, options) {
	let { fontFamily, angle, radius, width, maxAngle, fontSize, direction, textCurve } = options = DynamicDrawParseOptions(options);

	// Load the font measurements if they haven't already been populated
	DynamicDrawLoadFont(fontFamily);

	// Calculate the circle's center based on the desired text position and the angle
	const cx = x - radius * Math.sin(angle);
	const cy = y - radius * Math.cos(angle);

	// Retrieve the character weight map for the font
	const weightMap = DynamicDrawFontMeasurements[fontFamily] || {
		width: 1,
		weights: {},
	};

	// Calculate the total weight of the desired text
	let totalWeight = 0;
	for (let i = 0; i < text.length; i++) {
		totalWeight += weightMap.weights[text[i]] || 1;
	}

	if (width == null || width > 2 * radius + fontSize) {
		width = 2 * radius + fontSize;
	}
	// Check whether the maximum angle should be constrained by the maximum width
	const angleConstraint = 2 * Math.asin(width / (fontSize + 2 * radius));
	maxAngle = Math.min(maxAngle, angleConstraint);

	// Check whether the font size should be constrained by the maximum angle
	const baseWidth = weightMap.width * totalWeight * DynamicDrawTextArcPaddingRatio;
	const fontSizeConstraint = (2 * maxAngle * radius) / (2 * baseWidth + maxAngle);
	options.fontSize = Math.min(fontSize, fontSizeConstraint);

	// Based on the computed font size, calculate the actual angle that the text will occupy (may be less than the max
	// angle)
	const actualAngle = options.fontSize * baseWidth / radius;

	// Apply drawing options
	DynamicDrawApplyOptions(ctx, options);

	// Prepare the canvas by translating to the intended drawing position, then translating over to the center of the
	// circle. Then rotate the canvas around to the angle where the text should be draw, and rotate back again half the
	// angle occupied by the text
	ctx.save();
	ctx.translate(x, y);
	ctx.translate(x - cx, y - cy);
	ctx.rotate(-angle);
	ctx.rotate(-1 * direction * actualAngle / 2);

	// Draw each character in turn, rotating a little before and after each character to space them out evenly
	for (let n = 0; n < text.length; n++) {
		const char = text[n];
		const rotationAngle = direction * 0.5 * actualAngle * (weightMap.weights[char] || 1) / totalWeight;
		ctx.rotate(rotationAngle);
		ctx.save();
		ctx.translate(0, -radius);
		ctx.transform(direction, 0, 0, textCurve, 0, 0);
		DynamicDrawTextAndEffects(char, ctx, 0, 0, options);
		ctx.restore();
		ctx.rotate(rotationAngle);
	}

	// Restore the canvas back to its original position and orientation
	ctx.restore();
}

/**
 * Internal utility function for drawing text and applying text effects.
 * @param {string} text - The text to draw
 * @param {CanvasRenderingContext2D} ctx - The rendering context to draw the text to
 * @param {number} x - The x coordinate at which to draw the text
 * @param {number} y - The y coordinate at which to draw the text
 * @param {DynamicDrawOptions} options - Additional drawing options
 * @returns {void} - Nothing
 */
function DynamicDrawTextAndEffects(text, ctx, x, y, options) {
	DynamicDrawApplyOptions(ctx, options);
	const effect = DynamicDrawTextEffects[options.effect] || {};
	if (typeof effect.before === "function") effect.before(text, ctx, x, y, options);
	ctx.fillText(text, x, y, options.width);
	if (typeof effect.after === "function") effect.after(text, ctx, x, y, options);
}

/**
 * Parses a dynamic drawing options object, returning default values for properties that aren't defined.
 * @param {DynamicDrawOptions} [options] - The options object to parse
 * @returns {DynamicDrawOptions} - A complete options object, with default values where not specified
 */
function DynamicDrawParseOptions(options) {
	options = options || {};
	const parsedOptions = Object.assign({}, DynamicDrawTextDefaultOptions, options);
	return parsedOptions;
}

/**
 * Applies a set of dynamic drawing options to a canvas rendering context. This sets the canvas up with the relevant font size, color, etc.
 * ready for drawing text
 * @param {CanvasRenderingContext2D} ctx - The rendering context to draw the text to
 * @param {DynamicDrawOptions} options - The drawing options to apply
 * @returns {void} - Nothing
 */
function DynamicDrawApplyOptions(ctx, { fontSize, fontFamily, textAlign, textBaseline, color }) {
	ctx.font = `${fontSize}px ${fontFamily}`;
	ctx.textAlign = textAlign;
	ctx.textBaseline = textBaseline;
	ctx.fillStyle = color;
}
