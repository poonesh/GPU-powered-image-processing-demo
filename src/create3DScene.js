
export function create3DScene(initialMaterial){
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
	return [scene, renderer, camera];

}

