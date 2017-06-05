app.service('AuthService', ['$cookieStore', function($cookieStore) {

    this.user_logged_in = function() {$user_data = $cookieStore.get('userData');
        if ($user_data)
            return $user_data.token;
    };
}]);
