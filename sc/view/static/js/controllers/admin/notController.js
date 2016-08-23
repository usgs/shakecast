app.controller("notController", function($scope, $http, groupService) {
    $scope.templateHTML = ""
    $scope.notTypes = [{name: "New Event", 
                        value: "new_event"}, 
                       {name: "Inspection",
                        value: "inspection"}]
    $scope.notType = $scope.notTypes[0]
    $scope.groups = []
    $scope.group = {}

    // get groups
    groupService.getAllGroups()
        .success(function(groups) {
            $scope.groups = groups
            $scope.group = groups[0]
        })

    // get notification 
    $scope.getNotification = function() {
        $http.get("/admin/get/notification/" + $scope.group.shakecast_id + "/" + $scope.notType.value)
            .then(
                function(response){
                    $scope.templateHTML = response.data
                }
            )
    }

    $scope.getNotification()

})