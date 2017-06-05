'use Strict'

app.controller('viewOrgController', ["$scope", "$window", "$http", "$cookieStore", "$location", "$rootScope", "AuthService",
	function($scope, $window, $http, $cookieStore, $location, $rootScope, AuthService) {



		$(document).ready(function() {
			$('#datatable - responsive').DataTable({
				responsive: true
			});
		});
		$scope.userData = $cookieStore.get('userData');
		var last_path = window.location.href.substr(window.location.href.lastIndexOf('/') + 1)

		$http({
			method: 'GET',
			url: base_url + 'rest/userProfiles',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRF-Token': $scope.userData.token
			}
		}).then(function(res) {
			$scope.user = res.data;
			$scope.stakes = $scope.user.stakeholders;
			$scope.ui = $scope.user.ui;
			$scope.ux = $scope.user.ux;
			$scope.dev = $scope.user.dev;
			$scope.manages = $scope.user.managers;
			$scope.businesses = $scope.user.businesses;
		});

		$scope.submitForm = function(group) {
			$scope.form.group = group;
			$http({
				method: 'POST',
				url: base_url + 'rest/register',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': $scope.userData.token
				},
				data: $scope.form,

			}).success(function(data) {
				if (data.userDetails) {
					alert('User Registered Successfully');
					$window.location.reload();
				}
				else {
					alert(data.responseMessage);
				}

			})
		};

		$scope.gotoUserProfile = function(id) {
			var urlString = validUrlTitle(id);
			$location.path("/all-users/" + urlString);
		}
	}



]);
