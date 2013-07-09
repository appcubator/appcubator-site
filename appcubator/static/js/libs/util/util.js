define(['jquery'], function() {

  var util = {
    onServerReady: function(url, callback, recursive) {
      // if this call is not recursive, it should wait 300 ms before trying for real.
        // bc sometimes it takes some time for the server to restart causing a 502.
      if(!recursive) {
        window.setTimeout(function(){util.onServerReady(url, callback, true); }, 300);
      } else {
        $.ajax(url, {
          type: 'GET',
          success: callback,
          error: function(){
            console.log("Server not ready. Waiting 100ms and trying again.");
            window.setTimeout(function(){util.onServerReady(url, callback, true); }, 250);
          }
        });
      }
    },

    log_to_server: function (key_str, val_dict, app_id) {
        _.each(val_dict, function(val, key) {
            util.assert((typeof key) == (typeof ''));
            util.assert((typeof val) == (typeof ''));
        });

        val_dict['__key'] = key_str;
        if (app_id)
            val_dict['__app_id'] = app_id;

        $.post('/log/anything/', val_dict);
    },

    assert : function(inp) {
      if(!inp) {
        alert('Important Error!');
      }
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

    unloadCSS: function(css) {
      var tag = document.getElementById('css-'+ css);
      tag.parentNode.removeChild(tag);
    },

    loadDirectory: function(directory, css) {
      var cssFile = document.createElement('link');
      cssFile.setAttribute('type', 'text/css');
      cssFile.setAttribute('href', directory);
      cssFile.setAttribute('rel', 'stylesheet');
      cssFile.id = 'css-' + css;
      document.getElementsByTagName('head')[0].appendChild(cssFile);
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
      if(!div.offset()) return false;

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
    },

    pluralize: function(str) {
      if(str && str.length > 0) {
        var lastChar = str.charAt(str.length - 1);
        return (lastChar == 's') ? str + 'es' : str + 's';
      }
    },

    scrollToElement: function($el) {
      var height = $el.offset().top - 90;
      $('html, body').animate({ scrollTop: height }, 'slow', 'swing');
    },

    isAlphaNumeric: function(str) {
      var patt=/^[a-z0-9\s]+$/i;
      return patt.test(str);
    },

    doesStartWithKeywords: function(str) {
      var ind1 = str.indexOf('Page');
      var ind2 = str.indexOf('Form');
      var ind3 = str.indexOf('loop');

      return (!ind1 || !ind2|| !ind3);
    },

    getDisplayType: function (fieldType) {
      switch(fieldType) {
        case "text":
        case "date":
        case "number":
        case "email":
          return "texts";
        case "image":
          return "images";
        case "file":
          return "links";
      }

      return null;
    },

    isInternalData: function(str) {
      if(str.indexOf("{{") === 0) return true;
      return false;
    },

    capitaliseFirstLetter: function(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
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

    window.util = util;

    if (typeof window.define === "function" && window.define.amd) {
      window.define("util", [], function() {
        return window.util;
      });
    }

  });
