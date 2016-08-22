app.controller('notController', function($scope, $http) {
    $scope.templateHTML = ""
    $scope.notification = "new_event"
    $scope.groups = []
    $scope.curGroup = {}
    // get groups
    $http.get("/admin/get/groups", {params: {last_id: 0, all: true}})
        .then(
            function(response){
                $scope.groups = response.data
                $scope.curGroup = response.data[0]

                $scope.getNotification()
            }, 
            function(){
                $scope.groups = []
            }
        );

    // get notification 
    $scope.getNotification = function() {
        $http.get("/admin/get/notification/" + $scope.curGroup.shakecast_id + "/" + $scope.notification)
            .then(
                function(response){
                    $scope.templateHTML = response.data
                }
            )
    };
});