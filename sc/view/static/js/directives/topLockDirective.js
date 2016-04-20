app.directive('topLock', function ($window) {
    var $win = angular.element($window); // wrap window object as jQuery object
    //locked_height = 0
    
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var topClass = attrs.topLock, // get CSS class from directive's attribute value
                name = attrs.divName,
                offsetTop = element.prop('offsetTop'), // get element's offset top relative to document
                padTop = parseInt(attrs.paddingTop, 10),
                parent = element.parent(),
                offsetTop;
                
            $win.on('scroll', function (e) {
                offsetTop = parent.prop('offsetTop') - padTop;
                if ($window.pageYOffset >= offsetTop) {
                    element.addClass(topClass);
                    element.css('top', padTop);
                    margin = parseInt(element.css('margin-bottom').replace('px', '')) + parseInt(element.css('margin-top').replace('px', ''))
                    parent.height(element.height() + margin);
                    
                    if (name === 'navbar') {
                        
                        element.addClass('locked-navbar', {duration:200, children: true})
                    }
                } else {
                    element.removeClass(topClass);
                    parent.css("height", null);
                    
                    if (name === 'navbar') {
                        element.removeClass('locked-navbar', {duration:200, children: true})
                    }
                }
            });
        } 
    };
});