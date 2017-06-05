'use Strict'

app.controller('viewInitiativesController', ["$scope", "$window", "$http", "$cookieStore", "$location", "$rootScope", "AuthService", "localStorageService",

	function($scope, $window, $http, $cookieStore, $location, $rootScope, AuthService, localStorageService) {




		$(document).ready(function() {
			window.scrollTo(0, 0);
			$(".panel-title a").click(function(e) {
				e.preventDefault();
			});
		});


		// $scope.debugText("viewInitiativesController");
		$scope.totalMonths = [{
			"full_month": "All Months",
			"month_interger": "all",
			"month_int": "all"
		}, {
			"full_month": "January",
			"month_interger": "01",
			"month_int": "1"
		}, {
			"full_month": "February",
			"month_interger": "02",
			"month_int": "2"
		}, {
			"full_month": "March",
			"month_interger": "03",
			"month_int": "3"
		}, {
			"full_month": "April",
			"month_interger": "04",
			"month_int": "4"
		}, {
			"full_month": "May",
			"month_interger": "05",
			"month_int": "5"
		}, {
			"full_month": "June",
			"month_interger": "06",
			"month_int": "6"
		}, {
			"full_month": "July",
			"month_interger": "07",
			"month_int": "7"
		}, {
			"full_month": "August",
			"month_interger": "08",
			"month_int": "8"
		}, {
			"full_month": "September",
			"month_interger": "09",
			"month_int": "9"
		}, {
			"full_month": "October",
			"month_interger": "10",
			"month_int": "10"
		}, {
			"full_month": "November",
			"month_interger": "11",
			"month_int": "11"
		}, {
			"full_month": "December",
			"month_interger": "12",
			"month_int": "12"
		}];
		$scope.today = new Date();
		var title_string;
		$scope.year = $scope.today.getFullYear();
		$scope.monthInteger = $scope.today.getMonth();
		$scope.selectedMonthDate = ('0' + ($scope.monthInteger + 1)).slice(-2) + '-' + $scope.year;
		$scope.selectedMonth = $scope.totalMonths[$scope.monthInteger];
		$scope.month_string = $scope.selectedMonth.full_month;
		$scope.pageloader = false;
		// Select All Month
		$scope.selectAllMonth = function() {
			$scope.selectedMonth = "all";
			$scope.month_string = "all";
			apply_initiative_filters();
		}

		// Select One Month
		$scope.SelectMonth = function(month, index) {

			if (index == 'all') {
				$scope.selectedMonth = "all";
				$scope.month_string = month.month_interger;
				$scope.month_stringname = month.full_month;
				apply_initiative_filters();
				getAllMonthCapacity('all');
			}
			else {

				$scope.post_data = {
					'month': month.month_int
				}

				$scope.selectedMonth = $scope.totalMonths[index - 1];
				$scope.selectedMonthDate = ('0' + index).slice(-2) + '-' + $scope.year;
				$scope.month_string = month.month_interger;
				$scope.month_stringname = month.full_month;

				apply_initiative_filters();
				if (index <= 9)
					capMonth = '0' + index;
				else
					capMonth = index;

				getAllMonthCapacity(capMonth);
			}
		}


		$scope.viewInitiativesInit = function() {
			$scope.userData = $cookieStore.get('userData');
			var last_path = $location.$$url.replace('/', "");


			if (AuthService.user_logged_in()) {
				$scope.pageloader = true;
				// Get all Directive List
				$http({
					method: 'GET',
					url: base_url + 'rest/node?parameters[type]=directives',
					headers: {
						'Content-Type': 'application/json'
					}
				}).then(function(res) {
					$scope.directivesList = res.data;
				});

				// Get all Product Manager List
				$http({
					method: 'GET',
					url: base_url + 'rest/views/product_managers',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-Token': $scope.userData.token
					}
				}).then(function(response) {
					$scope.productManagerList = response.data;
				});

				//*****************Get current month all Initiative List
				$http({
					method: 'GET',
					url: base_url + 'rest/views/all_initiatives_by_month?field_month_value' + $scope.selectedMonthDate,
					headers: {
						'Content-Type': 'application/json'
					}
				}).then(function(response) {
					$scope.initiativesList = response.data;
					$scope.totalList = [];
					angular.forEach($scope.initiativesList, function(value, key) {
						value["devDays"] = value.number_of_devs * value.number_of_devs_days;
						value["uxDays"] = value.number_of_ux * value.number_of_ux_days;
						value["uiDays"] = value.number_of_ui * value.number_of_ui_days;
						value["directivesList"] = JSON.parse(value.directives);
						value["productmanagersList"] = JSON.parse(value.product_managers);
					})
					$scope.totalList = $scope.initiativesList;
					$scope.pageloader = false;
					getAllMonthInitiatives();
					getAllMonthCapacity('all');
				});

				//******************Get all Initiative  List
				// $http({
				// 	method: 'GET',
				// 	url: base_url + 'rest/views/all_initiatives',
				// 	headers: {
				// 		'Content-Type': 'application/json'
				// 	}
				// }).then(function(response) {
				// 	$scope.initiativesList = response.data;
				// 	$scope.totalList = [];
				// 	angular.forEach($scope.initiativesList, function(value, key) {
				// 		value["devDays"] = value.number_of_devs * value.number_of_devs_days;
				// 		value["uxDays"] = value.number_of_ux * value.number_of_ux_days;
				// 		value["uiDays"] = value.number_of_ui * value.number_of_ui_days;
				// 		value["directivesList"] = JSON.parse(value.directives);
				// 		value["productmanagersList"] = JSON.parse(value.product_managers);
				// 	})
				// 	$scope.totalList = $scope.initiativesList;
				// 	if ($scope.totalList.length > 0)
				// 		apply_initiative_filters();
				// 	$scope.pageloader = false;
				// });

			}
			else {
				$location.path("/");
			}
			// $http({
			// 	method: 'GET',
			// 	url: base_url + 'user-detail/62',
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 		'X-CSRF-Token': $scope.userData.token
			// 	}
			// }).then(function(res) {
			// 	$scope.user = res.data;
			// });
			// console.log($scope.user);

		}


		function getAllMonthInitiatives() {
			$http({
				method: 'GET',
				url: base_url + "rest/views/all_initiatives_by_month?field_month_value=" + $scope.selectedMonthDate + "&field_month_value_op=!=",
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(function(response) {
				log("getAllMonthInitiatives" + $scope.initiativesList.length);
				$scope.allMonthinitiativesList = response.data;
				angular.forEach($scope.allMonthinitiativesList, function(value, key) {
					value["devDays"] = value.number_of_devs * value.number_of_devs_days;
					value["uxDays"] = value.number_of_ux * value.number_of_ux_days;
					value["uiDays"] = value.number_of_ui * value.number_of_ui_days;
					value["directivesList"] = JSON.parse(value.directives);
					value["productmanagersList"] = JSON.parse(value.product_managers);
				});
				$scope.totalList = $scope.initiativesList.concat($scope.allMonthinitiativesList);
				if ($scope.totalList.length > 0)
					apply_initiative_filters();

			});

		}

		function getAllMonthCapacity(month) {
			$scope.post_data = {
				'month': month
			}
			$http({
				method: 'POST',
				url: base_url + "rest/capacityStatus",
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': $scope.userData.token
				},
				data: $scope.post_data,
			}).then(function(response) {
				console.log(response);
				$scope.capacityList = response;

			});
		}


		//Filter Selection Directive
		$scope.selected_directive_ids = [];
		$scope.selectDirective = function(directive) {
			// $scope.debugText(directive);
			if (directive.Selected === true)
				$scope.selected_directive_ids.push(directive.nid);
			else
				$scope.selected_directive_ids =
				$scope.selected_directive_ids.filter(function(id) {
					return id !== directive.nid
				});

			apply_initiative_filters();

		}

		$scope.isChecked = function() {
			$scope.selected_directive_ids.indexOf()
		}

		//Filter Selection ProductManager
		$scope.selected_productManager_ids = [];
		$scope.selectProductManager = function(productmanager) {
			if (productmanager.Selected === true)
				$scope.selected_productManager_ids.push(productmanager.uid);
			else {
				$scope.selected_productManager_ids =
					$scope.selected_productManager_ids.filter(function(id) {
						return id !== productmanager.uid
					});
			}

			apply_initiative_filters();
		}


		//all filters combined 
		function apply_initiative_filters() {
			var filtered_initiative_list;
			var last_path = parseInt(window.location.href.substr(window.location.href.lastIndexOf('/') + 1));

			if (angular.isNumber(last_path))
				if ($scope.month_string != 'all')

					$http({
					method: 'POST',
					url: base_url + 'rest/directive?dir=' + last_path,
					//url: base_url + 'rest/directive',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-Token': $scope.userData.token
					},
					data: $scope.post_data,
				}).then(function(res) {
					console.log(res);
					filtered_initiative_list = res.data;
				});

				else
				// Get all Initiative  List
					$http({
					method: 'POST',
					//url: base_url + 'rest/directive',
					url: base_url + 'rest/directive?dir=' + last_path,
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-Token': $scope.userData.token
					},
					data: $scope.post_data,
				}).then(function(res) {

					filtered_initiative_list = res.data;

				});

			if ($scope.month_string != 'all') {
				//filtered_initiative_list = $scope.totalList.filter(monthFilter);
				if (last_path) {
					filtered_initiative_list = [];
					angular.forEach($scope.totalList.filter(monthFilter), function(item) {
						if (item.directives.indexOf(last_path) >= 0) {
							filtered_initiative_list.push(item);
						}

					});
				}
				else {
					filtered_initiative_list = $scope.totalList.filter(monthFilter);
				}
				//console.log(filtered_initiative_list);
			}
			else {
				//	filtered_initiative_list = $scope.totalList;
				if (last_path) {
					filtered_initiative_list = [];
					angular.forEach($scope.totalList, function(item) {
						if (item.directives.indexOf(last_path) >= 0) {
							filtered_initiative_list.push(item);
						}

					});
				}
				else {
					filtered_initiative_list = $scope.totalList;
				}

			}

			if ($scope.selected_productManager_ids.length > 0) {
				filtered_initiative_list = filtered_initiative_list.filter(productManagerFilter);
			}

			if ($scope.selected_directive_ids.length > 0) {
				filtered_initiative_list = filtered_initiative_list.filter(directiveFilter);
			}

			$scope.initiativesList = filtered_initiative_list;

		}

		//filter for directive
		function directiveFilter(initiative) {
			return initiative.directivesList.filter(
				function(initiative_directive) {
					return $scope.selected_directive_ids.indexOf(initiative_directive.id) !== -1
				}).length > 0;
		}

		//filter for ProductManager
		function productManagerFilter(initiative) {
			return initiative.productmanagersList.filter(
				function(initiative_productmanager) {
					return $scope.selected_productManager_ids.indexOf(initiative_productmanager.id) !== -1
				}).length > 0;
		}

		//filter for month
		function monthFilter(initiative) {
			return ($scope.selectedMonthDate.indexOf(initiative.month) !== -1);
		}

		// $scope.gotoCreateInitiativeWithDirective = function() {
		// 	$location.path("/create-initiative");
		// }

		$scope.gotoCreateDirective = function() {
			$location.path("/new-directive");
		}
		$scope.gotoViewInitiative = function(id, title) {
			title_string = validUrlTitle(title + " " + id);
			$location.path("/initiative/" + title_string);
		}
		$scope.gotoCreateInitiative = function(directive) {
			if (directive != undefined)
				localStorageService.set("directiveId", directive.nid);
			else
				localStorageService.remove("directiveId");
			$location.path("/new-initiative");
		}
		$scope.gotoUserProfile = function(id) {
			$location.path("/all-users/" + id);
		}
		$scope.gotoViewDirectivePage = function(id, title) {
			title_string = validUrlTitle(title + " " + id);
			$location.path("/directive/" + title_string);
		}



	}
]);
