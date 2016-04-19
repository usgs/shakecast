app.directive('topLock', function ($window) {
    var $win = angular.element($window); // wrap window object as jQuery object
    //locked_height = 0
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var topClass = attrs.topLock, // get CSS class from directive's attribute value
                offsetTop = element.prop('offsetTop'), // get element's offset top relative to document
                padTop = parseInt(attrs.paddingTop, 10),
                parent = element.parent(),
                offsetTop;
                
            $win.on('scroll', function (e) {
                offsetTop = parent.prop('offsetTop') - padTop;
                if ($window.pageYOffset >= offsetTop) {
                    element.addClass(topClass);
                    
                    margin = parseInt(element.css('margin-bottom').replace('px', '')) + parseInt(element.css('margin-top').replace('px', ''))
                    parent.height(element.height() + margin);
                    if (!element.hasClass(topClass)) {
                        //$('body').css('margin-top', parseInt($('body').css('margin-top').replace("px", "")) + element.prop('offsetHeight'))
                        
                        //element.removeClass('removed')
                        //locked_height = locked_height + element.prop('offsetHeight')
                    }
                    
                } else {
                    element.removeClass(topClass);
                    parent.css("height", null);
                    
                    if (!element.hasClass('removed')) {
                        //$('body').css('margin-top', parseInt($('body').css('margin-top').replace("px", "")) - element.prop('offsetHeight'))
                        //element.addClass('removed');
                        
                        
                        //locked_height = locked_height - element.prop('offsetHeight')
                    }
                }
            });
        } 
    };
});