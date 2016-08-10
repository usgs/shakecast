$(function(){
	
	var dropbox = $('#dropbox'),
		message = $('.message', dropbox);
	
	var quote_temp = '<blockquote class="bs-callout bs-callout-info">' +
		  '<p></p>' +
		'</blockquote>';

	dropbox.filedrop({
		// The name of the $_FILES entry:
		paramname:'pic',
		username: SC_DEF.user,
		password: SC_DEF.pass,
		
		maxfiles: 5,
    	maxfilesize: 500,
		url: '/scripts/r/post_file',
		
		uploadFinished:function(i,file,response){
			$.data(file).addClass('done');
			var  results =  $.parseJSON(response);
			
			var preview = $(quote_temp);
			$("#quote").show();
			$("#quote").html(preview);

			var context = $('#quote blockquote');
			$(context).append('<div class="col-md-3">' + results.filename + ' </div>');
			var actions = results.action;
			for (var key in actions) {
				var prog = actions[key];
				if (prog.result > 0) {
				//$(context).append(key);
				if (key == 'scenario_event' || key == 'test_event') {
				$(context).append(
				'<form class="form-inline" role="form" id="update_inventory">' + 
				'<div class="form-group">' +
				  '<label class="sr-only" for="program">Manage Program</label>' +
				'<input type="text" class="form-control" name="program" id="program" value="'+key+'">' +
				'</div>' +
				'<div class="form-group">' +
				'<input type="hidden" name="filename" value="' + results.filename + '">' +
				'<input type="hidden" name="username" value="' + username + '">' +
				'<input type="hidden" name="password" value="' + password + '">' +
				'</div>' + 
				'<button type="submit" class="btn btn-default">Submit</button>' + 
			      '</form>'
			      );
				} else if (key == 'img') {
				$(context).append(
				'<div class="col-md-3">Saved into image directory.</div>'
			      );
					
				} else {	
				$(context).append(
				'<form class="form-inline" role="form" id="update_inventory">' + 
				'<div class="form-group">' +
				  '<label class="sr-only" for="program">Manage Program</label>' +
				'<input type="text" class="form-control" name="program" id="program" value="'+key+'">' +
				'</div>' +
				'<div class="radio">' + 
				  '<label><input type="radio" name="option" value=""> Update ' + '</label>' +
				  '<label><input type="radio" name="option" value="delete"> Delete '  + '</label>' +
				'</div>' + 
				'<div class="form-group">' +
				'<input type="hidden" name="filename" value="' + results.filename + '">' +
				'<input type="hidden" name="username" value="' + username + '">' +
				'<input type="hidden" name="password" value="' + password + '">' +
				'</div>' + 
				'<button type="submit" class="btn btn-default">Submit</button>' + 
			      '</form>'
			      );
				}
				
				}
			}
			$("#update_inventory").submit(function() {

			var url = "/scripts/r/update_inventory"; // the script where you handle the form input.
			$.ajax({
			       type: "POST",
			       url: url,
			       data: $("#update_inventory").serialize(), // serializes the form's elements.
			       success: function(data)
			       {
				   alert(data.result); // show response from the php script.
			       }
			     });
		    
			return false; // avoid to execute the actual submit of the form.
			});
		},
		
    	error: function(err, file) {
			switch(err) {
				case 'BrowserNotSupported':
					showMessage('Your browser does not support HTML5 file uploads!');
					break;
				case 'TooManyFiles':
					alert('Too many files! Please select 5 at most! (configurable)');
					break;
				case 'FileTooLarge':
					alert(file.name+' is too large! Please upload files up to 2mb (configurable).');
					break;
				default:
					break;
			}
		},
		
		// Called before each upload is started
		beforeEach: function(file){
			/*if(!file.type.match(/^image\//)){
				alert('Only images are allowed!');
				
				// Returning false will cause the
				// file to be rejected
				return false;
			}*/
		},
		
		uploadStarted:function(i, file, len){
			createImage(file);
		},
		
		progressUpdated: function(i, file, progress) {
			$.data(file).find('.progress').width(progress);
		}
    	 
	});
	
	var template = '<div class="preview">'+
						'<span class="imageHolder">'+
							'<img />'+
							'<span class="uploaded"></span>'+
						'</span>'+
						'<div class="progressHolder">'+
							'<div class="progress"></div>'+
						'</div>'+
					'</div>'; 
	
	
	function createImage(file){

		var preview = $(template), 
		image = $('img', preview);
		
		image.width = 100;
		image.height = 100;
			
		var filename = file.name;
		//$('h4', preview).html(filename);
		if(!file.type.match(/^image\//)){
			var get_ext = filename.split('.');
			// reverse name to check extension
			get_ext = get_ext.reverse();
			var img_path = '/images/' + get_ext[0].toLowerCase() + '.png';
			image.attr('src',img_path);
		} else {
			var reader = new FileReader();
			
			reader.onload = function(e){
				
				// e.target.result holds the DataURL which
				// can be used as a source of the image:
				
				image.attr('src',e.target.result);
			};
			
			// Reading the file as a DataURL. When finished,
			// this will trigger the onload function above:
			reader.readAsDataURL(file);
		}

		
		message.hide();
		preview.appendTo(dropbox);
		
		// Associating a preview container
		// with the file, using jQuery's $.data():
		
		$.data(file,preview);
	}

	function showMessage(msg){
		message.html(msg);
	}

});
