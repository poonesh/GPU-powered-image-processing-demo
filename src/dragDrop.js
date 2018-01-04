// Drag and Drop code for Upload
// drag and drop dictionary is a collection of keys and values (functions) 
// to drag and drop the images inside thumbnailImage
// the main reason that we have uses dictionary here is to organize these 
// functions 

var material = null;
export function setMaterial(m){
	material = m;
};

export var dragdrop = {
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

// drag and drop thumbnail images in main Editor div
export function initializeDragDrop(){
	$("#mainEditor").on("drop", drop);
	$("#mainEditor").on("dragover", allowDrop);
}

function allowDrop(ev){
	ev.originalEvent.preventDefault();
}


// function to capture a file(image) and upload it to the browser
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
		  	myImageTag.on('dragstart', drag);
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

