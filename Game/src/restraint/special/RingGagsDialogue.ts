/**
 * RingGags open-mouth dialogue & noise — loaded after RingGags.ts
 * Implements: muffled→open speech, drool flavor, breath flavor, audible noise
 */
"use strict";

var RG_OPEN_MUMBLE = ["Aahh...","Haaahh...","Aaah...","Nnaahh...","Hahh...","Aahnn...","Haaah...","Aah...","Nnnh...","Haaahnn..."];
var RG_OPEN_MUMBLE_AROUSED = ["Aaahh~","Haahhh~","Aahnn~","Nnhaa~","Haahh~~","Aah~","Aahnn~~","Aahhh~~~","Haaahh~~","Nnnhaa~"];
var RG_OPEN_STRUGGLE = ["Aaagh!","Hnnaa!","Aaah!!","Nnaagh!","Haaah!"];
var RG_OPEN_STRUGGLE_QUIET = ["Aah.","Haa...","Nnh.","Ahh."];
var RG_OPEN_RESTRAINT = ["Aah!","Nnaah!","AAH!!","Haaah!"];
var RG_NOISE_RADII = {OPEN_MUMBLE:4,OPEN_MUMBLE_AROUSED:8,OPEN_STRUGGLE:6,OPEN_STRUGGLE_QUIET:2,OPEN_RESTRAINT:4};
var RG_NOISE_RADIUS = 4;
var RG_COLOR_START="#b0c4de", RG_COLOR_WIPE="#88ccaa", RG_COLOR_BOUND_T1="#d4a0b0", RG_COLOR_BOUND_T2="#d88898", RG_COLOR_BOUND_T3="#cc6680", RG_COLOR_BREATH="#a8c8d8";
var RG_MSG_DROOL_START_FIRST = [
	"Saliva begins pooling behind the ring in your mouth.",
	"Your mouth starts watering uncontrollably around the gag.",
	"You feel drool building up with nothing to stop it.",
	"The open ring keeps your lips from sealing — saliva has nowhere to go but out.",
];
var RG_MSG_DROOL_START_RECURRING = [
	"More drool escapes past the ring.","Saliva spills over your lip again.",
	"Another trail of drool slides down your chin.","The drooling hasn't stopped...",
	"Your chin is slick with drool again.","You try to swallow, but the ring holds your jaw open too wide.",
];
var RG_MSG_CYCLE_S2 = [
	"For a second you forgot about the drooling. The gag reminded you.",
	"The drool eased off just long enough to give you false hope.",
	"The drool had slowed for a moment. It's starting again.","Your chin was almost dry. Was.",
];
var RG_MSG_BOUND_TIER1 = [
	"Drool runs down your chin. Your hands can't reach.",
	"You feel it dripping but there's nothing you can do.",
	"Saliva trails down your neck. You can only endure it.",
	"The drool reaches your chest. Your bound arms are useless.",
	"You try to shake it off, but more just takes its place.",
];
var RG_MSG_BOUND_TIER2 = [
	"It's getting worse. Your chin is soaked and your arms won't budge.",
	"Your chin drips steadily now. Your arms strain but the restraints hold.",
	"You tilt your head trying to slow it. It doesn't help.",
	"You try pressing your tongue against the ring. It just makes it worse.",
	"You swallow what you can. The rest has nowhere to go but down.",
	"Another string of saliva escapes. Your bound hands clench uselessly.",
	"It's dripping onto your chest now.","The drool pools in the hollow of your collarbone.",
];
var RG_MSG_BOUND_TIER3 = [
	"Your neck glistens. At this point you've stopped trying.",
	"The drool is constant. You barely notice it anymore.",
	"Another wave of drool. The gag doesn't care about your dignity.",
	"Saliva soaks the front of your clothes. There's no end to it.",
	"Your jaw aches and your chin never dries. This is just how it is now.",
];
var RG_MSG_STUFFED = "With your mouth packed full, the sound stays at your lips — and so does the drool. You can move quietly again.";
var RG_MSG_BREATH_START = [
	"Your breathing shifts to your open mouth — soft, audible pants escape the ring.",
	"With your lips forced apart, every breath is a soft gasp.",
	"You start breathing harder through the open ring. The sound is unmistakable.",
];
var RG_MSG_BREATH_TIRED = [
	"Heavy mouth-breathing. The ring forces every pant out into the open.",
	"You're huffing through the gag, unable to seal your lips.",
	"Exhaustion makes every breath loud and wet against the open ring.",
];
var RG_MSG_BREATH_AROUSED = [
	"Excitement makes your breathing ragged. Soft gasps spill past the ring.",
	"Your open mouth betrays every shaky breath.",
	"Arousal turns each exhale into an audible sigh through the gag.",
];

function RG_Pick(arr){if(!arr||!arr.length)return"";return arr[Math.floor(Math.random()*arr.length)];}

// Extend RG_State if core module already defined it
if(typeof RG_State!=="undefined"){
	if(RG_State.LastNoiseCategory===undefined)RG_State.LastNoiseCategory=null;
	if(RG_State.BreathMsgCooldown===undefined)RG_State.BreathMsgCooldown=0;
	if(RG_State.LastBreathWasActive===undefined)RG_State.LastBreathWasActive=false;
}

var RG_TextGetHooked=false;
function RG_InstallTextGetHook(){
	if(RG_TextGetHooked)return;
	if(typeof TextGet!=="function")return;
	if(typeof RG_HasOnlyOpenGags!=="function")return;
	RG_TextGetHooked=true;
	var orig=TextGet;
	TextGet=function(key){
		if(typeof key==="string"&&key.indexOf("KinkyDungeonGag")===0&&RG_HasOnlyOpenGags()){
			if(key.indexOf("KinkyDungeonGagMumbleAroused")===0){RG_State.LastNoiseCategory="OPEN_MUMBLE_AROUSED";return RG_Pick(RG_OPEN_MUMBLE_AROUSED);}
			if(key.indexOf("KinkyDungeonGagMumble")===0){RG_State.LastNoiseCategory="OPEN_MUMBLE";return RG_Pick(RG_OPEN_MUMBLE);}
			if(key.indexOf("KinkyDungeonGagStruggleQuiet")===0){RG_State.LastNoiseCategory="OPEN_STRUGGLE_QUIET";return RG_Pick(RG_OPEN_STRUGGLE_QUIET);}
			if(key.indexOf("KinkyDungeonGagStruggle")===0){RG_State.LastNoiseCategory="OPEN_STRUGGLE";return RG_Pick(RG_OPEN_STRUGGLE);}
			if(key.indexOf("KinkyDungeonGagRestraint")===0){RG_State.LastNoiseCategory="OPEN_RESTRAINT";return RG_Pick(RG_OPEN_RESTRAINT);}
		}
		return orig.apply(this,arguments);
	};
}

var RG_GagParticlesHooked=false;
function RG_InstallGagParticlesHook(){
	if(RG_GagParticlesHooked)return;
	if(typeof KDSendGagParticles!=="function")return;
	if(typeof RG_HasOnlyOpenGags!=="function")return;
	RG_GagParticlesHooked=true;
	var orig=KDSendGagParticles;
	KDSendGagParticles=function(entity){
		if(entity&&entity.player&&RG_HasOnlyOpenGags()){
			var radius=(RG_State.LastNoiseCategory&&RG_NOISE_RADII[RG_State.LastNoiseCategory])?RG_NOISE_RADII[RG_State.LastNoiseCategory]:RG_NOISE_RADIUS;
			if(typeof RG_HasCriersRing==="function"&&RG_HasCriersRing())radius*=2;
			if(typeof KinkyDungeonMakeNoise==="function"&&typeof KinkyDungeonPlayerEntity!=="undefined")
				KinkyDungeonMakeNoise(radius,KinkyDungeonPlayerEntity.x,KinkyDungeonPlayerEntity.y);
			RG_State.LastNoiseCategory=null;
		}
		return orig.apply(this,arguments);
	};
}

function RG_FireDroolStartMessage(nextStage,isCycling,armsBound,hasDroolLock){
	if(typeof KinkyDungeonSendTextMessage!=="function")return;
	var msg,color,failCount=RG_State.BoundWipeFailCount||0;
	if(isCycling&&nextStage===2){msg=RG_Pick(RG_MSG_CYCLE_S2);color=RG_COLOR_START;}
	else if(isCycling){msg=RG_Pick(RG_MSG_BOUND_TIER3);color=RG_COLOR_BOUND_T3;}
	else if((RG_State.DroolEpisode||0)<=1){msg=RG_Pick(RG_MSG_DROOL_START_FIRST);color=RG_COLOR_START;}
	else if(failCount<=0){msg=RG_Pick(RG_MSG_DROOL_START_RECURRING);color=RG_COLOR_START;}
	else if(failCount<=2){msg=RG_Pick(RG_MSG_BOUND_TIER1);color=RG_COLOR_BOUND_T1;}
	else if(failCount<=4||!hasDroolLock){msg=RG_Pick(RG_MSG_BOUND_TIER2);color=RG_COLOR_BOUND_T2;}
	else{msg=RG_Pick(RG_MSG_BOUND_TIER3);color=RG_COLOR_BOUND_T3;}
	KinkyDungeonSendTextMessage(5,msg,color,2);
}
function RG_FireBreathMessage(staminaRatio,aroused){
	if(typeof KinkyDungeonSendTextMessage!=="function")return;
	if((RG_State.BreathMsgCooldown||0)>0)return;
	var msg;
	if(aroused)msg=RG_Pick(RG_MSG_BREATH_AROUSED);
	else if(staminaRatio<RG_BREATH_HUFFING)msg=RG_Pick(RG_MSG_BREATH_TIRED);
	else msg=RG_Pick(RG_MSG_BREATH_START);
	KinkyDungeonSendTextMessage(4,msg,RG_COLOR_BREATH,2);
	RG_State.BreathMsgCooldown=40;
}

// Install hooks when ready
(function RG_DialogueBoot(){
	var tries=0;
	function tick(){
		RG_InstallTextGetHook();
		RG_InstallGagParticlesHook();
		if(RG_TextGetHooked&&RG_GagParticlesHooked){
			if(typeof console!=="undefined"&&console.log)console.log("[RingGags] Open-mouth dialogue & noise hooks installed");
			return;
		}
		tries++;
		if(tries<40&&typeof setTimeout==="function")setTimeout(tick,250);
	}
	if(typeof setTimeout==="function")setTimeout(tick,0);
})();
