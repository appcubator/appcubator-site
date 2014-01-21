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
        }
    },
    paths: {
        "jquery": "../../libs/jquery/jquery",
        "backbone": "../../libs/backbone-amd/backbone",
        "underscore": "../../libs/underscore-amd/underscore",
        "bootstrap": "../../libs/bootstrap/bootstrap",
        // "ace": "../../libs/ace/ace",
        "ace": "https://d1n0x3qji82z53.cloudfront.net/src-min-noconflict/ace",
        "jsoneditor": "../../libs/jsoneditor/jsoneditor"
    }
});

require([
    'jquery',
    'backbone',
    'models/App',
    'views/App',
    'views/Editor',
    'views/Browser'
], function ($, Backbone, AppModel, AppView, EditorView, BrowserView) {
    Backbone.history.start();

    var appModel = new AppModel(appState);
    var appView = new AppView({ model: appModel, el: $('body')});
});
