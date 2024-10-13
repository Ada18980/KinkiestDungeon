
let KDCollQuickFacSpacing = 90;
let KDCollQuickFacSize = KDCollQuickFacSpacing - 10;

KDCollectionTabDraw.FacilityQuick = (value, buttonSpacing, III, x, y) => {

	let listRender = Object.entries(KDFacilityTypes).filter((entry) => {
		return entry[1].prereq();
	});

	let quikSize = KDCollQuickFacSize;
	let quikSpacing = KDCollQuickFacSpacing;
	let quikCols = 450 / quikSpacing;
	let quickStartingCol = -Math.ceil(listRender.length / quikCols);

	let XX = 0;
	let YY = 0;

	let ii = 0;



	for (let fac of listRender) {
		let assigned = value.Facility == fac[0];
		let valid = KDCurrentFacilityCollectionType.some((type) => {
			return KDFacilityCollectionDataTypeMap[type] == value.status;
		}) && KDCurrentFacilityCollectionType.some((type) => {
			return KDValidateServant(value, fac[0], type);
		});


		let collType = valid ? KDCurrentFacilityCollectionType.find((type) => {
			return KDFacilityCollectionDataTypeMap[type] == value.status;
		}) : "";


		let allowed = false;
		if (KDGameData.Collection[value.id + ""] && fac[0]) {
			let dd = KDGameData.FacilitiesData[collType + "_" + fac[0]];
			let faci = KDFacilityTypes[fac[0]];
			if (dd && faci
				&& faci["max" + collType]
				&& (assigned
					||  dd.length < faci["max" + collType]()
				)) {
					allowed = true
				}
			}


		if (assigned) {
			KDDraw(kdcanvas, kdpixisprites, "facXQuikAssign" + fac[0],
				KinkyDungeonRootDirectory + `UI/Facility_${"X"}.png`,
				x + 10 + quikSpacing*XX, y + 730 - 10 + quikSpacing * (quickStartingCol + YY), quikSize, quikSize,
				undefined, {
					zIndex: 160,
				}
			);
		}
		if (DrawButtonKDEx("facQuickAssign" + fac[0], (b) => {
			if (!valid) return false;
			if (!allowed) return false;
			let oldFacility = value.Facility;

			if (oldFacility) {
				let listRender = Object.entries(KDFacilityTypes).filter((entry) => {
					return entry[1].prereq();
				});
				for (let f of listRender) {
					for (let dt of KDFacilityCollectionDataTypes) {
						let data: number[] = KDGameData.FacilitiesData[dt + "_" + f[0]];
						if (data?.includes(value.id)) {
							//delete value.Facility;
							data.splice(data.indexOf(value.id), 1);
							break;
						}
					}
				}
				// Failsafe
				delete value.Facility;
			}
			if (!assigned) {
				let data = KDGameData.FacilitiesData[collType + "_" + fac[0]];
				if (data && (!KDFacilityTypes[fac[0]].servantPrisonerCallback || KDFacilityTypes[fac[0]].servantPrisonerCallback(value.id))) {
					data.push(value.id);
					value.Facility = fac[0];
				}
			}

			KDValidateAllFacilities();


			return true;
		}, true, x + 10 + quikSpacing*XX++, y + 730 - 10 + quikSpacing * (quickStartingCol + YY), quikSize, quikSize,
		"", "#ffffff", KinkyDungeonRootDirectory + "UI/Facility/" + fac[0] + ".png",
		undefined, undefined, !allowed,
		KDButtonColor, undefined, undefined, {
			hotkey: ii < KinkyDungeonKeySpell.length ? KDHotkeyToText(KinkyDungeonKeySpell[ii]) : undefined,
			hotkeyPress: ii < KinkyDungeonKeySpell.length ? KinkyDungeonKeySpell[ii] : undefined,
			scaleImage: true,
			centered: true,
		})) {
			DrawTextFitKD(TextGet(`KDCollection${(!allowed) ? "Cant" : (assigned ? "Remove" : "Assign")}`) + TextGet("KDFacility_" + (assigned ? value.Facility : fac[0])),
				x + 220, y + 750, 500, "#ffffff", KDTextGray0);
		}
		ii++;

		if (XX >= quikCols) {
			YY++;
			XX = 0;
		}
	}


	KDCurrentFacilityCollectionType = ["Servants", "Prisoners"];

	return III;
};