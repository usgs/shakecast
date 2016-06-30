app.directive('topLock', function ($window, $timeout) {
    
    var $win = angular.element($window); // wrap window object as jQuery object
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            
            var top_lock = function() {
                var topClass = attrs.topLock, // get CSS class from directive's attribute value
                    name = attrs.divName,
                    offsetTop = element.prop('offsetTop'), // get element's offset top relative to document
                    padTop = parseInt(attrs.paddingTop, 10),
                    parent = element.parent(),
                    offsetTop;
                    
                offsetTop = parent.prop('offsetTop') - padTop;
                if (($window.pageYOffset >= offsetTop) && ($window.pageYOffset != 0)) {
                    element.addClass(topClass);
                    element.css('top', padTop);
                    margin = parseInt(element.css('margin-bottom').replace('px', '')) + parseInt(element.css('margin-top').replace('px', ''))
                    parent.height(element.height() + margin);
                    
                    if (name === 'navbar') {
                        
                        //element.addClass('locked-navbar', {duration:200, children: true})
                    }
                } else {
                    element.removeClass(topClass);
                    parent.css("height", null);
                    
                    if (name === 'navbar') {
                        //element.removeClass('locked-navbar', {duration:200, children: true})
                    }
                }
            }
            
            $win.on('scroll', function(e) {top_lock()});
            top_lock()
        } 
    };
});