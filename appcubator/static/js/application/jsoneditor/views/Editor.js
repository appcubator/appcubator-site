/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'ace'
], function($, _, Backbone, ace) {
    'use strict';

    var strVar = "";
    strVar += "  <div class=\"panel panel-default\">";
    strVar += "    <div class=\"panel-heading\">";
    strVar += "      <h4 class=\"panel-title\">";
    strVar += "        <a data-toggle=\"collapse\" data-parent=\"#accordion\" href=\"#collapseOne\">";
    strVar += "          Editor";
    strVar += "        <\/a>";
    strVar += "";
    strVar += "        &nbsp";
    strVar += "";
    strVar += "        <div class=\"btn-group btn-group-sm\">";
    strVar += "          <button type=\"button\" id=\"text\" class=\"setSyntaxButton btn btn-default\">Text<\/button>";
    strVar += "          <button type=\"button\" id=\"html\" class=\"setSyntaxButton btn btn-default\">HTML<\/button>";
    strVar += "          <button type=\"button\" id=\"javascript\" class=\"setSyntaxButton btn btn-default\">JS<\/button>";
    strVar += "          <button type=\"button\" id=\"css\" class=\"setSyntaxButton btn btn-default\">CSS<\/button>";
    strVar += "        <\/div>";
    strVar += "";
    strVar += "        <button type=\"button\" id=\"css\" class=\"updateBrowserButton btn btn-default\">Save<\/button>";
    strVar += "";
    strVar += "        ";
    strVar += "      <\/h4>";
    strVar += "    <\/div>";
    strVar += "    <div id=\"collapseOne\" class=\"panel-collapse collapse in\">";
    strVar += "      <div class=\"panel-body\" id='editor'><\/div>";
    strVar += "    <\/div>";
    strVar += "  <\/div>";


    var EditorView = Backbone.View.extend({
        template: strVar,
        events: {
            'click .setSyntaxButton': 'setSyntax',
            'click .updateBrowserButton': 'updateBrowser'
        },
        render: function() {
            this.$el.html(_.template(this.template));
            var editor = ace.edit("editor");
            this.aceEditor = editor;
            editor.setTheme("ace/theme/monokai");
        },
        initialize: function() {
            this.render();
        },
        setCurrentText: function(string) {
            this.aceEditor.setValue(string);
        },
        setSyntax: function(event) {
            var modeStr = $(event.target).attr('id');
            this.aceEditor.getSession().setMode("ace/mode/" + modeStr);
        },
        updateBrowser: function() {
            this.model.updateBrowser(this.aceEditor.getValue());
        }
    });

    return EditorView;
});