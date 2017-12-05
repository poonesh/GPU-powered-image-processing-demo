// part of the code is from https://codepen.io/doughensel/pen/zGMmop

// defining global variables
var dragdrop = {};
var total_image_num = 0;
var previous_image_num = 0;
var images_per_row = 3;


// edge detection using GLSL and  three.js
document.addEventListener("DOMContentLoaded", function(event){

		'use strict';  //javaScript is executed in "strict mode"
	
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

	// Drag and Drop code for Upload
	// drag and drop dictionary is a collection of keys and values (functions) 
	// to drag and drop the images inside thumbnailImage
	// the main reason that we have uses dictionary here is to organize these 
	// functions 
	dragdrop = {
        elem: null,   //???? Why did you put element equal to null? I asked you this question before!
		init: function(elementValue){
			elementValue.addEventListener('drop', dragdrop.drop);
            elementValue.addEventListener('dragenter', dragdrop.enter);
			elementValue.addEventListener('dragover', dragdrop.drag);
            elementValue.addEventListener('dragleave', dragdrop.leave);
            dragdrop.elem = elementValue;
		},

		drop: function(e){
			e.preventDefault();
            // set element border back to grey
            if (dragdrop.elem !== null) {
                $(dragdrop.elem).css({ 'border': 'solid 2px #333333' }); //it is jQuery(css and $)
            }

			// To upload more than one image we can loop over the file
			// and runUpload the files one by one
			var file = e.dataTransfer.files; 
			var previous_image_num = total_image_num;
			if (total_image_num > 5){
                console.error("you cannot upload more than five pictures");
                return;
            }
			for (var i=0; i<file.length; i++){
				// converting linear index to 2D index for thumbnail images
				var xIndex = previous_image_num % images_per_row; 
                var yIndex = Math.floor(previous_image_num / images_per_row);

                var leftOffset = xIndex * 105;
                var topOffset = yIndex * 105;

                total_image_num += 1;

				var myDiv = $('<div></div>');
				runUpload(file[i], myDiv, i);

				// positioning thumbnail images based on left and top corner offset
				myDiv.css({
                    left: leftOffset,
                    top: topOffset,
                    position: "absolute"
                });
				$('#thumbnailImage').append(myDiv);
			}

		},

		drag: function(e){
			e.preventDefault();
		},

        enter: function(e) {
            // highlight element by setting its border to blue
            if (dragdrop.elem !== null) {
                $(dragdrop.elem).css({ 'border': 'solid 2px #0000FF' });
            }
        },

        leave: function(e) {
            // set element border back to grey
            if (dragdrop.elem !== null) {
                $(dragdrop.elem).css({ 'border': 'solid 2px #333333' });
            }
        }
	};


	// Code to capture a file(image) and upload it to the browser
	function runUpload(file, myDiv, current_image_id){
		if( file.type === 'image/png' ||
			file.type === 'image/jpg' ||
			file.type === 'image/jpeg'||
			file.type === 'image/gif' ||
			file.type === 'image/bmp' ){
		  var reader = new FileReader();
		  reader.readAsDataURL( file );

		  // customizing the onload method and how to do onload
		  reader.onload = function(file_being_loaded){
		  	var myImageTag = $('<img>');
		  	//attach a drag event to <img> tag
		  	myImageTag.on('dragstart', drag);
		  	//using template string to set different ids for <img> tag
		  	myImageTag.attr("id", `draggableImage${current_image_id}`); 
		  	//jQuery to set the src attribute for <img> tag
			myImageTag.attr("src",file_being_loaded.target.result); 
			myImageTag.attr("draggable",true);
			myImageTag.attr("class", "imageEdit");
			myDiv.append(myImageTag);

		  } // END reader.onload()
		} // END test if file.type === image
	}


	// window.onload
	window.onload = function(){
		if (window.FileReader){
			// connect the DIV surrounding the file upload to HTML5 drag and drop calls
			dragdrop.init(select('droppingDiv').el);
			// bind the input [type="file"] to the function runUpload()
			select('fileUpload').onChange(function(){
				var myDiv = $('<div></div>');
				runUpload(this.files[0], myDiv, total_image_num); 
				if (total_image_num > 5){
                	console.error("you cannot upload more than five pictures");
                	return;
                };
				
				// convert linear index to 2D index
                var xIndex = total_image_num % images_per_row;
                var yIndex = Math.floor(total_image_num / images_per_row);

                var leftOffset = xIndex * 105;
                var topOffset = yIndex * 105;
                console.log("topOffset", topOffset);

				myDiv.css({
                    left: leftOffset,
                    top: topOffset,
                    position: "absolute"
                });
				$('#thumbnailImage').append(myDiv);
				total_image_num += 1;
			});
		}else{
			// report error message if FileReader is unavialable
			var p = document.createElement('p');
			var msg = document.createElement('Sorry, your browser does not support FileReader.');
			p.className = 'error';
			p.appendChild(msg);
			//select(droppingDiv) returns a dictionary which has a key 
			//element called "el" which happens to be the image
			select(droppingDiv).el.innerHTML = ''; 
			select(droppingDiv).el.appendChild( p );
		}

	};

	// drag and drop thumbnail images in main Editor div
	$("#mainEditor").on("drop", drop);
	$("#mainEditor").on("dragover", allowDrop);
	function allowDrop(ev){
		ev.originalEvent.preventDefault();
	}

	function drag(ev){
		ev.originalEvent.dataTransfer.setData("text", ev.originalEvent.target.id);
	}

	function drop(ev){ //drop function works when I am releasing the mouse
		var data = ev.originalEvent.dataTransfer.getData("text"); //look for dataTransfer???????
		console.log(data);
		var imgSrc = document.getElementById(data).getAttribute("src");
		
		// create texture_loader
		var texture_loader = new THREE.TextureLoader();
		var texture = texture_loader.load(imgSrc);
		material.uniforms.texture.value = texture;
	
	}

	// toggle buttons
	
	$("#edgeDetection").click(function(){
		material.uniforms.edgeDetectionActive.value = !material.uniforms.edgeDetectionActive.value;
		material.uniforms.greyScaleActive.value = 0.0;
		material.uniforms.blurActive.value = 0.0;
	});

	$("#greyScale").click(function(){
		material.uniforms.greyScaleActive.value = !material.uniforms.greyScaleActive.value;
		material.uniforms.edgeDetectionActive.value = 0.0;
		material.uniforms.blurActive.value = 0.0;
	});

	$("#blur").click(function(){
		material.uniforms.blurActive.value = !material.uniforms.blurActive.value;
		material.uniforms.greyScaleActive.value = 0.0;
		material.uniforms.edgeDetectionActive.value = 0.0;
	});

	$("#origin").click(function(){
		material.uniforms.edgeDetectionActive.value = 0.0;
		material.uniforms.greyScaleActive.value = 0.0;
		material.uniforms.blurActive.value = 0.0;
	});

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
		'uniform float edgeDetectionActive;',
		'uniform float greyScaleActive;',
		'uniform float blurActive;',
		
		'void main() {',
			'float pixel_width = 1.0/dimension[0];',
			'float pixel_height = 1.0/dimension[1];',
			
			// 'vec3 color = vec3(0.0);', // creating a variable called color and the color is black
			'vec3 middle = (texture2D(texture, vUV).rgb);', //0.0
			'vec3 top_left = (texture2D(texture, vec2(vUV.x-pixel_width, vUV.y-pixel_height)).rgb);', //1.0
			'vec3 top_top = (texture2D(texture, vec2(vUV.x, vUV.y-pixel_height)).rgb);', //0.0
			'vec3 top_right = (texture2D(texture, vec2(vUV.x+pixel_width, vUV.y-pixel_height)).rgb);', //-1.0
			'vec3 left = (texture2D(texture,  vec2(vUV.x-pixel_width, vUV.y)).rgb);', //0.0
			'vec3 right = (texture2D(texture, vec2(vUV.x+pixel_width, vUV.y)).rgb);', //0.0
			'vec3 bottom_left = (texture2D(texture, vec2(vUV.x-pixel_width, vUV.y+pixel_height)).rgb);', //-1.0
			'vec3 bottom_bottom = (texture2D(texture, vec2(vUV.x, vUV.y+pixel_height)).rgb);', //0.0
			'vec3 bottom_right = (texture2D(texture, vec2(vUV.x+pixel_width, vUV.y-pixel_height)).rgb);', //1.0
			
			// converting the pixels into gray scale
			'float middle_grey = (middle.r + middle.g + middle.b)/3.0;',
			'float top_left_grey = (top_left.r + top_left.g + top_left.b)/3.0;',
			'float top_top_grey = (top_top.r + top_top.g + top_top.b)/3.0;',
			'float top_right_grey = (top_right.r + top_right.g + top_right.b)/3.0;',
			'float left_grey = (left.r + left.g + left.b)/3.0;',
			'float right_grey = (right.r + right.g + right.b)/3.0;',
			'float bottom_left_grey = (bottom_left.r + bottom_left.g + bottom_left.b)/3.0;',
			'float bottom_bottom_grey = (bottom_bottom.r + bottom_bottom.g + bottom_bottom.b)/3.0;',
			'float bottom_right_grey = (bottom_right.r + bottom_right.g + bottom_right.b)/3.0;',

			
			// edge detection calculation
			// 'float color = 0.0;',
			// 'color += 0.0*middle_grey;',
			// 'color += 1.0*top_left_grey;',
			// 'color += 0.0*top_top_grey;',
			// 'color += -1.0*top_right_grey;',
			// 'color += 0.0*left_grey;',
			// 'color += 0.0*right_grey;',
			// 'color += -1.0*bottom_left_grey;',
			// 'color += 0.0*bottom_bottom_grey;',
			// 'color += 1.0*bottom_right_grey;',

			// Applying Sobel Operator (Sobel Kernel) for edge detection 

			'float edgeDetect_x = 0.0;',
			'edgeDetect_x += 0.0*middle_grey;',
			'edgeDetect_x += 1.0*top_left_grey;',
			'edgeDetect_x += 0.0*top_top_grey;',
			'edgeDetect_x += -1.0*top_right_grey;',
			'edgeDetect_x += 2.0*left_grey;',
			'edgeDetect_x += -2.0*right_grey;',
			'edgeDetect_x += 1.0*bottom_left_grey;',
			'edgeDetect_x += 0.0*bottom_bottom_grey;',
			'edgeDetect_x += -1.0*bottom_right_grey;',


			'float edgeDetect_y = 0.0;',
			'edgeDetect_y += 0.0*middle_grey;',
			'edgeDetect_y += 1.0*top_left_grey;',
			'edgeDetect_y += 2.0*top_top_grey;',
			'edgeDetect_y += 1.0*top_right_grey;',
			'edgeDetect_y += 0.0*left_grey;',
			'edgeDetect_y += 0.0*right_grey;',
			'edgeDetect_y += -1.0*bottom_left_grey;',
			'edgeDetect_y += -2.0*bottom_bottom_grey;',
			'edgeDetect_y += -1.0*bottom_right_grey;',


			'float edgeDetect_magnitude = 0.0;',
			'edgeDetect_magnitude += sqrt(edgeDetect_x*edgeDetect_x + edgeDetect_y*edgeDetect_y);',
			

			// blurr calculation
			'vec3 blur = vec3(0.0);',
			'blur += (1.0/9.0)*(middle+top_left+top_top+top_right+left+right+bottom_left+bottom_bottom+bottom_right);',


			'if(greyScaleActive == 1.0){',
				'gl_FragColor = vec4 (middle_grey, middle_grey, middle_grey, 1.0);',
			'}else if(edgeDetectionActive == 1.0){',
				'gl_FragColor = vec4 (edgeDetect_magnitude, edgeDetect_magnitude, edgeDetect_magnitude ,1.0);',
			'}else if(blurActive == 1.0){',
				'gl_FragColor = vec4 (blur,1.0);',
			'}else{',
				'gl_FragColor = (texture2D(texture, vUV).rgba);',
			'}',
			
			// 'gl_FragColor = vec4(, 0.0, 0.0, 1.0);', //1.0 is opaque
			// 'gl_FragColor = (texture2D(texture, vUV).rgba);',
			// 'gl_FragColor = vec4(color,1.0);',

		'}',
	].join('\n');


	// using THREE.js we use a material variable and pass uniforms, vertexShader and 
	// fragmentShader

	var dimension = [500, 500];
	var material = new THREE.ShaderMaterial({
		uniforms:{
			texture: {type: 't'},
			dimension: {type: 'v2', value: dimension},
			edgeDetectionActive: {type: 'f', value: 0.0},
			greyScaleActive: {type: 'f', value: 0.0},
			blurActive: {type: 'f', value: 0.0},

		},
		vertexShader: vShader, 
		fragmentShader: fShader, // mandatory
	});
	
	window.material = material;

	// adding mesh to the scene
	var mesh = new THREE.Mesh(plane, material);
	scene.add( mesh );

	function onWindowResize() {
		camera.aspect = 500 / 500;
		camera.updateProjectionMatrix();
		renderer.setSize(500 / 500);
	}

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

