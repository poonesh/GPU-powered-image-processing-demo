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
export var greyScaleMaterial = new THREE.ShaderMaterial({
	uniforms:{
		texture: {type: 't'},
		dimension: {type: 'v2', value: dimension},

	},
	vertexShader: vShader, 
	fragmentShader: fShader, // mandatory
});
