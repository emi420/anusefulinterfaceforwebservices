/*
  Copyright (c) 2016 Emilio Mariscal

  Permission is hereby granted, free of charge, to any
  person obtaining a copy of this software and associated
  documentation files (the "Software"), to deal in the
  Software without restriction, including without limitation
  the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the
  Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice
  shall be included in all copies or substantial portions of
  the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
  KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
  PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
  OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
  OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

'use strict';

// API auth interface (Login, Logout and utils

angular.module('api.auth', ['api.settings'])

    // Auth service

    .factory('Auth', function($q, $window, $rootScope, $http, Settings) {
        return {

                // Login
                // Usage: Auth.login(user,pass)

                login: function(user, pass) {
                    var deferred = $q.defer();

                    if (user && pass) {

                        $rootScope.showLoading = true;
                        $http({
                                url: Settings.auth() + '/login/',
                                method: 'POST',
                                data: {
                                    username: user,
                                    password: pass
                                },
                                headers: Settings.headers
                            })
                            .success(function(data, status, headers, config) {
                                $rootScope.showLoading = false;
                                if (data.code === 46 || data.code === 44) {
                                    deferred.reject(data.text);
                                } else {
                                    window.localStorage.setItem("auth_key", data.key)
                                    deferred.resolve(data);
                                }
                            })
                            .error(function(err) {
                                $rootScope.showLoading = false;
                                deferred.reject(err);
                            });

                    } else {
                        deferred.reject();
                    }

                    return deferred.promise;
                },

                // getHeader gets the authtorization headers
                // Usage: Auth.login();

                getHeader: function() {                        
                    return {Authorization: 'Token ' + window.localStorage.getItem("auth_key")}
                },

                // isLoggedIn check if the user is logged in
                // Usage: Auth.isLoggedIn();

                isLoggedIn: function() {             
                    if (window.localStorage.getItem("auth_key")) {
                        return true;
                    } else {
                        return false;
                    }        
                },

                // logout log out
                // Usage: Auth.logout();
                logout: function() {              
                    return window.localStorage.removeItem("auth_key");
                },

        }
    })

    // Controllers useful for Auth templates

    .controller('AuthCtrl', function($scope, $rootScope, Auth, $location) {
        if (Auth.isLoggedIn()) {
            $rootScope.logged = true;
            $rootScope.username =  window.localStorage.getItem("username")
        } else {
            $location.path("login");
        }
        $scope.logout = function() {
            $rootScope.logged = false;
            Auth.logout();
        }

    })

    .controller('LoginCtrl', function($scope, Auth, $rootScope, $location) {
        $scope.waiting = false;
        $scope.loginData = {};
        $rootScope.logged = false;
        $scope.doLogin = function() {

            $rootScope.loading = true;
            $scope.waiting = true;
            $scope.loginError = "";

            Auth.login($scope.loginData.username, $scope.loginData.password)
                .then(function(response) {
                    $rootScope.loading = false;
                    $rootScope.logged = true;
                    $rootScope.username = $scope.loginData.username;
                    window.localStorage.setItem("username",$scope.loginData.username)
                    $location.path("index");
            }, function(err) {
                $rootScope.loading = false;
                $scope.loginError = "Something went wrong! <strong><br />try again please;</strong> ";
                $scope.loginErrorMsg = "If you need help you can write an e-mail to admin@localhost.";
                $scope.waiting = false;
            });

        }
    })

    // Set the route proiver config

    .config(['$routeProvider',
     function($routeProvider) {
        $routeProvider.
           when('/login', {
              templateUrl: 'lib/api/auth/auth.html',
              controller: 'LoginCtrl'
           })
           .otherwise({
              redirectTo: '/login'
           });
     }])


