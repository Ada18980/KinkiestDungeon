'use strict';

/**
 * Sets up the KD crash handler
 */
function KinkyDungeonSetupCrashHandler() {
	window.addEventListener("error", KinkyDungeonOnUncaughtError);
}

/**
 * Tears down the KD crash handler
 */
function KinkyDungeonTeardownCrashHandler() {
	window.removeEventListener("error", KinkyDungeonOnUncaughtError);
}

/**
 * Error event handler for uncaught errors
 * @param {ErrorEvent} event - The error event
 */
function KinkyDungeonOnUncaughtError(event) {
	const report = KinkyDungeonGenerateErrorReport(event);
	KinkyDungeonShowCrashReportModal(report);
}

/**
 * Generates an error report string containing crash debug data
 * @param {ErrorEvent} event - The error event
 * @returns {string} - The report
 */
function KinkyDungeonGenerateErrorReport(event) {
	return [
		KinkyDungeonCrashReportErrorDetails(event),
		KinkyDungeonCrashReportStateData(),
		KinkyDungeonCrashReportDiagnostics(),
		KinkyDungeonCrashReportDeviceDetails(),
		KinkyDungeonCrashReportSaveData(),
	].join("\n\n");
}

/**
 * Generates a report string containing debug data about the current state of the game
 * @returns {string} - The report
 */
function KinkyDungeonCrashReportStateData() {
	let version;
	try {
		version = TextGet("KinkyDungeon") || "Version unknown";
	} catch {
		version = "Version unknown";
	}
	let modFiles;
	try {
		modFiles = KDAllModFiles.map(({filename}) => filename).join(",");
	} catch {
		modFiles = "Failed to parse mod files";
	}
	return [
		"========== Game State Data ==========",
		"",
		`Version: ${version}`,
		`Test mode: ${TestMode}`,
		`Debug mode: ${KDDebugMode}`,
		`Kinky Dungeon state: ${KinkyDungeonState}`,
		`Kinky Dungeon running: ${KinkyDungeonGameRunning}`,
		`Loaded mod files: [${modFiles}]`,
	].join("\n");
}

/**
 * Generates an error report string containing debug data about the thrown error
 * @param {ErrorEvent} event - The error event
 * @returns {string} - The report
 */
function KinkyDungeonCrashReportErrorDetails(event) {
	return [
		"========== Kinky Dungeon Crash Report ==========",
		"",
		`Message: ${event.message}`,
		`Location: ${KinkyDungeonStackSanitize(event.filename)}:${event.lineno}:${event.colno}`,
		"",
		KinkyDungeonStackSanitize(event.error.stack),
	].join("\n");
}

/**
 * Generates a report string containing the current save state of the game
 * @returns {string} - The report
 */
function KinkyDungeonCrashReportSaveData() {
	let saveData = localStorage.getItem("KinkyDungeonSave");
	if (!saveData) {
		try {
			saveData = KinkyDungeonCompressSave(KinkyDungeonGenerateSaveData());
		} catch (error) {
			saveData = "Could not locate or generate save data";
		}
	}
	return [
		"========== Save Data ==========",
		"",
		saveData,
	].join("\n");
}

/**
 * Generates a report string containing debug data with general diagnostics information
 * @returns {string} - The report
 */
function KinkyDungeonCrashReportDiagnostics() {
	return [
		"========== Diagnostics ==========",
		"",
		`Location: ${KinkyDungeonStackSanitize(window.location.href)}`,
		`User agent: ${window.navigator.userAgent}`,
		`Locale: ${window.navigator.language}`,
		`Local time: ${Date.now()}`,
		`Mouse: [${MouseX}, ${MouseY}]`,
		`WebGL supported: ${PIXI.utils.isWebGLSupported()}`,
	].join("\n");
}

/**
 * Generates a report string containing debug data with device detection information
 * @returns {string} - The report
 */
function KinkyDungeonCrashReportDeviceDetails() {
	return [
		"========== Device Detection ==========",
		"",
		JSON.stringify(PIXI.utils.isMobile, null, 2),
	].join("\n");
}

/**
 * Sanitizes a string to remove beta codes from it
 * @returns {string} - The sanitized string
 */
function KinkyDungeonStackSanitize(stack) {
	return stack.replaceAll(/\/\d{10,}/g, "<beta>");
}

/**
 * Opens the KD crash report modal, displaying the provided report
 * @param {string} report - The report to display
 */
function KinkyDungeonShowCrashReportModal(report) {
	const id = "kinky-dungeon-crash-report";

	if (document.querySelector(`#${id}`)) {
		return;
	}

	const backdrop = document.createElement("div");
	backdrop.id = id;
	Object.assign(backdrop.style, {
		position: "fixed",
		inset: 0,
		backgroundColor: "#000000a0",
		fontFamily: "'Arial', sans-serif",
		fontSize: "1.8vmin",
		lineHeight: 1.6,
	});

	const modal = document.createElement("div");
	Object.assign(modal.style, {
		position: "absolute",
		display: "flex",
		flexFlow: "column nowrap",
		width: "90vw",
		maxWidth: "1440px",
		maxHeight: "90vh",
		overflow: "hidden",
		backgroundColor: "#282828",
		color: "#fafafa",
		left: "50%",
		top: "50%",
		transform: "translate(-50%, -50%)",
		padding: "1rem",
		borderRadius: "2px",
		boxShadow: "1px 1px 40px -8px #ffffff80",
	});
	backdrop.appendChild(modal);

	const heading = document.createElement("h1");
	Object.assign(heading.style, {
		display: "flex",
		flexFlow: "row nowrap",
		alignItems: "center",
		justifyContent: "space-around",
		textAlign: "center",
	});
	heading.appendChild(KinkyDungeonErrorImage("WolfgirlPet"));
	heading.appendChild(KinkyDungeonErrorImage("Wolfgirl"));
	heading.appendChild(KinkyDungeonErrorImage("WolfgirlPet"));
	heading.appendChild(document.createTextNode("Kinky Dungeon Crash Handler"));
	heading.appendChild(KinkyDungeonErrorImage("WolfgirlPet"));
	heading.appendChild(KinkyDungeonErrorImage("Wolfgirl"));
	heading.appendChild(KinkyDungeonErrorImage("WolfgirlPet"));
	modal.appendChild(heading);

	const hr = document.createElement("hr");
	Object.assign(hr.style, {
		border: `1px solid ${KDBorderColor}`,
		margin: "0 0 1.5em",
	});
	modal.appendChild(hr);

	modal.appendChild(KinkyDungeonErrorPreamble([
		"An error has occurred whilst Kinky Dungeon was running. ",
		"You may be able to continue playing, but Kinky Dungeon might not function correctly.",
	]));
	modal.appendChild(KinkyDungeonErrorPreamble([
		"Please report this error in the Kinky Dungeon Discord so that we can dispatch our team of highly-trained wolfgirls to fix it.",
		"When you make your report, please include the following debug information - the wolfgirls will appreciate it!",
	]));

	const pre = document.createElement("pre");
	Object.assign(pre.style, {
		flex: 1,
		backgroundColor: "#1a1a1a",
		border: "1px solid #ffffff40",
		fontSize: "1.1em",
		padding: "1em",
		userSelect: "all",
		overflowWrap: "anywhere",
		overflowX: "hidden",
		overflowY: "auto",
		color: KDBorderColor,
	});
	pre.textContent = `\`\`\`\n${report}\n\`\`\``;
	modal.appendChild(pre);

	const buttons = document.createElement("div");
	Object.assign(buttons.style, {
		display: "flex",
		flexFlow: "row wrap",
		justifyContent: "flex-end",
		gap: "1em",
	});
	modal.appendChild(buttons);

	const copyButton = KinkyDungeonErrorModalButton("Copy to clipboard");
	copyButton.addEventListener("click", () => {
		KinkyDungeonErrorCopy(report, pre)
			.then(copied => {
				copyButton.textContent = copied ? "Awoo!" : "Failed";
			})
			.catch(() => void 0);
	});
	buttons.appendChild(copyButton);

	const closeButton = KinkyDungeonErrorModalButton("Close");
	closeButton.addEventListener("click", () => {
		backdrop.remove();
	});
	buttons.appendChild(closeButton);

	document.body.appendChild(backdrop);
}

function KinkyDungeonErrorImage(src) {
	const img = document.createElement("img");
	img.src = `${KinkyDungeonRootDirectory}Enemies/${src}.png`;
	Object.assign(img.style, {
		maxWidth: "10vw",
	});
	return img;
}

function KinkyDungeonErrorPreamble(content) {
	const preamble = document.createElement("p");
	Object.assign(preamble.style, {
		margin: "0 0 0.5em",
		fontSize: "1.25em",
	});
	preamble.innerHTML = content.join(" ");
	return preamble;
}

function KinkyDungeonErrorModalButton(text) {
	const button = document.createElement("button");
	button.textContent = text;
	Object.assign(button.style, {
		fontSize: "1.25em",
		padding: "0.5em 1em",
		backgroundColor: KDButtonColor,
		border: `2px solid ${KDBorderColor}`,
		color: "#ffffff",
		cursor: "pointer",
	});
	return button;
}

function KinkyDungeonErrorCopy(report, reportElement) {
	return navigator.clipboard.writeText(report)
		.then(() => true)
		.catch(() => {
			if (reportElement) {
				const range = document.createRange();
				range.selectNode(reportElement);
				window.getSelection()?.removeAllRanges();
				window.getSelection()?.addRange(range);
				return document.execCommand("copy");
			}
			return false;
		});
}
