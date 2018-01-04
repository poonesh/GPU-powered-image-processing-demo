
// dragdrop object(dictionary) is a collection of keys and values (functions) to drag and drop the images 
// inside thumbnailImage div. A function is assigned to init key which handels the events "drop", "dragenter",
// "dragover", "dragleave". The main reason to use dictionary here is to organize the event handler functions.
// The function assigned to drop key, will take the data(images) through e.dataTransfer.files. Then iterate 
// through the files and upload the files inside the thumbnailImage div by calling runUpload function. 

var material = [];

export function addMaterial(m){
	material.push(m);
};

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
		var file = e.dataTransfer.files;
		if (total_image_num > 5){
            console.error("you cannot upload more than six pictures");
            return;
        }
		for (var i=0; i<file.length; i++){
			var previous_image_num = total_image_num;
			// converting linear index to 2D index for thumbnail images
			var xIndex = previous_image_num % images_per_row; 
            var yIndex = Math.floor(previous_image_num / images_per_row);

            var leftOffset = xIndex * 105;
            var topOffset = yIndex * 105;

			var myDiv = $('<div></div>');
			runUpload(file[i], myDiv, total_image_num);
			total_image_num += 1;

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
	for (let i=0; i<material.length; i++){
		material[i].uniforms.texture.value = texture;
	}
}

// drag and drop thumbnail images in main Editor div
export function initializeDragDrop(){
	$("#mainEditor").on("drop", dropToEditingDiv);
	$("#mainEditor").on("dragover", allowDropToEditingDiv);
}

function allowDropToEditingDiv(ev){
	ev.originalEvent.preventDefault();
}


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

