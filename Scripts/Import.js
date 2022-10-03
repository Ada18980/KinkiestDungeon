"use strict";
var ImportBondageCollegeData = false;

/**
 * Import the inventory from the Bondage College. Items to import were saved in localstorage previously.
 * @param {Character} C - Character for which to import items to
 * @returns - Nothing
 */
function ImportBondageCollege(C) {

	// If the user specified that he wanted to import
	if (ImportBondageCollegeData) {

		// If we come from the Bondage College, we translate the items from the college to the club
		if ((localStorage.getItem("BondageClubImportSource") != null) && (localStorage.getItem("BondageClubImportSource") == "BondageCollege")) {

			// Imports the player lover and owner
			LogAdd("BondageCollege", "Import");
			if ((localStorage.getItem("BondageCollegeExportOwner") != null) && (localStorage.getItem("BondageCollegeExportOwner") != "")) C.Owner = "NPC-" + localStorage.getItem("BondageCollegeExportOwner");
			if ((localStorage.getItem("BondageCollegeExportLover") != null) && (localStorage.getItem("BondageCollegeExportLover") != "")) C.Lover = "NPC-" + localStorage.getItem("BondageCollegeExportLover");

			// Imports the 4 main character status
			if ((localStorage.getItem("BondageClubImportSource") != null) && (localStorage.getItem("BondageClubImportSource") == "BondageCollege")) {
				if ((localStorage.getItem("BondageCollegeExportAmanda") != null) && (localStorage.getItem("BondageCollegeExportAmanda") != "")) LogAdd(localStorage.getItem("BondageCollegeExportAmanda"), "NPC-Amanda");
				if ((localStorage.getItem("BondageCollegeExportSarah") != null) && (localStorage.getItem("BondageCollegeExportSarah") != "")) LogAdd(localStorage.getItem("BondageCollegeExportSarah"), "NPC-Sarah");
				if ((localStorage.getItem("BondageCollegeExportSidney") != null) && (localStorage.getItem("BondageCollegeExportSidney") != "")) LogAdd(localStorage.getItem("BondageCollegeExportSidney"), "NPC-Sidney");
				if ((localStorage.getItem("BondageCollegeExportJennifer") != null) && (localStorage.getItem("BondageCollegeExportJennifer") != "")) LogAdd(localStorage.getItem("BondageCollegeExportJennifer"), "NPC-Jennifer");
				if ((localStorage.getItem("BondageCollegeExportAmandaSarah") != null) && (localStorage.getItem("BondageCollegeExportAmandaSarah") != "")) LogAdd(localStorage.getItem("BondageCollegeExportAmandaSarah"), "NPC-AmandaSarah");
				if ((localStorage.getItem("BondageCollegeExportSarahIntro") != null) && (localStorage.getItem("BondageCollegeExportSarahIntro") != "")) LogAdd(localStorage.getItem("BondageCollegeExportSarahIntro"), "NPC-SarahIntro");
			}

			// Imports every inventory items
			InventoryAdd(C, "CollegeOutfit1", "Cloth");
			InventoryAdd(C, "CollegeSkirt", "ClothLower");
			if ((localStorage.getItem("BondageCollegeExportBallGag") != null) && (localStorage.getItem("BondageCollegeExportBallGag") == "true")) InventoryAdd(C, "HarnessBallGag", "ItemMouth", false);
			if ((localStorage.getItem("BondageCollegeExportClothGag") != null) && (localStorage.getItem("BondageCollegeExportClothGag") == "true")) InventoryAdd(C, "ClothGag", "ItemMouth", false);
			if ((localStorage.getItem("BondageCollegeExportTapeGag") != null) && (localStorage.getItem("BondageCollegeExportTapeGag") == "true")) InventoryAdd(C, "DuctTape", "ItemFeet", false);
			if ((localStorage.getItem("BondageCollegeExportTapeGag") != null) && (localStorage.getItem("BondageCollegeExportTapeGag") == "true")) InventoryAdd(C, "DuctTape", "ItemLegs", false);
			if ((localStorage.getItem("BondageCollegeExportTapeGag") != null) && (localStorage.getItem("BondageCollegeExportTapeGag") == "true")) InventoryAdd(C, "DuctTape", "ItemArms", false);
			if ((localStorage.getItem("BondageCollegeExportTapeGag") != null) && (localStorage.getItem("BondageCollegeExportTapeGag") == "true")) InventoryAdd(C, "DuctTape", "ItemMouth", false);
			if ((localStorage.getItem("BondageCollegeExportTapeGag") != null) && (localStorage.getItem("BondageCollegeExportTapeGag") == "true")) InventoryAdd(C, "DuctTape", "ItemHead", false);
			if ((localStorage.getItem("BondageCollegeExportRope") != null) && (localStorage.getItem("BondageCollegeExportRope") == "true")) InventoryAdd(C, "HempRope", "ItemArms", false);
			if ((localStorage.getItem("BondageCollegeExportRope") != null) && (localStorage.getItem("BondageCollegeExportRope") == "true")) InventoryAdd(C, "HempRope", "ItemLegs", false);
			if ((localStorage.getItem("BondageCollegeExportRope") != null) && (localStorage.getItem("BondageCollegeExportRope") == "true")) InventoryAdd(C, "HempRope", "ItemFeet", false);
			if ((localStorage.getItem("BondageCollegeExportCuffs") != null) && (localStorage.getItem("BondageCollegeExportCuffs") == "true")) InventoryAdd(C, "MetalCuffs", "ItemArms", false);
			if ((localStorage.getItem("BondageCollegeExportArmbinder") != null) && (localStorage.getItem("BondageCollegeExportArmbinder") == "true")) InventoryAdd(C, "LeatherArmbinder", "ItemArms", false);
			if ((localStorage.getItem("BondageCollegeExportChastityBelt") != null) && (localStorage.getItem("BondageCollegeExportChastityBelt") == "true")) InventoryAdd(C, "MetalChastityBelt", "ItemPelvis", false);
			if ((localStorage.getItem("BondageCollegeExportCollar") != null) && (localStorage.getItem("BondageCollegeExportCollar") == "true")) InventoryAdd(C, "LeatherCollar", "ItemNeck", false);
			if ((localStorage.getItem("BondageCollegeExportCrop") != null) && (localStorage.getItem("BondageCollegeExportCrop") == "true")) InventoryAdd(C, "SpankingToysCrop", "ItemHands", false);
			if ((localStorage.getItem("BondageCollegeExportCuffsKey") != null) && (localStorage.getItem("BondageCollegeExportCuffsKey") == "true")) InventoryAdd(C, "MetalCuffsKey", "ItemArms", false);
			if ((localStorage.getItem("BondageCollegeExportSleepingPill") != null) && (localStorage.getItem("BondageCollegeExportSleepingPill") == "true")) InventoryAdd(C, "RegularSleepingPill", "ItemMouth", false);
			if ((localStorage.getItem("BondageCollegeExportVibratingEgg") != null) && (localStorage.getItem("BondageCollegeExportVibratingEgg") == "true")) InventoryAdd(C, "VibratingEgg", "ItemVulva", false);

			// Imports the locked items
			if ((localStorage.getItem("BondageCollegeExportLockedChastityBelt") != null) && (localStorage.getItem("BondageCollegeExportLockedChastityBelt") == "true")) {
				DialogWearItem("MetalChastityBelt", "ItemPelvis");
				InventoryLock(Player, "ItemPelvis", "MistressPadlock", -1);
			}
			if ((localStorage.getItem("BondageCollegeExportLockedCollar") != null) && (localStorage.getItem("BondageCollegeExportLockedCollar") == "true")) DialogWearItem("SlaveCollar", "ItemNeck");
			if ((localStorage.getItem("BondageCollegeExportLockedVibratingEgg") != null) && (localStorage.getItem("BondageCollegeExportLockedVibratingEgg") == "true")) DialogWearItem("VibratingEgg", "ItemVulva");

			// Sync with the server
			ServerPlayerSync();
			ServerPlayerInventorySync();
			SarahSetStatus();

		}

	}

}
