  var iui = {
    onServerReady: function(callback) {
      $.ajax('/ping/', {
        type: 'POST',
        success: callback,
        error: function(){
          console.log("Server not ready. Waiting 100ms and trying again.");
          window.setTimeout(function(){iui.onServerReady(callback)}, 100);
        }
      });
    },
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
    },
    assert : function(inp) {
      if(!inp) {
        console.trace();
        alert('Important Error!');
      }
    },

    resizableAndDraggable: function(el, self) {
      $(el).resizable({
        handles: "n, e, s, w, se",
        resize: self.resized,
        containment: "parent"
      });

      $(el).draggable({
        drag: self.moved,
        containment: "parent"
      });

      return el;
    },

    draggable: function(el) {
      $(el).draggable({
        grid: [ 30,30 ],
        drag: self.moved
      });
    },

     resizableVertical: function(el, self) {
      $(el).resizable({
        handles: "s",
        stop: self.resized,
        resize: self.resizing,
        containment: "parent"
      });

      return el;
    },

    resizable: function(el, self) {
      $(el).resizable({
        handles: "n, e, s, w, se",
        stop: self.resized,
        resize: self.resizing,
        containment: "parent"
      });

      return el;
    },

    setCursor: function(node,pos){
      var node = (typeof node == "string" ||
      node instanceof String) ? document.getElementById(node) : node;
          if(!node){
              return false;
          }else if(node.createTextRange){
              var textRange = node.createTextRange();
              textRange.collapse(true);
              textRange.moveEnd(pos);
              textRange.moveStart(pos);
              textRange.select();
              console.log('he');
              return true;
          }else if(node.setSelectionRange){
              node.setSelectionRange(pos,pos);
              return true;
          }
          return false;
    },

    get: function(id) {
      return document.getElementById(id);
    },

    getHTML: function(id) {
      if(!document.getElementById(id)) return null;

      return (document.getElementById(id).innerHTML)||null;
    },

    askBeforeLeave: function(message) {
      window.onbeforeunload = function(){
        return ('You have some unsaved changes.');
      };
    },

    dontAskBeforeLeave: function() {
      window.onbeforeunload = null;
    },

    startAjaxLoading: function() {
      if(!document.getElementById('ajax-loader')) {
        var div = document.createElement('div');
        div.id = 'ajax-loader';
        document.body.appendChild(div);
      }
    },

    stopAjaxLoading: function(txt) {
      if(document.getElementById('ajax-loader')) {
        var child = document.getElementById('ajax-loader');
        child.parentNode.removeChild(child);
      }

      if(txt) {
        var notifId = 'notif-' + Math.floor(Math.random()*11);
        var notifDiv = document.createElement('div');
        notifDiv.id = notifId;
        notifDiv.className = "fadeIn notification";
        notifDiv.innerHTML = txt;
        document.body.appendChild(notifDiv);

        setTimeout(function(){
          var elem = document.getElementById(notifId);
          $(elem).fadeOut(220, function() {
            $(this).remove();
          });
          //.parentNode.removeChild(elem);
        },800);
      }
    }
  };

  function csrfSafeMethod(method) {
      // these HTTP methods do not require CSRF protection
      return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    function getCookie(name) {
      var cookieValue = null;
      if (document.cookie && document.cookie != '') {

        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) == (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }

    $(function () {
      /* adds csrftoke to every ajax request we send */
      $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
          if (!csrfSafeMethod(settings.type)) {
            var token = getCookie('csrftoken');
            xhr.setRequestHeader("X-CSRFToken", token);
          }
        }
      });
    });

    $(function () {
      /* prevents submitting twice */
      $('form').on('submit', function(e) {
        if($(e.currentTarget).hasClass('no-ajax')) {
          return;
        }
        console.log("prevent");
        $(e.target).on('submit', function(e) {
          e.preventDefault();
        });
      });
    });

    document.addEventListener("touchstart", function(){}, true);