'use Strict'
//******************configuration section*************************//////******************configuration section*************************////
//hard Coded Strings

app.controller('viewInitiativeController', ["$scope", "$window", "$http", "$cookieStore", "$location", "$rootScope", "AuthService", "$routeParams", "$timeout",
  function($scope, $window, $http, $cookieStore, $location, $rootScope, AuthService, $routeParams, $timeout) {


    $(document).ready(function() {
      window.scrollTo(0, 0);

    });


    function scrollToComment() {
      $timeout(function() {
        $(".scrollable-content").scrollTop($(".chat-box:visible").height());
      }, 0, false);
    }

    function ordinal_suffix_of(day) {
      var i = day;
      var j = i % 10,
        k = i % 100;
      if (j == 1 && k != 11) {
        return i + "st";
      }
      if (j == 2 && k != 12) {
        return i + "nd";
      }
      if (j == 3 && k != 13) {
        return i + "rd";
      }
      return i + "th";
    }

    $scope.gotoViewDirectivePage = function(id) {
      $location.path("/view-directive/" + id);
    }

    $scope.gotoViewInitiatives = function() {
      $location.path("/view-initiatives");
    }


    $scope.pageloader = false;
    $scope.viewInitiativeInit = function() {
      $scope.userData = $cookieStore.get('userData');
      if (AuthService.user_logged_in()) {
        CKEDITOR.env.isCompatible = true
        CKEDITOR.replaceAll();

        $scope.login_user_id = $scope.userData.user_id;
        $scope.pageloader = true;
        $scope.node_Id = $routeParams.id.slice($routeParams.id.lastIndexOf('-') + 1);
        $http({
          method: 'GET',
          url: base_url + 'rest/views/initiative?nid=' + $scope.node_Id,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function(res) {
          $scope.getComments();
          $scope.initiativeData = res.data[0];
          $scope.title = $scope.initiativeData.title;
          $rootScope.pageTitle = "Initiative.ly  | Initiative : " + $scope.initiativeData.title;
          $scope.current_situation_files = JSON.parse($scope.initiativeData.current_situation_files);
          $scope.directives = JSON.parse($scope.initiativeData.directives);
          $scope.business_owner = JSON.parse($scope.initiativeData.business_owner);
          $scope.stakeholder = JSON.parse($scope.initiativeData.stakeholder);
          $scope.product_manager = JSON.parse($scope.initiativeData.product_manager);
          $scope.proposed_situation_files = JSON.parse($scope.initiativeData.proposed_situation_files);

          if ($scope.initiativeData.links)
            $scope.links = JSON.parse($scope.initiativeData.links);
          if ($scope.initiativeData.live_date) {
            var livedate = $scope.initiativeData.live_date.slice(0, 10);
            $scope.livedate_year = livedate.split('-')[0];
            $scope.livedate_month = $scope.totalMonths.filter(function(month) {
              return month.month_int == livedate.split('-')[1];
            });
            var month_integer = livedate.split('-')[2];
            month_integer = month_integer > 9 ? livedate.split('-')[2] : month_integer.slice(1, 2);
            $scope.livedate_day = ordinal_suffix_of(month_integer);
          }
          if ($scope.initiativeData.month) {
            var month_integer = '0' + $scope.initiativeData.month.split('-')[0];
            month_integer = month_integer.slice(-2);
            $scope.shedulemonth = $scope.totalMonths.filter(function(month) {
              return month.month_int == month_integer
            });
            $scope.sheduleyear = $scope.initiativeData.month.split('-')[1];
          }
          $scope.currentfiles = [];
          angular.forEach($scope.current_situation_files, function(value, key) {
            var extension = value.url.split('.').pop();
            var file_obj = {};
            file_obj["fileurl"] = '//' + value.url.replace(/(^\w+:|^)\/\//, '');
            file_obj["extension"] = extension;
            file_obj["id"] = value.id;
            file_obj["filename"] = value.url.substring(value.url.lastIndexOf('/') + 1);
            if (extension == 'jpg' || extension == 'png' || extension == 'jpeg' || extension == 'gif') {
              file_obj["imageurl"] = '//' + value.url.replace(/(^\w+:|^)\/\//, '');
              file_obj["type"] = "image";
            }
            else {
              file_obj["type"] = "doc";
              file_obj["displaytext"] = extension.toUpperCase();
              // file_obj["imageurl"] = ". / assets / images /doc-icon.png";
            }
            $scope.currentfiles.push(file_obj);
          });
          $scope.proposedfiles = [];
          angular.forEach($scope.proposed_situation_files, function(value, key) {
            var extension = value.url.split('.').pop();
            var file_obj = {};
            file_obj["fileurl"] = '//' + value.url.replace(/(^\w+:|^)\/\//, '');
            file_obj["extension"] = extension;
            file_obj["id"] = value.fid;
            file_obj["filename"] = value.url.substring(value.url.lastIndexOf('/') + 1);
            if (extension == 'jpg' || extension == 'png' || extension == 'jpeg' || extension == 'gif') {
              file_obj["imageurl"] = '//' + value.url.replace(/(^\w+:|^)\/\//, '');
              file_obj["type"] = "image";
            }
            else {
              file_obj["type"] = "doc";
              file_obj["displaytext"] = extension.toUpperCase();
            }
            $scope.proposedfiles.push(file_obj);
          });
        });
      }
      else {
        $location.path("/");
      }
    }


    $scope.reply_cid = [];
    $scope.user_comments_new = [];
    $scope.getComments = function(type) {
      $http({
        method: 'GET',
        // url: base_url + 'rest/comment',
        url: base_url + 'rest/views/all_comments?nid=' + $scope.node_Id,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function(res) {
        $scope.pageloader = false;
        $scope.user_comments = res.data;
        angular.forEach($scope.user_comments, function(value, key) {
          var reply_comments = $scope.user_comments.filter(function(comment) {
            if (value.cid == comment.pid)
              $scope.reply_cid.push(comment.cid);
            return value.cid == comment.pid
          });
          value["reply_comments"] = reply_comments;
        });
        $scope.user_comments_new = $scope.user_comments.filter(function(comment) {
          return $scope.reply_cid.indexOf(comment.cid) == -1
        });
        log("getComments" + type);
        if (type != 'reply') {
          console.log("getComments if")
          scrollToComment();
        }
      });

    }


    $scope.gotoUserProfile = function(id) {
      $location.path("/all-users/" + id);
    }

    //gotoEditInitiative
    $scope.gotoEditInitiative = function(id) {
      $location.path("/editInitiative/" + id);
    }

    // $scope.replyToggle = function() {
    //   $scope.showReply = !$scope.showReply;
    // };

    // $scope.closereplyToggle = function(comment) {
    //   comment.toggle = !comment.toggle;
    //   console.log(comments.toggle);
    // }


    $scope.sendUserComments = function(parentid, text, type) {
      if (type == "comment")
        text = CKEDITOR.instances['ckeditor_comment'].getData();
      else if (type == "comment_sm")
        text = CKEDITOR.instances['ckeditor_comment_sm'].getData();
      else
        text = text;

      var data = {
        "pid": parentid,
        "nid": $scope.node_Id,
        "uid": $scope.login_user_id,
        "subject": "Comment on initiative" + $scope.node_Id,
        "language": "und",
        "comment_body": {
          "und": [{
            "value": text,
            "format": "filtered_html",
            "safe_value": text
          }]
        }
      }
      log(data);
      $http({
        method: 'POST',
        url: base_url + 'rest/comment',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': $scope.userData.token
        },
        data: data
      }).success(function(res) {
        $scope.getComments(type);
        CKEDITOR.instances['ckeditor_comment'].setData("");
        CKEDITOR.instances['ckeditor_comment_sm'].setData("");
      }).error(function(error) {
        console.log(error);
      });
    }


    $scope.imageDelete = function(id, type) {
      // console.log(id);
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
            url: base_url + 'rest/file/' + id,
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': $scope.userData.token
            }
          }).then(function(res) {
            var node_id = Object.keys(res.data.file.node);
            // console.log(id, type);
            var current_imageids_arr = [];
            angular.forEach($scope.currentfiles, function(value, key) {
              var current_imageids_obj = {};
              if (id == value.id)
                current_imageids_obj[value.id] = value.id;
              else
                current_imageids_obj["fid"] = value.id;
              current_imageids_arr.push(current_imageids_obj);
            })

            var proposed_imageids_arr = [];
            angular.forEach($scope.proposedfiles, function(value, key) {
              var proposed_imageids_obj = {};
              if (id == value.id)
                proposed_imageids_obj[value.id] = value.id;
              else
                proposed_imageids_obj["fid"] = value.id;
              proposed_imageids_arr.push(proposed_imageids_obj);
            })

            // console.log(current_imageids_arr);
            if (type == "current") {
              var data = {
                "title": $scope.title,
                "type": "initiatives",
                "field_capitalized_or_ammortized": {
                  "und": "3"
                },
                "field_current_situation_files": {
                  "und": current_imageids_arr
                }
              }
            }
            else {
              var data = {
                "title": $scope.title,
                "type": "initiatives",
                "field_capitalized_or_ammortized": {
                  "und": "3"
                },
                "field_proposed_situation_files": {
                  "und": proposed_imageids_arr
                }
              }

            }
            // console.log(data);
            $http({
              method: 'PUT',
              url: base_url + 'rest/node/' + node_id,
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': $scope.userData.token
              },
              data: data
            }).success(function(res) {
              // console.log(res);
              swal({
                title: deleted_title,
                text: deleted_description,
                timer: 800,
                type: 'success',
                showCancelButton: false,
                showConfirmButton: false
              });
              $scope.viewInitiativeInit();
            }).error(function(res) {
              // console.log(error);
            });

          });
        }
      })

    }


    // Delete Initiative
    $scope.deleteInitiative = function(id) {
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
          //swal("Deleted!", "Your imaginary file has been deleted.", "success");
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
              swal({
                title: deleted_title,
                text: deleted_description,
                timer: 800,
                type: 'success',
                showCancelButton: false,
                showConfirmButton: false
              });
              $location.path("/all-initiatives")
            }
          });

        }
      });
    }

    //month array

    $scope.totalMonths = [{
      "name": "Jan",
      'month_int': "01"
    }, {
      "name": "Feb",
      'month_int': "02"
    }, {
      "name": "Mar",
      'month_int': "03"
    }, {
      "name": "Apr",
      'month_int': "04"
    }, {
      "name": "May",
      'month_int': "05"
    }, {
      "name": "Jun",
      'month_int': "06"
    }, {
      "name": "Jul",
      'month_int': "07"
    }, {
      "name": "Aug",
      'month_int': "08"
    }, {
      "name": "Sep",
      'month_int': "09"
    }, {
      "name": "Oct",
      'month_int': "10"
    }, {
      "name": "Nov",
      'month_int': "11"
    }, {
      "name": "Dec",
      'month_int': "12"
    }];

  }
]);
