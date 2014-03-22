define(function(require, exports, module) {

    'use strict';

    require('util');
    require('mixins/BackboneDropdownView');

    var WidgetSettingsView = require('editor/WidgetSettingsView');

    var template = [ 
        '<small class="url-name"><%= url %></small>',
        '<span class="pull-right">',
            '<%= options %>',
            '<div class="option-button settings blue"></div>',
            '<span class="cross">×<span>',
        '</span>'
    ].join('\n');


    var RouteView = Backbone.DropdownView.extend({

        tagName: 'li',
        className: 'route-name',

        events: {
            'click .url-name' : 'clickedRoute',
            'click .cross': 'removeRoute',
            'click .settings': 'clickedSettings'
        },

        initialize: function(model) {
            _.bindAll(this);
            this.model = model;

            this.listenTo(this.model, 'remove', this.close);
        },

        render: function() {
            var name = this.model.get('name');
            var url = this.model.getUrlString();

            var options = "(Custom Code)";

            if (this.model.generate == "routes.staticpage") {
                var options = '<select>'
                options += '<option>'+ this.model.get('name') +' template</option>';

                v1State.get('templates').each(function(templateModel) {
                    if(templateModel.get('name') == name) return;

                    options += '<option>'+ templateModel.get('name') +' template</option>';
                });

                options += '</select>';
            }

            this.$el.html(_.template(template, {options: options, url: url }));

            return this;
        },

        clickedRoute: function() {

            if (this.model.generate == "routes.staticpage") {
                var template = this.model.get('name');
                v1.currentApp.pageWithName(template);
            }

        },

        clickedSettings: function() {
            new WidgetSettingsView(this.model).render();
        },

        removeRoute: function(e) {
            e.preventDefault();
            v1State.get('routes').remove(this.model);

            return false;
        }

    });

    return RouteView;

});
