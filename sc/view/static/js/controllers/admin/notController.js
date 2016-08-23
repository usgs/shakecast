app.controller("notController", function($scope, $http, groupService, notificationService) {
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
            
            $scope.getNotification()
        })

    // get notification 
    $scope.getNotification = function() {
        notificationService.getNotification($scope.group.shakecast_id, $scope.notType.value)
            .success(function(templateHTML) {
                $scope.templateHTML = templateHTML
            })
    }

})