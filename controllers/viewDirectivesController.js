'use Strict'

app.controller('viewDirectivesController', ["$scope", "$window", "$http", "$cookieStore", "$location", "$rootScope", "AuthService",
	function($scope, $window, $http, $cookieStore, $location, $rootScope, AuthService) {
		/* Pie gauges */

		$scope.totalMonths = [{
			"full_month": "January",
			"total_days": "31",
			"month_interger": "01",
			"month_int": "1"
		}, {
			"full_month": "February",
			"total_days": "28",
			"month_interger": "02",
			"month_int": "2"
		}, {
			"full_month": "March",
			"total_days": "31",
			"month_interger": "03",
			"month_int": "3"
		}, {
			"full_month": "April",
			"total_days": "30",
			"month_interger": "04",
			"month_int": "4"
		}, {
			"full_month": "May",
			"total_days": "31",
			"month_interger": "05",
			"month_int": "5"
		}, {
			"full_month": "June",
			"total_days": "30",
			"month_interger": "06",
			"month_int": "6"
		}, {
			"full_month": "July",
			"total_days": "31",
			"month_interger": "07",
			"month_int": "7"
		}, {
			"full_month": "August",
			"total_days": "31",
			"month_interger": "08",
			"month_int": "8"
		}, {
			"full_month": "September",
			"total_days": "31",
			"month_interger": "09",
			"month_int": "9"
		}, {
			"full_month": "October",
			"total_days": "31",
			"month_interger": "10",
			"month_int": "10"
		}, {
			"full_month": "November",
			"total_days": "31",
			"month_interger": "11",
			"month_int": "11"
		}, {
			"full_month": "December",
			"total_days": "31",
			"month_interger": "12",
			"month_int": "12"
		}];

		var initPieChart = function() {
			$('.chart').easyPieChart({
				barColor: function(percent) {
					percent /= 100;
					return "rgb(" + Math.round(254 * (1 - percent)) + ", " + Math.round(255 * percent) + ", 0)";
				},
				animate: 1000,
				scaleColor: '#ccc',
				lineWidth: 3,
				size: 100,
				lineCap: 'cap',
				onStep: function(value) {
					this.$el.find('span').text(~~value);
				}
			});
		};

		$(document).ready(function() {
			initPieChart();
		});

		$scope.gotoCreateDirective = function() {
			$location.path("/new-directive");
		}

		$scope.gotoViewDirective = function(id) {
			$location.path("/directive/" + id);
		}

		// Select All Month
		$scope.selectAllMonth = function() {
			$scope.selectedMonth = "all";
			apply_initiative_filters();
		}

		$scope.selectedMonth = "all";
		$scope.today = new Date();
		$scope.year = $scope.today.getFullYear();
		$scope.pageloader = false;

		// Select One Month
		$scope.selectMonth = function(month, index) {
			if (month) {
				$scope.post_data = {
					'month': month.month_int
				}
				$scope.selectedMonth = month.full_month;
				$scope.priority_month = month.month_int;

			}
			else {
				$scope.post_data = {

					'month': 0
				}
				$scope.selectedMonth = 'All';
			}
			apply_initiative_filters();
		}

		function monthfilter() {
			if ($scope.selectAllMonth != 'all') {

				$scope.all_directives.filter(function(directive) {
					return directive;
				})
			}
		}

		function apply_initiative_filters() {

			var filtered_initiative_list;
			if ($scope.selectedMonth != 'all')

				$http({
				method: 'POST',
				url: base_url + 'rest/directive',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': $scope.userData.token
				},
				data: $scope.post_data,
			}).then(function(res) {

				$scope.all_directives = res.data;
			});

			else
			// Get all Initiative  List
				$http({
				method: 'GET',
				url: base_url + 'rest/directives',
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(function(res) {

				$scope.all_directives = res.data;

				// $scope.totalList = [];

			});
		}


		$scope.viewDirectivesInit = function() {
			$scope.userData = $cookieStore.get('userData');
			if ($scope.userData != undefined) {
				$scope.pageloader = true;
				$http({
					method: 'GET',
					url: base_url + 'rest/directives',
					headers: {
						'Content-Type': 'application/json'
					}
				}).then(function(res) {

					$scope.all_directives = res.data;
					$scope.pageloader = false;
					// $scope.totalList = [];

				});
			}
			else {
				$location.path("/");
			}

		}



	}
]);
