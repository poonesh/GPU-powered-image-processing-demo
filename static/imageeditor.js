(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

// dragdrop object(dictionary) is a collection of keys and values (functions) to drag and drop the images 
// inside thumbnailImage div. A function is assigned to init key which handels the events "drop", "dragenter",
// "dragover", "dragleave". The main reason to use dictionary here is to organize the event handler functions.
// The function assigned to drop key, will take the data(images) through e.dataTransfer.files. Then iterate 
// through the files and upload the files inside the thumbnailImage div by calling runUpload function. 


// defining global variables
var images_per_row = 3;
// Materials are basically shaders(like edgeDetection shader, greyscale shader) and I need to append all the materials 
// to allMaterials array in order to recognize the new texture every time I want to edit a new image
var allMaterials = [];
// total_image_num is the total number of images in drage and drop box
var total_image_num = 0;
// what is mesh here, when I say mesh?????
var mesh;

// not sure what does the following function does, it sounds like the original coder had writtern its own dollar sign
(function(){
// http://stackoverflow.com/questions/4083351/what-does-jquery-fn-mean
	var select = function( elem ){
		if (!(this instanceof select)){
      return new select(elem);
		}
		this.el = document.getElementById( elem );
	};
	window.select = select;
	select.prototype = {    //onChange is a property of select.prototype object
		onChange : function( callback ){
			this.el.addEventListener('change', callback );
			return this;
		}
	};
})();

// function to capture a file(image) and upload it to the thumbnailImage div
function runUpload(file, myDiv, current_image_id){
	if( file.type === 'image/png' ||
		file.type === 'image/jpg' ||
		file.type === 'image/jpeg'||
		file.type === 'image/gif' ||
		file.type === 'image/bmp' ){
	  var reader = new FileReader();
	  reader.readAsDataURL(file);

	  // customizing the onload method and how to do onload
	  reader.onload = function(file_being_loaded){
	  	var myImageTag = $('<img>');
	  	//attach a drag event to <img> tag
	  	myImageTag.on('dragstart', dragToEditingDiv);
	  	//using template string to set different ids for <img> tag
	  	myImageTag.attr("id", `draggableImage${current_image_id}`); 
	  	//jQuery to set the src attribute for <img> tag
		myImageTag.attr("src",file_being_loaded.target.result); 
		myImageTag.attr("draggable",true);
		myImageTag.attr("class", "imageEdit");
		myDiv.append(myImageTag);

	  }; // END reader.onload()
	} // END test if file.type === imagerun
}

// Setter functions
// this function basically takes a material(shader) as an input and push it into allMaterials array 
function registerMaterialForDragDropUpdates(m){
	allMaterials.push(m);
}

function setMeshForDragDrop(m){
	mesh = m;
}

function adjustMeshVerticesUsingNewWidthandHeight(texture_width, texture_height){

	var new_width = 2;
	var width_height_ratio = (texture_height/texture_width);
	var new_height = width_height_ratio * new_width;
	var vertices = mesh.geometry.attributes.position.array;
	var newVertices = [-new_width/2, -new_height/2, new_width/2, new_width/2, -new_height/2, new_width/2, new_width/2, new_height/2, new_width/2, 
	new_width/2, new_height/2, new_width/2, -new_width/2, new_height/2, new_width/2, -new_width/2, -new_height/2, new_width/2];

	for (let i=0; i<newVertices.length; i++){
		vertices[i] = newVertices[i];
	}
	mesh.geometry.attributes.position.needsUpdate = true;
	
}

function fileToImage(file){
	// convert linear index to 2D index
    var xIndex = total_image_num % images_per_row;
    var yIndex = Math.floor(total_image_num / images_per_row);

    var leftOffset = xIndex * 105;
    var topOffset = yIndex * 105;

    var myDiv = $('<div></div>');
	runUpload(file, myDiv, total_image_num); 
	
	myDiv.css({
        left: leftOffset,
        top: topOffset,
        position: "absolute"
    });
	$('#thumbnailImage').append(myDiv);
	total_image_num += 1;
}


var dragdropUpload = {
    elem: null,   //Why did you put element equal to null?
	init: function(elementValue){
		elementValue.addEventListener('drop', dragdropUpload.drop);
        elementValue.addEventListener('dragenter', dragdropUpload.enter);
		elementValue.addEventListener('dragover', dragdropUpload.drag);
        elementValue.addEventListener('dragleave', dragdropUpload.leave);
        dragdropUpload.elem = elementValue;
	},

	drop: function(e){
		e.preventDefault();
        // set element border back to grey
        if (dragdropUpload.elem !== null) {
            $(dragdropUpload.elem).css({ 'border': 'solid 2px #616161' }); //it is jQuery(css and $)
        }

		// To upload more than one image we can loop over the file
		// and runUpload the files one by one
		var listOfFiles = e.dataTransfer.files;
		if (total_image_num > 5){
            console.error("you cannot upload more than six pictures");
            return;
        }
		for (var i=0; i<listOfFiles.length; i++){
		// converting linear index to 2D index for thumbnail images
			fileToImage(listOfFiles[i]);
		}

	},

	drag: function(e){
		e.preventDefault();
	},

    enter: function(e) {
        // highlight element by setting its border to blue
        if (dragdropUpload.elem !== null) {
            $(dragdropUpload.elem).css({ 'border': 'solid 2px #00fc00' });
        }
    },

    leave: function(e) {
        // set element border back to grey
        if (dragdropUpload.elem !== null) {
            $(dragdropUpload.elem).css({ 'border': 'solid 2px #616161' });
        }
    }
};

function dragToEditingDiv(ev){
	ev.originalEvent.dataTransfer.setData("text", ev.originalEvent.target.id);
}


// dropToEditingDiv function is basically get the image data as a "text" and also the url of the image and load the imgSrc in TextureLoader()
// We can then get the width and height of the image(texture). then for the loop is basically looping over allMaterials array and assign 
// the uniform values to the materials which are basically the new textures(images).

function dropToEditingDiv(ev){ //drop function works when I am releasing the mouse
	var thumbnailImageID = ev.originalEvent.dataTransfer.getData("text"); // image is stored as a string
	var imgSrc = document.getElementById(thumbnailImageID).getAttribute("src"); // so basically we get a thumbnail image through its id and get the url of the image as a result
	
	// create texture_loader
	var texture_loader = new THREE.TextureLoader();
	var texture = texture_loader.load(imgSrc);

	var texture_width = texture.image.width;
	var texture_height = texture.image.height;

	for (let i=0; i<allMaterials.length; i++){
		allMaterials[i].uniforms.texture.value = texture;
	}

	adjustMeshVerticesUsingNewWidthandHeight(texture_width, texture_height);
	
}

// drag and drop thumbnail images in main Editor div
function initializeDragDrop(){
	$("#mainEditor").on("drop", dropToEditingDiv);
	$("#mainEditor").on("dragover", allowDropToEditingDiv);
}

function allowDropToEditingDiv(ev){
	ev.originalEvent.preventDefault();
}


function initializeUploadImage(){
	if (window.FileReader){
		// initializing the 'droppingDiv' div to HTML5 drag and drop calls
		dragdropUpload.init(select('thumbnailImage').el);
		// bind the input [type="file"] to the function runUpload()
		select('fileUpload').onChange(function(){
			if (total_image_num > 5){
				console.error("you cannot upload more than six pictures");
				return;
			}

			fileToImage(this.files[0]);
		});
	}else{
		// report error message if FileReader is unavailable
		var p = document.createElement('p');
		var msg = document.createElement('Sorry, your browser does not support FileReader.');
		p.className = 'error';
		p.appendChild(msg);
		//select(droppingDiv) returns a dictionary which has a key 
		//element called "el" which happens to be the image
		select(thumbnailImage).el.innerHTML = ''; 
		select(thumbnailImage).el.appendChild( p );
	}
}

// vertex shader variable
var vShader = [
	'varying vec2 vUV;', //
	'void main() {',
		'vUV = uv;',
		// is defined in screen position. converting from 3D to 2D position on the screen 
		'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
	'}',
].join('\n');

// fragment shader variable
var fShader = [
	'varying vec2 vUV;',
	// another type of variable (javaScript tells GLSL the value of this variable)
	// a sampler2D is a texture
	'uniform sampler2D texture;', //sampler2D is the image I am doing edge detection on and import it from js
	'uniform vec2 dimension;',
	
	'void main() {',
		'float pixel_width = 1.0/dimension[0];',
		'float pixel_height = 1.0/dimension[1];',
		'vec2 topLeftOffset = vec2(vUV.x - pixel_width, vUV.y - pixel_height);',
		
		// the middle pixel texture
		'vec3 middle = (texture2D(texture, vUV).rgb);',
		// converting the pixels into grey scale
		'float middle_grey = (middle.r + middle.g + middle.b)/3.0;',

		// switching between different filters
		'gl_FragColor = vec4 (middle_grey, middle_grey, middle_grey, 1.0);',
		
	'}',
].join('\n');


// using THREE.js we use a material variable and pass uniforms, vertexShader and 
// fragmentShader

var dimension = [500, 500];
var greyScaleMaterial = new THREE.ShaderMaterial({
	uniforms:{
		texture: {type: 't'},
		dimension: {type: 'v2', value: dimension},

	},
	vertexShader: vShader, 
	fragmentShader: fShader, // mandatory
});

// vertex shader variable
var vShader$1 = [
	'varying vec2 vUV;', //
	'void main() {',
		'vUV = uv;',
		// is defined in screen position. converting from 3D to 2D position on the screen 
		'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
	'}',
].join('\n');

// fragment shader variable
var fShader$1 = [
	'varying vec2 vUV;',
	// another type of variable (javaScript tells GLSL the value of this variable)
	// a sampler2D is a texture
	'uniform sampler2D texture;', //sampler2D is the image I am doing edge detection on and import it from js
	'uniform vec2 dimension;',
	
	'void main() {',
		'float pixel_width = 1.0/dimension[0];',
		'float pixel_height = 1.0/dimension[1];',
		'vec2 topLeftOffset = vec2(vUV.x - pixel_width, vUV.y - pixel_height);',
		'gl_FragColor = (texture2D(texture, vUV).rgba);',	

	'}',
].join('\n');


// using THREE.js we use a material variable and pass uniforms, vertexShader and 
// fragmentShader

var dimension$1 = [500, 500];
var originalMaterial = new THREE.ShaderMaterial({
	uniforms:{
		texture: {type: 't'},
		dimension: {type: 'v2', value: dimension$1},
	},
	vertexShader: vShader$1, 
	fragmentShader: fShader$1, // mandatory
});

// vertex shader variable
var vShader$2 = [
	'varying vec2 vUV;', 
	'void main() {',
		'vUV = uv;',
		// is defined in screen position. converting from 3D to 2D position on the screen 
		'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
	'}',
].join('\n');


// fragment shader variable
var fShader$2 = [
	'varying vec2 vUV;',
	// another type of variable (javaScript tells GLSL the value of this variable)
	// a sampler2D is a texture
	'uniform sampler2D texture;', //sampler2D is the image I am doing edge detection on and import it from js
	'uniform vec2 dimension;',
	
	'void main() {',
		'float pixel_width = 1.0/dimension[0];',
		'float pixel_height = 1.0/dimension[1];',
		'vec2 textCoord;',
		'textCoord.x = 1.0-vUV.y;',
		'textCoord.y = vUV.x;',
		'gl_FragColor = (texture2D(texture, textCoord).rgba);',		
	'}',

].join('\n');


// using THREE.js we use a material variable and pass uniforms, vertexShader and 
// fragmentShader

var dimension$2 = [500, 500];
var rotationMaterial90 = new THREE.ShaderMaterial({
	uniforms:{
		texture: {type: 't'},
		dimension: {type: 'v2', value: dimension$2},
	},
	vertexShader: vShader$2, 
	fragmentShader: fShader$2, // mandatory
});

// vertex shader variable
var vShader$3 = [
	'varying vec2 vUV;', 
	'void main() {',
		'vUV = uv;',
		// is defined in screen position. converting from 3D to 2D position on the screen 
		'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
	'}',
].join('\n');


// fragment shader variable
var fShader$3 = [
	'varying vec2 vUV;',
	// another type of variable (javaScript tells GLSL the value of this variable)
	// a sampler2D is a texture
	'uniform sampler2D texture;', //sampler2D is the image I am doing edge detection on and import it from js
	'uniform vec2 dimension;',
	
	'void main() {',
		'float pixel_width = 1.0/dimension[0];',
		'float pixel_height = 1.0/dimension[1];',
		'vec2 textCoord;',
		'textCoord.x = 1.0-vUV.x;',
		'textCoord.y = 1.0-vUV.y;',
		'gl_FragColor = (texture2D(texture, textCoord).rgba);',		
	'}',

].join('\n');


// using THREE.js we use a material variable and pass uniforms, vertexShader and 
// fragmentShader

var dimension$3 = [500, 500];
var rotationMaterial180 = new THREE.ShaderMaterial({
	uniforms:{
		texture: {type: 't'},
		dimension: {type: 'v2', value: dimension$3},
	},
	vertexShader: vShader$3, 
	fragmentShader: fShader$3, // mandatory
});

// vertex shader variable
var vShader$4 = [
	'varying vec2 vUV;',
	'void main() {',
		'vUV = uv;',
		// is defined in screen position. converting from 3D to 2D position on the screen 
		'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
	'}',
].join('\n');


// fragment shader variable
var fShader$4 = [
	'varying vec2 vUV;',
	// another type of variable (javaScript tells GLSL the value of this variable)
	// a sampler2D is a texture
	'uniform sampler2D texture;', //sampler2D is the image I am doing edge detection on and import it from js
	'uniform vec2 dimension;',
	
	'void main() {',
		'float pixel_width = 1.0/dimension[0];',
		'float pixel_height = 1.0/dimension[1];',
		'vec2 textCoord;',
		'textCoord.x = vUV.x;',
		'textCoord.y = 1.0 - vUV.y;',
		'gl_FragColor = (texture2D(texture, textCoord).rgba);',		
	'}',

].join('\n');

// using THREE.js we use a material variable and pass uniforms, vertexShader and 
// fragmentShader

var dimension$4 = [500, 500];
var flippingMaterial_x = new THREE.ShaderMaterial({
	uniforms:{
		texture: {type: 't'},
		dimension: {type: 'v2', value: dimension$4},
	},
	vertexShader: vShader$4, 
	fragmentShader: fShader$4, // mandatory
});

// vertex shader variable
var vShader$5 = [
	'varying vec2 vUV;',
	'void main() {',
		'vUV = uv;',
		// is defined in screen position. converting from 3D to 2D position on the screen 
		'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
	'}',
].join('\n');


// fragment shader variable
var fShader$5 = [
	'varying vec2 vUV;',
	// another type of variable (javaScript tells GLSL the value of this variable)
	// a sampler2D is a texture
	'uniform sampler2D texture;', //sampler2D is the image I am doing edge detection on and import it from js
	'uniform vec2 dimension;',
	
	'void main() {',
		'float pixel_width = 1.0/dimension[0];',
		'float pixel_height = 1.0/dimension[1];',
		'vec2 textCoord;',
		'textCoord.x = 1.0 - vUV.x;',
		'textCoord.y = vUV.y;',
		'gl_FragColor = (texture2D(texture, textCoord).rgba);',		
	'}',

].join('\n');

// using THREE.js we use a material variable and pass uniforms, vertexShader and 
// fragmentShader

var dimension$5 = [500, 500];
var flippingMaterial_y = new THREE.ShaderMaterial({
	uniforms:{
		texture: {type: 't'},
		dimension: {type: 'v2', value: dimension$5},
	},
	vertexShader: vShader$5, 
	fragmentShader: fShader$5, // mandatory
});

function create3DScene(initialMaterial){
	// create a renderer object
	// buffer geometry and properties are all made in three.js and in order to 
	// render it in WebGL we need to create a WebGLRenderer()
	var renderer = new THREE.WebGLRenderer({ alpha: true }); 

	// to have transparent background
	renderer.setClearColor( 0x000000, 0 ); //it is not supposed to be black 0x000000

	// set the pixel ratio and size of the window (the size of the window here 
	// should be the same as the mainEditor div)
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(500, 500);

	// appending renderer DOM to the mainEditor div
	document.getElementById("mainEditor").appendChild(renderer.domElement);

	// create an object scene
	var scene = new THREE.Scene();
	
	// define a camera with field_of_view = 70, ratio, near and far clipping planes
	var camera = new THREE.PerspectiveCamera(70, 500/500, 0.01, 1000);
	camera.position.z = 2.5;

	// bufferGeometry stores all data including vertices within buffers
	// plane consists of two triangles
	// create a geometry called plane
	var plane = new THREE.BufferGeometry();


	// the geometry is empty in the previous line, so what we do, we assign 
	// vertices for the geometry and thats basically is just a vector array
	var vertices = new Float32Array([-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0]);

	// create bufferAttributes called vertice_array and we need to pass two 
	// parameters to bufferAttributes which includes the vector array and a 
	// number which indicates how many numbers corresponds to on vertex
	var vertice_array = new THREE.BufferAttribute(vertices, 3);

	// Added attribute to the buffer Geometry
	plane.addAttribute('position', vertice_array);

	// create U, V coordinates
	var left_bottom = [0.0, 0.0];
	var right_bottom = [1.0, 0.0];
	var right_top = [1.0, 1.0];
	var left_top = [0.0, 1.0];


	var uv_vertices = new Float32Array([left_bottom[0], left_bottom[1], right_bottom[0], 
		right_bottom[1], right_top[0], right_top[1], right_top[0], right_top[1], left_top[0], 
		left_top[1], left_bottom[0], left_bottom[1]]);
	// create BufferAttribute and pass two parameters
	var uv_array = new THREE.BufferAttribute(uv_vertices, 2);
	// add attribute to buffer geometry which we call it 'uv' and pass the uv_array
	plane.addAttribute('uv', uv_array);

	// adding mesh to the scene
	var mesh = new THREE.Mesh(plane, initialMaterial);
	scene.add( mesh );
	return [scene, renderer, camera, mesh];

}

// vertex shader variable
var vShader$6 = [
	'varying vec2 vUV;', //
	'void main() {',
		'vUV = uv;',
		// is defined in screen position. converting from 3D to 2D position on the screen 
		'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
	'}',
].join('\n');

// fragment shader variable
var fShader$6 = [
	'varying vec2 vUV;',
	// another type of variable (javaScript tells GLSL the value of this variable)
	// a sampler2D is a texture
	'uniform sampler2D texture;', //sampler2D is the image I am doing edge detection on and import it from js
	'uniform vec2 dimension;',
	
	'void main() {',
	'vec3 blurColor = vec3(0.0);',
	'mat3 blurMatrix;',
	'float pixel_width = 1.0/dimension[0];',
	'float pixel_height = 1.0/dimension[1];',
	'vec2 topLeftOffset = vec2(vUV.x - pixel_width, vUV.y - pixel_height);',

	'blurMatrix[0] = vec3(1.0/9.0, 1.0/9.0, 1.0/9.0);',
	'blurMatrix[1] = vec3(1.0/9.0, 1.0/9.0, 1.0/9.0);',
	'blurMatrix[2] = vec3(1.0/9.0, 1.0/9.0, 1.0/9.0);',
	'for(float j=0.0; j<3.0; j++){;',
		'for(float i=0.0; i<3.0; i++){;',
			'vec2 uvThisPixel = topLeftOffset + vec2(j*pixel_width, i*pixel_height);',
			'blurColor += blurMatrix[int(i)][int(j)]*texture2D(texture, uvThisPixel).rgb;',
	'gl_FragColor = vec4 (blurColor,1.0);',
		'};',
	'};',

	'}',
].join('\n');


// using THREE.js we use a material variable and pass uniforms, vertexShader and 
// fragmentShader

var dimension$6 = [500, 500];
var blurMaterial = new THREE.ShaderMaterial({
	uniforms:{
		texture: {type: 't'},
		dimension: {type: 'v2', value: dimension$6},

	},
	vertexShader: vShader$6, 
	fragmentShader: fShader$6, // mandatory
});

// vertex shader variable
var vShader$7 = [
	'varying vec2 vUV;', //
	'void main() {',
		'vUV = uv;',
		// is defined in screen position. converting from 3D to 2D position on the screen 
		'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
	'}',
].join('\n');

// fragment shader variable
var fShader$7 = [
	'varying vec2 vUV;',
	// another type of variable (javaScript tells GLSL the value of this variable)
	// a sampler2D is a texture
	'uniform sampler2D texture;', //sampler2D is the image I am doing edge detection on and import it from js
	'uniform vec2 dimension;',
	
	'void main() {',
	'float pixel_width = 1.0/dimension[0];',
	'float pixel_height = 1.0/dimension[1];',
	'vec2 topLeftOffset = vec2(vUV.x - pixel_width, vUV.y - pixel_height);',
	// edge detection calculation
	// Applying Sobel Operator (Sobel Kernel) for edge detection 
	'float edgeDetect_x = 0.0;',
	'mat3 edgeDetectMatrix_X;',
	'edgeDetectMatrix_X[0] = vec3(1.0, 0.0, -1.0);',
	'edgeDetectMatrix_X[1] = vec3(2.0, 0.0, -2.0);',
	'edgeDetectMatrix_X[2] = vec3(1.0, 0.0, -1.0);',
	
	'float edgeDetect_y = 0.0;',
	'mat3 edgeDetectMatrix_Y;',
	'edgeDetectMatrix_Y[0] = vec3(1.0, 2.0, 1.0);',
	'edgeDetectMatrix_Y[1] = vec3(0.0, 0.0, 0.0);',
	'edgeDetectMatrix_Y[2] = vec3(-1.0, -2.0, -1.0);',


	'for(float k=0.0; k<3.0; k++){',
		'for(float l=0.0; l<3.0; l++){',
			'vec2 uvThisPixel = topLeftOffset + vec2(k*pixel_width, l*pixel_height);',
			'vec3 thisPixelTexture = (texture2D(texture, uvThisPixel).rgb);',
			'edgeDetect_x += edgeDetectMatrix_X[int(k)][int(l)]*((thisPixelTexture.r + thisPixelTexture.g + thisPixelTexture.b)/3.0);',
			'edgeDetect_y += edgeDetectMatrix_Y[int(k)][int(l)]*((thisPixelTexture.r + thisPixelTexture.g + thisPixelTexture.b)/3.0);',
		'};',
	'};',
	'float edgeDetect_magnitude = 0.0;',
	'edgeDetect_magnitude += sqrt(edgeDetect_x*edgeDetect_x + edgeDetect_y*edgeDetect_y);',
	'gl_FragColor = vec4 (edgeDetect_magnitude, edgeDetect_magnitude, edgeDetect_magnitude ,1.0);',

	'}',
].join('\n');

// using THREE.js we use a material variable and pass uniforms, vertexShader and 
// fragmentShader

var dimension$7 = [500, 500];
var edgeDetectionMaterial = new THREE.ShaderMaterial({
	uniforms:{
		texture: {type: 't'},
		dimension: {type: 'v2', value: dimension$7},

	},
	vertexShader: vShader$7, 
	fragmentShader: fShader$7, // mandatory
});

// part of the code is from https://codepen.io/doughensel/pen/zGMmop
document.addEventListener("DOMContentLoaded", function(event){

	window.onload = initializeUploadImage;

	// window.onload (like document is ready)
	// window.onload = function(){
	// 	if (window.FileReader){
	// 		// connect the DIV surrounding the file upload to HTML5 drag and drop calls
	// 		dragdropUpload.init(select('droppingDiv').el);
	// 		// bind the input [type="file"] to the function runUpload()
	// 		select('fileUpload').onChange(function(){
	// 			var myDiv = $('<div></div>');
	// 			runUpload(this.files[0], myDiv, total_image_num); 
	// 			if (total_image_num > 5){
 //                	console.error("you cannot upload more than six pictures");
 //                	return;
 //                };
				
	// 			// convert linear index to 2D index
 //                var xIndex = total_image_num % images_per_row;
 //                var yIndex = Math.floor(total_image_num / images_per_row);

 //                var leftOffset = xIndex * 105;
 //                var topOffset = yIndex * 105;
				
	// 			myDiv.css({
 //                    left: leftOffset,
 //                    top: topOffset,
 //                    position: "absolute"
 //                });
	// 			$('#thumbnailImage').append(myDiv);
	// 			total_image_num += 1;
	// 		});
	// 	}else{
	// 		// report error message if FileReader is unavialable
	// 		var p = document.createElement('p');
	// 		var msg = document.createElement('Sorry, your browser does not support FileReader.');
	// 		p.className = 'error';
	// 		p.appendChild(msg);
	// 		//select(droppingDiv) returns a dictionary which has a key 
	// 		//element called "el" which happens to be the image
	// 		select(droppingDiv).el.innerHTML = ''; 
	// 		select(droppingDiv).el.appendChild( p );
	// 	}

	// };

	initializeDragDrop();

	// // toggle buttonsas
	// $("#edgeDetection").click(function(){
	// 	originalMaterial.uniforms.edgeDetectionActive.value = !originalMaterial.uniforms.edgeDetectionActive.value;
	// 	originalMaterial.uniforms.greyScaleActive.value = 0.0;
	// 	originalMaterial.uniforms.blurActive.value = 0.0;
	// });

	// $("#greyScale").click(function(){
	// 	originalMaterial.uniforms.greyScaleActive.value = !originalMaterial.uniforms.greyScaleActive.value;
	// 	originalMaterial.uniforms.edgeDetectionActive.value = 0.0;
	// 	originalMaterial.uniforms.blurActive.value = 0.0;
	// });

	// $("#blur").click(function(){
	// 	originalMaterial.uniforms.blurActive.value = !originalMaterial.uniforms.blurActive.value;
	// 	originalMaterial.uniforms.greyScaleActive.value = 0.0;
	// 	originalMaterial.uniforms.edgeDetectionActive.value = 0.0;
	// });

	// $("#origin").click(function(){
	// 	originalMaterial.uniforms.edgeDetectionActive.value = 0.0;
	// 	originalMaterial.uniforms.greyScaleActive.value = 0.0;
	// 	originalMaterial.uniforms.blurActive.value = 0.0;
	// });

	// toggle buttonsas
	$("#edgeDetection").click(function(){
		mesh.material = edgeDetectionMaterial;
	});

	$("#greyScale").click(function(){
		mesh.material = greyScaleMaterial;
	});

	$("#blur").click(function(){
		mesh.material = blurMaterial;
	});

	$("#origin").click(function(){
		mesh.material = originalMaterial;
	});

	$("#flippingX").click(function(){
		mesh.material = flippingMaterial_x;
	});

	$("#flippingY").click(function(){
		mesh.material = flippingMaterial_y;
	});

	$("#rotation90Clockwise").click(function(){
		mesh.material = rotationMaterial90;
	});

	$("#rotation180Clockwise").click(function(){
		mesh.material = rotationMaterial180;
	});


 	// create a renderer object
	// buffer geometry and properties are all made in three.js and in order to 
	// render it in WebGL we need to create a WebGLRenderer()
	// var renderer = new THREE.WebGLRenderer({ alpha: true }); 

	// // to have transparent background
	// renderer.setClearColor( 0x000000, 0 ); //it is not supposed to be black 0x000000

	// // set the pixel ratio and size of the window (the size of the window here 
	// // should be the same as the mainEditor div)
	// renderer.setPixelRatio(window.devicePixelRatio);
	// renderer.setSize(500, 500);

	// // appending renderer DOM to the mainEditor div
	// document.getElementById("mainEditor").appendChild(renderer.domElement);

	// // create an object scene
	// var scene = new THREE.Scene();
	
	// // define a camera with field_of_view = 70, ratio, near and far clipping planes
	// var camera = new THREE.PerspectiveCamera(70, 500/500, 0.01, 1000);
	// camera.position.z = 2.5;

	// // bufferGeometry stores all data including vertices within buffers
	// // plane consists of two triangles
	// // create a geometry called plane
	// var plane = new THREE.BufferGeometry();

	// // the geometry is empty in the previous line, so what we do, we assign 
	// // vertices for the geometry and thats basically is just a vector array
	// var vertices = new Float32Array([-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
	// 	1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0]);

	// // create bufferAttributes called vertice_array and we need to pass two 
	// // parameters to bufferAttributes which includes the vector array and a 
	// // number which indicates how many numbers corresponds to on vertex
	// var vertice_array = new THREE.BufferAttribute(vertices, 3);

	// // Added attribute to the buffer Geometry
	// plane.addAttribute('position', vertice_array);

	// // create U, V coordinates
	// var left_bottom = [0.0, 0.0];
	// var right_bottom = [1.0, 0.0];
	// var right_top = [1.0, 1.0];
	// var left_top = [0.0, 1.0];


	// var uv_vertices = new Float32Array([left_bottom[0], left_bottom[1], right_bottom[0], 
	// 	right_bottom[1], right_top[0], right_top[1], right_top[0], right_top[1], left_top[0], 
	// 	left_top[1], left_bottom[0], left_bottom[1]]);
	// create BufferAttribute and pass two parameters
	// var uv_array = new THREE.BufferAttribute(uv_vertices, 2);
	// // add attribute to buffer geometry which we call it 'uv' and pass the uv_array
	// plane.addAttribute('uv', uv_array);

	// vertex shader variable
	// var vShader = [
	// 	'varying vec2 vUV;', //
	// 	'void main() {',
	// 		'vUV = uv;',
	// 		// is defined in screen position. converting from 3D to 2D position on the screen 
	// 		'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
	// 	'}',
	// ].join('\n');
	
	// fragment shader variable
	// var fShader = [
	// 	'varying vec2 vUV;',
	// 	// another type of variable (javaScript tells GLSL the value of this variable)
	// 	// a sampler2D is a texture
	// 	'uniform sampler2D texture;', //sampler2D is the image I am doing edge detection on and import it from js
	// 	'uniform vec2 dimension;',
	// 	'uniform float edgeDetectionActive;',
	// 	'uniform float greyScaleActive;',
	// 	'uniform float blurActive;',
		
	// 	'void main() {',
	// 		'float pixel_width = 1.0/dimension[0];',
	// 		'float pixel_height = 1.0/dimension[1];',
	// 		'vec2 topLeftOffset = vec2(vUV.x - pixel_width, vUV.y - pixel_height);',
			
	// 		// the middle pixel texture
	// 		'vec3 middle = (texture2D(texture, vUV).rgb);',
	// 		// converting the pixels into grey scale
	// 		'float middle_grey = (middle.r + middle.g + middle.b)/3.0;',

			
	// 		// edge detection calculation
	// 		// Applying Sobel Operator (Sobel Kernel) for edge detection 
	// 		'float edgeDetect_x = 0.0;',
	// 		'mat3 edgeDetectMatrix_X;',
	// 		'edgeDetectMatrix_X[0] = vec3(1.0, 0.0, -1.0);',
	// 		'edgeDetectMatrix_X[1] = vec3(2.0, 0.0, -2.0);',
	// 		'edgeDetectMatrix_X[2] = vec3(1.0, 0.0, -1.0);',
			
	// 		'float edgeDetect_y = 0.0;',
	// 		'mat3 edgeDetectMatrix_Y;',
	// 		'edgeDetectMatrix_Y[0] = vec3(1.0, 2.0, 1.0);',
	// 		'edgeDetectMatrix_Y[1] = vec3(0.0, 0.0, 0.0);',
	// 		'edgeDetectMatrix_Y[2] = vec3(-1.0, -2.0, -1.0);',


	// 		'for(float k=0.0; k<3.0; k++){',
	// 			'for(float l=0.0; l<3.0; l++){',
	// 				'vec2 uvThisPixel = topLeftOffset + vec2(k*pixel_width, l*pixel_height);',
	// 				'vec3 thisPixelTexture = (texture2D(texture, uvThisPixel).rgb);',
	// 				'edgeDetect_x += edgeDetectMatrix_X[int(k)][int(l)]*((thisPixelTexture.r + thisPixelTexture.g + thisPixelTexture.b)/3.0);',
	// 				'edgeDetect_y += edgeDetectMatrix_Y[int(k)][int(l)]*((thisPixelTexture.r + thisPixelTexture.g + thisPixelTexture.b)/3.0);',
	// 			'};',
	// 		'};',
	// 		'float edgeDetect_magnitude = 0.0;',
	// 		'edgeDetect_magnitude += sqrt(edgeDetect_x*edgeDetect_x + edgeDetect_y*edgeDetect_y);',


	// 		// blurr calculation
	// 		'vec3 blurColor = vec3(0.0);',
	// 		'mat3 blurMatrix;',
	// 		'blurMatrix[0] = vec3(1.0/9.0, 1.0/9.0, 1.0/9.0);',
	// 		'blurMatrix[1] = vec3(1.0/9.0, 1.0/9.0, 1.0/9.0);',
	// 		'blurMatrix[2] = vec3(1.0/9.0, 1.0/9.0, 1.0/9.0);',
	// 		'for(float j=0.0; j<3.0; j++){;',
	// 			'for(float i=0.0; i<3.0; i++){;',
	// 				'vec2 uvThisPixel = topLeftOffset + vec2(j*pixel_width, i*pixel_height);',
	// 				'blurColor += blurMatrix[int(i)][int(j)]*texture2D(texture, uvThisPixel).rgb;',
	// 			'};',
	// 		'};',

	// 		// switching between different filters
	// 		'if(greyScaleActive == 1.0){',
	// 			'gl_FragColor = vec4 (middle_grey, middle_grey, middle_grey, 1.0);',
	// 		'}else if(edgeDetectionActive == 1.0){',
	// 			'gl_FragColor = vec4 (edgeDetect_magnitude, edgeDetect_magnitude, edgeDetect_magnitude ,1.0);',
	// 		'}else if(blurActive == 1.0){',
	// 			'gl_FragColor = vec4 (blurColor,1.0);',
	// 		'}else{',
	// 			'gl_FragColor = (texture2D(texture, vUV).rgba);',
	// 		'}',		

	// 	'}',
	// ].join('\n');


	// // using THREE.js we use a material variable and pass uniforms, vertexShader and 
	// // fragmentShader

	// var dimension = [500, 500];
	// var material = new THREE.ShaderMaterial({
	// 	uniforms:{
	// 		texture: {type: 't'},
	// 		dimension: {type: 'v2', value: dimension},
	// 		edgeDetectionActive: {type: 'f', value: 0.0},
	// 		greyScaleActive: {type: 'f', value: 0.0},
	// 		blurActive: {type: 'f', value: 0.0},

	// 	},
	// 	vertexShader: vShader, 
	// 	fragmentShader: fShader, // mandatory
	// });
	
	registerMaterialForDragDropUpdates(originalMaterial);
	registerMaterialForDragDropUpdates(greyScaleMaterial);
	registerMaterialForDragDropUpdates(rotationMaterial90);
	registerMaterialForDragDropUpdates(rotationMaterial180);
	registerMaterialForDragDropUpdates(flippingMaterial_x);
	registerMaterialForDragDropUpdates(flippingMaterial_y);
	registerMaterialForDragDropUpdates(blurMaterial);
	registerMaterialForDragDropUpdates(edgeDetectionMaterial);

	
	// var returnedList = create3DScene(flippingMaterial_x);
	var returnedList = create3DScene(originalMaterial);
	
	var scene = returnedList[0];
	var renderer = returnedList[1];
	var camera = returnedList[2];
	var mesh = returnedList[3];

	// adding mesh to the scene
	// var mesh = new THREE.Mesh(plane, originalMaterial);
	// scene.add( mesh );

	// console.log("geometry values");
	// console.log(mesh.geometry.attributes.position.array);
	// var vertices = mesh.geometry.attributes.position.array;
	// var newVertices = [-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, -1.0, 0.0, 1.0, -1.0, -1.0, 1.0];
	
	// for(var i=0; i<newVertices.length; i++){
	// 	vertices[i] = newVertices[i];
	// }

	// $("#halfImage").click(function(){
	// 	console.log("are you in halfImage?");
	// 	mesh.geometry.attributes.position.needsUpdate = true;
	// });

	setMeshForDragDrop(mesh);
	
	// rotate mesh clockwise for muliples of 90 degrees
	$('#meshRotationCounterClockwise').click(function(){
		console.log("counterClockwise");
		mesh.rotation.z += 90*(Math.PI/180);
	});

	// rotate mesh counterclockwise for multiple of 90 degrees
	$('#meshRotationClockwise').click(function(){
		console.log("clockwise");
		mesh.rotation.z -= 90*(Math.PI/180);
	});


	function animate() {
		// requestAnimationFrame is basically a browser function
		// so whenever the browser is ready to draw to the screen 
		// then we call requestAnimationFrame() and pass the parameter
		// animate which is a callback function
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}

	animate();

	// loading texture
	// var texture_loader = new THREE.TextureLoader();

});

})));
