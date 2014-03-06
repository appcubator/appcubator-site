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
            var name = routeModel.get('name');
            var url = routeModel.getUrlString();

            var template = "(Custom Code)";

            if (routeModel.generate == "routes.staticpage") {
                template  = routeModel.get('name') + " template";
            }

            this.$el.find('#list-routes').append([
            '<li class="route-name" id="route-' + routeModel.cid + '">',
                '<small>' + url + '</small>',
                '<span class="pull-right">' + template + '</span>',
            '</li>'].join('\n'));
        },

        removeRoute: function(routeModel) {
            this.$el.find('#route-' + routeModel.cid).remove();
        },

        clickedRoute: function(e) {
            var cid = String(e.currentTarget.id).replace('route-', '');
            var routeModel = this.collection.get(cid);

            if (routeModel.generate == "routes.staticpage") {
                var template = routeModel.get('name');
                v1.currentApp.pageWithName(template);
            }

            this.hide();
        },

        createRoute: function(val) {

            var route = new RouteModel({
                url: val.split('/'),
                name: null
            });

            this.collection.push(route);
            return elem;
        }

    });

    return RoutesView;

});
