// the code is from https://codepen.io/doughensel/pen/zGMmop
$(document).ready(function(){

	'use strict';
	(function(){
	// http://stackoverflow.com/questions/4083351/what-does-jquery-fn-mean
		var $ = function( elem ){
			if (!(this instanceof $)){
	      return new $(elem);
			}
			this.el = document.getElementById( elem );
		};
		window.$ = $;
		$.prototype = {
			onChange : function( callback ){
				this.el.addEventListener('change', callback );
				return this;
			}
		};
	})();

	// Drag and Drop code for Upload
	var dragdrop = {
		init : function(elem){
			elem.setAttribute('ondrop', 'dragdrop.drop(event)');
			elem.setAttribute('ondragover', 'dragdrop.drag(event)');
		},

		drop : function(e){
			e.preventDefault();
			// To upload more than one image we can loop over the file
			// and runUpload the files one by one
			var file = e.dataTransfer.files[0];
			runUpload(file);
		},

		drag : function(e){
			e.preventDefault();
		}

	};

	// Code to capture a file(image) and upload it to the browser
	function runUpload(file){
		if( file.type === 'image/png' ||
			file.type === 'image/jpg' ||
			file.type === 'image/jpeg'||
			file.type === 'image/gif' ||
			file.type === 'image/bmp' ){
		  var reader = new FileReader();
		  var image = new Image();
		  reader.readAsDataURL( file );
		  // customizing the onload method and how to do onload
		  reader.onload = function(file_being_loaded){
		  	$('droppedImage').el.src = file_being_loaded.target.result;
		  	$('droppedImage').el.style.display = 'inline';

		  } // END reader.onload()
		} // END test if file.type === image
	}


	// window.onload
	window.onload = function(){
		if (window.FileReader){
			// connect the DIV surrounding the file upload to HTML5 drag and drop calls
			console.log($('droppingDiv'));
			dragdrop.init( $('droppingDiv').el );
			// bind the input [type="file"] to the function runUpload()
			$('fileUpload').onChange(function(){runUpload(this.files[0]);});
		}else{
			// report error message if FileReader is unavialable
			var p = document.createElement('p');
			var msg = document.createElement('Sorry, your browser does not support FileReader.');
			p.className = 'error';
			p.appendChild( msg );
			$(droppingDiv).el.innerHTML = '';
			$(droppingDiv).el.appendChild( p );
		}

	};

});
