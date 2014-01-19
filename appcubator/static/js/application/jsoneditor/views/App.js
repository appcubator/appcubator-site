/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/Editor',
    'views/Browser',
    'bootstrap'
], function($, _, Backbone, EditorView, BrowserView) {
    'use strict';

    var AppView = Backbone.View.extend({
        template: [
            '<div class="navbar navbar-default navbar-static-top" role="navigation">',
            ' <div class="container-fluid">',
            '<div class="navbar-header">',
            '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">',
            '<span class="sr-only">Toggle navigation</span>',
            '<span class="icon-bar"></span>',
            '<span class="icon-bar"></span>',
            '<span class="icon-bar"></span>',
            '</button>',
            ' <a class="navbar-brand">Appcubator</a>',
            '</div>',
            '<div class="navbar-collapse collapse">',
            ' <ul class="nav navbar-nav">',

            '<li class="dropdown">',
            '<a href="#" class="dropdown-toggle" data-toggle="dropdown"> File <b class="caret"></b></a>',
            '<ul class="dropdown-menu">',
            '<li><a class="importJSONButton"> Import JSON </a></li>',
            '<li><a class="saveJSONButton"> Save </a></li>',
            '</ul>',
            '</li>',
            '</ul>',
            '</div>',
            '</div>',
            '</div>',
            '<div class="container-fluid">',
            ' <div class="row">',
            '<div class="col-md-6" id="editorPanel">',

            '</div>',
            ' <div class="col-md-6"> ',
            '<div class="panel panel-default">',
            '<div id="browserPanel" class="panel-body">',

            '</div>',
            '</div>',
            '</div>',
            ' </div>',
            '</div>'
        ].join('\n'),
        events: {
            "click .importJSONButton": "displayJSONImportModal",
            "click .loadJSONFromStringButton": 'loadJSONFromString',
            'hidden.bs.modal': 'hideModal',
            'click .value': 'valueSelected',
            'click .saveJSONButton': 'saveJSON'
        },
        initialize: function() {
            this.render();


            var editorView = new EditorView({
                model: this.model,
                el: this.$el.find('#editorPanel')
            });
            var browserView = new BrowserView({
                model: this.model,
                el: this.$el.find('#browserPanel')
            });

            this.model.set('editorView', editorView);
            this.model.set('browserView', browserView);
            browserView.on('click .value', function(event) {
                editorView.setEditorString(this.htmlDecode($(event.target).html()))
            });
        },
        render: function() {
            this.$el.html(_.template(this.template));
        },
        displayJSONImportModal: function() {
            var modalTemplate = JST['app/scripts/templates/JSONLoadModal.ejs']({});
            $(modalTemplate).modal();
        },
        loadJSONFromString: function(event) {
            var JSONString = $(this.$el.find('.loadJSONFromStringTextArea')[0]).val();
            try {
                var JSONobj = JSON.parse(JSONString);
                $(this.$el.find('.modal')).modal('hide');

            } catch (e) {
                alert('Invalid JSON. Try again =( ')
            }
            this.model.set('currentJSON', JSONobj);
        },
        hideModal: function() {
            $('.modal-backdrop').remove();
        },
        saveJSON: function() {
            this.model.get('browserView').returnJSONObject();
        }

    });
    return AppView;
});