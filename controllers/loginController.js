'use Strict'

app.controller('loginController', ["$scope", "$window", "$http", "$cookieStore", "$location", "$rootScope", "AuthService",
    function($scope, $window, $http, $cookieStore, $location, $rootScope, AuthService) {



        $scope.error_message = "";
        if (!AuthService.user_logged_in()) {
            $scope.userLogin = function() {
                var user_name = $scope.user_name;
                var user_password = $scope.user_password;
                var timeStamp = Math.floor(Date.now() / 1000);
                var postdata = {
                    "username": user_name,
                    "password": user_password,
                }
                if (user_name == "" || user_name == "null" || user_name == undefined) {
                    $scope.error_message = "Enter Username";
                }
                else if (user_password == "" || user_password == "null" || user_password == undefined) {
                    $scope.error_message = "Enter Password";
                }
                else {
                    $scope.error_message = "";
                    console.log("userLogin Post");
                    $http({
                        method: 'POST',
                        url: "//product-management-agilexcyber.c9users.io/public/user/login",
                        async: "false",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: "username=" + user_name + "&password=" + user_password,
                    }).then(function(res) {
                        console.log(res);
                        if (res.status == 200 && res.data.token) {
                            var expireDate = new Date();
                            expireDate.setDate(expireDate.getDate() + 1);
                            // delete cookie after 1 day - this is not synchronised with drupal
                            if (res.data.user.picture)
                                var avatar = res.data.user.picture.url;
                            else
                                avatar = './assets/image-resources/gravatar.jpg';
                            $userData = {
                                'user_name': res.data.user.name,
                                'roles': res.data.user.roles,
                                'user_id': res.data.user.uid,
                                'token': res.data.token,
                                'avatar': avatar,
                                'expires': expireDate
                            };
                            $cookieStore.put('userData', $userData);
                            $location.path("/all-initiatives");
                        }
                    }), (function(error) {
                        console.log(error);
                    });
                }
            }


        }
        else {
            console.log("session is here else Part  Not post Part");
            console.log(AuthService.user_logged_in());
            $location.path("/all-initiatives");
        }


    }
]);
