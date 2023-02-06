"use strict";
/**
 * The main game canvas where everything will be drawn
 * @type {CanvasRenderingContext2D}
 */
let MainCanvas;
/** @type {CanvasRenderingContext2D} */
let TempCanvas;
/** @type {CanvasRenderingContext2D} */
let ColorCanvas;
/** @type {CanvasRenderingContext2D} */
let CharacterCanvas;
var DialogLeaveDueToItem = false;

var BlindFlash = false;
var DrawingBlindFlashTimer = 0;

// A bank of all the chached images
/** @type {Map<string, HTMLImageElement>} */
const DrawCacheImage = new Map;
let DrawCacheLoadedImages = 0;
let DrawCacheTotalImages = 0;

// Last dark factor for blindflash
var DrawLastDarkFactor = 0;

/**
 * A list of the characters that are drawn every frame
 * @type {Character[]}
 */
var DrawLastCharacters = [];

/**
 * A list of elements to draw at the end of the drawing process.
 * Mostly used for hovering button labels.
 * @type {Function[]}
 */
var DrawHoverElements = [];

/**
 * The last canvas position in format `[left, top, width, height]`
 */
var DrawCanvasPosition = [0, 0, 0, 0];

/**
 * Converts a hex color string to a RGB color
 * @param {string} color - Hex color to conver
 * @returns {RGBColor} - RGB color
 */
function DrawHexToRGB(color) {
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	color = color.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : {
		r: 0,
		g: 0,
		b: 0
	};
}

/**
 * Converts a RGB color to a hex color string
 * @param {number[]} color - RGB color to conver
 * @returns {string} - Hex color string
 */
function DrawRGBToHex(color) {
	const rgb = color[2] | (color[1] << 8) | (color[0] << 16);
	return '#' + (0x1000000 + rgb).toString(16).slice(1).toUpperCase();
}

/**
 * Loads the canvas to draw on with its style and event listeners.
 * @returns {void} - Nothing
 */
function DrawLoad() {

	// Creates the objects used in the game
	MainCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("MainCanvas")).getContext("2d");
	document.getElementById("MainCanvas").addEventListener("keypress", KeyDown);
	document.getElementById("MainCanvas").tabIndex = 1000;

	// Font is fixed for now, color can be set
	MainCanvas.font = CommonGetFont(36);
	MainCanvas.textAlign = "center";
	MainCanvas.textBaseline = "middle";

}

/**
 * Returns the image file from cache or build it from the source
 * @param {string} Source - URL of the image
 * @returns {HTMLImageElement} - Image file
 */
function DrawGetImage(Source) {
	// Search in the cache to find the image and make sure this image is valid
	let Img = DrawCacheImage.get(Source);
	if (!Img) {
		Img = new Image;
		DrawCacheImage.set(Source, Img);
		// Keep track of image load state
		const IsAsset = (Source.indexOf("Assets") >= 0);
		if (IsAsset) {
			++DrawCacheTotalImages;
			Img.addEventListener("load", function () {
				DrawGetImageOnLoad();
			});
		}

		Img.addEventListener("error", function () {
			DrawGetImageOnError(Img, IsAsset);
		});

		// Start loading
		Img.src = KDModFiles[Source] || Source;
	}

	// returns the final image
	return Img;
}

/**
 * Reloads all character canvas once all images are loaded
 * @returns {void} - Nothing
 */
function DrawGetImageOnLoad() {
	++DrawCacheLoadedImages;
	if (DrawCacheLoadedImages == DrawCacheTotalImages) CharacterLoadCanvasAll();
}

/**
 * Attempts to redownload an image if it previously failed to load
 * @param {HTMLImageElement & { errorcount?: number }} Img - Image tag that failed to load
 * @param {boolean} IsAsset - Whether or not the image is part of an asset
 * @returns {void} - Nothing
 */
function DrawGetImageOnError(Img, IsAsset) {
	if (Img.errorcount == null) Img.errorcount = 0;
	Img.errorcount += 1;
	if (Img.errorcount < 3) {
		// eslint-disable-next-line no-self-assign
		Img.src = Img.src;
	} else {
		// Load failed. Display the error in the console and mark it as done.
		console.log("Error loading image " + Img.src);
		if (IsAsset) DrawGetImageOnLoad();
	}
}



/**
 * Draws a zoomed image from a source to a specific canvas
 * @param {string} Source - URL of the image
 * @param {CanvasRenderingContext2D} Canvas - Canvas on which to draw the image
 * @param {number} SX - The X coordinate where to start clipping
 * @param {number} SY - The Y coordinate where to start clipping
 * @param {number} SWidth - The width of the clipped image
 * @param {number} SHeight - The height of the clipped image
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {number} Width - Width of the image
 * @param {number} Height - Height of the image
 * @param {boolean} [Invert] - Flips the image vertically
 * @returns {boolean} - whether the image was complete or not
 */
function DrawImageZoomCanvas(Source, Canvas, SX, SY, SWidth, SHeight, X, Y, Width, Height, Invert) {
	return DrawImageEx(Source, X, Y, {
		Canvas,
		SourcePos: [SX, SY, SWidth, SHeight],
		Width,
		Height,
		Invert
	});
}

/**
 * Draws a resized image from a source to the main canvas
 * @param {string} Source - URL of the image
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {number} Width - Width of the image after being resized
 * @param {number} Height - Height of the image after being resized
 * @returns {boolean} - whether the image was complete or not
 */
function DrawImageResize(Source, X, Y, Width, Height) {
	return DrawImageEx(Source, X, Y, { Width, Height });
}

/**
 * Draws a zoomed image from a source to a specific canvas
 * @param {string} Source - URL of the image
 * @param {CanvasRenderingContext2D} Canvas - Canvas on which to draw the image
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {RectTuple[]} [AlphaMasks] - A list of alpha masks to apply to the asset
 * @param {number} [Opacity=1] - The opacity at which to draw the image
 * @param {boolean} [Rotate=false] - If the image should be rotated by 180 degrees
 * @returns {boolean} - whether the image was complete or not
 */
function DrawImageCanvas(Source, Canvas, X, Y, AlphaMasks, Opacity, Rotate) {
	const Img = DrawGetImage(Source);
	if (!Img.complete) return false;
	if (!Img.naturalWidth) return true;
	/** @type {CanvasImageSource} */
	let SourceImage = Img;
	if ((AlphaMasks && AlphaMasks.length) || Rotate) {
		TempCanvas.canvas.width = Img.width;
		TempCanvas.canvas.height = Img.height;
		if (Rotate) {
			TempCanvas.rotate(Math.PI);
			TempCanvas.translate(-TempCanvas.canvas.width, -TempCanvas.canvas.height);
			X = 500 - (X + TempCanvas.canvas.width);
			Y -= TempCanvas.canvas.height;
		}
		TempCanvas.drawImage(Img, 0, 0);
		if (AlphaMasks && AlphaMasks.length) {
			AlphaMasks.forEach(([x, y, w, h]) => TempCanvas.clearRect(x - X, y - Y, w, h));
		}
		SourceImage = TempCanvas.canvas;
	}
	Opacity = typeof Opacity === "number" ? Opacity : 1;
	Canvas.save();
	Canvas.globalAlpha = Opacity;
	Canvas.drawImage(SourceImage, X, Y);
	Canvas.restore();
	return true;
}


/**
 * Draws a canvas to a specific canvas
 * @param {HTMLImageElement | HTMLCanvasElement} Img - Canvas to draw
 * @param {CanvasRenderingContext2D} Canvas - Canvas on which to draw the image
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {RectTuple[]} AlphaMasks - A list of alpha masks to apply to the asset
 * @returns {boolean} - whether the image was complete or not
 */
function DrawCanvas(Img, Canvas, X, Y, AlphaMasks) {
	if (AlphaMasks && AlphaMasks.length) {
		TempCanvas.canvas.width = Img.width;
		TempCanvas.canvas.height = Img.height;
		TempCanvas.drawImage(Img, 0, 0);
		AlphaMasks.forEach(([x, y, w, h]) => TempCanvas.clearRect(x - X, y - Y, w, h));
		Canvas.drawImage(TempCanvas.canvas, X, Y);
	} else {
		Canvas.drawImage(Img, X, Y);
	}
	return true;
}

/**
 * Draws a specific canvas with a zoom on the main canvas
 * @param {HTMLImageElement | HTMLCanvasElement} Canvas - Canvas to draw on the main canvas
 * @param {number} X - Position of the canvas on the X axis
 * @param {number} Y - Position of the canvas on the Y axis
 * @param {number} Zoom - Zoom factor
 * @returns {boolean} - whether the image was complete or not
 */
function DrawCanvasZoom(Canvas, X, Y, Zoom) {
	return DrawImageEx(Canvas, X, Y, { Zoom });
}

/**
 * Draws a zoomed image from a source to the canvas and mirrors it from left to right
 * @param {string} Source - URL of the image
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {number} Width - Width of the image
 * @param {number} Height - Height of the image
 * @returns {boolean} - whether the image was complete or not
 */
function DrawImageZoomMirror(Source, X, Y, Width, Height) {
	return DrawImageEx(Source, X, Y, {
		Width, Height,
		Mirror: true
	});
}

/**
 * Draws an image from a source on the main canvas
 * @param {string} Source - URL of the image
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {boolean} [Invert] - Flips the image vertically
 * @returns {boolean} - whether the image was complete or not
 */
function DrawImage(Source, X, Y, Invert) {
	return DrawImageEx(Source, X, Y, { Invert });
}

/**
 * Draws an image from a source to the specified canvas
 * @param {string} Source - URL of the image
 * @param {CanvasRenderingContext2D} Canvas - Canvas on which to draw the image
 * @param {number} X - Position of the rectangle on the X axis
 * @param {number} Y - Position of the rectangle on the Y axis
 * @param {number} Zoom - Zoom factor
 * @param {string} HexColor - Color of the image to draw
 * @param {boolean} FullAlpha - Whether or not it is drawn in full alpha mode
 * @param {RectTuple[]} [AlphaMasks] - A list of alpha masks to apply to the asset
 * @param {number} [Opacity=1] - The opacity at which to draw the image
 * @param {boolean} [Rotate=false] - If the image should be rotated by 180 degrees
 * @returns {boolean} - whether the image was complete or not
 */
function DrawImageCanvasColorize(Source, Canvas, X, Y, Zoom, HexColor, FullAlpha, AlphaMasks, Opacity, Rotate) {

	// Make sure that the starting image is loaded
	const Img = DrawGetImage(Source);
	if (!Img.complete) return false;
	if (!Img.naturalWidth) return true;

	// Variable initialization
	const width = Img.width;
	const height = Img.height;

	// Prepares a canvas to draw the colorized image
	ColorCanvas.canvas.width = width;
	ColorCanvas.canvas.height = height;
	ColorCanvas.globalCompositeOperation = "copy";
	ColorCanvas.drawImage(Img, 0, 0);

	const imageData = ColorCanvas.getImageData(0, 0, width, height);
	const data = imageData.data;

	// Get the RGB color used to transform
	const rgbColor = DrawHexToRGB(HexColor);

	// We transform each non transparent pixel based on the RGG value
	if (FullAlpha) {
		for (let p = 0, len = data.length; p < len; p += 4) {
			if (data[p + 3] == 0)
				continue;
			const trans = ((data[p] + data[p + 1] + data[p + 2]) / 383);
			data[p + 0] = rgbColor.r * trans;
			data[p + 1] = rgbColor.g * trans;
			data[p + 2] = rgbColor.b * trans;
		}
	} else {
		for (let p = 0, len = data.length; p < len; p += 4) {
			const trans = ((data[p] + data[p + 1] + data[p + 2]) / 383);
			if ((data[p + 3] == 0) || (trans < 0.8) || (trans > 1.2))
				continue;
			data[p + 0] = rgbColor.r * trans;
			data[p + 1] = rgbColor.g * trans;
			data[p + 2] = rgbColor.b * trans;
		}
	}

	// Replace the source image with the modified canvas
	ColorCanvas.putImageData(imageData, 0, 0);
	if (AlphaMasks && AlphaMasks.length) {
		AlphaMasks.forEach(([x, y, w, h]) => ColorCanvas.clearRect(x - X, y - Y, w, h));
	}

	// Rotate the image 180 degrees
	if (Rotate) {
		ColorCanvas.rotate(Math.PI);
		ColorCanvas.translate(-ColorCanvas.canvas.width, -ColorCanvas.canvas.height);
		X = 500 - (X + ColorCanvas.canvas.width);
		Y -= ColorCanvas.canvas.height;
	}

	Opacity = typeof Opacity === "number" ? Opacity : 1;
	Canvas.save();
	Canvas.globalAlpha = Opacity;
	Canvas.drawImage(ColorCanvas.canvas, 0, 0, Img.width, Img.height, X, Y, Img.width * Zoom, Img.height * Zoom);
	Canvas.restore();

	return true;
}

/**
 * Draws the mirrored version of an image from a source on the canvas
 * @param {string} Source - URL of the image
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @returns {boolean} - whether the image was complete or not
 */
function DrawImageMirror(Source, X, Y) {
	return DrawImageEx(Source, X, Y, { Mirror: true });
}

/**
 * Flips an image vertically
 * @param {HTMLImageElement} Img - The image to be inverted
 * @returns {HTMLCanvasElement} - Canvas with the inverted image
 */
function DrawImageInvert(Img) {
	TempCanvas.canvas.width = Img.width;
	TempCanvas.canvas.height = Img.height;
	TempCanvas.scale(1, -1);
	TempCanvas.translate(0, -Img.height);
	TempCanvas.drawImage(Img, 0, 0);
	return TempCanvas.canvas;
}

/**
 * Draws an image on canvas, applying all options
 * @param {string | HTMLImageElement | HTMLCanvasElement} Source - URL of image or image itself
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {object} options - any extra options, optional
 * @param {CanvasRenderingContext2D} [options.Canvas] - Canvas on which to draw the image, defaults to `MainCanvas`
 * @param {number} [options.Alpha] - transparency between 0-1
 * @param {[number, number, number, number]} [options.SourcePos] - Area in original image to draw in format `[left, top, width, height]`
 * @param {number} [options.Width] - Width of the drawn image, defaults to width of original image
 * @param {number} [options.Height] - Height of the drawn image, defaults to height of original image
 * @param {boolean} [options.Invert=false] - If image should be flipped vertically
 * @param {boolean} [options.Mirror=false] - If image should be flipped horizontally
 * @param {number} [options.Zoom=1] - Zoom factor
 * @returns {boolean} - whether the image was complete or not
 */
function DrawImageEx(
	Source,
	X,
	Y,
	{
		Canvas = MainCanvas,
		Alpha = 1,
		SourcePos,
		Width,
		Height,
		Invert = false,
		Mirror = false,
		Zoom = 1
	}
) {
	if (typeof Source === "string") {
		Source = DrawGetImage(Source);
		if (!Source.complete) return false;
		if (!Source.naturalWidth) return true;
	}

	const sizeChanged = Width != null || Height != null;
	if (Width == null) {
		Width = SourcePos ? SourcePos[2] : Source.width;
	}
	if (Height == null) {
		Height = SourcePos ? SourcePos[3] : Source.height;
	}

	Canvas.save();

	Canvas.globalCompositeOperation = "source-over";
	Canvas.globalAlpha = Alpha;
	Canvas.translate(X, Y);

	if (Zoom != 1) {
		Canvas.scale(Zoom, Zoom);
	}

	if (Invert) {
		Canvas.transform(1, 0, 0, -1, 0, Height);
	}

	if (Mirror) {
		Canvas.transform(-1, 0, 0, 1, Width, 0);
	}

	if (SourcePos) {
		Canvas.drawImage(Source, SourcePos[0], SourcePos[1], SourcePos[2], SourcePos[3], 0, 0, Width, Height);
	} else if (sizeChanged) {
		Canvas.drawImage(Source, 0, 0, Width, Height);
	} else {
		Canvas.drawImage(Source, 0, 0);
	}

	Canvas.restore();
	return true;
}

/**
 * Wrapping text in fragments to support languages that do not separate between words using space.
 * This function can also break between a long English word if somehow needed in the script.
 * @param {string} text - The text to be fragmented.
 * @param {number} maxWidth - The max width the text will be filled in.
 * @returns {Array<string>} - A list of string that being fragmented.
 */
function fragmentText(text, maxWidth) {
	let words = text.split(' '),
		lines = [],
		line = "";

	if (MainCanvas.measureText(text).width < maxWidth) {
		return [text];
	}

	while (words.length > 0) {
		while (MainCanvas.measureText(words[0]).width >= maxWidth) {
			let temp = words[0];
			words[0] = temp.slice(0, -1);
			if (words.length > 1) {
				words[1] = temp.slice(-1) + words[1];
			} else {
				words.push(temp.slice(-1));
			}
		}
		if (MainCanvas.measureText(line + words[0]).width < maxWidth) {
			line += words.shift() + " ";
		} else {
			lines.push(line);
			line = "";
		}
		if (words.length === 0) {
			lines.push(line);
		}
	}
	return lines;
}

/**
 * Reduces the font size progressively until the text fits the wrap size
 * @param {string} Text - Text that will be drawn
 * @param {number} Width - Width in which the text must fit
 * @param {number} MaxLine - Maximum of lines the word can wrap for
 * @returns {void} - Nothing
 */
function GetWrapTextSize(Text, Width, MaxLine) {

	// Don't bother if it fits on one line
	if (MainCanvas.measureText(Text).width <= Width) return;

	const words = fragmentText(Text, Width);
	let line = '';

	// Find the number of lines
	let LineCount = 1;
	for (let n = 0; n < words.length; n++) {
		const testLine = line + words[n] + ' ';
		if (MainCanvas.measureText(testLine).width > Width && n > 0) {
			line = words[n] + ' ';
			LineCount++;
		} else line = testLine;
	}

	// If there's too many lines, we launch the function again with size minus 2
	if (LineCount > MaxLine) {
		MainCanvas.font = (parseInt(MainCanvas.font.substring(0, 2)) - 2).toString() + "px arial";
		GetWrapTextSize(Text, Width, MaxLine);
	}
}

/**
 * Draws a word wrapped text in a rectangle
 * @param {string} Text - Text to draw
 * @param {number} X - Position of the rectangle on the X axis
 * @param {number} Y - Position of the rectangle on the Y axis
 * @param {number} Width - Width of the rectangle
 * @param {number} Height - Height of the rectangle
 * @param {string} ForeColor - Foreground color
 * @param {string} [BackColor] - Background color
 * @param {number} [MaxLine] - Maximum of lines the word can wrap for
 * @returns {void} - Nothing
 */
function DrawTextWrap(Text, X, Y, Width, Height, ForeColor, BackColor, MaxLine) {
	// Draw the rectangle if we need too
	if (BackColor != null) {
		MainCanvas.beginPath();
		MainCanvas.rect(X, Y, Width, Height);
		MainCanvas.fillStyle = BackColor;
		MainCanvas.fillRect(X, Y, Width, Height);
		MainCanvas.fill();
		MainCanvas.lineWidth = 2;
		MainCanvas.strokeStyle = ForeColor;
		MainCanvas.stroke();
		MainCanvas.closePath();
	}
	if (!Text) return;

	// Sets the text size if there's a maximum number of lines
	let TextSize;
	if (MaxLine != null) {
		TextSize = MainCanvas.font;
		GetWrapTextSize(Text, Width, MaxLine);
	}

	// Split the text if it wouldn't fit in the rectangle
	MainCanvas.fillStyle = ForeColor;
	if (MainCanvas.measureText(Text).width > Width) {
		const words = fragmentText(Text, Width);
		let line = '';

		// Find the number of lines
		let LineCount = 1;
		for (let n = 0; n < words.length; n++) {
			const testLine = line + words[n] + ' ';
			if (MainCanvas.measureText(testLine).width > Width && n > 0) {
				line = words[n] + ' ';
				LineCount++;
			} else line = testLine;
		}

		// Splits the words and draw the text
		line = '';
		Y = Y - ((LineCount - 1) * 23) + (Height / 2);
		for (let n = 0; n < words.length; n++) {
			const testLine = line + words[n] + ' ';
			if (MainCanvas.measureText(testLine).width > Width && n > 0) {
				MainCanvas.fillText(line, X + Width / 2, Y);
				line = words[n] + ' ';
				Y += 46;
			}
			else {
				line = testLine;
			}
		}
		MainCanvas.fillText(line, X + Width / 2, Y);

	} else MainCanvas.fillText(Text, X + Width / 2, Y + Height / 2);

	// Resets the font text size
	if ((MaxLine != null) && (TextSize != null))
		MainCanvas.font = TextSize;

}

/**
 * Draws a text element on the canvas that will fit on the specified width
 * @param {string} Text - Text to draw
 * @param {number} X - Position of the text on the X axis
 * @param {number} Y - Position of the text on the Y axis
 * @param {number} Width - Width in which the text has to fit
 * @param {string} Color - Color of the text
 * @param {string} [BackColor] - Color of the background
 * @returns {void} - Nothing
 */
function DrawTextFit(Text, X, Y, Width, Color, BackColor) {
	if (!Text) return;

	// Get text properties
	let Result = DrawingGetTextSize(Text, Width);
	Text = Result[0];
	MainCanvas.font = CommonGetFont(Result[1].toString());

	// Draw a back color relief text if needed
	if ((BackColor != null) && (BackColor != "")) {
		MainCanvas.fillStyle = BackColor;
		MainCanvas.fillText(Text, X + 1, Y + 1);
	}

	// Restores the font size
	MainCanvas.fillStyle = Color;
	MainCanvas.fillText(Text, X, Y);
	MainCanvas.font = CommonGetFont(36);
}

/**
 * Gets the text size needed to fit inside a given width according to the current font.
 * This function is memoized because <code>MainCanvas.measureText(Text)</code> is a major resource hog.
 * @param {string} Text - Text to draw
 * @param {number} Width - Width in which the text has to fit
 * @returns {[string, number]} - Text to draw and its font size
 */
const DrawingGetTextSize = CommonMemoize((Text, Width) => {
	// If it doesn't fit, test with smaller and smaller fonts until it fits
	let S;
	for (S = 36; S >= 10; S = S - 2) {
		MainCanvas.font = CommonGetFont(S.toString());
		const metrics = MainCanvas.measureText(Text);
		if (metrics.width <= Width)
			return [Text, S];
	}

	// Cuts the text if it would go over the box
	while (Text.length > 0) {
		Text = Text.substr(1);
		const metrics = MainCanvas.measureText(Text);
		if (metrics.width <= Width)
			return [Text, S];
	}
});

/**
 * Draws a text element on the canvas
 * @param {string} Text - Text to draw
 * @param {number} X - Position of the text on the X axis
 * @param {number} Y - Position of the text on the Y axis
 * @param {string} Color - Color of the text
 * @param {string} [BackColor] - Color of the background
 * @returns {void} - Nothing
 */
function DrawText(Text, X, Y, Color, BackColor) {
	if (!Text) return;

	// Draw a back color relief text if needed
	if ((BackColor != null) && (BackColor != "")) {
		MainCanvas.fillStyle = BackColor;
		MainCanvas.fillText(Text, X + 1, Y + 1);
	}

	// Split the text on two lines if there's a |
	MainCanvas.fillStyle = Color;
	MainCanvas.fillText(Text, X, Y);

}

/**
 * Draws a button component
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text to display in the button
 * @param {string} Color - Color of the component
 * @param {string} [Image] - URL of the image to draw inside the button, if applicable
 * @param {string} [HoveringText] - Text of the tooltip, if applicable
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @returns {void} - Nothing
 */
function DrawButton(Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled) {

	// Draw the button rectangle (makes the background color cyan if the mouse is over it)
	MainCanvas.beginPath();
	MainCanvas.rect(Left, Top, Width, Height);
	MainCanvas.fillStyle = ((MouseX >= Left) && (MouseX <= Left + Width) && (MouseY >= Top) && (MouseY <= Top + Height) && !CommonIsMobile && !Disabled) ? "Cyan" : Color;
	MainCanvas.fillRect(Left, Top, Width, Height);
	MainCanvas.fill();
	MainCanvas.lineWidth = 2;
	MainCanvas.strokeStyle = 'black';
	MainCanvas.stroke();
	MainCanvas.closePath();

	// Draw the text or image
	DrawTextFit(Label, Left + Width / 2, Top + (Height / 2) + 1, Width - 4, "black");
	if ((Image != null) && (Image != "")) DrawImage(Image, Left + 2, Top + 2);

	// Draw the hovering text
	if ((HoveringText != null) && (MouseX >= Left) && (MouseX <= Left + Width) && (MouseY >= Top) && (MouseY <= Top + Height) && !CommonIsMobile) {
		DrawHoverElements.push(() => DrawButtonHover(Left, Top, Width, Height, HoveringText));
	}
}

/**
 * Draws a checkbox component
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Text - Label associated with the checkbox
 * @param {boolean} IsChecked - Whether or not the checkbox is checked
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {string} [TextColor] - Color of the text
 * @returns {void} - Nothing
 */
function DrawCheckbox(Left, Top, Width, Height, Text, IsChecked, Disabled = false, TextColor = "Black", CheckImage = "Icons/Checked.png") {
	DrawText(Text, Left + 100, Top + 33, TextColor, "Gray");
	DrawButton(Left, Top, Width, Height, "", Disabled ? "#ebebe4" : "White", IsChecked ? CheckImage : "", null, Disabled);
}

/**
 * Draw a back & next button component
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text inside the component
 * @param {string} Color - Color of the component
 * @param {string} [Image] - Image URL to draw in the component
 * @param {() => string} [BackText] - Text for the back button tooltip
 * @param {() => string} [NextText] - Text for the next button tooltip
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {number} [ArrowWidth] - How much of the button the previous/next sections cover. By default, half each.
 * @returns {void} - Nothing
 */
function DrawBackNextButton(Left, Top, Width, Height, Label, Color, Image, BackText, NextText, Disabled, ArrowWidth) {
	// Set the widths of the previous/next sections to be colored cyan when hovering over them
	// By default each covers half the width, together covering the whole button
	if (ArrowWidth == null || ArrowWidth > Width / 2) ArrowWidth = Width / 2;
	const LeftSplit = Left + ArrowWidth;
	const RightSplit = Left + Width - ArrowWidth;

	// Draw the button rectangle
	MainCanvas.beginPath();
	MainCanvas.rect(Left, Top, Width, Height);
	MainCanvas.fillStyle = Color;
	MainCanvas.fillRect(Left, Top, Width, Height);
	if (MouseIn(Left, Top, Width, Height) && !CommonIsMobile && !Disabled) {
		MainCanvas.fillStyle = "Cyan";
		if (MouseX > RightSplit) {
			MainCanvas.fillRect(RightSplit, Top, ArrowWidth, Height);
		}
		else if (MouseX <= LeftSplit) {
			MainCanvas.fillRect(Left, Top, ArrowWidth, Height);
		} else {
			MainCanvas.fillRect(Left + ArrowWidth, Top, Width - ArrowWidth * 2, Height);
		}
	}
	else if (CommonIsMobile && ArrowWidth < Width / 2 && !Disabled) {
		// Fill in the arrow regions on mobile
		MainCanvas.fillStyle = "lightgrey";
		MainCanvas.fillRect(Left, Top, ArrowWidth, Height);
		MainCanvas.fillRect(RightSplit, Top, ArrowWidth, Height);
	}
	MainCanvas.lineWidth = 2;
	MainCanvas.strokeStyle = 'black';
	MainCanvas.stroke();
	MainCanvas.closePath();

	// Draw the text or image
	DrawTextFit(Label, Left + Width / 2, Top + (Height / 2) + 1, (CommonIsMobile) ? Width - 6 : Width - 36, "Black");
	if ((Image != null) && (Image != "")) DrawImage(Image, Left + 2, Top + 2);
	// Draw the back arrow
	MainCanvas.beginPath();
	MainCanvas.fillStyle = "black";
	MainCanvas.moveTo(Left + 15, Top + Height / 5);
	MainCanvas.lineTo(Left + 5, Top + Height / 2);
	MainCanvas.lineTo(Left + 15, Top + Height - Height / 5);
	MainCanvas.stroke();
	MainCanvas.closePath();

	// Draw the next arrow
	MainCanvas.beginPath();
	MainCanvas.fillStyle = "black";
	MainCanvas.moveTo(Left + Width - 15, Top + Height / 5);
	MainCanvas.lineTo(Left + Width - 5, Top + Height / 2);
	MainCanvas.lineTo(Left + Width - 15, Top + Height - Height / 5);
	MainCanvas.stroke();
	MainCanvas.closePath();

	// Draw the hovering text on the PC
	if (CommonIsMobile) return;
	if (BackText == null) BackText = () => "MISSING VALUE FOR: BACK TEXT";
	if (NextText == null) NextText = () => "MISSING VALUE FOR: NEXT TEXT";
	if ((MouseX >= Left) && (MouseX <= Left + Width) && (MouseY >= Top) && (MouseY <= Top + Height) && !Disabled)
		DrawHoverElements.push(() => { DrawButtonHover(Left, Top, Width, Height, MouseX < LeftSplit ? BackText() : MouseX >= RightSplit ? NextText() : "");});

}

/**
 * Draw the hovering text tooltip
 * @param {number} Left - Position of the tooltip from the left of the canvas
 * @param {number} Top - Position of the tooltip from the top of the canvas
 * @param {number} Width - Width of the tooltip
 * @param {number} Height - Height of the tooltip
 * @param {string} HoveringText - Text to display in the tooltip
 * @returns {void} - Nothing
 */
function DrawButtonHover(Left, Top, Width, Height, HoveringText) {
	if ((HoveringText != null) && (HoveringText != "")) {
		Left = (MouseX > 1000) ? Left - 475 : Left + Width + 25;
		Top = Top + (Height - 65) / 2;
		MainCanvas.beginPath();
		MainCanvas.rect(Left, Top, 450, 65);
		MainCanvas.fillStyle = "#FFFF88";
		MainCanvas.fillRect(Left, Top, 450, 65);
		MainCanvas.fill();
		MainCanvas.lineWidth = 2;
		MainCanvas.strokeStyle = 'black';
		MainCanvas.stroke();
		MainCanvas.closePath();
		DrawTextFit(HoveringText, Left + 225, Top + 33, 444, "black");
	}
}

/**
 * Draws a basic empty rectangle with a colored outline
 * @param {number} Left - Position of the rectangle from the left of the canvas
 * @param {number} Top - Position of the rectangle from the top of the canvas
 * @param {number} Width - Width of the rectangle
 * @param {number} Height - Height of the rectangle
 * @param {string} Color - Color of the rectangle outline
 * @param {number} [Thickness=3] - Thickness of the rectangle line
 * @returns {void} - Nothing
 */
function DrawEmptyRect(Left, Top, Width, Height, Color, Thickness = 3) {
	MainCanvas.beginPath();
	MainCanvas.rect(Left, Top, Width, Height);
	MainCanvas.lineWidth = Thickness;
	MainCanvas.strokeStyle = Color;
	MainCanvas.stroke();
}

/**
 * Draws a basic rectangle filled with a given color
 * @param {number} Left - Position of the rectangle from the left of the canvas
 * @param {number} Top - Position of the rectangle from the top of the canvas
 * @param {number} Width - Width of the rectangle
 * @param {number} Height - Height of the rectangle
 * @param {string} Color - Color of the rectangle
 * @returns {void} - Nothing
 */
function DrawRect(Left, Top, Width, Height, Color) {
	MainCanvas.beginPath();
	MainCanvas.fillStyle = Color;
	MainCanvas.fillRect(Left, Top, Width, Height);
	MainCanvas.fill();
}

/**
 * Draws a basic circle
 * @param {number} CenterX - Position of the center of the circle on the X axis
 * @param {number} CenterY - Position of the center of the circle on the Y axis
 * @param {number} Radius - Radius of the circle to draw
 * @param {number} LineWidth - Width of the line
 * @param {string} LineColor - Color of the circle's line
 * @param {string} [FillColor] - Color of the space inside the circle
 * @param {CanvasRenderingContext2D} [Canvas] - The canvas element to draw onto, defaults to MainCanvas
 * @returns {void} - Nothing
 */
function DrawCircle(CenterX, CenterY, Radius, LineWidth, LineColor, FillColor, Canvas) {
	if (!Canvas) Canvas = MainCanvas;
	Canvas.beginPath();
	Canvas.arc(CenterX, CenterY, Radius, 0, 2 * Math.PI, false);
	if (FillColor) {
		Canvas.fillStyle = FillColor;
		Canvas.fill();
	}
	Canvas.lineWidth = LineWidth;
	Canvas.strokeStyle = LineColor;
	Canvas.stroke();
}

/**
 * Draws a progress bar with color
 * @param {number} x - Position of the bar on the X axis
 * @param {number} y - Position of the bar on the Y axis
 * @param {number} w - Width of the bar
 * @param {number} h - Height of the bar
 * @param {number} value - Current progress to display on the bar
 * @param {string} [foreground="#66FF66"] - Color of the first part of the bar
 * @param {string} [background="red"] - Color of the bar background
 * @returns {void} - Nothing
 */
function DrawProgressBar(x, y, w, h, value, foreground = "#66FF66", background = "red") {
	if (value < 0) value = 0;
	if (value > 100) value = 100;
	DrawRect(x, y, w, h, "white");
	DrawRect(x + 2, y + 2, Math.floor((w - 4) * value / 100), h - 4, foreground);
	DrawRect(Math.floor(x + 2 + (w - 4) * value / 100), y + 2, Math.floor((w - 4) * (100 - value) / 100), h - 4, background);
}

/**
 * Constantly looping draw process. Draws beeps, handles the screen size, handles the current blindfold state and draws the current screen.
 * @param {number} time - The current time for frame
 * @returns {void} - Nothing
 */
function DrawProcess(time) {
	// Clear the list of characters that were drawn last frame
	DrawLastCharacters = [];

	KinkyDungeonRun();

	// Draw Hovering text so they can be above everything else
	DrawProcessHoverElements();

	// Checks for screen resize/position change and calls appropriate function
	const newCanvasPosition = [MainCanvas.canvas.offsetLeft, MainCanvas.canvas.offsetTop, MainCanvas.canvas.clientWidth, MainCanvas.canvas.clientHeight];
	if (!CommonArraysEqual(newCanvasPosition, DrawCanvasPosition)) {
		DrawCanvasPosition = newCanvasPosition;
	}
}

/**
 * Draws every element that is considered a "hover" element such has button tooltips.
 * @returns {void} - Nothing
 */
function DrawProcessHoverElements() {
	for (let E = 0; E < DrawHoverElements.length; E++)
		if (typeof DrawHoverElements[0] === "function")
			(DrawHoverElements.shift())();
}
