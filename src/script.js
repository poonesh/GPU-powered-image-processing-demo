// the code is from https://codepen.io/doughensel/pen/zGMmop

var dragdrop = {};
var total_image_num = 0;
$(document).ready(function(){

	'use strict';
	(function(){
	// http://stackoverflow.com/questions/4083351/what-does-jquery-fn-mean
		var select = function( elem ){
			if (!(this instanceof select)){
	      return new select(elem);
			}
			this.el = document.getElementById( elem );
		};
		window.select = select;
		select.prototype = {
			onChange : function( callback ){
				this.el.addEventListener('change', callback );
				return this;
			}
		};
	})();

	// Drag and Drop code for Upload
	dragdrop = {
        elem: null,
		init: function(elem){
			elem.addEventListener('drop', dragdrop.drop);
			elem.addEventListener('dragover', dragdrop.drag);
            dragdrop.elem = elem;
		},

		drop: function(e){
			e.preventDefault();
			// To upload more than one image we can loop over the file
			// and runUpload the files one by one

			var file = e.dataTransfer.files;
			var previous_image_num = total_image_num;
			total_image_num += file.length;
			if (total_image_num > 5){
                console.error("you cannot upload more than five pictures");
                return;
            }
			for (var i=0; i<file.length; i++){
				var myDiv = $('<div></div>');
				runUpload(file[i], myDiv);
				myDiv.css({"left":`${105 * (previous_image_num+i) }px`, "position":"absolute"});
				$('body').append(myDiv);
			}

		},

		drag: function(e){
			e.preventDefault();
            if (dragdrop.elem !== null) {
                $(dragdrop.elem).css({ 'border': 'solid 2px #0000FF' });
            }
		}

	};

	// Code to capture a file(image) and upload it to the browser
	function runUpload(file, myDiv){
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
			myImageTag.attr("src",file_being_loaded.target.result);
			myDiv.append(myImageTag);

		  } // END reader.onload()
		} // END test if file.type === image
	}


	// window.onload
	window.onload = function(){
		if (window.FileReader){
			// connect the DIV surrounding the file upload to HTML5 drag and drop calls
			console.log(select('droppingDiv'));
			dragdrop.init( select('droppingDiv').el );
			// bind the input [type="file"] to the function runUpload()
			select('fileUpload').onChange(function(){runUpload(this.files[0]);});
		}else{
			// report error message if FileReader is unavialable
			var p = document.createElement('p');
			var msg = document.createElement('Sorry, your browser does not support FileReader.');
			p.className = 'error';
			p.appendChild( msg );
			select(droppingDiv).el.innerHTML = '';
			select(droppingDiv).el.appendChild( p );
		}

	};

});
