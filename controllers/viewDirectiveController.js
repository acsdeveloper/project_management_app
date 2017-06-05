'use Strict'

app.controller('viewDirectiveController', ["$scope", "$window", "$http", "$cookieStore", "$location", "$rootScope", "AuthService", "$routeParams", "localStorageService", "$rootScope",
	function($scope, $window, $http, $cookieStore, $location, $rootScope, AuthService, $routeParams, localStorageService, $rootScope) {
		/* Pie gauges */


		$scope.totalMonths = [{
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
		$scope.year = $scope.today.getFullYear();
		$scope.monthInteger = $scope.today.getMonth();
		$scope.selectedMonthDate = '0' + ($scope.monthInteger + 1) + '-' + $scope.year;
		$scope.selectedMonth = $scope.totalMonths[$scope.monthInteger];


		// Select All Month
		$scope.selectAllMonth = function() {
			$scope.selectedMonth = "all";
			// apply_initiative_filters();

		}

		// Select One Month
		$scope.SelectMonth = function(month, index) {
			$scope.selectedMonth = $scope.totalMonths[index].full_month;
			$scope.selectedMonthDate = month.month_interger + '-' + $scope.year;
			//apply_initiative_filters();
		}

		$scope.viewDirectiveInit = function() {
			$scope.userData = $cookieStore.get('userData');
			if ($scope.userData != undefined) {
				$scope.node_Id = $routeParams.id.slice($routeParams.id.lastIndexOf('-') + 1);
				//get directive data
				$http({
					method: 'GET',
					url: base_url + 'rest/node/' + $scope.node_Id,
					headers: {
						'Content-Type': 'application/json'
					}
				}).then(function(response) {
					$scope.directiveData = response.data;
					$rootScope.pageTitle = "Initiative.ly  | Directive : " + $scope.directiveData.title;
					$scope.selected_month = $scope.directiveData.field_priority_months.und;
					console.log($scope.selected_month);
					if ($scope.selected_month != undefined) {
						$scope.selected_showmonth = $scope.totalMonths.filter(function(month) {
							return $scope.selected_month.filter(function(selectedmonth) {
								return month.month_int == selectedmonth.value;
							}).length;
						})
					}
					if ($scope.directiveData.field_directive_current_situatio.und)
						$scope.description_files = $scope.directiveData.field_directive_current_situatio.und;
					else
						$scope.description_files = [];
					angular.forEach($scope.description_files, function(value, key) {
						value['processed_url'] = (value.uri.indexOf('public://') !== -1) ? value.uri.replace('public://', '/sites/default/files/') : value.uri;
						var extension = value['filename'].split('.').pop();
						if (extension == 'jpg' || extension == 'png' || extension == 'jpeg' || extension == 'gif') {
							value['imagetype'] = 'image';
						}
						else {
							value['imagetype'] = 'file';
							value['displaytext'] = extension.toUpperCase();
						}
					});
				})
			}
			else {
				$location.path("/");
			}
		}

		$scope.gotoCreateInitiative = function() {
			localStorageService.set("directiveId", $scope.node_Id);
			console.log(localStorageService.get("directiveId"));
			$location.path("/new-initiative");
		}

		$scope.gotoEditDirective = function(id) {
			$location.path("/new-directive/" + id);
		}

		//**************************upload images are deleted by api*************************//
		$scope.imageDelete = function(id) {
			swal({
				title: confirm_deletetext,
				text: message_deletetext,
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#DD6B55',
				confirmButtonText: confirm_button_text,
				closeOnConfirm: true
			}, function(isConfirmed) {
				if (isConfirmed) {
					$('.file').addClass('isDeleted');
					$http({
						method: 'DELETE',
						url: base_url + 'rest/file/' + id,
						headers: {
							'Content-Type': 'application/json',
							'X-CSRF-Token': $scope.userData.token
						}
					}).then(function(res) {
						var node_id = Object.keys(res.data.file.node);
						//**********************set current situation files data
						var description_imageids = [];
						angular.forEach($scope.description_files, function(value, key) {
							var description_imageids_obj = {};
							if (id == value.fid)
								description_imageids_obj[value.fid] = value.fid;
							else
								description_imageids_obj['fid'] = value.fid;
							description_imageids.push(description_imageids_obj);
						})

						var data = {
							'title': $scope.title,
							"type": "directives",
							"field_capitalized_or_ammortized": {
								"und": "3"
							},
							'field_directive_current_situatio': {
								'und': description_imageids
							}
						}
						$http({
							method: 'PUT',
							url: base_url + 'rest/node/' + node_id,
							headers: {
								'Content-Type': 'application/json',
								'X-CSRF-Token': $scope.userData.token
							},
							data: data
						}).success(function(res) {
							swal({
								title: deleted_title,
								text: deleted_description,
								timer: 800,
								type: 'success',
								showCancelButton: false,
								showConfirmButton: false
							});
							$scope.viewDirectiveInit();
						}).error(function(res) {});
					})
				}
			})
		}


		//Delete Directive
		$scope.deleteDirective = function() {
			swal({
				title: "Are you sure?",
				text: "You will not be able to recover this!",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes, delete it!",
				closeOnConfirm: true
			}, function(isConfirmed) {
				if (isConfirmed) {
					$(".file").addClass("isDeleted");
					$http({
						method: 'DELETE',
						url: base_url + 'rest/node/' + $scope.node_Id,
						headers: {
							'Content-Type': 'application/json',
							'X-CSRF-Token': $scope.userData.token
						}
					}).then(function(res) {
						// console.log("Delete Response");
						// console.log(res);
						if (res.status == 200) {
							$location.path("/all-directives")
						}
					});
					// swal("Deleted!", "Your initiative has been deleted.", "success");
				}
			});
		}
	}
]);
