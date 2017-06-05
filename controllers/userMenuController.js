'use Strict'

app.controller('userMenuController', ["$scope", "$window", "$http", "$cookieStore", "$location", "$rootScope", "AuthService", "localStorageService", "$route", "$templateCache",

	function($scope, $window, $http, $cookieStore, $location, $rootScope, AuthService, localStorageService, $route, $templateCache) {


		//jquery code
		$(function() {
			"use strict";

			$('.header-nav > li').hover(function() {
					$(this).addClass('sfHover');
				},
				function() {
					$(this).removeClass('sfHover');
				});
		});

		new WOW().init();

		if (!(/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i).test(navigator.userAgent || navigator.vendor || window.opera)) {
			skrollr.init({
				forceHeight: false,
				smoothScrolling: true
			});
		}

		$scope.userMenuInit = function() {
			if (AuthService.user_logged_in()) {
				$scope.userData = $cookieStore.get('userData');
				$http({
					method: 'POST',
					url: "//product-management-agilexcyber.c9users.io/public/user/token",

				}).then(function(res) {
					if (res.data.token != $cookieStore.get('userData').token) {
						console.log("logout need")
						$cookieStore.remove('userData');
						$location.path('login');
					}

				});
			}
			else {
				$location.path('login');
			}
		}

		$scope.userLogout = function() {
			localStorageService.clearAll();
			if (AuthService.user_logged_in()) {
				$http({
					method: 'POST',
					url: base_url + "rest/user/logout",
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-Token': $scope.userData.token
					}
				}).then(function(res) {
					$cookieStore.remove('userData');
					$location.path('/login');
				})
			}
			else {
				$location.path('/login');
			}
		}
		$scope.userPass = function() {
			console.log("..userLogin..");
			var user_name = $scope.user_name;

			var postdata = {
				"username": user_name
			}
			console.log(postdata);
			if (user_name == "" || user_name == "null" || user_name == undefined) {
				$scope.error_message = "Enter Username";
			}


			else {
				$scope.error_message = "";
				$http({
					method: 'POST',
					url: base_url + "public/password_reset",
					async: "false",
					headers: {
						'Content-Type': 'application/json'
					},
					data: postdata,
				}).then(function(res) {}), (function(error) {
					console.log(error);
				});
			}
		}

		$scope.goToEditProfile = function() {
			$location.path('/all-users/' + $scope.userData.user_name);
		}


		$scope.goToCreateInitiative = function() {
			localStorageService.remove("directiveId");
			var currentPageTemplate = $route.current.templateUrl;
			$templateCache.remove(currentPageTemplate);
			$route.reload();
			$window.location.assign('new-initiative');
		}
	}
]);
