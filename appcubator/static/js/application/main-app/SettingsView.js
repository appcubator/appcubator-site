define(function(require, exports, module) {

    'use strict';
    require('backbone');
    require('util');
    require('mixins/BackboneDropdownView');

    var SettingsView = Backbone.DropdownView.extend({
        title: 'Plugins',
        className: 'dropdown-view settings-view',
        subviews: [],

        events: {
            "keyup #scripts-content" : "scriptsChanged",
            "keyup #header-content"  : "headerChanged"
        },

        initialize: function() {
            _.bindAll(this);
            this.model = v1State;
        },

        render: function() {

            var template = [
                '<div class="" id="settings-page">',
                    '<h2 class="pheader">App Settings</h2>',
                    '<ul id="list-tables">',
                    '<li>',
                        '<h3>Header</h3>',
                        '<textarea id="header-content"><%= header_content %></textarea>',
                    '</li>',
                    '<li>',
                        '<h3>Scripts</h3>',
                        '<textarea id="scripts-content"><%= scripts_content %></textarea>',
                    '</li>',
                    '</ul>',
                '</div>'].join('\n');

            this.el.innerHTML = _.template(template, { header_content: this.model.get("header") || "",
                                                       scripts_content: this.model.get("scripts") || ""});
            return this;
        },

        scriptsChanged: function(e) {
            console.log(e.currentTarget.value);
            this.model.set("scripts", e.currentTarget.value);
        },

        headerChanged: function(e) {
            this.model.set("header", e.currentTarget.value);
        }

    });

    return SettingsView;
});