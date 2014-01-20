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
            

            var modalTemplate="";
            modalTemplate += "<div class=\"modal fade\">";
            modalTemplate += "  <div class=\"modal-dialog\">";
            modalTemplate += "    <div class=\"modal-content\">";
            modalTemplate += "      <div class=\"modal-header\">";
            modalTemplate += "        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;<\/button>";
            modalTemplate += "        <h4 class=\"modal-title lead\"> Import JSON<\/h4>";
            modalTemplate += "      <\/div>";
            modalTemplate += "      <div class=\"modal-body\">";
            modalTemplate += "        <p> Paste <code> appcubator-app.json <\/code> here <\/p>";
            modalTemplate += "        <textarea class=\"form-control loadJSONFromStringTextArea\" rows=\"10\"><\/textarea>";
            modalTemplate += "      <\/div>";
            modalTemplate += "      <div class=\"modal-footer\">";
            modalTemplate += "        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close<\/button>";
            modalTemplate += "        <button type=\"button\" class=\"btn btn-primary  loadJSONFromStringButton\">Import<\/button>";
            modalTemplate += "      <\/div>";
            modalTemplate += "    <\/div><!-- \/.modal-content -->";
            modalTemplate += "  <\/div><!-- \/.modal-dialog -->";
            modalTemplate += "<\/div><!-- \/.modal -->";

            var modalTemplate = _.tempate(modalTemplate, {});
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
            this.model.saveJSON();
        }

    });
    return AppView;
});