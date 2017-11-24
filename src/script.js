// part of the code is from https://codepen.io/doughensel/pen/zGMmop

// defining global variables
var dragdrop = {};
var total_image_num = 0;
var previous_image_num = 0;
var images_per_row = 3;
$(document).ready(function(){

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
				runUpload(this.files[0], myDiv, total_image_num); //???? I myself could not use this in line 139
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
		console.log(ev);
		ev.originalEvent.dataTransfer.setData("text", ev.originalEvent.target.id);
	}

	function drop(ev){
		ev.originalEvent.preventDefault();
		var data = ev.originalEvent.dataTransfer.getData("text");
		ev.originalEvent.target.appendChild(document.getElementById(data));
		var dropped_image = document.getElementById(data);
		dropped_image.classList.add('expanded-image');

	} 

});



























