'use Strict'


//******************configuration section*************************////
//hard Coded Strings
const duplicate_title_error = 'Sorry, an initiative by this name already exists. Please use an unique title';
const confirm_deletetext = 'Are you sure?';
const message_deletetext = 'You will not be able to recover this!';
const confirm_button_text = 'Yes, delete it!';
const deleted_title = 'Deleted!';
const deleted_description = 'Your  file has been deleted.';
const createInitiative_successtext = 'Initiative Created Successfully!';
const updateInitiative_successtext = 'Initiative Updated Successfully!'
const current_locale = 'en-us';
// const run_mode = 'debug';
const create_pagetitle = "Create An Initiative";
const edit_pagetitle = "Edit Initiative";
const invalid_title_text = "Please enter title";
const invalid_url_text = "Please enter valid url";
const invalid_directive_text = " Please assign at least one directive to this initiative";
const invalid_manager_text = "Please assign this initiative to a product manager";
const invalid_current_text = "Please enter some details about the current situation";
const invalid_proposed_text = "Please enter some details about the proposed situation";
//****************************************************************////

var CKEditor_loaded = false;
var CKEditor_updated = false;



app.controller('createInitiativeController', ['$scope', '$window', '$http', '$cookieStore', '$location', '$rootScope', 'AuthService', '$routeParams', '$timeout', 'localStorageService',

	function($scope, $window, $http, $cookieStore, $location,
		$rootScope, AuthService, $routeParams, $timeout, localStorageService) {

		//************************* scope variables *********************///////////
		$scope.page_title = create_pagetitle;
		$scope.current_mode = 'create';
		$scope.form_validated = true;
		$scope.livedate_editFlag = true;
		$scope.CKEDITOR_LOAD = true;
		$scope.pageloader = false;
		$scope.invalidform_error = [];
		$scope.formErrors = [];
		$scope.links = [{
			'id': 'links_1',
			'title': '',
			'url': ''
		}];
		$scope.status = 'todo';
		$scope.select_managerids = [];
		$scope.select_directiveids = [];
		$scope.select_holderids = [];
		$scope.select_ownerids = [];
		$scope.choosen_directives = [];
		$scope.choosen_manager = [];
		$scope.choosen_holder = [];
		$scope.choosen_owner = [];
		$scope.current_files = [];
		$scope.proposed_files = [];
		$scope.selected_links = [];
		$scope.myweakend_data = [];
		var sheduledmonth;

		CKEditor_loaded = false;
		CKEditor_updated = false;

		function refresh_jquery() {
			$scope.$evalAsync(function() {
				$('.multi-select').multiSelect('refresh');
				$('.ms-container').append('<i class="glyph-icon icon-exchange"></i>');
			});
		}

		$(document).ready(function() {
			window.scrollTo(0, 0);
			$(function() {
				"use strict";
				$(".touchspin-demo").TouchSpin({
					min: 0,
					max: 100
				});
			});
			$(function() {
				"use strict";
				$(".touchspin-demo").TouchSpin({
					verticalbuttons: true,
					verticalupclass: 'glyph-icon icon-plus',
					verticaldownclass: 'glyph-icon icon-minus'
				});
			});

		});

		$scope.uploadFile = function() {
			$scope.processQueue();
		};

		$scope.reset = function() {
			$scope.resetDropzone();
		};
		// function updateCKEditors() {

		// 	CKEDITOR.instances['current_situation_editor'].setData($scope.node_data.field_current_situation.und[0].value);
		// 	CKEDITOR.instances['proposed_situation_editor'].setData($scope.node_data.field_proposed_situation.und[0].value);
		// 	CKEditor_updated = true;
		// 	// log("updateCKEditors");
		// }

		// CKEDITOR.on("instanceReady", function(event) {
		// 	CKEditor_loaded = true;
		// 	//ckedit loads after ajax data function runs 
		// 	// log("editor first " + CKEditor_updated);

		// 	if (!CKEditor_updated) {
		// 		if ($scope.node_data) {
		// 			// log("$scope.node_data");
		// 			updateCKEditors();
		// 		}
		// 	}
		// });
		// CKEDITOR.instances['current_situation_editor'].on('loaded', function() {
		// 	if ($scope.node_data.field_current_situation.und) {
		// 		var current_situation = $scope.node_data.field_current_situation.und[0].value;
		// 		// CKEDITOR.instances['current_situation_editor'].setData(current_situation);
		// 		// log(CKEDITOR.instances['current_situation_editor'].getData());

		// 		// if (!CKEDITOR.instances['current_situation_editor'].getData()) {
		// 		// 	log('no data retireved');
		// 		// 	log(CKEDITOR.instances['current_situation_editor'].getData());
		// 		// }
		// 	}
		// 	log('loaded ckeditor22 ');
		// });

		//all the dropdowns that needs a refresh to apply jquery css changes 
		//after angular populates them with values

		var to_watch = ['choosen_directives', 'choosen_manager', 'choosen_owner', 'choosen_holder', ];

		function multiselectdataload() {
			angular.forEach(to_watch, function(key) {
				$scope.$watch(key, function() {
					refresh_jquery();
				});
			});
		}


		//mode 
		if ($routeParams.id != undefined) $scope.current_mode = 'edit';
		if ($scope.current_mode == 'edit') $scope.page_title = edit_pagetitle;

		//***************************Global angular functions
		function set_if_not_null(data, isArray, defaultValue) {
			// defaultValue = defaultValue || '';
			if (data === null || data === undefined)
				return isArray ? [] : defaultValue;
			return isArray ? data : data[0].value;
		}

		function custom_errors(id, errortext) {
			if ($scope.formErrors.indexOf(id) == -1)
				$scope.formErrors.push(id);
			return errortext;
		}

		function clear_custom_error(id) {
			$scope.formErrors = $scope.formErrors.filter(function(error) {
				return (id != error);
			});
		}

		function show_all_errors(to_move) {
			//hide any existing errors using error class
			$('.error-style').hide();
			//show all errors still pending user attention
			if ($scope.formErrors.length > 0) {
				angular.forEach($scope.formErrors, function(value, key) {
					$('#' + value).show();
				});
				//move to first error 
				if (to_move) {
					$('body').animate({
						scrollTop: $('#' + $scope.formErrors[0]).closest(".form-group").offset().top
					}, 'slow');
				}
			}
		}
		//***************** section to manage links and their titles *********************///

		// check valid link
		function validurl() {
			var regexpurl = /(http(s?):\/\/www)?[A-Za-z0-9\.-][.][A-Za-z]{2,3}$/;
			angular.forEach($scope.links, function(value, key) {
				if (value.url == '') {
					$scope.has_empty_box = true;
					if (value.title == '') {
						if (key != $scope.links.length - 1)
							$scope.links.splice(key, 1);
					}
				}
				//check if the url is valid only after seeing that the user has entered
				//either a title or a part of the url field if the url is not blank but not 
				//valid then return an error 

				if (((value.title != '') || (value.url != '')) && !regexpurl.test(value.url)) {
					$scope.has_error_box = true;
				}
			});
		}

		//Create Link	
		$scope.createBlankLink = function() {
			var link_obj = {
				'title': '',
				'url': '',
				'id': 'links_' + $scope.links.length + 1,
			}
			$scope.has_empty_box = false;
			$scope.has_error_box = false;
			validurl();
			if ($scope.has_error_box) {
				$scope.invalidform_error['url_error_message'] =
					custom_errors('error-msg-url', invalid_url_text);
			}
			else {
				clear_custom_error('error-msg-url')
				if (!$scope.has_empty_box) {
					$scope.links.push(link_obj);
				}
			}

			show_all_errors();
		}

		$scope.createLinks = function() {
			angular.forEach($scope.links, function(value, key) {
				if (value.url) {
					var url = (value.url.indexOf('://') === -1) ? 'http://' + value.url : value.url;
					$scope.selected_links.push({
						'url': url,
						'title': value.title
					});
				}
			});
		}

		$scope.setLinks = function(links) {
			$scope.links = links;
		}

		//************************* links section ends *******************//
		var today_date = new Date();
		today_date.setHours(0, 0, 0, 0);
		var mindate, live_date = 0

		function datepickerEnable() {
			live_date = new Date($scope.node_data.field_live_date.und[0].value);
			if (today_date <= live_date) {
				$scope.livedate_editFlag = true;
				$('#liveDatePicker').datepicker('enable');
			}
			else {
				$scope.livedate_editFlag = false;
				$('#liveDatePicker').datepicker('disable');
			}
		}
		//********************************Section to change  datepicker when we choose month*********************//
		$scope.setDatePickerChange = function() {
			sheduledmonth = $scope.scheduled_month.split('-');
			mindate = new Date(sheduledmonth[1], sheduledmonth[0] - 1, '01');
			var reset_date = new Date(sheduledmonth[1], sheduledmonth[0], 0);
			if (sheduledmonth[0] == ('0' + (today_date.getMonth() + 1)).slice(-2)) {
				mindate = 0;
				reset_date = new Date($scope.live_date);
			}
			if ($scope.livedate_editFlag) {
				// 	mindate = 0;
				$('#liveDatePicker').datepicker('destroy');
				$("#liveDatePicker").datepicker({
					dateFormat: 'yy-mm-d',
					minDate: mindate,
				}).datepicker('setDate', reset_date);
			}
		}

		//********************************Section to set date to datepicker*********************//
		$scope.setDatePicker = function() {
			sheduledmonth = $scope.scheduled_month.split('-');
			$('#liveDatePicker').datepicker('destroy');
			if ($scope.livedate_editFlag == false) {
				mindate = new Date(sheduledmonth[1], sheduledmonth[0] - 1, '01');
			}
			else
				mindate = 0;
			if ($scope.current_mode == 'edit') {
				$('#liveDatePicker').datepicker({
					dateFormat: 'yy-mm-d',
				});
				datepickerEnable();
			}
			else {
				var lastDay = new Date(today_date.getFullYear(), today_date.getMonth() + 1, 0);
				$('#liveDatePicker').datepicker({
					dateFormat: 'yy-mm-d',
					minDate: 0,
				}).datepicker('setDate', lastDay);
			}
		}

		//************************* date section ends *******************//

		//************************* find user Id for multiselect *******************//
		function setUserId(totalarrvalue, selectarrvalue) {
			var result = [];
			if (totalarrvalue != undefined) {
				totalarrvalue.map(function(value) {
					if (selectarrvalue.indexOf(value) !== -1)
						result.push(value);
				});
			}
			return result;
		}


		//***************************Page Load Init function************************************//

		$scope.createInitiativeInit = function() {
				$scope.userData = $cookieStore.get('userData');
				if (AuthService.user_logged_in()) {
					$scope.edit_initiativeFlag = false;
					$scope.pageloader = true;

					// Get all month List
					$http({
						method: 'GET',
						url: base_url + 'rest/views/current_time',
						headers: {
							'Content-Type': 'application/json'
						}
					}).then(function(res) {

						// log("CKEDITOR");
						if ($scope.CKEDITOR_LOAD) {
							CKEDITOR.env.isCompatible = true;
							CKEDITOR.replaceAll();
						}
						$scope.updated_months = [];
						var response_date = res.data[0].updated_date;
						var date_as_array = response_date.split('-');
						var start_month = parseInt(date_as_array[1].slice(1, 2));

						var date_of_month = new Date(date_as_array[2] + '/' + start_month + '/' + '01');
						var month_object;
						for (var i = 1; i <= 12; i++) {

							var month_string = date_of_month.toLocaleString(current_locale, {
								month: 'short'
							});

							month_string = month_string + '-' + date_of_month.getFullYear();
							month_object = {
								'short': ('0' + (date_of_month.getMonth() + 1)).slice(-2) + '-' + date_of_month.getFullYear(),
								'long': month_string
							};
							$scope.updated_months.push(month_object);
							date_of_month.setTime(date_of_month.getTime() + 31 * 86400000);
						};
						$scope.scheduled_month = $scope.updated_months[0].short;
						if ($scope.current_mode != 'edit')
							$scope.setDatePicker();
					});

					//************************************ Get all Product Manager List**********************//
					$http({
						method: 'GET',
						url: base_url + '/rest/views/users_in_role?rid=4',
						headers: {
							'Content-Type': 'application/json',
							'X-CSRF-Token': $scope.userData.token
						}
					}).then(function(res) {
						$scope.productManagerList = res.data;
						$scope.productManagerListIds = $scope.productManagerList.map(function(element) {
							return element.uid;
						});
						$scope.setSelectedValues(4);
						//************************* Get all directives List	****************//

						$http({
							method: 'GET',
							url: base_url + 'rest/node?parameters[type]=directives',
							headers: {
								'Content-Type': 'application/json'
							}
						}).then(function(res) {
							$scope.directivesList = res.data;
							$scope.directivesListIds = $scope.directivesList.map(function(directive) {
								return directive.nid;
							});
							$scope.setSelectedValues(0);
						});

						//******************************************Get all stakeholder List****************//

						$http({
							method: 'GET',
							url: base_url + 'rest/views/users_in_role?rid=5',
							headers: {
								'Content-Type': 'application/json'
							}
						}).then(function(res) {
							$scope.stakeholderList = res.data;

							$scope.stakeholderListIds = $scope.stakeholderList.map(function(holder) {
								return holder.uid;
							});
							$scope.setSelectedValues(5);
							$scope.setDataOnEdit();
						});
						//***************************Get all business owner List**********************//
						$http({
							method: 'GET',
							url: base_url + 'rest/views/users_in_role?rid=9',
							headers: {
								'Content-Type': 'application/json'
							}
						}).then(function(res) {
							$scope.businessownerList = res.data;
							$scope.businessownerListIds = $scope.businessownerList.map(function(owner) {
								return owner.uid;
							});
							$scope.setSelectedValues(9);
							$scope.setDataOnEdit();
						});

						multiselectdataload();
						if ($scope.current_mode != 'edit') {
							$scope.pageloader = false;
							$scope.setSelectedValues();
						}
						else
							$scope.setDataOnEdit();

					});

				}
				else {
					$location.path('/');
				}
			}
			//***************************end Init function************************************//
			//*********************code for select value from multiselect user role default value 
		$scope.setSelectedValues = function(id) {
				$scope.user_roles = Object.keys($scope.userData.roles);
				if ($scope.user_roles.indexOf("4") != -1 && id == 4)
					$scope.choosen_manager.push($scope.userData.user_id);
				if ($scope.user_roles.indexOf("5") != -1 && id == 5)
					$scope.choosen_holder.push($scope.userData.user_id);
				if ($scope.user_roles.indexOf("9") != -1 && id == 9)
					$scope.choosen_owner.push($scope.userData.user_id);
				if (localStorageService.get("directiveId") != undefined && id == 0)
					$scope.choosen_directives.push(localStorageService.get("directiveId"));
				multiselectdataload();
			}
			//********************************set Data from edit api***************************//
			//code for show week performance box
		function checkweeklyreport(livedate) {
			$scope.myweakend_datafield = ["1", "2", "4", "8", "12"];
			$scope.myweakend_data = [];
			var weekdays = [8, 15, 29, 57, 85];
			var default_livedate = new Date(livedate);
			var check_todaydate = new Date();
			for (var i = 1; i <= weekdays.length; i++) {
				var check_livedate = new Date(livedate);
				check_livedate.setDate(check_livedate.getDate() + weekdays[i - 1]);
				if (Date.parse(default_livedate) <= Date.parse(check_livedate) && Date.parse(check_livedate) <= Date.parse(check_todaydate)) {
					$scope.myweakend_data.push("weekendreport" + (i));
				}
			}
			$timeout(function() {
				if ($scope.myweakend_data.length != 0) {
					angular.forEach($scope.myweakend_data, function(value, key) {
						CKEDITOR.replace(value);
					});
				}
			}, 20);
		}



		$scope.setDataOnEdit = function() {
			if ($scope.current_mode == 'edit') {
				$scope.edit_initiativeFlag = true;
				// $scope.pageloader = true;
				//var id = s.slice(s.lastIndexOf('_') + 1);
				//*************************Get node Data **********************//
				$http({
					method: 'GET',
					url: base_url + 'rest/node/' + $routeParams.id,
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-Token': $scope.userData.token
					}
				}).then(function(res) {
					$scope.node_data = res.data;
					$rootScope.pageTitle = "Initiative.ly  | Initiative : " + $scope.node_data.title;
					$scope.pageloader = false;
					$scope.title = $scope.node_data.title;
					if ($scope.node_data.field_links.und)
						$scope.setLinks($scope.node_data.field_links.und);
					$scope.createBlankLink();
					$scope.status = $scope.node_data.field_state.und[0].value;
					if ($scope.updated_months) {
						$scope.scheduled_month = set_if_not_null($scope.node_data.field_month.und, false, $scope.updated_months[0].short);
						$scope.setDatePicker();
					}
					$scope.live_date = $scope.node_data.field_live_date.und[0].value.slice(0, 10);
					datepickerEnable();
					$scope.setDatePicker();
					$('#liveDatePicker').datepicker('setDate', $scope.live_date);
					checkweeklyreport($scope.live_date);
					datepickerEnable();
					if ($scope.node_data.field_current_situation.und) {
						CKEDITOR.instances['current_situation_editor'].setData($scope.node_data.field_current_situation.und[0].value);
					}
					if ($scope.node_data.field_proposed_situation.und) {
						CKEDITOR.instances['proposed_situation_editor'].setData($scope.node_data.field_proposed_situation.und[0].value);
					}

					if ($scope.node_data.field_first_week_performance.und) {
						CKEDITOR.instances['weekendreport1'].setData($scope.node_data.field_first_week_performance.und[0].value);
					}

					if ($scope.node_data.field_second_week_performance.und) {
						CKEDITOR.instances['weekendreport2'].setData($scope.node_data.field_second_week_performance.und[0].value);
					}

					if ($scope.node_data.field_fourth_week_performance.und) {
						CKEDITOR.instances['weekendreport3'].setData($scope.node_data.field_fourth_week_performance.und[0].value);
					}

					if ($scope.node_data.field_eighth_week_performance.und) {
						CKEDITOR.instances['weekendreport4'].setData($scope.node_data.field_eighth_week_performance.und[0].value);
					}

					if ($scope.node_data.field_twelfth_week_performance.und) {
						CKEDITOR.instances['weekendreport5'].setData($scope.node_data.field_twelfth_week_performance.und[0].value);
					}



					$("#num_of_dev").val(set_if_not_null($scope.node_data.field_number_of_devs.und, false, 0));
					$("#num_of_dev_days").val(set_if_not_null($scope.node_data.field_number_of_devs_days.und, false, 0));
					$("#num_of_ui").val(set_if_not_null($scope.node_data.field_number_of_ui.und, false, 0));
					$("#num_of_ui_days").val(set_if_not_null($scope.node_data.field_number_of_ui_days.und, false, 0));
					$("#num_of_ux").val(set_if_not_null($scope.node_data.field_number_of_ux.und, false, 0));
					$("#num_of_ux_days").val(set_if_not_null($scope.node_data.field_number_of_ux_days.und, false, 0));
					$("#num_of_da").val(set_if_not_null($scope.node_data.field_number_of_data_analysis.und, false, 0));
					$("#num_of_da_days").val(set_if_not_null($scope.node_data.field_number_of_data_analysis_da.und, false, 0));

					$scope.select_managerids = set_if_not_null($scope.node_data.field_user_product_manager.und, true);
					$scope.select_directiveids = set_if_not_null($scope.node_data.field_directive_nodes.und, true);
					$scope.select_holderids = set_if_not_null($scope.node_data.field_stakeholder.und, true);
					$scope.select_ownerids = set_if_not_null($scope.node_data.field_user_business_owner.und, true);
					if ($scope.node_data.field_dev_complete.und[0].value == 1)
						$('#num_of_dev_completed').prop('checked', true);
					if ($scope.node_data.field_ui_complete.und[0].value == 1)
						$('#num_of_ui_completed').prop('checked', true);
					if ($scope.node_data.field_ux_complete.und[0].value == 1)
						$('#num_of_ux_completed').prop('checked', true);
					if ($scope.node_data.field_data_analyst_complete.und[0].value == 1)
						$('#num_of_da_completed').prop('checked', true);
					$scope.choosen_directives = $scope.select_directiveids.map(function(element) {
						return element.target_id;
					});

					//product manager values are selected here
					// $scope.select_managerids = $scope.select_managerids.map(function(element) {
					// 	return element.uid;
					// });
					// $scope.choosen_manager = setUserId($scope.productManagerListIds, $scope.select_managerids);
					$scope.choosen_manager = $scope.select_managerids.map(function(element) {
						return element.uid;
					});


					//stake holder values are selected here
					// $scope.select_holderids = $scope.select_holderids.map(function(element) {
					// 	return element.uid;
					// });
					// $scope.choosen_holder = setUserId($scope.stakeholderListIds, $scope.select_holderids);
					$scope.choosen_holder = $scope.select_holderids.map(function(element) {
						return element.uid;
					});

					//business ownervalues are selected here
					// $scope.select_ownerids = $scope.businessownerListIds.map(function(element) {
					// 	return element.uid;
					// });
					// $scope.choosen_owner = setUserId($scope.businessownerListIds, $scope.select_holderids);
					$scope.choosen_owner = $scope.select_ownerids.map(function(element) {
						return element.uid;
					});


					multiselectdataload();


					$scope.current_situation_files = $scope.node_data.field_current_situation_files.und;
					$scope.proposed_situation_files = $scope.node_data.field_proposed_situation_files.und;


					angular.forEach($scope.current_situation_files, function(value, key) {
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

					angular.forEach($scope.proposed_situation_files, function(value, key) {
						value['processed_url'] = (value.uri.indexOf('public://') !== -1) ? value.uri.replace('public://', '/sites/default/files/') : value.uri;
						var extension = value['filename'].split('.').pop();
						if (extension == 'jpg' || extension == 'png' || extension == 'jpeg' ||
							extension == 'gif') {
							value['imagetype'] = 'image';
						}
						else {
							value['imagetype'] = 'file';
							value['displaytext'] = extension.toUpperCase();
						}
					});
					// log("CKEditor_updated ajax" + CKEditor_updated + "...load" + CKEditor_loaded);
					// if (!CKEditor_updated) {
					// 	// ck editor loaded very fast and ajax data arrived after that
					// 	// log('ajax first');
					// 	if (CKEditor_loaded) {
					// 		updateCKEditors();
					// 	}
					// }
				});
			}
			else {
				$scope.edit_initiativeFlag = false;
			}

		}


		//***************************code for test title dupicate or new************************************//
		$scope.testTitle = function(title) {
				$scope.titleflage = false;
				if (title && $scope.current_mode == 'create') {
					$scope.titleflage = true;
				}
				else if (title && $scope.current_mode == 'edit') {
					if (title != $scope.node_data.title) {
						$scope.titleflage = true;
					}
				}
				if ($scope.titleflage) {
					$http({
						method: 'GET',
						url: base_url + 'rest/views/count_initiatives?title=' + title,
						headers: {
							'Content-Type': 'application/json',
							'X-CSRF-Token': $scope.userData.token
						},
						data: $scope.post_data
					}).success(function(res) {
						if (res.length != 0)
							$scope.invalidform_error['title_error_message'] = custom_errors('error-msg-title', duplicate_title_error);
						else
							clear_custom_error('error-msg-title');
						show_all_errors();

					}).error(function(error) {
						$scope.title_error_message = error;
					})
				}

			}
			//***************************code end test title dupicate or new************************************//

		//***************************code for hide error message on blur the title textbox******//
		$scope.testTitleEmpty = function() {
				if (isNull($scope.title))
					$scope.invalidform_error['title_error_message'] = custom_errors('error-msg-title', invalid_title_text);
				else
					clear_custom_error('error-msg-title');
				show_all_errors();
			}
			//***************************code end title textbox************************************//


		//***********************************validation for initiative ***************************//
		$scope.InitiativeValidation = function(type) {
				var current_situation_value = CKEDITOR.instances['current_situation_editor'].getData();
				var proposed_situation_value = CKEDITOR.instances['proposed_situation_editor'].getData();
				// $scope.formErrors = [];
				if (isNull($scope.title))
					$scope.invalidform_error['title_error_message'] = custom_errors('error-msg-title', invalid_title_text);
				else {
					if ($scope.formErrors.indexOf('error-msg-title') == -1)
						clear_custom_error('error-msg-title');
				}

				if (current_situation_value.split('').length == 0)
					$scope.invalidform_error['current_error_message'] = custom_errors('error-msg-current-situation', invalid_current_text);
				else
					clear_custom_error('error-msg-current-situation');
				if (proposed_situation_value.split('').length == 0)
					$scope.invalidform_error['proposed_error_message'] = custom_errors('error-msg-proposed-situation', invalid_proposed_text);
				else
					clear_custom_error('error-msg-proposed-situation');
				if (($scope.choosen_directives).length == 0)
					$scope.invalidform_error['directive_error_message'] = custom_errors('error-msg-directive', invalid_directive_text)
				else
					clear_custom_error('error-msg-directive');
				if (($scope.choosen_manager).length == 0)
					$scope.invalidform_error['manager_error_message'] = custom_errors('error-msg-product-manager', invalid_manager_text);
				else
					clear_custom_error('error-msg-product-manager');

				if ($scope.formErrors.length == 0) {
					$scope.invalidform_error = [];
					$('.error-style').hide();
					$scope.filterDirectives();
					$scope.filterManagers();
					$scope.filterHolders();
					$scope.filterOwner();
					$scope.createLinks();
					$scope.setPostData();
					if (type == "create")
						$scope.createInitiative();
					else if (type == "update")
						$scope.updateInitiative();
				}
				else {
					show_all_errors(true);
				}
			}
			//***************************validation end ***********************************//
			//***************************code for set initiative data to api format******//
		$scope.setPostData = function() {
			var live_date = $('#liveDatePicker').val();
			var dateArr = live_date.split('-');
			$scope.week_performance = [{
				"value": ""
			}, {
				"value": ""
			}, {
				"value": ""
			}, {
				"value": ""
			}, {
				"value": ""
			}];
			if ($scope.myweakend_data.length != 0) {
				angular.forEach($scope.myweakend_data, function(value, key) {
					$scope.week_performance[key].value = CKEDITOR.instances[value].getData();
				});
			}
			log($scope.week_performance);

			$scope.post_data = {
				'type': 'initiatives',
				'field_capitalized_or_ammortized': {
					'und': '3'
				},
				'title': $scope.title,
				'node_title': $scope.title,
				'field_state': {
					'und': $scope.status
				},
				'field_links': {
					'und': $scope.selected_links
				},
				'field_month': {
					'und': [{
						'value': $scope.scheduled_month,
					}]
				},
				'field_current_situation': {
					'und': [{
						'value': CKEDITOR.instances['current_situation_editor'].getData(),
					}]
				},
				'field_proposed_situation': {
					'und': [{
						'value': CKEDITOR.instances['proposed_situation_editor'].getData(),
					}]
				},
				'field_number_of_data_analysis': {
					'und': [{
						'value': $("#num_of_da").val(),
					}]
				},
				'field_number_of_data_analysis_da': {
					'und': [{
						'value': $("#num_of_da_days").val(),
					}]
				},
				'field_number_of_devs': {
					'und': [{
						'value': $("#num_of_dev").val()
					}]
				},
				'field_number_of_devs_days': {
					'und': [{
						'value': $("#num_of_dev_days").val(),
					}]
				},
				'field_number_of_ui': {
					'und': [{
						'value': $("#num_of_ui").val()
					}]
				},
				'field_number_of_ui_days': {
					'und': [{
						'value': $("#num_of_ui_days").val(),
					}]
				},
				'field_number_of_ux': {
					'und': [{
						'value': $("#num_of_ux").val()
					}]
				},
				'field_number_of_ux_days': {
					'und': [{
						'value': $("#num_of_ux_days").val(),
					}]
				},
				'field_directive_nodes': {
					'und': $scope.selected_directives
				},
				'field_user_product_manager': {
					'und': $scope.selected_managers
				},
				'field_stakeholder': {
					'und': $scope.selected_stakeholder
				},
				'field_user_business_owner': {
					'und': $scope.selected_owner
				},
				'field_live_date': {
					'und': [{
						'value': {
							'year': dateArr[0],
							'month': dateArr[1],
							'day': dateArr[2]
						},
						'timezone': 'Asia/Kolkata',
						'timezone_db': 'Asia/Kolkata',
						'date_type': 'datetime'
					}]
				},

				"field_first_week_performance": {
					'und': [{
						'value': $scope.week_performance[0].value
					}]
				},
				"field_first_week_files": "",
				"field_first_week_performance_uid": $scope.userData.user_id,
				"field_second_week_performance": {
					'und': [{
						'value': $scope.week_performance[1].value
					}]
				},
				"field_second_week_files": "",
				"field_second_week_uid": $scope.userData.user_id,
				"field_fourth_week_performance": {
					'und': [{
						'value': $scope.week_performance[2].value
					}]
				},
				"field_fourth_week_files": "",
				"field_fourth_week_uid": $scope.userData.user_id,
				"field_eighth_week_performance": {
					'und': [{
						'value': $scope.week_performance[3].value
					}]
				},
				"field_eighth_week_files": "",
				"field_eighth_week_uid": $scope.userData.user_id,
				"field_twelfth_week_performance": {
					'und': [{
						'value': $scope.week_performance[4].value
					}]
				},
				"field_twelfth_week_files": "",
				"field_twelfth_week_uid": $scope.userData.user_id,
				"field_dev_complete": {
					'und': [{
						'value': $("#num_of_dev_completed").is(":checked") ? '1' : 0
					}]
				},
				"field_ui_complete": {
					'und': [{
						'value': $("#num_of_ui_completed").is(":checked") ? '1' : 0
					}]
				},
				"field_ux_complete": {
					'und': [{
						'value': $("#num_of_ux_completed").is(":checked") ? '1' : 0
					}]
				},
				"field_data_analyst_complete": {
					'und': [{
						'value': $("#num_of_da_completed").is(":checked") ? '1' : 0
					}]
				}


			}
			console.log($scope.post_data);

		}

		//***************************api format data end ***********************************//


		//****************************************code to create Initiative Data**********************//
		$scope.createInitiative = function() {
				//change icon to busy
				$scope.pageloader = true;
				//	/alert($("#num_of_da_completed").is(":checked"));
				//	exit;
				//	console.log($scope.post_data);
				//exit;
				// Post Initiative 
				$http({
					method: 'POST',
					url: base_url + 'rest/node',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-Token': $scope.userData.token
					},
					data: $scope.post_data
				}).success(function(res) {
					//check if upload files are choose then upload the file ,otherwise show successmessage
					if (drag_currentfiles.length != 0 || drag_proposedfiles.length != 0) {
						$scope.uploadImage(res.nid);
					}
					else {
						$scope.pageloader = false;
						localStorageService.set("directiveId", '');
						// $('body').css('cursor', 'default');
						swal({
							title: '',
							text: createInitiative_successtext,
							type: 'success',
							timer: 800,
							showCancelButton: false,
							showConfirmButton: false
						});
						$window.location.assign('all-initiatives');


					}
				}).error(function(error) {
					log(error);
					$scope.pageloader = false;
					$('#apierror-message').show();
					$scope.apierrormessage = error;
					// var errorkey = Object.keys(error.form_errors);
					// log(error.form_errors[errorkey]);
					//$scope.apierrormessage = error.form_errors[errorkey];
				});

			}
			//****************************************create iniative end***********************//

		//****************************************code to update Initiative Data**********************//
		$scope.updateInitiative = function() {

				//change icon to busy
				// $('body').css('cursor', 'progress');
				$scope.pageloader = true;
				//Update Initiative
				$http({
					method: 'PUT',
					url: base_url + 'rest/node/' + $routeParams.id,
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-Token': $scope.userData.token
					},
					data: $scope.post_data
				}).success(function(res) {
					//check if upload files are choose then upload the file ,otherwise show successmessage
					if (drag_currentfiles.length != 0 || drag_proposedfiles.length != 0) {
						var text = 'Initiative Updated Successfully!';
						$scope.uploadImage($routeParams.id);
					}
					else {
						// $('body').css('cursor', 'default');
						$scope.pageloader = false;
						swal({
							title: '',
							text: updateInitiative_successtext,
							timer: 800,
							type: 'success',
							showCancelButton: false,
							showConfirmButton: false
						});
						$window.location.assign('all-initiatives');

					}

				}).error(function(error) {
					log(error);
					$scope.pageloader = false;
					$scope.apierrormessage = error;
					$('#apierror-message').show();
					// var errorkey = Object.keys(error.form_errors);
					// log(error.form_errors[errorkey]);
					//$scope.apierrormessage = error.form_errors[errorkey];
				});


			}
			//****************************************code end update Initiative Data**********************//

		//***********************************upload the images using api after created node**********************//
		var currentImagelength = 0,
			proposedImagelength = 0;
		$scope.uploadImage = function(id) {

			//************************current files 
			currentImagelength = drag_currentfiles.length;
			proposedImagelength = drag_proposedfiles.length;
			if (drag_currentfiles.length != 0) {
				fileUploadToApi(drag_currentfiles, "field_current_situation_files", "currentImagelength", id);
			}
			if (drag_proposedfiles.length != 0) {
				fileUploadToApi(drag_proposedfiles, "field_proposed_situation_files", "proposedImagelength", id);
			}
		}

		function fileUploadToApi(filesvalue, filedvalue, imagelength, id) {
			var current_form_data = new FormData();
			var uploadUrl = base_url + 'rest/node/' + id + '/attach_file';
			angular.forEach(filesvalue, function(value, key) {
				current_form_data.append('files[' + filedvalue + key + ']', value);
				current_form_data.append('field_name', filedvalue);
			})
			$http.post(uploadUrl, current_form_data, {
				transformRequest: angular.identity,
				headers: {
					'Content-Type': undefined,
					'X-CSRF-Token': $scope.userData.token
				}
			}).success(function(res) {
				// log(imagelength + "...fileUploadToApi succeess");
				imagelength == "currentImagelength" ? currentImagelength = 0 : proposedImagelength = 0;
				if (currentImagelength == 0 && proposedImagelength == 0) {
					$scope.pageloader = false;
					swal({
						title: '',
						text: updateInitiative_successtext,
						timer: 800,
						type: 'success',
						showCancelButton: false,
						showConfirmButton: false
					});
					$window.location.assign('all-initiatives');
				}

			}).error(function(error) {
				// log(error);
				$scope.pageloader = false;
				$('#apierror-message').show();
				var errorkey = Object.keys(error.form_errors);
				log(error.form_errors[errorkey]);
				$scope.apierrormessage = error.form_errors[errorkey];
			});
		}

		//*******************************************end upload image***************************//



		//**************************upload images are deleted by api*************************//
		$scope.imageDelete = function(id, type) {
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
						if (type == 'current') {
							//**********************set current situation files data
							var current_imageids_arr = [];
							angular.forEach($scope.current_situation_files, function(value, key) {
								var current_imageids_obj = {};
								if (id == value.fid)
									current_imageids_obj[value.fid] = value.fid;
								else
									current_imageids_obj['fid'] = value.fid;
								current_imageids_arr.push(current_imageids_obj);
							})

							var data = {
								'title': $scope.title,
								'type': 'initiatives',
								'field_capitalized_or_ammortized': {
									'und': '3'
								},
								'field_current_situation_files': {
									'und': current_imageids_arr
								}
							}
						}
						else {
							// **********************set	proposed situation files data
							var proposed_imageids_arr = [];
							angular.forEach($scope.proposed_situation_files, function(value, key) {
								var proposed_imageids_obj = {};
								if (id == value.fid)
									proposed_imageids_obj[value.fid] = value.fid;
								else
									proposed_imageids_obj['fid'] = value.fid;
								proposed_imageids_arr.push(proposed_imageids_obj);
							})

							var data = {
								'title': $scope.title,
								'type': 'initiatives',
								'field_capitalized_or_ammortized': {
									'und': '3'
								},
								'field_proposed_situation_files': {
									'und': proposed_imageids_arr
								}
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
							$scope.imagesReset();
							// $scope.createInitiativeInit();
							// swal(deleted_title, deleted_description, 'success');
						}).error(function(res) {

						});
					})
				}
			})
		}

		$scope.imagesReset = function() {
				$http({
					method: 'GET',
					url: base_url + 'rest/node/' + $routeParams.id,
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-Token': $scope.userData.token
					}
				}).then(function(res) {
					$scope.node_data = res.data;
					$scope.current_situation_files = $scope.node_data.field_current_situation_files.und;
					$scope.proposed_situation_files = $scope.node_data.field_proposed_situation_files.und;

					angular.forEach($scope.current_situation_files, function(value, key) {
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

					angular.forEach($scope.proposed_situation_files, function(value, key) {
						value['processed_url'] = (value.uri.indexOf('public://') !== -1) ? value.uri.replace('public://', '/sites/default/files/') : value.uri;
						var extension = value['filename'].split('.').pop();
						if (extension == 'jpg' || extension == 'png' || extension == 'jpeg' ||
							extension == 'gif') {
							value['imagetype'] = 'image';
						}
						else {
							value['imagetype'] = 'file';
							value['displaytext'] = extension.toUpperCase();
						}
					});
					// $scope.current_situation_files = angular.copy($scope.current_situation_files);
				})
			}
			//***************************************end image delete******************************//


		//*****************************Delete images form drag and drop without api*********************//
		$scope.deleteSelectimage = function(image_id, image_type) {
				swal({
						title: confirm_deletetext,
						text: message_deletetext,
						type: 'warning',
						showCancelButton: true,
						confirmButtonColor: '#DD6B55',
						confirmButtonText: confirm_button_text,
						closeOnConfirm: false
					},
					function() {
						if (image_type == 'current') {
							angular.forEach($scope.current_files, function(value, key) {
								if (value.file_id == image_id) {
									$scope.current_files.splice(key, 1);
									drag_currentfiles = $scope.current_files;
								}
							})
						}
						else {
							angular.forEach($scope.proposed_files, function(value, key) {
								if (value.file_id == image_id) {
									$scope.proposed_files.splice(key, 1);
									drag_proposedfiles = $scope.proposed_files;
								}
							})
						}
						swal({
							title: deleted_title,
							text: deleted_description,
							timer: 800,
							type: 'success',
							showCancelButton: false,
							showConfirmButton: false
						});
						$scope.CKEDITOR_LOAD = false;
						$scope.createInitiativeInit();
					});
			}
			//*********************************images remove end***************************//

		//********************************drag and drop current_files added*******************************//
		$scope.addcurrentfiles = function(files) {
			$scope.current_files = files;
			$scope.$apply();
		};
		//********************************current_files End ************************************//

		//********************************drag and drop proposed_files added*******************************//
		$scope.addproposedfiles = function(files) {
			$scope.proposed_files = files;
			$scope.$apply();
		};
		//********************************proposed_files End ************************************//

		//******************************** Code For get directive list to post Data  ************************************//
		$scope.filterDirectives = function() {
				$scope.selected_directives = {};
				angular.forEach($scope.choosen_directives, function(value, key) {
					$scope.selected_directives[value] = value;
				});
			}
			//******************************** end  directive list ************************************//

		//******************************** Code For get manager list to post Data  ************************************//
		$scope.filterManagers = function() {
				$scope.selected_managers = {};
				angular.forEach($scope.choosen_manager, function(value, key) {
					$scope.selected_managers[value] = value;
				});

			}
			//******************************** end manager list ************************************//

		//********************************  Code For holders list to post Data ************************************//
		$scope.filterHolders = function() {
				$scope.selected_stakeholder = {};
				angular.forEach($scope.choosen_holder, function(value, key) {
					$scope.selected_stakeholder[value] = value;
				});
			}
			//******************************** end holders list ************************************//

		//******************************** Code For owner list to post Data ************************************//
		$scope.filterOwner = function() {
				$scope.selected_owner = {};
				angular.forEach($scope.choosen_owner, function(value, key) {
					$scope.selected_owner[value] = value;
				});
			}
			//******************************** end owners list ************************************//
	}
]);
