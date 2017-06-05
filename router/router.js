var app = angular.module('DrupalApp', ['ngRoute', 'ngCookies', 'ngSanitize', 'ui', 'LocalStorageModule', 'ui.bootstrap']);
//ngAnimate

var base_url = "https://product-management-agilexcyber.c9users.io/";
var base_url_small = "http://product-management-agilexcyber.c9users.io/";
var log_debug = false;

app.directive('fileModel', ['$parse', function($parse) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;

			element.bind('change', function() {
				scope.$apply(function() {
					modelSetter(scope, element[0].files[0]);
				});
			});
		}
	};
}]);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {
			templateUrl: 'views/user/login.html',
			controller: 'loginController',
			title: 'Initiative.ly | Login'
		}).when('/login', {
			templateUrl: 'views/user/login.html',
			controller: 'loginController',
			title: 'Initiative.ly | Login'
		}).when('/all-users/:id', {
			templateUrl: 'views/user/user-profile.html',
			controller: 'viewUserController',
			title: 'Initiative.ly |'
		}).when('/all-users', {
			templateUrl: 'views/user/organisation.html',
			controller: '',
			title: 'Initiative.ly | All Users'
		}).when('/new-initiative', {
			templateUrl: 'views/initiative/create-initiative.html',
			controller: 'createInitiativeController',
			title: 'Initiative.ly | New Initiative'
		}).when('/new-initiative?:directive=:id', {
			templateUrl: 'views/initiative/create-initiative.html',
			controller: 'createInitiativeController',
			title: 'Initiative.ly | Initiative:title of Initiative'
		}).when('/forgot-password', {
			templateUrl: 'views/user/password.html',
			controller: 'loginController'
		}).when('/all-initiatives', {
			templateUrl: 'views/initiative/view-initiatives.html',
			controller: 'viewInitiativesController',
			title: 'Initiative.ly | All Initiatives'
		}).when('/new-directive', {
			templateUrl: 'views/directive/create-directive.html',
			controller: 'createDirectiveController',
			title: 'Initiative.ly | New Directive'
		}).when('/new-directive/:id', {
			templateUrl: 'views/directive/create-directive.html',
			controller: 'createDirectiveController',
			title: 'Initiative.ly | Directive: title of directive'
		}).when('/all-directives', {
			templateUrl: 'views/directive/view-directives.html',
			controller: 'viewDirectivesController',
			title: 'Initiative.ly | All Directives'
		}).when('/directive/:id', {
			templateUrl: 'views/directive/view-directive.html',
			controller: 'viewDirectiveController',
			title: ' Initiative.ly | Directive: title of directive'
		}).when('/initiative/:id', {
			templateUrl: 'views/initiative/view-initiative.html',
			controller: 'viewInitiativeController',
			title: 'Initiative.ly | Initiative: title of Initiative'
		}).when('/editInitiative/:id', {
			templateUrl: 'views/initiative/create-initiative.html',
			controller: 'createInitiativeController',
			title: 'Initiative.ly | Initiative: title of Initiative'
		}).when('/all-dependencies', {
			templateUrl: 'views/dependency/view-dependencies.html',
			controller: '',
			title: 'Initiative.ly | All Dependencies'
		}).when('/new-dependency', {
			templateUrl: 'views/dependency/create-dependency.html',
			controller: '',
			title: 'Initiative.ly | New Dependency'
		}).when('/needs-ux-ui', {
			templateUrl: 'views/needs_ux_ui/needs-ux-ui.html',
			controller: '',
			title: 'Initiative.ly | Needs UX UI'
		}).when('/newpage', {
			templateUrl: 'views/newpage.html',
			controller: 'newController'
		})
		.otherwise({
			redirectTo: '/'
		});
	$locationProvider.html5Mode(true);
}]);

app.run(['$location', '$rootScope', function($location, $rootScope) {
	$rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
		if (current.hasOwnProperty('$$route')) {
			$rootScope.pageTitle = current.$$route.title;
		}
	});
}]);
