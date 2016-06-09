app.controller('userController', function($scope, $http) {
    $scope.user_data = []
    $scope.getUsers = function(lastID=0, filter={}) {
        $http.get('/admin/get/users', {params: {last_id: lastID, filter: filter}})
            .then(
                function(response){
                    if (lastID == 0) {
                        cur_user_pos = 0
                    } else {
                        cur_user_pos = $scope.user_data.length
                    }
                    
                    $scope.user_data = $scope.user_data.concat(response.data)
                    $scope.lastID = $scope.user_data.slice(-1)[0].shakecast_id
                }, 
                function(response){
                    $scope.fac_data = []
                }
            );
    }
    
    $scope.getUsers(0)
});