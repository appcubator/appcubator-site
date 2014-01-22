/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/Editor',
    'jsoneditor',
], function ($, _, Backbone, EditorView, jsoneditor) {
    'use strict';
    
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

    $(function() {
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

    $(function() {
        /* prevents submitting twice */
        $('form').on('submit', function(e) {
            $(e.target).on('submit', function(e) {
                e.preventDefault();
            });
        });
    });

    var AppModel = Backbone.Model.extend({
        defaults: {
        	  currentJSON: undefined,
            editorView: undefined,
            browserView: undefined,
            currentValueElement: undefined,
        },
        
        initialize: function (currentJSON){
            this.currentJSON = currentJSON;

            
            var appId = window.location.pathname.split( '/' )[2];
            var jsonString = $.ajax({
              type: "GET",
              url: "/app/" + appId + "/state/",
              async: false
            }).responseText;
            
            this.set('currentJSON', JSON.parse(jsonString));

            this.on('change:currentJSON', function (event){
                this.get('editorView').render();
                this.get('browserView').render();
            });
        },
        setEditorString: function(string, domElement){
            this.get('editorView').setCurrentText(string);
            this.set('currentValueElement', domElement);
            console.log(domElement);
        },
        updateBrowser: function(string){
            $(this.get('currentValueElement')).text(this.escapeJSONString(string));
            $(this.get('currentValueElement')).trigger('change');
        },
        escapeJSONString: function (text) {
          // TODO: replace with some smart regex (only when a new solution is faster!)
          var escaped = '';
          var i = 0, iMax = text.length;
          while (i < iMax) {
            var c = text.charAt(i);
            if (c == '\n') {
              escaped += '\\n';
            }
            else if (c == '\\') {
              escaped += c;
              i++;

              c = text.charAt(i);
              if ('"\\/bfnrtu'.indexOf(c) == -1) {
                escaped += '\\';  // no valid escape character
              }
              escaped += c;
            }
            else if (c == '"') {
              escaped += '\\"';
            }
            else {
              escaped += c;
            }
            i++;
          }
          return escaped;
        },
        saveJSON: function (){
          var str = JSON.stringify(this.get('browserView').returnJSONObject());
          var appId = window.location.pathname.split( '/' )[2];

          $.ajax({
            type: "POST",
            data: str,
            url: "/app/" + appId + "/state/force/",
            async: false,
            success: function(){
              console.log("Appmake file updated!");
            }
          })
        }              
    });

    return AppModel;
});
