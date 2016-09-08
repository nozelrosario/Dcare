angular.module('dCare.Authentication', ['ionic',
                                        'dCare.Services.UserStore'])

.factory("AuthenticationService", function ($q, UserStore, $ionicLoading, $mdDialog) {
    var login = function (userID,password) {
        //NR: TODO: Call Rest api for login
        //NR: TODO:  if Login Success => merge the recieved User Data with existing User Data {wireup following code}
        var deferredLogin = $q.defer();
        var remoteUserData = {};
        UserStore.getUser().then(function (user) {
            var localUserData = user;
            localUserData.firstName = remoteUserData.firstName;
            localUserData.lastName = remoteUserData.lastName;
            localUserData.email = remoteUserData.email;
            localUserData.photo = remoteUserData.photo;
            localUserData.authToken = remoteUserData.authToken;
            localUserData.tokenExpiryDate = remoteUserData.tokenExpiryDate;
            localUserData.loginDatetime = remoteUserData.loginDatetime;
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
            if (user && user.authToken && castToLongDate(user.tokenExpiryDate) < Date.now()) {
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
        //NR: TODO: Call Rest api for adding new User
        //NR: TODO: Post API call, if HTTP call is success, resolve() immediately else reject(error) and prompt to try again. 
        //NR: NOTE: User Data will be added to Local store during Successfulll login process, and not here
        deferredRegisterUser.resolve();
        
        return deferredRegisterUser.promise;
    };

    return {
        login: login,
        logout: logout,
        checkLogin: checkLogin
    };
});