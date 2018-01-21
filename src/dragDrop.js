
// dragdrop object(dictionary) is a collection of keys and values (functions) to drag and drop the images 
// inside thumbnailImage div. A function is assigned to init key which handels the events "drop", "dragenter",
// "dragover", "dragleave". The main reason to use dictionary here is to organize the event handler functions.
// The function assigned to drop key, will take the data(images) through e.dataTransfer.files. Then iterate 
// through the files and upload the files inside the thumbnailImage div by calling runUpload function. 


// defining global variables
var images_per_row = 3;
var allMaterials = [];
var total_image_num = 0;
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
export	function runUpload(file, myDiv, current_image_id){
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

	  } // END reader.onload()
	} // END test if file.type === imagerun
}

// Setter functions
export function registerMaterialForDragDropUpdates(m){
	allMaterials.push(m);
}

export function getMesh(m){
	mesh = m;
}

function adjustMeshVerticesUsingNewWidthandHeight(texture_width, texture_height){

	var width_height_ratio = (texture_height/texture_width);
	var new_height = width_height_ratio * 2.0;
	var vertices = mesh.geometry.attributes.position.array;
	var newVertices = [-1.0, -new_height/2.0, 1.0, 1.0, -new_height/2.0, 1.0, 1.0, new_height/2.0, 1.0, 
	1.0, new_height/2.0, 1.0, -1.0, new_height/2.0, 1.0, -1.0, -new_height/2.0, 1.0];

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


export var dragdropUpload = {
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
            $(dragdropUpload.elem).css({ 'border': 'solid 2px #333333' }); //it is jQuery(css and $)
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
            $(dragdropUpload.elem).css({ 'border': 'solid 2px #0000FF' });
        }
    },

    leave: function(e) {
        // set element border back to grey
        if (dragdropUpload.elem !== null) {
            $(dragdropUpload.elem).css({ 'border': 'solid 2px #333333' });
        }
    }
};

function dragToEditingDiv(ev){
	ev.originalEvent.dataTransfer.setData("text", ev.originalEvent.target.id);
}

function dropToEditingDiv(ev){ //drop function works when I am releasing the mouse
	var data = ev.originalEvent.dataTransfer.getData("text");
	var imgSrc = document.getElementById(data).getAttribute("src");
	
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
export function initializeDragDrop(){
	$("#mainEditor").on("drop", dropToEditingDiv);
	$("#mainEditor").on("dragover", allowDropToEditingDiv);
}

function allowDropToEditingDiv(ev){
	ev.originalEvent.preventDefault();
}


export function initializeUploadImage(){
	if (window.FileReader){
		// initializing the 'droppingDiv' div to HTML5 drag and drop calls
		dragdropUpload.init(select('droppingDiv').el);
		// bind the input [type="file"] to the function runUpload()
		select('fileUpload').onChange(function(){
			if (total_image_num > 5){
				console.error("you cannot upload more than six pictures");
				return;
			};

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
		select(droppingDiv).el.innerHTML = ''; 
		select(droppingDiv).el.appendChild( p );
	}
};
