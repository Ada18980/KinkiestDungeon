// @ts-nocheck
/* This file is old and currently unused */
"use strict";
var renderer;
var scene;
var camera;
var model;
var group1;
var material;
var path3d = "Assets/3D/";
var Draw3DEnabled = false;
var count = 0;
var maid;

function Draw3DLoad() {
	init();
	document.body.appendChild(renderer.domElement);
	renderer.domElement.style.display = "none";
}
function Draw3DKeyDown() {
	if ((KeyPress == 51) && (CurrentScreen == "MainHall") && (CurrentCharacter == null)) Draw3DEnable(!Draw3DEnabled);
	if (Draw3DEnabled) {
		if ((KeyPress == 81) || (KeyPress == 113)) group1.rotation.y -= 0.1;
		if ((KeyPress == 69) || (KeyPress == 101)) group1.rotation.y += 0.1;
		if ((KeyPress == 65) || (KeyPress == 97))  group1.position.x -= 1;
		if ((KeyPress == 68) || (KeyPress == 100)) group1.position.x += 1;
		if ((KeyPress == 87) || (KeyPress == 119)) group1.position.z -= 1;
		if ((KeyPress == 83) || (KeyPress == 115)) group1.position.z += 1;
		if ((KeyPress == 90) || (KeyPress == 122)) dress3DModels(group1,path3d);
		if ((KeyPress == 88) || (KeyPress == 120)) Strip3Dmodel(group1.children, count--);
	}
}

// TODO: create more fbx assets <.<
// TODO: seperate all fbx files
// TODO: call each 3d asset and transform x,y towards the next bone node(point)
function init(){

	var animspath = "Assets/3D/1animation/";
	var anims = ["Standing", "Walk", "WalkBack"];

	var itemgroup = ["HairBack/Back Hair 1", "HairFront/Front Hair 1","Eyes/BlueEyes 1","BodyUpper/Pale Skin",  "Cloth/TopMaid","Panties/PantieMaid", "Bra/MaidBra", "ItemNeck/MaidCollar", "Shoes/HighHeels"];



	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 1000);

	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true  });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	// clock = new THREE.Clock();

	group1 = new THREE.Group();
	count = -1;
	light();
	for (let i of itemgroup){
		count += 1;
		let subst = i.indexOf("/");
		let grpname = i.slice(0, subst);
		let itemname = i.slice(subst +1);
		let loader = new THREE.FBXLoader();
		loader.load(
			`${path3d}${grpname}/${itemname}.fbx`,
			function( object ) {
				model = object;
				model.name = itemname;
				model.group = grpname;

				// model.mixer = new THREE.AnimationMixer(model);
				// model.mixer.root = model.mixer.getRoot();

				color2("#ADD8E6", i);
				group1.add(model);
			},
			undefined,
			function( error ) {
				console.log(error);
			}
		);
	}
	scene.add(group1);

}

function Draw3DEnable(Enable) {
	Draw3DEnabled = Enable;
	renderer.domElement.style.display = (Enable) ? "" : "none";
}

function Draw3DProcess() {
	if (Draw3DEnabled && (model != null)) {
		if (document.activeElement.id != "MainCanvas") MainCanvas.canvas.focus();
		if (CurrentScreen != "MainHall") return Draw3DEnable(false);
		if (CurrentCharacter != null) return Draw3DEnable(false);
		if (renderer.domElement.style.width != "100%") {
			renderer.domElement.style.width = "100%";
			renderer.domElement.style.height = "";
		}
		renderer.render(scene, camera);
	}
}

function Draw3DCharacter(C, X, Y, Zoom, IsHeightResizeAllowed) {
	camera.position.set(0, 80, 300);
}

//light section
function light(){

	let directlight = new THREE.DirectionalLight( 0xbbbbbb, 0.5);
	directlight.position.set( 0, 2000, 100 );
	directlight.castShadow = true;
	scene.add( directlight );

	let ambientLight = new THREE.AmbientLight(0xffffff, 1);
	ambientLight.castShadow = true;
	ambientLight.position.set(200, 2000, 200);
	scene.add(ambientLight);
}

//set color
function color2(hexcolor){
	let loader = new THREE.TextureLoader();
	var texturehair = loader.load(`${path3d}HairFront/t005.bmp`);
	model.traverse( function ( child ) {
		if ( child.isMesh ) {
			if (model.group == "HairBack" || model.group == "HairFront"){
				child.castShadow = true;
				child.receiveShadow = true;
				child.material = new THREE.MeshPhongMaterial( {
					color: hexcolor, // hair color
					wireframe: false,
					map: texturehair,
				} );
			}else {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		}
	} );
}

//strip the model
function Strip3Dmodel(models, i){
	if(i <= -1){
		console.log("can't strip further");
		maid = true;
	}else {
		if (models[i].group !== "BodyUpper" && models[i].group !== "Eyes" && models[i].group !== "HairBack" && models[i].group !== "HairFront") group1.remove(models[i]);
	}
}

function dress3DModels(group, path3d){
	if ( maid == true){
		let group2 = [ "Cloth/TopMaid","Panties/PantieMaid", "Bra/MaidBra", "ItemNeck/MaidCollar", "Shoes/HighHeels"];
		count = 3;
		// }else{
		// let group = Character[0].Appearance.length -1;
		// }
		for (let i of group2){
			let subst = i.indexOf("/");
			// if (maid == true){
			let grpname = i.slice(0, subst);
			let itemcolor = "#ADD8E6";
			let itemname = i.slice(subst);
			// }else {
			// let grpname = Character[0].Appearance[i].Asset.DynamicGroupName;
			// let itemname = Character[0].Appearance[i].Asset.Name;
			// let itemcolor = Character[0].Appearance[i].Color;


			let loader = new THREE.FBXLoader();
			loader.load(`${path3d}${grpname}/${itemname}.fbx`,function( object ) {
				count += 1;
				model = object;
				model.name = itemname;
				model.group = grpname;
				console.log(count);

				// model.mixer = new THREE.AnimationMixer(model);
				// model.mixer.root = model.mixer.getRoot();

				color2(itemcolor, i);
				group1.add(model);
			},
			undefined,
			function( error ) {
				console.log(error);
			}
			);
		}
		scene.add(group1);
		console.log(count);
		maid = false;
	}else {
		console.log("you are already dressed!");
	}
}



function refresh3DModel (group, path3d){
	count = 0;
	scene.remove(group);
	let chale = Character[0].Appearance.length -1;
	for(let i = 0; i < chale; i++){
		let grpname = Character[0].Appearance[i].Asset.DynamicGroupName;
		let itemname = Character[0].Appearance[i].Asset.Name;
		let itemcolor = Character[0].Appearance[i].Color;
		if (grpname == "BodyUpper" && itemcolor == "Black") itemname = "Dark Skin";
		if (grpname == "BodyUpper" && itemcolor == "White") itemname = "Pale Skin";
		if (grpname == "BodyUpper" && itemcolor == "Asian") itemname = "Light Skin";

		let loader = new THREE.FBXLoader();
		loader.load(
			`${path3d}${grpname}/${itemname}.fbx`,
			function( object ) {
				model = object;
				model.name = itemname;
				model.group = grpname;
				color2(itemcolor, grpname);
				group1.add(model);
				count++;

			},
			undefined,
			function( error ) {
				console.log(error);
			}
		);
	}
	scene.add(group1);
	maid = false;
}

// function checkitempath(){
//
// }


// 3d environment
// function env3D(loader){
// loader.load(`${path3d}${}.fbx`, function(object){
// env = object;
// env.castShadow = true;
// env.receiveShadow = true;
// });
// }

// function animations(loader){
//
//
// }
// function animate(){
// requestAnimationFrame(animate);
// }
