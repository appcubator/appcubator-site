define(['jquery-ui'], function() {

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

      //this.el.style.position = 'relative';
      //console.log('yolo');
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
      console.log(node);
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
    },

    loadCSS : function(css) {
        if(!document.getElementById('css-' + css)) {
          var cssFile = document.createElement('link');
          cssFile.setAttribute('type', 'text/css');
          cssFile.setAttribute('href', '/static/css/' + css + '.css');
          cssFile.setAttribute('rel', 'stylesheet');
          cssFile.id = 'css-' + css;
          document.getElementsByTagName('head')[0].appendChild(cssFile);
        }
    },

    isMouseOn: function(pageX, pageY, element) {
      var self = this;

      mouseX = pageX;
      mouseY = pageY;
      var div = $(element);
      divTop = div.offset().top;
      divLeft = div.offset().left;
      divRight = divLeft + div.width();
      divBottom = divTop + div.height();
      if(mouseX >= divLeft && mouseX <= divRight && mouseY >= divTop && mouseY <= divBottom) {
        return true;
      }
      return false;
    },

    isRectangleIntersectElement: function(a1x, a1y, a2x, a2y, elem) {
      var div = $(elem);
      var divTop = div.offset().top;
      var divLeft = div.offset().left;
      var divRight = divLeft + div.width();
      var divBottom = divTop + div.height();

      return this.isRectanglesIntersect(a1x, a1y, a2x, a2y, divLeft, divTop, divRight, divBottom);
    },

    isRectanglesIntersect: function(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {

      var minAx = ax1;
      var minAy = ay1;
      var maxAx = ax1;
      var maxAy = ay1;
      var minBx = bx1;
      var minBy = by1;
      var maxBx = bx1;
      var maxBy = by1;

      if(ax1 < ax2) { maxAx = ax2; }
      else { minAx = ax2; }
      if(ay1 < ay2) { maxAy = ay2; }
      else { minAy = ay2; }

      if(bx1 < bx2) { maxBx = bx2; }
      else { minAx = ax2; }
      if(by1 < by2) { maxBy = by2; }
      else { minBy = by2; }

      return this.rectanglesIntersect(minAx,  minAy, maxAx, maxAy, minBx, minBy, maxBx, maxBy);

    },

    rectanglesIntersect: function(minAx,  minAy, maxAx, maxAy, minBx, minBy, maxBx, maxBy) {
      var aLeftOfB = maxAx < minBx;
      var aRightOfB = minAx > maxBx;
      var aAboveB = minAy > maxBy;
      var aBelowB = maxAy < minBy;

      return !( aLeftOfB || aRightOfB || aAboveB || aBelowB );
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
        $(e.target).on('submit', function(e) {
          e.preventDefault();
        });
      });
    });

    document.addEventListener("touchstart", function(){}, true);

  window.iui = iui;

  if (typeof window.define === "function" && window.define.amd) {
    window.define("iui", [], function() {
      return window.iui;
    });
  }

});
