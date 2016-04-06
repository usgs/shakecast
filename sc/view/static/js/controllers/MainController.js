app.controller('EQ_Page', ['$scope', '$http', function($scope, $http) {
    
    $scope.getEQData = function () {
        $http.get('/get/eqdata/')
            .then(
                function(response){
                    $scope.eq_data = response.data
                }, 
                function(response){
                    $scope.eq_data = 'Failed to get earthquake data from database'
                }
             );    
    }
    
    $scope.getEQData()
    //$scope.eq_data = 'some data'
    
}]);