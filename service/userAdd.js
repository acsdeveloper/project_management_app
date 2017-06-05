app.service('user', ['$http', 'toastr', function($http, toastr) {
  this.add = function(file, uploadUrl) {
    var fd = new FormData();
    fd.append('profile_picture', file.file);
    fd.append('username', file.username)
    fd.append('email', file.email)
    fd.append('gender', file.gender)
    fd.append('password', file.password)
    fd.append('mobile', file.mobile)
    fd.append('privilege', file.privilege)
    fd.append('role', file.role)
    fd.append('uname', file.uname)
    fd.append('userid', file.id)
    fd.append('user_from', 'DU')
    fd.append('lname', ' ')
    fd.append('fname', file.username)
    fd.append('DU_active', 1)
    fd.append('active', 1)
    fd.append('apikey', 1)
    fd.append('session', file.session)
    fd.append('created', Date.parse(new Date()) / 1000)
    fd.append('created_by', file.cr_by != 0 ? file.session : file.session)
    fd.append('user_type', 'DB_user')
    fd.append('time_zone', file.time_zone)
    fd.append('role', file.user_role)
    fd.append('telephonic_code', file.tele_code)
    return $http.post(uploadUrl, fd, {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    });
  }
}])
