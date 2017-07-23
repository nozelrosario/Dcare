angular.module('dCare.Services.CameraService', [])

.factory("CameraService", function ($q) {

    var isCameraServiceAvailable = function () {
        if ((typeof cordova !== "undefined") && navigator.camera) {   //NR:Re-think can use ionic.Platform.platform()
            return true;
        } else {
            app.log.error("Camera Support Unavailable. Application will not be able to take pictures");
            return false;
        }
    };

    var getCameraConfig = function () {
        return {
            // Some common settings are 20, 50, and 100
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: true,
            //targetWidth: '',
            //targetHeight: '',
            saveToPhotoAlbum: false,
            cameraDirection: Camera.Direction.FRONT,
            correctOrientation: true  //Corrects Android orientation quirks
        };
    };

    var captureImage = function (config) {
        var deferredCapture = $q.defer();
        var cameraOptions;
        if (isCameraServiceAvailable()) {
            cameraOptions = getCameraConfig();
            //NR: Set height/width if available in config
            if (config && config.height) cameraOptions.targetHeight = config.height;
            if (config && config.width) cameraOptions.targetWidth = config.width;
            //NR: Start Camera Capture
            navigator.camera.getPicture(function cameraSuccess(imageUri) {
                if (config.dataFormat === 'blob') {
                    if (blobUtil) {
                        blobUtil.imgSrcToBlob(imageUri).then(function (blob) {
                            deferredCapture.resolve(blob);
                        }).catch(function (err) {
                            app.log.error("Unable to convert image to BLOB: Error[" + err + "]");
                            deferredCapture.reject();
                        });
                    } else {
                        app.log.error("Unable to convert image to BLOB: Error[Blob-Util Library not available!!]");
                        deferredCapture.reject();
                    }                    
                } else {
                    deferredCapture.resolve(imageUri);
                }                
            }, function cameraError(error) {
                app.log.error("Unable to capture image: Error[" + error + "]");
                deferredCapture.reject();
            }, cameraOptions);
        } else {
            deferredCapture.reject();
        }
        return deferredCapture.promise;
    };

    var selectImage = function (config) {
        var deferredSelect = $q.defer();
        var cameraOptions;
        if (isCameraServiceAvailable()) {
            cameraOptions = getCameraConfig();
            //NR: Set source as PhotoLibrary
            cameraOptions.sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
            //NR: Set height/width if available in config
            if (config && config.height) cameraOptions.targetHeight = config.height;
            if (config && config.width) cameraOptions.targetWidth = config.width;
            //NR: Start Camera Capture
            navigator.camera.getPicture(function cameraSuccess(imageUri) {
                if (config.dataFormat === 'blob') {
                    if (blobUtil) {
                        blobUtil.imgSrcToBlob(imageUri).then(function (blob) {
                            deferredSelect.resolve(blob);
                        }).catch(function (err) {
                            app.log.error("Unable to convert image to BLOB: Error[" + err + "]");
                            deferredSelect.reject();
                        });
                    } else {
                        app.log.error("Unable to convert image to BLOB: Error[Blob-Util Library not available!!]");
                        deferredSelect.reject();
                    }
                } else {
                    deferredSelect.resolve(imageUri);
                }
            }, function cameraError(error) {
                app.log.error("Unable to select image: Error[" + error + "]");
                deferredSelect.reject();
            }, cameraOptions);
        } else {
            deferredSelect.reject();
        }
        return deferredSelect.promise;
    };

    //var notificationPermissionCheck = function () {
    //    var deferredCheck = $q.defer();
    //    cordova.plugins.notification.local.hasPermission(function (permissionExists) {
    //            deferredCheck.resolve(permissionExists);
    //    });
    //    return deferredCheck.promise;
    //};

    //var requestNotificationPermission = function () {
    //    var deferredCheck = $q.defer();
    //    cordova.plugins.notification.local.registerPermission(function (permissionGranted) {
    //        if (permissionGranted) {
    //            deferredCheck.resolve(true);
    //        } else {
    //            deferredCheck.reject(false);
    //        }
    //    });
    //    return deferredCheck.promise;
    //};

    return {
        /* Checks if native Camera Service available */
        isCameraServiceAvailable: isCameraServiceAvailable,        
        captureImage: captureImage,
        selectImage: selectImage
    };
});