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
        'coffee-script': './appcubator-jsonbrowser/libs/coffee-script',
        "util": "./appcubator-jsonbrowser/util",
        "cs": './appcubator-jsonbrowser/libs/cs',
        "jsonbrowser": './appcubator-jsonbrowser/'
    }
});

require({}, ['cs!jsonbrowser/csmain']);
