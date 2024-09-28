
let KDExpressions: Record<string, KDExpression> = {
	"RestrainedImmediate": {
		priority: 7,
		criteria: (C, flags) => {
			if (flags.get("restrained")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushHigh",
				MouthPose: "MouthSurprised",
			};
		},
	},
	"RestrainedRecent": {
		priority: 1.5,
		criteria: (C, flags) => {
			if (flags.get("restrained_recently")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushMedium",
				MouthPose: "MouthPout",
			};
		},
	},
	"Slimed": {
		priority: 1.7,
		criteria: (C, flags) => {
			if (flags.get("slimed")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesDazed",
				Eyes2Pose: "Eyes2Dazed",
				BrowsPose: "BrowsAnnoyed",
				Brows2Pose: "Brows2Annoyed",
				BlushPose: "",
				MouthPose: "MouthDazed",
			};
		},
	},
	"OrgSuccess": {
		priority: 14,
		criteria: (C, flags) => {
			if (flags.get("OrgSuccess")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesSurprised",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsSurprised",
				Brows2Pose: "Brows2Surprised",
				BlushPose: "BlushExtreme",
				MouthPose: "MouthDazed",
			};
		},
	},
	"OrgEdged": {
		priority: 8,
		criteria: (C, flags) => {
			if (flags.get("OrgEdged")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesAngry",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsAnnoyed",
				Brows2Pose: "Brows2Annoyed",
				BlushPose: "BlushExtreme",
				MouthPose: "MouthDazed",
			};
		},
	},
	"HeadpatSub": {
		priority: 13,
		criteria: (C, flags) => {
			if (
				(
					((C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Ghost > 15)
					|| (KDNPCChar_ID.get(C)
						&& KinkyDungeonFindID(KDNPCChar_ID.get(C))
						&& KDLoosePersonalities.includes(KinkyDungeonFindID(KDNPCChar_ID.get(C)).personality)))
					&& flags.get("headpat"))
				|| flags.get("soft")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesClosed",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsAngry",
				Brows2Pose: "Brows2Angry",
				BlushPose: "BlushExtreme",
				MouthPose: "MouthSmile",
			};
		},
	},
	"Psychic": {
		priority: 3,
		criteria: (C, flags) => {
			if (flags.get("psychic")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesDazed",
				Eyes2Pose: "Eyes2Dazed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "MouthDazed",
			};
		},
	},
	"HeadpatDom": {
		priority: 12,
		criteria: (C, flags) => {
			if (
				((C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Ghost < -30)
					|| (KDNPCChar_ID.get(C)
						&& KinkyDungeonFindID(KDNPCChar_ID.get(C))
						&& KDStrictPersonalities.includes(KinkyDungeonFindID(KDNPCChar_ID.get(C)).personality)))
				&& flags.get("headpat")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesAngry",
				Eyes2Pose: "Eyes2Angry",
				BrowsPose: "BrowsAngry",
				Brows2Pose: "Brows2Angry",
				BlushPose: "",
				MouthPose: "MouthFrown",
			};
		},
	},
	"Headpat": {
		priority: 12,
		criteria: (C, flags) => {
			if (
				((C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Ghost <= 15 && KinkyDungeonGoddessRep.Ghost >= -30)
					|| (KDNPCChar_ID.get(C)
						&& KinkyDungeonFindID(KDNPCChar_ID.get(C))
						&& !KDStrictPersonalities.includes(KinkyDungeonFindID(KDNPCChar_ID.get(C)).personality)))
				&& flags.get("headpat") ) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "",
				Brows2Pose: "Brows2Angry",
				BlushPose: "BlushHigh",
				MouthPose: "MouthPout",
			};
		},
	},
	"Spank": {
		priority: 14,
		criteria: (C, flags) => {
			if (flags.get("spank")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesSurprised",
				Eyes2Pose: "Eyes2Surprised",
				BrowsPose: "BrowsSurprised",
				Brows2Pose: "Brows2Surprised",
				BlushPose: "",
				MouthPose: "MouthSurprised",
			};
		},
	},
	"Grope": {
		priority: 4,
		criteria: (C, flags) => {
			if (flags.get("grope")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesSurprised",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsSurprised",
				Brows2Pose: "Brows2Surprised",
				BlushPose: "BlushMedium",
				MouthPose: "",
			};
		},
	},
	"Insert": {
		priority: 17,
		criteria: (C, flags) => {
			if (flags.get("insert")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesSurprised",
				Eyes2Pose: "Eyes2Surprised",
				BrowsPose: "",
				Brows2Pose: "Brows2Surprised",
				BlushPose: "BlushExtreme",
				MouthPose: "MouthEmbarrassed",
			};
		},
	},
	"Stuffed": {
		priority: 10,
		criteria: (C, flags) => {
			if (flags.get("stuff")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesClosed",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "Brows2Surprised",
				BlushPose: "BlushHigh",
				MouthPose: "MouthSurprised",
			};
		},
	},
	"Tickle": {
		priority: 9,
		criteria: (C, flags) => {
			if (flags.get("tickle")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesClosed",
				Eyes2Pose: "Eyes2Surprised",
				BrowsPose: "BrowsAnnoyed",
				Brows2Pose: "Brows2Surprised",
				BlushPose: "",
				MouthPose: "MouthEmbarrassed",
			};
		},
	},
	"Pain": {
		priority: 4,
		criteria: (C, flags) => {
			if (flags.get("pain")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesAngry",
				Eyes2Pose: "Eyes2Angry",
				BrowsPose: "BrowsAnnoyed",
				Brows2Pose: "Brows2Annoyed",
				BlushPose: "",
				MouthPose: "MouthDazed",
			};
		},
	},


	"OrgDenied": {
		priority: 8,
		criteria: (C, flags) => {
			if (flags.get("OrgDenied")) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesSurprised",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsAngry",
				Brows2Pose: "Brows2Angry",
				BlushPose: "BlushExtreme",
				MouthPose: "MouthEmbarrassed",
			};
		},
	},
	"DenialPassion": {
		priority: 9,
		criteria: (C, flags) => {
			if ((flags.get("OrgDenied") || flags.get("OrgEdged")) &&
				(C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Passion > 10)) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesSurprised",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsSad",
				Brows2Pose: "Brows2Sad",
				BlushPose: "BlushExtreme",
				MouthPose: KinkyDungeonGoddessRep.Ghost > 0 ? "MouthSmile" : "MouthEmbarrassed",
			};
		},
	},
	"PlayWithSelf": {
		priority: 12,
		criteria: (C, flags) => {
			if ((flags.get("PlayWithSelf"))) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: flags.get("VibeContinued") ? "EyesDazed" : "EyesNeutral",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsNeutral",
				Brows2Pose: "Brows2Neutral",
				BlushPose: "BlushHigh",
				MouthPose: KinkyDungeonGoddessRep.Ghost > 0 ? "MouthSmile" : "MouthPout",
			};
		},
	},
	"VibeStart": {
		priority: 6,
		criteria: (C, flags) => {
			if ((flags.get("VibeStarted") || flags.get("VibeContinued"))) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: flags.get("VibeContinued") ? "EyesDazed" : "EyesNeutral",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "BrowsSad",
				Brows2Pose: "Brows2Sad",
				BlushPose: "BlushHigh",
				MouthPose: "MouthDazed",
			};
		},
	},
	"Grabbed": {
		priority: 27,
		criteria: (C, flags) => {
			let entity = KDGetCharacterEntity(C);
			if (entity && !entity.player) return KinkyDungeonIsDisabled(entity);
			if ((flags.get("grabbed"))) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesSurprised",
				Eyes2Pose: "Eyes2Surprised",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "",
			};
		},
	},
	"Vibing": {
		stackable: true,
		priority: 2,
		criteria: (C, flags) => {
			let entity = KDGetCharacterEntity(C);
			if (entity && !entity.player) return KDEntityBuffedStat(entity, "Vibration") > 0;
			if (C == KinkyDungeonPlayer && KinkyDungeonVibeLevel > 0) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.5) ? "EyesAngry" : "",
				Eyes2Pose: (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.5) ? "Eyes2Angry" : "",
				BrowsPose: "BrowsNeutral",
				Brows2Pose: "Brows2Neutral",
				BlushPose: (KinkyDungeonVibeLevel > 2 || KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.5) ? "BlushMedium" : "BlushHigh",
				MouthPose: "MouthDazed",
			};
		},
	},
	"Distracted": {
		stackable: true,
		priority: 1,
		criteria: (C, flags) => {
			if (flags.get("blush")) return true;
			let entity = KDGetCharacterEntity(C);
			if (entity && !entity.player) return entity.distraction > 0.0 * entity.Enemy.maxhp && entity.distraction < 0.9 * entity.Enemy.maxhp;
			if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.1) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax*0.4) ? "BlushLow" : "BlushMedium",
				MouthPose: "",
			};
		},
	},
	"Tired": {
		stackable: true,
		priority: 1,
		criteria: (C, flags) => {
			let entity = KDGetCharacterEntity(C);
			if (entity && !entity.player) return entity.hp > 0.5 * entity.Enemy.maxhp;
			if (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax * 0.5) {
				return true;
			}
			return false;
		},
		expression: (C, flags) => {
			return {
				EyesPose: (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax * 0.25) ? "EyesClosed" : "EyesDazed",
				Eyes2Pose: (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax * 0.25) ? "Eyes2Closed" : "Eyes2Dazed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "",
			};
		},
	},
	"Edged": {
		stackable: true,
		priority: 6,
		criteria: (C, flags) => {
			let entity = KDGetCharacterEntity(C);
			if (entity && !entity.player) return entity.distraction > 0.9 * entity.Enemy.maxhp;
			return (C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Frustration > 0 && KDIsEdged(C));
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesDazed",
				Eyes2Pose: "Eyes2Dazed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "",
			};
		},
	},
	"Tormented": {
		stackable: true,
		priority: 7,
		criteria: (C, flags) => {
			return (C == KinkyDungeonPlayer && KDIsEdged(C) && KinkyDungeonVibeLevel > 2);
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesDazed",
				Eyes2Pose: "Eyes2Dazed",
				BrowsPose: "BrowsSad",
				Brows2Pose: "Brows2Sad",
				BlushPose: "BlushExtreme",
				MouthPose: "",
			};
		},
	},
	"Frustrated": {
		stackable: true,
		priority: 2.25,
		criteria: (C, flags) => {
			return C == KinkyDungeonPlayer && (KinkyDungeonGoddessRep.Frustration > -20 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.25) || flags.get("escapeimpossible") > 0;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: KinkyDungeonGoddessRep.Frustration > 0 ? "BrowsAngry" : "BrowsSad",
				Brows2Pose: KinkyDungeonGoddessRep.Frustration > 0 ? "Brows2Angry" : "Brows2Sad",
				BlushPose: "",
				MouthPose: "",
			};
		},
	},
	"Struggling": {
		stackable: true,
		priority: 14,
		criteria: (C, flags) => {
			let entity = KDGetCharacterEntity(C);
			if (entity && !entity.player) return KDBoundEffects(entity) > 0;
			return flags.get("escaping") > 0;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushHigh",
				MouthPose: "MouthPout",
			};
		},
	},
	"StrugglingLight": {
		stackable: true,
		priority: 6,
		criteria: (C, flags) => {
			let entity = KDGetCharacterEntity(C);
			if (entity && !entity.player) return entity.boundLevel > 0 && KDBoundEffects(entity) < 1;
			return flags.get("tryescaping") > 0;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "MouthPout",
			};
		},
	},
	"Picking": {
		stackable: true,
		priority: 13,
		criteria: (C, flags) => {
			return flags.get("picking") > 0;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesClosed",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "MouthPout",
			};
		},
	},
	"Unlocking": {
		stackable: true,
		priority: 12,
		criteria: (C, flags) => {
			return flags.get("unlocking") > 0;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesClosed",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "MouthEmbarrassed",
			};
		},
	},
	"Escaped": {
		stackable: true,
		priority: 20,
		criteria: (C, flags) => {
			return flags.get("escaped") > 0;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesNeutral",
				Eyes2Pose: "Eyes2Neutral",
				BrowsPose: "BrowsAngry",
				Brows2Pose: "Brows2Angry",
				BlushPose: "",
				MouthPose: "MouthSmile",
			};
		},
	},
	"FrustratedMouth": {
		stackable: true,
		priority: 0.25,
		criteria: (C, flags) => {
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Frustration - KinkyDungeonGoddessRep.Passion > -25 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.25;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "MouthFrown",
			};
		},
	},
	"Passionate": {
		stackable: true,
		priority: 2.2,
		criteria: (C, flags) => {
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Passion - KinkyDungeonGoddessRep.Frustration > -5 && KinkyDungeonGoddessRep.Passion > -30 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.25;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: KinkyDungeonGoddessRep.Passion - KinkyDungeonGoddessRep.Frustration > 25 ? "MouthSmile" : (KinkyDungeonGoddessRep.Passion - KinkyDungeonGoddessRep.Frustration > -25 ? "MouthEmbarrassed" : "MouthPout"),
			};
		},
	},
	"PassionateBlush1": {
		stackable: true,
		priority: 2.3,
		criteria: (C, flags) => {
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Passion > -40 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.25;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushLow",
				MouthPose: "",
			};
		},
	},
	"PassionateBlush2": {
		stackable: true,
		priority: 4,
		criteria: (C, flags) => {
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Passion > -10 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.5;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushMedium",
				MouthPose: "",
			};
		},
	},
	"PassionateBlush3": {
		stackable: true,
		priority: 7,
		criteria: (C, flags) => {
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Passion > 20 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.75;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushHigh",
				MouthPose: "MouthDistracted",
			};
		},
	},
	"PassionateBlush4": {
		stackable: true,
		priority: 10,
		criteria: (C, flags) => {
			return C == KinkyDungeonPlayer && KinkyDungeonGoddessRep.Passion > 40 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.5;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "",
				Eyes2Pose: "",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "BlushExtreme",
				MouthPose: "MouthDistracted",
			};
		},
	},
	"Neutral": {
		stackable: true,
		priority: 0.1,
		criteria: (C, flags) => {
			return true;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesNeutral",
				Eyes2Pose: "Eyes2Neutral",
				BrowsPose: "BrowsNeutral",
				Brows2Pose: "Brows2Neutral",
				BlushPose: "BlushNone",
				MouthPose: "MouthNeutral",
			};
		},
	},
	"Sleepy": {
		stackable: true,
		priority: 11,
		criteria: (C, flags) => {
			return C == KinkyDungeonPlayer && KinkyDungeonSleepiness > 3.99;
		},
		expression: (C, flags) => {
			return {
				EyesPose: "EyesClosed",
				Eyes2Pose: "Eyes2Closed",
				BrowsPose: "",
				Brows2Pose: "",
				BlushPose: "",
				MouthPose: "",
			};
		},
	},
};