define(['https://api.filepicker.io/v1/filepicker.js'],
  function() {

    util.filepicker = {
      openFilePick: function(callback, success, appId) {
        filepicker.setKey("AAO81GwtTTec7D8nH9SaTz");
        filepicker.pickMultiple({
          mimetypes: ['image/*'],
          container: 'modal',
          services:['COMPUTER', 'GMAIL', 'DROPBOX', 'INSTAGRAM', 'IMAGE_SEARCH', 'URL', 'FACEBOOK']
        },
        function(FPFiles){
          for (var i = 0; i < FPFiles.length; i++) {
            var f = FPFiles[i];
            /* f has the following properties:
            url, filename, mimetype, size, isWriteable */
            $.post('/app/'+ appId +'/static/',{
              name: f.filename,
              url:  f.url,
              type: f.mimetype,
              error: function(d) {
                //alert("Something went wrong with the file upload! Data: "+f);
              }
            });
          }
          callback(FPFiles, success);
        },
        function(FPError){
          console.log(FPError.toString());
        }
        );
      },

      openThemeFilePick: function(callback, success, themeId) {
        filepicker.setKey("AAO81GwtTTec7D8nH9SaTz");
        filepicker.pickMultiple({
          mimetypes: ['image/*'],
          container: 'modal',
          services:['COMPUTER', 'GMAIL', 'DROPBOX', 'INSTAGRAM', 'IMAGE_SEARCH', 'URL', 'FACEBOOK']
        },
        function(FPFiles){
          for (var i = 0; i < FPFiles.length; i++) {
            var f = FPFiles[i];
            /* f has the following properties:
            url, filename, mimetype, size, isWriteable */
            $.post('/theme/'+ themeId +'/static/',{
              name: f.filename,
              url:  f.url,
              type: f.mimetype,
              error: function(d) {
                //alert("Something went wrong with the file upload! Data: "+f);
              }
            });
          }
          callback(FPFiles, success);
        },
        function(FPError){
          console.log(FPError.toString());
        }
        );
      }
    };

  });
