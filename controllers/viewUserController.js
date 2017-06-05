'use Strict'

app.controller('viewUserController', ["$scope", "$window", "$http", "$cookieStore", "$location", "$rootScope", "AuthService", "$routeParams",

	function($scope, $window, $http, $cookieStore, $location, $rootScope, AuthService, $routeParams) {


		$scope.form = {};
		$scope.userData = $cookieStore.get('userData');
		var last_path = window.location.href.substr(window.location.href.lastIndexOf('/') + 1)
		$scope.form.userID = last_path;
		var title_string = $routeParams.id;
		title_string = title_string.replace(/[^a-z\d\s]+/gi, "");
		title_string = title_string.replace(/ /g, "_");
		$rootScope.pageTitle = "Initiative.ly  | User : " + title_string;
		$http({
			method: 'POST',
			url: base_url + 'rest/userProfile',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRF-Token': $scope.userData.token
			},
			data: $scope.form,

		}).success(function(data) {
			$scope.user = data.userDetails;
		})

		$scope.submitForm = function(image) {
			$http({
				method: 'POST',
				url: base_url + 'rest/updateProfile',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': $scope.userData.token
				},
				data: $scope.user,

			}).success(function(data) {
				if (data.userDetails) {
					alert('User Updated Successfully');
					$location.path("/all-users/" + data.userDetails.userName);
				}
				else {
					alert(data.responseMessage);
				}
			})
		}



		$scope.stepsModel = "img/profile.png"

		$scope.imageUpload = function(event) {
			var files = event.target.files; //FileList object

			for (var i = 0; i < files.length; i++) {
				//   console.log(i);
				var file = files[i];
				var type = JSON.stringify(file.type)
				if (!file.type.match('image.*')) {
					console.log(file.size);
					$scope.stepsModel = "img/profile.png"
					$scope.loadImage = false;
					return false;

				}
				else {
					if (file.type == 'image/gif') {
						console.log(file.size);
						$scope.stepsModel = "img/profile.png"
						$scope.loadImage = false;

						return false;
					}
					else if (file.size > 1024000) {

						$scope.stepsModel = "img/profile.png"
						$scope.loadImage = false;

						return false

					}
					else {
						$scope.loadImage = true;
						var reader = new FileReader();
						reader.onload = $scope.imageIsLoaded;
						reader.readAsDataURL(file);
					}
				}

			}
		}

		$scope.pic = 1;
		$scope.imageIsLoaded = function(e) {
			$scope.$apply(function() {
				$scope.stepsModel = e.target.result;
				console.log($scope.stepsModel)
				$scope.user.userPic = $scope.stepsModel;
				console.log($scope.user)
			});
		}
	}

]);
