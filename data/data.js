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

// API data interface (Get, Create, Remove, Update)

angular.module('api.data', ['api.auth'])

    // Data service

    .factory('Data', function ($q, $window, $http, Settings, Auth, $rootScope) {
        return {

            // Get
            // Usage: Data.get("model").then(function(res){ ... });
            //        Data.get("model","10")
            //        Data.get("model","10",["option1=value1","option2=14"])
            //        Data.get("http://yourdomain.com/yourapi/20/");            

            get: function (className, param, options) {
                var deferred = $q.defer();
                $rootScope.showLoading = true;

                if (className.indexOf("http://") === -1) {

                    var url = Settings.data() + '/' + className + '/' ;

                    if (param) {
                        if (param === " ") {
                            param = "";
                        }
                        url += param + '/';
                    }

                    url += '?format=json';

                    if (options) {
                        url += '&' + options.join("&");
                    }
                } else {
                    url = className;
                }

                $http({
                        url: url,
                        headers: $.extend({}, Settings.headers, Auth.getHeader())
                    })
                    .success(function (r) {
                        $rootScope.showLoading = false;
                        deferred.resolve(r);
                    })
                    .error(function (err) {
                        $rootScope.showLoading = false;
                        deferred.reject(err);
                    });

                return deferred.promise;
            },

            // Create
            // Usage: Data.create("model",{name: "James Dee"}).then(function(res){ ... });

            create: function (className, data, options) {
                var deferred = $q.defer();
                $rootScope.showLoading = true;

                var httpOptions = {
                    url: Settings.data() + '/' + className + '/',
                    data: data,
                    headers: $.extend({}, Settings.headers, Auth.getHeader()),
                    method: "POST"
                }

                if (options) {
                    $.extend(httpOptions, options);
                    if (options.FormData === true) {
                        httpOptions.headers['Content-Type'] = undefined;
                        httpOptions.transformRequest = function(data) {
                            var formData = new FormData(),
                                key;
                            for (key in data) {
                                if (data[key]) {
                                    formData.append(key, data[key])                                
                                }
                            }
                            return formData;
                        }
                    }
                }



                $http(httpOptions)
                    .success(function (r) {
                        $rootScope.showLoading = false;
                        deferred.resolve(r);
                    })
                    .error(function (err) {
                        $rootScope.showLoading = false;
                        deferred.reject(err);
                    });

                return deferred.promise;
            },

            // Remove
            // Usage: Data.remove("model","10").then(function(res){ ... });

            remove: function (className, param) {
                var deferred = $q.defer();
                var url = Settings.data() + '/' + className + '/';

                if (param) {
                    url += param + '/';
                }

                $http({
                        url: url,
                        headers: $.extend({}, Settings.headers, Auth.getHeader()),
                        method: "DELETE"
                    })
                    .success(function (r) {
                        deferred.resolve(r);
                    })
                    .error(function (err) {
                        deferred.reject(err);
                    });

                return deferred.promise;
            },

            // Update


            // Usage: Data.update("model",{name: "James Jones"}).then(function(res){ ... });
            update: function (className, param, data, options) {
                var deferred = $q.defer();
                var url = Settings.data() + '/' + className + '/';
                $rootScope.showLoading = false;

                if (param) {
                    url += param + '/';
                }
                var httpOptions = {
                    url: url,
                    data: data,
                    headers: $.extend({}, Settings.headers, Auth.getHeader()),
                    method: "PUT"
                }

                if (options && options.FormData === true) {
                    httpOptions.headers['Content-Type'] = undefined;
                    httpOptions.transformRequest = function(data) {
                        var formData = new FormData(),
                            key;
                        for (key in data) {
                            if (data[key]) {
                                formData.append(key, data[key])                                
                            }
                        }
                        return formData;
                    }
                }

                $http(httpOptions)
                    .success(function (r) {
                        $rootScope.showLoading = false;
                        deferred.resolve(r);
                    })
                    .error(function (err) {
                        $rootScope.showLoading = false;
                        deferred.reject(err);
                    });

                return deferred.promise;
            },
        }
    });

