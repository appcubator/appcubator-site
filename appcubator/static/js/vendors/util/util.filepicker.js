define([
        'https://api.filepicker.io/v1/filepicker.js',
        'util'
    ],
    function() {

        util.filepicker = {
            openFilePick: function(callback, success, appId) {

                filepicker.setKey("AAO81GwtTTec7D8nH9SaTz");

                filepicker.pickMultiple({
                        mimetypes: ['image/*'],
                        container: 'modal',
                        services: ['COMPUTER', 'GMAIL', 'DROPBOX', 'INSTAGRAM', 'IMAGE_SEARCH', 'URL', 'FACEBOOK']
                    }, function(FPFiles) {

                        for (var i = 0; i < FPFiles.length; i++) {
                            var f = FPFiles[i];
                            /* f has the following properties:
              url, filename, mimetype, size, isWriteable */
                            $.post('/app/' + appId + '/static/', {
                                name: f.filename,
                                url: f.url,
                                type: f.mimetype,
                                error: function(d) {
                                    //alert("Something went wrong with the file upload! Data: "+f);
                                }
                            });
                        }

                        callback(FPFiles, success);
                    },
                    function(FPError) {
                        console.log(FPError.toString());
                    }
                );
            },

            openSinglePick: function(callback) {

                filepicker.setKey("AAO81GwtTTec7D8nH9SaTz");

                filepicker.pick({
                        mimetypes: ['image/*'],
                        container: 'modal',
                        services: ['COMPUTER', 'GMAIL', 'DROPBOX', 'INSTAGRAM', 'IMAGE_SEARCH', 'URL', 'FACEBOOK']
                    }, function(FPFiles) {
                        callback.call(this, FPFiles);
                    },
                    function(FPError) {
                        console.log(FPError.toString());
                    }
                );
            },

            openThemeFilePick: function(callback, success, themeId) {
                filepicker.setKey("AAO81GwtTTec7D8nH9SaTz");
                filepicker.pickMultiple({
                    mimetypes: ['image/*'],
                    container: 'modal',
                    services: ['COMPUTER', 'GMAIL', 'DROPBOX', 'INSTAGRAM', 'IMAGE_SEARCH', 'URL', 'FACEBOOK']
                }, function(FPFiles) {
                    var createNewStatic = function(f, isLastFile, cb) {
                        /* f has the following properties:
            url, filename, mimetype, size, isWriteable */
                        $.ajax({
                            type: 'POST',
                            url: '/theme/' + themeId + '/static/',
                            data: {
                                name: f.filename,
                                url: f.url,
                                type: f.mimetype,
                            },
                            error: function(d) {
                                alert("Something went wrong with the file upload! Data: " + d);
                            },
                            success: function(data) {
                                if (data.id) {
                                    f.id = data.id;
                                }
                                if (isLastFile) {
                                    cb();
                                }
                            }
                        });
                    };
                    var numFiles = FPFiles.length
                    for (var i = 0; i < numFiles; i++) {
                        createNewStatic(FPFiles[i], (i === numFiles - 1), function() {
                            callback(FPFiles, success);
                        });
                    }
                }, function(FPError) {
                    console.log(FPError.toString());
                });
            }
        };

    });
