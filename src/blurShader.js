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

var dimension = [500, 500];
export var blurMaterial = new THREE.ShaderMaterial({
	uniforms:{
		texture: {type: 't'},
		dimension: {type: 'v2', value: dimension},

	},
	vertexShader: vShader, 
	fragmentShader: fShader, // mandatory
});
