app.factory("notificationService", function($http) {
  return {
     getNotification: function(params={}) {
					var url = "/admin/get/groups";
        return $http.get(url, {params: params});

     }

  };
});