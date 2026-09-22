
let KDButtplugClient: Buttplug.ButtplugClient = null;
let KDButtplugEngine: ButtplugPatterns.PatternEngine = null;
let KDButtplugDefaultAddress = "ws://127.0.0.1:12345";
let KDButtplugServer: string = KDButtplugDefaultAddress;
let KDButtplugBatteryCheckTime = 0;
let KDButtplugBatteryCheckInterval = 1000 * 60 * 15; // 15 minute intervals
let KDButtplugLowBattery = 30;
let KDXtoysWebhook = "";

function KDLoadToysIntegration() {
	
	if (localStorage.getItem("ButtplugConnected")) {
		KDButtplugServer = localStorage.getItem("ButtplugConnected");
		setTimeout(() => {
			KDStartButtplug(true);
		}, 1000);

		
	}

    if (localStorage.getItem("KDXtoysWebhook")) {
        KDXtoysWebhook = localStorage.getItem("KDXtoysWebhook");
    }
	
}

interface KDXtoysPayload {
    data?: any,
    /** number */
    amount?: string,
    front?: string,
    panties?: string,
    rear?: string,
    nipples?: string,
}

async function KDXtoys_Send(action: string, data: KDXtoysPayload) {
    let webhookID = KDXtoysWebhook;
    if (KDToggles.Buttplug && webhookID) {
        const params = new URLSearchParams({ ...(data ?? {}), action })
        const url = `https://webhook.xtoys.app/${webhookID}?${params.toString()}`
        await fetch(url)
    }
}


function KDUpdateButtplug() {
	if (KDToggles.Buttplug) {
		if (!KDToggleGroups.includes("Buttplug")) {
			KDToggleGroups.push("Buttplug");
		}
		KDStartButtplug();
	} else {
		if (KDToggleGroups.includes("Buttplug")) {
			KDToggleGroups.splice(KDToggleGroups.indexOf("Buttplug"), 1);
		}
		KDEndButtplug();
	}
}


async function KDButtplugScan() {
    
    return new Promise(async (resolve, reject) => {
        if (KDButtplugClient.connected) {
            await KDButtplugClient.stopScanning();
            await KDButtplugClient.stopAll();
            await KDButtplugClient.disconnect();
        }
        await KDButtplugClient.connect();
        await KDButtplugClient.requestDeviceList();
        await KDButtplugClient.startScanning().then(() => {
            KDSendMusicToast(TextGet("KDButtplugConnected"));
            resolve(null);
        }, () => {
            reject();
        });
    })
}

function KDStartButtplug(scan?: boolean) {
	if (!KDButtplugClient) {
		KDButtplugClient = new Buttplug.ButtplugClient(KDButtplugServer, {
            autoReconnect: true,
            clientName: "Kinky Dungeon"
        });
        //@ts-ignore
		KDButtplugEngine = new ButtplugPatterns.PatternEngine(KDButtplugClient);        

        KDButtplugClient.on("device.added", async ({ data: { device } }) => {
            console.log(`Found: ${device.displayName ?? device.name}`);
            KDUpdateButtplugList = true;

            if (device.canOutput("Vibrate")) {
                await device.vibrate(0.25);
                setTimeout(() => device.stop(), 300);
                KDButtplugDevices[KDGetButtplugDeviceId(device)] = {
                    id: device.name,
                    name: device.displayName ?? device.name,
                    battery: 99,
                    on: false,
                    strength: 100,
                    batteryWarning: false,
                };
                if (localStorage.getItem("buttplug_" + KDGetButtplugDeviceId(device))) {
                    KDButtplugDevices[KDGetButtplugDeviceId(device)] = JSON.parse(localStorage.getItem("buttplug_" + KDGetButtplugDeviceId(device)));
                }
                const level = await device.readSensor("Battery");
                KDButtplugDevices[KDGetButtplugDeviceId(device)].battery = Math.round(level);
                KDButtplugDevices[KDGetButtplugDeviceId(device)].on = false;
                KDButtplugDevices[KDGetButtplugDeviceId(device)].pattern = "";

                KDSendMusicToast(TextGet("KDButtplugFoundDevice") + (device.displayName ?? device.name));
                
            }
        });

        KDButtplugClient.on("device.removed", async ({ data: { device } }) => {
            console.log(`Lost: ${device.displayName ?? device.name}`);
            KDUpdateButtplugList = true;

            if (KDButtplugDevices[KDGetButtplugDeviceId(device)]) {
                KDSendMusicToast(TextGet("KDButtplugLostDevice") + (device.displayName ?? device.name));
                KDButtplugDevices[KDGetButtplugDeviceId(device)] = null;
            }
        });

        KDButtplugClient.on("connection.disconnected", ({ data: { reason } }) => {
            console.log("Disconnected:", reason ?? "unknown");
            KDUpdateButtplugList = true;
            if (reason != "TurnOff")
                KDSendMusicToast(TextGet("KDButtplugDisconnected") + reason);
        });

        KDButtplugClient.on("connection.reconnected", () => {
            console.log("Back online; device list will refresh");
            KDUpdateButtplugList = true;
            KDButtplugClient.requestDeviceList();
        });

        if (scan) {
            KDButtplugScan().then(() => {
                localStorage.setItem("ButtplugConnected", KDButtplugServer);
            });
        }

	} else if (!KDButtplugClient.connected) {
        if (scan) {
            KDButtplugScan().then(() => {
                localStorage.setItem("ButtplugConnected", KDButtplugServer);
            });
        }
    }
}

let KDUpdateButtplugList = false;

function KDEndButtplug() {
	if (KDButtplugClient) {
		if (KDButtplugClient.connected) {
			// turn off all devices
			for (let device of KDButtplugClient.devices) {
				device.stop();
			}

			KDButtplugClient.disconnect("TurnOff");
		}
		KDButtplugClient.dispose();
		KDButtplugClient = null;
        KDButtplugEngine = null;
        KDButtplugDevices = {};
	}
}

// Make sure buttplug disconnects when you end the game
window.addEventListener("beforeunload", (ev) => {
	KDEndButtplug();
})

KDCustomToggleTab.Buttplug = KDDrawButtplugTab;

async function KDRunButtplug() {
    if (!KDButtplugClient?.connected) {
        KDButtplugDevices = {};
    }
    if (KDButtplugClient && CommonTime() > KDButtplugBatteryCheckTime) {
        for (let device of KDButtplugClient.devices) {
            if (KDButtplugDevices[KDGetButtplugDeviceId(device)]) {
                if (device.canRead("Battery")) {
                    const level = await device.readSensor("Battery");
                    KDButtplugDevices[KDGetButtplugDeviceId(device)].battery = Math.round(level);
                    if (!KDButtplugDevices[KDGetButtplugDeviceId(device)].batteryWarning && level < KDButtplugLowBattery) {
                        KDButtplugDevices[KDGetButtplugDeviceId(device)].batteryWarning = true;
                        KDSendMusicToast(TextGet("KDButtplugLowBattery", {
                            DEVICE: (device.displayName ?? device.name)
                        }));

                    } else if (KDButtplugDevices[KDGetButtplugDeviceId(device)].batteryWarning && level > 5 + KDButtplugLowBattery) {
                        KDButtplugDevices[KDGetButtplugDeviceId(device)].batteryWarning = false;
                    }
                }
            }
        }

        KDButtplugBatteryCheckTime = CommonTime() + KDButtplugBatteryCheckInterval;
    }
}

function KDDrawButtplugTab(centerX?: number) {
    if (centerX == undefined) {
        centerX = 500 + (PIXIWidth - 500)/2;
    }
    DrawTextFitKD(TextGet("KDButtplugInfo"), 
    centerX, 140, 1200, KDBaseWhite, undefined, undefined, "center");

    let TF = KDTextField("KDButtplugAddress", centerX - 400, 220, 800, 40, undefined, undefined, "500");
    if (TF.Created) {
		//@ts-ignore
        TF.Element.placeholder = KDButtplugDefaultAddress;
        TF.Element.oninput = (ev) => {
            KDButtplugServer = ElementValue("KDButtplugAddress") || KDButtplugDefaultAddress;
            if (KDButtplugClient) {
                KDEndButtplug();
            }
        }
    }

    
    DrawTextFitKD(TextGet("KDXtoysWebhookID"), 
    centerX, PIXIHeight - 140, 1200, KDBaseWhite, undefined, undefined, "center");

    TF = KDTextField("KDXToysID", centerX - 400, PIXIHeight - 100, 800, 40, undefined, undefined, "500");
    if (TF.Created) {
        ElementValue("KDXToysID", KDXtoysWebhook);
        TF.Element.oninput = (ev) => {
            KDXtoysWebhook = ElementValue("KDXToysID") || "";
            localStorage.setItem("KDXtoysWebhook", KDXtoysWebhook);
        }
    }



    DrawTextFitKD(TextGet(KDButtplugClient?.connected ? "KDConnected" : "KDNotConnected"), 
    centerX, 285, 1200, KDButtplugClient?.connected ? KDBaseLightGreen : KDBaseLightGrey, undefined, undefined, "center");


    DrawButtonKDEx("KDBPConnect", async (bdata) => {
        if (!KDButtplugClient?.connected && KDButtplugClient) {
            KDStartButtplug(true);
        }
        return true;
    }, true, 
    centerX - 200 - 320/2, 350, 320, 60, TextGet("KDConnect"), 
        KDButtplugClient?.connected ? KDBaseLightGrey : KDBaseWhite
    )
    DrawButtonKDEx("KDBPDConnect", (bdata) => {
        if (KDButtplugClient?.connected) {
            KDButtplugClient.disconnect("TurnOff");
            localStorage.removeItem("ButtplugConnected");
        }
        return true;
    }, true, 
    centerX + 200 - 320/2, 350, 320, 60, TextGet("KDDisconnect"), 
        KDButtplugClient?.connected ? KDBaseWhite : KDBaseLightGrey
    )

    if (!(KDButtplugClient?.devices?.length > 0)) return;

    let listID = "KDButtplugList";
    let rowSize = 100;
    let listX = centerX - 500;
    let listY = 480;
    let listW = 1000;
    let listH = PIXIHeight - listY - 210;
	if (KDUpdateButtplugList || ShouldUpdateList(listID)) {
        KDUpdateButtplugList = false;
		PopulateList(listID, 
			listX, 
		    listY, 
			listW, listH, 50, 
			Math.floor(listH / rowSize),
			KDButtplugClient.devices, false, false, 250
		);
	}
    
    let numModes = Object.entries(KDVibeSounds).length;
    let catII = 0;
    let numModesLen = listW * 0.4;
    let widthBatt = listW * 0.35;
    if (numModes)
        for (let entry of Object.entries(KDVibeSounds)) {
            DrawTextFitKD(TextGet("KDButtplugCategory_" + entry[0]), 
                listX + (listW - numModesLen) + numModesLen/numModes* catII, listY - 20, numModesLen/numModes, KDBaseWhite, 
                undefined, undefined);
            catII++;
        }

    DrawTextFitKD(TextGet("KDButtplugCategory_Battery"), 
                listX + widthBatt, listY - 20, numModesLen/numModes, KDBaseWhite, 
                undefined, undefined);

    let hotkeyUp = KinkyDungeonKey[0];
    let hotkeyDown = KinkyDungeonKey[2];
	//@ts-ignore
	let drawn: Buttplug.Device = KDDrawScrollableList(listID, true, (
		container: PIXIContainer,
		isClickable: boolean,
		listItem: Buttplug.Device,
		listRow: number,
		visualIndex: number,
		isSelected: boolean,
		selectedIndex: number,
		list: KDScrollableListData)  => {

        let deviceSetting = KDButtplugDevices[KDGetButtplugDeviceId(listItem)];
        if (deviceSetting) {
            DrawTextFitKDTo(container, listItem.displayName || listItem.name, 
            listX + 25, listY + (visualIndex + 0.5) * rowSize, listW * 0.3, KDBaseWhite, 
            undefined, undefined, "left", undefined, undefined, undefined, 
            true, undefined, undefined, listItem.index + listItem.name);
            DrawTextFitKDTo(container, Math.round(deviceSetting.battery) + "%", 
            listX + widthBatt, listY + (visualIndex + 0.5) * rowSize, listW * 0.1, deviceSetting.battery < KDButtplugLowBattery ?
                KDBaseRed : (deviceSetting.battery > 100 - KDButtplugLowBattery ? KDBaseGreal : KDBaseWhite), 
            undefined, undefined, "left", undefined, undefined, undefined, 
            true, undefined, undefined, listItem.index + listItem.name + "Batt");


            catII = 0;
            if (numModes)
                for (let entry of Object.entries(KDVibeSounds)) {
                    DrawCheckboxKDExTo(container, KDGetButtplugDeviceId(listItem) + "checkbox_" + entry[0],
                        (bdata) => {
                            deviceSetting["Enabled_" + entry[0]] = !deviceSetting["Enabled_" + entry[0]];
                            localStorage.setItem("buttplug_" + KDGetButtplugDeviceId(listItem), JSON.stringify(deviceSetting));
                            return true;
                        }, true, 
                        listX + (listW - numModesLen) + numModesLen/numModes* catII - KDButtplugCheckSize/2, listY + (visualIndex + 0.5) * rowSize - KDButtplugCheckSize/2, 
                        KDButtplugCheckSize, KDButtplugCheckSize, "", deviceSetting["Enabled_" + entry[0]])
                    catII++;
                }
        }

        
		
		return false;
	}, undefined, false, undefined, undefined, 
    hotkeyUp, hotkeyDown);
}

let KDButtplugCheckSize = 64;

interface KDButtplugDeviceSettings {
    id: string,
    name: string,
    battery: number,
    on: boolean,
    strength: number,
    batteryWarning: boolean,
    Enabled_ItemButt?: boolean,
    Enabled_ItemVulva?: boolean,
    Enabled_ItemNipples?: boolean,
    pattern?: string,
}

let KDButtplugDevices: Record<string, KDButtplugDeviceSettings> = {};

function KDGetButtplugDeviceId(device: Buttplug.Device) {
    return device.index + device.name + device.displayName;
}

interface KDButtplugTrack {
    featureIndex: number,
    keyframes: {value: number, duration: number, easing?: string}[]

}

let KDVibeSoundsPatternMap: Record<string, ButtplugPatterns.PatternDescriptor> = {
};

KDVibeSoundsPatternMap["Default"] = {
    type: "custom",
    tracks: [
        {
            featureIndex: 0,
            keyframes: [
                { value: 0, duration: 0, easing: "step"},
                { value: 1, duration: 500, easing: "step"},
                { value: 0, duration: 500, easing: "step"},
            ],
        },
        {
            featureIndex: 1,
            keyframes: [
                { value: 1, duration: 0, easing: "step"},
                { value: 0, duration: 500, easing: "step"},
                { value: 1, duration: 500, easing: "step"},
            ],
        },
    ],
    loop: true
};
KDVibeSoundsPatternMap[KinkyDungeonRootDirectory + "Audio/Vibe1_Weak.ogg"] = {
    type: "custom",
    tracks: [
        {
            featureIndex: 0,
            keyframes: [
                { value: 0, duration: 0, easing: "step"},
                { value: 0.5, duration: 100, easing: "linear"},
                { value: 0.03, duration: 100, easing: "linear"},
                { value: 0.5, duration: 100, easing: "linear"},
                { value: 0.03, duration: 100, easing: "linear"},
                { value: 0.7, duration: 1000, easing: "linear"},
                { value: 0, duration: 100, easing: "linear"},
            ],
        },
        {
            featureIndex: 1,
            keyframes: [
                { value: 0, duration: 0, easing: "step"},
                { value: 0.5, duration: 100, easing: "linear"},
                { value: 0.03, duration: 100, easing: "linear"},
                { value: 0.5, duration: 100, easing: "linear"},
                { value: 0.03, duration: 100, easing: "linear"},
                { value: 0.7, duration: 1000, easing: "linear"},
                { value: 0, duration: 100, easing: "linear"},
            ],
        },
    ],
    loop: true
};

KDVibeSoundsPatternMap[KinkyDungeonRootDirectory + "Audio/Vibe1_Strong.ogg"] = {
    type: "custom",
    tracks: [
        {
            featureIndex: 0,
            keyframes: [
                { value: 0, duration: 0, easing: "step"},
                { value: 1, duration: 100, easing: "linear"},
                { value: 0.1, duration: 100, easing: "linear"},
                { value: 1, duration: 100, easing: "linear"},
                { value: 0.1, duration: 100, easing: "linear"},
                { value: 1, duration: 100, easing: "linear"},
                { value: 1, duration: 900},
                { value: 0, duration: 100, easing: "linear"},
            ],
        },
        {
            featureIndex: 1,
            keyframes: [
                { value: 0, duration: 0, easing: "step"},
                { value: 1, duration: 100, easing: "linear"},
                { value: 0.1, duration: 100, easing: "linear"},
                { value: 1, duration: 100, easing: "linear"},
                { value: 0.1, duration: 100, easing: "linear"},
                { value: 1, duration: 100, easing: "linear"},
                { value: 1, duration: 900},
                { value: 0, duration: 100, easing: "linear"},
            ],
        },
    ],
    loop: true
};
KDVibeSoundsPatternMap[KinkyDungeonRootDirectory + "Audio/Vibe1_Medium.ogg"] = {
    type: "custom",
    tracks: [
        {
            featureIndex: 0,
            keyframes: [
                { value: 0, duration: 0, easing: "step"},
                { value: 0.95, duration: 100, easing: "linear"},
                { value: 0.1, duration: 100, easing: "linear"},
                { value: 0.95, duration: 100, easing: "linear"},
                { value: 0.1, duration: 100, easing: "linear"},
                { value: 0.6, duration: 100, easing: "linear"},
                { value: 0.6, duration: 900},
                { value: 0, duration: 100, easing: "linear"},
            ],
        },
        {
            featureIndex: 1,
            keyframes: [
                { value: 0, duration: 0, easing: "step"},
                { value: 0.95, duration: 100, easing: "linear"},
                { value: 0.1, duration: 100, easing: "linear"},
                { value: 0.95, duration: 100, easing: "linear"},
                { value: 0.1, duration: 100, easing: "linear"},
                { value: 0.6, duration: 100, easing: "linear"},
                { value: 0.6, duration: 900},
                { value: 0, duration: 100, easing: "linear"},
            ],
        },
    ],
    loop: true
};
KDVibeSoundsPatternMap[KinkyDungeonRootDirectory + "Audio/Vibe2_Weak.ogg"] = {
    type: "custom",
    tracks: [
        {
            featureIndex: 0,
            keyframes: [
                { value: 0, duration: 100*1, easing: "step"},
                { value: 0.35, duration: 160*1, easing: "linear"},
                { value: 0.35, duration: 938*1, easing: "step"},
                { value: 0, duration: 100*1, easing: "linear"},
                { value: 0, duration: 200*1, easing: "step"},
            ],
        },
        {
            featureIndex: 1,
            keyframes: [
                { value: 0, duration: 100*1, easing: "step"},
                { value: 0.35, duration: 160*1, easing: "linear"},
                { value: 0.35, duration: 938*1, easing: "step"},
                { value: 0, duration: 100*1, easing: "linear"},
                { value: 0, duration: 200*1, easing: "step"},
            ],
        },
    ],
    loop: true
};
KDVibeSoundsPatternMap[KinkyDungeonRootDirectory + "Audio/Vibe2_Medium.ogg"] = {
    type: "custom",
    tracks: [
        {
            featureIndex: 0,
            keyframes: [
                { value: 0, duration: 100, easing: "step"},
                { value: 0.65, duration: 150, easing: "linear"},
                { value: 0.65, duration: 1000, easing: "step"},
                { value: 0, duration: 600, easing: "step"},
            ],
        },
        {
            featureIndex: 1,
            keyframes: [
                { value: 0, duration: 100, easing: "step"},
                { value: 0.65, duration: 150, easing: "linear"},
                { value: 0.65, duration: 1000, easing: "step"},
                { value: 0, duration: 600, easing: "step"},
            ],
        },
    ],
    loop: true
};
KDVibeSoundsPatternMap[KinkyDungeonRootDirectory + "Audio/Vibe2_Strong.ogg"] = {
    type: "custom",
    tracks: [
        {
            featureIndex: 0,
            keyframes: [
                { value: 0, duration: 0, easing: "step"},
                { value: 1, duration: Math.round(200*.86), easing: "linear"},
                { value: 1, duration: Math.round(1000*.86), easing: "step"},
                { value: 0, duration: Math.round(100*.86), easing: "step"},
            ],
        },
        {
            featureIndex: 1,
            keyframes: [
                { value: 0, duration: 0, easing: "step"},
                { value: 1, duration: Math.round(200*.86), easing: "linear"},
                { value: 1, duration: Math.round(1000*.86), easing: "step"},
                { value: 0, duration: Math.round(100*.86), easing: "step"},
            ],
        },
    ],
    loop: true
};

KDVibeSoundsPatternMap[KinkyDungeonRootDirectory + "Audio/Vibe3_Strong.ogg"] = {
    type: "custom",
    tracks: [
        {
            featureIndex: 0,
            keyframes: [
                { value: 0, duration: Math.round(330 * .86), easing: "step"},
                { value: 1, duration: Math.round(220 * .86), easing: "step"},
                { value: 0, duration: Math.round(150 * .86), easing: "step"},
                { value: 0, duration: Math.round(400 * .86), easing: "step"},
                { value: 0, duration: Math.round(160 * .86), easing: "step"},
                { value: 1, duration: Math.round(520 * .86), easing: "step"},
                { value: 0, duration: Math.round(100 * .86), easing: "step"},
            ],
        },
        {
            featureIndex: 1,
            keyframes: [
                { value: 0, duration: Math.round(330 * .86), easing: "step"},
                { value: 0, duration: Math.round(220 * .86), easing: "step"},
                { value: 0, duration: Math.round(150 * .86), easing: "step"},
                { value: 1, duration: Math.round(400 * .86), easing: "step"},
                { value: 0, duration: Math.round(160 * .86), easing: "step"},
                { value: 1, duration: Math.round(520 * .86), easing: "step"},
                { value: 0, duration: Math.round(100 * .86), easing: "step"},
            ],
        },
    ],
    loop: true
};


KDVibeSoundsPatternMap[KinkyDungeonRootDirectory + "Audio/Vibe3_Medium.ogg"] = {
    type: "custom",
    tracks: [
        {
            featureIndex: 0,
            keyframes: [
                { value: 0, duration: 400, easing: "step"},
                { value: 1, duration: 400, easing: "step"},
                { value: 0, duration: 850, easing: "step"},
                { value: 0, duration: 400, easing: "step"},
                { value: 0, duration: 450, easing: "step"},
            ],
        },
        {
            featureIndex: 1,
            keyframes: [
                { value: 0, duration: 400, easing: "step"},
                { value: 0, duration: 400, easing: "step"},
                { value: 0, duration: 850, easing: "step"},
                { value: 1, duration: 400, easing: "step"},
                { value: 0, duration: 450, easing: "step"},
            ],
        },
    ],
    loop: true
};

KDVibeSoundsPatternMap[KinkyDungeonRootDirectory + "Audio/Vibe3_Weak.ogg"] = {
    type: "custom",
    tracks: [
        {
            featureIndex: 0,
            keyframes: [
                { value: 0.0, duration: 140, easing: "step"},
                { value: 1, duration: 800, easing: "step"},
                { value: 0.0, duration: 860, easing: "step"},
                { value: 0.0, duration: 140, easing: "step"},
                { value: 0, duration: 800, easing: "step"},
                { value: 0.0, duration: 860, easing: "step"},
            ],
        },
        {
            featureIndex: 1,
            keyframes: [
                { value: 0.0, duration: 140, easing: "step"},
                { value: 0, duration: 800, easing: "step"},
                { value: 0.0, duration: 860, easing: "step"},
                { value: 0.0, duration: 140, easing: "step"},
                { value: 1, duration: 800, easing: "step"},
                { value: 0.0, duration: 860, easing: "step"},
            ],
        },
    ],
    loop: true
};