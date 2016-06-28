app.controller('settingsController', function($scope, $http) {
    $http.get('/admin/get/settings')
        .then(
            function(response) {
                $scope.settings = response.data
            }
        )
    
    $scope.geo_json_options = [{value:'Yes',
                               sc_val: true},
                               {value: 'No',
                               sc_val: false}]
    
    $scope.use_geo_json = $scope.geo_json_options[0]
    
    $scope.smtp_password = ''
    $scope.db_password = ''
    $scope.proxy_password = ''
    
    $scope.save = function() {
        if ($scope.smtp_password !== '') {
           $scope.settings.SMTP.password = $scope.smtp_password
        }
        if ($scope.db_password !== '') {
            $scope.settings.DBConnection.password = $scope.db_password
        }
        if ($scope.proxy_password !== '') {
            $scope.settings.Proxy.password = $scope.proxy_password
        }
        
        // validate settings here
        
        $http.post('/admin/settings/', JSON.stringify({settings: $scope.settings}))
    }
    
});