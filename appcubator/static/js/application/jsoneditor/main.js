/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        },
        ace: {
            exports: 'ace'
        },
        "jquery": {
            exports: "$"
        },        
        "jquery-ui": {
            exports: "$",
            deps: ['jquery']
        }
    },
    paths: {
        "jquery": "../../libs/jquery/jquery",
        "jquery-ui": "../../libs/jquery-ui/jquery-ui",
        "backbone": "../../libs/backbone-amd/backbone",
        "underscore": "../../libs/underscore-amd/underscore",
        "bootstrap": "../../libs/bootstrap/bootstrap",
        // "ace": "../../libs/ace/ace",
        "ace": "https://d1n0x3qji82z53.cloudfront.net/src-min-noconflict/ace",
        "jsoneditor": "../../libs/jsoneditor/jsoneditor",
        'coffee-script': './libs/coffee-script',
        "util": "./util",
        "cs": './libs/cs',
        "jsonbrowser": './'
    }
});

require(['cs!jsonbrowser/csmain'], function() {
    
    json = appState;
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

    $('#save').on('click', function() {
        var str = JSON.stringify(appState);

        $.ajax({
            type: "POST",
            data: str,
            url: "/app/" + appId + "/state/force/",
            async: false,
            success: function(){
              console.log("Appmake file updated!");
            }
          })

    });
});
