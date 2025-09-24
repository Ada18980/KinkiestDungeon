


let MeshWarps: {[_: string]: MeshWarp} = {
	
	Saddled: {
		LayerGroups: {"PantLeft": "Mesh1"},
		filter_pose: ["Kneel", "KneelClosed"],
		intensityFunction: (C, MC, data) => {return 1;},
		pri_basic: 5,
		BasicMesh: {
			Mesh1: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			

			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			

			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			

			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			

			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			

			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			



			20,
			30,
			20,
			30,
			20,
			30,
			20,
			30,
			20,
			30,
			20,
			30,
			20,
			30,
			20,
			30,
			20,
			30,
			20,
			30,
			


			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			30,
			


			60,
			40,
			60,
			40,
			60,
			40,
			60,
			40,
			60,
			40,
			60,
			40,
			60,
			40,
			60,
			40,
			60,
			40,
			60,
			40,
			

			80,
			50,
			80,
			50,
			80,
			50,
			80,
			50,
			80,
			50,
			80,
			50,
			80,
			50,
			80,
			50,
			80,
			50,
			80,
			50,
			

		]
		}
	},
};



/**
 * Get the warp from the meshwarp array with the highest value of checkvar
 */
function ModelGetMaxMeshWarp(Poses: {[_: string]: boolean}, SG: string, CheckVar: string, FilterVar: string | null = null): string {
	let maxPose = "";
	for (let p of Object.keys(Poses)) {
		if (MeshWarps[p]?.LayerGroups[SG] && MeshWarps[p][CheckVar] != undefined
			&& (!MeshWarps[p].filter_pose || MeshWarps[p].filter_pose.some((pose) => {return Poses[pose];}))
			&& (!FilterVar || MeshWarps[p][FilterVar])
			&& (!maxPose || MeshWarps[p][CheckVar] > MeshWarps[maxPose][CheckVar])
		) {
			maxPose = p;
		}
	}
	return maxPose;
}
