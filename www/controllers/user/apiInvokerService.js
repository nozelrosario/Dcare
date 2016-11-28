angular.module('dCare.ApiInvoker', ['dCare.Services.UserStore', 'dCare.user'])

.factory("ApiInvokerService", function ($q, $http, $state, UserStore) {
    var makeHTTPcall = function (config) {
        var deferedHttpCall = $q.defer();
        var httpConfig = {
            method: config.method,
            url: config.url,
            data: config.data,
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': ''
            }
        };
        if (config.secure) {
            UserStore.getUser().then(function (userData) {
                var authToken = userData.authToken;
                httpConfig.headers['x-access-token'] = authToken;
                $http(httpConfig).then(function (response) {
                    // Http Call Success
                    if (response.status === 200) {
                        if (response.data && response.data.status === "error" && response.data.error === "Invalid Login") {
                            // Authentication Failure, redirect to login.
                            deferedHttpCall.reject();
                            $state.go("login");
                        } else {
                            // Authentication Success
                            deferedHttpCall.resolve(response.data);
                        }
                    } else {
                        // Problem with Http Call
                        app.log.error("Http Response Error: [Error]-" + JSON.stringify(response));
                        deferedHttpCall.reject();
                    }              
                }, function (responseError) {
                    // Http Call Failed
                    app.log.error("Http Call Failed: [Error]-" + JSON.stringify(responseError));
                    deferedHttpCall.reject();
                });
            }).fail(function (error) {
                // Token fetch failed redirect to login
                app.log.error("User DB read Failed: [Error]" + error);
                deferedHttpCall.reject();
                $state.go("login");
            });
        } else {
            $http(httpConfig).then(function (response) {
                // Http Call Success
                if (response.status === 200) {
                    if (response.data && response.data.status === "error") {
                        //NR: API Failure
                        deferedHttpCall.reject();
                    } else {                        
                        deferedHttpCall.resolve(response.data);
                    }
                } else {
                    // Problem with Http Call
                    app.log.error("Http Response Error: [Error]-" + JSON.stringify(response));
                    deferedHttpCall.reject();
                }
            }, function (responseError) {
                // Http Call Failed
                app.log.error("Http Call Failed: [Error]-" + JSON.stringify(responseError));
                deferedHttpCall.reject(responseError);
            });
        }
        
        return deferedHttpCall.promise;
    };

    var invokeLogin = function (data) {
        var deferedLoginCall = $q.defer();
        var loginApiURL = app.config.apiBaseURL + "login";
        makeHTTPcall({ secure: false, method: "POST", url: loginApiURL, data: data }).then(function (responseData) {
            //Api-responseData : { status: "error.success", error : obj, message: obj, data: obj }
            if (responseData.status !== "error") {
                app.log.info("invokeLogin : [" + responseData.status + " ] -Message:" + responseData.message);
                deferedLoginCall.resolve(responseData.data);
            } else {
                app.log.error("invokeLogin : [" + responseData.status + " ] -Message:" + responseData.message);
                app.log.error("[" + responseData.status + " ] -Error:" + responseData.error);
                deferedLoginCall.reject(responseData.message);
            }
            
        }).catch(function (responseError) {
            app.log.error("Http Call For Login Failed: [Error]-" + JSON.stringify(responseError));
            deferedLoginCall.reject(responseError);
        });
        return deferedLoginCall.promise;
    };

    var invokeRefreshToken = function () {
        var deferedLoginCall = $q.defer();
        var data = {};
        var loginApiURL = app.config.apiBaseURL + "refresh_token";
        makeHTTPcall({ secure: true, method: "GET", url: loginApiURL, data: data }).then(function (responseData) {
            //Api-responseData : { status: "error.success", error : obj, message: obj, data: obj }
            if (responseData.status !== "error") {
                app.log.info("invokeLogin : [" + responseData.status + " ] -Message:" + responseData.message);
                deferedLoginCall.resolve(responseData.data);
            } else {
                app.log.error("invokeLogin : [" + responseData.status + " ] -Message:" + responseData.message);
                app.log.error("[" + responseData.status + " ] -Error:" + responseData.error);
                deferedLoginCall.reject(responseData.message);
            }

        }).catch(function (responseError) {
            app.log.error("Http Call For Login Failed: [Error]-" + JSON.stringify(responseError));
            deferedLoginCall.reject(responseError);
        });
        return deferedLoginCall.promise;
    };

    var invokeSignUp = function (data) {
        var deferedSignUpCall = $q.defer();
        var signUpApiURL = app.config.apiBaseURL + "signup";
        makeHTTPcall({ secure: false, method: "POST", url: signUpApiURL, data: data }).then(function (responseData) {
            //Api-responseData : { status: "error.success", error : obj, message: obj, data: obj }
            if (responseData.status !== "error") {
                app.log.info("invokeSignUp : [" + responseData.status + " ] -Message:" + responseData.message);
                deferedSignUpCall.resolve(responseData.data);
            } else {
                app.log.error("invokeSignUp : [" + responseData.status + " ] -Message:" + responseData.message);
                app.log.error("[" + responseData.status + " ] -Error:" + responseData.error);
                deferedSignUpCall.reject(responseData.message);
            }
        }).catch(function (responseError) {
            app.log.error("Http Call For SignUp Failed: [Error]-" + JSON.stringify(responseError));
            deferedSignUpCall.reject(responseError);
        });
        return deferedSignUpCall.promise;
    };

    var invokePatientSync = function (data) {
        var deferedPatientSyncCall = $q.defer();
        var signUpApiURL = app.config.apiBaseURL + "user/update";
        makeHTTPcall({ secure: true, method: "POST", url: signUpApiURL, data: data }).then(function (responseData) {
            //Api-responseData : { status: "error.success", error : obj, message: obj, data: obj }
            if (responseData.status !== "error") {
                app.log.info("invokePatientSync : [" + responseData.status + " ] -Message:" + responseData.message);
                deferedPatientSyncCall.resolve(responseData.data);
            } else {
                app.log.error("invokePatientSync : [" + responseData.status + " ] -Message:" + responseData.message);
                app.log.error("[" + responseData.status + " ] -Error:" + responseData.error);
                deferedPatientSyncCall.reject(responseData.message);
            }
        }).catch(function () {
            app.log.error("Http Call For PatientSync Failed");
            deferedPatientSyncCall.reject();
        });
        return deferedPatientSyncCall.promise;
    };

    return {
        login: invokeLogin,
        signup: invokeSignUp,
        syncPatient: invokePatientSync,
        refreshToken: invokeRefreshToken
    };
});