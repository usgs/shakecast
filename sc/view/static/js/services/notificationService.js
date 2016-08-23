app.factory("notificationService", function($http) {
  return {
     getNotification: function(groupID, notType, params={}) {
		var url = "/admin/get/notification/" + $scope.group.shakecast_id + "/" + $scope.notType.value
        return $http.get(url, {params: params});

     }

  };
});