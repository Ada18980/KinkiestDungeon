
let KDButtplugClient: Buttplug.ButtplugClient = null;
let KDButtplugDefaultAddress = "ws://127.0.0.1:12345";
let KDButtplugServer: string = KDButtplugDefaultAddress;

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
        });

        

        KDButtplugClient.on("device.added", async ({ data: { device } }) => {
            console.log(`Found: ${device.displayName ?? device.name}`);

            if (device.canOutput("Vibrate")) {
                await device.vibrate(0.5);
                setTimeout(() => device.stop(), 2000);
                KDButtplugDevices[device.name] = {};
                KDSendMusicToast(TextGet("KDButtplugFoundDevice") + device.displayName);
                
            }
        });

        KDButtplugClient.on("connection.disconnected", ({ data: { reason } }) => {
            console.log("Disconnected:", reason ?? "unknown");
            if (reason != "TurnOff")
                KDSendMusicToast(TextGet("KDButtplugDisconnected") + reason);
        });

        KDButtplugClient.on("connection.reconnected", () => {
            console.log("Back online; device list will refresh");
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
        KDButtplugDevices = {};
	}
}

// Make sure buttplug disconnects when you end the game
window.addEventListener("beforeunload", (ev) => {
	KDEndButtplug();
})

KDCustomToggleTab.Buttplug = KDDrawButtplugTab;

function KDRunButtplug() {
    if (!KDButtplugClient?.connected) {
        KDButtplugDevices = {};
    }
}

function KDDrawButtplugTab(centerX?: number) {
    if (centerX == undefined) {
        centerX = 500 + (PIXIWidth - 500)/2;
    }
    DrawTextFitKD(TextGet("KDButtplugInfo"), 
    centerX, 140, 1200, KDBaseWhite, undefined, undefined, "center");

    let TF = KDTextField("KDButtplugAddress", centerX - 200, 220, 400, 40);
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
    DrawTextFitKD(TextGet(KDButtplugClient?.connected ? "KDConnected" : "KDNotConnected"), 
    centerX, 285, 1200, KDBaseWhite, undefined, undefined, "center");


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


}

let KDButtplugDevices = {};