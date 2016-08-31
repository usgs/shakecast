app.factory("groupService", function($http) {
  return {
     getAllGroups: function() {
					var url = "/admin/get/groups";
        return $http.get(url);

     }

  };
});