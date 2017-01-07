angular.module('dCare.Authentication', ['ionic',
                                        'dCare.Services.UserStore', 'dCare.ApiInvoker'])

.factory("AuthenticationService", function ($q, UserStore, ApiInvokerService, $ionicLoading, $mdDialog) {
    var login = function (userID,password) {
        //NR: TODO: Call Rest api for login
        //NR: TODO:  if Login Success => merge the recieved User Data with existing User Data {wireup following code}
        var deferredLogin = $q.defer();
        //NR: Mock call
        var apiPayLoad = { email: userID, password: password };
        ApiInvokerService.login(apiPayLoad).then(function (remoteUserData) {   /// This Call will be replased by Actual Login Service call-promise
            UserStore.getUser().then(function (user) {
                var localUserData = (user) ? user : {};
                localUserData.firstName = remoteUserData.firstname;
                localUserData.lastName = remoteUserData.lastname;
                localUserData.email = remoteUserData.email;
                localUserData.photo = remoteUserData.photo;
                localUserData.authToken = remoteUserData.token;
                localUserData.tokenExpiryDate = (parseJWT(remoteUserData.token)).exp;
                localUserData.loginDatetime = remoteUserData.loginDatetime;
                localUserData.patients = (localUserData.patients) ? localUserData.patients : [];
                var patientFound;
                angular.forEach(remoteUserData.patients, function (remotePatient, key) {
                    patientFound = false;
                    //NR: Attempt to find if patient aready present locally
                    angular.forEach(localUserData.patients, function (localPatient, key) {
                        if (localPatient.guid === remotePatient.guid) {
                            patientFound = true;
                            localPatient.isDefault = remotePatient.isDefault;
                            localPatient.fullName = remotePatient.fullName;
                            localPatient.photo = remotePatient.photo;
                        }
                    });
                    //NR: If Patient does not exist, add Sync Flags, add Patient.
                    if (!patientFound) {
                        remotePatient.isEdited = false;
                        remotePatient.initialSyncStatus = "notSynced";
                        remotePatient.syncStatus = "notSynced";
                        remotePatient.syncStartDate = '';
                        remotePatient.syncEndDate = '';
                        localUserData.patients.push(remotePatient);
                    }
                });

                UserStore.save(localUserData).then(function (localUserData) {
                    //@NR: Saved Latest User Data
                    deferredLogin.resolve(localUserData);
                    //@NR: NOTE: Post login, the initi module will automatically handle initial sync responsiblity.
                }).fail(function (err) {
                    //@NR: Save Latest Data Failed, Try Again to Login.
                    deferredLogin.reject(err);
                });
            }).fail(function (err) {
                // Login Failed try login again.
                deferredLogin.reject(err);
            });
        }).catch(function (error) {
            // Login Service call Failed try login again.
            app.log.error("Failed Login Call [Error]- " + JSON.stringify(error));
            deferredLogin.reject("Unable to connect server !!");
        });

        return deferredLogin.promise;
    };

    var refreshToken = function () {
        var deferredLogin = $q.defer();
        UserStore.getUser().then(function (localUserData) {   /// This Call will be replased by Actual Login Service call-promise            
            ApiInvokerService.refreshToken().then(function (remoteUserData) {
                if (localUserData && localUserData.email) {
                    app.context.dbAuthCookie = remoteUserData.token;
                    var jwtPayload = parseJWT(remoteUserData.token);
                    ////NR: Only update tokn & login info
                    localUserData.authToken = remoteUserData.token;
                    localUserData.tokenExpiryDate = jwtPayload.exp;
                    ////localUserData.loginDatetime = remoteUserData.loginDatetime;
                    ////NR: Set Cookie in app context for consumption by Sync-Services
                    //app.context.dbAuthCookie = jwtPayload.cookie;
                    ////@NR: Save token to User Data
                    UserStore.save(localUserData).then(function (localUserData) {
                        deferredLogin.resolve(localUserData);
                    }).fail(function (err) {
                        //@NR: Save Latest Data Failed, Try Again to Login.
                        deferredLogin.reject(err);
                    });
                } else {
                    deferredLogin.reject("No User");
                }
                
            }).catch(function (err) {
                // refreshToken Failed try login again.
                deferredLogin.reject(err);
            });
        }).fail(function (error) {
            // Login Service call Failed try login again.
            app.log.error("Failed Token Refresh Call [Error]-" + JSON.stringify(error));
            deferredLogin.reject("Unable to connect server !!");
        });
        return deferredLogin.promise;
    };

    var logout = function () {
        var deferredLogout = $q.defer();
        UserStore.getUser().then(function (user) {
            user.authToken = '';
            user.tokenExpiryDate = '';
            user.patients = [];
            user.loginDatetime = '';
            UserStore.save(user).then(function () {
                deferredLogout.resolve();
            }).fail(function (err) {
                //@NR: Save Data Failed, Try Again to Login.
                deferredLogout.reject(err);
            });
        }).fail(function (err) {
            // Failed Logout, try again.
            deferredLogout.reject(err);
        });
        return deferredLogout.promise;
    };

    var checkLogin = function () {
        var deferredLoginCheck = $q.defer();
        UserStore.getUser().then(function (user) {
            //NR: Validate Login [could hav more criteria check]
            if (user && user.authToken && castToLongDate(user.tokenExpiryDate) > castToLongDate(new Date())) {
                deferredLoginCheck.resolve();
            }else{
                deferredLoginCheck.reject();
            }
        }).fail(function () {
            deferredLoginCheck.reject();
        });
        return deferredLoginCheck.promise;
    };

    var register = function (user) {
        var deferredRegisterUser = $q.defer();
        //NR: TODO: Do basic User Data validation 
        //NR: NOTE: User Data will be added to Local store during Successfull login process, and not here

        //var mockUserResponse = { authToken: '_T_O_K_E_N_', tokenExpiryDate: castToLongDate(new Date("12/12/2050")), patients: [], loginDatetime: castToLongDate(new Date()) };
        //var mockUserData = angular.extend({}, user, mockUserResponse);
        ApiInvokerService.signup(user).then(function (newUserData) {
           // UserStore.save(newUserData).then(function (userData) {
            deferredRegisterUser.resolve(newUserData);
           // }).fail(function () {
           //     deferredRegisterUser.reject();
          //  });
        }).catch(function (err) {
            deferredRegisterUser.reject();
        });
        return deferredRegisterUser.promise;
    };

    //@private
    var decodeBas64 = function (base64string) {
        var decodedString = "";
        try {
            decodedString = window.atob(base64string)
        } catch(err) {
            decodedString = "";
            console.log(err);
        }
        return decodedString;
    };

    //@private
    var parseJWT = function (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        var payload = {exp:''};
        var base64Decoded = decodeBas64(base64);
        if (base64Decoded) {
            payload = JSON.parse(base64Decoded);
            //Convert time-stamps to "milliseconds", because server sends in "seconds"
            payload.exp = payload.exp * 1000;
            payload.iat = payload.iat * 1000;
        }
        return payload;
    };

    return {
        login: login,
        logout: logout,
        checkLogin: checkLogin,
        register: register,
        refreshToken: refreshToken
    };
});