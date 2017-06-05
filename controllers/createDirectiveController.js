'use Strict'
const createdirective_successtext = "Directive Created Successfully!";
const updatedirective_successtext = "Directive Updated Successfully!";
const invalid_title = "Please enter title";
const duplicate_title_errortext = "Sorry, an directive by this name already exists. Please use an unique title";
const invalid_urltext = "Please enter valid url";
const createpagetitle = "Create Directive";
const editpagetitle = "Edit Directive";
app.controller('createDirectiveController', ["$scope", "$window", "$http", "$cookieStore", "$location", "$rootScope", "AuthService", "$routeParams", "$timeout",

	function($scope, $window, $http, $cookieStore, $location, $rootScope, AuthService, $routeParams, $timeout) {


		//************************************value for priority month
		$scope.priority_months = [{
			"full_month": "January",
			"month_interger": "01",
		}, {
			"full_month": "February",
			"month_interger": "02",
		}, {
			"full_month": "March",
			"month_interger": "03",
		}, {
			"full_month": "April",
			"month_interger": "04",
		}, {
			"full_month": "May",
			"month_interger": "05",
		}, {
			"full_month": "June",
			"month_interger": "06",
		}, {
			"full_month": "July",
			"month_interger": "07",
		}, {
			"full_month": "August",
			"month_interger": "08",
		}, {
			"full_month": "September",
			"month_interger": "09",
		}, {
			"full_month": "October",
			"month_interger": "10",
			"month_int": "10"
		}, {
			"full_month": "November",
			"month_interger": "11",
		}, {
			"full_month": "December",
			"month_interger": "12",
		}];


		//************************** variable declaration
		$scope.pageloader = false;
		$scope.CKEDITOR_LOAD = true;
		$scope.current_mode = 'create';
		$scope.page_title = createpagetitle;
		$scope.status = "1";
		$scope.priority_month = [];
		$scope.invalidform_error = [];
		$scope.formErrors = [];
		$scope.selected_links = [];
		$scope.description_apifiles = [];
		$scope.descriptionfiles = [];
		//mode 
		if ($routeParams.id != undefined) $scope.current_mode = 'edit';
		if ($scope.current_mode == 'edit') $scope.page_title = editpagetitle;

		$scope.links = [{
			"id": 'links_1',
			"title": '',
			"url": ''
		}];



		$(document).ready(function() {
			window.scrollTo(0, 0);
		});

		function multiSelectionRefresh() {
			$scope.$watch("choosen_priority_months", function() {
				$scope.$evalAsync(function() {
					$('.multi-select').multiSelect('refresh');
					$('.ms-container').append('<i class="glyph-icon icon-exchange"></i>');
				});
			});
		}

		//********************************check if is not null
		function set_if_not_null(data, isArray, defaultValue) {
			// defaultValue = defaultValue || '';
			if (data === null || data === undefined)
				return isArray ? [] : defaultValue;
			return isArray ? data : data[0].value;
		}




		//*************************************validation form
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
					custom_errors('error-msg-url', invalid_urltext);
			}
			else {
				if (!$scope.has_empty_box) {
					clear_custom_error('error-msg-url')
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





		//************************** Directive Init section
		$scope.createDirectiveInit = function() {
			$scope.userData = $cookieStore.get('userData');
			multiSelectionRefresh();
			if ($scope.userData != undefined) {
				if ($scope.CKEDITOR_LOAD) {
					CKEDITOR.replaceAll();
					CKEDITOR.env.isCompatible = true;
				}
				$scope.error_message = "";
				$scope.SetDateOnEdit();
			}
			else {
				$location.path("/");
			}
		}

		$scope.SetDateOnEdit = function() {
			if (!isNull($routeParams.id)) {

				$scope.edit_directiveFlag = true;
				// Get all Product Manager List
				$http({
					method: 'GET',
					url: base_url + 'rest/node/' + $routeParams.id,
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-Token': $scope.userData.token
					}
				}).then(function(response) {
					$scope.directiveData = response.data;
					$scope.title = $scope.directiveData.title;
					$rootScope.pageTitle = "Initiative.ly  | Directive : " + $scope.title;
					$scope.status = $scope.directiveData.status;
					if ($scope.directiveData.field_priority_months.und)
						$scope.choosen_priority_months = $scope.directiveData.field_priority_months.und
					else
						$scope.choosen_priority_months = [];
					if ($scope.directiveData.body.und)
						CKEDITOR.instances['description'].setData($scope.directiveData.body.und[0].value);
					if ($scope.directiveData.field_directives_link.und != undefined)
						$scope.links = $scope.directiveData.field_directives_link.und;
					$scope.createBlankLink();
					$scope.choosen_priority_months = $scope.choosen_priority_months.map(function(element) {
						var month = ('0' + element.value).slice(-2);
						return month;
					});
					if ($scope.directiveData.field_directive_current_situatio.und)
						$scope.description_apifiles = $scope.directiveData.field_directive_current_situatio.und;
					else
						$scope.description_apifiles = [];
					angular.forEach($scope.description_apifiles, function(value, key) {
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
					multiSelectionRefresh();
				});
			}
		}



		//***************************code for test title dupicate or new************************************//
		$scope.testTitle = function(title) {
				$scope.titleflage = false;
				if (title && $scope.current_mode == 'create') {
					$scope.titleflage = true;
				}
				else if (title && $scope.current_mode == 'edit') {
					if (title != $scope.directiveData.title) {
						$scope.titleflage = true;
					}
				}
				if ($scope.titleflage) {
					$http({
						method: 'GET',
						url: base_url + 'rest/views/count_directives?title=' + title,
						headers: {
							'Content-Type': 'application/json',
							'X-CSRF-Token': $scope.userData.token
						},
						data: $scope.post_data
					}).success(function(response) {
						if (response.length != 0)
							$scope.invalidform_error['title_error_message'] = custom_errors('error-msg-title', duplicate_title_errortext);
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
					$scope.invalidform_error['title_error_message'] = custom_errors('error-msg-title', invalid_title);
				else {
					clear_custom_error('error-msg-title');
				}
				show_all_errors();
			}
			//***************************code end title textbox************************************//




		//************************validation form
		$scope.directiveValidation = function(type) {
				if (isNull($scope.title)) {
					$scope.invalidform_error['title_error_message'] = custom_errors('error-msg-title', invalid_title);
				}
				else {
					if ($scope.formErrors.indexOf('error-msg-title') == -1)
						clear_custom_error('error-msg-title');
				}
				if (!$scope.formErrors.length) {
					$scope.formErrors = [];
					$scope.createLinks();
					$scope.setPostData();
					if (type == "create")
						$scope.createDirective();
					else if (type == "update")
						$scope.updateDirective();
				}
				else {
					show_all_errors(true);
				}

			}
			//******************directive set data to api format
		$scope.setPostData = function() {
			$scope.descriptionval = CKEDITOR.instances['description'].getData();
			console.log($scope.descriptionval);
			log("$scope.descriptionval" + $scope.descriptionval);
			$scope.postData = {
				"type": "directives",
				"field_capitalized_or_ammortized": {
					"und": "3"
				},
				"title": $scope.title,
				"node_title": $scope.title,
				"field_state": {
					"und": $scope.status
				},
				"field_directives_link": {
					"und": $scope.selected_links
				},
				"field_priority_months": {
					"und": $scope.choosen_priority_months
				},
				"body": {
					"und": [{
						"value": $scope.descriptionval
					}]
				}
			}
		}

		//*************************************create Directive*********************//
		$scope.createDirective = function() {
			$scope.pageloader = true;
			// Post Directive
			$http({
				method: 'POST',
				url: base_url + 'rest/node',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': $scope.userData.token
				},
				data: $scope.postData
			}).success(function(response) {
				var directiveId = response.nid;
				if (selectedfiles.length != 0) {
					$scope.uploadImage(directiveId, createdirective_successtext);
				}
				else {
					$scope.pageloader = false;
					swal({
						title: '',
						text: createdirective_successtext,
						type: 'success',
						timer: 800,
						showCancelButton: false,
						showConfirmButton: false
					});
					$window.location.assign("all-directives");
				}
			}).error(function(error) {
				$scope.pageloader = false;
				if (error.form_errors.title) {
					$scope.invalidform_error['title_error_message'] = custom_errors('error-msg-title', duplicate_title_errortext)
					show_all_errors(true);
				}
			});
		}

		//*************************************update Directive*********************//
		$scope.updateDirective = function() {
			$scope.pageloader = true;
			//Post Directive
			$http({
				method: 'PUT',
				url: base_url + 'rest/node/' + $routeParams.id,
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': $scope.userData.token
				},
				data: $scope.postData
			}).success(function(res) {
				var directiveId = res.nid;
				if (selectedfiles.length != 0) {
					$scope.uploadImage(directiveId, updatedirective_successtext);
				}
				else {
					$scope.pageloader = false;
					swal({
						title: '',
						text: updatedirective_successtext,
						type: 'success',
						timer: 800,
						showCancelButton: false,
						showConfirmButton: false
					});
					$window.location.assign('all-directives');
				}
			}).error(function(error) {
				$scope.pageloader = false;
				if (error.form_errors.title) {
					$scope.invalidform_error['title_error_message'] = custom_errors('error-msg-title', duplicate_title_errortext)
					show_all_errors(true);
				}
			});

		}

		//******************************************uploadImage*********************************/
		$scope.uploadImage = function(directiveId, popuptext) {
			var uploadUrl = base_url + 'rest/node/' + directiveId + '/attach_file'
			var discriptionfile = new FormData();
			angular.forEach(selectedfiles, function(value, key) {
				discriptionfile.append('files[field_directive_current_situatio' + key + ']', value);
				discriptionfile.append('field_name', 'field_directive_current_situatio');
			});
			$http.post(uploadUrl, discriptionfile, {
				transformRequest: angular.identity,
				headers: {
					'Content-Type': undefined,
					'X-CSRF-Token': $scope.userData.token
				}
			}).success(function(response) {
				$scope.pageloader = false;
				swal({
					title: '',
					text: popuptext,
					type: 'success',
					timer: 800,
					showCancelButton: false,
					showConfirmButton: false
				});
				$window.location.assign('all-directives');
			}).error(function(error) {
				$scope.pageloader = false;
			});
		}


		//********************************drag and drop current_files added*******************************//
		$scope.adddescriptionfiles = function(files) {
			$scope.descriptionfiles = files;
			$scope.$apply();
		};
		//********************************current_files End ************************************//
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
						angular.forEach($scope.description_apifiles, function(value, key) {
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
							$scope.imageReset();
						}).error(function(res) {});
					})
				}
			})
		}

		$scope.imageReset = function() {
			$http({
				method: 'GET',
				url: base_url + 'rest/node/' + $routeParams.id,
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': $scope.userData.token
				}
			}).then(function(response) {
				$scope.directiveData = response.data;
				if ($scope.directiveData.field_directive_current_situatio.und)
					$scope.description_apifiles = $scope.directiveData.field_directive_current_situatio.und;
				else
					$scope.description_apifiles = [];
				angular.forEach($scope.description_apifiles, function(value, key) {
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
			});
		}

		//*****************************Delete images form drag and drop without api*********************//
		$scope.deleteSelectimage = function(image_id) {
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
						angular.forEach($scope.descriptionfiles, function(value, key) {
							if (value.file_id == image_id) {
								$scope.descriptionfiles.splice(key, 1);
								selectedfiles = $scope.descriptionfiles;
							}
						});
						swal({
							title: deleted_title,
							text: deleted_description,
							timer: 800,
							type: 'success',
							showCancelButton: false,
							showConfirmButton: false
						});
						$scope.CKEDITOR_LOAD = false;
						$timeout($scope.createDirectiveInit(), 500);
					});
			}
			//*********************************images remove end***************************//

	}
]);
