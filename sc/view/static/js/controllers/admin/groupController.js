app.controller('groupController', function($scope, $http) {
    $scope.group_data = []
    $scope.getGroups = function(lastID=0, filter={}) {
        $http.get('/admin/get/groups', {params: {last_id: lastID, filter: filter}})
            .then(
                function(response){
                    if (lastID == 0) {
                        cur_group_pos = 0
                    } else {
                        cur_group_pos = $scope.group_data.length
                    }
                    
                    $scope.group_data = $scope.group_data.concat(response.data)
                    $scope.lastID = $scope.group_data.slice(-1)[0].shakecast_id
                }, 
                function(response){
                    $scope.group_data = []
                }
            );
    }
    
    $scope.getGroups(0)
});