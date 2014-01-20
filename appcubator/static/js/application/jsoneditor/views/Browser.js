/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'jsoneditor'
], function($, _, Backbone, jsonEditor) {
    
    'use strict';

    var strVar = "";
    strVar += "<% var htmlEncode = function(s){ return s.replace(\/&(?!\w+([;\s]|$))\/g, \"&amp;\").replace(\/<\/g, \"&lt;\").replace(\/>\/g, \"&gt;\"); }; %> ";
    strVar += "<% if (currentJSON !== undefined) { %> ";
    strVar += "";
    strVar += "<% var prefix = currentDir; %>";
    strVar += "<div class=\"panel-group\" id=\"<%=prefix%>Accordion\">";
    strVar += "";
    strVar += "<% for (prop in currentJSON) { %>";
    strVar += " ";
    strVar += " <div class=\"panel panel-default\">";
    strVar += "";
    strVar += "     <div class=\"panel-heading\" data-toggle=\"collapse\" data-parent=\"#appAccordion\" href=\"#collapse<%=prefix%>-<%=prop%>\">";
    strVar += "       <h4 class=\"panel-title\">";
    strVar += "         <%=prop%>  ";
    strVar += "       <\/h4>";
    strVar += "     <\/div>";
    strVar += "";
    strVar += "     <div id=\"collapse<%=prefix%>-<%=prop%>\" class=\"panel-collapse collapse in\">";
    strVar += "         <% var data = currentJSON[prop]; %>";
    strVar += "         <% if (data instanceof String) { %> ";
    strVar += "             <%= htmlEncode(data) %>";
    strVar += "         <% } %>";
    strVar += "         <% if (data instanceof Number) { %> ";
    strVar += "             <%= htmlEncode(data) %>";
    strVar += "         <% } %>";
    strVar += "         <% if (data instanceof Object) { %>";
    strVar += "             <table class='table'>";
    strVar += "                 <tbody> ";
    strVar += "                     <% for (subProp in data) { %>";
    strVar += "                     <tr>";
    strVar += "                         <td> <%=subProp%> <\/td>";
    strVar += "                         <% var subData = data[subProp]; %>";
    strVar += "                         <% if (subData instanceof Object) { %>";
    strVar += "                             <% var key = JSON.parse(currentDir).push(prop, subProp).toString() %>";
    strVar += "                             <td data-key='<%=key%>' data-expandview=\"true\"> <\/td>                                ";
    strVar += "                         <% } else { %>";
    strVar += "                             <td data-key='<%=key%>' > <%= htmlEncode(subData) %> <\/td>                             ";
    strVar += "                         <% } %>";
    strVar += "                     <\/tr>";
    strVar += "                     <% } %>";
    strVar += "                 <\/tbody>";
    strVar += "             <\/table>";
    strVar += "         <% } %>";
    strVar += "     <\/div>";
    strVar += "";
    strVar += " <\/div>";
    strVar += "";
    strVar += "<% } %>";
    strVar += "<\/div>";
    strVar += "";
    strVar += "<% } else { %>";
    strVar += "<% } %>";
    strVar += "";


    var BrowserView = Backbone.View.extend({
        template: strVar,
        events: {
            "click .value": "valueClicked"
        },
        render: function() {
            this.$el.html("");
            var json = this.model.get('currentJSON')
            var editor = new jsonEditor.JSONEditor(this.el);
            this.jsonEditor = editor;
            editor.set(json);
        },
        initialize: function() {
            this.render();
        },
        valueClicked: function(event) {
            var str = $(event.target).text();
            this.model.setEditorString(this.unescapeJSONString(str), event.target);
        },
        unescapeJSONString: function(string) {
            return string.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r").replace(/\\r/g, "\r").replace(/\\"/g, "\"");
        },
        returnJSONObject: function() {
            return this.jsonEditor.get();
        }

    });

    return BrowserView;
});