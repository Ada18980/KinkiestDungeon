/**
* Gets the current item / cloth worn a specific area (AssetGroup)
* @param C - The character on which we must check the appearance
* @param AssetGroup - The name of the asset group to scan
* @returns Returns the appearance which is the item / cloth asset, color and properties
*/
function InventoryGet(C: Character, AssetGroup: string): Item | null {
	for (let A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Family == C.AssetFamily) && (C.Appearance[A].Asset.Group.Name == AssetGroup))
			return C.Appearance[A];
	return null;
}
