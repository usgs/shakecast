app.controller('uploadController', function($scope) {
    
    /*
    // JQuery for dropzone    
    $('.dropzone').on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        $(this).addClass('dragover')
    });
        
    $('.dropzone').on('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        $(this).addClass('dragover')
    });
    
    $('.dropzone').on('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        $(this).removeClass('dragover')
    });
    
    $('.dropzone').on('drop', function(e) {
        e.preventDefault();
        $(this).removeClass('dragover')
        
        console.log(e.originalEvent.dataTransfer)
    });
    
    var upload = function(files) {
        
    }
    */
    $scope.dropzoneConfig = {
    'options': { // passed into the Dropzone constructor
      'url': '/admin/upload/'
    },
    'eventHandlers': {
      'sending': function (file, xhr, formData) {
      },
      'success': function (file, response) {
      }
    }
  };
    
});