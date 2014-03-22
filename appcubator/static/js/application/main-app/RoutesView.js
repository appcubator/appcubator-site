define(function(require, exports, module) {

    'use strict';

    require('util');
    require('mixins/BackboneDropdownView');

    var RouteView = require('RouteView');

    var template = [ '<div class="arrow_box"></div>',
    '<div class="" id="entities-page">',
        '<h2 class="pheader">Routes</h2>',
        '<ul id="list-routes">',
        '</ul>',
    '</div>'].join('\n');

    var RoutesView = Backbone.DropdownView.extend({

        title: 'Tables',
        className: 'dropdown-view routes-view',
        events: {
            'click .route-name' : 'clickedRoute'
        },

        initialize: function() {
            _.bindAll(this);

            this.collection = v1State.get('routes');
            this.listenTo(this.collection, 'add', this.renderRoute);
            this.listenTo(this.collection, 'remove', this.removeRoute);

            this.title = "Routes";
        },

        render: function() {

            this.$el.html(_.template(template, {}));
            this.renderRoutes();
            // this.renderRelations();

            var addTableBtn = document.createElement('div');
            addTableBtn.id = 'add-entity';
            addTableBtn.innerHTML = '<span class="box-button">+ Create Route</span>';

            var createRouteBox = new Backbone.NameBox({}).setElement(addTableBtn).render();
            createRouteBox.on('submit', this.createRoute);

            this.$el.append(addTableBtn);
            return this;
        },

        renderRoutes: function() {
            this.collection.each(this.renderRoute);
        },

        renderRoute: function(routeModel) {
            var routeView = new RouteView(routeModel);
            this.$el.find('#list-routes').append(routeView.render().el);
        },

        removeRoute: function(routeModel) {
            this.$el.find('#route-' + routeModel.cid).remove();
        },

        createRoute: function(val) {

            var templateName = prompt("Would you like to create a template as well?", val);

            if (templateName != null) {
                v1State.get('templates').push({
                    name: templateName
                });
            }

            var name = templateName || null;
            var routeModel = this.collection.push({
                url: val.split('/'),
                name: name
            });

            routeModel.setGenerator("routes.staticpage");

        }

    });

    return RoutesView;

});
