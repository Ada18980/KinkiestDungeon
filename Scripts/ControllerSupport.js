"use strict";
/* eslint-disable no-redeclare */
var ControllerButtonsX = [];//there probably is a way to use just one list, but i don't want to bother and this works anyway
var ControllerButtonsY = [];
var ControllerActive = true;
var ControllerCurrentButton = 0;
var ControllerButtonsRepeat = true;
var ControllerAxesRepeat = false;
var ControllerIgnoreButton = false;
var ControllerAxesRepeatTime = 0;
var ControllerA = 1;
var ControllerB = 0;
var ControllerX = 3;
var ControllerY = 2;
var ControllerTriggerRight = 6;
var ControllerTriggerLeft = 7;
var ControllerStart = 9;
var ControllerSelect = 8;
var ControllerDPadPressLeft = 10;
var ControllerDPadPressRight = 11;
var ControllerStickUpDown = 1;
var ControllerStickLeftRight = 0;
var ControllerStickRight = 1;
var ControllerStickDown = 1;
var ControllerDPadUp = 4;
var ControllerDPadDown = 5;
var ControllerDPadLeft = 6;
var ControllerDPadRight = 7;
var Calibrating = false;
var ControllerStick = false;
var waitasec = false;
var ControllerSensitivity = 5;
var ControllerIgnoreStick = [];
var ControllerDeadZone = 0.01;
var ControllerGameActiveButttons = {};

/**
 *removes all buttons from the lists
 */
function ClearButtons() {
	ControllerButtonsX = [];
	ControllerButtonsY = [];
}
/**
 * adds a button to the lists
 * @param {any} X X value of the button
 * @param {any} Y Y value of the button
 */
function setButton(X, Y) {
	if (ControllerIgnoreButton == false) {
		X += 10;
		Y += 10;
		if (!ButtonExists(X, Y)) {
			ControllerButtonsX.push(X);
			ControllerButtonsY.push(Y);
		}
	}
}
/**
 * checks, wether a button is already in the lists (i realise now, that i could have used .includes but it works)
 * @param {any} X X value of the button
 * @param {any} Y Y value of the button
 */
function ButtonExists(X, Y) {
	var g = 0;
	var ButtonExists = false;
	while (g < ControllerButtonsX.length) {
		if (ControllerButtonsX[g] == X && ControllerButtonsY[g] == Y) {
			ButtonExists = true;
		}
		g += 1;
	}
	return ButtonExists;
}

/**
 * handles the sitck input
 * @param {any} axes the raw data of all axes of the controller
 */
function ControllerAxis(axes) {

	// Bondage Brawls handles it's own controls
	if ((CurrentScreen == "Platform") || (CurrentScreen == "PlatformDialog")) return;

	//if a value is over 1, it is from a d-pad (some d-pads register as buttons, some d-pads register like this)
	var g = 0;
	while (g < axes.length) {
		if (Math.abs(axes[g]) > 1 && ControllerIgnoreStick.includes(g) == false) {
			ControllerIgnoreStick.push(g);
		}
		g += 1;
	}
	if (Calibrating == false) {
		var g = 0;
		while (g < axes.length && ControllerStick == false) {
			if (Math.abs(axes[g]) > 0.1 && ControllerIgnoreStick.includes(g) == false) {
				ControllerStick = true;
			}
			g += 1;
		}
		if (ControllerStick == true && ControllerActive == true) {
			if (Math.abs(axes[ControllerStickUpDown]) > ControllerDeadZone) {
				MouseY += axes[ControllerStickUpDown] * ControllerStickDown * ControllerSensitivity;
			}
			if (Math.abs(axes[ControllerStickLeftRight]) > ControllerDeadZone) {
				MouseX += axes[ControllerStickLeftRight] * ControllerStickRight * ControllerSensitivity;
			}
			if (MouseX < 0) {
				MouseX = 0;
			}
			if (MouseX > 2000) {
				MouseX = 2000;
			}
			if (MouseY < 0) {
				MouseY = 0;
			}
			if (MouseY > 1000) {
				MouseY = 1000;
			}

		}
	}
	if (Calibrating == true) {
		if (PreferenceCalibrationStage == 101) {
			var g = 0;
			var f = false;
			while (g < axes.length && f == false) {
				if (Math.abs(axes[g]) > 0.8 && ControllerIgnoreStick.includes(g) == false) {
					ControllerStickUpDown = g;
					Player.ControllerSettings.ControllerStickUpDown = g;
					if (axes[g] > 0) {
						ControllerStickDown = -1;
						Player.ControllerSettings.ControllerStickDown = -1;
					}
					if (axes[g] < 0) {
						ControllerStickDown = 1;
						Player.ControllerSettings.ControllerStickDown = 1;
					}
					waitasec = true;
					PreferenceCalibrationStage = 102;
					f = true;
				}
				g += 1;
			}
		}
		if (PreferenceCalibrationStage == 102) {
			if (waitasec == true) {
				var g = 0;
				var f = false;
				while (g < axes.length) {
					if (Math.abs(axes[g]) > 0.1 && ControllerIgnoreStick.includes(g) == false) {
						f = true;
					}
					g += 1;
				}
				if (f == false) {
					waitasec = false;
				}
			}
			if (waitasec == false) {
				var g = 0;
				var f = false;
				while (g < axes.length && f == false) {
					if (Math.abs(axes[g]) > 0.8 && ControllerIgnoreStick.includes(g) == false) {
						ControllerStickLeftRight = g;
						Player.ControllerSettings.ControllerStickLeftRight = g;
						if (axes[g] > 0) {
							ControllerStickRight = 1;
							Player.ControllerSettings.ControllerStickRight = 1;
						}
						if (axes[g] < 0) {
							ControllerStickRight = -1;
							Player.ControllerSettings.ControllerStickRight = -1;
						}
						PreferenceCalibrationStage = 0;
						Calibrating = false;
						f = true;
					}
					g += 1;
				}
			}
		}
	}
}

/**
 * Returns TRUE if current screen is a game that handles the controller, sends the input to that screen
 * @param {any} Buttons - The raw button data
 * @return {boolean}
 */
function ControllerManagedByGame(Buttons) {

	// Make sure the active buttons are valid
	if (ControllerGameActiveButttons.A == null) ControllerGameActiveButttons.A = false;
	if (ControllerGameActiveButttons.B == null) ControllerGameActiveButttons.B = false;
	if (ControllerGameActiveButttons.X == null) ControllerGameActiveButttons.X = false;
	if (ControllerGameActiveButttons.Y == null) ControllerGameActiveButttons.Y = false;
	if (ControllerGameActiveButttons.DOWN == null) ControllerGameActiveButttons.DOWN = false;
	if (ControllerGameActiveButttons.UP == null) ControllerGameActiveButttons.UP = false;
	if (ControllerGameActiveButttons.LEFT == null) ControllerGameActiveButttons.LEFT = false;
	if (ControllerGameActiveButttons.RIGHT == null) ControllerGameActiveButttons.RIGHT = false;

	// If the screen manages the controller, we call it
	let Managed = false;
	if (CurrentScreen == "PlatformDialog") Managed = PlatformDialogController(Buttons);
	if (CurrentScreen == "Platform") Managed = PlatformController(Buttons);

	// If managed, we flag the active buttons not to repeat them
	if (Managed == true) {
		ControllerGameActiveButttons.A = Buttons[ControllerA].pressed;
		ControllerGameActiveButttons.B = Buttons[ControllerB].pressed;
		ControllerGameActiveButttons.X = Buttons[ControllerX].pressed;
		ControllerGameActiveButttons.Y = Buttons[ControllerY].pressed;
		ControllerGameActiveButttons.TLEFT = Buttons[ControllerTriggerLeft].pressed;
		ControllerGameActiveButttons.TRIGHT = Buttons[ControllerTriggerRight].pressed;
		ControllerGameActiveButttons.DOWN = Buttons[ControllerDPadDown].pressed;
		ControllerGameActiveButttons.UP = Buttons[ControllerDPadUp].pressed;
		ControllerGameActiveButttons.LEFT = Buttons[ControllerDPadLeft].pressed;
		ControllerGameActiveButttons.RIGHT = Buttons[ControllerDPadRight].pressed;
	}

	// TRUE if the screen managed the controller
	return Managed;

}

/**
 * handles button input
 * @param {any} buttons raw buttons data
 */
function ControllerButton(buttons) {
	if (ControllerActive == true) {

		//makes sure that no value is undefined
		if (buttons[ControllerA] == undefined) {
			ControllerA = 1;
		}
		if (buttons[ControllerB] == undefined) {
			ControllerB = 0;
		}
		if (buttons[ControllerX] == undefined) {
			ControllerX = 3;
		}
		if (buttons[ControllerY] == undefined) {
			ControllerY = 2;
		}
		if (buttons[ControllerStickUpDown] == undefined) {
			ControllerStickUpDown = 1;
		}
		if (buttons[ControllerStickLeftRight] == undefined) {
			ControllerStickLeftRight = 0;
		}
		if (buttons[ControllerStickRight] == undefined) {
			ControllerStickRight = 1;
		}
		if (buttons[ControllerStickDown] == undefined) {
			ControllerStickDown = 1;
		}
		if (buttons[ControllerDPadUp] == undefined) {
			ControllerDPadUp = 4;
		}
		if (buttons[ControllerDPadDown] == undefined) {
			ControllerDPadDown = 5;
		}
		if (buttons[ControllerDPadLeft] == undefined) {
			ControllerDPadLeft = 6;
		}
		if (buttons[ControllerDPadRight] == undefined) {
			ControllerDPadRight = 7;
		}

		// If a game intercepts the controller inputs
		if (ControllerManagedByGame(buttons)) return;

		if (ControllerButtonsRepeat == false) {
			if (Calibrating == false) {
				if (buttons[ControllerA].pressed == true) {
					ControllerClick();
					ControllerButtonsRepeat = true;
				}

				if (buttons[ControllerB].pressed == true) {
					if (CurrentScreenFunctions.Exit) {
						CurrentScreenFunctions.Exit();
					} else if ((CurrentCharacter != null) && Array.isArray(DialogMenuButton) && (DialogMenuButton.indexOf("Exit") >= 0)) {
						if (!DialogLeaveFocusItem())
							DialogLeaveItemMenu();
					} else if ((CurrentCharacter != null) && (CurrentScreen == "ChatRoom")) {
						DialogLeave();
					} else if ((CurrentCharacter == null) && (CurrentScreen == "ChatRoom") && (document.getElementById("TextAreaChatLog") != null)) {
						ElementScrollToEnd("TextAreaChatLog");
					}
					ControllerButtonsRepeat = true;
				}

				if (buttons[ControllerX].pressed == true) {
					KeyPress = 65;
					StruggleKeyDown();
					ControllerButtonsRepeat = true;
				}

				if (buttons[ControllerY].pressed == true) {
					KeyPress = 97;
					StruggleKeyDown();
					ControllerButtonsRepeat = true;
				}

				if (buttons[ControllerDPadUp].pressed == true) {
					ControllerStick = true;
					ControllerUp();
					ControllerButtonsRepeat = true;
				}
				if (buttons[ControllerDPadDown].pressed == true) {
					ControllerStick = true;
					ControllerDown();
					ControllerButtonsRepeat = true;
				}
				if (buttons[ControllerDPadLeft].pressed == true) {
					ControllerStick = true;
					ControllerLeft();
					ControllerButtonsRepeat = true;
				}
				if (buttons[ControllerDPadRight].pressed == true) {
					ControllerStick = true;
					ControllerRight();
					ControllerButtonsRepeat = true;
				}
			}
			if (ControllerButtonsRepeat == false) {
				if (Calibrating == true) {
					if (ControllerButtonsRepeat == false) {
						if (PreferenceCalibrationStage == 1) {
							var g = 0;
							var h = false;
							while (g < buttons.length && h == false) {
								if (buttons[g].pressed == true) {
									ControllerA = g;
									Player.ControllerSettings.ControllerA = g;
									h = true;
									PreferenceCalibrationStage = 2;
									ControllerButtonsRepeat = true;
								}
								g += 1;
							}
						}
					}

					if (ControllerButtonsRepeat == false) {
						if (PreferenceCalibrationStage == 2) {
							var g = 0;
							var h = false;
							while (g < buttons.length && h == false) {
								if (buttons[g].pressed == true) {
									ControllerB = g;
									Player.ControllerSettings.ControllerB = g;
									h = true;
									PreferenceCalibrationStage = 3;
									ControllerButtonsRepeat = true;
								}
								g += 1;
							}
						}
					}
					if (ControllerButtonsRepeat == false) {
						if (PreferenceCalibrationStage == 3) {
							var g = 0;
							var h = false;
							while (g < buttons.length && h == false) {
								if (buttons[g].pressed == true) {
									ControllerX = g;
									Player.ControllerSettings.ControllerX = g;
									h = true;
									PreferenceCalibrationStage = 4;
									ControllerButtonsRepeat = true;
								}
								g += 1;
							}
						}
					}
					if (ControllerButtonsRepeat == false) {
						if (PreferenceCalibrationStage == 4) {
							var g = 0;
							var h = false;
							while (g < buttons.length && h == false) {
								if (buttons[g].pressed == true) {
									ControllerY = g;
									Player.ControllerSettings.ControllerY = g;
									h = true;
									PreferenceCalibrationStage = 5;
									ControllerButtonsRepeat = true;
								}
								g += 1;
							}
						}
					}
					if (ControllerButtonsRepeat == false) {
						if (PreferenceCalibrationStage == 5) {
							var g = 0;
							var h = false;
							while (g < buttons.length && h == false) {
								if (buttons[g].pressed == true) {
									ControllerDPadUp = g;
									Player.ControllerSettings.ControllerDPadUp = g;
									h = true;
									PreferenceCalibrationStage = 6;
									ControllerButtonsRepeat = true;
								}
								g += 1;
							}
						}
					}
					if (ControllerButtonsRepeat == false) {
						if (PreferenceCalibrationStage == 6) {
							var g = 0;
							var h = false;
							while (g < buttons.length && h == false) {
								if (buttons[g].pressed == true) {
									ControllerDPadDown = g;
									Player.ControllerSettings.ControllerDPadDown = g;
									h = true;
									PreferenceCalibrationStage = 7;
									ControllerButtonsRepeat = true;
								}
								g += 1;
							}
						}
					}
					if (ControllerButtonsRepeat == false) {
						if (PreferenceCalibrationStage == 7) {
							var g = 0;
							var h = false;
							while (g < buttons.length && h == false) {
								if (buttons[g].pressed == true) {
									ControllerDPadLeft = g;
									Player.ControllerSettings.ControllerDPadLeft = g;
									h = true;
									PreferenceCalibrationStage = 8;
									ControllerButtonsRepeat = true;
								}
								g += 1;
							}
						}
					}
					if (ControllerButtonsRepeat == false) {
						if (PreferenceCalibrationStage == 8) {
							var g = 0;
							var h = false;
							while (g < buttons.length && h == false) {
								if (buttons[g].pressed == true) {
									ControllerDPadRight = g;
									Player.ControllerSettings.ControllerDPadRight = g;
									h = true;
									PreferenceCalibrationStage = 0;
									Calibrating = false;
									ControllerButtonsRepeat = true;
								}
								g += 1;
							}
						}
					}
				}
			}
		}


		if (ControllerButtonsRepeat == true) {
			var g = 0;
			var h = false;
			while (g < buttons.length && h == false) {
				if (buttons[g].pressed == true) {
					h = true;
				}
				g += 1
			}
			if (h == false) {
				ControllerButtonsRepeat = false;
			}
		}
	}
}


//uncomment to test it with keyboard
/**
 * handles keyboard inputs in controller mode
 * @returns {void} Nothing
 */
function ControllerSupportKeyDown() {
	/*i*///    if (KeyPress == 105) ControllerUp();
	/*k*///    if (KeyPress == 107) ControllerDown();
	/*j*///    if (KeyPress == 106) ControllerLeft();
	/*l*///    if (KeyPress == 108) ControllerRight();
	/*space*///if (KeyPress == 32) ControllerClick();
}
/**
 * A -> Click
 */
function ControllerClick() {
	if (ControllerActive == true) {
		if (ControllerStick == false) {
			MouseX = ControllerButtonsX[ControllerCurrentButton];
			MouseY = ControllerButtonsY[ControllerCurrentButton];
		}
		CommonClick(null);
	}
}
/**
 * moves the pointer to either a button in a straight line above it or the closest one above
 * (all the commented stuff in the function is for debugging)
 */
function ControllerUp() {
	MouseX = ControllerButtonsX[ControllerCurrentButton];
	MouseY = ControllerButtonsY[ControllerCurrentButton];
	// console.log("starting search");
	if (ControllerCurrentButton > ControllerButtonsX.length) ControllerCurrentButton = 0;
	var CurrentY = ControllerButtonsY[ControllerCurrentButton];
	var CurrentX = ControllerButtonsX[ControllerCurrentButton];
	var found = false;
	while (CurrentY > 0 && found == false) {
		CurrentY -= 1;
		var f = 0;
		while (f < ControllerButtonsX.length && found == false) {
			if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
				found = true;
				MouseX = CurrentX;
				MouseY = CurrentY;
				ControllerCurrentButton = f;
				//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
			}
			f += 1;
			//console.log("searching: " + CurrentY + " " + CurrentX); //debug
		}
	}
	if (found == false) {
		// console.log("round 2");
		var CurrentY = ControllerButtonsY[ControllerCurrentButton];
		var CurrentX = ControllerButtonsX[ControllerCurrentButton];
		var CurrentXX = ControllerButtonsX[ControllerCurrentButton];
		while (CurrentY > 0 && found == false) {
			CurrentY -= 1;
			var OffsetX = 0;
			while (OffsetX < 2000 && found == false) {
				OffsetX += 1;
				CurrentX = CurrentXX + OffsetX;
				var f = 0;
				while (f < ControllerButtonsX.length && found == false) {
					if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
						found = true;
						MouseX = CurrentX;
						MouseY = CurrentY;
						ControllerCurrentButton = f;
						//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
					}
					f += 1;
					//console.log("searching: " + CurrentY + " " + CurrentX); //debug
				}
				CurrentX = CurrentXX - OffsetX;
				var f = 0;
				while (f < ControllerButtonsX.length && found == false) {
					if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
						found = true;
						MouseX = CurrentX;
						MouseY = CurrentY;
						ControllerCurrentButton = f;
						//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
					}
					f += 1;
					//console.log("searching: " + CurrentY + " " + CurrentX); //debug
				}
				//console.log(OffsetX);
			}
			//console.log("searching round 2 Y=" + CurrentY);
			//console.log("searching round 2 MouseX, MouseY=" + MouseX + ", " + MouseY);
		}
	}
	if (found == false) {
		// console.log("not found");
	}
}
/**
 * same as ControllerUp()
 */
function ControllerDown() {
	MouseX = ControllerButtonsX[ControllerCurrentButton];
	MouseY = ControllerButtonsY[ControllerCurrentButton];
	// console.log("starting search");
	if (ControllerCurrentButton > ControllerButtonsX.length) ControllerCurrentButton = 0;
	var CurrentY = ControllerButtonsY[ControllerCurrentButton];
	var CurrentX = ControllerButtonsX[ControllerCurrentButton];
	var found = false;
	while (CurrentY < 1000 && found == false) {
		CurrentY += 1;
		var f = 0;
		while (f < ControllerButtonsX.length && found == false) {
			if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
				found = true;
				MouseX = CurrentX;
				MouseY = CurrentY;
				ControllerCurrentButton = f;
				//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
			}
			f += 1;
			//console.log("searching: " + CurrentY + " " + CurrentX); //debug
		}
	}
	if (CurrentY >= 1000 && found == false) {
		// console.log("round 2");
		var CurrentY = ControllerButtonsY[ControllerCurrentButton];
		var CurrentX = ControllerButtonsX[ControllerCurrentButton];
		var CurrentXX = ControllerButtonsX[ControllerCurrentButton];
		while (CurrentY < 1000 && found == false) {
			CurrentY += 1;
			var OffsetX = 0;
			while (OffsetX < 2000 && found == false) {
				OffsetX += 1;
				CurrentX = CurrentXX + OffsetX;
				var f = 0;
				while (f < ControllerButtonsX.length && found == false) {
					if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
						found = true;
						MouseX = CurrentX;
						MouseY = CurrentY;
						ControllerCurrentButton = f;
						//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
					}
					f += 1;
					//console.log("searching: " + CurrentY + " " + CurrentX); //debug
				}
				CurrentX = CurrentXX - OffsetX;
				var f = 0;
				while (f < ControllerButtonsX.length && found == false) {
					if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
						found = true;
						MouseX = CurrentX;
						MouseY = CurrentY;
						ControllerCurrentButton = f;
						//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
					}
					f += 1;
					//console.log("searching: " + CurrentY + " " + CurrentX); //debug
				}
				//console.log(OffsetX);
			}
			//console.log("searching round 2 Y=" + CurrentY);
			//console.log("searching round 2 MouseX, MouseY=" + MouseX + ", " + MouseY);
		}
	}
	if (found == false) {
		// console.log("not found");
	}
}
/**
 * same as ControllerUp()
 */
function ControllerLeft() {
	MouseX = ControllerButtonsX[ControllerCurrentButton];
	MouseY = ControllerButtonsY[ControllerCurrentButton];
	// console.log("starting search");
	if (ControllerCurrentButton > ControllerButtonsX.length) ControllerCurrentButton = 0;
	var CurrentY = ControllerButtonsY[ControllerCurrentButton];
	var CurrentX = ControllerButtonsX[ControllerCurrentButton];
	var found = false;
	while (CurrentX > 0 && found == false) {
		CurrentX -= 1;
		var f = 0;
		while (f < ControllerButtonsX.length && found == false) {
			if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
				found = true;
				MouseX = CurrentX;
				MouseY = CurrentY;
				ControllerCurrentButton = f;
				//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
			}
			f += 1;
			//console.log("searching: " + CurrentY + " " + CurrentX); //debug
		}
	}
	if (found == false) {
		// console.log("round 2");
		var CurrentY = ControllerButtonsY[ControllerCurrentButton];
		var CurrentX = ControllerButtonsX[ControllerCurrentButton];
		var CurrentYY = ControllerButtonsY[ControllerCurrentButton];
		while (CurrentX > 0 && found == false) {
			CurrentX -= 1;
			var OffsetY = 0;
			while (OffsetY < 1000 && found == false) {
				OffsetY += 1;
				CurrentY = CurrentYY + OffsetY;
				var f = 0;
				while (f < ControllerButtonsX.length && found == false) {
					if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
						found = true;
						MouseX = CurrentX;
						MouseY = CurrentY;
						ControllerCurrentButton = f;
						//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
					}
					f += 1;
					//console.log("searching: " + CurrentY + " " + CurrentX); //debug
				}
				CurrentY = CurrentYY - OffsetY;
				var f = 0;
				while (f < ControllerButtonsX.length && found == false) {
					if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
						found = true;
						MouseX = CurrentX;
						MouseY = CurrentY;
						ControllerCurrentButton = f;
						//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
					}
					f += 1;
					//console.log("searching: " + CurrentY + " " + CurrentX); //debug
				}
				//console.log(OffsetX);
			}
			//console.log("searching round 2 Y=" + CurrentY);
			//console.log("searching round 2 MouseX, MouseY=" + MouseX + ", " + MouseY);
		}
	}
	if (found == false) {
		// console.log("not found");
	}
}
/**
 * same as ControllerUp()
 */
function ControllerRight() {
	MouseX = ControllerButtonsX[ControllerCurrentButton];
	MouseY = ControllerButtonsY[ControllerCurrentButton];
	// console.log("starting search");
	if (ControllerCurrentButton > ControllerButtonsX.length) ControllerCurrentButton = 0;
	var CurrentY = ControllerButtonsY[ControllerCurrentButton];
	var CurrentX = ControllerButtonsX[ControllerCurrentButton];
	var found = false;
	while (CurrentX <= 2000 && found == false) {
		CurrentX += 1;
		var f = 0;
		while (f < ControllerButtonsX.length && found == false) {
			if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
				found = true;
				MouseX = CurrentX;
				MouseY = CurrentY;
				ControllerCurrentButton = f;
				//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
			}
			f += 1;
			//console.log("searching: " + CurrentY + " " + CurrentX); //debug
		}
	}
	if (found == false) {
		// console.log("round 2");
		var CurrentY = ControllerButtonsY[ControllerCurrentButton];
		var CurrentX = ControllerButtonsX[ControllerCurrentButton];
		var CurrentYY = ControllerButtonsY[ControllerCurrentButton];
		while (CurrentX < 2000 && found == false) {
			CurrentX += 1;
			var OffsetY = 0;
			while (OffsetY < 1000 && found == false) {
				OffsetY += 1;
				CurrentY = CurrentYY + OffsetY;
				var f = 0;
				while (f < ControllerButtonsX.length && found == false) {
					if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
						found = true;
						MouseX = CurrentX;
						MouseY = CurrentY;
						ControllerCurrentButton = f;
						//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
					}
					f += 1;
					//console.log("searching: " + CurrentY + " " + CurrentX); //debug
				}
				CurrentY = CurrentYY - OffsetY;
				var f = 0;
				while (f < ControllerButtonsX.length && found == false) {
					if (CurrentY == ControllerButtonsY[f] && CurrentX == ControllerButtonsX[f]) {
						found = true;
						MouseX = CurrentX;
						MouseY = CurrentY;
						ControllerCurrentButton = f;
						//console.log("found at X=" + CurrentX + ", Y=" + CurrentY);
					}
					f += 1;
					//console.log("searching: " + CurrentY + " " + CurrentX); //debug
				}
				//console.log(OffsetX);
			}
			//console.log("searching round 2 Y=" + CurrentY);
			//console.log("searching round 2 MouseX, MouseY=" + MouseX + ", " + MouseY);
		}
	}
	if (found == false) {
		// console.log("not found");
	}
}
