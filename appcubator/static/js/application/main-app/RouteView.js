define(function(require, exports, module) {

    'use strict';

    require('util');
    require('mixins/BackboneDropdownView');

    var template = [ '<div class="arrow_box"></div>',
    '<div class="" id="entities-page">',
        '<h2 class="pheader">Routes</h2>',
        '<ul id="list-routes">',
        '</ul>',
    '</div>'].join('\n');

    var RouteView = Backbone.DropdownView.extend({

        tagName: 'li',
        className: 'route-name',

        events: {
            'click' : 'clickedRoute',
            'click .cross': 'removeRoute'
        },

        initialize: function(model) {
            _.bindAll(this);
            this.model = model;

            this.listenTo(this.model, 'remove', this.close);
        },

        render: function() {
            var name = this.model.get('name');
            var url = this.model.getUrlString();

            var template = "(Custom Code)";

            if (this.model.generate == "routes.staticpage") {
                var template = '<select>'
                template += '<option>'+ this.model.get('name') +' template</option>';

                v1State.get('templates').each(function(templateModel) {
                    if(templateModel.get('name') == name) return;

                    template += '<option>'+ templateModel.get('name') +' template</option>';
                });

                template += '</select>';
            }

            this.$el.html([
                '<small>' + url + '</small>',
                '<span class="pull-right">' + template + '<span class="cross">×<span></span>'
            ].join('\n'));

            return this;
        },

        clickedRoute: function() {

            if (this.model.generate == "routes.staticpage") {
                var template = this.model.get('name');
                v1.currentApp.pageWithName(template);
            }

        },

        removeRoute: function(e) {
            e.preventDefault();
            v1State.get('routes').remove(this.model);

            return false;
        }

    });

    return RouteView;

});
