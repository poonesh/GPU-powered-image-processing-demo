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

var dimension = [500, 500];
export var edgeDetectionMaterial = new THREE.ShaderMaterial({
	uniforms:{
		texture: {type: 't'},
		dimension: {type: 'v2', value: dimension},

	},
	vertexShader: vShader, 
	fragmentShader: fShader, // mandatory
});