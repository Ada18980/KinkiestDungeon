"use strict";

function KDMurderShopkeeper(count: number) {
	if (KDGameData.ShopkeepersMurdered == undefined) {
		KDGameData.ShopkeepersMurdered = 0;
	}
	KDGameData.ShopkeepersMurdered += count;
}