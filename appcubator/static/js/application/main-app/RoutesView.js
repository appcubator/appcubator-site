define(function(require, exports, module) {

    'use strict';
    //
    // var NodeModelModel = require('models/NodeModelModel');
    // var NodeModelView = require('app/models/NodeModelView');

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

        clickedRoute: function(e) {
            var cid = String(e.currentTarget.id).replace('route-', '');
            var routeModel = this.collection.get(cid);
            console.log(routeModel);
            if (routeModel.generate == "routes.staticpage") {
                var template = routeModel.get('name');
                v1.currentApp.pageWithName(template);
            }
            // this.el.appendChild(tableView.render().el);
        },

        createRoute: function(val) {
            //force table names to be singular
            var name = util.singularize(val);

            var elem = new NodeModelModel({
                name: name,
                fields: []
            });

            v1State.get('models').push(elem);
            return elem;
        }

    });

return RoutesView;

});
